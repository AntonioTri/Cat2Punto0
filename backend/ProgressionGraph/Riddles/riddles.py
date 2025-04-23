from utils.crypto_sys_cache import CryptingSystemManager
from utils.broadcast_messages import BroadcastMessager
from utils.detectives_evidence_cache import EvidenceCache
from utils.decripter_cripted_codes_cache import CriptedCodesCache
from utils.commanders_pending_requestes import PendingCacheManager
from utils.commanders_evidences import ReservedProofsCache
from utils.timeline_cache import HistoricalEventsCache
from utils.info_logger import getFileLogger
from utils.perk_cache import add_perk
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
        # Istanza della cache dei fascicoli riservati dei comandanti
        self.reserved_proofs_cache : ReservedProofsCache = ReservedProofsCache()
        # Istanza della cache degli eventi storici
        self.historical_events_cache : HistoricalEventsCache = HistoricalEventsCache()
    
    def sendNewDiscovery(self, *args, **kwargs):
        logger.info(f"Nodo con soluzione '{self.solution}' non implementato. ARGS: {args}. KWARGS: {kwargs}")


    def isSolution(self, solution : str ="") -> bool:
        return True if self.solution == solution else False
    
    # Queste funzioni quando invocate sbloccano l'elemento inviato in argomento per il team scelto
    def unlock_perk(self, team_id : int = -1, PERK : list = [], commander_sockets : list[str] = []):
        """Metodo che sblocca un nuovo perk ad un team specifico"""
        perk_name = PERK[0]
        perk_cost = PERK[1]
        add_perk(team_id=team_id, perk_name=perk_name, perk_cost=perk_cost)
        self.sendDiscovery(targets=commander_sockets, signal='add_new_perk', message={"perkName" : perk_name, "perkCost" : perk_cost})


    def unlock_commander_evidence(self, team_id : int = -1, COMMANDER_EVIDENCE : list = [], commander_sockets : list[str] = []):
        """Metodo per sbloccare una prova riservata dei comandanti di un team"""
        self.reserved_proofs_cache.add_reserved_proof(commanders_sockets=commander_sockets, 
                                                      title=COMMANDER_EVIDENCE[0], 
                                                      content=COMMANDER_EVIDENCE[1], 
                                                      id_evidence=COMMANDER_EVIDENCE[2])
        

    def unlock_pending_code(self, team_id : int = -1, PENDING_CODE_REQUEST : list = [], commander_sockets : list[str] = []):
        """Metodo che aggiunge una nuova richiesta codice pendente ad un team specifico"""
        self.pending_request.add_pending_code(team_id=team_id,
                                              commanders_sockets=commander_sockets,
                                              code=PENDING_CODE_REQUEST[0], 
                                              description=PENDING_CODE_REQUEST[1])
    

    def unlock_pending_evidence(self, team_id : int = -1, PENDING_EVIDENCE_REQUEST : list = [], commander_sockets : list[str] = []):
        """Metodo che sblocca un nuovo perk ad un team specifico"""
        self.pending_request.add_pending_evidence(team_id=team_id,
                                                  commanders_sockets=commander_sockets,
                                                  titolo=PENDING_EVIDENCE_REQUEST[0],
                                                  contenuto=PENDING_EVIDENCE_REQUEST[1],
                                                  id_fascicolo=PENDING_EVIDENCE_REQUEST[2],
                                                  permission_required=PENDING_EVIDENCE_REQUEST[3])


    def unlock_crypting_system(self, team_id : int = -1, CRYPTING_SYSTEM : list = [], decritter_sockets : list[str] = []):
        """Metodo che sblocca un nuovo sistema di decrittazione ad un team specifico"""
        self.cryptingCache.add_new_unique_system(team_id=team_id, 
                                                 decritter_sockets=decritter_sockets,
                                                 name=CRYPTING_SYSTEM[0],
                                                 password=CRYPTING_SYSTEM[1])
        

    def unlock_cripted_code(self, team_id : int = -1, CRYPTED_CODE : list = [], decritter_sockets : list[str] = []):
        """Metodo che al richiamo sblocca un codice criptato ad un team"""
        self.crypted_codes_cache.add_code(team_id=team_id,
                                          decritter_sockets=decritter_sockets,
                                          code=CRYPTED_CODE[0],
                                          description=CRYPTED_CODE[1])
        

    def unlock_detective_evidence(self, team_id : int = -1, DETECTIVE_EVIDENCE : list = [], detective_sockets : list[str] = []):
        """Metodo che al richiamo sblocca una nuova prova per i detective"""
        self.evidence_cache.add_evidence(team_id=team_id,
                                         detective_sockets=detective_sockets,
                                         titolo=DETECTIVE_EVIDENCE[0],
                                         contenuto=DETECTIVE_EVIDENCE[1],
                                         id_fascicolo=DETECTIVE_EVIDENCE[2],
                                         permission_required=DETECTIVE_EVIDENCE[3])


    def unlock_storic_event(self, team_id : int = -1, STORIC_EVENT : list = [], detective_sockets : list[str] = []):
        """Metodo che al richiamo invia nuovi eventi storici da ricomporre ai detective"""
        self.historical_events_cache.add_event(team_id=team_id,
                                           detectives_sockets=detective_sockets,
                                           titolo=STORIC_EVENT[0],
                                           descrizione=STORIC_EVENT[1])


    def unlock_broadcast_message(self, team_id : int = -1, BROADCAST_MESSAGE : list = [], detective_sockets : list[str] = []):
        """Metodo che al richiamo aggiunge un nuovo messaggio broadcast alla chat dei detectives"""
        self.broadcast_messager.add_new_message(team_id=team_id, 
                                                emitter=BROADCAST_MESSAGE[0],
                                                message=BROADCAST_MESSAGE[1])


    def sendDiscovery(self, targets : list[str], signal : str = "", message : dict = {}):
        """ Il metodo invia a tutte le socket target il messaggio indicato sul segnale indicato."""
        for socket in targets:
            if socket is not None:
                emit(signal, message, to=socket, namespace='/socket.io')
