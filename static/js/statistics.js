// Idea and most of the execution stolen from:
// http://bl.ocks.org/mbostock/4063318
// :)

var days = [];
var weekdays = [];

// Returns the current year as a number
function firstOfYear() {
    var year = (new Date()).getFullYear();
    return new Date(year, 0);
}

function lastOfYear() {
    var year = (new Date()).getFullYear();
    return new Date(year + 1, 0);
}

function dayHeatMap(days) {
    var color = colorScheme(d3.max(days));
    var dayFormat = d3.time.format('%b %e');
    d3.select('#heatMap').selectAll('rect')
        .attr('fill', function(d) { return color(days[d3.time.dayOfYear(d)]);});

    d3.select('#heatMap').selectAll('title')
        .text(function(d) { return dayFormat(d) + ": " + days[d3.time.dayOfYear(d)]; });
}

// Converts a day (range: [0-365]) to the corresponding date offset from the
// first of the current year
function dayToDate(dayIndex) {
    var result = firstOfYear();
    result.setDate(result.getDate() + dayIndex);
    return result;
}

function weekHeatMap(days) {
    var thisYear = (new Date()).getFullYear();

    // Create an array for the number of weeks by grouping all the days by the
    // week they occur in, and then sum all the days by each week up.
    var weeks = _.chain(days).groupBy(function(val, index) {
        return d3.time.weekOfYear(dayToDate(index));
    }).map(function(val) { return d3.sum(val); }).value();

    var color = colorScheme(d3.max(weeks));
    d3.select('#heatMap').selectAll('rect')
        .attr('fill', function(d) { return color(weeks[d3.time.weekOfYear(d)]);});

    // For each column, display the week (starting Sunday and ending Saturday)
    // range and the number of incidents that occurred in that interval
    d3.select('#heatMap').selectAll('title')
        .text(function(d) {
            var prevSunday = d3.time.sunday(d);
            var nextSaturday = new Date(prevSunday.getTime());
            nextSaturday.setDate(prevSunday.getDate() + 6);
            var weekFormat = d3.time.format('%b %e');
            var min = prevSunday < firstOfYear() ? firstOfYear() : prevSunday;
            var max = nextSaturday > lastOfYear() ? lastOfYear() : nextSaturday;
            return weekFormat(min) + ' - ' + weekFormat(max) +
                ': ' + weeks[d3.time.weekOfYear(d)];
        });
}

function monthHeatMap(days) {
    var monthFormat = d3.time.format('%m');
    var months = _.chain(days).groupBy(function(val, index) {
        return +monthFormat(dayToDate(index));
    }).map(function (val) { return d3.sum(val); }).value();

    var color = colorScheme(d3.max(months));
    d3.select('#heatMap').selectAll('rect')
        .attr('fill', function(d) { return color(months[+monthFormat(d) - 1]); });

    d3.select('#heatMap').selectAll('title')
        .text(function(d) {
            return d3.time.format('%B')(d) + ': ' + months[monthFormat(d) - 1];
        });
}

function weekdayHeatMap(days) {
    var color = colorScheme(d3.max(weekdays));

    // change the domain of the scale slightly so the differences between
    // days is noticeable -- but not deceiving at the same time
    color.domain([d3.min(weekdays) / 2, d3.max(weekdays)]);
    d3.select('#heatMap').selectAll('rect')
        .attr('fill', function(d) { return color(weekdays[d.getDay()]); });

    d3.select('#heatMap').selectAll('title')
        .text(function(d) {
            return d3.time.format('%A')(d) + ': ' + weekdays[d.getDay()];
        });
}

function hookUpEvents() {
    $('button.btn-weeks').on('click', function() { weekHeatMap(days); });
    $('button.btn-months').on('click', function() { monthHeatMap(days); });
    $('button.btn-days').on('click', function() { dayHeatMap(days); });
    $('button.btn-weekday').on('click', function() { weekdayHeatMap(days); });
}

function createHeatMapSkeleton() {
    var yearWidth = 960;
    var yearHeight = 136;
    var daySize = 17;
    var svg = d3.select('#heatMap')
        .data(d3.range(366))
        .attr('width', yearWidth)
        .attr('height', yearHeight);

    var rects = svg.selectAll('rect')
        .data(function(d) { return d3.time.days(firstOfYear(), lastOfYear()); })
        .enter().append('rect')
        .attr('class', 'day day-absent')
        .attr('width', daySize)
        .attr('height', daySize)
        .attr('x', function(d) { return d3.time.weekOfYear(d) * daySize; })
        .attr('y', function(d) { return d.getDay() * daySize; });

    // Create informative text for the squares
    rects.append('title');

    // Create month outline
    svg.selectAll('.month')
        .data(function(d) { return d3.time.months(firstOfYear(), lastOfYear()); })
        .enter().append('path')
        .attr('class', 'month')
        .attr('d', function(d) { return monthPath(d, daySize); });
}

function clockPie(data) {
    return _.map(data, function(val, index, list) {
        return {
            data: index,
            value: val,
            startAngle: ((2 * Math.PI) / list.length ) * index,
            endAngle: ((2 * Math.PI) / list.length ) * (index + 1)
        };
    });
}

function createClock(id, text) {
    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    var data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    var arc = d3.svg.arc().outerRadius(radius - 10);
    var pie = d3.layout.pie().value(function(d) { return d.value; });
    var svg = d3.select(id)
        .attr('width', width)
        .attr('height', height);

    svg.append('text')
        .attr('x', (width / 2))
        .attr('text-anchor', 'middle')
        .text(text);

    svg = svg.append('g')
        .attr('transform', 'translate(' + width / 2 + ',' +  height / 2 + ')');


    var g = svg.selectAll('.arc')
        .data(clockPie(data))
        .enter().append('g')
        .attr('class', 'absent arc');

    g.append('path')
        .attr('d', arc);
}

function clockHeatMap(hours) {
    var color = colorScheme(d3.max(hours));
    d3.select('#clock-morning').selectAll('path')
        .style('fill', function(d) { return color(hours[d.data]); })
        .append('title')
        .text(function(d) { return (d.data + 1) + ' AM: ' + hours[d.data]; });
    d3.select('#clock-afternoon').selectAll('path')
        .style('fill', function(d) { return color(hours[d.data + 12]); })
        .append('title')
        .text(function(d) { return (d.data + 1) + ' PM: ' + hours[d.data + 12];});
}

// Given a date that represents a month, will create a path that will encompass
// the month and give a nice outline
function monthPath(t0, daySize) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
      d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
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

createHeatMapSkeleton();
createClock('#clock-morning', 'Morning');
createClock('#clock-afternoon', 'Afternoon');

d3.json('/api/v1/statistics', function(error, json) {
    hookUpEvents();
    days = json.day;
    weekdays = [
        json.weekday.Sunday,
        json.weekday.Monday,
        json.weekday.Tuesday,
        json.weekday.Wednesday,
        json.weekday.Thursday,
        json.weekday.Friday,
        json.weekday.Saturday
    ];

    dayHeatMap(days);
    clockHeatMap(json.hour);
    d3.select('#heatMap').selectAll('rect').classed('day-absent', false);
});


