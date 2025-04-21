import { socket } from '../../utils/socket.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class PendingRequestsManager extends AbstractCardManager {

    constructor(containerSelector = 'Distribuzione', checkMark = new CheckMark()) {
        super(containerSelector, checkMark);
        
    }
    
    init() {
        this.codeRequests = [];
        this.evidenceRequests = [];
        // Questa variabile è molto importante, conserva il numero di token
        // disponibili per l'invio di nuove prove ai destinatari
        this.avaiableTokens = 5;
        this.addTokenTag();
        this.addResponseMessage();
        this.addScrollableList('proof_list');
        this.addSocketListeners();
        this.askCacheData('retrieve_proof');
        this.askCacheData('retrieve_token_amount');
        // Richiami la funzione ciclica che aggiorna il contatore ogni 5 minuti
        this.tokenTimer();
    }


    tokenTimer() {
        // Imposta il timer per eseguire la funzione ogni 5 minuti (300000 ms)
        setInterval(() => {this.addToken(); }, 5000);  // 300000 ms = 5 minuti
    
    }


    addToken() {    
        console.log('Aumento i token di 1. Token attuali: ', this.avaiableTokens);
        if (this.avaiableTokens < 3) {
            this.avaiableTokens += 1;
            const data_to_send = {
                token : localStorage.getItem('access_token'),
                socket : localStorage.getItem('socket'),
                team_id : localStorage.getItem('team_id'),
                token_count : this.avaiableTokens
            }
            socket.emit('update_token_count', data_to_send );
        }
    }
      
    addTokenTag(){

        this.tokenTag = document.createElement('div');
        this.tokenTag.id = 'token_tag';
        this.updateTokenText();
        this.container.appendChild(this.tokenTag);

    }

    addSocketListeners() {
        socket.on('new_pending_code', (data) => {
            console.log('Aggiunta di un nuovo codice pendente: ', data);
            this.addCodeRequest(data.code, data.description);
        });

        socket.on('new_pending_evidence', (data) => {
            console.log('Aggiunta di un nuovo fascicolo pendente: ', data);
            this.addEvidenceRequest(data.titolo, data.id_fascicolo);
        });

        socket.on('remove_pending_code', (data) => {
            console.log('Rimozione di un codice pendente: ', data);
            this.removeCodeRequest(data.code);
        });

        socket.on('remove_pending_evidence', (data) => {
            console.log('Rimozione di un fascicolo pendente: ', data);
            this.removeEvidenceRequest(data.id_fascicolo);
        });

        socket.on('new_token_amount', (data) => {
            console.log('Incremento del contatore dei token ...', data);
            this.avaiableTokens = parseInt(data.amount);
            this.updateTokenText();
        })
    }

    addCodeRequest(_code, description) {
        const div = document.createElement('div');
        div.dataset.code = _code;
        div.style = this.getRequestStyle();
    
        const masked = this.maskCode(_code);
    
        // Wrapper flessibile per testo e bottone
        const content = document.createElement('div');
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'space-between';
        content.style.gap = '1rem';
    
        const info = document.createElement('div');
        info.innerHTML = `
            <strong>Codice:</strong> ${masked}<br>
            <small>${description}</small>
        `;
    
        const approveButton = this.createApproveButton(() => {
            // Se ci sono abbastanza token l'invio viene approvato
            if(this.avaiableTokens > 0){
                socket.emit('approve_code', {
                    code : _code,
                    token: localStorage.getItem('access_token'),
                    team_id : localStorage.getItem('team_id')
                });
            
            } else {
                this.showResponseMessage('Non hai abbastanza flussi per trasmettere i dati ...');
            }
        });
    
        content.appendChild(info);
        content.appendChild(approveButton);
        div.appendChild(content);
    
        this.scrollableList.appendChild(div);
        this.codeRequests.push({ _code, element: div });
    }
    

    addEvidenceRequest(titolo, id_fascicolo) {
        const div = document.createElement('div');
        div.dataset.id_fascicolo = id_fascicolo;
        div.style = this.getRequestStyle();
    
        const content = document.createElement('div');
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'space-between';
        content.style.gap = '1rem';
    
        const info = document.createElement('div');
        info.innerHTML = `<strong>Fascicolo:</strong> ${titolo}`;
    
        const approveButton = this.createApproveButton(() => {
            // Se ci sono abbastanza token l'invio viene approvato
            if(this.avaiableTokens > 0){
                socket.emit('approve_evidence', {
                    id_fascicolo : id_fascicolo,
                    token: localStorage.getItem('access_token'),
                    team_id: localStorage.getItem('team_id')
                });

            } else {
                this.showResponseMessage('Il Flusso si sta rigenerando ...');
            }
        });
    
        content.appendChild(info);
        content.appendChild(approveButton);
        div.appendChild(content);
    
        this.scrollableList.appendChild(div);
        this.evidenceRequests.push({ id_fascicolo, element: div });
    }
    

    removeCodeRequest(code) {
        const request = this.codeRequests.find(r => r._code === code);
        if (request) {
            this.scrollableList.removeChild(request.element);
            this.codeRequests = this.codeRequests.filter(r => r._code !== code);
        }
    }

    removeEvidenceRequest(id_fascicolo) {
        const request = this.evidenceRequests.find(r => r.id_fascicolo === id_fascicolo);
        if (request) {
            this.scrollableList.removeChild(request.element);
            this.evidenceRequests = this.evidenceRequests.filter(r => r.id_fascicolo !== id_fascicolo);
        }
    }

    maskCode(code) {
        const half = Math.ceil(code.length / 2);
        return code.slice(0, half) + '*'.repeat(code.length - half);
    }

    createApproveButton(callback) {
        const btn = document.createElement('button');
        btn.innerHTML = '→'; // Freccia verso destra
    
        Object.assign(btn.style, {
            width: '40px',
            height: '40px',
            backgroundColor: 'rgb(186, 104, 200)',
            color: 'white',
            fontSize: '1.2rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto' // Spinge il bottone a destra
        });
    
        btn.addEventListener('click', callback);
        return btn;
    }

    updateTokens(amount){

        if (this.avaiableTokens > 0){
            this.avaiableTokens += amount;
            this.updateTokenText();
        }

    };


    updateTokenText(){
        this.tokenTag.innerHTML = `Flussi di invio disponibili : ${this.avaiableTokens}`;
    }
    

    getRequestStyle() {
        return `
            margin-bottom: 12px;
            padding: 12px;
            border-radius: 12px;
            background-color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        `;
    }

}
