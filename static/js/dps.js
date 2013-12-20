(function() {
    'use strict';

    var gmap = function(markers) {
        var url = GMaps.staticMapURL({
            size: [610, 300],
            lat: 42.2756663,
            lng: -83.7356758,
            markers: markers
        });

        $('#map').attr('src', url);
    };

    var Person = function(data) {
        this.crime = data.crime;
        this.time = moment(data.time, 'YYYY-MM-DD HH:mm:ss').format('ddd h:mm A');
        this.description = data.description;
    };

    var ViewModel = function() {
        this.incidents = ko.observableArray();
        this.page = ko.observable(0);
        this.pageSize = ko.observable(10);
        this.latestRequest = ko.computed(function() {
            var obj = { take: this.pageSize(), skip: this.page() * this.pageSize() };
            var that = this;
            this.incidents([]);
            $.getJSON('/api/v1/latest', obj, function(data) {
                var results = data.result;     
                var locations = [];
                for (var i = 0; i < results.length; i++) {
                    that.incidents.push(new Person(results[i]));
                    locations.push({ lat: results[i].latitude, lng: results[i].longitude });
                }
                
                gmap(locations);
            });
        }, this);

        this.nextPage = function() {
            this.page(this.page() + 1);
        };

        this.prevPage = function() {
            this.page(this.page() - 1);
        };
    };

    var vm = new ViewModel();

    gmap();
    ko.applyBindings(vm);
})();
