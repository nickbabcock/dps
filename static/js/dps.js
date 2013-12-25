(function() {
    'use strict';

    var gmap = function(markers, latitude, longitude) {
        var url = GMaps.staticMapURL({
            size: [610, 300],
            lat: latitude,
            lng: longitude,
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
        var defaultLat = 42.2756663;
        var defaultLng = -83.7356758;
        this.incidents = ko.observableArray();
        this.page = ko.observable(0);
        this.pageSize = ko.observable(10);
        this.address = ko.observable();
        this.googleAddr = ko.observable();
        this.search = ko.observable({});

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
                self.googleAddr(data.results[0].formatted_address);

                self.search({
                    lat: location.lat,
                    lng: location.lng,
                    color: 'blue'
                });
            });
        };

        this.clearAddress = function() {
            this.googleAddr('');
            this.search({});
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

            // If the user has searched for something display a marker where
            // they searched
            if (this.search()) {
                markers.push(this.search());
            }

            return markers;
        }, this);

        this.sendRequest = ko.computed(function() {
            var obj = {
                take: this.pageSize(),
                skip: this.page() * this.pageSize(),
                lat: this.search().lat,
                lng: this.search().lng
            };
            
            $.getJSON('/api/v1/latest', obj, function(data) {
                self.incidents([]);
                var results = data.result;     
                for (var i = 0; i < results.length; i++) {
                    self.incidents.push(new Person(results[i]));
                }
                
                gmap(self.markers(), self.search().lat || defaultLat,
                    self.search().lng || defaultLng);
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
