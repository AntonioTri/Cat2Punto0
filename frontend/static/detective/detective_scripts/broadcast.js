import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { socket } from '../../utils/socket.js';

export class BroadcastManager extends AbstractCardManager {

    constructor(containerSelector = 'Broadcast', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }

    init() {
        this.sendingMessage = false;
        this.messagesList = [];

        this.addNewMessageButton();
        this.addTextArea();
        this.addScrollableList('broadcast_messages');
        this.addSocketListener();
        this.askCacheData("retrieve_broadcast_messages");
        this.addLocker("Broadcast");
    }

    addSocketListener(){
        socket.on('new_message', (data) => {
            const { emitter, message, time } = data;
            this.addMessageToScrollableList(emitter, message, time);
        });
    }

    addNewMessageButton() {
        this.newMessageButton = document.createElement('button');
        this.newMessageButton.innerText = '+';

        Object.assign(this.newMessageButton.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '43px',
            height: '43px',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '36px',
            cursor: 'pointer',
            boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.3)',
            zIndex: '10',
            transition: 'transform 0.3s ease',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            outline: 'none'
        });

        this.newMessageButton.addEventListener('click', () => {
            this.rotatePlusButton();
            if (this.sendingMessage) {
                this.hideTextArea();
                this.showMessages();
            } else {
                this.hideMessages();
                this.showTextArea();
            }
            this.sendingMessage = !this.sendingMessage;

        });

        this.container.appendChild(this.newMessageButton);
    }

    addTextArea() {
        this.textAreaContainer = document.createElement('div');
        Object.assign(this.textAreaContainer.style, {
            width: '93%',
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            position: 'absolute',
            top: '9%',
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center'
        });

        this.textArea = document.createElement('textarea');
        this.textArea.maxLength = 500;
        this.textArea.placeholder = "Inserisci un messaggio (max 500 caratteri)";
        Object.assign(this.textArea.style, {
            width: '97%',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'Courier New',
            fontSize: '18px',
            resize: 'none'
        });

        this.sendButton = document.createElement('button');
        this.sendButton.innerText = 'Invia';
        Object.assign(this.sendButton.style, {
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'block'
        });

        this.sendButton.addEventListener('click', () => {
            const msg = this.textArea.value.trim();
            if (msg) {
                const data_to_send = {
                    message: msg, 
                    token : localStorage.getItem('access_token'),
                    emitter : localStorage.getItem('personal_name'), 
                    team_id : localStorage.getItem('team_id')
                };

                socket.emit('broadcast_message', data_to_send);
                console.log('Messaggio broadcast inviato. Dati: ', data_to_send);
                this.textArea.value = '';
                this.hideTextArea();
                this.showMessages();
                this.rotatePlusButton();
                this.sendingMessage = false;
            }
        });

        this.textAreaContainer.appendChild(this.textArea);
        this.textAreaContainer.appendChild(this.sendButton);
        this.container.appendChild(this.textAreaContainer);
    }

    addMessageToScrollableList(emitter = "", message = "", time = "") {
        const entry = document.createElement('div');
        Object.assign(entry.style, {
            padding: '10px',
            borderBottom: '1px solid #ccc',
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out'
        });

        entry.innerHTML = `<strong>${emitter}</strong> (${time}):<br>${message}`;
        this.scrollableList.appendChild(entry);

        requestAnimationFrame(() => {
            entry.style.opacity = '1';
            entry.style.transform = 'translateY(0)';
        });

        this.messagesList.push(entry);
    }

    rotatePlusButton() {
        const current = this.sendingMessage ? '0deg' : '45deg';
        this.newMessageButton.style.transform = `rotate(${current})`;
    }

    showMessages() {
        this.scrollableList.style.display = 'block';
        requestAnimationFrame(() => {
            this.scrollableList.style.opacity = '1';
            this.scrollableList.style.transform = 'translateY(0)';
        });
    }

    hideMessages() {
        this.scrollableList.style.opacity = '0';
        this.scrollableList.style.transform = 'translateY(20px)';
        setTimeout(() => {
            this.scrollableList.style.display = 'none';
        }, 300);
    }

    showTextArea() {
        this.textAreaContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.textAreaContainer.style.opacity = '1';
            this.textAreaContainer.style.transform = 'translateY(0)';
        });
    }

    hideTextArea() {
        this.textAreaContainer.style.opacity = '0';
        this.textAreaContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            this.textAreaContainer.style.display = 'none';
        }, 300);
    }
}
