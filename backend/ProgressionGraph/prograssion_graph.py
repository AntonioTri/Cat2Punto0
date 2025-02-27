from Nodes.node import Node, Status, Signals
from Edges.edge import PurpleEdge, GreenEdge, EdgeStatus
from Riddles.riddles import Riddle


class ProgressionGraph:
    def __init__(self):
        self.nodes = []
        self.create_test_graph()
    
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
        f.addPurpleChildren(five_entrypoint)


        
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

    
    def run_test(self):
        # Inizializziamo gli enigmi da risolvere. Questa lista contiene tutti gli enigmi attivi
        # Sotto forma di nodi o segreti dei nodi (archi verdi)
        active_riddles : list[Node | GreenEdge ] = [self.nodes[0]]
        
        while True:

            # Stampa delle informazioni
            for element in active_riddles:
                if isinstance(element, Node):
                    self.print_node_info(element)
                elif isinstance(element, GreenEdge):
                    self.print_edge_info(edge)
            
            # Se non ci sono enigmi attivi viene segnalato
            # TODO: Da aggiungere che bisognoerebbe segnalare la fine
            # se si e' raggiunto un finale
            if not active_riddles:
                print("\nNessun altro enigma da risolvere!")
                break
            
            # Un try catch gestisce gli input dell'utente
            try:
                answer = input("\nInserisci la soluzione (o 'exit' per uscire): ").strip().lower()
                if answer == 'exit':
                    break
                
                # Questa variabile serve a capire se qualcosa e' stato risolto
                # Piu' avanti nel codice, la variabile serve a segnalare l'utente di una risposta
                # sbagliata
                solved = False

                # Per ogni elemento presente nella lista di enigmi da risolvere
                # viene eseguito un controllo per vedere se la risposta inserita e' corretta
                for element in active_riddles:

                    # Controllo per l'istanza di nodo
                    if isinstance(element, Node):
                        # Se la risposta appartiene al nodo questo viene risolto
                        # i figli viola scoperti e gli archi verdi scoperti
                        if element.isSolution(answer):
                            print(f"\n✅ Enigma risolto! Nodo {element.getKey()} sbloccato")
                            # L'enigma risolto viene eliminato dagli enigmi da risolvere
                            active_riddles.remove(element)
                            
                            # Vengono aggiunti anche gli archi verdi uscenti se sono presenti
                            if element.greenChildrens:
                                for edge in element.childrenGreenEdges:
                                    active_riddles.append(edge)
                            
                            # La variabile booleana segnala che un enigma e' stato risolto
                            solved = True


                    # Caso di istanza di arco
                    elif isinstance(element, GreenEdge):
                        # Se la risposta era corretta, al nodo puntato viene inviato un segnale
                        # Al segnale il nodo controlla che tutti gli archi in entrata verdi 
                        # siano risolti, se si' il nodo viene scoperto
                        #
                        # Infine l'arco viene segnato come risolto
                        if element.checkRiddle(answer):
                            print(f"\n✅ Enigma risolto! Arco verde da {element.getStartingNode().getKey()} a {element.getEndingNode().getKey()} sbloccato!")
                            # L'arco viene eliminato dalla lista di enigmi
                            # e la flag viene alzata
                            active_riddles.remove(element)
                            solved = True

                # Alla fine dei check delle risposte tutti i nodi che possibilmente sono stati
                # scoperti, vengono inseriti alla lista di enigmi da risolvere
                for node in self.nodes:
                    if node.getStatus() == Status.DISCOVERED and node not in active_riddles:
                        active_riddles.append(node)        

                # Se nessun enigma avviato aveva la risposta corretta
                # viene segnalato
                if not solved:
                    print("\n❌ Soluzione errata o enigma non trovato")
            
            except KeyboardInterrupt:
                print("\nTest interrotto")
                break


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




if __name__ == "__main__":
    tester = ProgressionGraph()
    tester.run_test()
    print("\nTest completato!")