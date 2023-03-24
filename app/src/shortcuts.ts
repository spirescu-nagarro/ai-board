import * as $ from 'jquery';
import {setConnectionMode} from "./topbar";
import {createTextNode, getLastSelectedNode, selectedNodes} from "./board";

export function initShortcuts() {
    $(document).on('keydown', (e) => {
        if (e.key === "Escape") {
            console.log('KEYDOWN', e.key)
            setConnectionMode(false)
        }
        if (e.key === 'Delete') {
            console.log('KEYDOWN', e.key)
            selectedNodes.forEach(node => {
                if (node.transformer)
                    node.transformer.remove()
                if (node.background)
                    node.background.remove()
                node.remove()
            })
        }

        if (e.ctrlKey && e.key === 'd') {
            console.log('KEYDOWNs', e.key)
            e.preventDefault()

            selectedNodes.forEach(node => {
                const text = node.text()
                const x = node.getX() + node.transformer.width() + 20
                const y = node.getY()
                createTextNode(text, x, y)
            })


        }
    })

}
