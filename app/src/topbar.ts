import * as $ from "jquery";
import {createTextNode} from "./board";

export let apiKey = ''

$('#open-templates').on('click', () => {
    $('#template-explorer').toggleClass('active')
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
        createTextNode('A group of neanderthals are hunting a mammoth')
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
