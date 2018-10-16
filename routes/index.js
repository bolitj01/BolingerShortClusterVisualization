////Perform preprocessing on all the documents to avoid 
////file handling in the client-side JavaScript
//
//
//
////Global document collection
//var documents = [];
//
//
//
////Prototype for a single document
//function Document(id, title, contents){
//    this.id = id;
//    this.title = title;
//    
//    this.contents = contents;
//    
//    this.keywordCounts = [];
//    
//    this.keywordForces = [];
//    this.keywordTFIDFs = [];
//    
//    //Calculates the TFIDF score for the document.
//    //The corpus must be fully searched before calling this on each document,
//    //or the idf value will be incorrect.
//    this.calculateTFIDF = function(){
//        for (var i = 0; i < keywordCounts.length; i++){
//            //Term frequency
//            var tf = keywordCounts[i] / totalWords;
//            
//            //Inverse document frequency
//            var idf = Math.log(documents.length / keywords[i].corpusCount);
//            
//            return tf * idf;
//        }
//    };
//    
//    this.toString = function(){
//        return this.id + " " + this.title + " " + this.totalWords + " " + this.keywordCounts + " " + this.keywordTFIDFs;
//    }
//    
//}
//
//
//
////Prototype for a keyword across the entire corpus
////Holds global data needed for TFIDF calculations
//function Keyword(name){
//    this.name = name;
//    this.corpusCount = 0;
//}
//
//
//var v8 = require('v8');
//var fs = require('fs');
//
//console.log(v8.getHeapStatistics().heap_size_limit);
//
//var folder = "SampleData/";
//var filenames = fs.readdirSync(folder);
//
//for (var i = 0; i < filenames.length; i++){
//    var data = fs.readFileSync(folder + filenames[i]);
//    var id = filenames[i]
////    console.log(id);
//    
//    var lines = data.toString().split("\n");
//    
//    var title = '';
//    
//    //Parse title
//    //Every title is within the first 20 lines. Some documents have more than one title, currently just read first one as document title.
//    for (var x = 0; x < 20; x++){
//        if (lines[x].includes("<TI>")){
//            var line = lines[x];
//            var start = line.indexOf("<TI>") + 4;
//            title = line.substring(start, line.indexOf("</TI>")).trim();
////            console.log(title);
//        }
//    }
//    
//    var contents = data.toString().split(" ");
////    console.log(contents.length);
//    
//    var document = new Document(id, title, contents);
//    documents.push(document);
//    
////    console.log();
//    
//}





var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
