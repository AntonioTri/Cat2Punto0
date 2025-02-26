import random
import string

def generate_password(length=10):
    if length < 4:
        raise ValueError("La password deve avere almeno 4 caratteri per soddisfare i requisiti.")

    # Definizione dei gruppi di caratteri
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special_chars = "!$@%"

    # Assicuriamo che ci sia almeno un carattere di ogni tipo
    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
        random.choice(special_chars),
    ]

    # Riempiamo il resto della password con caratteri casuali
    all_chars = lowercase + uppercase + digits + special_chars
    password += random.choices(all_chars, k=length - 4)

    # Mischiamo i caratteri per renderli imprevedibili
    random.shuffle(password)

    # Convertiamo la lista in una stringa
    return ''.join(password)


