var yellowApiKey = 'exbpfptg75sv33yfyyjhtsb4'; // Sandbox key.  Not useful.
var stops = null;
var map;

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
	    zoom: 12
	});
	map.addLayer(layer);
	
	getStops();
}

jQuery(document).ready(init);