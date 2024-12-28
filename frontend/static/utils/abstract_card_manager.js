import { CheckMark } from '../../static/check_mark/check_mark.js';

export class AbstractCardManager{


    // Il costruttore definisce come container di lavoro la pagina del create team
    constructor(containerSelector = 'body', checkMark = new CheckMark()){ 

        this.cardName = containerSelector;
        this.card = document.querySelector(`#${containerSelector}.action_card`);
        this.container = this.card.querySelector('#inner_content');
        this.checkMark = checkMark;

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
    addResponseMessage(){
        // creazione di un div
        let apiMessage = document.createElement('div');
        // Applicazione degli stili
        this.addGeneralStyleProperties(apiMessage, `${this.cardName}_api_message`)
        // Aggiunta alla card
        this.container.appendChild(apiMessage);
        // Reference nella classe
        this.apiMessage = apiMessage;

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