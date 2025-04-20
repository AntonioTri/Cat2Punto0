from flask_socketio import emit

class CriptedCodesCache :

     # La classe è un singleton
    _instance = None

    # Definizione del singleton 
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(CriptedCodesCache, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "current_codes"):
            # Cache dei codici dei decrittatori, molti sono falsi altri veri
            # Ogni entry ha una descrizione ed un codice associato
            self.current_codes: dict[int, list[tuple[str, str]]] = {}

    
    def add_code(self, team_id : int = -1, decritter_sockets : list[str] = [], code : str = "", description : str = ""):
        """Metodo che aggiunge ed invia un nuovo codice ai detrittatori"""

        if team_id not in self.current_codes:
            self.current_codes[team_id] = []
        
        self.current_codes[team_id].append((code, description))

        # Viene inviata ad ogni socket decrittatore
        for socket in decritter_sockets:
            emit('add_new_code', {"code" : code, "description" : description}, to=socket, namespace='/socket.io')

    
    def retrieve_current_codes(self, team_id : int = -1, socket : str = ""):
        """Metodo che al richiamo invia tutti i codice attualmente presenti in cache alla socket richiedente."""
        
        if team_id not in self.current_codes:
            self.current_codes[team_id] = []
        
        for code, description in self.current_codes[team_id]:
            emit('add_new_code', {"code" : code, "description" : description}, to=socket, namespace='/socket.io')


    def clear_cache(self, team_id : int = -1):
        """Metodo che pulisce la cache del team selezionato."""
        if team_id in self.current_codes:
            self.current_codes[team_id] = []

