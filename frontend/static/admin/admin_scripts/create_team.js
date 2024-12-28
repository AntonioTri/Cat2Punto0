// Questa classe quando importata inizializza la pagina del create team
import {API_URL} from '../../config.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';


export class CreateTeamManager extends AbstractCardManager{

    constructor(containerSelector = 'create_team', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }

    init(){

        this.setURLS();
        super.setCardProperty();
        super.addInputTag(`${this.cardName}_input_form`);
        super.addSubmitButton();

    }


    // Metodo che quando invocato estrae i dati dal form e li invia all'API
    async sendRequest(){

        const teamName = this.nameInputTag.value;
        // Se Non sono stati inseriti nomi non viene inviato il segnale
        if (teamName !== "") {
            this.manageRequest(teamName);
            
        // Viene reimpostata la flag se non vi sono nomi inseriti
        } else {
            this.canSendRequest = true;
        }

    }


    // Metodo che invia la richiesta, è di tipo asincrono quindi viene eseguita in un thread separato
    async manageRequest(teamName){

        // try-catch per gestire gli errori
        try {

            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.dockerPathAddTeam, {  // Usa 'await' per aspettare la risposta
                method: "POST",  // Cambia il metodo in POST, poiché stai inviando dati
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                },
                body: JSON.stringify({ team_name : teamName })  // Invia il nome del team nel corpo della richiesta
            });

            // Verifica se la risposta è OK
            if (response.ok) {
                // La risposta è stata corretta
                const data = await response.json();  // Converte la risposta in JSON
                // TODO: aggiungere il messaggio in sovrimpressione
                console.log(data);
                // Compare il check mark per il successo
                this.checkMark.success();
                // Inviamo il segnale per indicare che il team è stato registrato,
                // in modo da poter aggiornare la pagina della creazione degli utenti
                this.sendCustomEvent();

            } else {
                // La risposta non è stata OK
                console.log("Errore nella creazione del team:", response);
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


    // Quando invocata questa funzione lancia un evento globale per segnalare
    // che il team è stato creato
    sendCustomEvent(){

        // Creazione del segnale
        const teamRegistered = new CustomEvent('newTeamRegistered', {});
        // Lancio del segnale
        document.dispatchEvent(teamRegistered);
        // Log
        console.log('Segnale di creazione team inviato con successo');

    };

    // Questo metodo quando invocato inserisce nella classe gli url e le rotte per le chiamate API
    setURLS(){

        // URL di registrazione team
        this.URL_REGISTER_TEAM = `${API_URL}/add_team`;
        // URL di registrazione utente
        this.URL_ADD_TEAM_MEMBER = `${API_URL}/register_user`;
        // Docker paths
        this.dockerPathAddTeam = 'http://localhost:5000/api/add_team';
        this.dockerPathRegisterUser = 'http://localhost:5000/api/add_team';

    }

}



