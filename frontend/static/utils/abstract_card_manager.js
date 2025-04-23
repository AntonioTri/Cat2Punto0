import { CheckMark } from '../../static/check_mark/check_mark.js';
import { EvidenceManager } from '../../static/utils/evidence_manager.js';
import { socket } from '../../static/utils/socket.js';
import { API_URL } from '../../static/config.js';

export class AbstractCardManager{


    // Il costruttore definisce come container di lavoro la pagina del create team
    constructor(containerSelector = 'body', checkMark = new CheckMark()){ 

        this.cardName = containerSelector;
        this.card = document.querySelector(`#${containerSelector}.action_card`);
        this.container = this.card.querySelector('#inner_content');
        this.checkMark = checkMark;
        this.evidenceManager = new EvidenceManager();

        // Metodo da overraidare per l'inizializzazione
        this.init();
        
        // La seguente variabile serve ad indicare quando il bottone può mandare richieste al server
        // Serve ad impedire che avvenga uno spam e quindi un sovraccarico del server
        this.canSendRequest = true;
    };


    init(){
        throw new Error("Il metodo 'init' deve essere implementato nella sottoclasse");
    };

    async sendRequest(){
        this.canSendRequest = true;
        throw new Error("Il metodo 'sendRequest' deve essere implementato nella sottoclasse");
    };


    // Metodo che aggiunge alla card il blocco, impedendo di usare le funzioni normalmente
    addLocker(signal = ""){

        // Vengono definiti i segnali di accensione e spegnimento
        const signalOn = signal + "_on";
        const signalOff = signal + "_off";

        // Viene creato il locker dedicato
        this.createLocker();
        // Viene attivato
        this.activateLocker();
        // E vengono impostati i listener alla socket per il segnale di sblocco
        socket.on(signalOn, (msg) => { console.log(msg.msg); this.deactivateLocker()});
        // E per il segnale di blocco
        socket.on(signalOff, (msg) => { console.log(msg.msg); this.activateLocker()});
        // Viene poi inviata la richiesta per ottenere l'attuale stato della cache
        this.askForLockerStatus(signal);

    };

    // Metodo che crea lo screen del lock in sovrapposizione alla card attuale
    createLocker() {
        // Evita di creare locker multipli
        if (this.card.querySelector('.locker-overlay')) return;
    
        // Crea il div dell'overlay
        const locker = document.createElement('div');
        locker.classList.add('locker-overlay');
    
        // Contenuto centrale: simbolo o scritta
        const content = document.createElement('div');
        content.classList.add('locker-content');
        content.innerText = '🔒 BLOCCATO';
        
        // Aggiunge il contenuto all’overlay
        locker.appendChild(content);

        // Indice z e tempi di
        locker.style.zIndex = '1000';
        locker.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        // Forza uno stato iniziale fuori scala e invisibile
        locker.style.opacity = '0';
        locker.style.transform = 'scale(1.2)';
        
        // Reference al locker
        this.locker = locker;

    }


    activateLocker() {

        this.card.appendChild(this.locker);
        
        void this.locker.offsetWidth;
        this.locker.style.opacity = '1';
        this.locker.style.transform = 'scale(1)';
    }
    

    // Metodo per disattivare il locker con animazione inversa
    deactivateLocker() {
        
        // Anima verso invisibile e ingrandito
        this.locker.style.opacity = '0';
        this.locker.style.transform = 'scale(1.2)';
        
        setTimeout(() => { this.locker.remove(); }, 400);

    }



    // Questo metodo chiede i dati nella cache del back end
    askCacheData(signal_root){

        const data_to_send = {
            token : localStorage.getItem('access_token'),
            socket : localStorage.getItem('socket'),
            team_id : localStorage.getItem('team_id')
        }

        socket.emit(signal_root, data_to_send);
        console.log('Richiesta Dati cache per la carta: ', this.cardName);

    };


    // Se richiamato il metodo agiunge un anchor point per scaricare un pdf
    addDownloaderPDF(anchorPointText = "", pdfName = ""){

        const anchor = document.createElement('a');
        anchor.href =`${window.location.protocol}//${window.location.host}/static/PDF/${pdfName}.pdf`;
        anchor.download = `${pdfName}.pdf`;
        anchor.className = 'pdf-download';
        anchor.innerText = `${anchorPointText}`;

        // Reference nella classe
        this.anchor = anchor;
        this.container.appendChild(this.anchor);

    };


    // Questo metodo se chiamato attiva nella classe un listener di un evento globale
    // Vengono tradotti tutti gli elementi criptati della carta sulla base del modello di criptaggio
    // inviato dal segnale
    addCryptingEventListener(){

        socket.on('crypting_system_changed', (data) => {
            
            // Estrazione del nome dall'evento
            const system_name = data.systemName;

            // Uno switch case sceglie la traduzione da applicare
            switch (system_name) {
                
                case 'Serpent':
                    console.log(`Traduco la carta ${this.cardName} secondo il mdello ${system_name}.`);
                    break;
                
                case 'Dilithium':
                    console.log(`Traduco la carta ${this.cardName} secondo il mdello ${system_name}.`);
                    break;

                case 'Test3':
                    console.log(`Traduco la carta ${this.cardName} secondo il mdello ${system_name}.`);
                    break;
            
                default:
                    console.log(`Nessun modello inviato. ${data}`);
                    break;
            
            }
        });
    }



    async askForLockerStatus(lockerName = ""){

        // try-catch per gestire gli errori
        try {
            // Inviamo la richiesta con 'fetch'
            const URL = `${API_URL}/get_locker_statuses?team_id=${localStorage.getItem('team_id')}&socket=${localStorage.getItem('socket')}&locker_name=${lockerName}`;
            const response = await fetch(URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,  // Aggiungi il token di autorizzazione
                    "Content-Type": "application/json"  // Specifica che invii JSON
                }
            });

            if(!response.ok){
                console.log(`🌐❌  Errore nel richiedere la cache dei locker attivi. Risposta: ${response}`);
            }

        } catch (error) {
            console.log('🌐❌  Errore durante la get per gli status attivi: ', error);
        }

    };

    // Metodo che aggiunge un input tag
    addInputTag(id = "", placeholder = ""){

        // Dichiarmiamo un input tag, aggiungiamo id e dimensioni, poi lo aggiungiamo al DOM
        let nameInputTag = document.createElement('input');
        this.addGeneralStyleProperties(nameInputTag, id);
        nameInputTag.type = 'text';
        nameInputTag.placeholder = placeholder;
        this.container.appendChild(nameInputTag);
        this.nameInputTag = nameInputTag;

    };


    // Metodo che quando invocato aggiunge un submit button
    addSubmitButton(){

        // Dichiariamo un bottone
        let submitButton = document.createElement('button');
        this.addGeneralStyleProperties(submitButton, `${this.cardName}_submit_button`);
        submitButton.innerText = 'Invia';
        submitButton.style.border = '1px solid #ccc';

        this.container.appendChild(submitButton);
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

    // Metodo che aggiunge il selettore del team
    addSelector(id = 'some_selector', choiches = [], format = true) {
        // Dichiarmiamo e settiamo il selettore
        let selector = document.createElement('select');
        this.addGeneralStyleProperties(selector, id);

        // Normalizziamo l'array di scelte
        let options = this.formatChoiches(choiches, format);
    
        // Valore di fall back nel caso in cui non vi sia il team array o non abbia elementi
        if (!options || options.length === 0) {
            options = [{ name : 'None', id : 'none' }];
        }
        
        // Aggiungi le opzioni per ogni team presente
        options.forEach(choice => {
            // Definiamo la sua opzione
            let option = document.createElement('option');
            option.id = `${choice.name}_option`;
            option.value = `${choice.id}`;
            option.innerText = choice.name;
            selector.appendChild(option);
        });
    
        this.container.appendChild(selector);
        this.selector = selector;
    }

    // Questo metodo quando invocato crea un div che conterrà
    // generalmente le risposte del server
    addResponseMessage() {
        // Creazione del div
        let apiMessage = document.createElement('div');
        
        // Applicazione degli stili
        this.addGeneralStyleProperties(apiMessage, `${this.cardName}_api_message`);
        
        
        // Stili iniziali per l'animazione (alpha = 0)
        apiMessage.style.opacity = '0';
        apiMessage.style.transition = 'opacity 0.5s ease-in-out';
        apiMessage.style.position = 'relative';
        apiMessage.style.left = '50%';
        apiMessage.style.transform = 'translateX(-50%)';
        
        // Aggiunta al container
        this.container.appendChild(apiMessage);
        
        // Reference nella classe
        this.apiMessage = apiMessage;
    
    }


    // Quando invocato questo metodo mostra mostra un messaggio in sovrimpressione
    showResponseMessage(messageText = ""){
        // Imposta il testo personalizzato nel div
        this.apiMessage.innerText = messageText;

        // Funzione per animare l'opacità
        setTimeout(() => {
            this.apiMessage.style.opacity = '1'; // Gradualmente appare
            
            // Dopo 2 secondi, l'opacità torna a 0 e l'elemento viene rimosso
            setTimeout(() => {
                this.apiMessage.style.opacity = '0';
            }, 3000);

        }, 10); // Ritardo per consentire al browser di applicare lo stile iniziale
    }
    
    addScrollableList(id = "") {
        
        let scrollableList = document.createElement('div');
        scrollableList.id = id;
        scrollableList.classList.add('scrollable_div');
        scrollableList.style.width = '94%';
        scrollableList.style.marginTop = '2%';
        scrollableList.style.padding = '2%';
        scrollableList.style.height = 'calc(100% - 20px)';
        scrollableList.style.transform = 'translateX(1%)';
        scrollableList.style.display = 'flex';
        scrollableList.style.flexDirection = 'column';
        scrollableList.style.gap = '10px';
        scrollableList.style.overflowY = 'auto'; 
    
        this.container.appendChild(scrollableList);
        this.scrollableList = scrollableList;
    }
    
    
    
    addElementToScrollableList(id = "", textContent = "None") {
        let innerElement = document.createElement('div');
        innerElement.id = id;
        innerElement.style.width = '94%';
        innerElement.style.padding = '10px';
        innerElement.style.marginBottom = '10px'; 
        innerElement.style.borderRadius = '7px';
        innerElement.style.backgroundColor = 'white';
        innerElement.style.zIndex = '10';
        innerElement.style.display = 'flex';
        innerElement.style.flexDirection = 'column';
        innerElement.style.textAlign = 'left';
        innerElement.style.justifyContent = 'space-between';
        innerElement.style.fontSize = '16px';
        innerElement.style.fontWeight = 'bold';
        innerElement.innerText = textContent;
    
    
        this.scrollableList.appendChild(innerElement);
        
        return innerElement;
    }
    
    

    // Questo metodo mostra una card che compare e scompare in sovrimpressione al click di uno specifico tasto
    showInfoCard(title = "", content = ""){

        this.evidenceManager.showCard(title, content);

    }
    
    

    // Metodo che serve a uniformare un array di scelte per i selector
    formatChoiches(array = [], format = true){

        let formattedArray = [];
        array.forEach(element => {
            // Estraiamo i valori dall'oggetto, vengono posizionati in un array in ordine di comparsa
            const values = Object.values(element);
            // Se viene chiesto di formattare viene fatto
            let dict = {};
            if (format) {
                dict = {
                    name : values[0],
                    id   : values[1]
                }
            } else {
                dict = {
                    name : element,
                    id   : element
                }
            }
            
            formattedArray.push(dict);
        });

        // Restituiamo l'array formattato
        return formattedArray;
    }



    // Metodo che aggiunge uno stile generale all'elemento in questione
    addGeneralStyleProperties(element = NaN, id = ""){

        element.id = id;
        element.style.margin = '2%';
        element.style.borderRadius = '5px';
        element.style.textAlign = 'center'; 
        element.style.fontFamily = `'Courier New', Courier, monospace`;

    }


    // Metodo che setta le proprietà della action card
    setCardProperty(){
        // In questo caso sceglamo che gli elementi devono stare in colonna
        this.container.style.flexDirection = 'column';

    }

    // Metodo che restituisce uno specifico selector sulla base dell'id
    getSelectorById(id = ""){

        return this.container.querySelector(`#${id}`);

    }

}