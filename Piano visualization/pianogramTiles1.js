function pianogramDraw(scope, element) {

  // load angular variables
  var data = scope.data;

  // // watch for changes on scope.data
  scope.$watch("data", function() {
    var data = scope.data;
    update(data);
  });


  // set parameters
  var tileSize = 35;
  var width = tileSize * data.notes.length;
  var height = tileSize * data.octaves.length;
  var margin = {
    top: 100,
    right: 25,
    bottom: tileSize,
    left: 50
  };
  var svgWidth = width + margin.left + margin.right;
  var svgHeight = height + margin.top + margin.bottom;
  var legendElementWidth = width / data.colors.length;


  // create tooltip div
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // create heatmap colorScale
  var colorScale = d3.scale.quantile()
    .domain([0, 10])
    .range(data.colors);

  // create SVG element
  var svg = d3.select(element[0])
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("id", "pianogram-tiles")
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


  // create heatMap
  var heatMap = svg.selectAll(".tile");

  // create heatMap tiles
  heatMap
    .data(data.values)
    .enter().append("rect")
    .classed("tile", true)
    .attr("x", function(d, i) {
      return data.notes.indexOf(d.note) * tileSize;
    })
    .attr("y", function(d, i) {
      return data.octaves.indexOf(d.octave) * tileSize;
    })
    .attr("width", tileSize - 1)
    .attr("height", tileSize - 1)
    .attr("stroke", "lightgray")
    .attr("stroke-width", "1px")
    .style("fill", data.colors[0])
    .on("mouseover", function(d) {
      tooltipShow(d);
      d3.select(this)
        .style("stroke", "red")
        .style("stroke-width", "2px");
    })
    .on("mouseleave", function(d) {
      tooltipHide();
      d3.select(this)
        .style("stroke", "lightgray")
        .style("stroke-width", "1px");
    });

  // create heatMap count text
  heatMap
    .data(data.values)
    .enter().append("text")
    .classed("tile-text", true)
    .attr("x", function(d, i) {
      return (data.notes.indexOf(d.note) + 0.5) * tileSize;
    })
    .attr("y", function(d, i) {
      return (data.octaves.indexOf(d.octave) + 0.5) * tileSize;
    })
    .text(function(d) {
      if (d.count) return d.count;
    });


  // create keyboard
  var keyboard = svg.append("g").selectAll(".keyboard")
    .data(data.whites)
    .enter().append("rect")
    .classed("keyboard", true)
    .attr("x", function(d, i) {
      return i * tileSize;
    })
    .attr("y", -tileSize)
    .attr("width", tileSize)
    .attr("height", tileSize)
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .style("fill", function(d) {
      return d ? "white" : "black";
    });


  // create note label
  var noteLabel = svg.append("g").selectAll("text")
    .data(data.notes)
    .enter().append("text")
    .classed("svg-label", true)
    .text(function(d) {
      return d;
    })
    .attr("x", function(d, i) {
      return i * tileSize;
    })
    .attr("y", -tileSize)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + tileSize / 2 + ", -5)");


  // create octave label
  var octaveLabel = svg.append("g").selectAll("text")
    .data(data.octaves)
    .enter().append("text")
    .classed("svg-label", true)
    .text(function(d) {
      return d;
    })
    .attr("x", 0)
    .attr("y", function(d, i) {
      return i * tileSize;
    })
    .style("text-anchor", "middle")
    .attr("transform", "translate(-10, " + tileSize / 1.5 + ")");


  // create legend
  var legend = svg.selectAll(".svg-legend")
    .data([0].concat(colorScale.quantiles()), function(d) {
      return d;
    })
    .enter().append("rect")
    .classed("svg-legend", true)
    .attr("x", function(d, i) {
      return legendElementWidth * i;
    })
    .attr("y", height)
    .attr("width", legendElementWidth)
    .attr("height", tileSize * 0.5)
    .style("fill", function(d, i) {
      return data.colors[i];
    });




  // helper function update
  function update(data) {

    // reupdate colorScale
    var colorScale = d3.scale.quantile()
      .domain([0, data.colors.length - 1, d3.max(data.values, function(d) {
        return d.count;
      })])
      .range(data.colors);

    // update heatMap tiles
    svg.selectAll(".tile")
      .data(data.values)
      .transition().duration(1000)
      .style("fill", function(d) {
        return colorScale(d.count);
      });

    // update heatMap count text
    svg.selectAll(".tile-text")
      .data(data.values)
      .transition().duration(1000)
      .text(function(d) {
        if (d.count) return d.count;
      });
  }


  // helper function tooltipShow
  function tooltipShow(d) {
    tooltip.style("opacity", 0.9)
      .html("<strong>Note</strong>: " + d.note + "<br />" +
        "<strong>Octave</strong>: " + d.octave + "<br />" +
        "<strong>Count</strong>: " + d.count.toFixed(0) + "<br />" +
        "<strong>Frequency</strong>: " + d.frequency.toFixed(1) + "%")
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY) + "px");
  }

  // helper function tooltipHide
  function tooltipHide() {
    tooltip.style("opacity", 0);
  }
}