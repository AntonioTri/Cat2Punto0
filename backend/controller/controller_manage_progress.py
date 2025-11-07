from db.db import database
from ProgressionGraph.cache import cached_teams_graphs

class ControllerManageProgress:

    
    @staticmethod
    def check_if_answer_is_correct(answer : str = "", team_id : int = None, socket_to_signal : str = None):
        """Metodo che controlla se nell'attuale grafo di progressione vi sia la risposta inviata."""

        # Estrazione della reference del grafo dalla cache
        team_graph = cached_teams_graphs[team_id]
        solved, yetSolved = team_graph.process_answer(answer=answer, team_to_signal=team_id, socket_to_signal=socket_to_signal)

        # Se la risposta era positiva allora viene segnalato
        if not solved and yetSolved:
            return {"msg" : "Il puzzle è già stato risolto."}, 200
        elif solved and yetSolved:
            return {"msg" : "Nuovo puzzle risolto."}, 201
        else:
            return {"mgs" : "Risposta errata!"}, 400