import {apiKey, startLoading, stopLoading} from "./topbar";
import * as $ from "jquery";
import Konva from "konva";
import {
    connectNodes,
    createTextNode, getLastSelectedNode,
    layer,
    makeNodeConnectable,
    makeNodeResizable, selectedNodes,
} from "./board";
import {notify} from "./notifications";
import {imageSize, maxTokens, nodeOffset} from "./index";
import {dynamicMenuRequestId} from "./menu";
import {base64toFile} from "./util";



export function generateImage(prompt: string, instruction: string) {
    const initialNodes: any[] = []
    selectedNodes.forEach(node => {
        initialNodes.push(node)
    })

    const initialNode = getLastSelectedNode()
    startLoading()
    const loadingImageNode = createTextNode(`Loading the prompt: ${instruction} ${prompt}...`, initialNode.x(), initialNode.y() + initialNode.height() + nodeOffset)

    fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            prompt: `${instruction} ${prompt}`,
            n: 1,
            size: imageSize,
            response_format: 'b64_json'
        })
    })
        .then(response => response.json())
        .then(data => {
            checkForErrors(data)
            const image = data.data[0].b64_json
            createImageNode(image, prompt, initialNodes)
            stopLoading()
        })
        .catch(error => {
            handleError(error)
        })
        .finally(() => {
            loadingImageNode.transformer?.remove()
            loadingImageNode.background?.remove()
            loadingImageNode.remove()
        })
}

export function imageToText() {
    const initialNode = getLastSelectedNode()
    startLoading()

    let hostname = location.hostname
    if (hostname !== 'localhost')
        hostname = 'api.' + hostname
    else
        hostname = 'localhost:3000'

    fetch(location.protocol + '//' +hostname + '/vision-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            base64Image: initialNode.attrs.image.src.replace('data:image/png;base64,', '')
        })
    })
        .then(response => response.json())
        .then(data => {
            const keywords = []
            for (let a of data.labelAnnotations) {
                keywords.push(a.description)
            }
            const newNode = createTextNode('The image contains the following things: ' + keywords.join(', '), initialNode.x(), initialNode.y() + initialNode.height() + nodeOffset)
            connectNodes(initialNode, newNode)
            stopLoading()
        })
        .catch(error => {
            handleError(error)
        })
}

export function generateVariation() {
    const initialNode = getLastSelectedNode()
    startLoading()
    const loadingImageNode = createTextNode(`Creating variation`, initialNode.x(), initialNode.y() + initialNode.height() + nodeOffset)
    const b64EncodedString = initialNode.attrs.image.src
    const file = base64toFile(b64EncodedString, 'image.png')
    const formData = new FormData()
    formData.append('image', file)
    formData.append('n', "1")
    formData.append('size', imageSize)
    formData.append('response_format', 'b64_json')
    fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            checkForErrors(data)
            const image = data.data[0].b64_json
            createImageNode(image, 'prompt', [initialNode])
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
    const initialNodes: any[] = []
    const initialNode = getLastSelectedNode()
    selectedNodes.forEach(node => {
        initialNodes.push(node)
    })
    startLoading()
    const newNode = createTextNode(`Loading the prompt: ${prompt}...`, initialNode.x()+ initialNode.width() + nodeOffset, initialNode.y() )
    fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            "model": "text-davinci-003",
            "prompt": prompt + "###",
            "max_tokens": maxTokens,
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
            // connect all initialNodes to the newNode
            initialNodes.forEach(initialNode => {
                connectNodes(initialNode, newNode)
            })
            stopLoading()
        })
        .catch(error => {
            handleError(error)
            // @ts-ignore
            newNode.transformer.remove()
            newNode.remove()
        })
}

export function createChatCompletion(context: any, menuNode: JQuery, requestId: number) {

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            "frequency_penalty": 0,
            "max_tokens": maxTokens,
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": `This is a block of text: ${context}`
                },
                {
                    "role": "system",
                    "content": "Create a JSON object based on the given block of text and its overarching theme that contains 5 possible actions that can be performed on the text. Each action should be relevant to the theme and include the following information: \"label\" and \"prompt\". Make sure the answer consists exclusively of the JSON object and does not include any additional information. The label must be human readable. The prompt executes the action."
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
            if (requestId !== dynamicMenuRequestId)
                return
            checkForErrors(data)
            const dynamicOptions = JSON.parse(data.choices[0].message.content.replace('```json', '').replace('```', ''))

            for (let dynamicOption of dynamicOptions.actions) {
                $(menuNode).append($('<li>')
                    .addClass('dynamic completion')
                    .attr('data-instruction', dynamicOption.prompt)
                    .attr('title', dynamicOption.prompt)
                    .html(dynamicOption.label))
            }
            $(menuNode).find('.loading').remove()
        })
        .catch(error => {
            handleError(error)
            $(menuNode).find('.loading').remove()
        })
}

function createImageNode(base64String: string, prompt: string, initialNodes: any[]) {
    const initialNode = getLastSelectedNode()
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
        // connect all initialNodes to the imageNode
        initialNodes.forEach(initialNode => {
            connectNodes(initialNode, imageNode)
        })
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
