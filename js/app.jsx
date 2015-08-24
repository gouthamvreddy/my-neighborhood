var map = L.map('map').setView([47.609, -122.332099], 12);
var seattleNeighborhoods = require('../data/geojson_cleanedup.js');
var request = require('superagent');
var parseString = require('xml2js').parseString;
var util = require('util');
var ZID = require('../config.js').ZID;


// load a tile layer
var baseMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mobot11.1dba3612',
	accessToken: 'pk.eyJ1IjoidGFtdWxlbW9uIiwiYSI6IjNjODI3YjAxZjBjMTk2ZTg0ZDkzYzQ2ZGU2NTEyMjYzIn0.OlnNvl6bANwLeMXFWP09CQ'
}).addTo(map);

var baseMaps = {
	"Basemap": baseMap
};


function getColor(m) {
	m = parseInt(m);
	if(m > 1000000) return '#800026';
	else if(m > 6000000)  return '#BD0026';
	else if(m > 500000)  return '#E31A1C';
	else if(m > 400000)  return '#FC4E2A';
	else if(m > 300000)  return '#FD8D3C';
	else if(m > 200000)  return '#FEB24C';
	else if(m > 100000)  return '#FED976';
	else if(m > 0)  return '#FFEDA0';
	else return 'grey';
}

function Style(neighborhood) {
	return {
		fillColor : getColor(neighborhood.median),
		fillOpacity: 0.5,
		clickable: true,
		weight: 2,
		opacity: 1,
		color: 'grey',
		dashArray: '3'
	};
}

var geojson = seattleNeighborhoods.map(function(neighborhood) {
	L.geoJson(neighborhood, {
		style: Style(neighborhood)
	}).addTo(map);
});

function highlightFeature(e) {
	var layer = e.target;
	layer.setStyle({
		weight: 3,
		color: '#fff',
		dashArray: '',
		fillOpacity: 0.7
	});
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
}

function resetHighlight(e) {
	geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
  var name = e.target.feature.geometry.name;
  var zillowName = name.replace(/\s+/g, '');
  console.log(name);
  var url = 'http://www.zillow.com/webservice/GetDemographics.htm?zws-id=' + ZID + '&state=WA&city=Seattle&neighborhood=' + name;
  request
  .get(url)
  .end(function(err, res) {
    if(err) {
      console.log(err);
    }
   parseString(res.text, function (err, data) {
      console.log(util.inspect(data, false, null));
    });
  });
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature // need to add http call here
	});
}

geojson = L.geoJson(seattleNeighborhoods, {
	style: Style,
	onEachFeature: onEachFeature
}).addTo(map);
