//google map variables
var map;
var directionsDisplay;
var directionsService;

//spotify variables
var offset = 0;
var data;
var baseUrl = 'https://api.spotify.com/v1/search?limit=50&type=track&query=';
var redirect_uri = "https://students.washington.edu/biega/info343/Spoogle/";

//angular application
var app = angular.module('app', ['spotify']);

app.config(function (SpotifyProvider) {
	SpotifyProvider.setClientId('700f2cbb304e42b3afef2380f3308c6a');
	SpotifyProvider.setRedirectUri('https://students.washington.edu/biega/info343/Spoogle/callback.html');
	SpotifyProvider.setScope('user-read-private playlist-read-private playlist-modify-private playlist-modify-public');
});

//set up angular controller
app.controller('controller', function($scope, $http, Spotify) {
	var term;
	var termIndex = 0;
	var auth;
	$scope.playlistLength = 0;
	$scope.tripLength = 0;
	$scope.tracks = [];
	$scope.username = "";

	$scope.login = function() {
		Spotify.login().then(function(data) {
			console.log(data);
			auth = data;
			$.ajax({
			        url: 'https://api.spotify.com/v1/me',
			        beforeSend: function(xhr) {
			             xhr.setRequestHeader("Authorization", "Bearer " + auth)
			        }, success: function(data){
			            console.log(data);
			            //process the JSON data etc
			        }
			})
		});
	}

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
	    $http.get(baseUrl + $scope.terms[termIndex] + "&offset=" + offset).success(function(response){
	    	var hasSongs = true;
	    	//are theres any songs in the response
	    	if (response.tracks.items.length == 0 ) {
	    		hasSongs = false;
	    	}
	    	//if playlist is shorter than trip and we are still in the array and it has songs
	    	for (var i = 0; ($scope.playlistLength < $scope.tripLength) && i < response.tracks.items.length && hasSongs; i++) {
	    		var notAdded = true;
	    		//check if song name already exists
	    		for (var j = 0; j < $scope.tracks.length; j++) {
	    			if ($scope.tracks[j].name == response.tracks.items[i].name) {
	    				notAdded = false;
	    			}
	    		}
	    		//if it is not in the playlist already, add it
	    		if (notAdded) {
	    			$scope.tracks.push(response.tracks.items[i]);
	    			$scope.playlistLength += response.tracks.items[i]["duration_ms"] / 1000;
	    		}
	    	}
	    	//once we are done with the page check if we need to go to the next page
	    	if ($scope.playlistLength < $scope.tripLength) {
	    		if(hasSongs) {
	    			offset += 50;
	    			$scope.getSongs();
	    		} else if(termIndex < $scope.terms.length - 1) {
	    			termIndex++;
	    			offset += 50;
	    			$scope.getSongs();
	    		} else {
	    			alert('Out of songs :( Try adding more terms to the search terms field');
	    		}
			}
		});
	}

	//add songs to the page
	$scope.addSongs = function() {
		termIndex = 0;
		$scope.terms = $scope.searchTerms.split(/\s+/);
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
