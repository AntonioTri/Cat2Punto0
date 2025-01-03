from db.db import database

class ControllerManageProgress:

    @staticmethod
    def get_team_progress(team_id:int = 0):
        """
        Quando invocato questo metodo restituisce tutti i pogressi di un team
        """

        # Istanza della stessa classe
        controller = ControllerManageProgress()
        # Estrazione di tutti i dati
        team_signals, sc1 = controller.get_team_signals(team_id=team_id)
        commander_progress, sc2 = controller.get_team_group_progress(team_id=team_id, role="COMANDANTE")
        decritter_progress, sc3 = controller.get_team_group_progress(team_id=team_id, role="DECRITTATORE")
        detective_progress, sc4 = controller.get_team_group_progress(team_id=team_id, role="DETECTIVE")
        explorer_progress, sc5 = controller.get_team_group_progress(team_id=team_id, role="ESPLORATORE")

        # Se almeno una estrazione non ha funzionato viene segnalato
        if sc1 != 200 or sc2 != 200 or sc3 != 200 or sc4 != 200 or sc5 != 200:
            return {"msg" : "Errore non specificato durante la ricezione dei progressi."}, 500
        
        # Altrimenti viene generato un dizionario dei valori da ritornare
        total_progresses = {
            "signals" : team_signals,
            "commander_progresses" : commander_progress,
            "decritter_progresses" : decritter_progress,
            "detective_progresses" : detective_progress,
            "explorer_progresses"  : explorer_progress
        }

        # Ritorniamo i dati
        return {"team_progress" : total_progresses}, 200


    @staticmethod
    def get_team_signals(team_id: int = 0):
        """
        Metodo per ottenere tutti i segnali associati a un team specifico.
        """
        signals, status_code = database.get_all_signals_by_team_id(team_id=team_id)

        if status_code != 200:
            return {"msg": "Errore nel recupero dei segnali del team."}, status_code

        formatted_signals = {"signals": [signal for signal in signals]}

        return formatted_signals, status_code

        
    @staticmethod
    def add_team_signals(team_id: int = 0, signal_unlocked: str = "NONE"):
        """
        Metodo per aggiungere un segnale a un team specifico.
        """
        result, status_code = database.add_signal_to_team(team_id=team_id, signal=signal_unlocked)

        if status_code != 201:
            return {"msg": "Errore durante l'aggiunta del segnale."}, status_code

        return {"msg": "Segnale aggiunto con successo.", "signal_id": result.get("signal_id")}, status_code

    
    @staticmethod
    def get_team_group_progress(team_id: int = 0, role: str = "COMANDANTE"):
        """
        Metodo per ottenere i progressi di un ruolo specifico in un team.
        """
        progresses, status_code = database.get_role_progress_by_team_id(team_id=team_id, role=role)

        if status_code != 200:
            return {"msg": "Errore nel recupero dei progressi per il ruolo specificato."}, status_code

        formatted_progress = {"progress_done": [progress for progress in progresses]}

        return formatted_progress, status_code


    @staticmethod
    def add_team_group_progress(team_id: int = 0, role: str = "COMANDANTE", unlocked_progress: str = "NONE"):
        """
        Metodo per aggiungere un progresso a un ruolo specifico in un team.
        """
        result, status_code = database.add_role_progress(team_id=team_id, role=role, progress_done=unlocked_progress)

        if status_code != 201:
            return {"msg": "Errore durante l'aggiunta del progresso."}, status_code

        return {"msg": "Progresso aggiunto con successo.", "progress_id": result.get("progress_id")}, status_code


