import * as $ from "jquery";
import {connectNodes, createTextNode} from "./board";
import {loadMenu} from "./menu";
import {setNodeOffsetX, setNodeOffsetY} from "./index";

export let apiKey = ''

export function isConnectionMode() {
    return $('#connect-nodes').hasClass('active')
}

export function setConnectionMode(mode: boolean) {
    if (mode) {
        $('#connect-nodes').addClass('active')
    } else {
        $('#connect-nodes').removeClass('active')
    }
}

export function toggleConnectionMode() {
    $('#connect-nodes').toggleClass('active')
}

export function startLoading() {
    $('#topbar .loader').addClass('loading')
}

export function stopLoading() {
    $('#topbar .loader').removeClass('loading')
}

$('#open-templates').on('click', () => {
    $('#template-explorer').toggleClass('active')
})

$('#connect-nodes').on('click', () => {
    toggleConnectionMode()
})

$('.template').on('click', function () {
    const template = $(this).attr('data-id')
    $('#template-explorer').removeClass('active')

    if (template == '1') {
        loadMenu('mental-wellbeing')
        const feel = createTextNode('I am feeling', undefined, undefined, 120)
        const a = createTextNode('anxious', undefined, undefined, 150)
        const b = createTextNode('depressed', undefined, undefined, 150)
        const c = createTextNode('lonely', undefined, undefined, 150)
        const d = createTextNode('overwhelmed', undefined, undefined, 150)
        const e = createTextNode('angry', undefined, undefined, 150)
        const f = createTextNode('sad', undefined, undefined, 150)
        const g = createTextNode('helpless', undefined, undefined, 150)
        const h = createTextNode('hopeless', undefined, undefined, 150)
        connectNodes(feel, a)
        connectNodes(feel, b)
        connectNodes(feel, c)
        connectNodes(feel, d)
        connectNodes(feel, e)
        connectNodes(feel, f)
        connectNodes(feel, g)
        connectNodes(feel, h)

        const having = createTextNode('I am having problems', undefined, undefined, 200)
        const i = createTextNode('sleeping', undefined, undefined, 150)
        const j = createTextNode('concentrating', undefined, undefined, 150)
        const k = createTextNode('making decisions', undefined, undefined, 150)
        const l = createTextNode('with my appetite', undefined, undefined, 150)
        connectNodes(having, i)
        connectNodes(having, j)
        connectNodes(having, k)
        connectNodes(having, l)
    }

    if (template == '2') {
        loadMenu('nutrition')
        createTextNode('Show me five healthy recipes with seasonal vegetables')
        createTextNode('My favorite ingredients are: potatoes, carrots, onions, garlic, tomatoes')
        createTextNode('I am lactose intolerant and I have a gluten allergy')
        createTextNode('I am vegan')
        createTextNode('I am vegetarian')
    }

    if (template == '3') {
        loadMenu('refactoring')
        createTextNode('function deleteNullValues(arr) {\n' +
            '  let outputArr = arr.filter((el) => el !== null);\n' +
            '  return outputArr;\n' +
            '}')
    }
})


if (localStorage.getItem('apiKey') !== null && localStorage.getItem('apiKey') !== '') {
    apiKey = localStorage.getItem('apiKey')
    $('#api-key').val(apiKey)
    $('#topbar').removeClass('empty-key')
}
else
    $('#topbar').addClass('empty-key')

$('#api-key').on('input', function () {
    apiKey = $(this).val() as string
    localStorage.setItem('apiKey', apiKey)
    if (apiKey.length > 0)
        $('#topbar').removeClass('empty-key')
    else
        $('#topbar').addClass('empty-key')
})
