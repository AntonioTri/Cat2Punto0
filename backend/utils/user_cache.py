# Questa unica istanza rappresente la cache della flask app
# per conservare gli utenti connessi, lasciata globalmente accessibile
# offre una reference globale per estrarre la reference degli utenti connessi
connected_users : dict[int, list[int]] = {} 