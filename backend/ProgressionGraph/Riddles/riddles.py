from utils.info_logger import getFileLogger
from flask_socketio import emit
from controller.controller_team_pool import ControllerTeamPool
import re

logger = getFileLogger(__name__)


class Riddle:


    def __init__(self, puzzle : str = "", solution : str = ""):
        """Alla fine del nome dell'enigma deve esserci scritto la sua chiave"""
        self.puzzle = puzzle
        self.solution = solution
        self.key : int = int(re.search(r'\d+$', self.puzzle).group())
        self.link_to_source : str = "https://www.google.com"


    def sendNewDiscovery(self, team_to_signal : int = None, socket_to_signal : str = None):
        """ Il metodo prende in input o un team da segnalare o una socket da segnalare.\nI dati vengono inviatio ad uno specifico team intero, o ad uno specifico sottogruppo\noppure ad uno specifico utente    """
        
        # Definizione del messaggio da inviare
        message_to_send = {"key" : self.key, "link_to_source" : self.link_to_source}

        # Se e' stato inviato soltanto il socket id di un individuo viene aggiornato solo lui
        if socket_to_signal is not None and team_to_signal is None:
            logger.info(f"Invio dati alla socket {socket_to_signal}. Dati: {self.puzzle}.")
            emit('signal_from_node', message_to_send, to=socket_to_signal, namespace='/socket.io')
        
        # Se invece e' stato inviato un id team interno viene segnalato l'intero team
        elif team_to_signal is not None and socket_to_signal is None:

            commander_sockets, sc1 = ControllerTeamPool.get_all_team_group_socket(team_id=team_to_signal, role="COMANDANTE")
            detective_sockets, sc2 = ControllerTeamPool.get_all_team_group_socket(team_id=team_to_signal, role="DETECTIVE")
            decritter_sockets, sc3 = ControllerTeamPool.get_all_team_group_socket(team_id=team_to_signal, role="DECRITTATORE")
            
            if sc1 == 404 or sc2 == 404 or sc3 == 404:
                logger.info(f"Errore durante la ricerca delle socket nel puzzle {self.puzzle}.")
                return

            # Invio del messaggio
            for commander in commander_sockets:
                logger.info(f"Comandante da segnalare dal puzzle {self.puzzle}: {commander}")
                sid = commander["socket"]
                emit('signal_from_node', message_to_send, to=sid, namespace='/socket.io')

            for detective in detective_sockets:
                logger.info(f"Detective da segnalare dal puzzle {self.puzzle}: {detective}")
                sid = detective["socket"]
                emit('signal_from_node', message_to_send, to=sid, namespace='/socket.io')

            for decritter in decritter_sockets:
                logger.info(f"Decrittatore da segnalare dal puzzle {self.puzzle}: {decritter}")
                sid = decritter["socket"]
                emit('signal_from_node', message_to_send, to=sid, namespace='/socket.io')
        
        # Condizione tecnicamente temporanea tramite la quale si segnala la socket indicata nei casi estremi
        elif socket_to_signal is not None and team_to_signal is not None:
            logger.info(f"Invio dati alla socket {socket_to_signal}. Dati: {self.puzzle}.")
            emit('signal_from_node', message_to_send, to=socket_to_signal, namespace='/socket.io')
        
        # Caso in cui nessuna socket è stata inviata al metodo, serve all'inizializzazione del grafo quando l'istanza viene caricata
        elif socket_to_signal is None and team_to_signal is None:
            logger.info(f"❌ Nodo dell'{self.puzzle}. Nessuna socket ricevuta. Non invio alcun segnale.")




    def isSolution(self, solution : str ="") -> bool:
        return True if self.solution == solution else False