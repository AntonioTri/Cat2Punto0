from flask_socketio import emit
from utils.info_logger import getFileLogger

logger = getFileLogger(__name__)


class CryptingSystemManager:

    # La classe è un singleton
    _instance = None

    # Definizione del singleton 
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(CryptingSystemManager, cls).__new__(cls)
        return cls._instance


    def __init__(self):
        if not hasattr(self, "current_system"):  # Evita la reinizializzazione multipla
            self.current_system: dict[int, str] = {}
            self.team_systems: dict[int, list[tuple[str, str]]] = {}


    def activate_crypting_system(self, team_id: int = -1, name: str = "", password: str = ""):
        """ 
            Questo metodo ativa un particolare sistema di criptaggio per uno specifico team
            Vari sistemi di controllo inizializzano le istanze della cahce se non sono presenti
        """

        if team_id not in self.team_systems:
            self.team_systems[team_id] = []

        if not self.team_has_system(team_id=team_id, target=name):
            self.team_systems[team_id].append((name, password))

        if team_id not in self.current_system:
            self.current_system[team_id] = ""

        if name != self.current_system[team_id]:
            self.current_system[team_id] = name
            emit('crypting_system_changed', {"systemName": name}, broadcast=True, include_self=True, namespace='/socket.io')
            logger.info(f"📶 ✅  Segnale di cambio sistema criptaggio inviato a tutti gli utenti. Sistema {name}.")


    def addTeam_crypting_system(self, team_id: int = -1, name: str = "", password: str = ""):
        """
            Quando invocato questo metodo aggiunge alla lista di sistemi del team un nuovo sistema
        """
        if not self.team_has_system(team_id=team_id, target=name):
            self.team_systems[team_id].append((name, password))
            logger.info(f"📶  ✅  Nuovo sistema aggiunto alla cache di criptaggio. Sistemi: {self.team_systems[team_id]}")


    def send_current_system(self, team_id: int = -1, socket: str = ""):
        """
            Quando invocato questo metodo invia alla socket richiedente l'attuale stato della cache sistema attivo
        """
        # Controlli di sicurezza
        if team_id == -1:
            logger.info(f"📶  ❌  Errore nell'invio dei sistemi alla sokcet {socket}. Team id nullo: {team_id}")
            return
        if socket == "":
            logger.info(f"📶  ❌  Errore nell'invio dei sistemi alla socket. Socket nulla: {socket}")
            return
        
        if team_id not in self.current_system:
            self.current_system[team_id] = ""
        emit('crypting_system_changed', {"systemName": self.current_system[team_id]}, to=socket, namespace='/socket.io')


    def send_team_systems(self, team_id: int = -1, socket: str = ""):
        """
            Questo metodo quando invocato invia alla socket richiedente tutti i sistemi attualmente
            sbloccati del team
        """
        # Controlli di sicurezza
        if team_id == -1:
            logger.info(f"📶  ❌  Errore nell'invio dei sistemi alla sokcet {socket}. Team id nullo: {team_id}")
            return
        if socket == "":
            logger.info(f"📶  ❌  Errore nell'invio dei sistemi alla socket. Socket nulla: {socket}")
            return
        
        if team_id not in self.team_systems:
            self.team_systems[team_id] = []

        logger.info(f"📶  Sistemi da inviare a {socket}: {self.team_systems[team_id]}")

        for name, password in self.team_systems[team_id]:
            logger.info(F"📶  Invio crypting system. Name : {name}, password : {password}")
            emit('add_crypting_system', {"systemName": name, "password": password}, to=socket, namespace='/socket.io')
    

    def add_new_unique_system(self, team_id : int = -1, decritter_sockets : list[str] = [], name : str = "", password : str = ""):
        """
            Quando invocato questo metodo invia a tutte le socket sengalate il nuvo sistema di criptaggio
        """

        # Controlli di sicurezza
        if team_id == -1:
            logger.info(f"📶  ❌  Errore nell'invio del nuovo sistema ai decrittatori. Team id nullo: {team_id}")
            return

        # Viene aggiunto il sistema alla lista corrispettiva del team
        self.addTeam_crypting_system(team_id=team_id, name=name, password=password)

        # Emit del messaggio
        for socket in decritter_sockets:
            if socket is not None:
                emit('add_crypting_system', {"systemName": name, "password": password}, to=socket, namespace='/socket.io')


    def clear_cache(self, team_id : int = -1):
        """
            Quando invocato il metodo cancella la cache presente nel sistema
        """
        if team_id in self.team_systems:
            self.team_systems[team_id] = []

        if team_id in self.current_system:
            del self.current_system[team_id]


    # Metodo che controlla se un sistema target e' presente tra quelli del team
    def team_has_system(self, team_id: int, target: str) -> bool:
        if team_id not in self.team_systems:
            self.team_systems[team_id] = []
            return False
        return any(system[0] == target for system in self.team_systems[team_id])
