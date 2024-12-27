-- Creazione della tabella delgi utenti

CREATE TABLE IF NOT EXISTS admin (
    username VARCHAR(100) NOT NULL UNIQUE,
    user_password VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('ADMIN'))
);

INSERT INTO admin (username, user_password, role) VALUES ('antoniotrid', 'Napibrfan@2001', 'ADMIN');
INSERT INTO admin (username, user_password, role) VALUES ('francesca', 'abracadabra', 'ADMIN');

-- Creazione della tabella Team
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY, -- ID incrementale automatico
    team_name VARCHAR(255) NOT NULL UNIQUE -- Nome del team
);

-- Creazione della tabella team_group
CREATE TABLE team_group (
    group_id SERIAL PRIMARY KEY, -- ID incrementale automatico
    team_id INT NOT NULL, -- Chiave esterna verso Team
    team_type VARCHAR(255) NOT NULL CHECK(team_type IN ('COMANDANTE', 'DETECTIVE', 'ESPLORATORE', 'DECRITTATORE')), -- Tipo del gruppo
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- Creazione della tabella team_member
CREATE TABLE team_member (
    id_personale SERIAL PRIMARY KEY, -- ID incrementale automatico
    name VARCHAR(255) NOT NULL, -- Nome del membro
    password VARCHAR(255) NOT NULL, -- Password del membro
    socket_id VARCHAR(255), -- ID del socket (opzionale)
    role VARCHAR(50) NOT NULL CHECK(role IN ('COMANDANTE', 'DETECTIVE', 'ESPLORATORE', 'DECRITTATORE')), -- Ruolo del membro
    group_id INT NOT NULL, -- Chiave esterna verso team_group
    CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES team_group(group_id) ON DELETE CASCADE
);
