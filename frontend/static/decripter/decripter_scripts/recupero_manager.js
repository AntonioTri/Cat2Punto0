import { API_URL } from '../../config.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';


export class RestoreManager extends AbstractCardManager{


    constructor(containerSelector = 'Recupero', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }


    init(){

        this.setURLS();
        this.addInputTag(`${this.cardName}_input_form`, 'Codice di recupero')
        this.addSubmitButton()
        this.addResponseMessage()
        this.addLocker("Recupero");

    }


    // Metodo che quando invocato estrae i dati dal form e li invia all'API
    async sendRequest(){

        const code = this.nameInputTag.value;
        // Se Non sono stati inseriti nomi non viene inviato il segnale
        if (code !== "") {
            this.manageRequest(code);
            
        // Viene reimpostata la flag se non vi sono nomi inseriti
        } else {
            this.canSendRequest = true;
        }

    }

    async manageRequest(code = ""){
        
        // try-catch per gestire gli errori
        try {

            // Definizione dei dati da inviare
            const data_to_send = {
                answer : code,
                team_id : localStorage.getItem('team_id'),
                socket : localStorage.getItem('socket')
            }

            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.URL_SEND_DEDUCTION, {  // Usa 'await' per aspettare la risposta
                method: "PUT",  // Cambia il metodo in POST, poiché stai inviando dati
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"
                },

                
                body: JSON.stringify(data_to_send)  // Definizione del corpo della richiesta contenente i dati da iviare
            
            });

            // Verifica se la risposta è OK
            if (response.ok) {
                console.log("Risposat della deduzione: ", response)
                // La risposta era corretta o era già stata risolta
                switch (response.status) {

                    // Caso di una risposta già data
                    case 200:
                        this.showResponseMessage('Risposta già data!')
                        this.checkMark.error()
                        break;

                    // Caso in cui la risposta sia corretta
                    case 201:
                        this.showResponseMessage('Codice di recupero corretto! Recupero dati ...')
                        this.checkMark.success()
                        break;

                }

            } else {
                
                super.showResponseMessage('Codice errato.');
                // Compare il check mark per l'errore
                this.checkMark.error();
            }

        } catch (error) {
            // Gestione degli errori
            console.error("Errore nella richiesta:", error);
            // Compare il check mark per l'errore
            this.checkMark.error();
        }


        // La flag viene reimpostata a true per far inviare la richiesta al server
        // Solo alla fine di tutto
        this.canSendRequest = true;


    }


    setURLS(){

        this.URL_SEND_DEDUCTION = `${API_URL}/answer_riddle`;
        
        this.dockerPathAnswerRiddle = 'http://localhost:5000/api/answer_riddle';


    }





}




