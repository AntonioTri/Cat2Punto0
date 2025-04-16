from flask_socketio.namespace import Namespace
from flask_socketio import emit
from flask import request
from flask_jwt_extended import jwt_required
from JWT.socket_auth_decorator import socket_require_role, socket_require_token
from entity.role import ROLE
from controller.controller_personal_functions import ControllerPersonalFunctions
from controller.controller_team_pool import ControllerTeamPool
from utils.info_logger import getFileLogger
from ProgressionGraph.cache import cached_teams_graphs
from utils.user_cache import connected_users, connected_users_status
from utils.perk_cache import team_perks, active_perks, current_energy_used, update_perk_cache, remove_team_perks, remove_team_energy_usage, remove_team_lockers
from utils.crypto_sys_cache import CryptingSystemManager
import threading

logger = getFileLogger(__name__)
logger.info('[-] Sono il logger dentro la socket, funziono!')




# La classe socket definisce un namespace sul quale inviare specifici segnali
# Per ogni segnale viene definita una funzione ed il nome del sengale è esattamente
# il nome della funzione
class Socket(Namespace):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Insieme per tenere traccia degli utenti che ricaricano la pagina
        self.reloading_teams = set()
        # Istanza della cache dei sistemi di criptaggio
        self.cryptingCache : CryptingSystemManager = CryptingSystemManager()

    # Questo metodo registra la socket id univoca per l'utente quando questo effettua il login
    def on_update_socket(self, data):
        
        logger.info(f"- Eseguo una update della socket: socket_id={request.sid}")
        # Usiamo direttamente il valore inviato per associare all'id, la socket id
        personal_id = data["personal_id"]
        socket = data["socket_id"]
        result = ControllerPersonalFunctions.update_personal_socket(user_id=personal_id, socket_id=socket)
        
        # Invio della risposta al client chiamante
        logger.info(f"✅ Socket aggiornata: socket_id={socket}")
        emit('socket_updated', result, room=socket)
        
        # Aggiornamento dello status utente su Attivo.
        # La disconnect sottostante capirà che l'utente si è riconnesso e che non dovrà apportare modifiche
        connected_users_status[int(personal_id)] = True


    # Questo metodo si occupa di gestire la disconnessione degli utenti
    # salvando definitivamente lo stato del grafo nella memoria permanente
    def on_disconnect(self, *args, **kwargs):
        # Estraiamo la socket disconnessa
        socket = request.sid
        # Estraiamo il team id dalla socket
        team_id, status_code_tid = ControllerPersonalFunctions.get_user_team_id_by_socket_id(socket_id=socket)
        # Estraiamo l'id personale tramite la socket
        personal_id, status_code_pid = ControllerPersonalFunctions.get_user_id_from_socket(socket_id=socket)
        
        # Gestione degli errori
        if status_code_tid != 200 or status_code_pid != 200:
            logger.info(f"❌ Errore per la ricerca dei dati relativi all'utente da disconnettere. Errori: \n1 - {team_id}.\n2-{personal_id}")
            return
        
        # Casting forzato per la conversione dei dati
        else:
            personal_id = int(personal_id)
            team_id = int(team_id)

        
        # Settiamo nella mappa degli utenti connessi la flag a false ed inizializziamo un timer
        connected_users_status[personal_id] = False
        
        # Inizializziamo ora un timer di 10 secondi per controllare che l'utente si sia riconnesso
        # In caso negativo eliminiamo dalla cache l'utente. L'istanza del grafo viene eliminata anch'essa
        # se era l'ultimo utente connesso
        logger.info(f"🛑 Disconnessione dalla socket: {socket}. Id Disconnesso: {personal_id}. Team di appartenenza: {team_id}")
        logger.info(f"⏳Inizializzo un timer per controllare l'effettiva disconnessione ...")
        timer = threading.Timer(10.0, self.handle_disconnect, args=(personal_id, team_id))
        timer.start()




    def handle_disconnect(self, personal_id : int = None, team_id : int = None):
        """
            Metodo che dopo 10 seocnid dalla chiamata controlla se l'utente sia ancora disconnesso.\n
            In tal caso l'istanza del grafo viene salvata e l'utente viene eliminato dall cache.
        
        """ 

        # Check degli errori
        if personal_id is None or team_id is None:
            logger.info(f"📛 Dei dati non sono arrivati! Dati: team id = {team_id}, personal id = {personal_id}")
            return

        logger.info(f"⏳ Handling della disconnessione ...")

        # Se l'utente e' ancora disconnesso allora non si tratta di ricarica della pagina
        # pertanto eliminiamo dalla cache l'utente da quelli connessi al team
        if not connected_users_status[personal_id]:
            connected_users[team_id].remove(personal_id)
            logger.info(f"✅ L'utente si è disconnesso totalmente, rimozione dalla cache degli utenti attivi avvenuta.")
        
            # Se l'utente era l'ultimo del suo team allora l'istanza del grafo viene salvata in memoria e la cache liberata
            if len(connected_users[team_id]) <= 0:
                team_graph = cached_teams_graphs[team_id]
                save_file : str = "team_" + str(team_id) + "_graph"
                team_graph.save_to_file(filename=save_file)
                cached_teams_graphs[team_id] = None
                logger.info(f"✅ L'utente era l'ultimo attivo del team, salvataggio dei dati avvenuto con successo.")
                
                # Viene inoltre rimossa dalla cache la lista di perk associata al team, il costo ed i locker
                remove_team_perks(team_id=team_id)
                remove_team_energy_usage(team_id=team_id)
                remove_team_lockers(team_id=team_id)
                self.cryptingCache.clear_cache()
                logger.info(f"✅ Rimozione dei perk, costi e lockers attivi avvenuta con successo.")

        # Nel caso opposto l'utente aveva solo ricaricato la pagina, nulla accade
        else:
            logger.info(f"✅ L'utente si è riconnesso. Cache invariata.")
        

           
        
        

    def save_graph_and_clean_cache(self, team_id, file_name):
        """
        Funzione che salva il grafo e rimuove l'istanza dalla cache.
        """
        team_graph = cached_teams_graphs.get(team_id)
        if team_graph:
            team_graph.save_to_file(filename=file_name)
            cached_teams_graphs.pop(team_id)
            logger.info(f"✅ Ho eseguito il salvataggio grafo per il team {team_id}. Istanza rimossa dalla cache.")
        else:
            logger.info(f"❌ Errore. Non ci sono istanze di grafi per il team {team_id}. Grafi cashati: {cached_teams_graphs}")


    # def on_get_save_data(self, data):
    #     """Metodo che serve a intercettare la richiesta di un client ed assecondare la sua richiesta di ricevere i dati"""
    #     personal_id : int = int(data["personal_id"])
    #     team_id : int = int(data["team_id"])
    #     socket : str = data["socket"]

    #     logger.info(f"🔄 Provo ad inviare i dati del grafo a {personal_id}.")
    #     team_graph = cached_teams_graphs[team_id]
    #     team_graph.bfs_visit_discovered_and_resolved(socket_to_signal=socket)
    #     logger.info(f"✅ Dati del grafo inviati a utente {personal_id} con successo.")


    # Questo metodo permette ai comandanti di inviare un messaggio a tutti gli utenti del team
    @socket_require_role(ROLE.COMANDANTE.value)
    def on_commander_message(self, data):
        
        # Controllo dei campi
        if "message" not in data or "id" not in data:
            return {"mgs": f"Uno dei campi tra dati e users non erano presenti. Dati inviati: {data}"}
        
        # Estrazione dei dati
        message = data.get("message")
        personal_id = data.get("id")

        # Estraiamo le socket degli utenti destinatari dall'attuale team di appartenenza
        team_sockets = ControllerPersonalFunctions.get_team_members_socket_ids(user_id=personal_id)
        
        # Se vi sono stati errori vengono ritornati
        if not team_sockets or not isinstance(team_sockets, list):
            return {"msg": "Errore nella ricerca delle socket degli utenti del team", "details": team_sockets}, 500
        
        # Creazione del messaggio
        message_to_send = {
            "message"       : message,
            "commander_id"  : personal_id
        }

        # Invio del messaggio a ciascun socket
        for sid in team_sockets:
            emit('commander_message_sent', message_to_send, to=sid)

    @socket_require_role(ROLE.DETECTIVE.value)
    def on_evidence_permission_required(self, data):

        #Controllo sui campi
        if "team_id" not in data or "id_fascicolo" not in data or "detective_name" not in data or "detective_socket" not in data:
            logger.info(f"[!] Segnale evidence_permission_required. Errore, mancano dei dati. Dati inviati: {data}")
            emit('error', {"msg": "Some fields are missing.", "received_data": data}, to=data["detective_socket"])

        else: 

            logger.info('[?] Provo ad inviare dei dati ...')
            #Estrazione dei dati
            team_id = data["team_id"]
            id_fascicolo = data["id_fascicolo"]
            detective_socket = data["detective_socket"]
            detective_name = data["detective_name"]

            #Estraiamo le socket dei destinatari
            commanders_sockets, status_code = ControllerTeamPool.get_all_team_group_socket(team_id=team_id, role="COMANDANTE")

            if status_code == 200:

                # Messaggio
                message_to_send = {
                    "id_fascicolo" : id_fascicolo,
                    "detective_socket" : detective_socket, 
                    "detective_name" : detective_name
                }

                # Invio del messaggio
                for commander in commanders_sockets:
                    logger.info(f"current commander to signal: {commander}")
                    sid = commander["socket"]
                    emit('permission_required_for_file', message_to_send, to=sid)

                logger.info('[+] Dati inviati!')

            # Vengono gestiti gli errori nel caso il database non trovi i dati
            else:
                logger.info(f'[!] Errore durante l\'estrazione dei dati dal database. Errore: {commanders_sockets}')
                emit('error', {"msg" : "Errore durante l'estrazione dei datti dal database!", "error" : commanders_sockets}, to=data["detective_socket"]) 


    # Metodo che serve a dare i permessi ad un detective per accedere ad uno specifico fascicolo
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_give_evidence_permission(self, data):

        logger.info(f"Give-Evidence-Permission: Tipo team_id: {type(data.get('team_id'))} - Valore: {data.get('team_id')}")

        
        logger.info(f"[-] Permessi da concedere: {data}")
        logger.info('[?] Provo ad inviare i permessi ...')

        message_to_send = {
            "element_id" : data["element_id"],
            "permission" : data["permission"]
        }
        emit('evidence_permission_gained', message_to_send, to=data["client_socket"])
        
        logger.info('[+] Permessi inviati con successo!')

    # Metodo che serve a far arrivare il cambiamento di un perk di un comandante
    # agli altri comandanti
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_perk_updated(self, data):
        
        logger.info(f"[-] Perk modificato. Dati: {data}")
        logger.info('🔄 Provo ad estrarre le socket degli altri comandanti')

        # Estrazione dei dati degli altri comandanti sulla base del team id
        members, status_code = ControllerTeamPool.get_all_team_group_socket(team_id=int(data["team_id"]), role="COMANDANTE")

        # Controllo del risultato
        if status_code == 200:
            # Per ogni membro trovato inviamo un messaggio tramite socket
            message_to_send = {
                "totalCost"     :   data["totalCost"],
                "anchorIndex"   :   data["anchorIndex"],
                "perkIndex"     :   data["perkIndex"],
                "maxCost"       :   data["maxCost"]
            }

            # inviamo il messaggio ad ogni membro comandante del team
            current_sid = request.sid

            for member in members:
                socket_id = member.get("socket")
                if socket_id and socket_id != current_sid:
                    emit('perk_got_updated', message_to_send, to=socket_id)


            logger.info('✅ Aggiornamenti inviati con successo!')

            # Viene anche aggiornata la cache dei perk attivi e la cache per l'attuale costo usato
            update_perk_cache(team_id=int(data["team_id"]), data=data)
            current_energy_used[int(data["team_id"])] = data["totalCost"]
            logger.info("✅ Aggiornamento dei perk attivi avvenuto con successo.")
        
        
        elif status_code == 404:
            logger.info(f"[!] Qualche errore è avvenuto durante la ricerca delle socket per l'id {data["team_id"]}.\nErrore: {members}")
    


    # Segnale che risponde all'invio delle attuali risorse attive
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_retrieve_perks(self, data):

        team_id = data.get('team_id', -1)
        socket = data.get('socket', request.sid)

        if isinstance(team_id, str):
            team_id = int(team_id)

        # Inviamo gli attuali perk presenti
        for perk_cost, perk_name in team_perks[team_id]:
            emit('add_new_perk', {"perkName" : perk_name, "perkCost" : perk_cost}, to=socket)

        # Inviamo il loro attuale stato
        if team_id in active_perks and team_id in current_energy_used:
            emit('perk_got_updated', { "perks" : active_perks[team_id], "totalCost" : int(current_energy_used.get(team_id, 0))}, to=socket)
        else:
            emit('perk_got_updated', { "perks" : [], "totalCost" : 0}, to=socket)
        
        logger.info(f"📶  ✅  Retrieve-Perks avvenuto da {socket}con successo")


    # Segnale che aggiorna l'attuale sistema di criptaggio
    @socket_require_role(role=ROLE.DECRITTATORE.value)
    def on_crypting_sys_changed(self, data):

        logger.info(f"📶  🔄  Sistema di criptaggio cambiato, aggiorno ...")

        # Estrazione dei dati
        team_id = data.get('team_id', -1)
        system_name = data.get('systemName', None)
        password = data.get('password', None)
        
        if isinstance(team_id, str):
            team_id = int(team_id)

        # Aggiornamento della cache e segnalazione
        self.cryptingCache.activate_crypting_system(team_id=team_id, name=system_name, password=password)



    # Segnaleche alla ricezione invia i dati presenti nella cache alla socket chiamante
    @socket_require_token()
    def on_retrieve_cryptography_status(self, data):

        logger.info(f"Retrieve - Crypt :Tipo team_id: {type(data.get('team_id'))} - Valore: {data.get('team_id')}")

        logger.info(f"📶  🔄  Invio dati sistemi criptaggio alla socket {request.sid}")

        # Estrazione dei dati
        socket = data.get('socket', request.sid)
        team_id = data.get('team_id', -1)
        team_id = int(team_id)

        # Richiamo dei metodi cache per inviare i dati
        self.cryptingCache.send_team_systems(team_id=team_id, socket=socket)
        self.cryptingCache.send_current_system(team_id=team_id, socket=socket)

        logger.info(f"📶  ✅  Invio dati sistemi criptaggio alla socket {request.sid} avvenuto con succeso!")


