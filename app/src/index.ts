import './style.sass'

import {initBoard} from "./board";
import {initMenu} from "./menu";
import {initShortcuts} from "./shortcuts";

export const nodeOffset = 30
export const maxTokens = 600
export const imageSize = '1024x1024'
// export const imageSize = '256x256';


initBoard()
initMenu()
initShortcuts()




