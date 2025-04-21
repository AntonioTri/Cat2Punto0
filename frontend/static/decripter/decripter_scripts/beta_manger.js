import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class BETAManager extends AbstractCardManager {
    
    constructor(containerSelector = 'BETA', checkMark = new CheckMark()) {
        super(containerSelector, checkMark);
    }

    init() {
        this.numSelectors = 5;
        this.options = ['AND', 'OR', 'NOT', 'XOR', 'XAND'];
        this.selectors = [];

        this.inputText = null;
        this.selectorContainer = null;
        this.output = null;
        this.outputText = null;

        this.addElements();
    }

    addElements() {
        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.placeholder = 'Codice criptato';
        inputText.id = 'inputCryptedText';

        const title = document.createElement('div');
        title.classList.add('bit-title');
        title.innerText = 'Imposta la combinazione corretta:';

        const arrow1 = document.createElement('div');
        arrow1.classList.add('bit-arrow');
        arrow1.innerText = '↓';

        const selectorContainer = document.createElement('div');
        selectorContainer.classList.add('switches');
        selectorContainer.id = 'selectorContainer';

        const arrow2 = document.createElement('div');
        arrow2.classList.add('bit-arrow');
        arrow2.innerText = '↓';

        const subtitle = document.createElement('div');
        subtitle.classList.add('bit-subtitle');
        subtitle.innerText = 'Sequenza decodificata:';

        const output = document.createElement('div');
        output.classList.add('output');

        const outputText = document.createElement('span');
        outputText.id = 'outputText';
        output.appendChild(outputText);

        // Memorizzazione elementi
        this.inputText = inputText;
        this.selectorContainer = selectorContainer;
        this.output = output;
        this.outputText = outputText;

        // Inserimento DOM
        this.container.appendChild(inputText);
        this.container.appendChild(title);
        this.container.appendChild(arrow1);
        this.container.appendChild(selectorContainer);
        this.container.appendChild(arrow2);
        this.container.appendChild(subtitle);
        this.container.appendChild(output);

        // Inizializzazione
        this.createSelectors();
        this.inputText.addEventListener('input', () => { this.checkDecryption(); });
    }

    createSelectors() {
        for (let i = 0; i < this.numSelectors; i++) {
            const select = document.createElement('select');
            this.options.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val;
                select.appendChild(option);
            });

            select.dataset.index = i;
            select.addEventListener('change', () => { this.checkDecryption(); });
            this.selectorContainer.appendChild(select);
            this.selectors.push(select);
        }
    }

    checkDecryption() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.outputText.innerText = 'In attesa della combinazione ...';
            return;
        }
    
        const selectedSequence = this.selectors.map(sel => sel.value);
        const decryptedText = this.decrypt(text, selectedSequence);
    
        this.outputText.innerText = decryptedText;
    }
    

    decrypt(text, seq) {
        let result = '';
    
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const keyword = seq[i % seq.length];
            const keywordIndex = this.mapKeywordToNumber(keyword);
            const shift = ((char.charCodeAt(0) + keywordIndex * (i + 7)) % 94);
            const newCharCode = 32 + (shift % 94);
    
            result += String.fromCharCode(newCharCode);
        }
    
        return result;
    }
    
    

    mapKeywordToNumber(keyword) {
        return this.options.indexOf(keyword) + 1; // Valori da 1 a 5
    }
    
}
