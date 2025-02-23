import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { API_URL, SOCKET_URL } from '../../config.js';
import { socket } from '../../utils/socket.js';

export class FascicoliManager extends AbstractCardManager{


    constructor(containerSelector = 'Fascicoli', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }

    init(){

        this.fascicoli = [];
        this.setURLS();
        this.sendRequest();
        this.addScrollableList('evidence_list');

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
                const fascicoli = data.fascicoli;
                // Aggiunta dei bottoni sulla base dei fascicoli ottenuti dalla api
                this.addElementsToList(fascicoli);

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

                // Se il fascicolo e' protetto allora viene inviato un segnale al capitano
                if(fascicolo.permission_required){
                    // Dfiniamo i dati da inviare
                    const data_to_send = {
                        team_id : localStorage.getItem('team_id'),
                        id_fascicolo : fascicolo.id_fascicolo,
                        detective_socket : localStorage.getItem('socket')
                    };
                    
                    // E li inviamo
                    socket.emit('evidence_permission_required', data_to_send);
                
                // Nel caso opposto mostriamo direttamente la card
                } else {
                    super.showInfoCard(`fascicolo_numero_${fascicolo.id_fascicolo}`, fascicolo.titolo);
                }

            });
        
        });

    };


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





