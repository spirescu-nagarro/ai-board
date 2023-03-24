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
    console.log('test')
    toggleConnectionMode()
})




$('.template').on('click', function () {
    const template = $(this).attr('data-id')
    $('#template-explorer').removeClass('active')
    if (template == '1') {
        createTextNode('What are your current stress levels and how do you manage stress?')
        createTextNode('How is your sleep quality and quantity?')
        createTextNode('Are you currently struggling with any mental health issues such as anxiety, depression, or trauma?')
        createTextNode('What is your level of physical activity and how often do you engage in exercise?')
        createTextNode('What is your current diet and how does it affect your mood?')
        createTextNode('How do you currently cope with difficult emotions or situations?')
        createTextNode('Are there any specific goals you have in mind for improving your mental wellbeing?')
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
