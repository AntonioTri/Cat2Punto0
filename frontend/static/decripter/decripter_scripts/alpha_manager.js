import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';


export class ALPHAManager extends AbstractCardManager {

    constructor(containerSelector = 'ALPHA', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }

    init(){

        // La lista degli switch
        this.switches = [];
        // Variabli di appoggio
        this.inputText = null;
        this.bitContainer = null;
        this.output = null;
        this.outputText = null;
        this.addElements();
        this.addDownloaderPDF('Scarica il manuale ALPHA', 'SISTEMA_ALPHA');
        this.addLocker("ALPHA");


    };

    addElements(){

        const inputText = document.createElement('input');
        const bitContainer = document.createElement('div');
        const output = document.createElement('div');
        const outputText = document.createElement('span');

        inputText.type = 'text';
        inputText.placeholder = 'Codice criptato';
        inputText.id = 'inputCryptedText';

        // Titolo sopra
        const title = document.createElement('div');
        title.classList.add('bit-title');
        title.innerText = 'Selezionare sequenza di bit:';

        // Freccia ↓
        const arrow1 = document.createElement('div');
        arrow1.classList.add('bit-arrow');
        arrow1.innerText = '↓';
        const arrow2 = document.createElement('div');
        arrow2.classList.add('bit-arrow');
        arrow2.innerText = '↓';

        bitContainer.classList.add('switches');
        bitContainer.id = 'bitContainer';

        // Sottotitolo
        const subtitle = document.createElement('div');
        subtitle.classList.add('bit-subtitle');
        subtitle.innerText = 'Sequenza decodificata:';
        
        output.classList.add('output');
        outputText.id = 'outputText';
        output.appendChild(outputText);

        this.inputText = inputText;
        this.bitContainer = bitContainer;
        this.output = output;
        this.outputText = outputText;

        this.container.appendChild(inputText);
        this.container.appendChild(title);
        this.container.appendChild(arrow1);
        this.container.appendChild(bitContainer);
        this.container.appendChild(arrow2);
        this.container.appendChild(subtitle);
        this.container.appendChild(output);

        this.addSwitches();
        this.inputText.addEventListener('input', () => { this.updateOutput(); });

    };


    addSwitches() {
        for (let i = 0; i < 7; i++) {
            const label = document.createElement('label');
            label.classList.add('bit-checkbox');
    
            const text = document.createElement('span');
            text.classList.add('bit-text');
            text.innerText = '0';
    
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.dataset.index = i;
    
            toggle.addEventListener('change', () => {
                text.innerText = toggle.checked ? '1' : '0';
                this.updateOutput();
            });
    
            label.appendChild(toggle);
            label.appendChild(text);
            this.bitContainer.appendChild(label);
            this.switches.push(toggle);
        }
    }
    



    updateOutput(){
        const text = this.inputText.value.trim();
        const bits = this.switches.map(sw => sw.checked ? 1 : 0);
        const result = this.customDecrypt(text, bits);
        this.outputText.innerText = result;
    };


    customDecrypt(text, bits) {
    
        let result = '';
        const bitSeed = parseInt(bits.join(''), 2);

        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const shift = ((bitSeed + i * 2) * 3) % 26;
            let newCharCode = charCode;

            if (charCode >= 97 && charCode <= 122) {
                newCharCode = ((charCode - 97 + shift) % 26) + 97;
            } else if (charCode >= 65 && charCode <= 90) {
                newCharCode = ((charCode - 65 + shift) % 26) + 65;
            }

            result += String.fromCharCode(newCharCode);
        }

        return result;
    
    };





}