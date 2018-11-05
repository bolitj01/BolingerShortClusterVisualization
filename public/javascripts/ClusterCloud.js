var marginSize = 100;
var chartSize = 800;
var cloudSize = chartSize + (2 * marginSize); //(border on left/right above/below)
var fontSize = 20;
var numRowsCols = 10; //Keep rows == columns
var mapColors = ["blue", "purple", "red", "white"];

//array to keep track of # docs -> spaces
var mappingCounts;

var nodes = []; //A node represents either a search term, or a document. Search terms are fixed position around the cloud.
var links = []; //Links between two nodes. Used to define the force towards each search term around the cloud.

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
	var i, j, k;
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

        //Create a node for the search term and fix it's x and y locations.
        nodes.push({"id": query[i]});
        //A note: if I'm offsetting by marginSize in determineQueryNodeLocations these values need to be adjusted accordingly.
        nodes[nodes.length - 1].fx = xyCoordinates[i][0];
        nodes[nodes.length - 1].fy = xyCoordinates[i][1];
	}

	//TODO: Create a node for every document in the corpus.

    //TODO: Create a link between each search term and every document, and set the link force between them
    //to be proportional to their relative TF-IDF scores. Direction: Document -> Search Term

    //TODO: Create the D3 force directed graph and set all necessary nodes/links/and forces.

    //TODO: Execute the simulation for n number of iterations

    //Now we have an x and y position for every node in the graph. For every (x, y) determine if that value falls
    //within the boundaries for each given section.
    var curX, curY = 0;
    //Loop over the height(rows) of the cloud.
    for(i = 0;i < numRowsCols;i++){
        curX = 0;
        //Loop over the width(columns) of the cloud.
	    for(j = 0;j < numRowsCols;j++){
	        //Loop over every node that isn't a search term (a document in the corpus).
            for(k = numTerms;k < nodes.length;k++){ //Start at numTerms to skip all query term nodes.
                //Known bug: this will have some small overlap in the incredibly miniscule chance that a value falls perfectly between two chunks.
                //Current status: Left as is, avoids needing special processing for last row/col.
                if(nodes[k].x >= curX && nodes[k].x <= (curX + stepSize) && nodes[k].y >= curY && nodes[k].y <= (curY + stepSize)){
                    mappingCounts[i][j]++;
                }
            }
            curX += stepSize;
        }
        curY += stepSize;
    }

    //Now that we have a number of counts, determine the max and min values.
    var minCount = mappingCounts[0][0]; //Default to a given element of the 2D array.
    var maxCount = mappingCounts[0][0];
    for(i = 0;i < numRowsCols;i++) {
        for (j = 0; j < numRowsCols; j++) {
            if(mappingCounts[i][j] > maxCount){
                maxCount = mappingCounts[i][j];
            }
            if(mappingCounts[i][j] < minCount){
                minCount = mappingCounts[i][j];
            }
        }
    }

    //Map these values to colors, and color the svg accordingly.
    for(i = 0;i < numRowsCols;i++) {
        for (j = 0; j < numRowsCols; j++) {
            //Logically we're shifting the minimum to the "zero", finding out what percentage of the maximum we have in this section
            //and then multiplying that value by the number of available colors - 1 (indexing). Last, we floor the entire calculation.
            var colorIndex = Math.floor(((mappingCounts[i][j] - minCount) / (maxCount - minCount)) * (mapColors.length - 1));
            colorCloudSection(i, j, colorIndex);
        }
    }

    //randomColoring();
}

//Returns the xy positions for every search term. They are arrayed, equidistantly, around the cloud.
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

//TODO: Implement a force directed graph
function createGraph(){
    //create a force directed graph
    var force = d3.layout.force()
        .size([chartSize, chartSize])
        .nodes(d3.values(nodes))
        .links(links)
        .on("tick", tick)

}

//Proof of concept. Randomly colors sections to show what layouts COULD look like.
function randomColoring(){
	var i = 0;
	var j = 0;
	for(i = 0;i < numRowsCols;i++){
		for(j = 0;j < numRowsCols;j++){
			var rand = Math.random() * mapColors.length;
            colorCloudSection(i, j, Math.floor(rand));
		}
	}
}

//Simple function to convert degrees to radians.
function toRadians (angle) {
	return angle * (Math.PI/180);
}

//Colors a single section of the chart a given color.
function colorCloudSection(x, y, colorIndex){
	d3.select("svg").select("#r"+x+""+y).style("fill", mapColors[colorIndex]);
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