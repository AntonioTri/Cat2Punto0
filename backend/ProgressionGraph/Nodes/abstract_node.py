from abc import ABC, abstractmethod
from enum import Enum
from backend.ProgressionGraph.Edges.edge import EdgeColor

"""
    La classe enumerazione Status conserva dei tipi da assegnare ai nodi

    NOT_DISCOVERED rappresenta un nodo non ancora scoperto
    DISCOVERED invece indica un nodo scoperto ma non risolto
    RESOLVED rappresenta un nodo che e' stato risolto

"""




"""
    La classe AbstractNode rappresenta l'astrazione concettuale di un nodo del Progression Graph.
    Vengono definite al suo interno operazioni base ai fini del funzionamento del grafo:

    - inserimento del padre
    - manipolazioni delle chiavi
    - inserimento degli status
    - manipolazione degli status
    - scoperta di nuovi nodi
    - operazioni sugli archi verdi ( atti alla operaione di discovery dilazionata)

"""


class AbstractNode(ABC):


    def __init__(self, key : int):
        pass
    
    """
        Il metodo set father serve ad indicare il padre di un nodo, facendone una reference
        Utilizzato solo nel caso in cui il padre abbia un arco uscente viola per soddisfare le proprietà
    """
    @abstractmethod
    def setFather(self, father: "AbstractNode" = None):
        pass

    @abstractmethod
    def addFather(self, father: "AbstractNode" = None, information = None):
        pass
    
    @abstractmethod
    def getFather(self) -> "AbstractNode":
        pass

    """ Metodo che setta la chiave del nodo """
    @abstractmethod
    def setKey(self, key : int):
        pass

    """ Metodo che restituisce la chiave del nodo """
    @abstractmethod
    def getKey(self) -> int:
        pass
    """ 
        Il metodo set status e' particolare, esegue operazioni di scoperte sui nodi viola collegati.
        Se ci sono archi viola in uscita e lo stato in ingresso e' RESOLVED i nodi viola in uscita vengono
        impostati come DISCOVERED

    """
    @abstractmethod
    def setNewStatus(self, status: "Status"):
        pass

    @abstractmethod
    def getStatus(self) -> "Status":
        pass
    
    """
        Questo metodo e' un casino.
        Sostanzialmente quando un arco verde del nodo viene aggiornato in RESOLVED avvengono tante operazioni:
        
        - Per prima cosa si segnala il nodo puntato dall'arco
        - Il nodo puntato raccoglie il segnale
        - Se il nodo puntato aveva nodi viola in ingresso si controlla che il nodo padre viola era stato risolto
            - Se era stato risolto si controlla che tutti gli archi verdi in ingresso siano stai risolti
                - Se tutti gli archi verdi in ingresso erano risolti allora il nodo puntato viene impostato come RESOLVED
                    e tutti i nodi viola in uscita vengono impostati come DISCOVERED, così come gli archi verdi in uscita
                - Se tra tutti gli archi verdi in ingresso ce n'e' uno non risolto allora nulla accade
        - Se invece il nodo non aveva archi viola in ingresso si controlla che tutti gli archi verdi in ingresso siano
          stati risolti, in caso positivo il nodo puntato non viene impostato come DISCOVERED

    """
    @abstractmethod
    def setGreenEdgeStatus(self, greenEdge, status: "Status"):
        pass

    @abstractmethod
    def addEdge(self, nodeToDiscover : "AbstractNode" = None, information = None):
        pass
    
    """ 
        La funzione signal node prende un nodo di input ed invia un segnale specifico in base ai casi,
        segnale elaborato internamente dal nodo ricevente.
    """
    @abstractmethod
    def signalNode(self, nodeToSignal: "AbstractNode" = None):
        pass
    """
        La funzione recieveSignal puo' prendere un segnale in ingresso ed elaborarlo sulla base
        del suo tipo, eseguendo operazioni variogate
    """
    @abstractmethod
    def recieveSignal(self, signal = None):
        pass
    
    @abstractmethod
    def areAllGreenEdgesResolved(self) -> bool:
        pass
        














