from enum import Enum

# Questa enumerazione definisce i vari tipi di ruolo che ci sono nel sito
class ROLE(Enum):

    ADMIN = "ADMIN"
    COMANDANTE = "COMANDANTE"
    ESPLORATORE = "ESPLORATORE"
    DECRITTATORE = "DECRITTATORE"
    DETECTIVE = "DETECTIVE"

#print(ROLE.COMANDANTE.value)