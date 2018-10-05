//Global data
//Search terms
var query;
var keywords;

var documents;
var docKeywordCounts;



//Prototype for a single document
function Document(id, title, totalWords, keywordCounts){
    this.id = id;
    this.title = title;
    
    this.totalWords = totalWords;
    
    this.keywordCounts = keywordCounts;
    
    this.keywordForces = [];
    this.keywordTFIDFs = [];
    
    //Calculates the TFIDF score for the document.
    //The corpus must be fully searched before calling this on each document,
    //or the idf value will be incorrect.
    this.calculateTFIDF = function(){
        for (var i = 0; i < keywordCounts.length; i++){
            //Term frequency
            var tf = keywordCounts[i] / totalWords;
            
            //Inverse document frequency
            var idf = Math.log(documents.length / keywords[i].corpusCount);
            
            return tf * idf;
        }
    };
    
    this.toString = function(){
        return this.id + " " + this.title + " " + this.totalWords + " " + this.keywordCounts + " " + this.keywordTFIDFs;
    }
    
}



//Prototype for a keyword across the entire corpus
//Holds global data needed for TFIDF calculations
function Keyword(name){
    this.name = name;
    this.corpusCount = 0;
}



var files;

//Get all files in the folder
function readFiles(evt){
    
    //FileList of files
    files = evt.target.files;
    corpusTotal = files.length;
}

function search(){

    //Initialize documents
    documents = [];
    
    //Parse keywords
    query = document.getElementById("query").value.toLowerCase().split(" ");
    keywords = [];
    
    //Copy keywords for document-specific counting
    docKeywordCounts = [];
    
    //Convert keywords into objects
    for (var x = 0; x < query.length; x++){
        keywords.push(new Keyword(query[x]));
        docKeywordCounts.push(0);
    }
    
    //Process corpus
    for (var i = 0, f; f = files[i]; i++){
        
        var reader = new FileReader();
        reader.onloadend = (function(file){
            return function(evt){
                read(evt, file);
            };
            
        })(f);
        
        reader.readAsText(f)
    }
    
}

function read(event, file){
    var filename = file.name;

    //Get contents and split by word and line
    var contents = event.target.result;
    var words = contents.split(" ")
    var lines = contents.split("\n")

    //Parse title
    //Every title is within the first 20 lines. Some documents have more than one title, currently just read first one as document title.
    for (var x = 0; x < 20; x++){
        if (lines[x].includes("<TI>")){
            var line = lines[x];
            var start = line.indexOf("<TI>") + 4;
            var title = line.substring(start, line.indexOf("</TI>")).trim();
        }
    }

    //Reset document counts
    docKeywordCounts.fill(0)
    var totalWords = 0;
    var found = false;

    //Count words and keyword occurrences
    for (var x = 0; x < words.length; x++){
        for (var y = 0; y < keywords.length; y++){
            if (words[x].toLowerCase().includes(keywords[y].name)){
                docKeywordCounts[y]++;
                if (!found){
                    keywords[y].corpusCount++;
                    found = true;
                }
            }
            totalWords++;
        }
    }

    var doc = new Document(filename, title, totalWords, docKeywordCounts);
    documents.push(doc);
    var div = document.createElement("div");
    //Process and print documents
    document.getElementById("preview").appendChild(div);
    div.appendChild(document.createTextNode(doc.toString()));
    document.getElementById("preview").appendChild(document.createElement("br"));
    
}


