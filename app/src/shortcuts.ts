import * as $ from 'jquery';
import {setConnectionMode} from "./topbar";
import {createTextNode, getSelectedNode} from "./board";

export function initShortcuts() {
    $(document).on('keydown', (e) => {
        if (e.key === "Escape") {
            console.log('KEYDOWN', e.key)
            setConnectionMode(false)
        }
        if (e.key === 'Delete') {
            console.log('KEYDOWN', e.key)
            if (!getSelectedNode())
                return
            if (getSelectedNode().transformer)
                getSelectedNode().transformer.remove()
            if (getSelectedNode().background)
                getSelectedNode().background.remove()
            getSelectedNode().remove()
        }

        if (e.ctrlKey && e.key === 'd') {
            console.log('KEYDOWN', e.key)
            e.preventDefault()
            if (!getSelectedNode())
                return
            const text = getSelectedNode().text()
            const x = getSelectedNode().getX()
            const y = getSelectedNode().getY() + getSelectedNode().transformer.height() + 20
            createTextNode(text, x, y)
        }
    })

}
