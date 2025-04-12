from utils.info_logger import getFileLogger
logger = getFileLogger(__name__)

# Questa variabile conserva la cache dei perk dei comandanti attivi
# Viene popolata e depopolata quando un comandante fa un aggiornamento

# Quando un comandante fa l'accesso gli viene inviato l'attuale stato
# tramite apposito endpoint

# La cache viene svuotata quando tutti gli utenti sono disconnessi

#Dizionario di interi, i team id a cui è associata una lista di oggetti string ->any ovvero i perk
active_perks : dict[int, list[dict[str, any]]]  = {}



def add_perk(team_id : int = -1, perk : dict[str, any] = {}):
    """Metodo che aggiunge un perk alla cache"""
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
            return

    # Se dopo il controllo il perk non è stato trovato allora viene aggiunto alla lista di quelli attivi
    active_perks[team_id].append(perk)


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
        try:
            active_perks[team_id].remove(perk)

        except ValueError:
            # Se il perk non è presente nella lista, non fare nulla
            pass


def remove_team_perks(team_id : int = -1) -> None:
    """ 
        Questo metodo quando invocato elimina dalla cache 
        ogni perk attualmente memorizzato relativo al team scelto
    """
    
    if team_id in active_perks:
        active_perks[team_id].clear()


def update_perk_cache(team_id: int = -1, data : dict[str, any] = {}) -> None:
    
    if team_id == -1 or data == {}:
        logger.info("Errore nell'aggiornamento della cache dei perk")
        return

    current_perk = {
        "anchorIndex"   :   data["anchorIndex"],
        "perkIndex"     :   data["perkIndex"]
    }

    if data["anchorIndex"] is None:
        remove_perk(team_id=team_id, perk=current_perk)
        logger.info("✅ Perk RIMOSSO dalla cache.")
    else :
        add_perk(team_id=team_id, perk=current_perk)
        logger.info("✅ Perk AGIUNTO dalla cache.")

    