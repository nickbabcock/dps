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
        this.time = moment(data.time, 'YYYY-MM-DD HH:mm:ss').format('ddd h:mm A');
        this.description = data.description;
        this.longitude = data.longitude;
        this.latitude = data.latitude;
    };

    var ViewModel = function() {
        var self = this;
        this.incidents = ko.observableArray();
        this.page = ko.observable(0);
        this.pageSize = ko.observable(10);
        this.address = ko.observable();

        this.searchAddress = function() { 
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
                    
                    gmap(self.markers(), obj.lat, obj.lng);
                });
            });
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
