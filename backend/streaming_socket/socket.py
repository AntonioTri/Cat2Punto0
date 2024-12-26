from flask_socketio.namespace import Namespace
from flask_socketio import emit
from JWT.socket_auth_decorator import socket_require_role
from entity.role import ROLE


# La classe socket definisce un namespace sul quale inviare specifici segnali
# Per ogni segnale viene definita una funzione ed il nome del sengale è esattamente
# il nome della funzione

class Socket(Namespace):

    # Questa funzione serve ad aggiungere alla pool di utenze il nuovo socked id
    def on_connect(self):
        #TODO: Aggiungere un modo per salvare a db il nuovo sid da request.sid
        print('un nuovo utente si è connesso')

    # Questo metodo permette ai comandanti di inviare un messaggio a tutti gli utenti del team
    @socket_require_role(role=ROLE.COMANDANTE.value)
    def on_send_message(self, data):
        
        # Controllo dei campi
        if "message" not in data or "group" not in data:
            return {"mgs": f"Uno dei campi tra dati e users non erano presenti. Dati inviati: {data}"}
        
        # Estrazione dei dati
        message = data.get("message")
        users = data.get("group")

        # trasformazione in array della variabile users se non lo è
        if not isinstance(users, list):
            users = [users]

        # Estraiamo le socket degli utenti destinatari dall'attuale team di appartenenza
        #users_socket = get_socket_from_group(users)


