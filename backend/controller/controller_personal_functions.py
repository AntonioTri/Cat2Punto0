from db.db import database
from utils.info_logger import getFileLogger

logger = getFileLogger(__name__)


class ControllerPersonalFunctions:

    # Questo metodo permette di aggiornare la socket relativa al proprio id
    @staticmethod
    def update_personal_socket(user_id: str = "", socket_id: str = ""):
        # Richiamo al metodo del database che aggiorna la socket
        message, status_code = database.update_socket_id(user_id=user_id, socket_id=socket_id)
        
        # Logging del risultato
        if status_code == 201:
            logger.info(f"Socket aggiornata per l'utente con ID {user_id}.")
        else:
            logger.info(f"Errore durante l'aggiornamento della socket per l'utente {user_id}: {message}")
        
        return {"message": message, "status_code": status_code}


    @staticmethod
    def get_team_members_socket_ids(user_id: str = ""):
        """
        Metodo statico per ottenere tutte le socket_id dei membri del team generale,
        escludendo quella dell'utente specificato.
        """
        # Richiamo al metodo del database
        message, status_code = database.get_all_team_socket_ids(member_id=user_id)

        if status_code == 200:
            if not message:  # Verifica se il risultato è vuoto
                logger.info(f"Nessuna socket ID trovata per l'utente {user_id}")
            return message
        else:
            logger.info(f"Errore durante la ricerca delle socket ID per l'utente {user_id}: {message}")
            return {"error": message}, status_code


    @staticmethod
    def get_team_id_from_user_id(user_id : str = ""):
        """ Metodo che dallo user id ritorna il team_id associato """

        result = database.get_team_id_from_user_id(id_personale=int(user_id))
        status_code = result["status"]

        if status_code == 200:
            team_id = result["team_id"]
            return team_id, status_code
        
        elif status_code == 404 or status_code == 500:
            logger.info(f"Errore durante la ricerca del team id tramite lo user id: {user_id}")
            return {"error" : result["message"]}, status_code
        

    @staticmethod
    def get_user_team_id_by_socket_id(socket_id: str = ""):
        """
        Metodo statico per ottenere il team_id di un utente a partire dalla sua socket_id.
        """
        # Richiamo al metodo del database
        message, status_code = database.get_team_id_by_socket_id(socket_id=socket_id)

        if status_code == 200:
            logger.info(f"Team ID trovato per la socket {socket_id}: {message['team_id']}")
            return message['team_id'], status_code
        else:
            logger.info(f"Errore durante la ricerca del team ID per la socket {socket_id}: {message['error']}")
            return {"error": message["error"]}, status_code

    @staticmethod
    def get_user_id_from_socket(socket_id : str = ""):
        """Metodo per ottenere l'id personal dalla socket."""
        message, status_code = database.get_user_id_from_socket_id(socket_id=socket_id)

        if status_code == 200:
            logger.info(f"Personal ID trovato per la socket {socket_id}: {message['personal_id']}")
            return message['personal_id'], status_code
        else:
            logger.info(f"Errore durante la ricerca del personal ID per la socket {socket_id}: {message['error']}")
            return {"error": message["error"]}, status_code