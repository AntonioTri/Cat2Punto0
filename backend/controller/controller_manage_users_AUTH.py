from db.db import database
from flask_jwt_extended import create_access_token
from datetime import timedelta

class ControllerManageUsersAUTH():

    # La funzione register user registra un nuvo utente sulla base dle dizionario
    @staticmethod
    def register_user(user:dict = {}):

        # Estraiamo i dati dalla richiesta
        username = user["username"]
        password = user["password"]
        role     = user["role"]

        # Referenza al dtabase per l'insert del nuovo utente
        return database.register_new_user(username = username, password = password, role = role)


    # Questo metodo effettua dei controlli per effettuare il login delgi utenti
    @staticmethod
    def login_user(user:dict = {}):
        
        # Estraiamo i dati dalla richiesta
        username = user["username"]
        password = user["password"]

        # Chiamata al db per verificare l'esistenza dell'utente
        response, status_code = database.get_user(username = username, password = password)

        # Controlli per verificare la risposta dal database
        if response is None:
            if status_code == 404:
                return {"msg": "L'utente non esiste!"}, 404
            if status_code == 401:
                return {"msg": "La password non è corretta"}, 401
        if isinstance(response, Exception):
            return {"error": f"Un errore è avvenuto durante l'esecuzione della query: {response}"}, 500    
        
        # Se tutti i controlli sono passati, l'utente esiste e pertanto viene generato un token di accesso
        # Il token dura solo due ore poi scade e bisogna rifare il login
        return {"access_token" : create_access_token(identity = str(response["username"]),\
                                                     additional_claims = {"role": response["role"]},\
                                                     expires_delta = timedelta(hours=2))}, 200