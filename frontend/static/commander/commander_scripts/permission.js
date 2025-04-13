import {API_URL, SOCKET_URL} from '../../config.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { roles } from '../../utils/constants.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class PermissionManager extends AbstractCardManager {

    constructor(containerSelector = 'Permessi', checkMark = new CheckMark(), socket = null){

        super(containerSelector, checkMark);
        this.socket = socket;

    }

    init(){

        this.setURLS();
        this.addElements();
        this.setSocketListeners();
        // Questa pagina è bloccata dal segnale 'permissions'
        this.addLocker('permissions_on', 'permissions_off');
    };


    addElements(){

        this.addScrollableList('permission_list');

    }

    setSocketListeners(){
        
        setTimeout(() => {
             // Socket listener per controllare che sia arrivato un permesso sui file
             this.socket.on('permission_required_for_file', (data) => {
    
                console.log("Messaggio dalla socket ricevuto: ", data);
                this.addPermissionListelement('Fascicolo', data.id_fascicolo, data.detective_name, data.detective_socket);

            
            });
        }, 1500);


    }

    addPermissionListelement(tipologia, element_id, client_name, client_socket){

        // Creiamo la mini card ed i bottoni associati
        const permissionCard = document.createElement('div');
        const permissionType = document.createElement('div');
        const clientToAsk = document.createElement('div');
        // container interni per il nome ed il tipo della richesta
        permissionType.innerHTML = `${tipologia} ${element_id}.`;
        clientToAsk.innerHTML = `Richiesto da: ${client_name}`;
        permissionCard.appendChild(permissionType);
        permissionCard.appendChild(clientToAsk);

        // Aggiunta delle classi
        permissionCard.classList.add(tipologia);
        permissionCard.classList.add('permission_card');

        // Creiamo i bottoni con testo e spazi dedicati
        const buttonSpace = document.createElement('div');
        const agreeButton = document.createElement('button');
        const declineButton = document.createElement('button');

        // Aggiungi simboli ai pulsanti
        agreeButton.innerHTML = '✔️';
        declineButton.innerHTML = '❌';
        agreeButton.classList.add('agreeButton');
        declineButton.classList.add('declineButton');
        // Aggiungiamo gli eventi ai bottoni
        this.addEventOnButtons(agreeButton, declineButton, permissionCard, element_id, client_socket);

        buttonSpace.classList.add('buttonSpace');
        buttonSpace.appendChild(agreeButton);
        buttonSpace.appendChild(declineButton);


        // Aggiungiamo i bottoni alla card
        permissionCard.appendChild(buttonSpace);

        // Aggiunta della card agli elementi scrollabili
        this.scrollableList.appendChild(permissionCard);

    }


    addEventOnButtons(agreeButton, declineButton, permissionCard, element_id, client_socket){
  
            agreeButton.addEventListener('click', () => {
                this.buttonEvent(permissionCard, element_id, client_socket, true);
            });

            declineButton.addEventListener('click', () => {
                this.buttonEvent(permissionCard, element_id, client_socket, false);
            });


    }

    buttonEvent(permissionCard, element_id, client_socket, permission){
        // Creiamo i dati da inviare
        const data_to_send = {
            token : localStorage.getItem('access_token'),
            element_id : element_id,
            client_socket : client_socket,
            permission : permission
        }

        console.log('Provo ad inviare il permesso al client. Dati da inviare: ', data_to_send);
        // Inviamo i dati nella socket
        this.socket.emit('give_evidence_permission', data_to_send);

        // Aggiungiamo la classe deleted al permesso così da applicare le animazioni
        permissionCard.classList.add('deleted');

        // Dopo un breve lasso di tempo eliminiamo dal dom la permission card
        setTimeout(() => {
            permissionCard.parentNode.removeChild(permissionCard);
        }, 500 );

    }


    setURLS(){}


}
