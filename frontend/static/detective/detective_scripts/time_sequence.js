import { socket } from '../../utils/socket.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';


export class StoricEventsManager extends AbstractCardManager {
    
    constructor(containerSelector = 'Timeline', checkMark = new CheckMark()) {
        super(containerSelector, checkMark);    
    }

    init() {

        this.selectedEvents = [];
        this.allEvents = [];

        this.createMainLayout();
        this.addScrollableList('storic_event_list');
        this.addSocketListener();
        this.askCacheData("retrieve_historical_events");
        this.addLocker("Timeline");
    }

    addSocketListener() {
        socket.on('add_new_storic_event', (data) => {
            this.addNewEvent(data.titolo, data.descrizione);
        });
    }

    createMainLayout() {
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.backgroundColor = '#fffbea'; // giallino chiaro
        this.container.style.borderRadius = '16px';
        this.container.style.padding = '20px';
        this.container.style.height = '100%';

        // --- Zona superiore ---
        this.topContainer = document.createElement('div');
        this.topContainer.style.display = 'flex';
        this.topContainer.style.justifyContent = 'space-between';
        this.topContainer.style.gap = '10px';
        this.topContainer.style.marginBottom = '20px';

        this.selectionCells = [];
        for (let i = 0; i < 3; i++) {
            const cell = document.createElement('div');
            cell.style.flex = '1';
            cell.style.height = '60px';
            cell.style.border = '2px dashed #aaa';
            cell.style.borderRadius = '10px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.backgroundColor = '#ffffff';
            this.topContainer.appendChild(cell);
            this.selectionCells.push(null);
        }

        this.container.appendChild(this.topContainer);
    }


    addNewEvent(titolo, descrizione) {
        
        const eventElement = document.createElement('div');
        eventElement.id = `event_${this.allEvents.length}`;
        eventElement.classList.add('event-item');
        eventElement.style.padding = '10px';
        eventElement.style.borderRadius = '10px';
        eventElement.style.backgroundColor = '#fff'; // bianco default
        eventElement.style.cursor = 'pointer';
        eventElement.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
        eventElement.style.transition = 'all 0.3s ease';
        eventElement.style.opacity = '0';
        eventElement.style.transform = 'translateY(20px)';

        eventElement.innerHTML = `
            <strong>${titolo}</strong><br>
            <small>${descrizione}</small>
        `;

        eventElement.dataset.title = titolo;

        eventElement.addEventListener('click', () => {
            if (eventElement.classList.contains('selected')) {
                this.deselectEvent(eventElement);
            } else {
                this.selectEvent(eventElement);
            }
        });

        this.scrollableList.appendChild(eventElement);
        this.allEvents.push(eventElement);

        requestAnimationFrame(() => {
            eventElement.style.opacity = '1';
            eventElement.style.transform = 'translateY(0)';
        });
    }

    selectEvent(eventElement) {
        const firstEmptyIndex = this.selectionCells.findIndex(cell => cell === null);
        if (firstEmptyIndex === -1) return;

        // Style per selected
        eventElement.style.backgroundColor = '#ffaa00';
        eventElement.classList.add('selected');

        // Crea una rappresentazione nell’area superiore
        const cell = document.createElement('div');
        cell.innerText = eventElement.dataset.title;
        cell.style.fontWeight = 'bold';
        cell.style.color = '#333';

        this.topContainer.children[firstEmptyIndex].innerHTML = '';
        this.topContainer.children[firstEmptyIndex].appendChild(cell);
        this.selectionCells[firstEmptyIndex] = eventElement;

        if (this.selectionCells.every(cell => cell !== null)) {
            const concat = this.selectionCells.map(el => el.dataset.title).join('_');
            console.log(concat);
        }
    }

    deselectEvent(eventElement) {
        const index = this.selectionCells.indexOf(eventElement);
        if (index === -1) return;

        this.topContainer.children[index].innerHTML = '';
        this.selectionCells[index] = null;

        // Shift a sinistra
        for (let i = index + 1; i < this.selectionCells.length; i++) {
            const el = this.selectionCells[i];
            this.selectionCells[i - 1] = el;
            const cellDiv = this.topContainer.children[i - 1];
            cellDiv.innerHTML = '';
            if (el) {
                const label = document.createElement('div');
                label.innerText = el.dataset.title;
                label.style.fontWeight = 'bold';
                cellDiv.appendChild(label);
            }
        }

        // Pulisce l'ultima cella dopo lo shift
        const lastIndex = this.selectionCells.length - 1;
        this.topContainer.children[lastIndex].innerHTML = '';
        this.selectionCells[lastIndex] = null;

        eventElement.style.backgroundColor = '#fff';
        eventElement.classList.remove('selected');
    }
}
