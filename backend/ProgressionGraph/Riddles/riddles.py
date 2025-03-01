from utils.info_logger import getFileLogger
from flask_socketio import emit
from controller.controller_team_pool import ControllerTeamPool

logger = getFileLogger(__name__)


class Riddle:


    def __init__(self, puzzle : str = "", solution : str = ""):
        self.puzzle = puzzle
        self.solution = solution


    def sendNewDiscovery(self, team_to_signal : int = None, socket_to_signal : str = None):
        """ Il metodo prende in input o un team da segnalare o una socket da segnalare.\nI dati vengono inviatio ad uno specifico team intero, o ad uno specifico sottogruppo\noppure ad uno specifico utente    """
        
        # Se e' stato inviato soltanto il socket id di un individuo viene aggiornato solo lui
        if socket_to_signal is not None and team_to_signal is None:
            logger.info(f"Invio dati alla socket {socket_to_signal}. Dati: {self.puzzle}.")
            message_to_send = {"message" : f"Questo e' un messaggio dal puzzle {self.puzzle}. Sto inviando nuove informazioni!"}
            emit('signal_from_node', message_to_send, to=socket_to_signal)
        
        # Se invece e' stato inviato un id team interno viene segnalato l'intero team
        elif team_to_signal is not None and socket_to_signal is None:
            #logger.info("Provo ad inviare i nuovi dati all'utente")
            print(f"Provo ad inviare nuovi dati al team {team_to_signal}")
            commander_sockets, sc1 = ControllerTeamPool.get_all_team_group_socket(team_id=team_to_signal, role="COMANDANTE")
            detective_sockets, sc2 = ControllerTeamPool.get_all_team_group_socket(team_id=team_to_signal, role="DETECTIVE")
            decritter_sockets, sc3 = ControllerTeamPool.get_all_team_group_socket(team_id=team_to_signal, role="DECRITTATORE")
            
            if sc1 == 404 or sc2 == 404 or sc3 == 404:
                logger.info(f"Errore durante la ricerca delle socket nel puzzle {self.puzzle}.")
                return

            message_to_send = {"message" : f"Questo e' un messaggio dal puzzle {self.puzzle}. Sto inviando nuove informazioni!"}
            
            # Invio del messaggio
            for commander in commander_sockets:
                logger.info(f"Comandante da segnalare dal puzzle {self.puzzle}: {commander}")
                sid = commander["socket"]
                emit('signal_from_node', message_to_send, to=sid)

            for detective in detective_sockets:
                logger.info(f"Detective da segnalare dal puzzle {self.puzzle}: {detective}")
                sid = detective["socket"]
                emit('signal_from_node', message_to_send, to=sid)

            for decritter in decritter_sockets:
                logger.info(f"Decrittatore da segnalare dal puzzle {self.puzzle}: {decritter}")
                sid = decritter["socket"]
                emit('signal_from_node', message_to_send, to=sid)
        


    def isSolution(self, solution : str ="") -> bool:
        return True if self.solution == solution else False