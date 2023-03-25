import * as $ from "jquery";
import {connectNodes, createTextNode} from "./board";
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
        createTextNode('I am a single parent who has to work, has fixed working hours and little support from my family. I don\'t sleep much, I feel exhausted and I\'m afraid of not being able to cope with the tasks. I am also afraid of losing my job. What can i do?')
    }

    if (template == '2') {
        createTextNode('This template needs to be implemented')
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
