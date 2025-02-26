#from backend.utils.info_logger import getFileLogger

#logger = getFileLogger(__name__)


class Riddle:


    def __init__(self, puzzle : str = "", solution : str = ""):
        self.puzzle = puzzle
        self.solution = solution


    def sendNewDiscovery(self):
        #logger.info("Provo ad inviare i nuovi dati all'utente")
        print("Provo ad inviare nuovi dati all'utente")


    def isSolution(self, solution : str ="") -> bool:
        return True if self.solution == solution.lower() else False