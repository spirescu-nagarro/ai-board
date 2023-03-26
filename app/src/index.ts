import './style.sass'

import {initBoard} from "./board";
import {initMenu} from "./menu";
import {initShortcuts} from "./shortcuts";

export let nodeOffsetX = 0
export let nodeOffsetY = 10
export let maxTokens = 600
export let imageSize = '1024x1024'
// export const imageSize = '256x256';


export function setNodeOffsetX(offset: number) {
    nodeOffsetX = offset
}
export function setNodeOffsetY(offset: number) {
    nodeOffsetY = offset
}

initBoard()
initMenu()
initShortcuts()




