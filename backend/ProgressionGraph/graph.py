from Nodes.node import Node, Status, Signals
from Edges.edge import PurpleEdge, GreenEdge, EdgeStatus
from Riddles.riddles import Riddle

class GraphVisualizer:
    @staticmethod
    def print_node_info(node: Node):
        print(f"\n*** NODO {node.getKey()} ***")
        print(f"Stato: {node.getStatus().name}")
        
        if node.purpleFather:
            print(f"Padre viola: Nodo {node.purpleFather.getKey()}")
        
        if node.greenFathers:
            print("Padri verdi:", [f.getKey() for f in node.greenFathers])
        
        print("\nArchivi uscenti:")
        for edge in node.childrenPurpleEdges + node.childrenGreenEdges:
            color = "Viola" if isinstance(edge, PurpleEdge) else "Verde"
            status = edge.getStatus().name
            print(f"- Arco {color} verso Nodo {edge.getEndingNode().getKey()} ({status})")

    @staticmethod
    def print_discovered_edges(nodes: list[Node]):
        print("\n=== Archi scoperti disponibili ===")
        for node in nodes:
            for edge in node.childrenGreenEdges + node.childrenPurpleEdges:
                if edge.getStatus() == EdgeStatus.DISCOVERED:
                    print(f"Arco verde da {node.getKey()} a {edge.getEndingNode().getKey()}")
                    print(f"Indizio: {edge._GreenEdge__riddle.puzzle}")

class GraphTester:
    def __init__(self):
        self.nodes = []
        self.create_test_graph()
    
    def create_test_graph(self):
        # Creazione nodi
        node0 = Node(0, Riddle("Enigma 0", "sol0"))
        node1 = Node(1, Riddle("Enigma 1", "sol1"))
        node2 = Node(2, Riddle("Enigma 2", "sol2"))
        node3 = Node(3, Riddle("Enigma 4", "sol4"))
        node4 = Node(4, Riddle("Enigma finale", "sol4"))
        
        # Collegamenti
        node0.addPurpleChildren(node1)
        node0.addPurpleChildren(node2)
        node1.addGreenChildren(node3, Riddle("Green vertex1", "sol1"))
        node2.addGreenChildren(node3, Riddle("Green vertex2", "sol2"))
        node3.addPurpleChildren(node4)
        
        self.nodes = [node0, node1, node2, node3, node4]
        node0.setNewStatus(Status.RESOLVED)  # Inizializza l'esplorazione
    
    def run_test(self):
        current_nodes = [self.nodes[0]]
        solved_edges = set()
        
        while True:
            # Stampa informazioni
            for node in current_nodes:
                GraphVisualizer.print_node_info(node)
            
            # Mostra archi disponibili
            GraphVisualizer.print_discovered_edges(current_nodes)
            
            # Verifica se ci sono enigmi da risolvere
            active_edges = []
            for node in current_nodes:
                for edge in node.childrenGreenEdges:
                    if edge.getStatus() == EdgeStatus.DISCOVERED:
                        active_edges.append(edge)
            
            if not active_edges:
                print("\nNessun altro enigma da risolvere!")
                break
            
            # Input utente
            try:
                answer = input("\nInserisci la soluzione (o 'exit' per uscire): ").strip().lower()
                if answer == 'exit':
                    break
                
                solved = False
                for edge in active_edges:
                    if edge._GreenEdge__riddle.isSolution(answer):
                        edge.checkRiddle(answer)
                        print(f"\n✅ Enigma risolto! Nodo {edge.getEndingNode().getKey()} sbloccato")
                        solved = True
                        
                        # Aggiorna nodi corrente
                        if edge.getEndingNode().getStatus() == Status.DISCOVERED:
                            current_nodes.append(edge.getEndingNode())
                        
                        solved_edges.add(edge)
                        break
                
                if not solved:
                    print("\n❌ Soluzione errata o enigma non trovato")
            
            except KeyboardInterrupt:
                print("\nTest interrotto")
                break

if __name__ == "__main__":
    tester = GraphTester()
    tester.run_test()
    print("\nTest completato!")