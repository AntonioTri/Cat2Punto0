import { CheckMark } from '../../static/check_mark/check_mark.js';
import { EvidenceManager } from '../../static/utils/evidence_manager.js';

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
        throw new Error("Il metodo 'area' deve essere implementato nella sottoclasse");
    };

    async sendRequest(){
        this.canSendRequest = true;
        throw new Error("Il metodo 'sendRequest' deve essere implementato nella sottoclasse");
    };


    // Metodo che aggiunge un input tag
    addInputTag(id = ""){

        // Dichiarmiamo un input tag, aggiungiamo id e dimensioni, poi lo aggiungiamo al DOM
        let nameInputTag = document.createElement('input');
        this.addGeneralStyleProperties(nameInputTag, id);
        nameInputTag.type = 'text';
        nameInputTag.placeholder = 'Username';
        nameInputTag.style.width = '47%';
        this.container.appendChild(nameInputTag);
        this.nameInputTag = nameInputTag;

    };


    // Metodo che quando invocato aggiunge un submit button
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
        scrollableList.style.height = 'calc(100% - 20px)'; // Adatta l'altezza al contenitore
        scrollableList.style.transform = 'translateX(1%)';
        scrollableList.style.display = 'flex';
        scrollableList.style.flexDirection = 'column';
        scrollableList.style.gap = '10px';
        scrollableList.style.overflowY = 'auto'; 
    
        this.container.appendChild(scrollableList);
        this.scrollableList = scrollableList;
    }
    
    
    
    addElementToScrollableList(id = "", textContent = "None", contenuto = "some_content", isProtected = false) {
        let innerElement = document.createElement('div');
        innerElement.id = id;
        innerElement.style.width = '94%';
        innerElement.style.padding = '10px';
        innerElement.style.marginBottom = '10px'; 
        innerElement.style.borderRadius = '7px';
        innerElement.style.backgroundColor = 'white';
        innerElement.style.zIndex = '10';
        innerElement.style.display = 'flex';
        innerElement.style.alignItems = 'center';
        innerElement.style.justifyContent = 'space-between'; // Cambiato per spazio tra testo e catenaccio
        innerElement.style.textAlign = 'center';
        innerElement.style.fontSize = '16px';
        innerElement.style.fontWeight = 'bold';
        innerElement.innerText = textContent;
    
        // Aggiungiamo al local storage il contenuto da referenziare al click dell'elemento
        if (localStorage.getItem(`fascicolo_numero_${id}`) === null) {
            localStorage.setItem(`fascicolo_numero_${id}`, contenuto);
        }
    
        // Mostriamo nella console il contenuto del fascicolo
        console.log('Dati salvati nel local storage', localStorage.getItem(`fascicolo_numero_${id}`));
    
        // Aggiungiamo il catenaccio se `isProtected` è true
        if (isProtected) {
            let lockIcon = document.createElement('span');
            lockIcon.innerText = ''; // Icona catenaccio (Unicode)
            lockIcon.style.marginLeft = 'auto'; // Spinge l'icona verso destra
            lockIcon.style.fontSize = '16px';
            innerElement.appendChild(lockIcon);
        }
    
        this.scrollableList.appendChild(innerElement);
        
        return innerElement;
    }
    
    

    // Questo metodo mostra una card che compare e scompare in sovrimpressione al click di uno specifico tasto
    showInfoCard(storageKey = NaN, title = ""){

        // Estraiamo il content salvato dal local storage tramite la key
        const content = localStorage.getItem(storageKey);

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

    // Metodo che restituisce uno specifico selector sulla base dell'id
    getSelectorById(id = ""){

        return this.container.querySelector(`#${id}`);

    }

}