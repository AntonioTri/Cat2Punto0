from flask_socketio import emit

class HistoricalEventsCache:

    # Implementazione del Singleton
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(HistoricalEventsCache, cls).__new__(cls)
        return cls._instance


    def __init__(self):
        if not hasattr(self, "historical_events"):
            # Cache eventi storici divisi per team
            # Ogni entry è una lista di tuple (titolo, descrizione)
            self.historical_events: dict[int, list[tuple[str, str]]] = {}


    def add_event(self, team_id: int = -1, detectives_sockets: list[str] = [], titolo: str = "", descrizione: str = ""):
        """Aggiunge un nuovo evento storico alla cache e lo invia alle socket del team."""
        if team_id not in self.historical_events:
            self.historical_events[team_id] = []

        self.historical_events[team_id].append((titolo, descrizione))

        # Invio dell'evento a tutte le socket
        for socket in detectives_sockets:
            if socket is not None:
                emit('add_new_storic_event', { "titolo": titolo, "descrizione": descrizione }, to=socket, namespace='/socket.io')


    def retrieve_current_events(self, team_id: int = -1, socket: str = ""):
        """Invia tutti gli eventi storici attualmente presenti alla socket specificata."""
        if team_id not in self.historical_events:
            self.historical_events[team_id] = []

        for titolo, descrizione in self.historical_events[team_id]:
            emit('add_new_storic_event', { "titolo": titolo, "descrizione": descrizione }, to=socket, namespace='/socket.io')


    def clear_cache(self, team_id: int = -1):
        """Pulisce tutti gli eventi storici per il team specificato."""
        if team_id in self.historical_events:
            self.historical_events[team_id] = []
