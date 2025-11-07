from flask_socketio import emit

class ReservedProofsCache:

    # La classe è un singleton
    _instance = None

    # Definizione del singleton 
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ReservedProofsCache, cls).__new__(cls)
        return cls._instance


    def __init__(self):
        if not hasattr(self, "current_reserved_proofs"):
            # Cache delle prove riservate divise per team
            # Ogni entry è una lista di tuple (title, content, id_evidence)
            self.current_reserved_proofs: dict[int, list[tuple[str, str, int]]] = {}


    def add_reserved_proof(self, team_id: int = -1, commanders_sockets: list[str] = [], title: str = "", content: str = "", id_evidence: int = 0):
        """Aggiunge una nuova prova riservata alla cache e la invia a tutti i comandanti specificati."""
        if team_id not in self.current_reserved_proofs:
            self.current_reserved_proofs[team_id] = []
        
        self.current_reserved_proofs[team_id].append((title, content, id_evidence))

        # Invio della prova a tutte le socket dei decrittatori specificati
        for socket in commanders_sockets:
            if socket is not None:
                emit('add_new_reserved_evidence', { "title": title, "content": content, "id_evidence": id_evidence }, to=socket, namespace='/socket.io')


    def retrieve_current_reserved_proofs(self, team_id: int = -1, socket: str = ""):
        """Invia alla socket tutte le prove riservate correnti del team specificato."""
        if team_id not in self.current_reserved_proofs:
            self.current_reserved_proofs[team_id] = []

        for title, content, id_evidence in self.current_reserved_proofs[team_id]:
            emit('add_new_reserved_evidence', { "title": title, "content": content, "id_evidence": id_evidence }, to=socket, namespace='/socket.io')


    def clear_cache(self, team_id: int = -1):
        """Rimuove tutte le prove riservate in cache per un team specificato."""
        if team_id in self.current_reserved_proofs:
            self.current_reserved_proofs[team_id] = []
