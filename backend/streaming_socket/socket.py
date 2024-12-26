from flask_socketio.namespace import Namespace
from flask_socketio import emit
from JWT.socket_auth_decorator import socket_require_role
from entity.role import ROLE
from controller.controller_personal_functions import ControllerPersonalFunctions


# La classe socket definisce un namespace sul quale inviare specifici segnali
# Per ogni segnale viene definita una funzione ed il nome del sengale è esattamente
# il nome della funzione

class Socket(Namespace):

    # Questa funzione serve ad aggiungere alla pool di utenze il nuovo socked id
    def on_connect(self, data):
        # Estraiamo l'id dalla socket
        if "id" not in data:
            return {"mgs": f"id non presente nel corpo della richiesta. Dati inviati: {data}"}
        # Richiamo al controller per updatare la socket
        return ControllerPersonalFunctions.update_personal_socket(data.get("id"))
        

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
        if isinstance(team_sockets, dict):
            return team_sockets, 500
        
        # Creazione del messaggio
        message_to_send = {
            "message"       : message,
            "commander_id"  : personal_id
        }

        # Emit del messaggio
        emit('commander_message_sent', message_to_send, room=team_sockets)


