from db.db import database


class ControllerPersonalFunctions:


    # Questo metodo permette di aggiornare la socket relativa al proprio id
    @staticmethod
    def update_personal_socket(user_id:str = "", socket_id:str = ""):
        # Richiamo al metodo del database che updata la socket
        message, status_code = database.update_socket_id(user_id=user_id, socket_id=socket_id)
        # Ritorno dei messaggi e degli status code
        print('un nuovo utente si è connesso')
        return message, status_code


    

    @staticmethod
    def get_team_members_socket_ids(user_id:str = ""):
        # Richiamo al metodo del database che restituisce tutti i socket id
        message, status_code = database.get_socket_ids_by_member_id(user_id=user_id)
        # Ritorno dei messaggi e degli status code
        return message
