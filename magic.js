var yellowApiKey = 'exbpfptg75sv33yfyyjhtsb4'; // Sandbox key.  Not useful.
var stops = null;
var map;

function changeNeighbourhood(e) {
	e.preventDefault();
	
	jQuery.get('http://nominatim.openstreetmap.org/search?json_callback=?', 
		{
			'q': jQuery('#location').val() + ', Montreal',
			'format': 'json'
		}, 
		function (data) {
			// Let's just assume the geocoder is AMAZING.
			if (data.length > 0) {
				map.panTo(new L.LatLng(data[0].lat, data[0].lon));
			} else {
				alert('Sad geocoder is sad.  Blurp.');
			}
		}, 'jsonp');
}

function getStops() {
	jQuery.get('data/stops.json', function (json) {
		stops = json;
	});
}

function init() {
	// replace "toner" here with "terrain" or "watercolor"
	var layer = new L.StamenTileLayer("toner");
	map = new L.Map("map", {
	    center: new L.LatLng(45.5081, -73.5550),
	    zoom: 15
	});
	map.addLayer(layer);
	
	getStops();
	
	jQuery('#changeLocation').click(changeNeighbourhood);
}

jQuery(document).ready(init);