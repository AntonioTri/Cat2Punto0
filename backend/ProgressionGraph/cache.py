# Questa unica istanza rappresente la cache della flask app
# per conservare i progressi del team, lasciata globalmente accessibile
# offre una reference globale per estrarre la reference degli attuali progressi

from ProgressionGraph.prograssion_graph import ProgressionGraph

cached_teams_graphs : dict[int, ProgressionGraph] = {}