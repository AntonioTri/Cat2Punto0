from flask_socketio.namespace import Namespace
from flask_socketio import emit
from flask import request
from flask_jwt_extended import get_jwt
from JWT.socket_auth_decorator import socket_require_role
from entity.role import ROLE
from controller.controller_personal_functions import ControllerPersonalFunctions
from controller.controller_team_pool import ControllerTeamPool


# La classe socket definisce un namespace sul quale inviare specifici segnali
# Per ogni segnale viene definita una funzione ed il nome del sengale è esattamente
# il nome della funzione

class Socket(Namespace):

    # Questa funzione serve ad aggiungere alla pool di utenze il nuovo socked id
    def on_update_personal_socket(self, data):
        # Estraiamo l'id dagli args
        user_id = data["id"]
        if not user_id:
            return {"msg" : f"Errore, id non presente negli headers della richiesta. Headers: {data}"}        

        # Estrazione del sid
        socketID = request.sid
        # Richiamo al controller per updatare la socket
        return ControllerPersonalFunctions.update_personal_socket(user_id=user_id, socket_id=socketID)
        

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
    def on_require_permission_for_file(self, data):

        #Controllo sui campi
        if "team_id" not in data or "fascicolo_id" not in data:
            return {"msg" : "Il campo team_id è obbligatorio."}, 404
        
        #Estrazione dei dati
        team_id = data["team_id"]
        fascicolo_id = data["fascicolo_id"]
        emitter_socket = data["personal_socket"]

        #Estraiamo le socket dei destinatari
        commanders_sockets = ControllerTeamPool.get_all_team_group_socket(team_id=team_id, role="COMANDANTE")
        
        # Messaggio
        message_to_send = {
            "fascicolo_id" : fascicolo_id,
            "detective_socket" : emitter_socket, 
        }

        #Invio del messaggio
        for sid in commanders_sockets:
            emit('permission_required_for_file', message_to_send, to=sid)


