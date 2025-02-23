from db.db import database


class ControllerPersonalFunctions:

    # Questo metodo permette di aggiornare la socket relativa al proprio id
    @staticmethod
    def update_personal_socket(user_id: str = "", socket_id: str = ""):
        # Richiamo al metodo del database che aggiorna la socket
        message, status_code = database.update_socket_id(user_id=user_id, socket_id=socket_id)
        
        # Logging del risultato
        if status_code == 201:
            print(f"Socket aggiornata per l'utente con ID {user_id}.")
        else:
            print(f"Errore durante l'aggiornamento della socket per l'utente {user_id}: {message}")
        
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
                print(f"Nessuna socket ID trovata per l'utente {user_id}")
            return message
        else:
            print(f"Errore durante la ricerca delle socket ID per l'utente {user_id}: {message}")
            return {"error": message}, status_code

