// Questa classe quando importata inizializza la pagina del create team
import {API_URL} from '../../config.js';
import { CheckMark } from '../../check_mark/check_mark.js';

export class CreateTeamManager{

    // Il costruttore definisce come container di lavoro la pagina del create team
    constructor(containerSelector = 'create_team', checkMark = new CheckMark()){ 

        this.cardName = containerSelector;
        this.card = document.querySelector(`#${containerSelector}.action_card`);
        this.container = this.card.querySelector('#inner_content');
        this.checkMark = checkMark;
        this.init();

        // La seguente variabile serve ad indicare quando il bottone può mandare richieste al server
        // Serve ad impedire che avvenga uno spam e quindi un sovraccarico del server
        this.canSendRequest = true;
    }

    // La funzione init inizializza tutta la pagina e ne associa le funzionalità
    init(){

        this.setURLS();
        this.setCardProperty();
        this.addTeamCreator();
        this.addSubmitButton();

    }

    // Metodo che quando invocato estrae i dati dal form e li invia all'API
    sendRegisterRequest(){

        const teamName = this.teamCreator.value;
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
            const response = await fetch(this.URL_REGISTER_TEAM, {  // Usa 'await' per aspettare la risposta
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
                // Puoi eseguire altre azioni qui, come aggiornare l'interfaccia utente o navigare a una nuova pagina
                // TODO: aggiungere la card di animazione del check mark verde ed il messaggio in 
                // sovrimpressione
                console.log(data);
                // Compare il check mark per il successo
                this.checkMark.success();

            } else {
                // La risposta non è stata OK
                console.log("Errore nella creazione del team:", response.status);
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


    // Metodo che setta le proprietà della action card
    setCardProperty(){
        // In questo caso sceglamo che gli elementi devono stare in colonna
        this.container.style.flexDirection = 'column';

    }

    // Questo invece aggiunge il submit button per inviare
    // il nuovo nome all'api
    addSubmitButton(){

        let submitButton = document.createElement('button');
        // Settiamo lo stile generale
        this.setGeneralStyle(submitButton)
        // Definiamo l'id, combinazione tra il card name ed il tipo generale dell'elemento
        submitButton.id = `${this.cardName}_submit_button`;
        submitButton.innerText = 'Submit';

        // Piccolo adjust sulla larghezza
        submitButton.style.width = '52%';
        // Cambio del colore di sfondo
        submitButton.style.border = '1px solid #ccc';

        // Aggiunta degli eventi al click
        submitButton.addEventListener('click', () => {

            // Invia richiesta al server se può essere inviata
            if (this.canSendRequest) {
                // Viene settata la flag a false una volta fatto
                this.canSendRequest = false;
                // Invio della richiesta
                // dopo la risposta del server il bottone ritorna premibile
                this.sendRegisterRequest();
            }

            
            // Variabili e timerper le animazioni
            submitButton.classList.add('active');
            setTimeout(() => {
                submitButton.classList.remove('active');
            }, 300);


        });


        
        this.container.appendChild(submitButton);
        // Reference nella classe
        this.submitButton = submitButton;

    }


    // Questo metodo crea, inizializza ed agiunge alla card l'imput form
    // per inserire il nome del team
    addTeamCreator(){

        let teamCreator = document.createElement('input');
        // Settiamo lo stile generale
        this.setGeneralStyle(teamCreator)
        // Definiamo l'id, combinazione tra il card name ed il tipo generale dell'elemento
        teamCreator.id = `${this.cardName}_input_form`;

        // Altri stili opzionali per migliorare l'aspetto
        teamCreator.style.border = '1px solid #ccc';

        //Tipo
        teamCreator.type = 'text';
        // Placeholder
        teamCreator.placeholder = 'Team Name';

        // Stile per quando l'input è in focus (quando ci clicchi sopra)
        teamCreator.addEventListener('click', function() {
            teamCreator.style.border = '1px solid #0099CC'; // Cambia il colore del bordo
        });

        // Stile per quando l'input perde il focus (per tornare al colore originale)
        teamCreator.addEventListener('blur', function() {
            teamCreator.style.border = '1px solid #ccc'; // Ritorna al bordo originale
        });

        // Si aggiunge il tag alla card di referenza
        this.container.appendChild(teamCreator);
        // Reference nella classe
        this.teamCreator = teamCreator;


    }


    setGeneralStyle(element){

        element.style.position = 'relative';
        element.style.width = '50%';

        // Imposta altezza e padding
        // Aumenta l'altezza
        element.style.height = '27px'; 
        // Aggiunge spazio interno
        element.style.padding = '1%'; 
        // Aggiunta di spazio esterno
        element.style.margin = '2%';

        // Centra il testo
        // Centra orizzontalmente il testo
        element.style.textAlign = 'center'; 
        // Centra verticalmente 
        element.style.verticalAlign = 'middle'; 

        // Altri stili opzionali per migliorare l'aspetto
        element.style.borderRadius = '5px';
        element.style.fontFamily = `'Courier New', Courier, monospace`;

    }

    // Questo metodo quando invocato inserisce nella classe gli url e le rotte per le chiamate API
    setURLS(){

        // URL di registrazione team
        this.URL_REGISTER_TEAM = `${API_URL}/add_team`;
        // URL di registrazione utente
        this.URL_ADD_TEAM_MEMBER = `${API_URL}/register_user`;

    }


}