from flask_socketio import emit
from utils.info_logger import getFileLogger
logger = getFileLogger(__name__)

# Questa variabile conserva la cache dei perk dei comandanti attivi
# Viene popolata e depopolata quando un comandante fa un aggiornamento

# Quando un comandante fa l'accesso gli viene inviato l'attuale stato
# tramite apposito endpoint

# La cache viene svuotata quando tutti gli utenti sono disconnessi

# Cache dei perk di un team
team_perks : dict[int, list[tuple[int, str]]] = {}
# Cache dei perk attivi
active_perks : dict[int, list[dict[str, any]]]  = {}
# La cache dell costo energetico usato attualmente
current_energy_used : dict[int, int] = {}
# La cache dei lokers attivi degli utenti
lockers : dict[int, dict[str, bool]] = {}


def add_perk(team_id : int = -1, perk_name : str = "", perk_cost : int = 0):
    """
        La funzione add perk aggiunge un perk alla lista del team corrispettivo
    """

    # Controlli di sicurezza
    if team_id not in team_perks:
        team_perks[team_id] = []
    
    # Se il team non ha ancora il perk questo viene aggiunto alla lista corrispondente
    if not team_has_perk(team_id=team_id, perk_cost=perk_cost, perk_name=perk_name):
        team_perks[team_id].append((perk_cost, perk_name))
        logger.info(f"✅  Nuovo perk aggiunto alla cache. Perk: ({perk_name}, {perk_cost}).")
    else:
        logger.info(f"✅  Il Perk ({perk_name}, {perk_cost}) era già presente per il team {team_id}.")


def team_has_perk(team_id: int, perk_cost: int, perk_name: str) -> bool:
    perk = (perk_cost, perk_name)
    return perk in team_perks.get(team_id, [])


def activate_perk(team_id : int = -1, perk : dict[str, any] = {}):
    """Metodo che aggiunge un perk alla cache di perk attivi"""
    if team_id == -1 or perk == {}:
        return
    
    # Se l'insieme non esisteva ne viene creato uno nuovo
    if team_id not in active_perks:
        active_perks[team_id] = []

    # Se esisteva già viene controllato se la posizione sia differente, in tal caso
    # La nuova posizione viene aggiornata e si ritorna la funzione
    for element in active_perks[team_id]:
        if element["perkIndex"] == perk["perkIndex"] and element["anchorIndex"] != perk["anchorIndex"]:
            element["anchorIndex"] = perk["anchorIndex"]
            logger.info(f"✅ Posizione del Perk {perk["perkIndex"]} aggiornata nella cache.")
            return

    # Se dopo il controllo il perk non è stato trovato allora viene aggiunto alla lista di quelli attivi
    active_perks[team_id].append(perk)
    logger.info(f"✅ Perk {perk["perkIndex"]} AGIUNTO dalla cache.")


def retrieve_perks(team_id : int = -1) -> list:
    """Metodo che ritorna la lista di perk associata al team"""
    if team_id == -1:
        return []
    
    # Se il team id è presente viene ritornata la lista associata
    if team_id in active_perks:
        return active_perks[team_id]
    # Altrimenti viene ritornata un lista vuota
    else:
        return []
    

def remove_perk(team_id: int = -1, perk: dict[str, any] = {}) -> None:
    """Metodo che rimuove un perk dalla cache per un dato team.""" 
    if team_id == -1 or perk == {}:
        return
    
    # Controlla se il team_id è presente nella cache
    if team_id in active_perks:
        for _perk in active_perks[team_id]:
            if _perk["perkIndex"] == perk["perkIndex"]:
                active_perks[team_id].remove(_perk)
                logger.info(f"✅ Perk numero {perk["perkIndex"]} rimosso dalla cache.")


def remove_team_perks(team_id : int = -1) -> None:
    """ 
        Questo metodo quando invocato elimina dalla cache 
        ogni perk attualmente memorizzato relativo al team scelto
    """
    
    if team_id in active_perks:
        active_perks[team_id].clear()

def remove_team_lockers(team_id: int = -1) -> None:
    """ 
        Questo metodo quando invocato elimina dalla cache 
        ogni locker attualmente memorizzato relativo al team scelto
    """
    
    if team_id in lockers:
        lockers[team_id] = {}


def remove_team_energy_usage(team_id: int = -1) -> None:
    """ 
        Questo metodo quando invocato elimina dalla cache 
        il valore dell'energia attualmente usata relativo al team scelto
    """
    
    if team_id in current_energy_used:
        current_energy_used[team_id] = 0


def update_locker(team_id: int = -1, perk_name : str = "", flag : bool = False):

    # Creazione della istanza se non vi è un team associato 
    if team_id not in lockers:
        lockers[team_id] = {}

    # Estrazione della istanza
    team_lokers = lockers[team_id]
    # Impostazione della coppia chiave valore
    team_lokers[perk_name] = flag

    # Se la chiave era true allora viene creato il segnale on, altrimenti off
    signal = perk_name + "_on" if flag else perk_name + "_off"

    # Viene emesso il segnale di blocco o di sblocco a tutti i partecipanti alla connessione
    # N.B. Quelli che non sono connessi, quando lo fanno richiedono l'attuale stato della cache
    # aggiornandosi automaticamente
    emit(signal, {"msg" : f"{perk_name} sbloccato/bloccato"}, broadcast=True, include_self=True, namespace='/socket.io')

    # Logger per il debug
    logger.info(f"📶✅ Segnale '{signal}' inviato a tutti gl utenti connessi.")


def send_lockers_cache(locker_name : str = "", team_id: int = -1, socket: str = ""):
    """ 
        Metodo che quando invocato invia alla socket richiedente la cache dei locker attivi
        tramite segnali
    """ 

    # Controlli di sicurezza ed inizializzazioni di sicurezza
    if team_id not in lockers:
        lockers[team_id] = {}
        
    # Variabile di appoggio
    current_lockers = lockers[team_id]

    # Se il nome non si trova nel dizionario viene ritornato automaticamente che il locker è chiuso
    # e si ritorna la funzione per impedire ulteriori operazioni
    if locker_name not in current_lockers:
        emit(locker_name + "_off", {"msg" : f"{locker_name} bloccato"}, to=socket, namespace='/socket.io')
        return
    
    # Per ogni coppia chiave valore dal dizionario viene inviato il segnale al richiedente
    for key, value in current_lockers.items():
        # Se la chiave è true allora il lock è disattivato, accesso garantito
        if value:
            emit(key + "_on", {"msg" : f"{key} sbloccato"}, to=socket, namespace='/socket.io')
        else:
            emit(key + "_off", {"msg" : f"{key} bloccato"}, to=socket, namespace='/socket.io')



def update_perk_cache(team_id: int = -1, data : dict[str, any] = {}) -> None:

    if team_id == -1 or data == {}:
        logger.info("Errore nell'aggiornamento della cache dei perk")
        return

    current_perk = {
        "anchorIndex"   :   data["anchorIndex"],
        "perkIndex"     :   data["perkIndex"]
    }

    if data["anchorIndex"] is None:
        update_locker(team_id=team_id, perk_name=data["perkName"], flag=False)
        remove_perk(team_id=team_id, perk=current_perk)
    else :
        update_locker(team_id=team_id, perk_name=data["perkName"], flag=True)
        activate_perk(team_id=team_id, perk=current_perk)
        

    