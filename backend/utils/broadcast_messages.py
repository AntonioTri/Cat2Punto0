from flask_socketio import emit
from datetime import datetime


class BroadcastMessager : 

    # La classe è un singleton
    _instance = None

    # Definizione del singleton 
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(BroadcastMessager, cls).__new__(cls)
        return cls._instance


    def __init__(self) -> None:
        # Lista dei messaggi di un team, ogni messaggio ha il testo, il mittente e l'orario
        self.current_messages : dict[int, list[tuple[str, str, str]]] = {}
    

    def add_new_message(self, team_id : int = -1, emitter : str = "", message : str = ""):
        
        if team_id not in self.current_messages:
            self.current_messages[team_id] = []

        time = datetime.now().strftime("%H:%M:%S")
        self.current_messages[team_id].append((emitter, message, time))

        # Il messaggio viene broadcastato a tutto il team
        emit('new_message', {"emitter" : emitter, "message" : message, "time" : time}, broadcast=True, include_self=True, namespace='/socket.io')


    def send_all_team_messages(self, team_id : int = -1, socket: str = ""):

        # Viene inizializzata la lista se non esiste
        if team_id not in self.current_messages:
            self.current_messages[team_id] = []

        # Viene inviata la lista di messaggi presenti in cache alla socket richiedente
        for emitter, message, time in self.current_messages[team_id]:
            emit('new_message', {"emitter" : emitter, "message" : message, "time" : time}, to=socket, namespace='/socket.io')


    def clear_cache(self,  team_id : int = -1):
        if team_id in self.current_messages:
            self.current_messages[team_id] = []