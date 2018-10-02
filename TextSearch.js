//Object for a single document
var Document = {
    id: "",
    terms: []
}

//Object for a search term, each Document will have an array of Terms
//with data for that term's "search score" for the Document
var Term = {
    docCount: 0,
    corpusCount: 0,
    force: 0
}

//Read all files in the folder
function readFiles(evt){
    
    //FileList of files
    var files = evt.target.files;
    
    for (var i = 0, f; f = files[i]; i++){
        
        var reader = new FileReader();
        reader.onload = (function(event){
            
            //Get contents and split by word
            var contents = event.target.result;
            var words = contents.split(" ")
            var lines = contents.split("\n") //For preview testing
            
            //Preview the contents by spitting beginning to HTML
            var div = document.createElement("div")
            for (var x = 0; x < 30; x++){
                div.appendChild(document.createTextNode(lines[x] + " "));
            }
            document.getElementById("preview").appendChild(div);
            document.getElementById("preview").appendChild(document.createElement("br"));
            
        });
        
        reader.readAsText(f)
    }
    
}



