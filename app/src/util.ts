export function downloadBase64File(fileName: any, base64Data:any) {
    const downloadLink = document.createElement("a")
    downloadLink.href = base64Data;
    downloadLink.download = fileName;
    downloadLink.click();
}
