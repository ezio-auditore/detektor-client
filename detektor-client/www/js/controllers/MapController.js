/**
 * Created by tonyStark on 12/9/2016.
 */

app.controller('MapController', function($scope,$ionicPlatform, $cordovaGeolocation,$ionicLoading,$http) {
  $ionicPlatform.ready(function(){
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        var lat  = position.coords.latitude
        var long = position.coords.longitude
        console.log("lat:%s ,lng:%s",lat,long);
      }, function(err) {
        // error
      });
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
    });
    var posOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      var lat  = position.coords.latitude;
      var long = position.coords.longitude;
      $scope.startLocation = {'lat':lat,
                                'long': long
      }
      var myLatlng = new google.maps.LatLng(lat, long);

      var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      $scope.map = map;
      $ionicLoading.hide();
      /*var input = $scope.search;*/
      var input = document.getElementById('pac-input');
      var autocomplete = new google.maps.places.Autocomplete(input);

      autocomplete.bindTo('bounds', map);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      var infowindow = new google.maps.InfoWindow();

      var marker = new google.maps.Marker({
        map: map
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
      });
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        infowindow.close();
        $scope.targetLocation = autocomplete.getPlace();
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          return;
        }
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
// Set the position of the marker using the place ID and location.
        marker.setPlace( /** @type {!google.maps.Place} */ ({
          placeId: place.place_id,
          location: place.geometry.location
        }));
        marker.setVisible(true);
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
        'Place ID: ' + place.place_id + '<br>' +
        place.formatted_address + '</div>');
        infowindow.open(map, marker);
      });
        $scope.engageDetektor = function(){
          console.log("target : "+$scope.targetLocation.place_id);
          $http.get('https://deketor-server-kaustav-m.c9users.io/api/getFullLocation',{params: {startLocation: $scope.startLocation,endLocation:$scope.targetLocation.place_id}})
            .success(function (data, status, headers, config) {
              console.log(data);
              $scope.Details = data;
            })
        }
      google.maps.event.addListenerOnce($scope.map, 'idle', function(){

        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: myLatlng
        });

      });
    }, function(err) {
      $ionicLoading.hide();
      console.log(err);
    });
  });
});
