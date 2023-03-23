import Konva from 'konva'
import * as $ from 'jquery'
import './style/style.sass'

let apiKey = ''
let maxY = 50

const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight - 60
})

const layer = new Konva.Layer()

contextMenu(stage)

function createTextNode(text: string) {
    const textNode = new Konva.Text({
        text,
        x: window.innerWidth/2 - 25,
        y: maxY + 50,
        width: 400,
        fontSize: 16,
        fontFamily: "'Equip', sans-serif",
        draggable: true,
        padding: 10,
    })
    layer.add(textNode)
    editable(textNode)

    maxY = textNode.y() + textNode.height()
}
setTimeout(() => {
    createTextNode('A group of neanderthals are hunting a mammoth')
}, 1000)



function makeImage(url: string) {
    Konva.Image.fromURL(url, function (image: any) {
        image.setAttrs({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            draggable: true,
        })
        layer.add(image)
        resizable(image, layer)
    })
}

function downloadBase64File(fileName: any, base64Data:any) {
    const downloadLink = document.createElement("a")
    downloadLink.href = base64Data;
    downloadLink.download = fileName;
    downloadLink.click();
}

function makeImageBase64(base64String: string) {
    const img = new Image()
    img.src = `data:image/png;base64,${base64String}`
    img.onload = () => {
        const konvaImage = new Konva.Image({
            image: img,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            draggable: true,
        })
        layer.add(konvaImage)
        resizable(konvaImage, layer)
        layer.draw()
    }
}

// makeImage('assets/1.png')

stage.add(layer)


layer.draw()

function resizable(object: any, layer: any) {
    const transformer = new Konva.Transformer({
        nodes: [object],
        rotateAnchorOffset: 10,
    })
    object.transformer = transformer
    layer.add(transformer)
}

function contextMenu(stage: any) {
    let menuNode = document.getElementById('menu-text')
    let currentShape: any = null
    let prompt = ''

    $('#create-image').on('click', () => {
        prompt = currentShape.text()

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
                const image = data.data[0].b64_json
                makeImageBase64(image)
            })
            .catch(error => console.error(error))
    })

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
    })

    $('#add-text-node').on('click', () => {
        createTextNode('<enter text here>')
    })

    $('#delete-button-image').on('click', () => {
        if (currentShape.transformer)
            currentShape.transformer.destroy()
        currentShape.destroy()
        layer.draw()
    })


    $('.completion').each(function (index, completionButton) {
        const instruction = completionButton.getAttribute('data-instruction')
        completionButton.addEventListener('click', () => {
            prompt = currentShape.text()
            fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "text-davinci-003",
                    "prompt": instruction + prompt + "###",
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
                    let message = data.choices[0].text.trim()
                    createTextNode(message)
                })
                .catch(error => console.error(error));
        });
    })


    document.getElementById('download').addEventListener('click', () => {
        downloadBase64File(prompt + '.png', currentShape.image().src)
    });



    document.getElementById('delete-button-text').addEventListener('click', () => {
        if (currentShape.transformer)
            currentShape.transformer.destroy()
        currentShape.destroy();
        layer.draw();
    });

    window.addEventListener('click', () => {
        menuNode.style.display = 'none';
    });

    stage.on('contextmenu', function (e: any) {
        e.evt.preventDefault()
        const target = e.target
        if (target === stage) return
        if (target.constructor.name === 'Text')
            menuNode = document.getElementById('menu-text')
        if (target.constructor.name === 'Image')
            menuNode = document.getElementById('menu-image')

        currentShape = e.target
        menuNode.style.display = 'initial'
        const containerRect = stage.container().getBoundingClientRect()
        menuNode.style.top = containerRect.top + stage.getPointerPosition().y + 4 + 'px'
        menuNode.style.left = containerRect.left + stage.getPointerPosition().x + 4 + 'px'
    })
}
function editable(textNode: any) {
    const tr = new Konva.Transformer({
        // anchorFill: '#fbd872',
        anchorStroke: '#06041f',
        // anchorCornerRadius: 5,
        // anchorSize: 10,
        borderStroke: '#06041f',
        node: textNode,
        enabledAnchors: ['middle-left', 'middle-right'],
        rotateAnchorOffset: 20,
        // set minimum width of text
        boundBoxFunc: function (oldBox, newBox) {
            newBox.width = Math.max(30, newBox.width)
            return newBox
        },
    })

    textNode.on('transform', function () {
        // reset scale, so only with is changing by transformer
        textNode.setAttrs({
            width: textNode.width() * textNode.scaleX(),
            scaleX: 1,
        })
    })

    layer.add(tr)

    textNode.on('dblclick dbltap', () => {
        textNode.hide()
        tr.hide()
        const textPosition = textNode.absolutePosition()
        const areaPosition = {
            x: stage.container().offsetLeft + textPosition.x + 10,
            y: stage.container().offsetTop + textPosition.y + 10,
        }
        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)
        textarea.value = textNode.text()
        textarea.style.position = 'absolute'
        textarea.style.top = areaPosition.y + 'px'
        textarea.style.left = areaPosition.x + 'px'
        textarea.style.width = textNode.width() + 'px'
        textarea.style.height = textNode.height() + 'px'
        textarea.style.padding = '10px'
        textarea.style.fontSize = textNode.fontSize() + 'px'
        textarea.style.border = 'none'
        textarea.style.padding = '0px'
        textarea.style.margin = '0px'
        textarea.style.overflow = 'hidden'
        textarea.style.background = 'none'
        textarea.style.outline = 'none'
        textarea.style.resize = 'none'
        textarea.style.lineHeight = textNode.lineHeight()
        textarea.style.fontFamily = textNode.fontFamily()
        textarea.style.transformOrigin = 'left top'
        textarea.style.textAlign = textNode.align()
        textarea.style.color = textNode.fill()
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

        textarea.style.transform = transform
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 3 + 'px'
        textarea.focus()

        function removeTextarea() {
            textarea.parentNode.removeChild(textarea)
            window.removeEventListener('click', handleOutsideClick)
            textNode.show()
            tr.show()
            tr.forceUpdate()
        }

        function setTextareaWidth(newWidth: any) {
            if (!newWidth)
                newWidth = textNode.placeholder.length * textNode.fontSize()
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
            const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
            if (isSafari || isFirefox)
                newWidth = Math.ceil(newWidth)
            textarea.style.width = newWidth + 'px'
        }

        textarea.addEventListener('keydown', function (e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                textNode.text(textarea.value)
                removeTextarea()
            }
            if (e.keyCode === 27)
                removeTextarea()
        })

        textarea.addEventListener('keydown', function (e) {
            const scale = textNode.getAbsoluteScale().x
            setTextareaWidth(textNode.width() * scale)
            textarea.style.height = 'auto'
            textarea.style.height =
                textarea.scrollHeight + textNode.fontSize() + 'px'
        })

        function handleOutsideClick(e: any) {
            if (e.target !== textarea) {
                textNode.text(textarea.value)
                removeTextarea()
            }
        }
        setTimeout(() => {
            window.addEventListener('click', handleOutsideClick)
        })
    })

}

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
