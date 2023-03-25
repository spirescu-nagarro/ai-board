import * as $ from "jquery";
import {createChatCompletion, generateCompletion, generateImage, generateVariation, imageToText} from "./openAi";
import {downloadBase64File} from "./util";
import {createTextNode, getContextFromSelection, getLastSelectedNode, selectedNodes, stage} from "./board";

export let dynamicMenuRequestId = 0

export function openContextMenu(target: any) {
    let menuNode = $('#menu-text')
    let context = ''
    selectedNodes.forEach(node => {
        if (node.constructor.name === 'Text')
            context += node.text() + ' '
    })
    if (target.constructor.name === 'Text')
        getDynamicMenuOptions(menuNode, context)

    if (target.constructor.name === 'Image')
        menuNode = $('#menu-image')

    menuNode.css('display', 'initial')
    const containerRect = stage.container().getBoundingClientRect()
    menuNode.css('top', containerRect.top + stage.getPointerPosition().y + 4)
    menuNode.css('left', containerRect.left + stage.getPointerPosition().x + 4)
}

function getDynamicMenuOptions(menuNode: JQuery, context: string) {
    menuNode.find('.dynamic, .loading').remove()
    menuNode.append($('<li>').addClass('loading')
        .html('Generating...')
        .append($('<div>').addClass('loader'))
    )
    dynamicMenuRequestId++
    createChatCompletion(context, menuNode, dynamicMenuRequestId)
}

export function loadMenu(templateName: string) {
    fetch(`assets/templates/${templateName}.json`)
        .then(response => response.json())
        .then(data => {
            const menuNode = $('#menu-text')
            menuNode.empty()
            data.menu.forEach((item: any) => {
                const menuItem = $('<li>')
                menuItem.html(item.label)
                if (item.prompt) {
                    menuItem.addClass('completion')
                    menuItem.attr('data-instruction', item.prompt)
                }
                if (item.image) {
                    menuItem.addClass('image')
                    menuItem.attr('data-image', item.image)
                }
                menuNode.append(menuItem)
            })
            menuNode.append(
                $('<li>')
                    .addClass('image-generation')
                    .attr('data-instruction', 'An image of')
                    .attr('title', 'Use this text to create an AI generated image')
                    .html('Show me an image')
            )
            menuNode.append($('<li>').attr('id', 'delete-button-text').attr('title', 'Delete this node').html('Delete'))
            menuNode.append($('<li>').attr('id', 'ai-suggestions').addClass('title').attr('title', 'Those options are generated by AI').html('AI Suggestions...'))
        })
        .catch(error => {
            console.error(error)
        })
}

export function initMenu() {

    $('#add-text-node').on('click', () => {
        createTextNode('fire and ice and thunder surrounding a wizard hero portrait')
        // createTextNode('<enter text here>')
        // createTextNode('minimalist neumorphism logotype of the letters AI, symmetrical, blue with extremely soft shadows, simple UI UX, futuristic, soft edges, clean, cloud, ai')
    })

    $('#download').on('click', () => {
        downloadBase64File(getLastSelectedNode().image().title + '.png', getLastSelectedNode().image().src)
    })

    $('*').on('click', '#delete-button-image, #delete-button-text', (e) => {
        e.stopPropagation()
        if (getLastSelectedNode().transformer)
            getLastSelectedNode().transformer.remove()
        if (getLastSelectedNode().background)
            getLastSelectedNode().background.remove()
        getLastSelectedNode().remove()
        $('.menu').hide()
    })

    $('*').on('click', '#create-variation', (e) => {
        e.stopPropagation()
        generateVariation()
        $('.menu').hide()
    })

    $('*').on('click', '#image-to-text', (e) => {
        e.stopPropagation()
        imageToText()
        $('.menu').hide()
    })

    $('*').on('click', '.completion, .image-generation', function (e) {
        e.stopPropagation()
        const instruction = $(this).attr('data-instruction')
        const context = getContextFromSelection()
        if ($(this).hasClass('image-generation')) {
            generateImage(context, instruction)
        }
        else
            generateCompletion(instruction + context)
        $('.menu').hide()
    })

    $('body').on('click', () => {
        $('.menu').hide()
    })
}
