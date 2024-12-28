from db.db import database
from io import BytesIO
from reportlab.pdfgen import canvas

# Il Controller Team Pool serve a definire dei metodi per la creazione e la ricezione delle pool di team ed utenze
class ControllerTeamPool:

    # Questo metodo invece aggiunge un nuovo team
    @staticmethod
    def add_new_team(team_name:str = "some_new_team"):

        # Richiamo al metodo del database
        return database.create_team(team_name=team_name)
    

    # Questo metodo invece registra un nuovo utente nel database
    @staticmethod
    def register_new_user_to_team(username:str ="", password:str = "", role:str ="", team_id:int = 0):

        # Richiamo al metodo del database
        return database.register_new_user(username=username, password=password, role=role, team_id=team_id)
        
    # Questo metodo restituisce la lista di team disponibili
    @staticmethod
    def get_all_teams():

        # Otteniamo i team disponibili dal database
        avaiable_teams, status_code = database.get_all_teams()

        formatted_teams = []
        # Per ogni team definiamo un suo dizionario da rispedire al front end
        if status_code == 200:
            for team in avaiable_teams:
                formatted_teams.append({

                    "team_name": team[0],
                    "team_id": team[1]

                }) 

        # Ritorniamo i team formattati
        return formatted_teams, status_code
    
    # Questo metodo restituisce la lista di team group disponibili
    @staticmethod
    def get_all_team_group(team_id:int = 0):

         # Otteniamo i team group disponibili dal database
        avaiable_team_groups = database.get_all_team_group(team_id=team_id)

        formatted_team_groups = []
        # Per ogni team definiamo un suo dizionario da rispedire al front end
        for team in avaiable_team_groups:
            formatted_team_groups.append({

                "team_type": team[0],
                "team_group_id": team[1]

            }) 

        # Ritorniamo i team formattati
        return formatted_team_groups, 200
    

    # Questo metodo restituisce la lista di membri di un team specifico
    @staticmethod
    def get_all_team_members(team_id: int = 0):
        """
        Metodo per ottenere tutti i membri di uno specifico team
        """
        # Otteniamo i membri del team dal database
        team_members = database.get_all_team_members(team_id=team_id)

        # Se il risultato è un messaggio di errore, lo ritorniamo direttamente
        if isinstance(team_members, dict) and "msg" in team_members:
            return team_members, 404

        # Formattazione dei membri del team
        formatted_team_members = []
        for member in team_members:
            formatted_team_members.append({
                "name": member[0],
                "id": member[1],
                "password": member[2],
                "role": member[3],
                "team_name": member[4]
            })

        # Ritorniamo i membri formattati
        return formatted_team_members, 200



    @staticmethod
    def generate_team_pdf(team_id:int = 0):

        # Estraiamo prima tutti i membri del team
        users, status_code = ControllerTeamPool.get_all_team_members(team_id=team_id)

        # Se lo status code non è corretto allora viene segnalato
        if status_code != 200 or users == []:
            return "Errore durante la ricerca degli utenti.", 200
        
        # in caso contrario estraiamo i dati che ci interessano
        team_name = users[0]["team_name"]

        # Creazione di un buffer in memoria
        pdf_buffer = BytesIO()
        
        # Creazione del PDF
        c = canvas.Canvas(pdf_buffer)
        line_height = 600

        # Setta il margine minimo sulla pagina
        PAGE_MARGIN = 50
        LINE_HEIGHT_STEP = 13
        SEPARATOR_HEIGHT = 15
        INITIAL_LINE_HEIGHT = 750

        c.setFont("Courier-Bold", 12)
        c.drawString(50, INITIAL_LINE_HEIGHT, f"Team group: {team_name}")
        line_height = INITIAL_LINE_HEIGHT - 20
        c.drawString(50, line_height, "-" * 60)
        line_height -= SEPARATOR_HEIGHT

        c.setFont("Courier", 10)

        # Itera attraverso la lista degli utenti
        for user in users:
            username = user["name"]
            password = user["password"]
            role = user["role"]
            
            # Controlla se c'è spazio sufficiente per scrivere, altrimenti crea una nuova pagina
            if line_height <= PAGE_MARGIN:
                # Crea una nuova pagina
                c.showPage() 
                c.setFont("Helvetica-Bold", 12)
                c.drawString(50, INITIAL_LINE_HEIGHT, f"Team group: {team_name}")
                line_height = INITIAL_LINE_HEIGHT - 20
                c.drawString(50, line_height, "-" * 60)
                line_height -= SEPARATOR_HEIGHT
                c.setFont("Helvetica", 10)
            
            # Scrive i dettagli dell'utente
            c.drawString(50, line_height, f"USERNAME =>   {username}")
            line_height -= LINE_HEIGHT_STEP
            c.drawString(50, line_height, f"PASSWORD =>   {password}")
            line_height -= LINE_HEIGHT_STEP
            c.drawString(50, line_height, f"ROLE     =>   {role}")
            line_height -= SEPARATOR_HEIGHT
            
            # Aggiunge una linea separatrice
            c.drawString(50, line_height, "-" * 60)
            line_height -= LINE_HEIGHT_STEP

        # Salva e chiude il PDF
        c.save()

        # Riavvolgi il buffer
        pdf_buffer.seek(0)

        # Ritorniamo il pdf buffer alla fine di tutto
        return pdf_buffer, 200
