from flask_socketio.namespace import Namespace
from flask_socketio import emit
from flask import request
from flask_jwt_extended import get_jwt
from JWT.socket_auth_decorator import socket_require_role
from entity.role import ROLE
from controller.controller_personal_functions import ControllerPersonalFunctions
from controller.controller_team_pool import ControllerTeamPool
from utils.info_logger import getFileLogger
from ProgressionGraph.cache import cached_teams_graphs

logger = getFileLogger(__name__)
logger.info('[-] Sono il logger dentro la socket, funziono!')

# La cache degli utenti connessi
connected_users : dict[str, list[str]] = {} 

# La classe socket definisce un namespace sul quale inviare specifici segnali
# Per ogni segnale viene definita una funzione ed il nome del sengale è esattamente
# il nome della funzione

class Socket(Namespace):
    
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

        team_id, status_code = ControllerPersonalFunctions.get_team_id_from_user_id(user_id=personal_id)
        
        if status_code == 200:
            team_id = str(team_id)
            # Inizializza la lista se la chiave non esiste
            if team_id not in connected_users:
                connected_users[team_id] = []
            connected_users[team_id].append(socket)

            # Qui avviene una cosa importante, alla update socket e' associato un evento di connessione
            # stabile con l'utente, coincidente a qando le risorse della pagina sono state caricate
            # possiamo qui definire l'invio delle informazioni ed eventi gia' sbloccate del team
            # tramite il progression graph eseguendone la BFS esplorante i nodi ed archi scoperti e
            # rislti. I riddle associati ai nodi inviano da soli i segnali di sblocco delle informazioni
            # e gestiscono tutte le situazioni associate
            team_graph = cached_teams_graphs.get(team_id)
            if team_graph:
                logger.info("✅ Eseguo una visita del grafo associato al team ...")
                team_graph.bfs_visit_discovered_and_resolved(team_to_signal=int(team_id))
            logger.info("❌ Non ho eseguito la visita del grafo associato al team")
        else:
            emit('error', {"msg": "Some error occurred on retrieving saved progresses."}, to=socket)

    # Questo metodo si occupa di gestire la disconnessione degli utenti
    # salvando definitivamente lo stato del grafo nella memoria permanente
    def on_disconnect(self, *args, **kwargs):
        # Estraiamo la socket disconnessa
        socket = request.sid
        # Estraiamo il team id dalla socket
        team_id, status_code = ControllerPersonalFunctions.get_user_team_id_by_socket_id(socket_id=socket)
        # Eliminiamo dalla cache di utenti connessi l'utente      
        
        # Assicurati che team_id sia un valore hashable
        if isinstance(team_id, dict):
            team_id = team_id.get("team_id")
        team_id = str(team_id)

        if status_code != 200:
            emit('error', {"msg": f"Some error occurred on disconnecting from the socket. Error: {team_id}"}, to=socket)

        if team_id in connected_users:
            connected_users[team_id].remove(socket)
            # E controlliamo se ci sono ancora utenti attivi per quel team
            if len(connected_users[team_id]) <= 0:
                # In tal caso eliminiamo dalla cache dei progression graph il grafo salvato
                # NON prima di averne salvato lo stato
                file_name = "team_" + team_id + "_graph"
                team_graph = cached_teams_graphs.get(team_id)
                if team_graph:
                    team_graph.save_to_file(filename=file_name)
                    cached_teams_graphs.pop(team_id)

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
        
        logger.info(f"[-] Permessi da concedere: {data}")
        logger.info('[?] Provo ad inviare i permessi ...')

        message_to_send = {
            "element_id" : data["element_id"],
            "permission" : data["permission"]
        }
        emit('evidence_permission_gained', message_to_send, to=data["client_socket"])
        
        logger.info('[+] Permessi inviati con successo!')