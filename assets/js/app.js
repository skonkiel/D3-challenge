// set svg size
var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

// set chart width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("body").select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import data
d3.csv("data.csv").then(function(data) {

    // Parse data/Cast as numbers: poverty vs healthcare
    data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([8, d3.max(data, d => d.poverty) + 2])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.healthcare) + 2])
      .range([height, d3.max(data, d => d.healthcare)]); 

    // Step 3: Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // create groups for circles and text
    // adapted from http://bl.ocks.org/ChrisJamesC/4474971
    // https://www.d3indepth.com/selections/

    var dots = chartGroup.selectAll("g circle")
      .data(data);

    var dotsEnter = dots.enter()
      .append("g")
      // .attr("transform", function(d) {return "translate("+d.x+",80"});
    
      // Create Circles
    dotsEnter.append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "blue")
      .attr("opacity", ".75")
      .classed("stateCircle", true);

    // append text
    dotsEnter.append("text")
      .attr("dx", d => xLinearScale(d.poverty))
      .attr("dy", d => yLinearScale(d.healthcare)+5)
      .classed("stateText", true)
      .text(d => d.abbr);

    // Initialize tool tip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
      });

    // Create tooltip in the chart
    chartGroup.call(toolTip);

    // Create event listeners to display and hide the tooltip
    dotsEnter.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height/1.5))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");

  }).catch(function(error) {
    console.log(error);
  });
