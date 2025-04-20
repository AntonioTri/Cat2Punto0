import { socket } from '../../utils/socket.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class PendingRequestsManager extends AbstractCardManager {

    constructor(containerSelector = 'Prove', checkMark = new CheckMark()) {
        super(containerSelector, checkMark);
        
    }
    
    init() {
        this.codeRequests = [];
        this.evidenceRequests = [];
        this.addScrollableList('proof_list');
        this.addSocketListeners();
        this.askCacheData('retrieve_proof');
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
    }

    addCodeRequest(_code, description) {
        const div = document.createElement('div');
        div.dataset.code = _code;
        div.style = this.getRequestStyle();

        const masked = this.maskCode(_code);
        div.innerHTML = `
            <strong>Codice:</strong> ${masked}<br>
            <small>${description}</small>
        `;

        const approveButton = this.createApproveButton(() => {
            socket.emit('approve_code', {
                code : _code,
                token: localStorage.getItem('access_token'),
                team_id : localStorage.getItem('team_id')
            });
        });

        div.appendChild(approveButton);
        this.scrollableList.appendChild(div);
        this.codeRequests.push({ _code, element: div });
    }

    addEvidenceRequest(titolo, id_fascicolo) {
        const div = document.createElement('div');
        div.dataset.id_fascicolo = id_fascicolo;
        div.style = this.getRequestStyle();

        div.innerHTML = `<strong>Fascicolo:</strong> ${titolo}`;

        const approveButton = this.createApproveButton(() => {
            socket.emit('approve_evidence', {
                id_fascicolo : id_fascicolo,
                token: localStorage.getItem('access_token'),
                team_id: localStorage.getItem('team_id')
            });
        });

        div.appendChild(approveButton);
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
        btn.innerText = 'Invia';
        Object.assign(btn.style, {
            marginTop: '10px',
            padding: '6px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
        });
        btn.addEventListener('click', callback);
        return btn;
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
