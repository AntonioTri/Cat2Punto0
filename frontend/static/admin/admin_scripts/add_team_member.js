import {API_URL} from '../../config.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { roles } from '../../utils/constants.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';


export class AddTeamMemberManager extends AbstractCardManager{


    constructor(containerSelector = 'add_team_member', checkMark = new CheckMark()){

        super(containerSelector, checkMark);
        
    }
    
    
    init(){
        
        // Variabile che conserva i nomi dei team
        this.teamsName = [{team : 'None'}];
        this.setURLS();
        super.setCardProperty();
        this.addElements();
        this.updateTeamList();
        this.addTeamCreationListener();
        this.teamSelector = super.getSelectorById('team_selector');
        this.roleSelector = super.getSelectorById('role_selector');

    }


    // Metodo che inserisce tutti gli elementi nella card
    addElements(){

        super.addSelector('team_selector');
        super.addSelector('role_selector', roles, false);
        super.addInputTag('name_input_tag');
        super.addSubmitButton();
        super.addResponseMessage();

    };


    

    async sendRequest(){
        
        // Estrazione dei dati dal form
        const inputData = this.getInputData();
        // Se viene ritornato falso la funzione ritorna e non invia la richiesta
        // Inoltre il bottone torna ad essere premibile
        if (inputData === false){
            console.log('Qualche campo negli input field sta mancando! Inserisci bene i dati e riprova.');
            this.checkMark.error();
            this.showResponseMessage('Inserire tutti i dati!');
            this.canSendRequest = true;
            return;
        }
         
        console.log("Dati inviati:", inputData);

        // try-catch per gestire gli errori
        try {

            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.URL_ADD_TEAM_MEMBER, {  // Usa 'await' per aspettare la risposta
                method: "POST",  // Cambia il metodo in POST, poiché stai inviando dati
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                },
                body: JSON.stringify(inputData)  // Invio dei dati dell'utente nel corpo della richiesta
            });

            // Verifica se la risposta è OK
            if (response.ok) {
                // La risposta è stata corretta
                const data = await response.json();  // Converte la risposta in JSON
                // TODO: aggiungere il messaggio in sovrimpressione
                console.log(data);
                // Compare il check mark per il successo
                this.checkMark.success();
                // Si mostra il messaggio di successo
                this.showResponseMessage('Membro aggiunto con successo!');

            } else {
                // La risposta non è stata OK
                console.log("Errore nella registrazione del membro del team:", response);
                // In base al caso viene mostrato un messaggio specifico
                switch (response.status) {

                    case 409:
                        super.showResponseMessage('Nome non disponibile.');
                        break;

                    case 404:
                        super.showResponseMessage('Team non trovato.');
                        break;
                        
                    case 500:
                        super.showResponseMessage('Errore del server.');
                        break;
                        
                    default:
                        super.showResponseMessage('Errore del server.');
                        break;
                }
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
            const response = await fetch(this.URL_GET_ALL_TEAMS, {  // Usa 'await' per aspettare la risposta
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
                this.sendAvaiableTeamsList();

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
        return { "team_id": teamID, "role": role, "username": username.trim() };
    };

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
    
    // Quando invocata questa funzione lancia un evento globale per inviare
    // I team disponibili
    sendAvaiableTeamsList(){

        // Creazione del segnale
        const teamList = new CustomEvent('teamList', {
            detail: this.teamsName
        });
        // Lancio del segnale
        document.dispatchEvent(teamList);
        // Log
        console.log('Segnale globale di aggiornamento team inviato.');

    };


    // Metodo che setta gli URL
    setURLS(){

        this.URL_ADD_TEAM_MEMBER = `${API_URL}/register_user`;
        this.URL_GET_ALL_TEAMS = `${API_URL}/get_all_teams`;
        this.dockerPathTeams = 'http://localhost:6000/api/get_all_teams';
        this.dockerPathAddMember = 'http://localhost:6000/api/register_user';

    }


}
