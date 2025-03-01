from db.db import database
from flask_jwt_extended import create_access_token
from datetime import timedelta
from ProgressionGraph.prograssion_graph import ProgressionGraph
from ProgressionGraph.cache import cached_teams_graphs
import os
from utils.info_logger import getFileLogger

logger = getFileLogger(__name__)


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
        
        # Check per controllare se si è un admin
        personal_id = 0
        team_id = 0
        socket_id = ""
        if not response["is_admin"]:
            personal_id = response["personal_id"]
            team_id = response["team_id"]
            socket_id =  response["socket_id"]

            # Aggiungiamo al dizionario di utenti attivi l'utente ed il suo team
            # al team associamo l'istanza del progression graph
            set_team_graph(str(team_id))

        
        # Se tutti i controlli sono passati, l'utente esiste e pertanto viene generato un token di accesso
        # Il token dura solo due ore poi scade e bisogna rifare il login
        # Assieme al token viene restituito anche il ruolo, che serve al fron end per servire le pagine
        return {"access_token" : create_access_token(identity = str(response["username"]),\
                                                     additional_claims = {"role": response["role"]},\
                                                     expires_delta = timedelta(hours=5)),
                "role" :        response["role"],
                "personal_id" : personal_id,
                "team_id" :     team_id,
                "socket_id" :   socket_id}, 200
    


def set_team_graph(team_id: str = ""):
    # Ottieni la directory dello script corrente
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Percorso della cartella sorella
    sibling_folder = os.path.abspath(os.path.join(script_dir, "..", "ProgressionGraph", "saved_graphs"))
    
    # Crea la cartella se non esiste
    if not os.path.exists(sibling_folder):
        os.makedirs(sibling_folder)
    
    # Generazione del nome del file sulla base del team id
    file_name = f"team_{team_id}_graph"
    # Percorso completo
    file_path = os.path.join(sibling_folder, file_name)
    
    # Si controlla se esista un file di salvataggio
    if os.path.exists(file_path):
        try:
            logger.info(f"✅ Un file di salvataggio è stato trovato per il team {team_id} ...")
            graph = ProgressionGraph.load_from_file(file_path)
            cached_teams_graphs[team_id] = graph
            logger.info(f"✅ Salvataggi caricati ed istanza associata per il team {team_id}.")
        except Exception as e:
            logger.error(f"❌ Errore durante il caricamento del file per il team {team_id}: {e}")
            # Crea una nuova istanza in caso di errore
            graph = ProgressionGraph(team_id)
            cached_teams_graphs[team_id] = graph
            logger.info(f"✅ Istanza creata ed associata per il team {team_id}.")
    else:
        logger.info(f"❌ Non è stato trovato alcun file di salvataggio. Creazione di una nuova istanza ...")
        graph = ProgressionGraph(team_id)
        cached_teams_graphs[team_id] = graph
        logger.info(f"✅ Istanza creata ed associata per il team {team_id}.")
