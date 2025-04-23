from ProgressionGraph.Edges.edge import PurpleEdge, GreenEdge, EdgeStatus, Signals, Riddle
#from backend.utils.info_logger import getFileLogger
from enum import Enum
#logger = getFileLogger(__name__)


class Status(Enum):
    NOT_DISCOVERED = 1
    DISCOVERED = 2
    RESOLVED = 3



"""
    La classe Node implementa le funzionalità della classe astratta AbstractNode
"""

class Node():


    def __init__(self, key : int, riddle = None):
        self.key : int = key

        # Dichiarazione dell'unico padre, quello con arco uscente viola
        self.purpleFather : Node = None
        self.purpleFatherEdge : PurpleEdge = None
        # Dichiarazione della lista di padri e della lista di archi
        self.greenFathers : list[Node] = []
        self.greenFathersEdges : list[GreenEdge] = []
        
        # Dichiarazione della lista di figli viola e
        # dichiarazione della lista di figli verdi e archi
        self.purpleChildrens : list[Node] =[]
        self.greenChildrens : list[Node] =[]
        self.childrenPurpleEdges : list[PurpleEdge] =[]
        self.childrenGreenEdges : list[GreenEdge] =[]

        # Dichiarazione dello stato come non scoperto
        self.status : Status = Status.NOT_DISCOVERED
        # Dichiarazione dell'enigma associato
        self.riddle : Riddle = riddle
        # Numero di archi verdi in ingresso
        self.greenEdgesNumber : int = 0
        # Numero di archi verdi in ingresso risolti
        self.solvedGreenEdges : int = 0

    def print_info(self):
        print("\n\n")
        print(f"Node Key: {self.key}")
        print(f"Status: {self.status}")
        print(f"Riddle: {self.riddle}")
        print(f"Purple Father: {self.purpleFather.key if self.purpleFather else None}")
        print(f"Purple Father Edge: {self.purpleFatherEdge}")
        print(f"Green Fathers: {[node.key for node in self.greenFathers]}")
        print(f"Green Fathers Edges: {self.greenFathersEdges}")
        print(f"Purple Children: {[node.key for node in self.purpleChildrens]}")
        print(f"Green Children keys: {[node.key for node in self.greenChildrens]}")
        print(f"Children Purple Edges: {[x.getEndingNode().getKey() for x in self.childrenPurpleEdges]}")
        print(f"Children Green Edges: {[x.getEndingNode().getKey() for x in self.childrenGreenEdges]}")
        print(f"Green Edges Number: {self.greenEdgesNumber}")
        print(f"Solved Green Edges: {self.solvedGreenEdges}")


    def setPurpleFather(self,  father: "Node" = None):
        """ Questo metodo dovrebbe essere usato solo per aggiungere un padre viola. """
        
        # Controlli di sicurezza
        if self.greenEdgesNumber > 0:
            #logger.info(f"Stai provando ad inserire ad un nodo con padri verdi un padre viola!. Chiave viola : {father.getKey()}. Chiave verde/i: {[edge.getStartingNode().getKey() for edge in self.greenFathersEdges]}")
            raise ValueError("A node with Green father/s cannot have a purple father")
        
        # Superati i controlli vengono fatte le assegnaizoni
        self.purpleFather = father
        self.purpleFatherEdge = PurpleEdge(self.purpleFather, self)


    def addGreenFather(self, father: "Node" = None, riddle = None):
        """ Questo metodo dovrebbe essere usato solo per aggiungere un nuovo padre verde."""

        # Controlli di sicurezza
        if self.purpleFather is not None:
            #logger.info(f"Stai provando ad inserire ad un nodo con padre viola un padre verde!. Chiave viola : {father.getKey()}. Chiave verde/i: {[edge.getStartingNode().getKey() for edge in self.greenFathersEdges]}")
            raise ValueError("A node with Green father/s cannot have a purple father")
        
        # Superati i controlli vengono fatte le assegnaizoni
        self.greenFathers.append(father)
        self.greenFathersEdges.append(GreenEdge(father, self, riddle))
        # Il numero di archi verdi in ingresso viene incrementato
        self.greenEdgesNumber += 1
    

    def addPurpleChildren(self, children : "Node" = None):
        """ Questo metodo aggiunge alla lista di nodi viola il nodo in ingresso."""
        
        try:
            # Quest ometodo è capace di generare un errore se al nodo sono già stati assegnati padri verdi
            children.setPurpleFather(self)
            # Viene aggiunto il figlio se non sono stati lanciati errori
            self.purpleChildrens.append(children)
            self.childrenPurpleEdges.append(PurpleEdge(self, children))

        # Cattura dell'eccezione
        except Exception as e:
            #logger.info(e)
            print(e)


    def addGreenChildren(self, children : "Node" = None, riddle = None):
        """ Questo metodo aggiunge alla lista di nodi viola il nodo in ingresso."""
        
        try:
            # Quest ometodo è capace di generare un errore se al nodo sono già stati assegnati padri verdi
            children.addGreenFather(self, riddle)
            # Viene aggiunto il figlio se non sono stati lanciati errori
            self.greenChildrens.append(children)
            self.childrenGreenEdges.append(GreenEdge(self, children, riddle))

        # Cattura dell'eccezione
        except Exception as e:
            #logger.info(e)
            print(e)


    def setNewStatus(self, status: "Status", team_to_signal : int = None, socket_to_signal : str = None):
        """ 
            Il metodo set status e' particolare, esegue operazioni di scoperte sui nodi viola collegati.\n
            Se ci sono archi viola in uscita e lo stato in ingresso e' RESOLVED i nodi viola in uscita vengono
            impostati come DISCOVERED

        """

        # Quando lo stato del nodo viene settato come RESOLVED
        # tutti i figli viola vengono scoperti e mostrati all'utente 
        # i puzzle ed informaizoni nuove associate al nodo
        self.status = status

        if status == Status.RESOLVED:
            for purpleChildren in self.purpleChildrens:
                purpleChildren.setNewStatus(Status.DISCOVERED, team_to_signal=team_to_signal, socket_to_signal=socket_to_signal)
            for greenEdge in self.childrenGreenEdges:
                greenEdge.setStatus(EdgeStatus.DISCOVERED, team_to_signal=team_to_signal, socket_to_signal=socket_to_signal)
            for purpleEdge in self.childrenPurpleEdges:
                purpleEdge.setStatus(EdgeStatus.RESOLVED)
        
        # Caso in cui vengono mostrate le informaizoni nuove
        elif status == Status.DISCOVERED:
            print(f"🔓 Nodo {self.getKey()} scoperto.")
            self.riddle.sendNewDiscovery(team_id=team_to_signal)



    def recieveSignal(self, signal : Signals = None, team_to_signal : int = None, socket_to_signal : str = None):
        """
            La funzione recieveSignal puo' prendere un segnale in ingresso ed elaborarlo sulla base\n
            del suo tipo, eseguendo operazioni variogate
        """

        # Se il segnale ricevuto era uno stato di un arco verde risolto
        # viene aumentato il contatore di quelli risolti e si controlla se tutti 
        # gli archi verdi in ingresso sono stati risolti. In caso positivo il nodo viene scoperto
        if signal == Signals.GREEN_EDGE_RESOLVED:
            self.solvedGreenEdges += 1
            print(f"- Nodo {self.getKey()} segnale ricevuto. Incremento il contatore: {self.solvedGreenEdges}")

            if self.areAllGreenEdgesResolved():
                print(f"- Nodo {self.getKey()}. Archi verdi in ingresso risolti -> mi sblocco.")
                self.setNewStatus(Status.DISCOVERED, team_to_signal=team_to_signal, socket_to_signal=socket_to_signal)


    def isSolution(self, solution : str = "", team_to_signal : int = None, socket_to_signal : str = None) -> bool:
        """ 
            Questo metodo controlla che la soluzione all'enigma sia quella inviata\n
            in tal caso il nodo viene risoto ed i vicini scoperti.\n
            Viene ritornato un valore booleano per segnalare l'evento appena scatenato.
        
        """
        
        # Se la soluzione del nodo e' quela inviata allora il nodo viene segnato come RESOLVED
        # E viene ritornato true
        if self.riddle.isSolution(solution):
            self.setNewStatus(Status.RESOLVED, team_to_signal, socket_to_signal)
            return True

        # Altrimenti viene ritornato semplicemente False
        return False

    def signalTeam(self, team_to_signal : int = None, socket_to_signal : str = None):
        """Metodo che segnala al team scelto il contenuto del puzzle risolto o scoperto."""
        self.riddle.sendNewDiscovery(team_id=team_to_signal)


    def areAllGreenEdgesResolved(self) -> bool:
        """ Metodo che restituisce true se tutti gli archi verdi in ingresso sono stati risolti. """
        return True if self.greenEdgesNumber == self.solvedGreenEdges else False
        

    def getPurpleFather(self) -> "Node":
        return self.purpleFather


    def getStatus(self) -> "Status":
        return self.status


    def setKey(self, key : int):
        """ Metodo che setta la chiave del nodo """
        self.key = key


    def getKey(self) -> int:
        """ Metodo che restituisce la chiave del nodo """
        return self.key
















