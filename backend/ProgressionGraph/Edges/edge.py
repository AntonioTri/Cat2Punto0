from enum import Enum
from ProgressionGraph.Riddles.riddles import Riddle

class EdgeColor(Enum):
    PURPLE = 4
    GREEN = 5

class EdgeStatus(Enum):
    RESOLVED = 9
    DISCOVERED = 10
    NOT_DISCOVERED = 11

class Signals(Enum):
    GREEN_EDGE_RESOLVED = 7
    DISCOVER_PURPLE_NODES = 8

"""
    La classe edge definisce l'arco che collega due nodi, ad un edge e' associato un colore sulla 
    base delle informazioni che porta, se l'informazione che porta e' nulla allora e' un arco viola, altrimenti e'
    un arco verde.
    Gli archi verdi sono piu' speciali di quelli viola, posseggono proprieta' uniche come quella di segnalare
    ai nodi uscenti quando vengono risolti

"""


class PurpleEdge:

    def __init__(self, startingNode = None, endingNode = None):

        self.color : EdgeColor = EdgeColor.PURPLE
        self.status : EdgeStatus = EdgeStatus.NOT_DISCOVERED
        
        self.__startingNode = startingNode
        self.__endingNode = endingNode


    def getStatus(self) -> EdgeStatus:
        return self.status
    

    def setStatus(self, newStatus : EdgeStatus = EdgeStatus.NOT_DISCOVERED):
        """ 
            Il metodo set status imposta un nuovo stato all'arco viola
        """
        self.status = newStatus


    def signalEndingNode(self, signal = None):
        self.__endingNode.recieveSignal(signal)


    def getColor(self) -> EdgeColor:
        """ Metodo per ritornare il colore dell'arco """
        return self.color
    
    # Setter e getter per i nodi
    def setStartingNode(self, startingNode = None):
        self.__startingNode = startingNode

    def getStartingNode(self):
        return self.__startingNode
    
    def setEndingNode(self, endingNode = None):
        self.__endingNode = endingNode

    def getEndingNode(self):
        return self.__endingNode
    


class GreenEdge(PurpleEdge):
    """ 
        La classe Green edge eredita da purple edge ma aggiunge una dinamica aggiuntiva, l'enigma.
        Sostanzialmente se l'enigma viene risolto allora viene inviata una signal al nodo uscente,
        quando tutti gli archi verdi in entrata in un nodo sono risolti allora il nodo viene scoperto 
    
    """

    def __init__(self, startingNode=None, endingNode=None, riddle : Riddle = None):
        super().__init__(startingNode, endingNode)
        self.riddle = riddle
        self.color = EdgeColor.GREEN


    def checkRiddle(self, solution : str = "") -> bool:
        """
            Questo metodo controlla se la soluzione all'enigma memorizzato sia corretta.
            In tal caso viene impostato lo stato come RESOLVED e di conseguenza il nodo
            puntato viene segnalato 
        """
        if self.riddle.isSolution(solution):
            self.setStatus(EdgeStatus.RESOLVED)
            return True
        
        return False


    def setStatus(self, newStatus : EdgeStatus = EdgeStatus.NOT_DISCOVERED):
        """ 
            Il metodo set status segnala il nodo uscente se lo stato era resolved.
            Mecanismo che serve a segnalare al nodo un possibile sblocco
        """
        self.status = newStatus
        if newStatus == EdgeStatus.RESOLVED:
            self.signalEndingNode(Signals.GREEN_EDGE_RESOLVED)
        elif newStatus == EdgeStatus.DISCOVERED:
            print(f"\n🔓 Arco verde da {self.getStartingNode().getKey()} a {self.getEndingNode().getKey()} scoperto.")
