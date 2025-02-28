from Nodes.node import Node, Status, Signals
from Edges.edge import PurpleEdge, GreenEdge, EdgeStatus
from Riddles.riddles import Riddle
import pickle
from pathlib import Path
from collections import deque


class ProgressionGraph:
    def __init__(self):
        self.root : Node = None
        self.nodes : list[Node] =[]
        self.active_riddles : list[Node | GreenEdge]= []
        self.create_test_graph()

    def initialize_game(self):
        """
        Inizializza il gioco, impostando lo stato iniziale.
        """
        self.active_riddles = [self.nodes[0]]  # Inizia con il nodo radice
        print("Gioco inizializzato! Pronto per iniziare.")
    
    def create_test_graph(self):

        # Definizione del fiore centrale del boouquet 
        root = Node(0, Riddle("Enigma 0", "sol0"))
        firstPuzzle_a = Node(1, Riddle("Enigma 1", "sol1"))
        secondPuzzle_b = Node(2, Riddle("Enigma 2", "sol2"))
        thirdPuzzle_c = Node(3, Riddle("Enigma 3", "sol3"))
        root.addPurpleChildren(firstPuzzle_a)
        root.addPurpleChildren(secondPuzzle_b)
        root.addPurpleChildren(thirdPuzzle_c)

        # Figli di A
        a_1 = Node(4, Riddle("Enigma 4", "sol4"))
        a_2 = Node(5, Riddle("Enigma 5", "sol5"))
        a_3 = Node(6, Riddle("Enigma 6", "sol6"))
        firstPuzzle_a.addPurpleChildren(a_1)
        firstPuzzle_a.addPurpleChildren(a_2)
        firstPuzzle_a.addPurpleChildren(a_3)

        # Figli di B
        b_1 = Node(7, Riddle("Enigma 7", "sol7"))
        b_2 = Node(8, Riddle("Enigma 8", "sol8"))
        b_3 = Node(9, Riddle("Enigma 9", "sol9"))
        secondPuzzle_b.addPurpleChildren(b_1)
        secondPuzzle_b.addPurpleChildren(b_2)
        secondPuzzle_b.addPurpleChildren(b_3)

        # Figli di C
        c_1 = Node(10, Riddle("Enigma 10", "sol10"))
        c_2 = Node(11, Riddle("Enigma 11", "sol11"))
        thirdPuzzle_c.addPurpleChildren(c_1)
        thirdPuzzle_c.addPurpleChildren(c_2)

        # Primo livello di nodi
        l = Node(12, Riddle("Enigma 12", "sol12"))
        a_1.addPurpleChildren(l)
        h = Node(13, Riddle("Enigma 13", "sol13"))
        a_2.addPurpleChildren(h)
        g = Node(14, Riddle("Enigma 14", "sol14"))
        b_1.addPurpleChildren(g)
        f = Node(16, Riddle("Enigma 16", "sol16"))
        b_2.addPurpleChildren(f)
        
        # Nodi complessi, atti alla scoperta di pezzi di storia piu' importanti
        n = Node(17, Riddle("Enigma 17", "sol17"))
        m = Node(18, Riddle("Enigma 18", "sol18"))
        o = Node(19, Riddle("Enigma 19", "sol19"))
        b_2.addGreenChildren(m, Riddle("Enigma 20", "sol20"))
        c_2.addGreenChildren(m, Riddle("Enigma 21", "sol21"))
        a_2.addGreenChildren(n, Riddle("Enigma 22", "sol22"))
        b_3.addGreenChildren(n, Riddle("Enigma 23", "sol23"))
        g.addGreenChildren(o, Riddle("Enigma 24", "sol24"))
        l.addGreenChildren(o, Riddle("Enigma 25", "sol25"))
        thirdPuzzle_c.addGreenChildren(n, Riddle("Enigma 26", "sol26"))
        
        e = Node(15, Riddle("Enigma 15", "sol15"))
        f.addPurpleChildren(e)
        d = Node(36, Riddle("Enigma 36", "sol36"))
        c_1.addPurpleChildren(d)

        # Questi sono invece i nodi al bordo della rosa centrale.
        # Definiscono i punti di ingresso ai fiori esterni
        one = Node(27, Riddle("Enigma 27", "sol27"))
        two = Node(28, Riddle("Enigma 28", "sol28"))
        three = Node(29, Riddle("Enigma 29", "sol29"))
        four = Node(30, Riddle("Enigma 30", "sol30"))
        five = Node(31, Riddle("Enigma 31", "sol31"))
        six = Node(32, Riddle("Enigma 32", "sol32"))
        one_entrypoint = Node(33, Riddle("Enigma 33", "sol33"))
        one_entrypoint.addPurpleChildren(one)
        three_entrypoint = Node(34, Riddle("Enigma 34", "sol34"))
        three_entrypoint.addPurpleChildren(three)
        five_entrypoint = Node(35, Riddle("Enigma 35", "sol35"))
        five_entrypoint.addPurpleChildren(five)
        m.addPurpleChildren(two)
        o.addPurpleChildren(four)
        n.addPurpleChildren(six)
        d.addPurpleChildren(one_entrypoint)
        a_2.addPurpleChildren(three_entrypoint)
        f.addPurpleChildren(five)


        
        self.nodes = [
            root, firstPuzzle_a, secondPuzzle_b, thirdPuzzle_c,  # Fiore centrale

            a_1, a_2, a_3,  # Figli di A
            b_1, b_2, b_3,  # Figli di B
            c_1, c_2,       # Figli di C

            l, h, g, f,     # Primo livello di nodi
            n, m, o,        # Nodi complessi
            e, d,           # Nodi secondari

            one, two, three, four, five, six,  # Nodi di bordo
            one_entrypoint, three_entrypoint, five_entrypoint  # Punti di ingresso ai fiori esterni
        ]

        root.setNewStatus(Status.DISCOVERED)
        self.root = root


    def process_answer(self, answer):
        """
        Processa la risposta dell'utente e aggiorna lo stato del gioco.
        :param answer: La risposta inserita dall'utente.
        :return: True se il gioco è ancora attivo, False se è terminato.
        """

        # Se non ci sono enigmi attivi, il gioco è finito
        if not self.active_riddles:
            print("\nNessun altro enigma da risolvere!")
            return False  # Fine del gioco

        # Controlla se la risposta è corretta
        solved = False
        for element in self.active_riddles:
            if isinstance(element, Node):
                if element.isSolution(answer):
                    print(f"\n✅ Enigma risolto! Nodo {element.getKey()} sbloccato")
                    self.active_riddles.remove(element)
                    if element.greenChildrens:
                        for edge in element.childrenGreenEdges:
                            self.active_riddles.append(edge)
                    solved = True

            elif isinstance(element, GreenEdge):
                if element.checkRiddle(answer):
                    print(f"\n✅ Enigma risolto! Arco verde da {element.getStartingNode().getKey()} a {element.getEndingNode().getKey()} sbloccato!")
                    self.active_riddles.remove(element)
                    solved = True

        # Aggiungi nuovi nodi scoperti alla lista degli enigmi attivi
        for node in self.nodes:
            if node.getStatus() == Status.DISCOVERED and node not in self.active_riddles:
                self.active_riddles.append(node)

        # Se la risposta non era corretta, segnala l'errore
        if not solved:
            print("\n❌ Soluzione errata o enigma non trovato")


        # Stampa delle informazioni sugli enigmi attivi
        for element in self.active_riddles:
            if isinstance(element, Node):
                self.print_node_info(element)
            elif isinstance(element, GreenEdge):
                self.print_edge_info(element)


        return True  # Il gioco continua

    def print_node_info(self, node: Node):
        print(f"\n*** NODO {node.getKey()} ***")
        print(f"Stato: {node.getStatus().name}")
        
        if node.purpleFather:
            print(f"Padre viola: Nodo {node.purpleFather.getKey()}")
        
        if node.greenFathers:
            print("Padri verdi:", [f.getKey() for f in node.greenFathers])
        
        if len(node.childrenPurpleEdges) > 0:
            
            print("\nArchi viola uscenti:")
            for edge in node.childrenPurpleEdges:
                status = edge.getStatus().name
                print(f"- Arco Viola verso Nodo {edge.getEndingNode().getKey()} ({status})")
        
        if len(node.childrenGreenEdges) > 0:   
            
            print("\nArchi verdi uscenti:")
            for edge in node.childrenGreenEdges:
                status = edge.getStatus().name
                print(f"- Arco Verde verso Nodo {edge.getEndingNode().getKey()} ({status})")


    def print_edge_info(self, edge : GreenEdge):
        # Print delle informazioni dell'arco se e' in stato discovered
        print(f"\n*** ARCO VERDE ({edge.getStatus().name}) ***\nNodo di partenza: {edge.getStartingNode().getKey()}.\nNodo di arrivo: {edge.getEndingNode().getKey()}.")


    def bfs_visit_discovered_and_resolved(self, start_node: Node = None):
        """
        Esegue una visita BFS a partire da un nodo, visitando solo nodi con stato DISCOVERED o RESOLVED
        e archi verdi con stato DISCOVERED o RESOLVED.
        """

        start_node = self.root

        # Controllo iniziale: se il nodo di partenza non è DISCOVERED o RESOLVED, non fare nulla
        if start_node.getStatus() not in {Status.DISCOVERED, Status.RESOLVED}:
            print(f"Il nodo {start_node.getKey()} non è DISCOVERED o RESOLVED. Visita interrotta.")
            return

        # Inizializzazione della coda e del set dei nodi visitati
        queue = deque()  # Coda per la BFS
        visited_nodes = set()  # Set per tenere traccia dei nodi già visitati
        visited_edges = set()  # Set per tenere traccia degli archi già visitati

        # Aggiungi il nodo di partenza alla coda e segnalo come visitato
        queue.append(start_node)
        visited_nodes.add(start_node.getKey())

        while queue:
            # Estrai il nodo corrente dalla coda
            current_node : Node = queue.popleft()
            print(f"Visiting Node {current_node.getKey()} with status {current_node.getStatus()}")

            # Visita gli archi verdi in uscita (solo se sono DISCOVERED o RESOLVED)
            for green_edge in current_node.childrenGreenEdges:
                if green_edge.getStatus() in {EdgeStatus.DISCOVERED, EdgeStatus.RESOLVED}:
                    edge_key = (current_node.getKey(), green_edge.getEndingNode().getKey())
                    if edge_key not in visited_edges:
                        print(f"  Visiting Green Edge from {current_node.getKey()} to {green_edge.getEndingNode().getKey()} with status {green_edge.getStatus()}")
                        visited_edges.add(edge_key)

                        # Aggiungi il nodo figlio alla coda se non è già stato visitato
                        child_node : Node = green_edge.getEndingNode()
                        if child_node.getKey() not in visited_nodes and child_node.getStatus() in {Status.DISCOVERED, Status.RESOLVED}:
                            queue.append(child_node)
                            visited_nodes.add(child_node.getKey())

            # Visita gli archi viola in uscita (solo se il nodo figlio è DISCOVERED o RESOLVED)
            for purple_edge in current_node.childrenPurpleEdges:
                child_node = purple_edge.getEndingNode()
                if child_node.getStatus() in {Status.DISCOVERED, Status.RESOLVED}:
                    # Aggiungi il nodo figlio alla coda se non è già stato visitato
                    if child_node.getKey() not in visited_nodes:
                        queue.append(child_node)
                        visited_nodes.add(child_node.getKey())


    @property
    def _save_dir(self):
        """Restituisce il percorso della cartella di salvataggio."""
        return Path(__file__).parent / "saved_graphs"

    def save_to_file(self, filename):
        """
        Salva l'istanza del grafo nella cartella specificata.
        """
        # Crea la cartella se non esiste
        self._save_dir.mkdir(parents=True, exist_ok=True)
        
        save_path = self._save_dir / filename
        with open(save_path, 'wb') as file:
            pickle.dump(self, file)

    @classmethod
    def load_from_file(cls, filename):
        """
        Carica un'istanza del grafo da un file.
        """
        save_path = cls()._save_dir / filename
        if not save_path.exists():
            raise FileNotFoundError(f"Nessun file trovato al percorso: {save_path}")
        
        with open(save_path, 'rb') as file:
            return pickle.load(file)



if __name__ == "__main__":
    # Creazione del grafo
    graph = ProgressionGraph()
    graph.initialize_game()

    # Loop esterno per gestire l'input dell'utente
    while True:
        try:
            # Prendi l'input dall'utente
            answer = input("\nInserisci la soluzione (o 'exit' per uscire): ").strip().lower()
            
            # Se l'utente vuole uscire, interrompi il loop
            if answer == 'exit':
                print("\nGioco interrotto.")
                break
            elif answer == "save_graph":
                print("\nSalvo il grafo attuale ... ")
                graph.save_to_file("graph_test")
                continue
            elif answer == "load_graph":
                graph = ProgressionGraph.load_from_file("graph_test")
                print("\nCarico il grafo dai salvataggi ...")
                continue
            elif answer == "bfs":
                graph.bfs_visit_discovered_and_resolved()
                continue
            
            # Processa la risposta
            game_active = graph.process_answer(answer)
            
            # Se il gioco è terminato, interrompi il loop
            if not game_active:
                break
        
        except KeyboardInterrupt:
            print("\nGioco interrotto.")
            break