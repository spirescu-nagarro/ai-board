import * as $ from "jquery";
import {createTextNode} from "./board";
import {loadMenu} from "./menu";

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
        createTextNode('I am feeling anxious')
        createTextNode('I am feeling depressed')
        createTextNode('I am feeling lonely')
        createTextNode('I am feeling overwhelmed')
        createTextNode('I am feeling angry')
        createTextNode('I am feeling sad')
        createTextNode('I am feeling helpless')
        createTextNode('I am feeling hopeless')

        createTextNode('I have sleep problems')
        createTextNode('I am having trouble concentrating')
        createTextNode('I am having trouble making decisions')
        createTextNode('I am having trouble with my appetite')
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
