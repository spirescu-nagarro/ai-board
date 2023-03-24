import Konva from "konva";
import * as $ from "jquery";

export let stage: Konva.Stage
export let layer: Konva.Layer

let positionForNextNode = {x: 0, y: 50}
let selectedNode: any = null


export function getSelectedNode() {
    return selectedNode
}
export function setSelectedNode(node: any) {
    selectedNode = node
}

export function createTextNode(text: string, x = window.innerWidth/2 - 25, y = positionForNextNode.y + 50) {
    const textNode = new Konva.Text({
        text,
        x,
        y,
        width: 400,
        fontSize: 16,
        fontFamily: "'Equip', sans-serif",
        draggable: true,
        padding: 10,
    })
    layer.add(textNode)
    makeNodeEditable(textNode)
    positionForNextNode.y = textNode.y() + textNode.height()
    return textNode
}

export function makeNodeResizable(node: any, layer: any) {
    const transformer = new Konva.Transformer({
        nodes: [node],
        rotateAnchorOffset: 10,
    })
    node.transformer = transformer
    layer.add(transformer)
}

function makeNodeEditable(textNode: any) {
    const transformer = new Konva.Transformer({
        node: textNode,
        enabledAnchors: ['middle-left', 'middle-right'],
        rotateAnchorOffset: 20,
        boundBoxFunc: function (oldBox, newBox) {
            newBox.width = Math.max(30, newBox.width)
            return newBox
        },
    })
    textNode.transformer = transformer
    layer.add(transformer)

    textNode.on('transform', function () {
        textNode.setAttrs({
            width: textNode.width() * textNode.scaleX(),
            scaleX: 1,
        })
    })

    textNode.on('dblclick dbltap', () => {
        textNode.hide()
        transformer.hide()
        const textPosition = textNode.absolutePosition()
        const areaPosition = {
            x: stage.container().offsetLeft + textPosition.x + 10,
            y: stage.container().offsetTop + textPosition.y + 10,
        }
        const textarea = $('<textarea>')

        $('body').append(textarea)
        textarea.val(textNode.text())

        const rotation = textNode.rotation()
        let transform = ''
        if (rotation) transform += 'rotateZ(' + rotation + 'deg)'
        let px = 0
        const isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        if (isFirefox) {
            px += 2 + Math.round(textNode.fontSize() / 20)
        }
        transform += 'translateY(-' + px + 'px)'

        textarea
            .css({
                position: 'absolute',
                top: areaPosition.y + 'px',
                left: areaPosition.x + 'px',
                width: textNode.width() + 'px',
                fontSize: textNode.fontSize() + 'px',
                border: 'none',
                padding: '0px',
                margin: '0px',
                overflow: 'hidden',
                background: 'none',
                outline: 'none',
                resize: 'none',
                lineHeight: textNode.lineHeight(),
                fontFamily: textNode.fontFamily(),
                transformOrigin: 'left top',
                textAlign: textNode.align(),
                color: textNode.fill(),
                transform: transform,
                height: textarea.height() + 3 + 'px',
            })
            .trigger('focus')

        function removeTextarea() {
            textarea.remove()
            window.removeEventListener('click', handleOutsideClick)
            textNode.show()
            transformer.show()
            transformer.forceUpdate()
        }

        function setTextareaWidth(newWidth: any) {
            if (!newWidth)
                newWidth = textNode.placeholder.length * textNode.fontSize()
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
            const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
            if (isSafari || isFirefox)
                newWidth = Math.ceil(newWidth)
            textarea.css('width', newWidth + 'px')
        }

        textarea.on('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                textNode.text(textarea.val())
                removeTextarea()
            }
            if (e.key === 'Escape')
                removeTextarea()
        })

        textarea.on('keydown', function () {
            const scale = textNode.getAbsoluteScale().x
            setTextareaWidth(textNode.width() * scale)
            textarea.css('height', textarea.height() + textNode.fontSize() + 'px')
        })

        function handleOutsideClick(e: any) {
            if (e.target !== textarea) {
                textNode.text(textarea.val())
                removeTextarea()
            }
        }
        setTimeout(() => {
            window.addEventListener('click', handleOutsideClick)
        })
    })
}


export function initBoard() {
    stage = new Konva.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight - 60,
        draggable: true
    })
    layer = new Konva.Layer()
    stage.add(layer)
    layer.draw()

    const scaleBy = 1.10
    stage.on('wheel', (e) => {
        e.evt.preventDefault()
        const oldScale = stage.scaleX()
        const pointer = stage.getPointerPosition()
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        }
        let direction = e.evt.deltaY > 0 ? -1 : 1
        if (e.evt.ctrlKey)
            direction = -direction
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
        stage.scale({ x: newScale, y: newScale })
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        }
        stage.position(newPos)
    })

}
