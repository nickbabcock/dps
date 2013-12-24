(function() {
    'use strict';

    var gmap = function(markers, latitude, longitude) {
        var url = GMaps.staticMapURL({
            size: [610, 300],
            lat: latitude || 42.2756663,
            lng: longitude || -83.7356758,
            markers: markers
        });

        $('#map').attr('src', url);
    };

    var Person = function(data) {
        this.crime = data.crime;
        this.description = data.description;
        this.longitude = data.longitude;
        this.latitude = data.latitude;

        // If the incident happened recently, simply put the day of the week
        // and the time, else put a relative date (10 days ago, etc) 
        var then = moment(data.time, 'YYYY-MM-DD HH:mm:ss');
        if (moment().diff(then, 'days') > 7) {
            this.time = then.fromNow();
        }
        else {
            this.time = then.format('ddd h:mm A');
        }
    };

    var ViewModel = function() {
        var self = this;
        this.incidents = ko.observableArray();
        this.page = ko.observable(0);
        this.pageSize = ko.observable(10);
        this.address = ko.observable();

        this.searchAddress = function() { 
            // Searching an address brings us to the first page
            this.page(0);
            
            // Make typing 'ann arbor' an option for the lazy
            var addr = this.address().toLowerCase();
            if (addr.indexOf('ann arbor') === -1) {
                addr += ', ann arbor, MI';
            }

            var url = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false';
            $.getJSON(url, {address: addr}, function(data) {
                var location = data.results[0].geometry.location;

                var obj = { 
                    take: self.pageSize(),
                    skip: self.page() * self.pageSize(),
                    lat: location.lat,
                    lng: location.lng
                };

                $.getJSON('/api/v1/latest', obj, function(data) {
                    self.incidents([]);        
                    var results = data.result;     
                    for (var i = 0; i < results.length; i++) {
                        self.incidents.push(new Person(results[i]));
                    }

                    var markers = self.markers();
                    markers.push({
                        lat: obj.lat,
                        lng: obj.lng,
                        color: 'blue'
                    });
                    
                    gmap(markers, obj.lat, obj.lng);
                });
            });
        };

        // Let the user press the enter key in the input field to submit query
        this.inputChange = function(data, event) {
            if (event.keyCode === 13) {
                this.searchAddress();
            }
        };

        // Transform the longitude and latitude stored in the incidents into
        // a format that google maps can use.
        this.markers = ko.computed(function() {
            var markers = [];
            var results = this.incidents();
            for (var i = 0; i < results.length; i++) {
                markers.push({ lat: results[i].latitude, lng: results[i].longitude });
            }

            return markers;
        }, this);

        // Whenever there is a page change, request additional information from
        // the server and show a new map
        this.latestRequest = ko.computed(function() {
            var obj = { take: this.pageSize(), skip: this.page() * this.pageSize() };
            this.incidents([]);
            $.getJSON('/api/v1/latest', obj, function(data) {
                var results = data.result;     
                for (var i = 0; i < results.length; i++) {
                    self.incidents.push(new Person(results[i]));
                }
                
                gmap(self.markers());
            });
        }, this);

        // Advance to the next page of incidents
        this.nextPage = function() {
            this.page(this.page() + 1);
        };

        // Advance to the previous page of incidents
        this.prevPage = function() {
            this.page(this.page() - 1);
        };

        // When an incident item has been clicked, center it on the map
        this.centerOnIncident = function(incident) {
            gmap(self.markers(), incident.latitude, incident.longitude);
        };
    };

    var vm = new ViewModel();

    gmap();
    ko.applyBindings(vm);
})();
