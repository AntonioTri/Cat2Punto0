import {API_URL} from '../../config.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { roles } from '../../utils/constants.js';

export class AddTeamMemberManager{

    // Il costruttore definisce come container di lavoro la pagina del create team
    constructor(containerSelector = 'add_team_member', checkMark = new CheckMark()){ 

        this.cardName = containerSelector;
        this.card = document.querySelector(`#${containerSelector}.action_card`);
        this.container = this.card.querySelector('#inner_content');
        this.checkMark = checkMark;
        // Variabile che conserva i nomi dei team
        this.teamsName = [{team : 'None'}];

        this.init();
        
        // La seguente variabile serve ad indicare quando il bottone può mandare richieste al server
        // Serve ad impedire che avvenga uno spam e quindi un sovraccarico del server
        this.canSendRequest = true;
    };

    init(){

        this.setURLS();
        this.setCardProperty();
        this.addElements();
        this.updateTeamList();
        this.addTeamCreationListener();

    };

    // Metodo che inserisce tutti gli elementi nella card
    addElements(){

        this.addTeamSelector();
        this.addRoleSelector();
        this.addNameInputTag();
        this.addSubmitButton();

    };


    async sendRequest(){
        
        // Estrazione dei dati dal form
        const inputData = this.getInputData();
        // Se viene ritornato falso la funzione ritorna e non invia la richiesta
        // Inoltre il bottone torna ad essere premibile
        if (inputData === false){
            console.log('Qualche campo negli input field sta mancando! Inserisci bene i dati e riprova.');
            this.checkMark.error();
            this.canSendRequest = true;
            return;
        }
         
        console.log("Dati inviati:", inputData);

        // try-catch per gestire gli errori
        try {

            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.dockerPathAddMember, {  // Usa 'await' per aspettare la risposta
                method: "POST",  // Cambia il metodo in POST, poiché stai inviando dati
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                },
                body: inputData  // Invio dei dati dell'utente nel corpo della richiesta
            });

            // Verifica se la risposta è OK
            if (response.ok) {
                // La risposta è stata corretta
                const data = await response.json();  // Converte la risposta in JSON
                // TODO: aggiungere il messaggio in sovrimpressione
                console.log(data);
                // Compare il check mark per il successo
                this.checkMark.success();

            } else {
                // La risposta non è stata OK
                console.log("Errore nella registrazione del membro del team:", response);
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

    // Metodo che invia la richiesta GET per ottenere tutti i team, è di tipo asincrono quindi viene eseguita in un thread separato
    async updateTeamList(){

        // try-catch per gestire gli errori
        try {

            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.dockerPathTeams, {  // Usa 'await' per aspettare la risposta
                method: "GET",  // Cambia il metodo in POST, poiché stai inviando dati
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                }
            });

            // Verifica se la risposta è OK
            if (response.ok) {
                // La risposta è stata corretta
                const data = await response.json();  // Converte la risposta in JSON
                // TODO: aggiungere il messaggio in sovrimpressione
                console.log(data);
                // Memorizzazione in locale dei dati ricevuti
                this.teamsName = data.teams;
                // Update della lista di team
                this.updateTeamSelector();

            } else {
                // La risposta non è stata OK
                console.log("Errore durante la ricezione dei team disponibili:", response.status);

            }

        } catch (error) {
            // Gestione degli errori
            console.error("Errore nella richiesta:", error);

        }


    };

    // Quando invocato questo metodo restituisce gli attuali valori del form selezionati
    getInputData() {
        // Estrazione del team
        const teamID = parseInt(this.teamSelector.value, 10); // Specifica base 10 per chiarezza
        const role = this.roleSelector.value;
        const username = this.nameInputTag.value;
    
        // Validazione dei campi
        if (isNaN(teamID) || teamID <= 0 || username.trim() === "") {
            return false; // Restituisce false se i campi non sono validi
        }
    
        // Restituisce i dati validi
        return { team_id: teamID, role: role, username: username.trim() };
    };
    

    
    // Metodo che aggiunge il selettore del team
    addTeamSelector() {
        let teamSelector = document.createElement('select');
        this.addGeneralStyleProperties(teamSelector, 'team_selector');
    
        // Valore di fall back nel caso in cui non vi sia il team array o non abbia elementi
        if (!this.teamsName || this.teamsName.length === 0) {
            this.teamsName = [{ team: 'None', team_id: 'none' }];
        }
    
        // Aggiungi le opzioni per ogni team presente
        this.teamsName.forEach(team => {
            let teamChoiche = document.createElement('option');
            teamChoiche.id = `${team.team}_option`;
            teamChoiche.value = `${team.team_id}`;
            teamChoiche.innerText = team.team;
            teamSelector.appendChild(teamChoiche);
        });
    
        this.container.appendChild(teamSelector);
        this.teamSelector = teamSelector;
    }
    

    // Metodo che quando invocato aggiorna il contenuto del selettore di team
    updateTeamSelector() {
        // Svuota tutte le opzioni esistenti nel selettore
        this.teamSelector.innerHTML = '';
    
        // Aggiungi ogni team come opzione al selettore
        this.teamsName.forEach(team => {
            let teamChoiche = document.createElement('option');
            teamChoiche.id = `${team.team_name}_option`; 
            teamChoiche.value = `${team.team_id}`;
            teamChoiche.innerText = team.team_name;
            this.teamSelector.appendChild(teamChoiche);
        });

    }
    
    
    
    
    // Metodo che aggiunge il selettore per il ruolo
    addRoleSelector(){

        // dichiariamo un selettore
        let roleSelector = document.createElement('select');
        this.addGeneralStyleProperties(roleSelector, 'role_selector');

        // Per ogni ruolo aggiungiamo una selezione
        roles.forEach(role => {

            // Creazione della option
            let roleChoice = document.createElement('option');
            roleChoice.value = role;
            roleChoice.style.textAlign = 'center'; 
            roleChoice.innerText = role;
            roleSelector.appendChild(roleChoice);

        });

         // Alla fine aggiungiamo alla card il selettore e generiamo una reference
         this.container.appendChild(roleSelector);
         this.roleSelector = roleSelector;

    };
    
    
    // Metodo che aggiunge l'input tag per il nome
    addNameInputTag(){

        // Dichiarmiamo un input tag, aggiungiamo id e dimensioni, poi lo aggiungiamo al DOM
        let nameInputTag = document.createElement('input');
        this.addGeneralStyleProperties(nameInputTag, 'name_input_tag');
        nameInputTag.type = 'text';
        nameInputTag.placeholder = 'Username';
        nameInputTag.style.width = '47%';
        this.container.appendChild(nameInputTag);
        this.nameInputTag = nameInputTag;

    };


    // Metodo che
    addSubmitButton(){

        // Dichiariamo un bottone
        let buttonContainer = document.createElement('div');
        let submitButton = document.createElement('button');
        this.addGeneralStyleProperties(submitButton, `${this.cardName}_submit_button`);
        submitButton.innerText = 'Submit';
        submitButton.style.border = '1px solid #ccc';

        buttonContainer.appendChild(submitButton);
        this.container.appendChild(buttonContainer);
        this.submitButton = submitButton;
        
        // Aggiunta di un evento on clock per animazioni e chiamate api
        this.submitButton.addEventListener('click', () => {
            
            // Settaggio della variabile su falso
            this.canSendRequest = false;
            
            // Aggiunta della classe per fare l'animazione
            this.submitButton.classList.add('active');
            // Definizione del timer per rimuoverla
            setTimeout(() => {
                this.submitButton.classList.remove('active');
            }, 300);

            // Metodo per fare chiamate API ...
            this.sendRequest();

        });

    };


    // Metodo che aggiunge uno stile generale all'elemento in questione
    addGeneralStyleProperties(element = NaN, id = ""){

        element.id = id;
        element.style.margin = '1%';
        element.style.width = '52%';
        element.style.padding = '2%';
        element.style.borderRadius = '5px';
        element.style.textAlign = 'center'; 
        element.style.fontFamily = `'Courier New', Courier, monospace`;

    }

    // Metodo che setta le proprietà della action card
    setCardProperty(){
        // In questo caso sceglamo che gli elementi devono stare in colonna
        this.container.style.flexDirection = 'column';

    }

    // Metodo che aggiunge alla card un event listener associato alla creazione di un team
    addTeamCreationListener(){
        // aggiunta dell'event listener alla card
        document.addEventListener('newTeamRegistered', (event) => {
            // Invocazione della funzione che esegue prima la GET alla api
            // e poi aggiorna il selettore
            console.log('Segnale di aggiunta team ricevuto. Update della lista in corso...');
            this.updateTeamList();
        });

    }

    // Metodo che setta gli URL
    setURLS(){

        this.URL_ADD_TEAM_MEMBER = `${API_URL}/register_user`;
        this.URL_GET_ALL_TEAMS = `${API_URL}/get_all_teams`;
        this.dockerPathTeams = 'http://localhost:5000/api/get_all_teams';
        this.dockerPathAddMember = 'http://localhost:5000/api/register_user';

    }


}
