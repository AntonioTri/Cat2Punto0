from db.db import database
from flask_jwt_extended import create_access_token
from datetime import timedelta
from ProgressionGraph.prograssion_graph import ProgressionGraph
from ProgressionGraph.cache import cached_teams_graphs
from utils.user_cache import connected_users, connected_users_status
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

            # Controlliamo che l'utente non sia gia' connesso, in tal caso rifiutiamo la connessione
            if int(personal_id) in connected_users_status:
                # Caso in cui sia connesso
                if connected_users_status[int(personal_id)]:
                    return {"mgs": f"Errore! L'utente è già connesso ..."}, 400
                # Caso in cui si sia connesso precedentemente ma ora e' disconnesso
                else:
                    # Al team associamo l'istanza del progression graph
                    set_team_cache(int(team_id), int(personal_id))
            
            # Nel caso in cui sia il primo accesso assoluto allora eseguiamo comunque la set team graph
            else:
                # Al team associamo l'istanza del progression graph
                    set_team_cache(int(team_id), int(personal_id))


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
    


def set_team_cache(team_id: int = None, personal_id : int = 0):
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

    # Si inizializza la lista di utenti connessi al team segnato se non esiste
    if team_id not in connected_users:
        connected_users[team_id] = []
    
    # Si controlla se esista un file di salvataggio e se sia il primo utente a connettersi
    # se non ci sono file allora non ci sono nemmeno utenti connessi, vengono incrementati dopo
    # e si creano pure le istanze dei salvataggi
    if os.path.exists(file_path):

        # Se non ci sono utenti connessi viene caricata nella cache il grafo del team
        
        if len(connected_users[team_id]) == 0:
            try:
                logger.info(f"✅ Un file di salvataggio è stato trovato per il team {team_id} ...")
                graph = ProgressionGraph.load_from_file(file_path)
                cached_teams_graphs[team_id] = graph
                #TODO: Bisogna aggiungere una bfs che aggiunge i dati nella cache per gli utenti
                # successivi al primo
                connected_users[team_id].append(personal_id)
                logger.info(f"✅ Salvataggi caricati ed istanza associata per il team {team_id}.")
            except Exception as e:
                logger.error(f"❌ Errore durante il caricamento del file per il team {team_id}: {e}")
        
        # Se invece vi erano già utenti connessi allora vengono solo inseriti nella lista di utenti attivi
        # Non viene caricata nessuna istanza del grafo nella cache
        else:
            logger.info(f"✅ I salvataggi erano già nella cache per il team {team_id}.")
            connected_users[team_id].append(personal_id)


    else:
        logger.info(f"❌ Non è stato trovato alcun file di salvataggio. Creazione di una nuova istanza ...")
        graph = ProgressionGraph(str(team_id))
        cached_teams_graphs[team_id] = graph
        connected_users[team_id].append(personal_id)
        logger.info(f"✅ Istanza creata ed associata per il team {team_id}.")

    # Alla fine delle operazioni se tutto e' andato bene viene inizializzato lo status dell'utente come attivo
    # viene creata anche la coppia chiave valore se non esisteva
    connected_users_status[personal_id] = True
    
    # Stampa degli utenti connessi
    logger.info(f"Connected users: {connected_users}")