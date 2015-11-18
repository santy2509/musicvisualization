function pianogramDraw(scope, element) {

  // watch for changes on scope.data
  scope.$watch("data", function() {
    var data = scope.data;
    update(data);
  });

  // define visualization dimensions
  var width = 700,
    height = 400,
    dataRadius = height / 2,
    outerRadius = height / 2.5,
    innerRadius = outerRadius / 1.5;

  // add touch to mouseover and mouseout
  var over = "ontouchstart" in window ? "touchstart" : "mouseover",
    out = "ontouchstart" in window ? "touchend" : "mouseout";

  // create radial pay layout
  var pie = d3.layout.pie()
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2)
    .padAngle(0.01)
    .value(function() { return 1; })
    .sort(null);

  // create radial arc attributes
  var arc = d3.svg.arc()
    .padRadius(outerRadius)
    .innerRadius(function(d) { return d.data.sharp ? innerRadius * 1.25 : innerRadius; })
    .outerRadius(function(d) { return outerRadius + (dataRadius * d.data.percentage); });

  // create main svg
  var svg = d3.select(element[0]).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height - 40) + ")");

  // draw keys based on data
  var key = svg.selectAll("path")
    .data(sharpen(scope.data))
    .enter().append("path")
    .each(function(d, i) { d.outerRadius = outerRadius; })
    .attr("class", function(d) {
      return "key key--" + (d.data.sharp ? "black" : "white");
    })
    .attr("d", arc)
    .on(over, tooltipShow)
    .on(out, tooltipHide);


  // create tooltip div
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


  // apply drawing specifics to handle sharp keys.  We will overlay
  // black keys over white keys for SVG draw ordering.
  function sharpen(keys) {
    var whiteKeys = pie(keys.filter(function(key) { return !key.sharp; }));
    var blackKeys = pie(keys.filter(function(key) { return key.sharp; }));
    var keyWidth = (pie.endAngle() - pie.startAngle()) / whiteKeys.length;

    blackKeys.forEach(function(blackKey) {
      blackKey.startAngle += keyWidth * 0.65;
      blackKey.endAngle += keyWidth * 0.35;
      if (!blackKey.data.exists) { // hide invalid keys
        blackKey.startAngle = 0;
        blackKey.endAngle = 0;
      }
    });
    keys = whiteKeys.concat(blackKeys); // add black keys after white keys
    return keys;
  }

  // updates visualization data
  function update(data) {
    arc.outerRadius(function(d) { return outerRadius + dataRadius * d.data.maxCountPercentage; });
    key.data(sharpen(data))
      .transition().delay(function(d, i) { return i * 10; })
      .attr("d", arc);
  }

  (function() { // handle sound effects on mouseover
    var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;
    if (!AudioContext) return console.error("AudioContext not supported");
    if (!OscillatorNode.prototype.start) OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
    if (!OscillatorNode.prototype.stop) OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;

    var context = new AudioContext;
    key.on(over + ".beep", function(d, i) {
      var now = context.currentTime,
        oscillator = context.createOscillator(),
        gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = d.data.frequency;
      gain.gain.linearRampToValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.6, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 1);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(0);
      setTimeout(function() { oscillator.stop(); }, 1500);
    });
  })();

  // helper function tooltipShow
  function tooltipShow(d) {
    tooltip.style("opacity", 0.9)
      .html("<strong>Note</strong>: " + d.data.keyId + "<br />" +
        "<strong>Octave</strong>: " + d.data.octave + "<br />" +
        "<strong>Count</strong>: " + Math.round(d.data.count) + "<br />" + 
        "<strong>Frequency</strong>: " + Math.round(d.data.percentage * 100 * 10) / 10 + "%")
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY) + "px");
  }

  // helper function tooltipHide
  function tooltipHide() {
    tooltip.style("opacity", 0);
  }
}