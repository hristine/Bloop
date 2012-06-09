var yellowApiKey = 'exbpfptg75sv33yfyyjhtsb4'; // Sandbox key.  Not useful.

function init() {
	// replace "toner" here with "terrain" or "watercolor"
	var layer = new L.StamenTileLayer("toner");
	var map = new L.Map("map", {
	    center: new L.LatLng(45.5081, -73.5550),
	    zoom: 12
	});
	map.addLayer(layer);
}

jQuery(document).ready(init);