$(function() {
	
});

var map;
var directionsDisplay;
var directionsService;

var initMap = function() {
	directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer();
	map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 39.8833, lng: -98.0167},
	    zoom: 4
	});
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('directionsPanel'));
}

var app = angular.module('app', []);

app.controller('controller', function($scope) {
	$scope.directions = null;
	$scope.calcRoute = function() {
		var start = $scope.startPos;
	  	var end = $scope.endPos;
	  	var request = {
			origin:start,
			destination:end,
			travelMode: google.maps.TravelMode.DRIVING
	  	};

	  	directionsService.route(request, function(result, status) {
	    	if (status == google.maps.DirectionsStatus.OK) {
	    		directionsDisplay.setDirections(result);
	    		$scope.directions = result;
	    		console.log(result);
	    	} else if (status == google.maps.DirectionsStatus.ZERO_RESULTS){
	    		alert("Oops, sorry! Looks like google doesn't know how to get between those places.");
	    	} else if(status == google.maps.DirectionsStatus.NOT_FOUND) {
	    		alert("Oops, Sorry! Google does not know where to find one of those places.")
	    	}
	  	});
	}
});
