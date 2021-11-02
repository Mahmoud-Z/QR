
var datass = '';
var DataArr = [];
var BASE64_MARKER = ';base64,';
var PDFJS = window['pdfjs-dist/build/pdf'];
var textTest;
var url;
const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib;
function ExtractText(url) {
    var fReader = new FileReader();
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'blob';
    request.onload = function() {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  function(event){
            convertDataURIToBinary(event.target.result,url);
        };
    };
    request.send();
}
function convertDataURIToBinary(dataURI,url) {

    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    pdfAsArray(array,url)

}
function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }

                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}
function pdfAsArray(pdfAsArray,url) {

    PDFJS.getDocument(pdfAsArray).promise.then(function (pdf) {

        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];

        for (var i = 0; i < pdf._pdfInfo.numPages; i++) {
            // Required to prevent that i is always the total of pages
            (function (pageNumber) {
                // Store the promise of getPageText that returns the text of a page
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {
            modifyPdf(url,pagesText[0].slice(0, 20) )
            // test(url,textTest[0])
            // textTest=pagesText
            // console.log(pagesText.length);
            // console.log(textTest[0]);
            var outputStr = "";
            for (var pageNum = 0; pageNum < pagesText.length; pageNum++) {
                // console.log(pagesText[pageNum]);
            }
        });
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}
$(".click").click(function(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    var url = tabs[0].url;
    var oReq = new XMLHttpRequest();
    // var url = window.location.toString();
    oReq.addEventListener('load', function() {
        console.log("uiouoiuiuoiuo");
    if (isPdfFile(this)) {
      ExtractText(url)
    } else {
      alert("This is not a pdf file")
    }
    });
    oReq.open('GET', url);
    oReq.send()
    'use strict';

    chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.browserAction.setBadgeText({text: request.type});
    });
})
});

async function modifyPdf(url,data) {
    var QR_CODE = await new QRCode("qrcode", {
    width: 220,
    height: 220,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
    });
    await QR_CODE.makeCode(data);
    imgSrc=await QR_CODE._oDrawing._elCanvas.toDataURL("image/png");
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
    const jpgUrl = imgSrc
    const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    console.log(typeof(pdfDoc));
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    const jpgImage = await pdfDoc.embedPng(jpgImageBytes)
    console.log(firstPage.height);
    firstPage.drawImage(jpgImage, {
        x:250,
        y: 300,
        width: 100,
        height: 100,
    })
    const pdfBytes = await pdfDoc.save()
    let name="test2.pdf"
    download(pdfBytes, name, "application/pdf");
    $(".newPath").html("<a href="+name+" target='_blank'>View PDF</a>")
}
function isPdfFile(response) {
var header = response.getResponseHeader('content-type');
console.log(header);
if (header) {
    var headerValue = header.toLowerCase().split(';', 1)[0].trim();
    return (headerValue === 'application/pdf' ||
            headerValue === 'application/octet-stream' &&
            url.toLowerCase().indexOf('.pdf') > 0);
}
}