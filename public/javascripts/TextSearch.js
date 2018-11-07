//Global data
//Search terms
var query = []; //Search terms
var keywords;

var globalCounts = {}; //Temporary counter of all words to identify most popular terms

var documents = [];
var docKeywordCounts;

var corpusTotal;
var progressUpdateBound;

//The maximum force of any Keyword in the corpus for the search
var forceRange;//TF-IDF scores


//Prototype for a single document
function Document(id, title, totalWords, keywordCounts){
    this.id = id;
    this.title = title;
    //this.date = date; would be nice to use eventually for transparency
    
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
            
            this.keywordTFIDFs[i] = tf * idf;
        }
    };
    
    //Calculates the force for each keyword node in the force-directed graph
    //Currently just returns the TFIDF value
    this.calculateForces = function(){
        for (var i = 0; i < keywordCounts.length; i++){
            this.keywordForces[i] = this.keywordTFIDFs[i];
            if (this.keywordForces[i] > forceRange){
                forceRange = this.keywordForces[i];
            }
        }
    }
    
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
    progressUpdateBound = corpusTotal / 100;
}

function processCorpus(){

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
        
        reader.readAsText(f);
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
    docKeywordCounts.fill(0);
    var totalWords = 0;
    var found = false;

    var globalFound = false; //testing popular words
    
    //Count words and keyword occurrences
    for (var x = 0; x < words.length; x++){
        for (var y = 0; y < keywords.length; y++){
            //Set word to lower case and remove all punctuation and whitespace
            var word = words[x].toLowerCase();
            word = word.replace(/[\u2000-\u206F\u2E00-\u2E7F\\!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/, "");
            word = word.trim();
            
            if (word.includes(keywords[y].name)){
                docKeywordCounts[y]++;
                if (!found){
                    keywords[y].corpusCount++;
                    found = true;
                }
            }
            totalWords++;
            
            //globalCount
            if (globalCounts[word] == undefined){
                globalCounts[word] = [];
                globalCounts[word].push(0); //word count
                globalCounts[word].push(0); //document count
            }
            else{
                globalCounts[word][0] += 1;
            }
            
            if (!globalFound){
                globalCounts[word][1] += 1;
                globalFound = true;
            }
        }
    }

    var doc = new Document(filename, title, totalWords, docKeywordCounts);
    documents.push(doc);
    
    //Update each 1% of the progress bar
    if (documents.length % progressUpdateBound < 1){
        updateProgressBar();
    }
    
    //Finalize documents after last one is read
    if (documents.length == corpusTotal){
        finalizeDocuments();
    }
}

function finalizeDocuments(){
    
    //Reset force range
    forceRange = 0;

    for (var x = 0; x < documents.length; x++){
        documents[x].calculateTFIDF();
        documents[x].calculateForces();
    }

    sortDocuments();

    var globalCountsList = [];
    for (var word in globalCounts){
        globalCountsList.push([word, globalCounts[word]]);
    }
    
    globalCountsList.sort(function(a, b) {
        return b[1][0] - a[1][0];
    });

    //Print counts list
    for (var x = 0; x < 200; x++){
        var div = document.createElement("div");
        document.getElementById("preview").appendChild(div);
        div.appendChild(document.createTextNode(globalCountsList[x]));
//        for (var y = 0; y < keywords.length; y++){
//            div.appendChild(document.createTextNode(documents[x].keywordForces[y] + ", "));
//        }
        document.getElementById("preview").appendChild(document.createElement("br"));
    }
    
    //Print document data
    for (var x = 0; x < documents.length; x++){
        var div = document.createElement("div");
        document.getElementById("preview").appendChild(div);
        div.appendChild(document.createTextNode(documents[x].title));
        for (var y = 0; y < keywords.length; y++){
            div.appendChild(document.createTextNode(documents[x].keywordForces[y] + ", "));
        }
        document.getElementById("preview").appendChild(document.createElement("br"));
    }
//    }    
//    else{
//        var div = document.createElement("div");
//        document.getElementById("preview").appendChild(div);
//        div.appendChild(document.createTextNode(documents.length));
//        document.getElementById("preview").appendChild(document.createElement("br"));
//    }
}

//Sort documents by keyword forces using optimized bubble sort
function sortDocuments(){
    var swapped;
    do {
        swapped = false;
        for(var i = 0; i < documents.length - 1; i++) {
            var avg1 = averageForce(documents[i]);
            var avg2 = averageForce(documents[i + 1])
            if(avg1 && avg2 && avg1 < avg2) {
                var temp = documents[i];
                documents[i] = documents[i + 1];
                documents[i + 1] = temp;
                swapped = true;
            }
        }
    } while(swapped);
}

//Calculate the average of all Keyword forces for a document
function averageForce(doc){
    var avg = 0;
    for (x = 0; x < doc.keywordForces.length; x++){
        avg += doc.keywordForces[x];
    }
    avg = avg / doc.keywordForces.length;
    return avg;
}

//Display and update the progress bar
var updateProgressBar = function(){
    var progressDisplay = document.getElementById("progressDisplay");
    progressDisplay.style.display = "block";
    
    var progressBar = document.getElementById("progressBar");
    var width = Math.ceil(documents.length / progressUpdateBound);
    
    progressBar.style.width = width + "%";
    progressBar.innerHTML = width + "%";
    
    if (width == 100){
        progressDisplay.style.display = "none";
    }
}

