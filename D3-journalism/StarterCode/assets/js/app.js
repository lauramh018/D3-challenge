// @TODO: YOUR CODE HERE!

// SVG area size
var svgWidth = 1000;
var svgHeight = 650;

// margin
var margin = {
  top: 60,
  right: 60,
  bottom: 80,
  left: 90,
  axisLabel : 20 
};

// area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;


// Scatter 
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  //Grouping
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var plotData = null; 
var currentXValue = "poverty";  
var currentYValue = "healthcare";

var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)", 
                    "age": "Age (Median)", 
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)", 
                    "smokes": "Smokes (%)", 
                    "healthcare": "Lacks Healthcare (%)" };




// get Data
d3.csv("assets/data/data.csv").then((data, error) => {
    
  
    data.forEach(d => {
      d.poverty = parseInt(d.poverty);
      d.age = parseInt(d.age);
      d.income = parseInt(d.income);
      d.obesity = parseInt(d.obesity);
      d.healthcare = parseInt(d.healthcare);
      d.smokes = parseInt(d.smokes);
    });


    plotData = data;

    // Initialize scatter chart
    createScatter();
});


// function for the scatter
function createScatter() {

    // xLinearScale, yLinearScale
    var xLinearScale = setScale(plotData, currentXValue, "x");
    var yLinearScale = setScale(plotData, currentYValue, "y");

    // Initial axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    // x
    chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    //y 
    chartGroup.append("g")
        .classed("axis", true)
        .call(leftAxis);
        
    // circles
    var container = chartGroup.selectAll("g circle")
        .data(plotData);
 
    // circle group  
    var circle = container.enter()
        .append("g")
        .classed("container", true);
    
    var radius = 12;
    // circles
    circle.append("circle")
        .classed("stateCircle", true)
        .attr('cx', d => xLinearScale(d[currentXValue]))
        .attr('cy', d => yLinearScale(d[currentYValue]))
        .attr('r', radius);        
    
    // text
    var fontSize = 10
    circle.append("text")
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[currentXValue]))
        .attr("dy", d => yLinearScale(d[currentYValue]))
        .attr("font-size", fontSize);        
  
    // Create group for xTitles
    var xTitles = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight+20})`)
        .classed("atext", true)
        .attr("id", "xTitles");

    //  x-axis label
    xTitles.selectAll("text")
        .data(xAxisLabels)
        .enter()
        .append("text")
        .attr("y", (d,i) => (i+1)*margin.axisLabel)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d == currentXValue) ? true:false)
        .classed("inactive", d => (d == currentXValue) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // Create group for yLabels
    var yLabels = chartGroup.append("g")
        .attr("transform", `rotate(-90 ${(margin.left)} 185)`)
        .classed("atext", true)
        .attr("id", "yLabels");
    
    yLabels.selectAll("text")
        .data(yAxisLabels)
        .enter()
        .append("text")
        .attr("x", margin.top)
        .attr("y", (d,i) => (i+1)*margin.axisLabel)
        .attr("value", d => d) 
        .classed("active", d => (d === currentYValue) ? true:false)
        .classed("inactive", d => (d === currentYValue) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // ToolTip
    console.log("Init")
    console.log(currentXValue)
    console.log(currentYValue)
    console.log(circle)
    var circle = updateToolTip(currentXValue, currentYValue, circle);
};

function setScale(plotData, chosenAxis, choice) {
    
    var axisRange = [];
    console.log(choice)
    console.log(chosenAxis)
    if(choice === "x")
        axisRange = [0, chartWidth];
    else
        axisRange = [chartHeight, 0];
    
    var linearScale = d3.scaleLinear()
        .domain([d3.min(plotData, d => d[chosenAxis]) * 0.7,
                 d3.max(plotData, d => d[chosenAxis]) * 1.2])
        .range(axisRange);
    console.log(axisRange)
    return linearScale;
}

function renderAxis(newScale, Axis, choice) {
    var posAxis = (choice === "x") ? d3.axisBottom(newScale):d3.axisLeft(newScale)
  
    Axis.transition()
      .duration(1000)
      .call(posAxis);
  
    return Axis;
}

function renderCircles(inputUser, newScale, chosenAxis, xy) {


    inputUser.selectAll("circle")
        .transition()
        .duration(1000)
        .attr(`c${xy}`, d => newScale(d[chosenAxis]));
    console.log(inputUser)
    // Render transition of text
    inputUser.selectAll("text")
        .transition()
        .duration(1000)
        .attr(`d${xy}`, d => newScale(d[chosenAxis]));
  
    return inputUser;
}

function updateToolTip(currentXValue, currentYValue, container) {
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => {
                    console.log(d)
                    return `<div><strong>${d.state}</strong>
                    <br>${currentXValue}: ${d[currentXValue]} 
                    <br>${currentYValue}: ${d[currentYValue]} %</div>`});    
    svg.call(toolTip);

    // hover
    container.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);
   
    return container;
}

function updateChart() {
    // get selected value from axis
    var value = d3.select(this).attr("value");
    
    // get the x or y axis the value belongs to
    var choice = xAxisLabels.includes(value) ? "x":"y";

    // get the element entered
    var container = d3.selectAll(".container");

    var axis = (choice==="x") ? d3.select("#xAxis"):d3.select("#yAxis");
    //  select the chosenAxis
    var chosenAxis = (choice === "x") ? currentXValue:currentYValue;

    if (value != chosenAxis) {
        if(choice == "x") {
            currentXValue = value;
        }
        else {
            currentYValue = value;
        };

        if (choice === "x")
            chosenAxis = currentXValue;
        else
            chosenAxis = currentYValue;
        
        linearScale = setScale(plotData, chosenAxis, choice);
        
        axis = renderAxis(linearScale, axis, choice);
        
        container = renderCircles(container, linearScale, chosenAxis, choice);
        console.log(container)
        console.log("currentXValue: " + currentXValue)
        console.log("currentYValue: " + currentYValue)
        // updates tooltips with new info
        container = updateToolTip(currentXValue, currentYValue, container);
        
        
        axisLabels = (choice === "x") ? xAxisLabels:yAxisLabels
        axisLabels.forEach(label => {
            if(label === value) {
                
                d3.select(`[value=${label}]`).classed("active", true);
                d3.select(`[value=${label}]`).classed("inactive", false);
                
                d3.select(`[value=${choice+label}]`).classed("invisible", true);
            }
            else { 
                
                d3.select(`[value=${label}]`).classed("active", false);
                d3.select(`[value=${label}]`).classed("inactive", true);
                d3.select(`[value=${choice+label}]`).classed("invisible", false);
            }
        });
    };
}


function updateLabelsTooltip(xy, labelEnter) {
    console.log('updateLabelsTooltip')
   
    xy = (xy === "x") ? "y":"x";
    
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(d => `Move ${d} to ${xy}-axis`);
    
    svg.call(toolTip);
    
    labelEnter.classed("active inactive", true)
    .on('mouseenter', toolTip.show)
    .on('mouseleave', toolTip.hide)
    .on('mousedown', toolTip.hide);

    return labelEnter;
}

function updateLabelsText(xy, xPos, labelsText) {
    var chosenAxis = (xy === "x") ? currentXValue : currentYValue;
    var enterlabelsText = null; labelsText.enter()
                                    .append("text");
    enterlabelsText = labelsText.enter()
        .append("text")
        .merge(labelsText)
        .attr("x", xPos)
        .attr("y", (d,i) => (i+1)*margin.axisLabel)
        .attr("value", d => d) 
        .classed("active", d => (d === chosenAxis) ? true:false)
        .classed("inactive", d => (d === chosenAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);
}


function updateLabel() {
    console.log('updateLabel')
    
    var moveLabel = d3.select(this).attr("value");
    var befAxis = moveLabel.slice(0,1);
    var selectedLabel = moveLabel.slice(1);

    
    if (befAxis === "x") {
        // Remove label from x-axis labels
        xAxisLabels = xAxisLabels.filter(e => e !== selectedLabel);
        // Add label to yLabels labels
        yAxisLabels.push(selectedLabel);
    } 
    else {
        // Remove label from y-axis labels
        yAxisLabels = yAxisLabels.filter(e => e !== selectedLabel);
        // Add label to xTitles labels
        xAxisLabels.push(selectedLabel);
    }

    var xTitles = d3.select("#xTitles");
    
    
    var xTitlesText = xTitles.selectAll("text")
        .data(xAxisLabels);
    updateLabelsText("x", 0, xTitlesText);
    xTitlesText.exit().remove();


    var yLabels = d3.select("#yLabels");
    updateLabelsTooltip("y", yEnterLabelsRect);

    var yLabelsText = yLabels.selectAll("text")
        .data(yAxisLabels);
    
    updateLabelsText("y", margin.top, yLabelsText);
    yLabelsText.exit().remove();
}