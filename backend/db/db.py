# Importing della libreria di Postgre
from flask_jwt_extended import create_access_token
import psycopg2
import logging
import time

logger = logging.getLogger(__name__)

#TODO: Definizione della classe di connessione
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



    def register_new_user(self, username: str = "", password: str = "", role: str = ""):
        # Reference al cursore
        cursor = self.connection.cursor()

        # Inseriamo il nuovo utente
        try:
            # Usare i placeholder (%s) per passare i valori come parametri
            cursor.execute("INSERT INTO users (username, user_password, role) VALUES (%s, %s, %s)", (username, password, role))
            # Commit delle modifiche
            self.connection.commit()  
            cursor.close()
            return {"msg": "Utente registrato con successo"}, 200
        
        # si catturano le eccezioni specifiche
        except Exception as e:

            # Rollback della transazione in caso di errore
            self.connection.rollback()
            cursor.close()

            # Se il nome è già stato usato viene segnalato 409 (Conflict)
            if "duplicate key value" in str(e):
                return {"error": f"Questo nome utente già esiste!"}, 409
            
            # Altrimenti viene segnalato un errore del server
            return {"error": f"Qualcosa è andato storto. Errore: {e}"}, 500




    # Metodo per ottenere un utente sulla base di nome e password
    def get_user(self, username: str = "", password: str = ""):

        # Reference al cursore
        cursor = self.connection.cursor()

        # La logica applicata e' la seguente:
        # viene fatta una queri sulla password matchando l'utente, se fallisce l'utente non esiste e viene segnalato
        # Se invece viene trovata la password relativa al'utente selezionato, viene fatto un match per vedere se la
        # password e' quella corretta

        query = "SELECT user_password, role FROM users WHERE username = %s"

        try:
            cursor.execute(query, (username,))
            result = cursor.fetchone()

            # Se l'array di risposte è vuoto viene segnalato che l'utente non esiste (Not Found)
            if result is None:
                cursor.close()
                return None, 404
            
            # Altrimenti l'utente è stato trovato e la password viene salvata localmente per effettuare i controlli
            # Password memorizzata
            stored_password = result[0]
            
            # Se la password è sbagliata viene segnalato (401 Unautorized)
            if stored_password != password:
                cursor.close()
                return None, 401
            
            # Se la password è corretta viene estratto anche il ruolo
            role = result[1]
            cursor.close()

            # Ritorno di un dizionario contenente i valori trovati
            return {"username" : username, "role" : role}, 200

        # Per qualsiasi problema viene segnalato che il server ha generato un errore non ben definito
        except Exception as e:
            cursor.close()
            return e, 500


    # questo metodo chiude la connessione al database quando questa non è più necessaria
    def close(self):
        """ Metodo per chiudere la connessione al database """
        if self.connection:
            self.connection.close()
            logger.info("Connessione al db chiusa.")
   

database = PostgresDB()