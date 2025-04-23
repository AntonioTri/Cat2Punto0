import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { CheckMark } from '../../check_mark/check_mark.js';
import { detectiveActions } from '../../utils/constants.js';
import { HelloPageManager } from "../../utils/hello_page.js";
import { FascicoliManager } from "../../detective/detective_scripts/fascicoli.js";
import { DeductionManager } from "../../detective/detective_scripts/deduzione.js";
import { BroadcastManager } from "../../detective/detective_scripts/broadcast.js";
import { StoricEventsManager } from "../../detective/detective_scripts/time_sequence.js";

const checkMark = new CheckMark();

document.addEventListener("socketInitialized", () => {
    
    const burgerMenuManager = new BurgerMenuManager('body', checkMark);

    const deductionManager = new DeductionManager(detectiveActions[0], checkMark);

    const storicEvenManager = new StoricEventsManager(detectiveActions[1], checkMark);
    
    const fascicoliManager = new FascicoliManager(detectiveActions[2], checkMark);

    const broadcastManager = new BroadcastManager(detectiveActions[3], checkMark);

    const helloPageManager = new HelloPageManager('ciao_hello', checkMark);

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                // impedisce invio e spostamenti strani alla pressione del tasto invio
                event.preventDefault(); 
            }
        });
    
        // forza il punto 0,0 nel caso il bug sia avvenuto semplicemente cliccando sull'input tag
        input.addEventListener('focus', () => {
            window.scrollTo(0, 0); 
        });
        
        
    });
    
})


