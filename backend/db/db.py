# Importing della libreria di Postgre
import psycopg2
import logging

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
        
        try:
            # Connessione al db
            self.connection = psycopg2.connect(host=host, port=port, database=database, user=user, password=password)
            logger.info("Connesione al db riuscita!")
        except Exception as e:
            logger.info(f"Qualcosa è andato storto durante la connesione. Errore:{e}")



    def register_new_user(self, username: str = "", password: str = ""):
        # Reference al cursore
        cursor = self.connection.cursor()

        # Inseriamo il nuovo utente
        try:
            # Usare i placeholder (%s) per passare i valori come parametri
            cursor.execute("INSERT INTO users (username, user_password) VALUES (%s, %s)", (username, password))
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




    # Metodo per effettuare il login
    def login_user(self, username: str = "", password: str = "") -> bool:

        # Reference al cursore
        cursor = self.connection.cursor()

        # La logica applicata e' la seguente:
        # viene fatta una queri sulla password matchando l'utente, se fallisce l'utente non esiste e viene segnalato
        # Se invece viene trovata la password relativa al'utente selezionato, viene fatto un match per vedere se la
        # password e' quella corretta

        query = "SELECT user_password FROM users WHERE username = %s"

        try:
            cursor.execute(query, (username,))
            result = cursor.fetchone()

            # Se l'array di risposte è vuoto viene segnalato che l'utente non esiste (Not Found)
            if result is None:
                cursor.close()
                return {"msg": f"Username errato!"}, 404
            
            # Altrimenti l'utente è stato trovato e la password viene salvata localmente per effettuare i controlli
            else:
                # Password memorizzata
                stored_password = result[0]
                
                # Se la password è sbagliata viene segnalato (401 Unautorized)
                if stored_password != password:
                    cursor.close()
                    return {"msg": "La password non è corretta!"}, 401 
                
                # Se la password è corretta viene ritornato il codice di cuccesso ed effettuato il login dal foront end
                cursor.close()
                return {"msg" : "Login effettuato con successo!"}, 200

        # Per qualisasi problema viene segnalato che il server ha generato un errore non ben definito
        except Exception as e:
            cursor.close()
            return {"error": f"Nome utente errato:\n {e} \n"}, 500

    # questo metodo chiude la connessione al database quando questa non è più necessaria
    def close(self):
        """ Metodo per chiudere la connessione al database """
        if self.connection:
            self.connection.close()
            logger.info("Connessione al db chiusa.")
   

# Definizione dell'istanza
database = PostgresDB()