  
import { API_URL } from '../../config.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { socket } from '../../utils/socket.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class ResourcesManager extends AbstractCardManager {

    constructor(containerSelector = 'Risorse', checkMark = new CheckMark()) {
        super(containerSelector, checkMark);
    }

    init() {
        this.setURLs();
        this.setVariables();
        this.addEnergyCounter();
        this.addEnergySpaces();
        this.addSocketListener();
        this.addCryptingEventListener();
        this.askCacheData('retrieve_perks');
        this.addSinglePerk(5, 'Criptaggio');
    }

    setURLs() {
        this.URL_GET_ACTIVE_STATUSES = `${API_URL}/get_active_statuses?team_id=${localStorage.getItem('team_id')}`;
        this.dockerPathGetActiveStatuses = `http://localhost:5000/api/get_active_statuses?team_id=${localStorage.getItem('team_id')}`;
    }

    setVariables() {
        this.numBalls = 4;
        this.numAnchors = 6;
        this.anchors = [];
        this.resources = [];
        this.anchorRadius = 120;
        this.anchorSize = 55;
        this.centerX = this.container.clientWidth / 2;
        this.centerY = this.container.clientHeight / 2;
        this.totalCost = 0;
        this.maxCost = 10;
        this.perkIdDisplay = document.createElement('div');
        this.perkIdDisplay.style.paddingTop = '2%';
        this.perkIdDisplay.style.paddingBottom = '1%';
        this.perkIdDisplay.id = 'perk_id_display';
        this.container.appendChild(this.perkIdDisplay);
        // Viene dato anche una classe al container per applicare il css
        this.container.classList.add('resources_inner_content');
    }

    addEnergyCounter() {
        const energyTag = document.createElement('div');
        energyTag.id = 'energy_tag';
        energyTag.classList.add('energy_tag');
        energyTag.style.padding = '10px';
        this.energyTag = energyTag;
        this.container.appendChild(energyTag);
        this.updateEnergyTag();
    }

    updateEnergyTag(perkId = '') {
        this.energyTag.innerHTML = `Energia usata: ${this.totalCost}/${this.maxCost}`;
        this.perkIdDisplay.innerText = perkId ? `Core selezionato: ${perkId}` : '';
    }

    addEnergySpaces() {

        for (let i = 0; i < this.numAnchors; i++) {

            const angle = (2 * Math.PI / this.numAnchors) * i;
            const x = this.centerX + this.anchorRadius * Math.cos(angle) - 20;
            const y = (this.centerY + this.anchorRadius * Math.sin(angle) - 20) + this.centerY * 0.1;

            const anchor = document.createElement('div');
            anchor.className = 'anchor';
            anchor.dataset.used = 'false';
            anchor.id = `${i}`;

            Object.assign(anchor.style, {
                left: `${x}px`,
                top: `${y}px`,
                width: `${this.anchorSize}px`,
                height: `${this.anchorSize}px`
            });

            const core = document.createElement('div');
            core.className = 'anchor-core';
            const pulse = document.createElement('div');
            pulse.className = 'anchor-pulse';

            anchor.appendChild(pulse);
            anchor.appendChild(core);
            this.container.appendChild(anchor);
            this.anchors.push(anchor);
        }
    }

    addSocketListener() {

        socket.on('perk_got_updated', (data) => {
            if (data.perks) {
                data.perks.forEach(perk => this.setStatuses(perk));
            } else {
                this.setStatuses(data);
            }
            
            this.totalCost = parseInt(data.totalCost);
            this.updateEnergyTag();
        
        });

        socket.on('add_new_perk', (perk) => {
            this.addSinglePerk(perk.perkCost, perk.perkName);
            console.log('Nuovo perk aggiunto:', perk);
        });
    }

    setStatuses(statuses) {
        const perk = this.resources[statuses.perkIndex];
        if (!perk) return;
        if (statuses.totalCost) this.totalCost = statuses.totalCost;
        if (statuses.maxCost) this.maxCost = statuses.maxCost;

        const origin = this.calculateGridPosition(statuses.perkIndex);

        if (statuses.anchorIndex != null) {
            const anchor = this.anchors[statuses.anchorIndex];
            const anchorCenterX = anchor.offsetLeft + anchor.offsetWidth / 2;
            const anchorCenterY = anchor.offsetTop + anchor.offsetHeight / 2;

            perk.style.left = `${anchorCenterX - perk.offsetWidth / 2}px`;
            perk.style.top = `${anchorCenterY - perk.offsetHeight / 2}px`;
            perk.dataset.anchored = 'true';
            this.freeAnchor(perk);
            anchor.dataset.used = 'true';
            perk.dataset.anchorId = anchor.id;
        } else {
            this.freeAnchor(perk);
            perk.style.left = `${origin.left}px`;
            perk.style.top = `${origin.top}px`;
            perk.dataset.anchored = 'false';
            perk.dataset.anchorId = null;
        }

        this.updateEnergyTag(perk.id);
    }

    calculateGridPosition(index) {
        const containerWidth = this.container.clientWidth;
        const spacing = 70;
        const ballsPerRow = Math.floor(containerWidth / spacing);
        const x = containerWidth * 0.059 + (index % ballsPerRow) * spacing;
        const y = 90 + Math.floor(index / ballsPerRow) * spacing;
        return { left: x, top: y };
    }

    addSinglePerk(cost, name) {
        const index = this.resources.length;
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.id = name;
        const origin = this.calculateGridPosition(index);
      
        Object.assign(ball.style, {
          left: `${origin.left}px`,
          top: `${origin.top}px`
        });
      
        // Contenitore interno per il numero
        const numberWrapper = document.createElement('div');
        numberWrapper.className = 'ball-number';
        numberWrapper.innerText = cost;
      
        // Corona animata
        const corona = document.createElement('div');
        corona.className = 'ball-corona';
      
        // Inserisco gli elementi
        ball.appendChild(corona);
        ball.appendChild(numberWrapper);
      
        ball.dataset.anchored = 'false';
      
        this.addBallListeners(ball, index, origin, cost);
        this.resources.push(ball);
        this.container.appendChild(ball);
      }
      

    addBallListeners(ball, index, origin, cost) {
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        const getCoords = e => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

        const onStart = e => {
            e.preventDefault();
            isDragging = true;
            ball.style.transition = 'none';
            const coords = getCoords(e);
            const rect = ball.getBoundingClientRect();
            offset.x = coords.x - rect.left;
            offset.y = coords.y - rect.top;
        };

        const onMove = e => {
            if (!isDragging) return;
            const coords = getCoords(e);
            const containerRect = this.container.getBoundingClientRect();
            ball.style.left = `${coords.x - containerRect.left - offset.x}px`;
            ball.style.top = `${coords.y - containerRect.top - offset.y}px`;
        };

        const onEnd = () => {
        if (!isDragging) return;
            isDragging = false;
            this.handleDrop(ball, index, origin, cost);
        };

        ball.addEventListener('mousedown', onStart);
        ball.addEventListener('touchstart', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);

        ball.addEventListener('click', () => {
            if (ball.dataset.anchored === 'false') {
                Object.assign(ball.style, {
                transition: 'left 0.6s ease-in-out, top 0.6s ease-in-out',
                left: `${origin.left}px`,
                top: `${origin.top}px`
                });
                this.updateEnergyTag(ball.id);
            }
        });
    }

    handleDrop(ball, index, origin, cost) {
        const ballRect = ball.getBoundingClientRect();
        let closestAnchor = null;
        let minDist = Infinity;
        const snapDistance = 40;

        for (const anchor of this.anchors) {
            const anchorRect = anchor.getBoundingClientRect();
            const dx = (ballRect.left + ballRect.width / 2) - (anchorRect.left + anchorRect.width / 2);
            const dy = (ballRect.top + ballRect.height / 2) - (anchorRect.top + anchorRect.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist && dist < snapDistance) {
                minDist = dist;
                closestAnchor = anchor;
            }
        }

        if (closestAnchor && closestAnchor.dataset.used === 'false') {

            if (ball.dataset.anchored === 'false' && cost + this.totalCost > this.maxCost) {
                this.resetBallPosition(ball, origin);
                return;
            }

            this.totalCost += (ball.dataset.anchored === 'false') ? cost : 0;
            this.freeAnchor(ball);
            ball.dataset.anchored = 'true';
            ball.dataset.anchorId = closestAnchor.id;
            closestAnchor.dataset.used = 'true';

            Object.assign(ball.style, {
                transition: 'left 0.3s ease, top 0.3s ease',
                left: `${closestAnchor.offsetLeft + closestAnchor.offsetWidth / 2 - ball.offsetWidth / 2}px`,
                top: `${closestAnchor.offsetTop + closestAnchor.offsetHeight / 2 - ball.offsetHeight / 2}px`
            });

            this.sendPerkUpdate(index, ball.id, closestAnchor.id);
            this.updateEnergyTag(ball.id);
            const corona = ball.querySelector('.ball-corona');
            corona.style.animation = 'rotateBall 5s linear infinite';

        } else {

            if (ball.dataset.anchored === 'true') {
                this.totalCost -= cost;
                const corona = ball.querySelector('.ball-corona');
                corona.style.animation = 'rotateBall 12s linear infinite';
            }

            this.freeAnchor(ball);
            ball.dataset.anchored = 'false';
            ball.dataset.anchorId = null;
            this.resetBallPosition(ball, origin);
            this.sendPerkUpdate(index, ball.id, null);
            this.updateEnergyTag(ball.id);
        }
    }

    resetBallPosition(ball, origin) {
        Object.assign(ball.style, {
            transition: 'left 0.6s ease-in-out, top 0.6s ease-in-out',
            left: `${origin.left}px`,
            top: `${origin.top}px`
        });
    }

    freeAnchor(perk) {
        const usedAnchor = this.anchors.find(a => a.id === perk.dataset.anchorId);
        if (usedAnchor) usedAnchor.dataset.used = 'false';
    }

    sendPerkUpdate(perkIndex, perkName, anchorId) {
        const data = {
            token: localStorage.getItem('access_token'),
            perkIndex,
            perkName,
            anchorIndex: anchorId,
            totalCost: this.totalCost,
            maxCost: null,
            team_id: localStorage.getItem('team_id'),
            personal_id: localStorage.getItem('personal_id'),
            socket: localStorage.getItem('socket')
        };
        socket.emit('perk_updated', data);
    }


}
