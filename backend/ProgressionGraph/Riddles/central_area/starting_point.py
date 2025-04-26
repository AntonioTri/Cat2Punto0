from controller.controller_team_pool import ControllerTeamPool
from utils.info_logger import getFileLogger
from ProgressionGraph.Riddles.riddles import Riddle
from typing import override
from content.fascioli import FASCICOLO_1, FASCICOLO_2, FASCICOLO_3
from content.reserved_evidences import PROVA_RISERVATA_1, PROVA_RISERVATA_2, PROVA_RISERVATA_3, PROVA_RISERVATA_4
from content.fascicoli_pendenti import FASCICOLO_PENDENTE_1, FASCICOLO_PENDENTE_2, FASCICOLO_PENDENTE_3, FASCICOLO_PENDENTE_4, FASCICOLO_PENDENTE_5
from content.perks import PERK_PROTOCOLLO, PERK_RECUPERO, PERK_DEDUZIONE, PERK_DISTRIBUZIONE, PERK_ALPHA, PERK_BROADCAST
from content.codes import CODE_1, CODE_2, CODE_3
from content.codici_pendenti import PENDING_CODE_1, PENDING_CODE_2, PENDING_CODE_3
from content.broadcast import MESSAGE_FROM_ARCHITECT_1, MESSAGE_FROM_ARCHITECT_2, MESSAGE_FROM_ARCHITECT_3
from content.crypting_systems import CRYPTING_SYSTEM_1, CRYPTING_SYSTEM_2

logger = getFileLogger(__name__)

class SourceNode(Riddle):
    """
        Il nodo 0 quando scoperto offre tutti gli strumenti base per iniziare la caccia al tesoro
    """

    def __init__(self, solution: str = ""):
        super().__init__(solution)

    @override
    def sendNewDiscovery(self, team_id : int = -1):


        commander_sockets, sc1 = ControllerTeamPool.get_group_sockets(team_id=team_id, role="COMANDANTE")
        decritter_sockets, sc3 = ControllerTeamPool.get_group_sockets(team_id=team_id, role="DECRITTATORE")
        detective_sockets, sc3 = ControllerTeamPool.get_group_sockets(team_id=team_id, role="DETECTIVE")

        if sc1 == 200 and sc3 == 200:
            
            # Sblocco dei perk base
            self.unlock_perk(team_id=team_id, PERK=PERK_PROTOCOLLO, commander_sockets=commander_sockets)
            self.unlock_perk(team_id=team_id, PERK=PERK_RECUPERO, commander_sockets=commander_sockets)
            self.unlock_perk(team_id=team_id, PERK=PERK_DEDUZIONE, commander_sockets=commander_sockets)
            self.unlock_perk(team_id=team_id, PERK=PERK_DISTRIBUZIONE, commander_sockets=commander_sockets)
            self.unlock_perk(team_id=team_id, PERK=PERK_ALPHA, commander_sockets=commander_sockets)
            self.unlock_perk(team_id=team_id, PERK=PERK_BROADCAST, commander_sockets=commander_sockets)

            # Sblocco dei codici iniziali
            self.unlock_cripted_code(team_id=team_id, CRYPTED_CODE=CODE_1, decritter_sockets=decritter_sockets)
            self.unlock_cripted_code(team_id=team_id, CRYPTED_CODE=CODE_2, decritter_sockets=decritter_sockets)
            self.unlock_cripted_code(team_id=team_id, CRYPTED_CODE=CODE_3, decritter_sockets=decritter_sockets)

            # Invio del sistema di decrittazione base
            self.unlock_crypting_system(team_id=team_id, CRYPTING_SYSTEM=CRYPTING_SYSTEM_1, decritter_sockets=decritter_sockets)
            self.unlock_crypting_system(team_id=team_id, CRYPTING_SYSTEM=CRYPTING_SYSTEM_2, decritter_sockets=decritter_sockets)

            # Sblocco dei fascicoli iniziali
            self.unlock_detective_evidence(team_id=team_id, DETECTIVE_EVIDENCE=FASCICOLO_1, detective_sockets=detective_sockets)
            self.unlock_detective_evidence(team_id=team_id, DETECTIVE_EVIDENCE=FASCICOLO_2, detective_sockets=detective_sockets)
            self.unlock_detective_evidence(team_id=team_id, DETECTIVE_EVIDENCE=FASCICOLO_3, detective_sockets=detective_sockets)

            # Sblocco di prove riservate
            self.unlock_commander_evidence(team_id=team_id, COMMANDER_EVIDENCE=PROVA_RISERVATA_1, commander_sockets=commander_sockets)
            self.unlock_commander_evidence(team_id=team_id, COMMANDER_EVIDENCE=PROVA_RISERVATA_2, commander_sockets=commander_sockets)
            self.unlock_commander_evidence(team_id=team_id, COMMANDER_EVIDENCE=PROVA_RISERVATA_3, commander_sockets=commander_sockets)
            self.unlock_commander_evidence(team_id=team_id, COMMANDER_EVIDENCE=PROVA_RISERVATA_4, commander_sockets=commander_sockets)

            # Invio dei fascicoli pendenti
            self.unlock_pending_evidence(team_id=team_id, PENDING_EVIDENCE_REQUEST=FASCICOLO_PENDENTE_1, commander_sockets=commander_sockets)
            self.unlock_pending_evidence(team_id=team_id, PENDING_EVIDENCE_REQUEST=FASCICOLO_PENDENTE_2, commander_sockets=commander_sockets)
            self.unlock_pending_evidence(team_id=team_id, PENDING_EVIDENCE_REQUEST=FASCICOLO_PENDENTE_3, commander_sockets=commander_sockets)
            self.unlock_pending_evidence(team_id=team_id, PENDING_EVIDENCE_REQUEST=FASCICOLO_PENDENTE_4, commander_sockets=commander_sockets)
            self.unlock_pending_evidence(team_id=team_id, PENDING_EVIDENCE_REQUEST=FASCICOLO_PENDENTE_5, commander_sockets=commander_sockets)

            # Invio dei codici pendenti
            self.unlock_pending_code(team_id=team_id, PENDING_CODE_REQUEST=PENDING_CODE_1, commander_sockets=commander_sockets) 
            self.unlock_pending_code(team_id=team_id, PENDING_CODE_REQUEST=PENDING_CODE_2, commander_sockets=commander_sockets)
            self.unlock_pending_code(team_id=team_id, PENDING_CODE_REQUEST=PENDING_CODE_3, commander_sockets=commander_sockets)
            
            # Invio dei alcuni messaggi broadcast custom
            self.unlock_broadcast_message(team_id=team_id, BROADCAST_MESSAGE=MESSAGE_FROM_ARCHITECT_1, detective_sockets=detective_sockets)
            self.unlock_broadcast_message(team_id=team_id, BROADCAST_MESSAGE=MESSAGE_FROM_ARCHITECT_2, detective_sockets=detective_sockets)
            self.unlock_broadcast_message(team_id=team_id, BROADCAST_MESSAGE=MESSAGE_FROM_ARCHITECT_3, detective_sockets=detective_sockets)

                        
            logger.info("📶 ✅  Nodo sorgente 0. Dati conservati nella cache ed inviati agli utenti connessi.")