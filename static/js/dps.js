(function() {
    'use strict';

    var url = GMaps.staticMapURL({
      size: [610, 300],
      lat: 42.2756663,
      lng: -83.7356758
    });

    document.getElementById('map').src =  url;
})();
