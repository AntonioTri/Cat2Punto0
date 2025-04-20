from controller.controller_team_pool import ControllerTeamPool
from utils.info_logger import getFileLogger
from flask_socketio import emit
from ProgressionGraph.Riddles.riddles import Riddle
from utils.perk_cache import add_perk
from typing import override
from content.fascioli import FASCICOLO_1, FASCICOLO_2, FASCICOLO_3

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
            
            perk_name = "Fascicoli"
            perk_cost = 6
            add_perk(team_id=team_id, perk_name=perk_name, perk_cost=perk_cost)
            # Inviamo gli strumenti ai comandanti
            self.sendDiscovery(targets=commander_sockets, signal='add_new_perk', message={"perkName" : perk_name, "perkCost" : perk_cost})

            # Agiungiamo i due sistemi di criptaggio iniziali alla cache
            crypting_system = "Dilithium"
            crypting_password = "WarpFlux#0"
            self.cryptingCache.addTeam_crypting_system(team_id=team_id, name=crypting_system, password=crypting_password)
            # Inviamo gli strumenti ai decrittatori
            self.sendDiscovery(targets=decritter_sockets, signal='add_crypting_system', message={"systemName" : crypting_system, "password" : crypting_password})

            # Aggiungiamo alla serie di richieste in attesa dei comandanti, un codice ed un fascicolo da poter inviare ai destinatari
            code = "TEST_CODE_1";
            description = "Codice per testing"
            self.pending_request.add_pending_code(team_id=team_id, code=code, description=description)
            
            id_fascicolo = FASCICOLO_1[0]
            titolo = FASCICOLO_1[1]
            contenuto = FASCICOLO_1[2]
            permission = FASCICOLO_1[3]
            self.pending_request.add_pending_evidence(team_id=team_id, titolo=titolo, contenuto=contenuto, id_fascicolo=id_fascicolo, permission_required=permission)
            
            id_fascicolo = FASCICOLO_2[0]
            titolo = FASCICOLO_2[1]
            contenuto = FASCICOLO_2[2]
            permission = FASCICOLO_2[3]
            self.pending_request.add_pending_evidence(team_id=team_id, titolo=titolo, contenuto=contenuto, id_fascicolo=id_fascicolo, permission_required=permission)
            
            # Serie di codici e fascicoli per iniziare
            id_fascicolo = FASCICOLO_3[0]
            titolo = FASCICOLO_3[1]
            contenuto = FASCICOLO_3[2]
            permission = FASCICOLO_3[3]
            self.evidence_cache.add_evidence(team_id=team_id, detective_sockets=detective_sockets, titolo=titolo, contenuto=contenuto, id_fascicolo=id_fascicolo, permission_required=permission)
            
            logger.info("📶 ✅  Nodo sorgente 0. Dati conservati nella cache ed inviati agli utenti connessi.")