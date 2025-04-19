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

    generateCorrectSequence(text) {
        const base = text.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
        const sequence = [];

        for (let i = 0; i < this.numSelectors; i++) {
            // Valori da 1 a 5
            const val = ((base >> (i * 3)) % 5) + 1;
            sequence.push(this.options[val-1]);
        }

        //TODO: Selezionare le parole candidate
        // Comando per vedere la sequenza in fase di debug 
        console.log(sequence);
        return sequence;
    }

    checkDecryption() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.outputText.innerText = 'In attesa della combinazione ...';
            return;
        }

        const correctSequence = this.generateCorrectSequence(text);
        const selectedSequence = this.selectors.map(sel => sel.value);
        const isCorrect = selectedSequence.every((val, idx) => val === correctSequence[idx]);

        if (isCorrect) {
            this.outputText.innerText = this.decrypt(text, correctSequence);
        } else {
            this.outputText.innerText = '❌ Combinazione errata';
        }
    }

    decrypt(text, seq) {
        
        let result = '';
    
        for (let i = 0; i < text.length; i++) {
            const keyword = seq[i % seq.length];
            const mappedValue = this.mapKeywordToNumber(keyword);
            const shift = (mappedValue * 3) % 26;
    
            const charCode = text.charCodeAt(i);
            let newCode = charCode;
    
            if (charCode >= 65 && charCode <= 90) {
                newCode = ((charCode - 65 + shift) % 26) + 65;
            } else if (charCode >= 97 && charCode <= 122) {
                newCode = ((charCode - 97 + shift) % 26) + 97;
            }
    
            result += String.fromCharCode(newCode);
        }
    
        return result;
    }
    

    mapKeywordToNumber(keyword) {
        return this.options.indexOf(keyword) + 1; // Valori da 1 a 5
    }
    
}
