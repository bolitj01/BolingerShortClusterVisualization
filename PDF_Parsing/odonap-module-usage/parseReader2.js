/*sets up what modules are required
I did not publish package used but a local package named odonap-module is set up a local link between them
*/
let fs = require('fs'),
PDFParser = require("pdf2json");
var text;
var author;
var title;
var year ='';



let pdfParser = new PDFParser(this,1);

pdfParser.loadPDF("getPDF.pdf");
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
text = pdfParser.getRawTextContent();
getAuthorTitle();
getYear();
printInfo();

});

function printInfo(){
    console.log(text);
    console.log(title);
    console.log(author);
    console.log(year);
}

/*
getAuthorTitle goes through text and gets the title and author
General description is title seems to always be first line and author always seem to be on next line of text
It goes through each line until it gets both author and title.
*/
function getAuthorTitle(){
    var char = '\n';
    var i = j = 0;
    var count =0;
    while ((j = text.indexOf(char, i)) !== -1 && count<=1) {
        //if count is 0 then it is still on first line so this is assumed to be title
        if(count == 0){
             title = text.substring(i, j);
        }
        //if count =1 this is first line after title with text and is assumed to be author(s)
        if(count==1){
            author = text.substring(i, j).replace(/[0-9]/g, '');
      
        }
    //In testing some times after title they have some blank lines, so I only increase count if line is not empty line
    var newText = text.substring(i,j).replace(/^\s+/, '').replace(/\s+$/, '');
    if (newText !== '') {
        count++;
    }

    i = j + 1;

    }
}

/*
getYear will go through text and check for either Copyright or copyright symbol. 
It will then go the neccessary spaces after it to get the year.
It does both string and symbol because based on two similar documents one had only string Copyright while other had symbol
*/
function getYear(){
    var string = "Copyright";
    var i = j = 0;
    var count =0;
    if((j = text.indexOf(string, i)) !== -1) {
        year = text.substring(j+string.length+1,j+string.length+5);
    }
    else if((j=text.indexOf( '©' ,i )) !== -1 ){
        year = text.substring(j+2,j+6);
    }
}