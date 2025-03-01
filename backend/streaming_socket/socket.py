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


    # Questo metodo si occupa di gestire la disconnessione degli utenti
    # salvando definitivamente lo stato del grafo nella memoria permanente
    def on_disconnect(self, *args, **kwargs):
        logger.info(f"Disconnect args: {args}\nDisconnect kwargs: {kwargs}")
        manage_disconnect = threading.Timer(5.0, self.manage_disconnect)
        logger.info(f"⏳ Attivo un timer prima di eseguire operazioni di controllo sulla disconnect ...")
        manage_disconnect.start()


    def manage_disconnect(self):

        # Estraiamo la socket disconnessa
        socket = request.sid
        # Estraiamo il team id dalla socket
        team_id, status_code = ControllerPersonalFunctions.get_user_team_id_by_socket_id(socket_id=socket)
        # Eliminiamo dalla cache di utenti connessi l'utente      
        
        

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


    def on_get_save_data(self, data):
        """Metodo che serve a intercettare la richiesta di un client ed assecondare la sua richiesta di ricevere i dati"""
        personal_id : int = int(data["personal_id"])
        team_id : int = int(data["team_id"])
        socket : str = data["socket"]

        team_graph = cached_teams_graphs[team_id]
        team_graph.bfs_visit_discovered_and_resolved(socket_to_signal=socket)


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