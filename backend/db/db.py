# Importing della libreria di Postgre
from flask_jwt_extended import create_access_token
import psycopg2
import logging
import time

logger = logging.getLogger(__name__)

class PostgresDB():

    def __init__(self) -> None:
                                # Parametri di connessione al database
        
        host        =   'database'       # Link per la connessione, nel mio caso database perchè è il nome del servizio locale nel docker
        port        =   5432             # Porta mappata nel docker-compose (viene usata la porta 5432 perchè è quella di default)
        database    =   'cat_database'   # Nome del database
        user        =   'antoniotrid'    # Nome proprietario
        password    =   'napibrfan'      # Password del proprietario
        
        # I docker sono desincronizzati e questo ciclo while mi permette di ritentare
        # La connessione al db fin quando non è avvenuta con successo
        
        # Inizialmente la connessione e' uguale a Non
        self.connection = None
        # fin quando la connessione e' none, viene rifatto un tentativo di connessione
        while self.connection is None:
            try_number = 0
            logger.info(f"Tentativo di connessione numero: {try_number}")

            try:
                # Connessione al db
                self.connection = psycopg2.connect(host=host, port=port, database=database, user=user, password=password)
                logger.info("Connesione al db riuscita!")
            
            # L'exception segnala che la connessione non è avvenuta e dopo l'attesa di un secondo riprova a connettersi
            except Exception as e:
                logger.info(f"Qualcosa è andato storto durante la connesione. Errore:{e}")
                try_number += 1
                time.sleep(1)


    # Metodo che quando invocato crea un team con un nome
    def create_team(self, team_name: str):
        """
        Metodo che quando invocato crea un team con un nome
        """
        # Reference al cursore
        cursor = self.connection.cursor()

        try:
            # Esecuzione della query per inserire un nuovo team
            cursor.execute("INSERT INTO teams (team_name) VALUES (%s) RETURNING team_id", (team_name,))
            team_id = cursor.fetchone()[0]

            # Richiamo alla funzione per agiungere i sottogruppi al team
            _, sc1 = self.create_team_group(team_id=team_id, team_type="COMANDANTE")
            _, sc2 = self.create_team_group(team_id=team_id, team_type="DECRITTATORE")
            _, sc3 = self.create_team_group(team_id=team_id, team_type="DETECTIVE")
            _, sc4 = self.create_team_group(team_id=team_id, team_type="ESPLORATORE")

            # Se uno dei create team group fallisce viene segnalato
            if sc1 != 201 or sc2 != 201 or sc3 != 201 or sc4 != 201:
                self.connection.rollback()
                return {"msg": f"Errore durante la creazione dei team group"}, 500

            # Commit delle modifiche
            self.connection.commit()

            # Restituzione dell'ID del team creato
            return {"msg": f"Team '{team_name}' creato con successo"}, 201

        except Exception as e:
            # Rollback in caso di errore
            self.connection.rollback()
            
            # Se il nome del team già esisteva viene segnalato
            if "duplicate key value" in str(e):
                return {"error": "Questo nome utente già esiste!"}, 409
            return {"msg": f"Errore durante la creazione del team: {e}"}, 500

        finally:
            cursor.close()


    # Metodo che permette di creare un nuovo team group associato ad un team esistente
    def create_team_group(self, team_id: int, team_type: str):
        """
        Metodo che permette di creare un nuovo team group associato ad un team esistente
        """
        # Reference al cursore
        cursor = self.connection.cursor()

        try:
            # Check per controllare che il team esista
            if not self.team_exists(team_id):
                return {"msg": f"Il team con id {team_id} NON esiste"}, 404

            # Esecuzione della query per inserire un nuovo team group
            cursor.execute("INSERT INTO team_group (team_id, team_type) VALUES (%s, %s)", (team_id, team_type))
            # Commit delle modifiche
            self.connection.commit()

            # Restituzione dell'ID del team group creato
            return {"msg": f"Team group '{team_type}' per il team {team_id} creato con successo"}, 201

        except Exception as e:
            # Rollback in caso di errore
            self.connection.rollback()
            return {"msg": f"Errore durante la creazione del team group: {e}"}, 500

        finally:
            cursor.close()


    # Metodo per ottenere tutti i team disponibili
    def get_all_teams(self):
        """
        Metodo per ottenere tutti i team disponibili
        
        """
        # reference al cursore
        cursor = self.connection.cursor()

        try:
            # Esecuzione della query
            cursor.execute("SELECT team_name, team_id FROM teams")
            # Estrazione dei risultati
            teams = cursor.fetchall()
            # Se il risutato è none viene comunque ritornato un array vuoto
            return teams if isinstance(teams, list) else [], 200

        # L'eccezione ritorna un messaggio di errore
        except Exception as e:
            return {"msg": "Errore durante la ricerca dei team nel database"}, 500
        
        finally:
            cursor.close()
        

    # Metodo per ottenere tutti i team disponibili
    def get_all_team_group(self, team_id:int):
        """
        Metodo per ottenere tutti i team disponibili
        """
        # reference al cursore
        cursor = self.connection.cursor()

        try:
            # Check per controllare che il team esista
            if not self.team_exists(team_id):
                return {"msg": f"Il team con id {team_id} NON esiste"}, 404
            
            # Esecuzione della query
            cursor.execute(f"SELECT team_type, team_id FROM team_group WHERE team_id = {team_id}")
            # Estrazione dei risultati
            team_group = cursor.fetchall()
            # Se il risutato è none viene comunque ritornato un array vuoto
            return team_group if isinstance(team_group, list) else []

        # L'eccezione ritorna un messaggio di errore
        except Exception as e:
            return {"msg": "Errore durante la ricerca dei team group nel database"}
        
        finally:
            cursor.close()


    # Metodo per ottenere tutti gli utenti di uno specifico team
    def get_all_team_members(self, team_id: int):
        """
        Metodo per ottenere tutti gli utenti di uno specifico team
        """
        # reference al cursore
        cursor = self.connection.cursor()

        try:
            # Check per controllare che il team esista
            if not self.team_exists(team_id):
                return {"msg": f"Il team con id {team_id} NON esiste"}, 404
            
            # Esecuzione della query
            cursor.execute("SELECT tm.name AS member_name, \
                            tm.id_personale AS member_id, \
                            tm.password AS member_password, \
                            tm.role AS member_role, \
                            t.team_name AS team_name \
                            FROM team_member tm JOIN team_group tg ON tm.group_id = tg.group_id \
                            JOIN teams t ON tg.team_id = t.team_id WHERE t.team_id = %s", (team_id,))
            
            # Estrazione dei risultati
            team_members = cursor.fetchall()
            # Se il risutato è none viene comunque ritornato un array vuoto
            return team_members if isinstance(team_members, list) else []

        # L'eccezione ritorna un messaggio di errore
        except Exception as e:
            return {"msg": f"Errore durante la ricerca dei team members con team id = {team_id}, Error: {e}"}, 500
        
        finally:
            cursor.close()


    # Metodo per vedere se il team scelto esiste
    def team_exists(self, team_id: int):
        """
        Metodo per verificare l'esistenza di un team con id specifico
        """
        # Reference al cursore
        cursor = self.connection.cursor()

        try:
            # Esecuzione della query
            cursor.execute("SELECT COUNT(*) FROM teams WHERE team_id = %s", (team_id,))
            # Estrazione del risultato
            result = cursor.fetchall()

            # Se il conteggio è maggiore di 0, il team esiste
            return  len(result) > 0

        # Gestione degli errori con un messaggio
        except Exception as e:
            return {"msg": f"Errore durante il controllo dell'esistenza del team: {e}"}

        # Chiusura del cursore (opzionale se si usa context manager)
        finally:
            cursor.close()



    def register_new_user(self, username: str = "some_user", password: str = "some_user_password", role: str = "COMANDANTI", team_id: int = 0):
        """
        Metodo per registrare un nuovo utente nel sistema
        I ROLE vanno mandati al plurale
        """
        # Reference al cursore
        cursor = self.connection.cursor()

        try:
            # Estraiamo l'id tel team group di appartenenza
            cursor.execute("SELECT group_id FROM team_group WHERE team_id = %s AND team_type = %s", (team_id, role))
            group_row = cursor.fetchone()

            # Controllo se la query ha restituito un risultato
            if group_row is None:
                return {"error": f"Il team ID {team_id} con il ruolo {role} non esiste."}, 404

            # Estrazione del group_id dalla riga
            group_id = group_row[0]

            # Inserimento del nuovo utente
            cursor.execute("INSERT INTO team_member (name, password, role, group_id) VALUES (%s, %s, %s, %s)", 
                        (username, password, role, group_id))

            # Commit delle modifiche
            self.connection.commit()
            return {"msg": "Utente registrato con successo"}, 200

        except Exception as e:
            # Rollback della transazione in caso di errore
            self.connection.rollback()

            # Gestione di errori specifici come duplicati
            if "duplicate key value" in str(e):
                return {"error": "Questo nome utente già esiste!"}, 409

            # Ritorno di un errore generico per altri casi
            return {"error": f"Qualcosa è andato storto. Errore: {e}"}, 500

        finally:
            cursor.close()




    # Metodo per ottenere un utente o un amministratore
    def get_user(self, username: str = "", password: str = ""):
        cursor = self.connection.cursor()

        # Controlla prima tra gli amministratori
        admin_query = "SELECT user_password, role FROM admin WHERE username = %s"
        try:
            cursor.execute(admin_query, (username,))
            result = cursor.fetchone()
            if result:
                stored_password, role = result
                if stored_password != password:
                    cursor.close()
                    return None, 401
                return {"username": username, "role": role, "is_admin": True}, 200
            
            #TODO: Fare in modo che gli utenti non siano ambigui sula base di pass ed email
            # Controlla tra gli utenti normali
            user_query = "SELECT password, role, id_personale FROM team_member WHERE name = %s"
            cursor.execute(user_query, (username,))
            result = cursor.fetchone()
            if not result:
                cursor.close()
                return None, 404

            stored_password, role, id_personale = result
            if stored_password != password:
                cursor.close()
                return None, 401

            return {"username": username, "role": role, "personal_id": id_personale, "is_admin": False}, 200

        except Exception as e:
            cursor.close()
            return {"error": f"Errore durante l'accesso: {e}"}, 500



    # Questo metodo aggiorna la socket relativa a un utente
    def update_socket_id(self, user_id: int, socket_id: str):
        cursor = self.connection.cursor()

        try:
            # Aggiorna il socket_id
            cursor.execute("UPDATE team_member SET socket_id = %s WHERE id_personale = %s", (socket_id, user_id))
            self.connection.commit()
            return {"msg": f"Socket ID aggiornato per l'utente con ID {user_id}"}, 200

        except Exception as e:
            # Gestione degli errori
            self.connection.rollback()
            print(f"Errore durante l'aggiornamento del socket ID per l'utente {user_id}: {e}")
            return {"error": f"Errore durante l'aggiornamento del socket ID: {e}"}, 500

        finally:
            cursor.close()


    # Metodo per ottenere tutte le socket id dei membri di uno stesso gruppo di un utente
    def get_socket_ids_by_member_id(self, user_id: int):
        """
        Metodo per ottenere tutte le socket_id dei membri che fanno parte dello stesso team_group 
        partendo dall'id_personale di un membro.
        """
        cursor = self.connection.cursor()

        try:
            # Esecuzione della query
            cursor.execute("""
                SELECT tm.socket_id
                FROM team_member tm
                JOIN team_group tg ON tm.group_id = tg.group_id
                WHERE tm.group_id = (
                    SELECT group_id 
                    FROM team_member 
                    WHERE id_personale = %s
                )
                AND tm.socket_id IS NOT NULL
                AND tm.id_personale != %s;
            """, (user_id, user_id))

            # Estrazione dei risultati
            socket_ids = cursor.fetchall()

            # Restituisci un elenco di socket_id
            return [row[0] for row in socket_ids], 200

        except Exception as e:
            return {"error": f"Errore durante la ricerca delle socket_id: {e}"}, 500

        finally:
            cursor.close()


    # Metodo che restituisce tutte le socket id del team
    def get_all_team_socket_ids(self, member_id: int):
        """
        Metodo per ottenere tutte le socket_id dei membri del team generale
        escludendo la propria socket_id partendo dall'id_personale.
        """
        cursor = self.connection.cursor()

        try:
            # Esecuzione della query
            cursor.execute("""
                SELECT tm.socket_id
                FROM team_member tm
                JOIN team_group tg ON tm.group_id = tg.group_id
                JOIN teams t ON tg.team_id = t.team_id
                WHERE tg.team_id = (
                    SELECT tg.team_id
                    FROM team_member tm
                    JOIN team_group tg ON tm.group_id = tg.group_id
                    WHERE tm.id_personale = %s
                )
                AND tm.socket_id IS NOT NULL
                AND tm.id_personale != %s;
            """, (member_id, member_id))

            # Estrazione dei risultati
            socket_ids = cursor.fetchall()

            if not socket_ids:
                return [], 200  # Nessun risultato, restituisci una lista vuota

            # Restituisci un elenco di socket_id
            return [row[0] for row in socket_ids], 200

        except Exception as e:
            print(f"Errore durante la ricerca delle socket_id per il membro {member_id}: {e}")
            return {"error": f"Errore durante la ricerca delle socket_id: {e}"}, 500

        finally:
            cursor.close()
















    # Questo metodo chiude la connessione al database quando questa non è più necessaria
    def close(self):
        """ Metodo per chiudere la connessione al database """
        if self.connection:
            self.connection.close()
            logger.info("Connessione al db chiusa.")
   


    # 



























database = PostgresDB()