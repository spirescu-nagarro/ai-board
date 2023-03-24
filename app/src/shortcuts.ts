import * as $ from 'jquery';
import {setConnectionMode} from "./topbar";

export function initShortcuts() {
    $(document).on('keydown', (e) => {
        if (e.key === "Escape") {
            console.log('KEYDOWN', e.key)
            setConnectionMode(false)
        }
    })
}
