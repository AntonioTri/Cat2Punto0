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
    name VARCHAR(255) NOT NULL UNIQUE, -- Nome del membro
    password VARCHAR(255) NOT NULL, -- Password del membro
    socket_id VARCHAR(255), -- ID del socket (opzionale)
    role VARCHAR(50) NOT NULL CHECK(role IN ('COMANDANTE', 'DETECTIVE', 'ESPLORATORE', 'DECRITTATORE')), -- Ruolo del membro
    group_id INT NOT NULL, -- Chiave esterna verso team_group
    team_id INT, -- Valore che conserva l'id del team di appartenenza (opzionale)
    CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES team_group(group_id) ON DELETE CASCADE
);


-- Creazione della tabella progress
CREATE TABLE progress (
    id SERIAL PRIMARY KEY, -- Id incrementale
    team_id INT NOT NULL, -- Chiave esterna verso il team
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams (team_id) ON DELETE CASCADE
);


CREATE TABLE signals (
    id SERIAL PRIMARY KEY, -- Id incrementale
    progress_id INT NOT NULL, -- Foreign key verso la tabella progress
    signal TEXT NOT NULL, -- Segnale sblocato
    CONSTRAINT fk_progress_signal FOREIGN KEY (progress_id) REFERENCES progress (id) ON DELETE CASCADE
);


CREATE TABLE commander_progress (
    id SERIAL PRIMARY KEY, -- Id incrementale
    progress_id INT NOT NULL, -- Foreign key verso la tabella progress
    progress_type TEXT NOT NULL CHECK(progress_type IN ('permessi')), -- Tipo progresso sbloccato
    progress_code INT NOT NULL, -- Codice sbloccato
    CONSTRAINT fk_progress_commander FOREIGN KEY (progress_id) REFERENCES progress (id) ON DELETE CASCADE,
    group_team_id INT NOT NULL, -- Id del group team di appartenenza
    CONSTRAINT fk_commander_group FOREIGN KEY (group_team_id) REFERENCES team_group (group_id) ON DELETE CASCADE
);


CREATE TABLE decritter_progress (
    id SERIAL PRIMARY KEY, -- Id incrementale
    progress_id INT NOT NULL, -- Foreign key verso la tabella progress
    progress_type TEXT NOT NULL CHECK(progress_type IN ('translator')), -- Tipo progresso sbloccato
    progress_code INT NOT NULL, -- Codice sbloccato
    CONSTRAINT fk_progress_decritter FOREIGN KEY (progress_id) REFERENCES progress (id) ON DELETE CASCADE,
    group_team_id INT NOT NULL, -- Id del group team di appartenenza
    CONSTRAINT fk_decritter_group FOREIGN KEY (group_team_id) REFERENCES team_group (group_id) ON DELETE CASCADE
);


CREATE TABLE detective_progress (
    id SERIAL PRIMARY KEY, -- Id incrementale
    progress_id INT NOT NULL, -- Foreign key verso la tabella progress
    progress_type TEXT NOT NULL CHECK(progress_type IN ('fascicoli')), -- Tipo progresso sbloccato
    progress_code INT NOT NULL, -- Codice sbloccato
    CONSTRAINT fk_progress_detective FOREIGN KEY (progress_id) REFERENCES progress (id) ON DELETE CASCADE,
    group_team_id INT NOT NULL, -- Id del group team di appartenenza
    CONSTRAINT fk_detective_group FOREIGN KEY (group_team_id) REFERENCES team_group (group_id) ON DELETE CASCADE
);


CREATE TABLE explorer_progress (
    id SERIAL PRIMARY KEY, -- Id incrementale
    progress_id INT NOT NULL, -- Foreign key verso la tabella progress
    progress_type TEXT NOT NULL CHECK(progress_type IN ('fascicoli')), -- Tipo progresso sbloccato
    progress_code INT NOT NULL, -- Codice sbloccato
    CONSTRAINT fk_progress_explorer FOREIGN KEY (progress_id) REFERENCES progress (id) ON DELETE CASCADE,
    group_team_id INT NOT NULL, -- Id del group team di appartenenza
    CONSTRAINT fk_explorer_group FOREIGN KEY (group_team_id) REFERENCES team_group (group_id) ON DELETE CASCADE
);



