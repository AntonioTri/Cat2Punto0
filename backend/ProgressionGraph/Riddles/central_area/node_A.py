from controller.controller_team_pool import ControllerTeamPool
from utils.info_logger import getFileLogger
from ProgressionGraph.Riddles.riddles import Riddle
from utils.crypto_sys_cache import CryptingSystemManager
from utils.perk_cache import add_perk
from typing import override

logger = getFileLogger(__name__)

class A(Riddle):
    """
        Il nodo A, la prima scoperta, quando risolta invia agli utenti un nuovo sistema di criptaggio
    """

    def __init__(self, solution: str = ""):
        super().__init__(solution)

    @override
    def sendNewDiscovery(self, team_id : int = -1):

        decritter_sockets, sc3 = ControllerTeamPool.get_group_sockets(team_id=team_id, role="DECRITTATORE")
        commander_sockets, sc1 = ControllerTeamPool.get_group_sockets(team_id=team_id, role="COMANDANTE")

        if sc3 == 200 and sc1 == 200:

            # Aggiungiamo il nuvo perk per i permessi alla cache
            perk_name = "Criptaggio"
            perk_cost = 5
            add_perk(team_id=team_id, perk_name=perk_name, perk_cost=perk_cost)
            # Inviamo gli strumenti ai comandanti
            super().sendDiscovery(targets=commander_sockets, signal='add_new_perk', message={"perkName" : perk_name, "perkCost" : perk_cost})

            # Agiungiamo i due sistemi di criptaggio iniziali alla cache
            crypting_system = "Serpent"
            crypting_password = "CoilSecure66"
            self.cryptingSystem.addTeam_crypting_system(team_id=team_id, name=crypting_system, password=crypting_password)

            # Inviamo gli strumenti ai decrittatori
            super().sendDiscovery(targets=decritter_sockets, signal='add_crypting_system', message={"systemName" : crypting_system, "password" : crypting_password})

            logger.info("📶 ✅  Nodo A. Dati conservati nella cache ed inviati ai detective connessi.")