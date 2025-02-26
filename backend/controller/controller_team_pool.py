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
    
    # Questo metodo restituisce la lista di membri di un team specifico con un ruolo specifico
    @staticmethod
    def get_all_team_group_socket(team_id: int = 0, role: str = "COMANDANTE"):
        """
        Metodo per ottenere tutti i membri di un ruolo di uno specifico team
        """
        # Otteniamo i membri del team dal database
        team_members = database.get_all_team_members(team_id=team_id)

        # Se il risultato è un messaggio di errore, lo ritorniamo direttamente
        if isinstance(team_members, dict) and "msg" in team_members:
            return team_members, 404

        # Formattazione dei membri del team
        formatted_team_members = [{
                "name": member[0],
                "id": member[1],
                "socket" : member[5]
            } for member in team_members if member[3] == role]
        

        # Ritorniamo i membri formattati
        return formatted_team_members, 200



    @staticmethod
    def generate_team_pdf(team_id: int = 0):

        # Estraiamo prima tutti i membri del team
        users, status_code = ControllerTeamPool.get_all_team_members(team_id=team_id)

        # Se lo status code non è corretto o non ci sono utenti
        if status_code != 200 or not users:
            return b"Errore durante la ricerca degli utenti.", 404

        # In caso contrario estraiamo i dati che ci interessano
        team_name = users[0].get("team_name", "Unknown Team")

        # Creazione di un buffer in memoria
        pdf_buffer = BytesIO()
        c = canvas.Canvas(pdf_buffer)
        
        # Creazione del PDF
        line_height = 750
        PAGE_MARGIN = 50
        LINE_HEIGHT_STEP = 13
        SEPARATOR_HEIGHT = 15

        c.setFont("Courier-Bold", 12)
        c.drawString(50, line_height, f"Team group: {team_name}")
        line_height -= 20
        c.drawString(50, line_height, "-" * 60)
        line_height -= SEPARATOR_HEIGHT

        c.setFont("Courier", 10)
        for user in users:
            username = user.get("name", "N/A")
            password = user.get("password", "N/A")
            role = user.get("role", "N/A")

            if line_height <= PAGE_MARGIN:
                c.showPage()
                c.setFont("Courier-Bold", 12)
                c.drawString(50, 750, f"Team group: {team_name}")
                line_height = 730
                c.drawString(50, line_height, "-" * 60)
                line_height -= SEPARATOR_HEIGHT
                c.setFont("Courier", 10)

            c.drawString(50, line_height, f"USERNAME =>   {username}")
            line_height -= LINE_HEIGHT_STEP
            c.drawString(50, line_height, f"PASSWORD =>   {password}")
            line_height -= LINE_HEIGHT_STEP
            c.drawString(50, line_height, f"ROLE     =>   {role}")
            line_height -= SEPARATOR_HEIGHT
            c.drawString(50, line_height, "-" * 60)
            line_height -= LINE_HEIGHT_STEP

        c.save()
        pdf_buffer.seek(0)
        return pdf_buffer.read(), 200
