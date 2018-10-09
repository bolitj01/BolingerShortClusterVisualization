//Parameters that keep track of the current level of "zoom".
//As smaller subsections are selected, these values are updated to reflect the maximum distance to/from different words
//to map onto the cloud.
var currentRangeMin = 0;
var currentDomainMin = 0;
var currentRangeMax = 1;
var currentDomainMax = 1;

var marginSize = 100;
var chartSize = 800;
var cloudSize = chartSize + (2 * marginSize); //(border on left/right above/below)
var numRowsCols = 10; //Keep rows == columns
var mapColors = ["blue", "purple", "yellow", "orange", "red", "white"];

//array to keep track of # docs -> spaces
var mappingCounts;

//Draws the outline.
function buildCloud(){
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
}

//Colors a single section of the chart a given color.
function colorCloudSection(x, y, color){
	var theSelection = d3.select("svg").select("#r"+x+""+y).style("fill", color);
}

//TODO: Maps data to corresponding cells based off the current limits (determined by current level of "zoom").
function mapData(){
	return dataMapping;
}

//TODO: Testing calls
buildCloud();
colorCloudSection(5,4,"red");