import { socket } from '../../utils/socket.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class CodexManager extends AbstractCardManager {
    
    constructor(containerSelector = 'Codici', checkMark = new CheckMark()) {
        super(containerSelector, checkMark);
    }


    init(){

        this.codeList = [];

        this.addScrollableList('codex_list');
        this.addSocketListener();
        this.askCacheData('retrieve_codes');

    };

    addSocketListener(){

        socket.on('add_new_code', (code) => {
            this.addMessageToScrollableList(code.code, code.description);
        });


    };


    addMessageToScrollableList(code = "", description = "") {
        const entry = document.createElement('div');
        Object.assign(entry.style, {
            padding: '10px',
            borderBottom: '1px solid #ccc',
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out'
        });

        entry.innerHTML = `<strong>${description}</strong>:<br>${code}`;
        this.scrollableList.appendChild(entry);

        requestAnimationFrame(() => {
            entry.style.opacity = '1';
            entry.style.transform = 'translateY(0)';
        });

        this.codeList.push(entry);
    }


}