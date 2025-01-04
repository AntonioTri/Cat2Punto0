import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { CheckMark } from '../../check_mark/check_mark.js';
import { commanderActions } from '../../utils/constants.js';

const checkMark = new CheckMark();

const burgerMenuManager = new BurgerMenuManager('body', checkMark);



