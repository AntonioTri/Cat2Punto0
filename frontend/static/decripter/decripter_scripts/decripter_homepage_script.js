import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { decritterAction } from "../../utils/constants.js";
import { CheckMark } from '../../check_mark/check_mark.js';
import { HelloPageManager } from "../../utils/hello_page.js";
import { CrypterManager } from "../../decripter/decripter_scripts/crypting_system.js";
import { ALPHAManager } from "../../decripter/decripter_scripts/alpha_manager.js";
import { BETAManager } from "../../decripter/decripter_scripts/beta_manger.js";
import { GAMMAManager } from "../../decripter/decripter_scripts/gamma_manager.js";
import { RestoreManager } from "../../decripter/decripter_scripts/recupero_manager.js";
import { CodexManager } from "../../decripter/decripter_scripts/codex_manager.js";

const checkMark = new CheckMark();


document.addEventListener("socketInitialized", () => {

    const burgerMenuManager = new BurgerMenuManager('body', checkMark);

    const alphaManager = new ALPHAManager(decritterAction[0], checkMark);

    const betaManager = new BETAManager(decritterAction[1], checkMark);

    const gammaManager = new GAMMAManager(decritterAction[2], checkMark);
    
    const crypterManager = new CrypterManager(decritterAction[3], checkMark);

    const codexManager = new CodexManager(decritterAction[4], checkMark);
    
    const restoreManager = new RestoreManager(decritterAction[5], checkMark);

    const helloPageManager = new HelloPageManager('ciao_hello', checkMark);
    
})