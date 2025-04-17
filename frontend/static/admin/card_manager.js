// Questa classe esiste per il puro scopo di inserire le action card all'interno di un html
// Definiti id e o classi ci si può riferire agli alementi tramite il css per modificarne bene le proprietà


export class CardManager {
    constructor(containerSelector = 'body') {
        // Seleziona il contenitore dove le card saranno aggiunte, di default è il <body>
        this.container = document.querySelector(containerSelector);
    }

    // Questo metodo muove la carta attiva sulla destra
    // Metodo usato dal burger menu per spostare da sinistra a destra
    // l'attuale card attiva per fare spazio al menu
    moveCardToLeft(width){
        try {
            let selectedCard = document.querySelector('.action_card.active');
            
            selectedCard.style.transform = `translateX(${width}px)`;
            selectedCard.style.opacity = '0';
            
        } catch (error) { return; }


    }

    moveCardToRight(){

        try {
            let selectedCard = document.querySelector('.action_card.active');
            selectedCard.style.transform = `translateX(0%)`;
            selectedCard.style.opacity = '1';
            
        } catch (error) {
            console.log(error);
        }
    }

    // Metodo per aggiungere una card con un ID ed un titolo
    addCardWithIdAndTitle(id, title = 'Missing title', content = '') {
        const card = this._createCard();
        card.id = id;
        card.firstChild.innerText = title;
        card.childNodes.item(1).innerHTML = content;
        this.container.appendChild(card);
    }
    
    // Metodo per aggiungere una card con una classe ed un titolo
    addCardWithClassAndTitle(className = '', title = 'Missing title', content = '') {
        const card = this._createCard();
        card.classList.add(className);
        card.firstChild.innerText = title;
        card.childNodes.item(1).innerHTML = content;
        this.container.appendChild(card);
    }
    
    // Metodo per aggiungere una card con una classe ed un titolo
    addCardWithClassIDAndTitle(className = '', id = '', title = 'Missing title', content = '') {
        const card = this._createCard();
        card.classList.add(className);
        card.id = id;
        card.firstChild.innerText = title;
        card.childNodes.item(1).innerHTML = content;
        this.container.appendChild(card);
        return card;
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
        card.style.top = `${top}%`;
        card.style.left = `${left}%`;
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una card con ID e posizione
    addCardWithIdAndPosition(id, top, left, content = '') {
        const card = this._createCard();
        card.id = id;
        card.style.top = `${top}%`;
        card.style.left = `${left}%`;
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una card con una classe e posizione
    addCardWithClassAndPosition(className, top, left, content = '') {
        const card = this._createCard();
        card.classList.add(className);
        card.style.top = `${top}%`;
        card.style.left = `${left}%`;
        card.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una cads con una classe, id e posizione
    addCardWithClassIDAndPosition(className, id, top, left, content = '') {
        const card = this._createCard();
        card.id = id;
        card.classList.add(className);
        card.style.top = `${top}px`;
        card.style.left = `${left}px`;
        card.firstChild.innerText = content;
        this.container.appendChild(card);
    }

    // Metodo per aggiungere una cads con una classe, id e posizione
    addCardWithClassIDAndPositionNoChild(className, id, top, left) {
        const card = this._noChildCreateCard();
        card.id = id;
        card.classList.add(className);
        card.style.top = `${top}px`;
        card.style.left = `${left}px`;
        this.container.appendChild(card);
    }

    // Metodo privato per creare una card con il design standard
    _createCard() {
        const card = document.createElement('div');
        card.classList.add('inactive');
        card.style.margin = '2%'; 
        card.style.left = '1%';
        card.style.width = '90%';
        card.style.height = '100%';
        card.style.color = 'black';
        card.style.textAlign = 'center';
        card.style.position = 'absolute';
        card.style.borderRadius = '7px';
        card.style.justifyContent = 'center';
        card.style.padding = '6px 10px';
        card.style.fontFamily = `'Courier New', Courier, monospace`;
        card.style.backgroundColor = 'rgb(225, 228, 217)';
        card.style.boxShadow = '0px 0px 25px 1px rgba(0, 0, 0, 0.5)';
        card.style.overflow = 'hidden';

        const textLable = document.createElement('div');
        textLable.position = 'relative';
        textLable.style.margin = '1%';
        card.appendChild(textLable);
        
        const innerContent = document.createElement('div');
        innerContent.position = 'relative';
        innerContent.style.margin = '1%';
        innerContent.style.height = '90%';
        innerContent.id = 'inner_content';
        card.appendChild(innerContent);

        return card;
    
    }



    // Metodo privato per creare una card con il design standard
    _noChildCreateCard() {
        const card = document.createElement('div');
        card.classList.add('inactive');
        card.style.margin = '2%'; 
        card.style.width = '90%';
        card.style.color = 'black';
        card.style.textAlign = 'center';
        card.style.position = 'absolute';
        card.style.borderRadius = '7px';
        card.style.justifyContent = 'center';
        card.style.padding = '6px 10px';
        card.style.fontFamily = `'Courier New', Courier, monospace`;
        card.style.backgroundColor = 'rgb(225, 228, 217)';
        card.style.boxShadow = '0px 0px 25px 1px rgba(0, 0, 0, 0.5)';
        card.style.overflow = 'hidden';

        return card;
    }
}
