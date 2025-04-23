# Questa unica istanza rappresente la cache della flask app
# per conservare gli utenti connessi, lasciata globalmente accessibile
# offre una reference globale per estrarre la reference degli utenti connessi
connected_users : dict[int, list[int]] = {} 

# Questa variabile conserva invece lo stato di connessione di ogni singolo utente
# Durante la disconnessione la flag viene impostata a true se non vi è alcuna mappatura
# Se non avviene una ricarica della pagina, dopo qualche secondo lo stato sarà ancora impostato
# impostato su false, potendo quindi eliminare dalla cache definitivamente l'utente
connected_users_status : dict[int, bool] = {}