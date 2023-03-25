export function downloadBase64File(fileName: any, base64Data:any) {
    const downloadLink = document.createElement("a")
    downloadLink.href = base64Data;
    downloadLink.download = fileName;
    downloadLink.click();
}

export function base64toFile(base64String: string, filename: string): File {
    const arr = base64String.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while(n--){
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
}
