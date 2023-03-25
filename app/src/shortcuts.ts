import * as $ from 'jquery';
import {setConnectionMode} from "./topbar";
import {createTextNode, selectedNodes} from "./board";
import {nodeOffset} from "./index";

export function initShortcuts() {
    $(document).on('keydown', (e) => {
        if (e.key === "Escape") {
            setConnectionMode(false)
        }
        if (e.key === 'Delete') {
            selectedNodes.forEach(node => {
                if (node.transformer)
                    node.transformer.remove()
                if (node.background)
                    node.background.remove()
                // foreach node.arrows remove arrow
                node.arrows?.forEach((arrow: any) => {
                    arrow.remove()
                })
                node.remove()
            })
        }

        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault()
            selectedNodes.forEach(node => {
                const text = node.text()
                const x = node.getX() + node.transformer.width() + nodeOffset
                const y = node.getY()
                createTextNode(text, x, y)
            })
        }
    })
}
