import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { API_URL, SOCKET_URL } from '../../config.js';
import { socket } from '../../utils/socket.js';

export class FascicoliManager extends AbstractCardManager{


    constructor(containerSelector = 'Fascicoli', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }

    init(){

        this.permissionMap = {};
        this.fascicoli = [];
        this.setURLS();
        this.addScrollableList('evidence_list');
        this.sendRequest();
        this.defineSocketSignals();

    }

    async sendRequest(){

        // try-catch per gestire gli errori
        try {
            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.URL_GET_EVIDENCE, {  // Usa 'await' per aspettare la risposta
                method: "GET",  // Cambia il metodo in POST, poiché stai inviando dati
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                }
            });

            // Verifica se la risposta è OK
            if (response.ok) {

                // Converte la risposta in json
                const data = await response.json();
                this.fascicoli = data.fascicoli;
                // Aggiunta dei bottoni sulla base dei fascicoli ottenuti dalla api
                this.initPermissionMap();
                this.addElementsToList(this.fascicoli);

            // La risposta non è stata OK
            } else {
                console.log("Errore nel download dei fascicoli:", response);

                // Viene mostrato il messaggio in sovrimpressione in base allo status
                switch (response.status) {
                    case 404:
                        console.log("Non sono stati trovati fascicoli: ", response);
                        break;
                    default:
                        console.log("Errore durante la get dei fascicoli: ", response);
                        break;
                }
                // Compare il check mark per l'errore
                this.checkMark.error();
            }

        } catch (error) {
            console.log('Errore durante la get dei fascicoli: ', error);
        }
    }

    // All'invocazione, preso l'array di fascicoli estratto dalla risposta in input
    // per ogni fascicolo presente nella lista, viene aggiunto un elemento alla lista di fascicoli
    addElementsToList(fascicoli = []){

        // Viene resettato il contenuto della evidence list
        this.getSelectorById('evidence_list').innerHTML = '';
        // Per ogni fascicolo viene aggiornata la lista ed associato l'evento click per
        // mostrare la info card associata
        fascicoli.forEach(fascicolo => {
            // Aggiunta dell'elemento
            const elementAdded = this.addElementToScrollableList(`${fascicolo.id_fascicolo}`, fascicolo.titolo, fascicolo.contenuto, fascicolo.permission_required);
            // Aggiunta dell'event listener
            elementAdded.addEventListener('click', () => {

                this.addEventsOnElement(fascicolo);

            });
        
        });

    };


    addEventsOnElement(fascicolo){

        
        // Se il fascicolo non ha bisogno di permesso lo mostriamo direttamente
        if(!fascicolo.permission_required) {
            super.showInfoCard(`fascicolo_numero_${fascicolo.id_fascicolo}`, fascicolo.titolo);
            
        // Se il fascicolo e' protetto e se non e' mai stato inviato il segnale per esso  
        // allora viene inviato un segnale ai capitani
        // TODO: Si potrebbe fare che il segnae viene inviato solo ad un capitano, per incrementare
        // l'interattivita' tra i giocatori e le cose da fare
        } else if(fascicolo.permission_required && !this.permissionMap[fascicolo.id_fascicolo]["permission_sent"]){
            
            // Come prima cosa indichiamo che c'e' una richiesta pendente per il fascicolo
            // Così da impedire che vengano spammate richieste con click continui
            this.permissionMap[fascicolo.id_fascicolo]["permission_sent"] = true;

            // Definiamo i dati da inviare
            const data_to_send = {
                // Il token deve essere sempre presente
                token : localStorage.getItem('access_token'),
                team_id : localStorage.getItem('team_id'),
                id_fascicolo : fascicolo.id_fascicolo,
                detective_socket : localStorage.getItem('socket'),
                detective_name : localStorage.getItem('detective_name')
            };
            
            // E li inviamo
            socket.emit('evidence_permission_required', data_to_send);
        
        // Altrimenti se la card ha bisogno di permesso ma questo è stato concesso, la mostriamo
        } else if(fascicolo.permission_required && this.permissionMap[fascicolo.id_fascicolo]["permission_gained"]) {
            super.showInfoCard(`fascicolo_numero_${fascicolo.id_fascicolo}`, fascicolo.titolo);
        }

    }


    // Questo metodo inizializza la mappa dei permessi sui fascicoli
    initPermissionMap(){
        
        // Per ogni fascicolo, se il fascicolo ha bisogno del permesso
        // viene registrato nella mappa come falso
        this.fascicoli.forEach(fascicolo => {

            if(fascicolo.permission_required){
                this.permissionMap[fascicolo.id_fascicolo] = {
                    "permission_sent" : false,
                    "permission_gained" : false
                };
            }
        });

    }

    // Questo metodo inizializza tutti i segnali associati ai fascicoli
    defineSocketSignals(){

        // Definizione del segnale per dare il permesso di accesso ad un fascicolo
        socket.on('evidence_permission_gained', (response) => {
            console.log('Permessi ricevuti per i fascicoli:', response);
            // Estraiamo l'id del fascicolo sul quale abbiamo ora i permessi
            const id_fascicolo = parseInt(response);
            // Aggiorniamo la mappa
            this.permissionMap[id_fascicolo]["permission_gained"] = true;

        });

    }

    setURLS(){

        // URL per ottenere i fascicoli sbloccati
        this.URL_GET_EVIDENCE = `${API_URL}/get_detective_progresses?type=fascicoli&team_id=${localStorage.getItem('team_id')}`;
        // URL per inviare i segnali streaming
        this.URL_ASK_FOR_PERMISSION = `${SOCKET_URL}`;

        // URL docker per ottenere i fascicoli sbloccati 
        this.dockerPathGetEvidence = `http://localhost:5000/api/get_detective_progresses?type=fascicoli&team_id=${localStorage.getItem('team_id')}`;
        // URL docker per inviare i segnali
        this.dockerPathSendSignals = 'http://localhost:5000/socket';

    }

}





