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

	//Place the search terms/force nodes around the cloud, starting at the top left.
	var xyCoordinates = determineQueryNodeLocations(numTerms);

	//Draw the labels for the query terms onto the cloud.
	for(i = 0;i < xyCoordinates.length;i++){
        theSVG.append("text")
            .attr("x", xyCoordinates[i][0])
            .attr("y", xyCoordinates[i][1])
            .attr("font-size", fontSize)
            .text(query[i]);
	}

    randomColoring();

    //mapData();
}

function determineQueryNodeLocations(numTerms){
    //I figured out a better way to traverse the perimeter of a square(clockwise starting from the top left)
    //to equidistantly(manhattan distance) place force nodes for query terms,
    //rather than through use of trig functions and polar/Euclidian conversions.
    var x = 0;
    var y = 0;
    var i;
    var xyCoordinates = [0, 0];
    var stepSize = (chartSize*4)/numTerms; //4 sides = sum of the sides(perimeter).
                                       //Dividing by numTerms gives equidistant placements (still need to account for corners)
    var partway = 0; //Counter to keep track of when we traverse a side length in distance
    //Start at top left corner.
    var up = 0, down = 1, left = 2, right = 3, cons = 4;
    var direction = right;

    for(i = 0;i < numTerms;i++){
        //Update total distance travelled so far.
        if(direction == right){
            x += stepSize;
        }
        else if(direction == down){
            y += stepSize;
        }
        else if(direction == left){
            x -= stepSize;
        }
        else if(direction == up){
            y -= stepSize;
        }
        partway+=stepSize;

        //Move as needed around the cloud
        while (partway > chartSize){
            //Change directions, set the other value to the known value, then traverse on the other value for the remaining distance.
            if(direction == right){
                direction = down;
                y += (x - chartSize);
                x = chartSize;
            }
            else if(direction == down){
                direction = left;
                x -= (y - chartSize);
                y = chartSize;
            }
            else if(direction == left){
                direction = up;
                y += x;
                x = 0;
            }
            else if(direction == up){
                direction = right;
                x -= y;
                y = 0;
            }
            partway -= chartSize;
        }

        //Mark this point as a coordinate for a query term.
        xyCoordinates[i] = [x + marginSize, y + marginSize]; //Adjust by the offset for margins here.
    }
    return xyCoordinates;
}

function mapData(){
	var i;
	for(i = 0;i < documents.length;i++){
		var res = determineXYLocation(documents[i]);
		window.alert("x: "+res[0]+" y:"+res[1]);
	}
}

//TODO: Plots the raw points to the svg.
function plotPoints(){

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
//Current State: Unfinished, partially implemented.
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