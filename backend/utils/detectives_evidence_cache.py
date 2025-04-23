from flask_socketio import emit

class EvidenceCache:


    # La classe è un singleton
    _instance = None

    # Definizione del singleton 
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(EvidenceCache, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "current_codes"):
            # Cache dei codici dei decrittatori, molti sono falsi altri veri
            # Ogni entry ha una descrizione ed un codice associato
            self.current_evidences: dict[int, list[tuple[str, str, int, bool]]] = {}


    def add_evidence(self, team_id = -1, detective_sockets : list[str] = [], titolo : str = "", contenuto : str = "", id_fascicolo : int = 0, permission_required : bool = False):
        if team_id not in self.current_evidences:
            self.current_evidences[team_id] = []
        
        self.current_evidences[team_id].append((titolo, contenuto, id_fascicolo, permission_required))

        # Viene inviata ad ogni socket detective
        for socket in detective_sockets:
            emit('add_new_evidence', {"titolo" :titolo, "contenuto" : contenuto, "id_fascicolo" : id_fascicolo, "permission_required" : permission_required}, to=socket, namespace='/socket.io')

    
    def retrieve_current_evidences(self, team_id : int = -1, socket : str = ""):
        """Metodo che al richiamo invia tutti i fascicoli attualmente presenti in cache alla socket richiedente."""
        
        if team_id not in self.current_evidences:
            self.current_evidences[team_id] = []
        
        for titolo, contenuto, id_fascicolo, permission_required in self.current_evidences[team_id]:
            emit('add_new_evidence', {"titolo" :titolo, "contenuto" : contenuto, "id_fascicolo" : id_fascicolo, "permission_required" : permission_required}, to=socket, namespace='/socket.io')


    def clear_cache(self, team_id : int = -1):
        """Metodo che pulisce la cache del team selezionato."""
        if team_id in self.current_evidences:
            self.current_evidences[team_id] = []






