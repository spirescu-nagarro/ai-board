import Konva from "konva";
import * as $ from "jquery";
import {isConnectionMode} from "./topbar";
import {openContextMenu} from "./menu";
import {nodeOffset} from "./index";

export let stage: Konva.Stage
export let layer: Konva.Layer

let positionForNextNode = {x: 0, y: 30}
export let selectedNodes: any[] = []
let firstNodeForConnectionSelected = false



export function makeNodeConnectable(node: any) {
    node.on('click', () => {
        if (isConnectionMode()) {
            if (!firstNodeForConnectionSelected) {
                firstNodeForConnectionSelected = node
            } else {
                connectNodes(firstNodeForConnectionSelected, node)
                firstNodeForConnectionSelected = false
            }
        }
    })
}

export function getLastSelectedNode() {
    return selectedNodes[selectedNodes.length - 1]
}


export function createTextNode(text: string, x = nodeOffset, y = positionForNextNode.y + nodeOffset) {

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
    makeNodeConnectable(textNode)
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


export function connectNodes(node1: any, node2:any) {
    const arrow = new Konva.Arrow({
        points: [node1.getX(), node1.getY(), node2.getX(), node2.getY()],
        pointerLength: 10,
        pointerWidth: 10,
        fill: 'rgb(70,159, 248)',
        stroke: 'rgb(70,159, 248)',
        strokeWidth: 1
    })

    if (node1.arrows === undefined)
        node1.arrows = []
    node1.arrows.push(arrow)

    if (node2.arrows === undefined)
        node2.arrows = []
    node2.arrows.push(arrow)

    layer.add(arrow)

    function adjustPoint(){

        if (node1.getX() + node1.transformer.width() < node2.getX()) {
            const p=[
                node1.getX() + node1.transformer.width(),
                node1.getY() + node1.transformer.height()/2,
                node2.getX(),
                node2.getY() + node2.transformer.height()/2,
            ]
            // @ts-ignore
            arrow.setPoints(p)
            layer.draw()
            return
        }

        if (node1.getX() > node2.getX() + node2.transformer.width()) {
            const p=[
                node1.getX(),
                node1.getY() + node1.transformer.height()/2,
                node2.getX() + node2.transformer.width(),
                node2.getY() + node2.transformer.height()/2,
            ]
            // @ts-ignore
            arrow.setPoints(p)
            layer.draw()
            return
        }

        if (node1.getY() < node2.getY()) {
            const p=[
                node1.getX() + node1.transformer.width()/2,
                node1.getY() + node1.transformer.height(),
                node2.getX() + node2.transformer.width()/2,
                node2.getY(),
            ]
            // @ts-ignore
            arrow.setPoints(p)
            layer.draw()
            return
        }
        if (node1.getY() > node2.getY()) {
            const p=[
                node1.getX() + node1.transformer.width()/2,
                node1.getY(),
                node2.getX() + node2.transformer.width()/2,
                node2.getY() + node2.transformer.height(),
            ]
            // @ts-ignore
            arrow.setPoints(p)
            layer.draw()
            return
        }
    }
    adjustPoint()
    node1.on('dragmove', adjustPoint)
    node2.on('dragmove', adjustPoint)
    node1.on('transform', adjustPoint)
    node2.on('transform', adjustPoint)
}

function makeNodeEditable(textNode: any) {

    // background
    const textNodeWidth = textNode.width()
    const textNodeHeight = textNode.height()
    const background = new Konva.Rect({
        x: textNode.x(),
        y: textNode.y(),
        width: textNodeWidth,
        height: textNodeHeight,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
        draggable: true,
        name: 'background',
    })
    layer.add(background)
    background.moveToBottom()
    textNode.background = background


    // transformer
    const transformer = new Konva.Transformer({
        node: textNode,
        enabledAnchors: ['middle-left', 'middle-right'],
        rotateAnchorOffset: 20,
        rotateEnabled: false,
        boundBoxFunc: function (oldBox, newBox) {
            newBox.width = Math.max(30, newBox.width)
            return newBox
        },
    })
    textNode.transformer = transformer
    layer.add(transformer)


    textNode.on('dragmove', function () {
        background.position(textNode.position())
        layer.batchDraw()
    })

    textNode.on('transform', function () {
        textNode.setAttrs({
            width: textNode.width() * textNode.scaleX(),
            scaleX: 1,
        })
        background.setAttrs({
            width: textNode.width() * textNode.scaleX(),
            height: textNode.height() * textNode.scaleY(),
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
            newWidth = newWidth - 15
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

            const textField = textarea.get(0)

            if (textField.clientHeight < textField.scrollHeight) {
                textField.style.height = textField.scrollHeight + "px";
                if (textField.clientHeight < textField.scrollHeight)
                    textField.style.height = (textField.scrollHeight * 2 - textField.clientHeight) + "px";
            }
        })

        setTimeout(() => {
            textarea.trigger('keydown')
        }, 50)


        function handleOutsideClick(e: any) {
            if (e.target !== textarea) {
                textNode.text(textarea.val())
                removeTextarea()
                textNode.fire('transform')
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

    // const scaleBy = 1.10
    // stage.on('wheel', (e) => {
    //     e.evt.preventDefault()
    //     const oldScale = stage.scaleX()
    //     const pointer = stage.getPointerPosition()
    //     const mousePointTo = {
    //         x: (pointer.x - stage.x()) / oldScale,
    //         y: (pointer.y - stage.y()) / oldScale,
    //     }
    //     let direction = e.evt.deltaY > 0 ? -1 : 1
    //     if (e.evt.ctrlKey)
    //         direction = -direction
    //     const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    //     stage.scale({ x: newScale, y: newScale })
    //     const newPos = {
    //         x: pointer.x - mousePointTo.x * newScale,
    //         y: pointer.y - mousePointTo.y * newScale,
    //     }
    //     stage.position(newPos)
    // })

    stage.on('click', (event) => {
        // do nothing if it was a right click
        if (event.evt.button === 2)
            return;

        console.log('click')
        const node = event.target as any
        const isShiftKeyPressed = event.evt.shiftKey
        if (!event.target) return
        if (isShiftKeyPressed) {
            if (selectedNodes.includes(node)) {
                selectedNodes.splice(selectedNodes.indexOf(node), 1)
                node.background?.fill('white')
            } else {
                selectedNodes.push(node)
                node.background?.fill('#fbd872')
            }
        } else {
            selectedNodes.forEach((selectedNode: any) => {
                selectedNode.background?.fill('white')
            })
            selectedNodes = []
            if (node !== stage) {
                selectedNodes.push(node)
                node.background?.fill('#fbd872')
            }

        }
    })

    stage.on('contextmenu', function (e: any) {
        e.evt.preventDefault()
        const target = e.target
        if (target === stage) return

        if (!selectedNodes.includes(target)) {
            selectedNodes.push(target)
            target.background?.fill('#fbd872')
        }

        openContextMenu(target)
    })

}
