from flask_socketio.namespace import Namespace
from flask_socketio import emit
from flask import request
from JWT.socket_auth_decorator import socket_require_role, socket_require_token
from entity.role import ROLE
from controller.controller_personal_functions import ControllerPersonalFunctions
from controller.controller_team_pool import ControllerTeamPool
from utils.info_logger import getFileLogger
from ProgressionGraph.cache import cached_teams_graphs
from utils.user_cache import connected_users, connected_users_status
from utils.perk_cache import team_perks, active_perks, current_energy_used, update_perk_cache, remove_team_perks, remove_team_energy_usage, remove_team_lockers
from utils.crypto_sys_cache import CryptingSystemManager
from utils.broadcast_messages import BroadcastMessager
from utils.detectives_evidence_cache import EvidenceCache
from utils.decripter_cripted_codes_cache import CriptedCodesCache
from utils.commanders_pending_requestes import PendingCacheManager
import threading

logger = getFileLogger(__name__)

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
        # Istanza del broadcaster di messaggi
        self.broadcast_messager : BroadcastMessager = BroadcastMessager()
        # Istanza della cache per le pending request dei comandanti
        self.pending_request : PendingCacheManager = PendingCacheManager()
        # Istanza della cache dei codici di decrittazione
        self.crypted_codes_cache : CriptedCodesCache = CriptedCodesCache()
        # Istanza della cache dei fascioli dei detective
        self.evidence_cache : EvidenceCache = EvidenceCache()

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
                
                # Viene inoltre ripulita la cache del team
                self.clear_cache(team_id=team_id)

                logger.info(f"✅ Rimozione della cache per il team {team_id} avvenuta con successo.")

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


    # Segnale che risponde all'invio delle attuali risorse attive
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_retrieve_proof(self, data):

        logger.info(f"📶  🔄  Tentativo di invio dati pendenti alla socket {request.sid}. Elaborazione ...")

        socket = data.get('socket', request.sid)
        team_id = int(data.get("team_id", -1))

        self.pending_request.retireve_current_pending_requests(team_id=team_id, socket=socket)
        
        logger.info(f"📶  ✅  Dati pendenti inviati alla socket {request.sid} con successo!")
    

    # Segnale che risponde all'invio del numero di token disponibili
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_retrieve_token_amount(self, data):

        logger.info(f"📶  🔄  Tentativo di invio numero token alla socket {request.sid}. Elaborazione ...")

        socket = data.get('socket', request.sid)
        team_id = int(data.get("team_id", -1))

        self.pending_request.retrieve_token_amount(team_id=team_id, socket=socket)
        
        logger.info(f"📶  ✅  Numero token inviati alla socket {request.sid} con successo!")



    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_approve_code(self, data):
        
        logger.info(f"📶  🔄  Richiesta approvazione codice ricevuta. Elaborazione ...")

        code = data.get("code", "")
        team_id = int(data.get("team_id", -1))

        # Estrazione delle sockets dei decrittatori dal database:
        sockets = ControllerTeamPool.get_group_sockets(team_id=team_id, role=ROLE.DECRITTATORE.value)
        # Approvazione nella cache
        self.pending_request.approve_code_delivery(team_id=team_id, code=code, decritter_sockets=sockets)

        # Estrazione delle sockets dei comandanti dal database:
        sockets = ControllerTeamPool.get_group_sockets(team_id=team_id, role=ROLE.COMANDANTE.value)
        # Decremento dei token globali utilizzabili
        self.pending_request.decrease_token_count(team_id=team_id, commanders_sockets=sockets)

        logger.info(f"📶  ✅  Codice {code} approvato correttamente per il team {team_id}.")
    
    
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_approve_evidence(self, data):

        logger.info(f"📶  🔄  Richiesta approvazione fascicolo ricevuta. Elaborazione ...")

        id_fascicolo = int(data.get("id_fascicolo", 0))
        team_id = int(data.get("team_id", -1))

        # Estrazione delle sockets dei decrittatori dal database:
        sockets = ControllerTeamPool.get_group_sockets(team_id=team_id, role=ROLE.DETECTIVE.value)
        # Approvazione nella cache
        self.pending_request.approve_evidence_delivery(team_id=team_id, id_fascicolo=id_fascicolo, detective_sockets=sockets)
        
        # Estrazione delle sockets dei comandanti dal database:
        sockets = ControllerTeamPool.get_group_sockets(team_id=team_id, role=ROLE.COMANDANTE.value)
        # Decremento dei token globali utilizzabili
        self.pending_request.decrease_token_count(team_id=team_id, commanders_sockets=sockets)

        logger.info(f"📶  ✅  Fascicolo {id_fascicolo} approvato correttamente per il team {team_id}.")
    
    
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_update_token_count(self, data):

        logger.info(f"📶  🔄  Richiesta aumento token globali ricevuta. Elaborazione ...")

         # Estrazione dei dati
        socket = data.get('socket', request.sid)
        team_id = int(data.get('team_id', -1))
        token_number = int(data.get('token_count', 0))

        # Estrazione delle sockets dei comandanti dal database:
        sockets = ControllerTeamPool.get_group_sockets(team_id=team_id, role=ROLE.COMANDANTE.value)
        sockets = [_socket for _socket in sockets if _socket != socket ]
        # Approvazione nella cache
        self.pending_request.update_token_count(team_id=team_id, token_count=token_number, commanders_sockets=sockets)

        logger.info(f"📶  ✅  Token aumentati globalmente a tutti i comandanti del team {team_id}.")


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

        logger.info(f"📶  🔄  Invio dati sistemi criptaggio alla socket {request.sid}")

        # Estrazione dei dati
        socket = data.get('socket', request.sid)
        team_id = data.get('team_id', -1)
        team_id = int(team_id)

        # Richiamo dei metodi cache per inviare i dati
        self.cryptingCache.send_team_systems(team_id=team_id, socket=socket)
        self.cryptingCache.send_current_system(team_id=team_id, socket=socket)

        logger.info(f"📶  ✅  Invio dati sistemi criptaggio alla socket {request.sid} avvenuto con succeso!")


    @socket_require_token()
    def on_broadcast_message(self, data):

        logger.info(f"📶  🔄  Nuovo broadcast message intercettato. Elaborazione ...")
        
        # Estrazione dei dati
        message = data.get('message', "")
        emitter = data.get('emitter', "")
        team_id = data.get('team_id', -1)
        team_id = int(team_id)

        # Memorizzazione in cache
        self.broadcast_messager.add_new_message(team_id=team_id, emitter=emitter, message=message)

        logger.info(f"📶  ✅  Invio del messaggio a tutti gli utenti avvenuto con successo!")


    @socket_require_token()
    def on_retrieve_broadcast_messages(self, data):

        logger.info(f"📶  🔄  Invio messaggi broadcast alla socket {request.sid}")

        # Estrazione dei dati
        socket = data.get('socket', request.sid)
        team_id = data.get('team_id', -1)
        team_id = int(team_id)

        # Richiamo dei metodi cache per inviare i dati
        self.broadcast_messager.send_all_team_messages(team_id=team_id, socket=socket)

        logger.info(f"📶  ✅  Invio messaggi broadcast alla socket {request.sid} avvenuto con succeso!")


    @socket_require_role(role=ROLE.DETECTIVE.value)
    def on_retrieve_evidences(self, data):

        logger.info(f"📶  🔄  Invio fascicoli alla socket {request.sid}")

        # Estrazione dei dati
        socket = data.get('socket', request.sid)
        team_id = data.get('team_id', -1)
        team_id = int(team_id)

        # Richiamo dei metodi cache per inviare i dati
        self.evidence_cache.retrieve_current_evidences(team_id=team_id, socket=socket)

        logger.info(f"📶  ✅  Invio fascicoli alla socket {request.sid} avvenuto con succeso!")


    @socket_require_role(role=ROLE.DECRITTATORE.value)
    def on_retrieve_codes(self, data):

        logger.info(f"📶  🔄  Invio codici decrittazione alla socket {request.sid}")

        # Estrazione dei dati
        socket = data.get('socket', request.sid)
        team_id = data.get('team_id', -1)
        team_id = int(team_id)

        # Richiamo dei metodi cache per inviare i dati
        self.crypted_codes_cache.retrieve_current_codes(team_id=team_id, socket=socket)

        logger.info(f"📶  ✅  Invio codici decrittazione alla socket {request.sid} avvenuto con succeso!")











    def clear_cache(self, team_id = -1):

        remove_team_perks(team_id=team_id)
        remove_team_energy_usage(team_id=team_id)
        remove_team_lockers(team_id=team_id)
        self.cryptingCache.clear_cache(team_id=team_id)
        self.broadcast_messager.clear_cache(team_id=team_id)
        self.pending_request.clear_cache(team_id=team_id)
        self.crypted_codes_cache.clear_cache(team_id=team_id)
        self.evidence_cache.clear_cache(team_id=team_id)