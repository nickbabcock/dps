// Idea and most of the execution stolen from:
// http://bl.ocks.org/mbostock/4063318
// :)

var week = d3.time.format('%U');
var day = d3.time.format('%w');
var yearWidth = 960;
var yearHeight = 136;
var daySize = 17;
var days = [];

// Returns the current year as a number
function thisYear() {
    return (new Date()).getFullYear();
}

function dayHeatMap(days) {
    var color = colorScheme(d3.max(days));
    var dayOfYear = d3.time.format('%j');
    var dayFormat = d3.time.format('%b %e');
    d3.select('svg').selectAll('rect')
        .attr('fill', function(d) { return color(days[+dayOfYear(d) - 1]);});

    d3.select('svg').selectAll('title')
        .text(function(d) { return dayFormat(d) + ": " + days[+dayOfYear(d) - 1]; });
}

function weekHeatMap(days) {
    var weeks = _.chain(days).groupBy(function(val, index) {
        var date = new Date(thisYear(), 0);
        date.setDate(index + 1);
        return +week(date);
    }).map(function(val) { return d3.sum(val); }).value();

    var color = colorScheme(d3.max(weeks));
    d3.select('svg').selectAll('rect')
        .attr('fill', function(d) { return color(weeks[+week(d)]);});
}

function monthHeatMap(days) {
    var monthFormat = d3.time.format('%m');
    var months = _.chain(days).groupBy(function(val, index) {
        var date = new Date(thisYear(), 0);
        date.setDate(index + 1);
        return +monthFormat(date);
    }).map(function (val) { return d3.sum(val); }).value();

    var color = colorScheme(d3.max(months));
    d3.select('svg').selectAll('rect')
        .attr('fill', function(d) { return color(months[+monthFormat(d) - 1]); });
}

$('button.btn-weeks').on('click', function() { weekHeatMap(days); });
$('button.btn-months').on('click', function() { monthHeatMap(days); });
$('button.btn-days').on('click', function() { dayHeatMap(days); });

var svg = d3.select('div.content')
    .select('svg')
    .data(d3.range(366))
    .attr('width', yearWidth)
    .attr('height', yearHeight);

var rects = svg.selectAll('rect')
    .data(function(d) {
        return d3.time.days(new Date(thisYear(), 0, 1),
                            new Date(thisYear() + 1, 0, 1));
    })
    .enter().append('rect')
    .attr('class', 'day')
    .attr('width', daySize)
    .attr('height', daySize)
    .attr('x', function(d) { return week(d) * daySize; })
    .attr('y', function(d) { return day(d) * daySize; });

// Create informative text for the squares
rects.append('title');

// Create month outline
svg.selectAll('.month')
    .data(function(d) {
        return d3.time.months(new Date(thisYear(), 0, 1),
                              new Date(thisYear() + 1, 0, 1));
    })
    .enter().append('path')
    .attr('class', 'month')
    .attr('d', monthPath);

d3.json('/api/v1/statistics', function(error, json) {
    days = json.day;
    dayHeatMap(days);
});

// Given a date that represents a month, will create a path that will encompass
// the month and give a nice outline
function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * daySize + "," + (d0 * daySize === 0 ? 1 : d0 * daySize) + 
    "H" + w0 * daySize + "V" + 7 * daySize +
    "H" + w1 * daySize + "V" + (d1 + 1) * daySize +
    "H" + (w1 + 1) * daySize + "V" + 1 +
    "H" + (w0 + 1) * daySize + "Z";
}

function colorScheme(maxValue) {
    return d3.scale.linear()
        .domain([0, maxValue])
        .range(['#eeeeee', '#1e6823']);
}