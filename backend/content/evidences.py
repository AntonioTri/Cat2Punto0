from content.fascioli import *
from entity.role import ROLE

"""
Questo dizionario include tutti i progressi, i dati ed ogni cosa sbloccabile nella CAT

è un dizionario con 4 chiavi, COMANDANTE, DETECTIVE, DECRITTATORE ed ESPLORATORE, ad ognuna delle quali
corrispondono i rispettivi progressi.

Ogni progresso contiene come primo elemento il numero di progressi standard da applicare ad inizio partita
e come secondo elemento un dizionario, a cui ogni chiave corrisponde un valore del progresso.

Nel database vengono conservate il tipo di progresso + la chiave sbloccata, in onìgni combinazione possibili,
speciali queri estraggono solo speciali tipologie di progressi che vengono poi estratti con O(1) operazioni da questa
stessa variabile

"""

PROGRESSES = {

    ROLE.COMANDANTE.value : {



    },

    ROLE.DECRITTATORE.value : {



    },

    ROLE.DETECTIVE.value : {

        "fascicoli" : [

            4, # Numero iniziale di fascicoli disponibili
            {   
                1: {"titolo" : FASCICOLO_1[0], "contenuto" : FASCICOLO_1[1], "id_fascicolo" : 1, "permission_required" : True},
                2: {"titolo" : FASCICOLO_2[0], "contenuto" : FASCICOLO_2[1], "id_fascicolo" : 2, "permission_required" : False},
                3: {"titolo" : FASCICOLO_3[0], "contenuto" : FASCICOLO_3[1], "id_fascicolo" : 3, "permission_required" : True},
                4: {"titolo" : FASCICOLO_4[0], "contenuto" : FASCICOLO_4[1], "id_fascicolo" : 4, "permission_required" : False},
                5: {"titolo" : FASCICOLO_5[0], "contenuto" : FASCICOLO_5[1], "id_fascicolo" : 5, "permission_required" : True},
                6: {"titolo" : FASCICOLO_6[0], "contenuto" : FASCICOLO_6[1], "id_fascicolo" : 6, "permission_required" : False},
                7: {"titolo" : FASCICOLO_7[0], "contenuto" : FASCICOLO_7[1], "id_fascicolo" : 7, "permission_required" : False},
                8: {"titolo" : FASCICOLO_8[0], "contenuto" : FASCICOLO_8[1], "id_fascicolo" : 8, "permission_required" : False}
            } 

        ],
        
    },

    ROLE.ESPLORATORE.value : {



    }

}

def get_starting_detective_files():
    """ Questa funzione restituisce i fascicoli iniziali da distribuire ai detective """
    starting_files = []
    # Ciclo for da i fino al numero di fascicoli iniziali da inizializzare
    for i in range(PROGRESSES[ROLE.DETECTIVE.value]["fascicoli"][0]):
        # Aggiungiamo ogni fascicolo alla lista
        starting_files.append(PROGRESSES[ROLE.DETECTIVE.value]["fascicoli"][1][i+1])
    # Ritorniamo i fascicoli
    return starting_files

# Funzione che ritorna il numero di fascicoli iniziali dei detective
def get_starting_number_of_files():
    return int(PROGRESSES[ROLE.DETECTIVE.value]["fascicoli"][0])

# Funzione che ritorna tutti i fascicoli dei detective
def get_detective_files():
    return PROGRESSES[ROLE.DETECTIVE.value]["fascicoli"][1]

# Funzione per ritornare i progressi selezionati dal tipo e dalle chiavi scelte
def get_selected_detective_progresses(type: str = "fascicoli", keys: list[int] = []):
    # Inizializzazione
    selected_progresses = dict(PROGRESSES[ROLE.DETECTIVE.value][type][1])
    # Risultato
    result = []
    # Per ogni chiave scelta
    for key in keys:
        # Se i dati sono presenti
        data = selected_progresses.get(key)
        if data is not None and data not in result:
            # Li aggiungiamo alla lista di elementi finali
            result.append(data)

    # Restituiamo gli elementi selezionati
    return result