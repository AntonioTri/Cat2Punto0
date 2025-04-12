import {API_URL, SOCKET_URL} from '../../config.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { roles } from '../../utils/constants.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class ResourcesManager extends AbstractCardManager {

    constructor(containerSelector = 'Risorse', checkMark = new CheckMark(), socket = null){

        super(containerSelector, checkMark);
        this.socket = socket;

    };

    init(){

        this.setURLS();
        this.setVariables();
        this.addEnergyCounter();
        this.addEnergySpaces();
        this.addResources();
        // Questo metodo aggiorna lo status delle risorse 
        // sulla base delle informazioni nel back end
        this.updateStatus();
        // Metodo che aggiunge la listen della socket per l'update da altri utenti
        this.addSocketListener();


    };


    async updateStatus(){

        // try-catch per gestire gli errori
        try {
            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.URL_GET_ACTIVE_STATUSES, {  // Usa 'await' per aspettare la risposta
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                }
            });

            // Verifica se la risposta è OK
            if (response.ok) {

                // Converte la risposta in json
                const data = await response.json();
                
                // Vengono reimpostate le posizioni dei perk ed i valori
                // Generali della classe per essere in sincronizzazione con tutti
                // gli altri comandanti
                data.perks.forEach(perk => {
                    this.setStatuses(perk);
                });

                // Aggiornamento del costo totale
                this.totalCost = parseInt(data.totalCost);
                this.updateEnergyTag();
                

            // La risposta non è stata OK
            } else {
                console.log("Errore nella ricezione degli stati attivi:", response);
                // Compare il check mark per l'errore
                this.checkMark.error();
            }

        } catch (error) {
            console.log('Errore durante la get per gli status attivi: ', error);
        }


    };

    // Questo metodo aggiunge un listener alla socket che permette di aggiornare lo stato
    // dei perk sulla base degli aggiornamenti che fa un altro comandante
    addSocketListener(){
        setTimeout(() => {
            this.socket.on('perk_got_updated', (statuses) => {
                this.setStatuses(statuses);
                console.log('Update avvenuto sui di un perk:', statuses);
            });
       }, 1500);
    };

    // Questo metodo quando invocato reimposta gli status dei perk sulla base di quelli inviati
    setStatuses(statuses){

        // Estrazione dei dati

        // Costo attuale utilizzato
        if(statuses.totalCost){ this.totalCost = statuses.totalCost; }
        // Perk selezionato
        const perk = this.resources[statuses.perkIndex];
        // Se vi era presente anche il costo massimo utilizzabile viene impostato anche quello
        if(statuses.maxCost){ this.maxCost = statuses.maxCost; }

        // Se la pallina ha un punto di ancoraggio viene spostata
        if (statuses.anchorIndex) {

            const anchorCenterX = this.anchors[statuses.anchorIndex].offsetLeft + this.anchors[statuses.anchorIndex].offsetWidth / 2;
            const anchorCenterY = this.anchors[statuses.anchorIndex].offsetTop + this.anchors[statuses.anchorIndex].offsetHeight / 2;

            // Posiziona la pallina in modo che il suo centro coincida con il centro della nuova ancora
            perk.style.left = `${anchorCenterX - perk.offsetWidth / 2}px`;
            perk.style.top = `${anchorCenterY - perk.offsetHeight / 2}px`;

            // Memorizziamo che la pallina è stata ancorata
            perk.dataset.anchored = "true";

            // Se la pallina era già ancorata viene liberato il vecchio anchor point
            this.freeAnchor(perk);

            // Mentre quello nuovo deve essere impostato come occupato
            this.anchors[statuses.anchorIndex].dataset.used = "true";

            // Viene impostato il nuovo id dell'ancora associato alla pallina
            perk.dataset.anchorId = this.anchors[statuses.anchorIndex].id;


        // Altrimenti viene riportata al suo punto iniziale
        } else {
        
            // Viene liberata la vecchia ancora se c'era
            this.freeAnchor(perk);
            
            // Posiziona la pallina in modo che il suo centro coincida con il suo punto di inizio
            perk.style.left = `${100 + statuses.perkIndex * 70}px`;
            perk.style.top = `${100}px`;

            // Memorizziamo che la pallina è stata sganciata
            perk.dataset.anchored = "false";
            perk.dataset.anchorId = null;

        }

        // Alla fine viene aggiornato il tag dell'energia giusto nel caso sia cambiato
        this.updateEnergyTag();

    };

    // Metodo che serve a settare le variabili di ambiente per gestire i moduli
    // energetici e celle energetiche
    setVariables(){

        // Numero di palline (modificabile)
        this.numBalls = 6; 
        // Numero fisso di punti di ancoraggio
        this.numAnchors = 6;
        // Lista di punti di ancoraggio
        this.anchors = [];
        // Lista di moduli risorsa
        this.resources = [];
        // Raggio del cerchio su cui posizionare le ancore
        this.anchorRadius = 120;
        // Larghezza dei punti di ancoraggio (diametro)
        this.anchorSize = 55; 

        this.centerX = this.container.clientWidth / 2;
        this.centerY = this.container.clientHeight / 2;

        
        // Costo attuale utilizzato e costo massimo utilizzabile
        this.totalCost = 0;
        this.maxCost = 10;

    };

    // Il div che mostra il valore attuale di costo 
    addEnergyCounter(){

        // Creazione del div
        const energyTag = document.createElement('div');
        energyTag.id = 'energy_tag';
        energyTag.classList.add('energy_tag');
        energyTag.style.padding = '10px';
        // Associazione dell'istanza
        this.energyTag = energyTag;
        this.container.appendChild(energyTag);
        
        // Update del tag
        this.updateEnergyTag();
        

    };

    updateEnergyTag(){
        this.energyTag.innerHTML = `Energia usata: ${this.totalCost}/${this.maxCost}`;
    };

    // Questo metodo aggiunge gli spazi energetici all'interno della pagina
    // Gli spazi energetici sono punti nei quali possono essere inseriti moduli
    // di energia. Permettono agli altri utenti di poter eseguire azioni se attivate
    addEnergySpaces(){

        // Crea i punti di ancoraggio disposti in cerchio
        for (let i = 0; i < this.numAnchors; i++) {

            const angle = (2 * Math.PI / this.numAnchors) * i;
            const x = this.centerX + this.anchorRadius * Math.cos(angle) - 20;
            const y = this.centerY + this.anchorRadius * Math.sin(angle) - 20;

            const anchor = document.createElement('div');
            anchor.className = 'anchor';
            anchor.dataset.used = 'false';
            anchor.id = `${i}`;
            anchor.style.left = `${x}px`;
            anchor.style.top = `${y}px`;
            anchor.style.width = `${this.anchorSize}px`; // Imposta la larghezza
            anchor.style.height = `${this.anchorSize}px`;
            this.container.appendChild(anchor);
            this.anchors.push(anchor);
        }


    };


    addResources(){

        // Crea le palline e ne gestisce l'interazione
        for (let i = 0; i < this.numBalls; i++) {
            this.addSinglePerk(i, i);
        }      


    };

    addSinglePerk(_cost, _name){

        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.id = _name;
        const i = this.resources.length;
        const origin = { left: 100 + i * 70, top: 100 }; // Posizione iniziale delle palline
        // Costo della pallina, attualmente randomico
        const cost = _cost;
        ball.style.left = `${origin.left}px`;
        ball.style.top = `${origin.top}px`;
        ball.innerHTML = `${cost}`;
        // Variabile dataset che conserva se la palina è ancorata
        ball.dataset.anchored = "false";

        let isDragging = false;
        let offset = { x: 0, y: 0 };

        // Ottieni le coordinate dell'evento (mouse o touch)
        const getEventCoords = (e) => {
            if (e.touches) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else {
                return { x: e.clientX, y: e.clientY };
            }
        };
        
        // Inizia il trascinamento (usa il rettangolo del contenitore)
        const onStart = (e) => {
            e.preventDefault();
            isDragging = true;
            ball.style.transition = 'none';
            
            const coords = getEventCoords(e);
            const rect = ball.getBoundingClientRect();
            
            // Calcola l'offset relativo al contenitore
            offset.x = coords.x - rect.left;
            offset.y = coords.y - rect.top;
        };
        
        // Aggiorna la posizione durante il trascinamento
        const onMove = (e) => {
            if (!isDragging) return;
            
            const coords = getEventCoords(e);
            // Ottieni la posizione del contenitore
            const containerRect = this.container.getBoundingClientRect();
            
            // Imposta la posizione relativa al contenitore
            ball.style.left = `${coords.x - containerRect.left - offset.x}px`;
            ball.style.top = `${coords.y - containerRect.top - offset.y}px`;
        };


        // Quando il trascinamento termina
        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            const ballRect = ball.getBoundingClientRect();
            let closestAnchor = null;
            let minDist = Infinity;
            const snapDistance = 40; // Distanza massima per ancorarsi

            // Trova l'ancora più vicina alla pallina
            for (const anchor of this.anchors) {
                const anchorRect = anchor.getBoundingClientRect();
                const dx = (ballRect.left + ballRect.width / 2) - (anchorRect.left + anchorRect.width / 2);
                const dy = (ballRect.top + ballRect.height / 2) - (anchorRect.top + anchorRect.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDist && dist < snapDistance) {
                    minDist = dist;
                    closestAnchor = anchor;
                }
            }


            
            // Se vicino all'ancora
            if (minDist < snapDistance) {

                // Un controllo preventivo si assicura che l'attuale punto di ancoraggio non sia già occupato
                // Se l'anchor più vicino risulta già occupato...
                if (closestAnchor.dataset.used === "true") {
                    
                    // Se la pallina era già agganciata, torna al suo anchor precedente
                    if (ball.dataset.anchored === "true" && ball.dataset.anchorId) {
                        
                        const previousAnchor = this.anchors.find(a => a.id === ball.dataset.anchorId);
                        if (previousAnchor) {
                            const anchorCenterX = previousAnchor.offsetLeft + previousAnchor.offsetWidth / 2;
                            const anchorCenterY = previousAnchor.offsetTop + previousAnchor.offsetHeight / 2;
                            ball.style.transition = 'left 0.3s ease, top 0.3s ease';
                            ball.style.left = `${anchorCenterX - ball.offsetWidth / 2}px`;
                            ball.style.top = `${anchorCenterY - ball.offsetHeight / 2}px`;
                        }

                    } else {
                        // Se il perk non era ancora agganciato, torna al punto di partenza
                        ball.style.transition = 'left 0.6s ease-in-out, top 0.6s ease-in-out';
                        ball.style.left = `${origin.left}px`;
                        ball.style.top = `${origin.top}px`;
                    }
                    
                    return; // Esci dal controllo, impedendo l'aggancio sull'anchor occupato
                
                }

                // Se la pallina era già agganciata a un anchor diverso dal nuovo, libera il vecchio anchor
                if (ball.dataset.anchored === "true" && ball.dataset.anchorId && ball.dataset.anchorId !== closestAnchor.id) {
                    const previousAnchor = this.anchors.find(a => a.id === ball.dataset.anchorId);
                    if (previousAnchor) {
                        previousAnchor.dataset.used = "false";
                        console.log("Vecchio anchor liberato:", previousAnchor);
                    }
                }

                // Pallina non ancora ancorata
                if(ball.dataset.anchored === "false"){
                    // Se il costo della pallina è sommabile viene inserita aumentando il costo occupato
                    if(cost + this.totalCost <= this.maxCost){
                        this.totalCost += cost;

                        // TODO:Deve essere segnalato al back end, agli altri comandanti e ai destinatari della risorsa
                        // che la risorsa è stata collegata
                        console.log(`Pallina ${i + 1} ancorata con costo ${cost}. Costo occupato: ${this.totalCost}.`);
                        // Update del tag dell'energia usata
                        this.updateEnergyTag();
                    
                    // Se il costo della pallina supera il costo totale non viene inserita
                    // E viene riportata al punto di partenza
                    } else {
                        ball.style.transition = 'left 0.6s ease-in-out, top 0.6s ease-in-out';
                        ball.style.left = `${origin.left}px`;
                        ball.style.top = `${origin.top}px`;
                        return;
                    }
                
                // Se la pallina era già agganciata
                }
                
                // Conserviamo lo stato e l'id del punto di ancoraggio
                ball.dataset.anchored = "true";
                ball.dataset.anchorId = closestAnchor.id;
                closestAnchor.dataset.used = "true";

                // Transizione
                ball.style.transition = 'left 0.3s ease, top 0.3s ease';
                // Calcola il centro del punto di ancoraggio
                const anchorCenterX = closestAnchor.offsetLeft + closestAnchor.offsetWidth / 2;
                const anchorCenterY = closestAnchor.offsetTop + closestAnchor.offsetHeight / 2;

                // Posiziona la pallina in modo che il suo centro coincida con il centro dell'ancora
                ball.style.left = `${anchorCenterX - ball.offsetWidth / 2}px`;
                ball.style.top = `${anchorCenterY - ball.offsetHeight / 2}px`;

                
                // Invio dei dati
                this.sendPerkUpdate(i, closestAnchor.id);

                
            } else {
                // Libera la ancora associata alla pallina
                this.freeAnchor(ball);

                // Se era ancorata, ora viene rimossa
                if (ball.dataset.anchored === "true") {
                    // Viene rimosso il costo della pallina dal costo totale
                    this.totalCost -= cost;
                    // viene rimosso il punto di ancoraggio
                    ball.dataset.anchorId = null;

                    console.log(`Pallina ${i + 1} rimossa dall'ancoraggio. Costo occupato: ${this.totalCost}.`);
                    

                }
                
                // Si inviano i dati dello scollegamento
                this.sendPerkUpdate(i, null);

                // Togliamo la memorizazione di ancoraggio
                ball.dataset.anchored = "false";

                // Update del tag dell'energia usata
                this.updateEnergyTag();

                // A prescindere la pallina viene riportata al punto di partenza
                closestAnchor = null;
                ball.style.transition = 'left 0.6s ease-in-out, top 0.6s ease-in-out';
                ball.style.left = `${origin.left}px`;
                ball.style.top = `${origin.top}px`;
            
            }
        };

        // Eventi per mouse e touch
        ball.addEventListener('mousedown', onStart);
        ball.addEventListener('touchstart', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);

        // Clic per far tornare la pallina alla posizione iniziale se non ancorata
        ball.addEventListener('click', () => {
            if (ball.dataset.anchored == false) {
                ball.style.transition = 'left 0.6s ease-in-out, top 0.6s ease-in-out';
                ball.style.left = `${origin.left}px`;
                ball.style.top = `${origin.top}px`;
            }
        });

        this.resources.push(ball);
        this.container.appendChild(ball);

    }
    




    freeAnchor(perk){

        const usedAnchor = this.anchors.find(a => a.id === perk.dataset.anchorId);
            if (usedAnchor) {
                // Il punto di ancoraggio viene di nuovo reso libero
                usedAnchor.dataset.used = "false";
                console.log("Ancora liberata: ", usedAnchor);
            }

    }


    sendPerkUpdate(perkId, anchorId){

        const data_to_send = {
            // IL FOTTUTO TOKEN DI MERDA PER IL DECORATOR DELLA SOKET
            token : localStorage.getItem("access_token"),
            // Indice del perk spostato
            perkIndex : perkId,
            // Indice del punto di ancoraggio a cui si è attaccato il perk
            anchorIndex : anchorId,
            // Costo attuale ricoperto
            totalCost : this.totalCost,
            // Il costo massimo rimane invariato
            maxCost : null,
            // Il team id del comandante
            team_id : localStorage.getItem("team_id"),
            // Id personale
            personal_id : localStorage.getItem("personal_id"),
            // L'id della socket che ha emesso il messaggio, al fine di evitare che 
            // venga fatto un auto-aggiornamento inutile
            socket : localStorage.getItem("socket")
        }

        // Aggiungiamo il listener che definisce la socket
        this.socket.emit('perk_updated', data_to_send);
        console.log('Invio dei dati della pallina:', data_to_send);

    }


    setURLS(){

        // URL dedicato per la ricezione degli stati attivi indirizzato all'API
        this.URL_GET_ACTIVE_STATUSES = `${API_URL}/get_active_statuses?team_id=${localStorage.getItem('team_id')}`;
        //URL dedicato al path di docker
        this.dockerPathGetActiveStatuses = `http://localhost:5000/api/get_active_statuses?team_id=${localStorage.getItem('team_id')}`;

    }

}