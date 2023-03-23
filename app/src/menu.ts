import * as $ from "jquery";
import {createChatCompletion, generateCompletion, generateImage} from "./openAi";
import {downloadBase64File} from "./util";
import {createTextNode, getSelectedNode, layer, setSelectedNode, stage} from "./board";


function getDynamicMenuOptions(menuNode: JQuery, currentShape: any) {
    menuNode.find('.dynamic, .loading').remove()
    menuNode.append($('<li>').addClass('loading').html('Loading dynamic options...'))
    const context = currentShape.text()
    createChatCompletion(context, menuNode);
}

export function initMenu() {
    $('#create-image').on('click', () => {
        generateImage(getSelectedNode().text())
    })

    $('#add-text-node').on('click', () => {
        createTextNode('<enter text here>')
    })

    $('#delete-button-image, #delete-button-text').on('click', () => {
        if (getSelectedNode().transformer)
            getSelectedNode().transformer.remove()
        getSelectedNode().remove()
    })

    $('#download').on('click', () => {
        downloadBase64File(getSelectedNode().image().title + '.png', getSelectedNode().image().src)
    })

    $('*').on('click','.completion', function (e) {
        e.stopPropagation()
        const instruction = $(this).attr('data-instruction')
        const prompt = getSelectedNode().text()
        generateCompletion(instruction + prompt)
        $('.menu').hide()
    })

    $('body').on('click', () => {
        $('.menu').hide()
    })

    stage.on('contextmenu', function (e: any) {
        e.evt.preventDefault()
        const target = e.target
        if (target === stage) return
        setSelectedNode(e.target)
        let menuNode = $('#menu-text')
        if (target.constructor.name === 'Text') {
            getDynamicMenuOptions(menuNode, getSelectedNode())
        }
        if (target.constructor.name === 'Image') {
            menuNode = $('#menu-image')
        }
        menuNode.css('display', 'initial')
        const containerRect = stage.container().getBoundingClientRect()
        menuNode.css('top', containerRect.top + stage.getPointerPosition().y + 4)
        menuNode.css('left', containerRect.left + stage.getPointerPosition().x + 4)
    })

}
