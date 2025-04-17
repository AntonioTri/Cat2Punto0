import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { socket } from '../../utils/socket.js';


export class CrypterManager extends AbstractCardManager{
    
    constructor(containerSelector = 'Sistemi', checkMark = new CheckMark()){

        super(containerSelector, checkMark);

    }

    init(){

        this.moduli = [];
        this.nomeCorrente = null;
        this.passwordCorrente = null;
        this.overlay = null;
        this.passwordInput = null;
        this.currentSelectedSystem = null;
        this.currentActiveSystem = null;
        
        this.createOverlay();
        this.addCacheListener();
        this.addCryptingEventListener();
        this.addLocker("Criptaggio", "Criptaggio_on", "Criptaggio_off");
        // Vengono richiesti i dati dalla cache
        this.askCacheData('retrieve_cryptography_status');

    };
    
    

    // Questo metodo aggiunge un listener per aggiornare l'attuale stato
    // dei sistemi attivi
    addCacheListener(){
    
        socket.on('crypting_system_changed', (data) => {

            if (data.systemName && data.systemName != "") {
                // Viene ricercato il modulo corrispettivo
                const newActiveModule = this.moduli.find(m => m.nome === data.systemName)?.elemento;
                // Viene impostato come quello attualmente selezionato
                this.currentSelectedSystem = newActiveModule;
                // Vengono aggiornati gli stili
                this.updateStyles();
                
                console.log("Nuovo sistema di criptaggio attivato:", data);
            }

        });
        
        socket.on('add_crypting_system', (data) => {
            
            // Viene richiamato semplicemente il metodo per aggiungere il modulo con nome e password inviati
            // Se non viene trovato il modulo corrispettivo del sistema scelto
            const newActiveModule = this.moduli.find(m => m.nome === data.systemName)?.elemento;
            if(!newActiveModule){
                this.createNewSystem(data.systemName, data.password);
                // Log del sistema
                console.log("Nuovo sistema di criptaggio aggiunto:", data);
            }
            
        });

    };

    createOverlay() {
        // Crea struttura overlay
        this.overlay = document.createElement('div');
        this.overlay.classList.add('overlay');

        // Dichiarazione del contenuto
        const content = document.createElement('div');
        content.classList.add('overlay-content');

        // Creazione del bottone di chiusura, gli viene associato anche la funzione di chiusura
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.classList.add('close-btn');
        closeBtn.onclick = () => this.closeOverlay();

        // Viene creato l'input tag per l'inserimento della password
        this.passwordInput = document.createElement('input');
        this.passwordInput.type = 'password';
        this.passwordInput.placeholder = 'Inserisci password';

        // Viene creato il bottone per controllare se la password è corretta
        // Viene anche associata l'azione
        const verificaBtn = document.createElement('button');
        verificaBtn.textContent = 'Verifica';
        verificaBtn.onclick = () => this.verificaPassword();

        // Vengono dichiarate le gerarchie del DOM
        content.appendChild(closeBtn);
        content.appendChild(this.passwordInput);
        content.appendChild(verificaBtn);
        this.overlay.appendChild(content);
        
    }

    // Questo metodo quando chiamato crea un nuovo modulo da aggiungere alla card
    createNewSystem(nome, password) {

        const modulo = document.createElement('div');
        modulo.classList.add('modulo');

        const intermediateLayer = document.createElement('div');
        intermediateLayer.classList.add('intermediate_layer');

        const text = document.createElement('div');
        text.classList.add('module_text');
        
        modulo.appendChild(intermediateLayer);
        modulo.appendChild(text)
        text.textContent = `Cifrario: '${nome}'`;

        // Al click viene mostrato il modale per l'inserimento della
        // password. Vengono inoltre aggiunte al dom il modale
        // e conservato l'attuale modulo cliccato per cambiare gli stili
        // in caso di successo
        modulo.addEventListener('click', () => {
            document.body.appendChild(this.overlay);
            this.showOverlay(nome, password);
            this.currentSelectedSystem = modulo;
        });

        // Aggiunta al dom e creazione istanza
        this.container.appendChild(modulo);
        this.moduli.push({ nome, password, elemento: modulo });
    }

    // Quando chiamato il metodo salva la password corrente come quella
    // legata al modulo chiamante, fa lo stesso con il nome
    // e pulisce l'input tag per l'inserimento.
    // Infine applica una classe all'elemento per applicare le proprietà css
    showOverlay(nome, password) {
        this.nomeCorrente = nome;
        this.passwordCorrente = password;
        this.passwordInput.value = '';
        this.overlay.classList.add('active');
    }

    // Metodo che rimuove la classe per attivare le proprietà css
    closeOverlay() {

        this.overlay.classList.remove('active');
        // Dopo 300 millisecondi l'overlay viene rimosso dal dom
        setTimeout(() => { this.overlay.remove(); }, 300);

    }

    // Metodo associato al bottone dell'overlay.
    // Quando chiamato verifica la correttezza della password
    // ed invia tramite socket un segnale di attivazione nel caso sia giusta
    // attivando le traduzioni a livello globale
    verificaPassword() {

        const inserita = this.passwordInput.value;

        // Se la password è corretta vengono inviati i dati
        if (inserita === this.passwordCorrente) {
            
            // Vengono creati i dati da inviare
            const data_to_send = {
                token : localStorage.getItem('access_token'),
                team_id : localStorage.getItem('team_id'),
                systemName : this.nomeCorrente,
                password : this.passwordCorrente
            };
            // Segnale socket
            socket.emit('crypting_sys_changed', data_to_send);
            
            // Log e feedback per l'utente
            this.closeOverlay();
            this.checkMark.success();
            this.updateStyles();
            console.log('✅ Password corretta! Socket segnalata con dati: ', data_to_send);
        
        // Nel caso sia sbagliata il modale non viene chiuso
        // e viene mostrato un check mark di errore nel background
        } else {
            console.log('❌ Password errata!');
            this.checkMark.error();
        }
    }

    updateStyles() {

        // Se esiste un sistema attualmente attivo
        if (this.currentActiveSystem) {
            const previous = this.currentActiveSystem;
            const prevLayer = previous.querySelector('.intermediate_layer');
    
            // Inizia l'effetto di "materializzazione" del layer
            prevLayer.classList.add('materializing');
            prevLayer.classList.remove('dissolving');
    
            // Rimuovi la classe active dopo la transizione
            setTimeout(() => {
                previous.classList.remove('active');
            }, 1500); 
        }
    
        // Delay per aspettare che il modulo precedente abbia "materializzato"
        setTimeout(() => {
            // Aggiorna il nuovo sistema attivo
            this.currentActiveSystem = this.currentSelectedSystem;
    
            const current = this.currentActiveSystem;
            const currLayer = current.querySelector('.intermediate_layer');
    
            // Inizia la dissolvenza del layer e attiva l'effetto hacker
            currLayer.classList.remove('materializing');
            currLayer.classList.add('dissolving');
            current.classList.add('active');
    
        }, 100); 
    }
}