var yellowApiKey = 'exbpfptg75sv33yfyyjhtsb4'; // Sandbox key.  Not useful.
var stops = [];
var places = {};
var map;
var midiBridge;

var busHue = 0.75;
var businessHue = 0;

var minNote = 60;
var maxNote = 120;

function getNote(pixel) {
	var height = jQuery(window).height(),
		range = maxNote - minNote,
		pixelsPerNote = height / range,
		note = pixel / pixelsPerNote;
		
	return maxNote - Math.floor(note);
}

function bloop() {
	var bounds = map.getBounds();

	var filtered = jQuery.map(map._layers, function(layer) {
		if (layer._tiles) {
			// ignore base layers.
		} else {
			if (bounds.contains(layer.getLatLng())) {
				return layer;
			}
		}
	});

	var orderPoints = function (a, b) {
		return a.getLatLng().lng - b.getLatLng().lng;
	}
	
	filtered = filtered.sort(orderPoints);

	function blip(i) {
		if (i < filtered.length) {
			if (i > 0) {
				filtered[i - 1].setStyle(filtered[i - 1].oldOptions);
			}
			var marker = filtered[i],
				point = map.latLngToContainerPoint(marker.getLatLng());
			
			marker.oldOptions = marker.options;
			marker.setStyle({
				'color': '#666', 
				'fillColor': '#666',
				'fillOpacity' : 1
			});
			
			playNote(getNote(point.y));
			i++;
			setTimeout(function () { blip(i); }, 100);
		}
	}
	
	setTimeout(function () {blip(0);}, 100);
}

function playNote(note, channel) {
	if (!channel) channel = 1;
	// status / channel / data1 / data2
	midiBridge.sendMidiEvent(midiBridge.NOTE_ON,channel,note,100);
}

function markerHue(hue) {
	return markerStyle(jQuery.Color([ hue, 0.8, 0.8], 'HSV').toHEX());
}

function markerStyle(colour) {
	return {
		'color': colour,
		'fillColor': colour,
		'weight': 2
	}
}

function changeBusinessTypeColour() {
	businessHue += 0.1;	
	if (businessHue >= 1) {
		businessHue = 0;
	}
}

function findBusinesses(e) {
	// Avoid form submissions;  but ignore when it's from a leaflet event; which smells weird.
	if (e && e.preventDefault) {
		e.preventDefault();
	}

	var style = markerHue(businessHue);
	style.opacity = 0.85;
	
	if (jQuery('#businessType').val()) {
		var postdata = {
			'url': 'http://api.sandbox.yellowapi.com/FindBusiness/',
			'pg': '1',
			'what': jQuery('#businessType').val(),
			'where': 'cZ' + map.getCenter().lng + ',' + map.getCenter().lat,
			'pgLen': '20',
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
						var marker = new L.Circle(new L.LatLng(listing.geoCode.latitude, listing.geoCode.longitude), 45, style)
						marker.on('click', function () {
							alert(listing.name);
						});
						map.addLayer(marker);
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
	var style = markerStyle(busHue),
		stops = filterStops(map.getBounds());
	jQuery.each(stops, function (i, stop) {
		var style = markerStyle(stop.colour),
			marker = new L.Circle(new L.LatLng(stop.stop_lat, stop.stop_lon), 30, style);
			
		marker.on('click', function () {
			alert(stop.stop_name);
		});
		map.addLayer(marker);

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

function getStops(dataUrl, colour) {
	jQuery.get(dataUrl, function (json) {
		jQuery.each(json, function (i, busStop) {
			busStop.colour = colour;
			stops.push(busStop);
		});
		showStops();
	}, 'json');
}

// Custom tile layer that just shows white as a background.
L.BlankTileLayer = L.TileLayer.extend({
    initialize: function(name) {
        var url = '/Bloop/blank.png';
        L.TileLayer.prototype.initialize.call(this, url, {});
    }
});


function init() {
	// replace "toner" here with "terrain" or "watercolor"
	var layer = new L.StamenTileLayer("watercolor");
	var toner = new L.StamenTileLayer("toner");
	var blank = new L.BlankTileLayer();
	
	map = new L.Map("map", {
	    center: new L.LatLng(45.5081, -73.5550),
	    zoom: 15
	});

	map.addLayer(layer);
	map.addLayer(toner);
	
	var layersControl = new L.Control.Layers({'Painted': layer, 'Minimalistic': toner, 'Just Points': blank});

	map.addControl(layersControl);
		
	map.on('moveend', showStops);
	map.on('moveend', findBusinesses);
	
	midiBridge.init(function(midiEvent) {
	}, {'javaDir': '/Bloop/java/'});
	
	getStops('data/stops.js', '#f00');
	getStops('data/stl/stops.js', '#00f');
	
	jQuery('#bloop').click(bloop);
	jQuery('#changeLocation').click(changeNeighbourhood);
	jQuery('#changeBusinessType').click(findBusinesses);
	jQuery('#businessType').change(changeBusinessTypeColour);
}

jQuery(document).ready(init);