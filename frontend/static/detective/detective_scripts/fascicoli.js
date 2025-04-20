import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { socket } from '../../utils/socket.js';

export class FascicoliManager extends AbstractCardManager{


    constructor(containerSelector = 'Fascicoli', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }

    init(){

        this.permissionMap = {};
        this.fascicoli = [];

        this.addScrollableList('evidence_list');
        this.defineSocketSignals();
        this.askCacheData("retrieve_evidences");
        this.addResponseMessage();
        //this.addLocker("fascicoli", "fascicoli_on", "fascicoli_off");
    }
    
    
    // Questo metodo inizializza tutti i segnali associati ai fascicoli
    defineSocketSignals(){

        // Evento socket che intercetta l'arrivo di un nuovo fascicolo da aggiungere
        socket.on('add_new_evidence', (fascicolo) => {
            this.addElementToList(fascicolo);
            console.log('Aggiunta di un nuovo fascicolo', fascicolo);
        });

        // Definizione del segnale per dare il permesso di accesso ad un fascicolo
        socket.on('evidence_permission_gained', (response) => {
            console.log('Permessi ricevuti per i fascicoli:', response);

            // Se il permesso e' stato positivo viene concesso di accedere al fascicolo
            if(response.permission){
                // Estraiamo l'id del fascicolo sul quale abbiamo ora i permessi
                const id_fascicolo = parseInt(response.element_id);
                // Aggiorniamo la mappa
                this.permissionMap[id_fascicolo]["permission_gained"] = true;
                
                // Aggiorniamo la scritta dello status
                const status = document.getElementById(`fascicolo_numero_${id_fascicolo}_status`);
                status.style.color = 'rgb(79, 202, 66)';
                status.innerHTML = 'Permesso ottenuto.';
                
                // Mostriamo un messaggio di successo
                this.showResponseMessage(`Permesso concesso per vedere il fascicolo ${id_fascicolo}.`);
            
            // Altrimenti se l'esito era negativo viene segnalato con un allert
            // inoltre viene offerta la possibilita' di richiedere il permesso
            } else {

                const id_fascicolo = parseInt(response.element_id);
                this.permissionMap[id_fascicolo]["permission_sent"] = false;

                // Aggiorniamo la scritta dello status
                const status = document.getElementById(`fascicolo_numero_${id_fascicolo}_status`);
                status.style.color = 'rgb(219, 35, 35)';
                status.innerHTML = 'Permesso rifiutato.';

                this.showResponseMessage(`Permesso non concesso per il fascicolo ${id_fascicolo}.`);

            }

        });

    }



    // All'invocazione, preso l'array di fascicoli estratto dalla risposta in input
    // per ogni fascicolo presente nella lista, viene aggiunto un elemento alla lista di fascicoli
    addElementToList(fascicolo){

        // Viene inizializzato la permission map per il fascicolo
        this.updatePermissionMap(fascicolo);

        // Aggiunta dell'elemento
        const elementAdded = this.addElementToScrollableList(`${fascicolo.id_fascicolo}`, fascicolo.titolo, fascicolo.contenuto, fascicolo.permission_required);

        // Aggiunta dei dettagli interni
        this.addStatusToEvidence(elementAdded, fascicolo);

        // Aggiunta dell'event listener
        elementAdded.addEventListener('click', () => {

            this.addEventsOnElement(fascicolo);

        });

    };


    addEventsOnElement(fascicolo){

        console.log("fascicolo: ", fascicolo);
        console.log("permissionMap: ", this.permissionMap);
        
        // Se il fascicolo non ha bisogno di permesso lo mostriamo direttamente
        if(!fascicolo.permission_required) {
            super.showInfoCard(`fascicolo_numero_${fascicolo.id_fascicolo}`, fascicolo.titolo);

        // Se il fascicolo e' protetto e se non e' mai stato inviato il segnale per esso  
        // allora viene inviato un segnale ai capitani
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
                detective_name : localStorage.getItem('personal_name')
            };

            // E li inviamo
            socket.emit('evidence_permission_required', data_to_send);

            // Aggiorniamo la scritta dello status
            const status = document.getElementById(`fascicolo_numero_${fascicolo.id_fascicolo}_status`);
            status.style.color = 'rgb(219, 130, 35)';
            status.innerHTML = 'Richiesta inviata.';

        // Altrimenti se la card ha bisogno di permesso ma questo è stato concesso, la mostriamo
        } else if(fascicolo.permission_required && this.permissionMap[fascicolo.id_fascicolo]["permission_gained"]) {
            super.showInfoCard(`fascicolo_numero_${fascicolo.id_fascicolo}`, fascicolo.titolo);
        }

    }


    // Questo metodo inizializza la mappa dei permessi sui fascicoli
    updatePermissionMap(fascicolo){
        
        // Per ogni fascicolo, se il fascicolo ha bisogno del permesso
        // viene registrato nella mappa come falso
       
        if(fascicolo.permission_required){
            this.permissionMap[fascicolo.id_fascicolo] = {
                "permission_sent" : false,
                "permission_gained" : false
            };
        }

    }


    addStatusToEvidence(elementAdded, fascicolo){

        const permissionStatus = document.createElement('div');
            permissionStatus.classList.add('permission_status');
            const permissionText = document.createElement('div');
            permissionText.innerText = 'Stato: ';
            const status = document.createElement('div');
            status.id = `fascicolo_numero_${fascicolo.id_fascicolo}_status`;

            permissionStatus.appendChild(permissionText);
            permissionStatus.appendChild(status);

            permissionStatus.style.marginTop = '1%';
            permissionStatus.style.display = 'flex';
            permissionStatus.style.alignItems = 'center';
            permissionStatus.style.gap = '5px';

            // Aggiungiamo una scritta negativa se `permission required` è true
            if (fascicolo.permission_required) {
                status.style.color = 'rgb(219, 35, 35)';
                status.innerHTML = 'Permesso richiesto.';
            } else {
                status.style.color = 'rgb(79, 202, 66)';
                status.innerHTML = 'Permesso concesso.';
            }

            // Aggiungiamo all'elemento il suo stato
            elementAdded.appendChild(permissionStatus);


    }


}





