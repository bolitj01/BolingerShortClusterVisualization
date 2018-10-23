var initialAngle = 0; //Initial angle in degrees, used to determine word placement around the cloud
//var searchTermAngles = [45, 105, 225, 315]; //Corresponding angle for each search term
var searchTermAngles;
var marginSize = 100;
var chartSize = 800;
var cloudSize = chartSize + (2 * marginSize); //(border on left/right above/below)
var fontSize = 20;
var numRowsCols = 10; //Keep rows == columns
var mapColors = ["blue", "purple", "red", "white"];

//array to keep track of # docs -> spaces
var mappingCounts;

//Draws the outline.
function buildCloud(){
	//TODO:Clear anything existing, we're starting from scratch.

	//Get the svg object from the DOM.
	var theSVG = d3.select("svg")
	.attr("width", cloudSize) 
	.attr("height", cloudSize); 

	//Determine step size
	var stepSize = chartSize/numRowsCols;

	//Build each section, forming a 2D array.
	var i = 0; j = 0;
	for (i = 0;i < numRowsCols; i++) {
		for (j = 0;j < numRowsCols; j++) {
			var sect = theSVG.append("rect")
			.attr("x", (j * stepSize) + marginSize)
			.attr("y", (i * stepSize) + marginSize)
			.attr("width", stepSize)
			.attr("height", stepSize)
			.attr("fill", "white")
			.attr("id", "r"+ i + ""+ j)
			.attr("stroke", "black");
		}
	}

	//Place the search terms around the cloud, starting at the initial angle.
	//TODO: Make dynamic if possible, fix to four for now.
	/*
	var numTerms = query.length;
	var angleOffset = 360/numTerms;
	//var angleOffset = 45;
	var angle = initialAngle;
    searchTermAngles = [];
	for (i = 0;i < numTerms;i++){
        searchTermAngles[i] = angle;
		var res = calculateXYPosition(chartSize/2, toRadians(angle));
		window.alert("x:"+res[0]+" y:"+res[1]);

		theSVG.append("text")
			.attr("x", res[0] + (cloudSize/2))
			.attr("y", res[1] + (cloudSize/2) + fontSize)
			.attr("font-size", fontSize)
			.text(query[i]);

		angle += angleOffset;
	}
	*/
    var numTerms = query.length;
    var angleOffset = 360/numTerms;
    var angle = initialAngle;
	searchTermAngles = [];
	for (i = 0;i < numTerms;i++){
        searchTermAngles[i] = angle;
        angle += angleOffset;
	}
	//Top left (first)
    theSVG.append("text")
        .attr("x", marginSize - 20)
        .attr("y", marginSize)
        .attr("font-size", fontSize)
        .text(query[0]);
    //Top right (second)
    theSVG.append("text")
        .attr("x", marginSize + chartSize)
        .attr("y", marginSize)
        .attr("font-size", fontSize)
        .text(query[1]);
    //Bottom right (third)
    theSVG.append("text")
        .attr("x", marginSize + chartSize)
        .attr("y", marginSize + chartSize + fontSize)
        .attr("font-size", fontSize)
        .text(query[2]);
    //Bottom left (fourth)
    theSVG.append("text")
        .attr("x", marginSize - 20)
        .attr("y", marginSize + chartSize + fontSize)
        .attr("font-size", fontSize)
        .text(query[3]);

    randomColoring();
    //mapData();
}

function mapData(){
	var i;
	for(i = 0;i < documents.length;i++){
		var res = determineXYLocation(documents[i]);
		window.alert("x: "+res[0]+" y:"+res[1]);
	}
}

//Plots the raw points to the svg. For testing mainly.
function plotPoints(){

}

//TODO: This doesn't seem to work.
function determineXYLocation(document){
	//Determine the maximum of the force values here
	var max = -1;
	var i;
	for(i = 0;i < query.length;i++){
        if(document.keywordForces[i] > max){
        	max = document.keywordForces[i];
		}
	}

	//Average x values
	var x = 0;
	for (i = 0;i < query.length;i++){
		if(i == 0 || i == 3) {
            x = x - (document.keywordForces[i] / max) * (chartSize / 2);
        }
        else {
            x = x + (document.keywordForces[i] / max) * (chartSize / 2);
		}
	}
	if(x > (chartSize / 2)){
		x = (chartSize / 2);
	}
	if(x < -1 * (chartSize / 2)){
        x = -1 * (chartSize / 2);
	}

	//Average y values
    var y = 0;
    for (i = 0;i < query.length;i++){
        if(i == 0 || i == 1) {
            y = y - (document.keywordForces[i] / max) * (chartSize / 2);
        }
        else {
            y = y + (document.keywordForces[i] / max) * (chartSize / 2);
        }
    }
    if(y > (chartSize / 2)){
        y = (chartSize / 2);
    }
    if(y < -1 * (chartSize / 2)){
        y = -1 * (chartSize / 2);
    }

	return [x, y]; //This is relative to the center of the chart.
}

//Proof of concept, Not enough time to do more at the moment.
function randomColoring(){
	var i = 0;
	var j = 0;
	for(i = 0;i < numRowsCols;i++){
		for(j = 0;j < numRowsCols;j++){
			var rand = Math.random() * 6;
            colorCloudSection(i, j, mapColors[Math.floor(rand)]);
		}
	}
}

//TODO: Map 8 triangles to square positions. Can use this for force mapping too.
function calculateXYPosition(side, angle){
	if(angle <= toRadians(45)) {
        var y = Math.tan(angle) * side;
        var x = side;
        return [x, y];
    }
    else if(angle <= toRadians(90)){
        var x = side / Math.tan(angle);
        var y = side;
        return [x, y];
	}
	else if(angle <= toRadians(135)){
        angle = angle - toRadians(90);
        var y = Math.tan(angle) * side;
        var x = side * -1;
        return [x, y];
    }
    else if(angle <= toRadians(180)){
        angle = angle - toRadians(90);
        var x = (side / Math.tan(angle));
        var y = side * -1;
        return [x, y];
    }
}

function toRadians (angle) {
	return angle * (Math.PI/180);
}

//Colors a single section of the chart a given color.
function colorCloudSection(x, y, color){
	d3.select("svg").select("#r"+x+""+y).style("fill", color);
}