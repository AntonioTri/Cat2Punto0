-- Creazione della tabella delgi utenti

CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(100) NOT NULL UNIQUE,
    user_password VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('ADMIN', 'COMANDANTE', 'DETECTIVE', 'ESPLORATORE', 'DECRITTATORE'))
);

INSERT INTO users (username, user_password, role) VALUES ('antoniotrid', 'Napibrfan@2001', 'ADMIN');