// Idea and most of the execution stolen from:
// http://bl.ocks.org/mbostock/4063318
// :)

(function() {
    'use strict';

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

    function weekdayHeatMap(weekdays) {
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

    function createHeatMapSkeleton() {
        var yearWidth = 960;
        var yearHeight = 170;
        var daySize = 17;
        var svg = d3.select('#heatMap')
            .data(d3.range(366))
            .attr('width', yearWidth)
            .attr('height', yearHeight);

        svg.append('text')
            .attr('x', 400)
            .attr('y', 16)
            .attr('class', 'chart-title')
            .text('Incidents Collapsed into Single Year');

        svg.append('text')
            .attr('x', 400)
            .attr('y', 40)
            .attr('class', 'chart-sub-title');
        
        // Put main graphic below the chart title
        svg = svg.append('g').attr('transform', 'translate(0 50)');

        // Create a rectangle for each day of the week with each rectangle's
        // location determined by the day of the week and the week of the year
        // that the day falls in
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

    // Given the number of equivalent slices a pie should have, this function will
    // calculate the start and end angle for each slice with the start angle
    // increasing
    function clockPie(slices) {
        return _.map(_.range(slices), function(val, index, list) {
            return {
                data: index,
                value: 1,
                startAngle: ((2 * Math.PI) / list.length ) * index,
                endAngle: ((2 * Math.PI) / list.length ) * (index + 1)
            };
        });
    }

    function createClock(id, text) {
        var i;
        var width = 300;
        var height = 352;
        var radius = Math.min(width, height) / 2;

        var arc = d3.svg.arc().outerRadius(radius - 10);
        var svg = d3.select(id)
            .attr('width', width)
            .attr('height', height);

        // Add chart title
        svg.append('text')
            .attr('x', (width / 2))
            .attr('class', 'chart-title')
            .attr('y', 16)
            .text(text);

        // Make everything in group relative to the center of the graphic
        svg = svg.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' +  height / 2 + ')');

        // Setup the slices.
        var g = svg.selectAll('.arc')
            .data(clockPie(12))
            .enter().append('g')
            .attr('class', 'absent arc');

        // Create the slices
        g.append('path').attr('d', arc);

        // Create the tooltips
        g.selectAll('path').append('title');

        // Create numbers on clock
        for (i = 0; i < 12; i++) {
            svg.append('text')
                .attr('x', 110 * Math.cos((2 * Math.PI) * (i / 12) - (Math.PI/2)))
                .attr('y', 110 * Math.sin((2 * Math.PI) * (i / 12) - (Math.PI/2)))
                .attr('text-anchor', 'middle')
                .attr('font-size', 18)
                .text(i === 0 ? 12 : i);
        }

        // Create tick marks
        for (i = 0; i < 36; i++) {
            svg.append('line')
                .attr('x1', 130 * Math.cos((2 * Math.PI) * (i / 36)))
                .attr('y1', 130 * Math.sin((2 * Math.PI) * (i / 36)))
                .attr('x2', 140 * Math.cos((2 * Math.PI) * (i / 36)))
                .attr('y2', 140 * Math.sin((2 * Math.PI) * (i / 36)))
                .attr('stroke', '#333')
                .attr('stroke-width', 2);
        }
    }

    function clockHeatMap(hours) {
        var color = colorScheme(d3.max(hours));

        // Humanize the time, as people need help telling time
        d3.select('#clock-morning').selectAll('path')
            .style('fill', function(d) { return color(hours[d.data]); })
            .selectAll('title')
            .text(function(d) {
                if (d.data === 0) {
                    return 'Midnight - 1 AM: ' + hours[d.data];
                }
                else if (d.data === 11) {
                    return '11 AM - noon: ' + hours[d.data];
                }
                return (d.data) + ' AM - ' + (d.data + 1) + ' AM: ' + hours[d.data];
            });

        d3.select('#clock-afternoon').selectAll('path')
            .style('fill', function(d) { return color(hours[d.data + 12]); })
            .selectAll('title')
            .text(function(d) {
                if (d.data === 0) {
                    return 'Noon - 1 PM: ' + hours[d.data + 12];
                }
                else if (d.data === 11) {
                    return '11 PM - midnight: ' + hours[d.data + 12];
                }
                return (d.data) + ' PM - ' + (d.data + 1) + ' PM: ' + 
                    hours[d.data + 12];
            });
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
    createClock('#clock-morning', 'Morning Incidents');
    createClock('#clock-afternoon', 'Afternoon Incidents');

    var ViewModel = function() {
        this.data = ko.observableArray(); 
        this.selectedCategory = ko.observable();
        this.selectedHeatMap = ko.observable('Days');

        // Returns a string of categories that the user can select to view the
        // data on. Since null represents all categories, replace it with 'All'
        this.categories = ko.computed(function() {
            var result = _.pluck(this.data(), 'category');
            result =  _.map(result, function(val) { return val === null ? 'All' : val; });
            result.sort();
            return result;
        }, this);

        // Returns the statistics that are associated with the selected
        // category
        this.selectedData = ko.computed(function() {
            if (!this.selectedCategory()) {
                return null;
            }

            var toFind = this.selectedCategory() === 'All' ? null :
                this.selectedCategory();

            return _.find(this.data(), function(val) {
                return val.category === toFind;
            }, this);
        }, this);

        // Returns the weekday statistics associated with the selected category
        this.weekdays = ko.computed(function() {
            var display = this.selectedData();
            return !display || [
                display.weekday.Sunday,
                display.weekday.Monday,
                display.weekday.Tuesday,
                display.weekday.Wednesday,
                display.weekday.Thursday,
                display.weekday.Friday,
                display.weekday.Saturday
            ];
        }, this);

        // Returns the day statistics associated with the selected category
        this.days = ko.computed(function() {
            var display = this.selectedData();
            return !display || display.day;
        }, this);

        // Returns the hour statistics associated with the selected category
        this.hours = ko.computed(function() {
            var display = this.selectedData();
            return !display || display.hour;
        }, this);

        // When the selected category has changed, update all the heat maps
        this.refreshData = ko.computed(function() {
            if (!this.selectedCategory()) {
                return;
            }

            switch (this.selectedHeatMap()) {
                case 'Months': monthHeatMap(this.days()); break;
                case 'Weeks': weekHeatMap(this.days()); break;
                case 'Days': dayHeatMap(this.days()); break;
                case 'Weekday': weekdayHeatMap(this.weekdays()); break;
            }

            var self = this;
            d3.select('#heatMap').select('.chart-sub-title').text(function() {
                return self.selectedCategory() + ' Incidents Aggregated by ' +
                    self.selectedHeatMap();
            });

            clockHeatMap(this.hours());
        }, this);
    };

    var vm = new ViewModel();

    d3.json('/api/v1/statistics', function(error, json) {
        vm.data(json.result);
        d3.select('#heatMap').selectAll('rect').classed('day-absent', false);
    });
    
    ko.applyBindings(vm);
})();

