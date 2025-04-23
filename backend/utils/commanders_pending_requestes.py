from flask_socketio import emit
from utils.info_logger import getFileLogger
from utils.detectives_evidence_cache import EvidenceCache
from utils.decripter_cripted_codes_cache import CriptedCodesCache

logger = getFileLogger(__name__)


class PendingCacheManager:

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(PendingCacheManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "pending_codes"):
            # Cache dei codici e fascicoli in attesa per ogni team
            self.pending_codes: dict[int, list[tuple[str, str]]] = {}  # (code, description)
            self.pending_evidences: dict[int, list[tuple[str, str, int, bool]]] = {}  # (titolo, contenuto, id_fascicolo, permission_required)
            self.token_count : dict [int, int] = {} 

            self.codes_cache = CriptedCodesCache()
            self.evidence_cache = EvidenceCache()


    def add_pending_code(self, team_id: int = -1, commanders_sockets: list[str] = [], code: str = "", description: str = ""):
        """Metodo che agiunge una pendin request relativa ai codici."""

        if team_id not in self.pending_codes:
            self.pending_codes[team_id] = []

        self.pending_codes[team_id].append((code, description))
        logger.info(f"📦 Codice aggiunto alla cache dei comandanti: {code}")

        # Notifica a tutti i comandanti
        for socket in commanders_sockets:
            emit('new_pending_code', {"code": code, "description": description}, to=socket, namespace='/socket.io')


    def add_pending_evidence(self, team_id: int = -1, commanders_sockets: list[str] = [], titolo: str = "", contenuto: str = "", id_fascicolo: int = 0, permission_required: bool = False):
        """Metodo che agiunge una pendin request relativa ai fascicoli."""

        if team_id not in self.pending_evidences:
            self.pending_evidences[team_id] = []

        self.pending_evidences[team_id].append((titolo, contenuto, id_fascicolo, permission_required))
        logger.info(f"📦 Fascicolo aggiunto alla cache dei comandanti: {titolo}")

        # Notifica a tutti i comandanti
        for socket in commanders_sockets:
            emit('new_pending_evidence', {"titolo": titolo, "id_fascicolo": id_fascicolo }, to=socket, namespace='/socket.io')


    def approve_code_delivery(self, team_id: int = -1, code: str = "", decritter_sockets: list[str] = []):
        """Metodo che approva una richiesta su di uno specifico codice."""

        if team_id not in self.pending_codes:
            return

        for item in self.pending_codes[team_id]:
            if item[0] == code:
                # Rimuove dalla cache
                self.pending_codes[team_id].remove(item)

                # Invia ai decrittatori
                self.codes_cache.add_code(team_id=team_id, decritter_sockets=decritter_sockets, code=item[0], description=item[1])

                # Notifica ai comandanti per rimuovere dal frontend
                emit('remove_pending_code', {"code": code }, broadcast=True, include_self=True, namespace='/socket.io')
                break


    def approve_evidence_delivery(self, team_id: int = -1, id_fascicolo: int = 0, detective_sockets: list[str] = []):
        """Metodo che approva una richiesta su di uno specifico fascicolo."""
        
        if team_id not in self.pending_evidences:
            return

        for item in self.pending_evidences[team_id]:
            if item[2] == id_fascicolo:
                # Rimuove dalla cache
                self.pending_evidences[team_id].remove(item)

                # Invia ai detective
                self.evidence_cache.add_evidence(team_id=team_id, detective_sockets=detective_sockets,
                                                 titolo=item[0], contenuto=item[1],
                                                 id_fascicolo=item[2], permission_required=item[3])

                # Notifica ai comandanti per rimuovere dal frontend
                emit('remove_pending_evidence', {"id_fascicolo": id_fascicolo}, broadcast=True, include_self=True, namespace='/socket.io')
                break
    

    def retireve_current_pending_requests(self, team_id : int = -1, socket : str = ""):
        """Metodo che invia alla socket richiedente l'attuale stato della cache"""
        # Recupero i dati pendenti per team
        pending_codes = self.pending_codes.get(team_id, [])
        pending_evidences = self.pending_evidences.get(team_id, [])

        # Invio dei codici pendenti
        for code, description in pending_codes:
            emit('new_pending_code', { "code": code, "description": description }, to=socket, namespace='/socket.io')

        # Invio dei fascicoli pendenti
        for titolo, _, id_fascicolo, _ in pending_evidences:
            emit('new_pending_evidence', { "titolo": titolo, "id_fascicolo": id_fascicolo }, to=socket, namespace='/socket.io')


    def update_token_count(self, team_id : int = -1, token_count : int = 0, commanders_sockets : list [str] = []):
        """Metodo che invia a tutti i comandanti connessi l'attuale token count"""
        if team_id not in self.token_count:
            self.token_count[team_id] = 0
        
        self.token_count[team_id] = token_count

        for socket in commanders_sockets:
            emit('new_token_amount', {"amount": token_count}, to=socket, namespace='/socket.io')


    def decrease_token_count(self, team_id : int = -1, commanders_sockets : list [str] = []):
        
        if team_id in self.token_count and self.token_count[team_id] > 0:
            self.token_count[team_id] -= 1
        elif team_id not in self.token_count:
            self.token_count[team_id] = 0

        for socket in commanders_sockets:
            emit('new_token_amount', {"amount": self.token_count[team_id]}, to=socket, namespace='/socket.io')



    def retrieve_token_amount(self, team_id : int = -1, socket : str = ""):
        """ Metodo che segnala lla socket chiamante l'attuale quantità di token disponibili"""
        token_count = self.token_count.get(team_id, 0)
        emit('new_token_amount', {"amount": token_count}, to=socket, namespace='/socket.io')


    def clear_cache(self, team_id: int = -1):
        """Pulisce l’intera cache di codici e fascicoli pendenti del team."""
        if team_id in self.pending_codes:
            self.pending_codes[team_id] = []

        if team_id in self.pending_evidences:
            self.pending_evidences[team_id] = []

        if team_id in self.token_count:
            self.token_count[team_id] = []

        
        logger.info(f"🧹 Cache pendente dei comandanti pulita per team {team_id}")
