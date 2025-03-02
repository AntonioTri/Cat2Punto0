import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { CheckMark } from '../../check_mark/check_mark.js';
import { detectiveActions } from '../../utils/constants.js';
import { FascicoliManager } from "../../detective/detective_scripts/fascicoli.js";

const checkMark = new CheckMark();

const burgerMenuManager = new BurgerMenuManager('body', checkMark);

const fascicoliManager = new FascicoliManager(detectiveActions[2], checkMark);




