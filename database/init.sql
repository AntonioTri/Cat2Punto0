-- Creazione della tabella delgi utenti

CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(100) NOT NULL UNIQUE,
    user_password VARCHAR(100) NOT NULL
);

