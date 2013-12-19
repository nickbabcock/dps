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
        this.time = data.time;
        this.description = data.description;
    };

    var viewModel = {
        incidents: ko.observableArray()
    };

    $.getJSON('/api/v1/latest', function(data) {
        var results = data.result;     
        var locations = [];
        for (var i = 0; i < results.length; i++) {
            viewModel.incidents.push(new Person(results[i]));
            locations.push({ lat: results[i].latitude, lng: results[i].longitude });
        }
        
        gmap(locations);
    });

    gmap();
    ko.applyBindings(viewModel);
})();
