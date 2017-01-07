//Width and height of map
//var viewportWidth = $(window).width();
//var viewportHeight = $(window).height() / 2;
//var width = viewportWidth * .60;
//var height = 500;


//var margin = { top: 20, right: 20, bottom: 70, left: 20 },
//width = viewportWidth  - margin.left - margin.right,
//height = viewportWidth  - margin.top - margin.bottom;
var width = 1060;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
				   .translate([width / 2, height / 2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
			 .projection(projection);  // tell path generator to use albersUsa projection

// Define linear scale for output
var color = d3.scale.linear()
			  .range(["rgb(84,36,55)", "rgb(26,86,36)"]);

var legendText = ["under $5,000,000 loss", "over $5,000,000 loss"];

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
			.append("svg")
			.attr("width", width)
			.attr("height", height);
			//.attr("preserveAspectRatio", "xMinYMin meet")
			//.attr("viewBox", "0 0 300 300")
			//.classed("svg-content", true);

d3.csv("data/us-codes.csv", function (data) {
	// Load GeoJSON data and merge with states data
	d3.json("data/us-states.json", function (json) {
		for (var i = 0; i < data.length; i++) {
			// Grab State Name
			var dataState = data[i].State;
			// Grab data value
			var dataValue = data[i].PostalCode;
			for (var j = 0; j < json.features.length; j++) {
				var jsonState = json.features[j].properties.name;
				if (dataState === jsonState) {
					// Copy the data value into the JSON
					json.features[j].properties.label = dataValue;
					// Stop looking through the JSON
					break;
				}
			}
		}

		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "feature")
			.attr('id', function (d) { return d.properties.label; })
			.on("click", click);

		var active;

		function click(d) {
			if (active === d) return reset();
			svg.selectAll(".active").classed("active", false);
			d3.select(this).classed("active", active = d);

			$('#State').val(d.properties.label);

			var b = path.bounds(d);
			svg.transition().duration(750).attr("transform",
				"translate(" + projection.translate() + ")"
				+ "scale(" + .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
				+ "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
		}

		function reset() {
			d3.selectAll(".active").classed("active", active = false);
			//svg.transition().duration(750).attr("transform", "");
		}

		svg.selectAll("text")
			.data(json.features)
			.enter()
			.append("svg:text")
			.text(function (d) {
				return d.properties.label;
			})
			.attr("x", function (d) {
				return path.centroid(d)[0];
			})
			.attr("y", function (d) {
				return path.centroid(d)[1];
			})
			.attr("text-anchor", "middle")
			.attr('font-size', '6pt');

		// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
		var legend = d3.select("#map").append("svg")
						.attr("class", "legend")
						.attr("width", 240)
						.attr("height", 50)
						.selectAll("g")
						.data(color.domain().slice().reverse())
						.enter()
						.append("g")
						.attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
						//.classed("svg-content", true);

		legend.append("rect")
			  .attr("width", 18)
			  .attr("height", 18)
			  .style("fill", color);

		legend.append("text")
			  .data(legendText)
			  .attr("x", 24)
			  .attr("y", 9)
			  .attr("dy", ".35em")
			  .text(function (d) { return d; });
	});
});

var Months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "Octomber", "November", "December"];

var form = document.getElementById("form-ml");

$('#all_months_chb').change(function () {
	form.elements.Month.disabled = this.checked;
});


function makechart(jsondata, state) {
	var margin = { top: 20, right: 20, bottom: 70, left: 40 },
	width = 600 - margin.left - margin.right,
	height = 300 - margin.top - margin.bottom;

	var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

	var y = d3.scale.linear().range([height, 0]);

	// define the axis
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")


	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);


	// add the SVG element
	d3.selectAll("#chartsvg").remove();

	var svg = d3.select("#result").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", "chartsvg")
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")")
		.classed("svg-content", true);


	
		// scale the range of the data
		x.domain(jsondata.map(function (d) { return d.month; }));
		y.domain([0, d3.max(jsondata, function (d) { return Math.round(d.probability * 100); })]);

		// add axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
		  .selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", "-.55em")
			.attr("transform", "rotate(-90)");

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -40)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Probability (%)");

		svg.append("text")
			.attr("x", (width / 2))
			.attr("y", 0 )
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("text-decoration", "underline")
			.text("Tornadoes loss for " + state);


		// Add bar chart
		svg.selectAll("bar")
			.data(jsondata)
		  .enter().append("rect")
			.attr("class", "bar")
			.attr("x", function (d) { return x(d.month); })
			.attr("width", x.rangeBand())
			.attr("y", function (d) { return y(Math.round(d.probability * 100)); })
			.attr("height", function (d) { return height - y(Math.round(d.probability * 100)); })
		.attr("fill", function (d) {
			if (d.losses === "more than $5,000,000") {
				return '#542437';
			}
			return "#1a5624";
		});

	
}

var allMonths = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octomber', 'November', 'December'];

function predicatBy(prop) {
    return function (a, b) {
        if (allMonths.indexOf(a[prop]) > allMonths.indexOf(b[prop])) {
            return 1;
        } else if (allMonths.indexOf(a[prop]) < allMonths.indexOf(b[prop])) {
            return -1;
        }
        return 0;
    };
}


$("#form-ml").submit(function () {
	if (document.getElementById('all_months_chb').checked) {				
		
		var responseList = [];
				for (i = 0; i < Months.length; i++) {
					
					var data = {
						Month: Months[i], State: form.elements[2].value, FScale: form.elements[3].value,
						Lengthmiles: form.elements[4].value, Widthyards: form.elements[5].value
					};
					
					
					var jqxhr = $.get('api/Tornadoes', data)
						.success(function (response) {
							if (response.losses !== null) {
								responseList.push(response);							
							
								if (responseList.length === 12) {
								    $('#result').html('');
									responseList.sort(predicatBy("month"));
									makechart(responseList, data.State);
								}
							}
						})
					.error(function () {
						$('#message').html("Something went wrong.");
					});

				}
				
			}
			else {
				var jqxhr = $.get('api/Tornadoes', $('#form-ml').serialize())
					.success(function (response) {
						if (response.losses !== null) {
							d3.selectAll(".over").classed("over", false);
							d3.selectAll(".under").classed("under", false);
							d3.selectAll(".active").classed("active", active = false);
							var result = '<div class="';
							if (response.losses === "more than $5,000,000") {
								d3.select('#' + response.state)
								.classed("over", true);
								result += 'bg-danger"';
							}
							else {
								d3.select('#' + response.state)
									.classed("under", true);
								result += 'bg-success"';
							}
							result += '>The state ' + response.state + ' for the month ' + response.month + ' will have losses ' + response.losses + ' with probability ' + Math.round(response.probability * 100) + '%</div>';
							$('#result').html(result);
						}
					})
					.error(function () {
						$('#message').html("Something went wrong.");
					});
			
		}
	return false;
});


