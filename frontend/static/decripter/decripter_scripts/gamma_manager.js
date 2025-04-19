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
            this.generateCorrectPath();
            this.renderGrid();
        });

        this.generateCorrectPath();
        this.renderGrid();
    }

    generateCorrectPath() {
        const text = this.inputText.value.trim();
        const seed = text.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
    
        const visited = new Set();
        const path = [];
    
        let x = seed % this.gridSize;
        let y = (seed >> 3) % this.gridSize;
        path.push([x, y]);
        visited.add(`${x},${y}`);
    
        const directions = [
            [1, 0],  // right
            [0, 1],  // down
            [-1, 0], // left
            [0, -1]  // up
        ];
    
        let attempts = 0;
    
        while (path.length < 6 && attempts < 100) {
            const dirIndex = (seed >> (path.length * 3)) % 4;
            const [dx, dy] = directions[dirIndex];
    
            const newX = x + dx;
            const newY = y + dy;
    
            const coordKey = `${newX},${newY}`;
    
            if (
                newX >= 0 && newX < this.gridSize &&
                newY >= 0 && newY < this.gridSize &&
                !visited.has(coordKey)
            ) {
                x = newX;
                y = newY;
                path.push([x, y]);
                visited.add(coordKey);
            }
    
            attempts++;
        }
        
        //TODO: scegliere i percorsi corretti
        console.log('Percorso corretto:', path);
        this.correctPath = path;
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
        const coordKey = `${x},${y}`;
    
        // Controlla se il nodo è già stato selezionato
        const existingIndex = this.currentPath.findIndex(([cx, cy]) => cx === x && cy === y);
    
        if (existingIndex !== -1) {
            // Rimuove il nodo selezionato
            this.currentPath.splice(existingIndex, 1);
            node.classList.remove('selected');
        } else {
            // Aggiunge se non presente
            this.currentPath.push([x, y]);
            node.classList.add('selected');
        }
    
        // Verifica se il percorso è completo
        if (this.currentPath.length === this.correctPath.length) {
            const match = this.currentPath.every((c, i) => c[0] === this.correctPath[i][0] && c[1] === this.correctPath[i][1]);
            this.outputText.innerText = match
                ? this.decrypt(this.inputText.value, this.correctPath)
                : '❌ Percorso errato';
        } else {
            this.outputText.innerText = 'Percorso in costruzione...';
        }
    }
    

    decrypt(text, path) {
        let result = '';
        const pathSeed = path.reduce((acc, [x, y]) => acc + x * 3 + y * 5, 0);

        for (let i = 0; i < text.length; i++) {
            const shift = (pathSeed + i * 7) % 26;
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
}