from db.db import database

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


