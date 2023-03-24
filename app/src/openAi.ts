import {apiKey, startLoading, stopLoading} from "./topbar";
import * as $ from "jquery";
import Konva from "konva";
import {
    connectNodes,
    createTextNode, getLastSelectedNode,
    layer,
    makeNodeConnectable,
    makeNodeResizable,
} from "./board";
import {notify} from "./notifications";
import {nodeOffset} from "./index";

export function generateImage(prompt: string) {
    const initialNode = getLastSelectedNode()
    startLoading()
    const loadingImageNode = createTextNode(`Loading the prompt: ${prompt}...`, initialNode.x(), initialNode.y() + initialNode.height() + nodeOffset)
    fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
        })
    })
        .then(response => response.json())
        .then(data => {
            checkForErrors(data)
            const image = data.data[0].b64_json
            createImageNode(image, prompt, initialNode)
            stopLoading()
        })
        .catch(error => {
            handleError(error)
        })
        .finally(() => {
            // @ts-ignore
            loadingImageNode.transformer.remove()
            // @ts-ignore
            loadingImageNode.background.remove()
            loadingImageNode.remove()
        })
}

export function generateCompletion(prompt: string) {
    const initialNode = getLastSelectedNode()
    startLoading()
    const newNode = createTextNode(`Loading the prompt: ${prompt}...`, initialNode.x(), initialNode.y() + initialNode.height() + nodeOffset)
    fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            "model": "text-davinci-003",
            "prompt": prompt + "###",
            "max_tokens": 300,
            "temperature": 0.7,
            "top_p": 1,
            "n": 1,
            "stream": false,
            "logprobs": null,
            "stop": "###"
        })
    })
        .then(response => response.json())
        .then(data => {
            checkForErrors(data)
            let message = data.choices[0].text.trim()
            newNode.text(message)
            newNode.fire('transform')
            connectNodes(initialNode, newNode)
            stopLoading()
        })
        .catch(error => {
            handleError(error)
            // @ts-ignore
            newNode.transformer.remove()
            newNode.remove()
        })
}



export function createChatCompletion(context: any, menuNode: JQuery) {
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            "frequency_penalty": 0,
            "max_tokens": 500,
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": `This is a block of text: ${context}`
                },
                {
                    "role": "user",
                    "content": "Based on this block of text, propose 5 possible actions that can be performed on this text. It should have a label called \"label\", which is a very short description of the action not longer than 30 characters. It should have a more verbose prompt called \"prompt\" that describes the action. It should have a output format called \"output_format\" which can be either \"text\" or \"image\". Put the results in a JSON array, where each element is a JSON object with the label, prompt, and output_format fields."
                }
            ],
            "temperature": 0.7,
            "top_p": 1,
            "n": 1,
            "stream": false,
            "presence_penalty": 0
        })
    })
        .then(response => response.json())
        .then(data => {
            checkForErrors(data)
            const dynamicOptions = JSON.parse(data.choices[0].message.content.replace('```json', '').replace('```', ''))

            for (let dynamicOption of dynamicOptions) {
                $(menuNode).append($('<li>')
                    .addClass('dynamic completion')
                    .attr('data-instruction', dynamicOption.prompt)
                    .attr('title', dynamicOption.prompt)
                    .html(dynamicOption.label))
            }
        })
        .catch(error => {
            handleError(error)
        })
        .finally(() => {
            $(menuNode).find('.loading').remove()
        })
}

function createImageNode(base64String: string, prompt: string, initialNode: any) {
    const img = new Image()
    img.src = `data:image/png;base64,${base64String}`
    img.title = prompt
    img.onload = () => {
        const imageNode = new Konva.Image({
            image: img,
            x: initialNode.x() + initialNode.width()/2 - 100,
            y: initialNode.y() + initialNode.height() + nodeOffset,
            width: 200,
            height: 200,
            draggable: true,
        })
        layer.add(imageNode)
        makeNodeResizable(imageNode, layer)
        makeNodeConnectable(imageNode)
        connectNodes(initialNode, imageNode)
        layer.draw()
    }
}

function checkForErrors(data: any) {
    if (!data) throw new Error('No data returned')
    if (data.error && data.error.message) throw new Error(data.error.message)
}

function handleError(errorObject:any ) {
    console.error(errorObject)
    notify(`Error: ${errorObject}`, 'error')
    stopLoading()
}
