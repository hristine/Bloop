var yellowApiKey = 'exbpfptg75sv33yfyyjhtsb4'; // Sandbox key.  Not useful.
var stops = null;
var places = {};
var map;

function findBusinesses(e) {
	// Avoid form submissions;  but ignore when it's from a leaflet event; which smells weird.
	if (e && e.preventDefault) {
		e.preventDefault();
	}
	
	if (jQuery('#businessType').val()) {
		var postdata = {
			'url': 'http://api.sandbox.yellowapi.com/FindBusiness/',
			'pg': '1',
			'what': jQuery('#businessType').val(),
			'where': 'cZ' + map.getCenter().lng + ',' + map.getCenter().lat,
			'pgLen': '10',
			'lang': 'en',
			'fmt': 'json',
			'apikey': yellowApiKey,
			'UID': 'Bloop!'
		}
		jQuery.ajax({
			'url': '/Bloop/proxy.php',
			'data': postdata,
			'success': function(data) {
				jQuery.each(data.listings, function (i, listing) {
					if (!places[listing.id]) {
						map.addLayer(new L.Circle(new L.LatLng(listing.geoCode.latitude, listing.geoCode.longitude), 30, {
	'color': '#f00', 'fillColor': '#f00'}));
						places[listing.id] = true;
					}
				});
			},
			'type': 'post',
			'dataType': 'json'
		});
	}	
}

function filterStops(bounds) {
	return jQuery.map(stops, function (stop) {
		if (!stop.marker && bounds.contains(new L.LatLng(stop.stop_lat, stop.stop_lon))) {
			stop.marker = true;
			return stop;
		}
		return null;
	});
}

function showStops() {
	var stops = filterStops(map.getBounds());
	jQuery.each(stops, function (i, stop) {
		map.addLayer(new L.Circle(new L.LatLng(stop.stop_lat, stop.stop_lon), 30, {'color': '#00f', 'fillColor': '#00f'}));
	});
}

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
		showStops();
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
	map.on('moveend', showStops);
	map.on('moveend', findBusinesses);
	
	getStops();
	
	jQuery('#changeLocation').click(changeNeighbourhood);
	jQuery('#changeBusinessType').click(findBusinesses);
}

jQuery(document).ready(init);