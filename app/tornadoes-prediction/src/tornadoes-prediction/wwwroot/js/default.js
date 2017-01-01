//Width and height of map

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
			  .range(["rgb(84,36,55)", "rgb(217,91,67)"]);

var legendText = ["under $5,000,000 loss", "over $5,000,000 loss"];

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
			.append("svg")
			.attr("width", width)
			.attr("height", "100%");




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
						.attr("height", 200)
						.selectAll("g")
						.data(color.domain().slice().reverse())
						.enter()
						.append("g")
						.attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

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


$("#form-ml").submit(function () {
	var jqxhr = $.get('api/Tornadoes', $('#form-ml').serialize())
		.success(function (response) {
			if(response[0]!==null)
			{
				d3.selectAll(".over").classed("over", false);
				d3.selectAll(".under").classed("under", false);
				d3.selectAll(".active").classed("active", active = false);
				if(response[1]==="more than $5,000,000")
				{
					
					d3.select('#' + response[0])
					.classed("over", true);

				}
				else {
					d3.select('#' + response[0])
						.classed("under", true);
				}
			}
		})
		.error(function () {
			$('#message').html("Error posting the update.");
		});
	return false;
});



