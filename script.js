// Note: Currently, Weather Underground limits free tier API calls to 500 per day. Set your timeout rates carefully and avoid opening multiple clients at once to avoid hitting your daily limit. Dark Sky's limits free API calls to 10,000 per day, so you're less apt to hit a wall there. More helpful timeout settings to come in future commits.
// Note: You may experience occasional download issues for the Weather Underground radar maps. You may refresh manually or simply wait for another setTimeout() cycle to attempt another download.
// Note: My first commit is intended to provide a working demo that should be easily understood and tweakable by intermediate developers. In future commits, I plan to implement a more robust platform with exposed settings and perhaps even some GUI's for more novice users.

var wu_key = ''; // Weather Underground API Key from http://www.wunderground.com/weather/api/ ** DO NOT SHARE PUBLICLY ** 
var ds_key = ''; // Dark Sky API Key from http://developer.darkskyapp.com ** DO NOT SHARE PUBLICLY **

// Enter the latitude and longitude of the location you'd like to track the weather for. If you don't have them handy, you can use Google Maps to find the coordinates for a specific location: http://support.google.com/maps/bin/answer.py?hl=en&answer=18539
var latitude = '40.347182';
var longitude = '-74.787873';


// Check current time to see if it falls within a window when we want our data to refresh more frequently than during the "inactive" time window. Default is "active" time window of 5am - 6pm.
function checkActiveState() {

	var now = $.now();
	
	var startActive = new Date($.now());
	startActive.setHours(5);
	startActive.setMinutes(0);
	startActive.setSeconds(0);

	var finishActive = new Date($.now());
	finishActive.setHours(18);
	finishActive.setMinutes(0);
	finishActive.setSeconds(0);

	return ((now >= startActive.getTime()) && (now <= finishActive.getTime())) ? true : false;
}

// Next three functions are helpers for pre-processing data before putting into Handlebars templates
Handlebars.registerHelper('hourly', function(items, options) {
	var out = "";
	for (var i = 0; i < 10; i++) out = out + options.fn(items[i]);
	return out;
});

Handlebars.registerHelper('capitalize', function(context) {
	return context.replace(/\w\S*/, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
});

Handlebars.registerHelper('round', function(context) {
	return Math.round(context);
});

// "Next Hour" chart adapted from https://github.com/darkskyapp/darkskyweb
var canvas = document.getElementById ("canvas"),
    ctx = canvas.getContext ("2d")

function redraw (loc) {
var data = loc.data,
    a = (15 - 2) / (60 - 2),
    b = (30 - 2) / (60 - 2),
    c = (45 - 2) / (60 - 2),
    i

a = 1 - a * a
b = 1 - b * b
c = 1 - c * c

ctx.fillStyle = "white"
ctx.fillRect (0, 0, canvas.width, canvas.height)

ctx.fillStyle = "#cff"
for (i = 61; i--; )
  ctx.fillRect (Math.round (i * (canvas.width - 1) / 60), 0, 1, canvas.height)

ctx.fillStyle = "#9cc"
ctx.fillRect (0, canvas.height - 1, canvas.width, 1)
ctx.fillRect (0, Math.round (a * (canvas.height - 1)), canvas.width, 1)
ctx.fillRect (0, Math.round (b * (canvas.height - 1)), canvas.width, 1)
ctx.fillRect (0, Math.round (c * (canvas.height - 1)), canvas.width, 1)
ctx.fillRect (0, 0, canvas.width, 1)

for (i = 13; i--; )
  ctx.fillRect (Math.round (i * (canvas.width - 1) / 12), 0, 1, canvas.height)

ctx.fillStyle = "rgba(0,0,0,0.25)"
ctx.beginPath ()
ctx.moveTo (0, canvas.height * (1 - data[0].min))

for (i = 1; i !== data.length; ++i)
  ctx.lineTo (
    i * canvas.width / (data.length - 1),
    canvas.height * (1 - data[i].min)
  )

for (i = data.length; i--; )
  ctx.lineTo (
    i * canvas.width / (data.length - 1),
    canvas.height * (1 - data[i].max)
  )

ctx.fill ()

ctx.fillStyle = "black"
ctx.lineWidth = 2

ctx.beginPath ()
ctx.moveTo (0, canvas.height * (1 - data[0].mid))
for (i = 0; i !== data.length; ++i)
  ctx.lineTo (
    i * canvas.width / (data.length - 1),
    canvas.height * (1 - data[i].mid)
  )
ctx.stroke ()
} // redraw()
   
function clamp (x) {
	if (x < 0) return 0
	if (x > 1) return 1
	return x * x
}   

$(function(){

var darkSkyTemplate = Handlebars.compile($("#darksky-template").html());
var currentTemplate = Handlebars.compile($("#current-template").html());
var forecastTemplate = Handlebars.compile($("#forecast-template").html());
var hourlyTemplate = Handlebars.compile($("#hourly-template").html());
var img = document.createElement('img');
var img2 = document.createElement('img');


// Fill loading data into "Now" panel
$('#current').html(currentTemplate({"current_observation":{'temp_f': '0', 'relative_humidity': '...', 'wind_mph': '...', 'wind_dir': '...' }}));

// Fill and set schedule for next update of radar images
var updateRadar = function () {
	var that = this;
	d = new Date();
    img.src = "http://api.wunderground.com/api/" + wu_key + "/animatedradar/image.gif?centerlat=" + latitude + "&centerlon=" + longitude + "&newmaps=1&timelabel=1&timelabel.y=795&timelabel.x=475&delay=15&num=15&width=633&height=800&rainsnow=1&smooth=1&radius=100&avoidcache=" + d.getTime();
	img2.src = "http://api.wunderground.com/api/" + wu_key + "/animatedradar/image.gif?centerlat=" + latitude + "&centerlon=" + longitude + "&newmaps=1&timelabel=1&timelabel.y=795&timelabel.x=475&delay=15&num=15&width=633&height=800&rainsnow=1&smooth=1&radius=300&avoidcache=" + d.getTime();
	$(img).load(function(){
            $("#loader").hide();
            $("#radar").attr("src", img.src);
    });
	$(img2).load(function(){
            $("#radar2").attr("src", img2.src);
    });
	
setTimeout(arguments.callee, (checkActiveState() ? 120000 : 1200000));
}( ); // updateRadar()

// Fill and update non-image based data from Weather Underground 
var updateWeather = function () {	
	var that = this;
	$.ajax({ url : "http://api.wunderground.com/api/" + wu_key + "/geolookup/conditions/forecast/hourly/q/" + latitude + "," + longitude + ".json", dataType : "jsonp", success : function(parsed_json) {
		$('#current').html(currentTemplate(parsed_json));
		$('#forecast').html(forecastTemplate(parsed_json));
		$('#hourly').html(hourlyTemplate(parsed_json));
	} });
	setTimeout(arguments.callee, (checkActiveState() ? 600000: 1200000));
}( ); // updateWeather()

// Fill and update Dark Sky data visualizations
var updateDarkSky = function () {
	$.ajax({ url : "https://api.darkskyapp.com/v1/forecast/" + ds_key + "/" + latitude + "," + longitude, dataType : "jsonp", success : function(parsed_json) {

		// Update text forecast
		var html = darkSkyTemplate(parsed_json);
		$('#darkSky').html(html);

	    // Update precipitation probability graph
	    var forecast = parsed_json;
	    var data = forecast.hourPrecipitation,
	        i = data.length,
	        k, e

	    while (i--) {
	      k = (data[i].probability * data[i].intensity - 2) / (60 - 2)
	      e = data[i].error / 150
	      data[i] = {min: clamp (k - e), mid: clamp (k), max: clamp (k + e)}
	    }

	    redraw ({current: forecast.currentSummary, forecast: forecast.hourSummary, data: data})

	} });
	setTimeout(arguments.callee, 30000); // Dark Sky allows for 10,000 API calls per day, so the cost/benefit is cheaper. Will implement checkActiveState() later nonetheless.
}( );

// Rotate radar images + forecast / hourly data in bottom-right panel
setInterval(function() {
	if ($('#radar').is(':visible')) {
		$('#radar').fadeOut("fast", function() {
			$('#radar2').fadeIn("fast");
		});
	} else {
		$('#radar2').fadeOut("fast", function() {
			$('#radar').fadeIn("fast");
		});
	}
	if ($('#forecast').is(':visible')) {
		$('#forecast').fadeToggle("slow", function() {
			$('#hourly').fadeToggle();
		});
	} else {
		$('#hourly').fadeToggle("slow", function() {
			$('#forecast').fadeToggle();
		});
	}
}, 15000);

}); // jQuery