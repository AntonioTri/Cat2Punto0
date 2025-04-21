import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class GAMMAManager extends AbstractCardManager {

    constructor(containerSelector = 'GAMMA', checkMark = new CheckMark()) {
        super(containerSelector, checkMark);
    }

    init() {
        this.inputText = null;
        this.grid = null;
        this.output = null;
        this.outputText = null;
        this.correctPath = [];
        this.currentPath = [];

        this.gridSize = 4; // 4x4 griglia
        this.addElements();
    }

    addElements() {
        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.placeholder = 'Codice criptato';
        inputText.id = 'inputCryptedText';

        const title = document.createElement('div');
        title.classList.add('bit-title');
        title.innerText = 'Collega i nodi giusti!';

        const arrow1 = document.createElement('div');
        arrow1.classList.add('bit-arrow');
        arrow1.innerText = '↓';

        const grid = document.createElement('div');
        grid.classList.add('node-grid');
        this.grid = grid;

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

        this.inputText = inputText;
        this.output = output;
        this.outputText = outputText;

        this.container.appendChild(inputText);
        this.container.appendChild(title);
        this.container.appendChild(arrow1);
        this.container.appendChild(grid);
        this.container.appendChild(arrow2);
        this.container.appendChild(subtitle);
        this.container.appendChild(output);

        inputText.addEventListener('input', () => {
            this.renderGrid();
        });

        this.renderGrid();
    }


    renderGrid() {
        this.grid.innerHTML = '';
        this.currentPath = [];

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const node = document.createElement('div');
                node.classList.add('node');
                node.dataset.x = x;
                node.dataset.y = y;
                node.addEventListener('click', () => this.onNodeClick(x, y, node));
                this.grid.appendChild(node);
            }
        }
    }

    onNodeClick(x, y, node) {
        const existingIndex = this.currentPath.findIndex(([cx, cy]) => cx === x && cy === y);
    
        if (existingIndex !== -1) {
            this.currentPath.splice(existingIndex, 1);
            node.classList.remove('selected');
        } else {
            this.currentPath.push([x, y]);
            node.classList.add('selected');
        }
    
        const text = this.inputText.value.trim();
        if (!text || this.currentPath.length === 0) {
            this.outputText.innerText = 'Percorso in costruzione...';
            return;
        }
    
        const decrypted = this.decrypt(text, this.currentPath);
        this.outputText.innerText = decrypted;
    }
    
    

    decrypt(text, path) {
        let result = '';
    
        for (let i = 0; i < text.length; i++) {
            const [x, y] = path[i % path.length];
    
            const shift = ((x * 11 + y * 7 + i * 5) % 94); // range stampabile ASCII
            const charCode = text.charCodeAt(i);
    
            const newChar = String.fromCharCode(32 + ((charCode + shift - 32) % 94)); // da 32 a 126
            result += newChar;
        }
    
        return result;
    }
    
}