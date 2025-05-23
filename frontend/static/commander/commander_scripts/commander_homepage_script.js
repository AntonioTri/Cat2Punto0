import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { CheckMark } from '../../check_mark/check_mark.js';
import { commanderActions } from '../../utils/constants.js';
import { HelloPageManager } from "../../utils/hello_page.js";
import { PermissionManager } from "../../commander/commander_scripts/permission.js";
import { ResourcesManager } from "../../commander/commander_scripts/resources.js";
import { PendingRequestsManager } from "../../commander/commander_scripts/pending_request.js";
import { ProtocolsManager } from "../../commander/commander_scripts/anwers_manager.js";

const checkMark = new CheckMark();


document.addEventListener("socketInitialized", () => {

    const burgerMenuManager = new BurgerMenuManager('body', checkMark);
    
    const resourcesManager = new ResourcesManager(commanderActions[0], checkMark);
    
    const pendingRequestsManager = new PendingRequestsManager(commanderActions[2], checkMark);
    
    const permissionManager = new PermissionManager(commanderActions[3], checkMark);

    const protocolsManager = new ProtocolsManager(commanderActions[4], checkMark);

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

