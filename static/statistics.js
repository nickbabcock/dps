// Idea and most of the execution stolen from:
// http://bl.ocks.org/mbostock/4063318
// :)

var dateFormat = d3.time.format('%b %e');
var week = d3.time.format('%U');
var day = d3.time.format('%w');
var dayOfYear = d3.time.format('%j');
var yearWidth = 960;
var yearHeight = 136;
var daySize = 17;

var svg = d3.select('div.content')
    .select('svg')
    .data(d3.range(366))
    .attr('width', yearWidth)
    .attr('height', yearHeight);

d3.json('/api/v1/statistics', function(error, json) {
    var days = json.day;
    var color = d3.scale.linear()
        .domain([0, d3.max(days)])
        .range(['#eeeeee', '#1e6823']);

    var rects = svg.selectAll('rect')
        .data(function(d) {
            var thisYear = (new Date()).getFullYear();
            return d3.time.days(new Date(thisYear, 0, 1),
                                new Date(thisYear + 1, 0, 1));
        })
        .enter().append('rect')
        .attr('class', 'day')
        .attr('width', daySize)
        .attr('height', daySize)
        .attr('x', function(d) { return week(d) * daySize; })
        .attr('y', function(d) { return day(d) * daySize; })
        .attr('fill', function(d) { return color(days[+dayOfYear(d)]);})

    // Create informative text for the squares
    rects.append('title')
        .text(function(d) { return dateFormat(d) + ": " + days[+dayOfYear(d)]; });

    // Create month outline
    svg.selectAll('.month')
        .data(function(d) {
            var thisYear = (new Date()).getFullYear();
            return d3.time.months(new Date(thisYear, 0, 1),
                                  new Date(thisYear + 1, 0, 1));
        })
        .enter().append('path')
        .attr('class', 'month')
        .attr('d', monthPath);
});

// Given a date that represents a month, will create a path that will encompass
// the month and give a nice outline
function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * daySize + "," + (d0 * daySize === 0 ? 1 : d0 * daySize)
      + "H" + w0 * daySize + "V" + 7 * daySize
      + "H" + w1 * daySize + "V" + (d1 + 1) * daySize
      + "H" + (w1 + 1) * daySize + "V" + 1
      + "H" + (w0 + 1) * daySize + "Z";
}

