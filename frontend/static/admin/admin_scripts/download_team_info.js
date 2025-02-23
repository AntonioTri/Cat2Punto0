import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { API_URL } from '../../config.js';


export class DownloadCardManager extends AbstractCardManager{


    constructor(containerSelector = 'download_team', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    };

    init(){

        // Variabile che conserva i nomi dei team
        this.teamsName = [{team : 'None'}];
        this.addURLS();
        super.addSelector('download_team_selector', this.teamsName);
        this.teamSelector = super.getSelectorById('download_team_selector');
        super.addSubmitButton();
        this.addTeamCreationListener();
        super.addResponseMessage();

    };


    async sendRequest(){

        // Estrazione del valore attualmente selezionato, il valore corrisponde all'id
        const teamID = parseInt(this.teamSelector.value);

        // try-catch per gestire gli errori
        try {

            // Inviamo la richiesta con 'fetch'
            const response = await fetch(this.URL_DOWNLOAD_TEAM, {  // Usa 'await' per aspettare la risposta
                method: "PUT",  // Cambia il metodo in POST, poiché stai inviando dati
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                },
                body: JSON.stringify({ team_id : teamID })  // Invia il nome del team nel corpo della richiesta
            });

            // Verifica se la risposta è OK
            if (response.ok) {

                // Converte la risposta in BLOB
                const blob = await response.blob();  
                // Creazione del link sulla base del blob
                const URL = window.URL.createObjectURL(blob);
                
                // Creazione di una anchor associandovi URL e nome del dowload
                const a = document.createElement('a');
                a.href = URL;
                a.download = `${this.teamSelector.options[this.teamSelector.selectedIndex].text}_info.pdf`;
                a.style.position = 'absolute';
                
                // Aggiungiamo, clicchiamo e rimuoviamo la anchor alla pagina per avviare il download
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(URL);

                // Viene mostrato il messaggio di buona riuscita
                super.showResponseMessage('Download avvenuto con successo!');

                // Compare il check mark per il successo
                this.checkMark.success();


            // La risposta non è stata OK
            } else {
                console.log("Errore nel download delle info del team:", response);

                // Viene mostrato il messaggio in sovrimpressione in base allo status
                switch (response.status) {
                    case 404:
                        this.showResponseMessage('Il team non ha utenti.');
                        break;
                    default:
                        this.showResponseMessage('Errore nella ricezione del file.');
                        break;
                }
                // Compare il check mark per l'errore
                this.checkMark.error();
            }

        } catch (error) {
            // Gestione degli errori
            console.error("Errore nella richiesta:", error);
            // Messaggio in sovrimpressione
            this.showResponseMessage('Errore non specificato.');
            // Compare il check mark per l'errore
            this.checkMark.error();
        }


        // La flag viene reimpostata a true per far inviare la richiesta al server
        // Solo alla fine di tutto
        this.canSendRequest = true;

    };

    
    // Metodo che aggiunge alla card un event listener associato alla creazione di un team
    addTeamCreationListener(){
        // aggiunta dell'event listener alla card
        document.addEventListener('teamList', (event) => {
            // Invocazione della funzione che esegue prima la GET alla api
            // e poi aggiorna il selettore
            this.teamsName = event.detail;
            console.log('Team ricevuti con successo dal segnale. Update della lista in corso... | ', this.teamsName);
            this.updateTeamSelector();
            
        });
        
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


    // Questo metodo quando invocato inserisce nella classe gli url e le rotte per le chiamate API
    addURLS(){

        // URL per ottenere il download in base al team id
        this.URL_DOWNLOAD_TEAM = `${API_URL}/get_team_pdf`;
        // Docker paths
        this.dockerPathDownloadTeam = 'http://localhost:6000/api/get_team_pdf';
        
    };

}

