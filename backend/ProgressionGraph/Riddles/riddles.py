from utils.crypto_sys_cache import CryptingSystemManager
from utils.broadcast_messages import BroadcastMessager
from utils.detectives_evidence_cache import EvidenceCache
from utils.decripter_cripted_codes_cache import CriptedCodesCache
from utils.commanders_pending_requestes import PendingCacheManager
from utils.info_logger import getFileLogger
from flask_socketio import emit
import re

logger = getFileLogger(__name__)


#TODO: I riddle devono essere polimorfi e tutti diversi, 
# inoltre devono conservare i dati nella cache quando serve

class Riddle:


    def __init__(self, solution : str = ""):
        """Alla fine del nome dell'enigma deve esserci scritto la sua chiave"""
        self.solution = solution
        self.key : int = int(re.search(r'\d+$', self.solution).group())
        # Istanza della cache dei sistemi di criptaggio
        self.cryptingCache : CryptingSystemManager = CryptingSystemManager()
        # Istanza del broadcaster di messaggi
        self.broadcast_messager : BroadcastMessager = BroadcastMessager()
        # Istanza della cache per le pending request dei comandanti
        self.pending_request : PendingCacheManager = PendingCacheManager()
        # Istanza della cache dei codici di decrittazione
        self.crypted_codes_cache : CriptedCodesCache = CriptedCodesCache()
        # Istanza della cache dei fascioli dei detective
        self.evidence_cache : EvidenceCache = EvidenceCache()


    def sendDiscovery(self, targets : list[str], signal : str = "", message : dict = {}):
        """ Il metodo invia a tutte le socket target il messaggio indicato sul segnale indicato."""
        for socket in targets:
            if socket is not None:
                emit(signal, message, to=socket, namespace='/socket.io')
    
    def sendNewDiscovery(self, *args, **kwargs):
        logger.info(f"Nodo con soluzione '{self.solution}' non implementato. ARGS: {args}. KWARGS: {kwargs}")


    def isSolution(self, solution : str ="") -> bool:
        return True if self.solution == solution else False