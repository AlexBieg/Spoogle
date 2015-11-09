//google map variables
var map;
var directionsDisplay;
var directionsService;

//spotify variables
var offset = 0;
var data;
var baseUrl = 'https://api.spotify.com/v1/search?limit=50&type=track&query=';

//angular application
var app = angular.module('app', []);

//set up angular controller
app.controller('controller', function($scope, $http) {
	var term;
	$scope.playlistLength = 0;
	$scope.tripLength = 0;
	$scope.tracks = [];

	//calulates route and gets the songs for it
	$scope.getPlaylist = function() {
		$scope.calcRoute();
	}

	//calulate the current route specified.
	$scope.calcRoute = function() {
	  	var request = {
			origin:$scope.startPos,
			destination:$scope.endPos,
			travelMode: google.maps.TravelMode[$scope.travelMode]
	  	};
	  	//get the route from google
	  	directionsService.route(request, function(result, status) {
	  		//check if everything returned correctly
	    	if (status == google.maps.DirectionsStatus.OK) {
	    		directionsDisplay.setDirections(result);
	    		$scope.directions = result;
	    		console.log(result);
	    		$scope.tripLength = result.routes[0].legs[0].duration.value;
	    		//add songs after trip has been calculated
	    		$scope.addSongs();
	    	} else if (status == google.maps.DirectionsStatus.ZERO_RESULTS){
	    		alert("Oops, sorry! Looks like google doesn't know how to get between those places.");
	    	} else if(status == google.maps.DirectionsStatus.NOT_FOUND) {
	    		alert("Oops, Sorry! Google does not know where to find one of those places.")
	    	}
	  	});
	}

	//get the songs based off of the search terms from spotify
	$scope.getSongs = function() {
	    $http.get(baseUrl + "love&offset=" + offset).success(function(response){
	    	//if playlist is shorter than trip and we are still in the array
	    	for (var i = 0; ($scope.playlistLength < $scope.tripLength) && i < response.tracks.items.length; i++) {
	    		var notAdded = true;
	    		for (var j = 0; j < $scope.tracks.length; j++) {
	    			if ($scope.tracks[j].name == response.tracks.items[i].name) {
	    				notAdded = false;
	    			}
	    		}
	    		if (notAdded) {
	    			$scope.tracks.push(response.tracks.items[i]);
	    			$scope.playlistLength += response.tracks.items[i]["duration_ms"] / 1000;
	    		}
	    	}
	    	if ($scope.playlistLength < $scope.tripLength) {
				console.log(offset);
				offset += 50;
				$scope.getSongs();
			}
		});
	}

	//add songs to the page
	$scope.addSongs = function() {
		console.log('add songs')
		offset = 0;
		$scope.tracks = [];
		$scope.playlistLength = 0;
		$scope.getSongs();
	}
});

//initialize the map on screen
var initMap = function() {
	directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer();
	map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 39.8833, lng: -98.0167},//center of the usa...about
	    zoom: 4
	});
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('directionsPanel'));
}
