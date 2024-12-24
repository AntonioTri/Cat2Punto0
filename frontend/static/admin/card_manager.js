// Questa classe esiste per il puro scopo di inserire le action card all'interno di un html
// Definiti id e o classi ci si può riferire agli alementi tramite il css per modificarne bene le proprietà


export class CardManager {
    constructor(containerSelector = 'body') {
        // Seleziona il contenitore dove le card saranno aggiunte, di default è il <body>
        this.container = document.querySelector(containerSelector);
    }

    // Metodo per aggiungere una card con un ID
    addCardWithId(id, content = '') {
        const card = this._createCard();
        card.id = id;
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una card con una classe
    addCardWithClass(className, content = '') {
        const card = this._createCard();
        card.classList.add(className);
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una card con una posizione assoluta (top, left)
    addCardWithPosition(top, left, content = '') {
        const card = this._createCard();
        card.style.position = 'absolute';
        card.style.top = `${top}%`;
        card.style.left = `${left}%`;
        card.style.transform = 'translate(-50%, -50%)'
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una card con ID e posizione
    addCardWithIdAndPosition(id, top, left, content = '') {
        const card = this._createCard();
        card.id = id;
        card.style.position = 'absolute';
        card.style.top = `${top}%`;
        card.style.left = `${left}%`;
        card.style.transform = 'translate(-50%, -50%)'
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una card con una classe e posizione
    addCardWithClassAndPosition(className, top, left, content = '') {
        const card = this._createCard();
        card.classList.add(className);
        card.style.position = 'absolute';
        card.style.top = `${top}%`;
        card.style.left = `${left}%`;
        card.style.transform = 'translate(-50%, -50%)'
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una cads con una classe, id e posizione
    addCardWithClassIDAndPosition(className, id, top, left, content = '') {
        const card = this._createCard();
        card.id = id;
        card.classList.add(className);
        card.style.position = 'absolute';
        card.style.top = `${top}%`;
        card.style.left = `${left}%`;
        card.style.transform = 'translate(-50%, -50%)'
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo privato per creare una card con il design standard
    _createCard() {
        const card = document.createElement('div');
        card.classList.add('inactive');
        card.style.color = 'black';
        card.style.textAlign = 'center';
        card.style.position = 'absolute';
        card.style.borderRadius = '7px';
        card.style.justifyContent = 'center';
        card.style.padding = '6px 10px';
        card.style.fontFamily = `'Courier New', Courier, monospace`;
        card.style.backgroundColor = 'rgb(225, 228, 217)';
        card.style.boxShadow = '0px 0px 25px 1px rgba(0, 0, 0, 0.5)';
        card.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
        return card;
    }
}
