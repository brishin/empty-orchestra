'use strict';

angular.module('emptyOrchestraApp')
  .controller('MainCtrl', function ($scope, $q, $location, progressbar) {
    $scope.sessions = {};
    $scope.newSession = {
      "name": ""
    };
    $scope.viewMode = "";
    var fireBaseSessions = 
      new Firebase("https://empty-orchestra.firebaseio.com/sessions");
    
    var startProgressBar = function () {
      progressbar.color('#B5FDFF');
      progressbar.height('5px');
      progressbar.start();
    };
    
    $scope.incrementCurrent = function() {
      var d = $q.defer();
      fireBaseSessions.child('current').once('value', function(snapshot) {
        var current = snapshot.val();     // last created session
        if (!current) current = 0;
        current++;
        console.log(current);
        fireBaseSessions.child('current').set(current, function(error) {
          if (error) d.reject(error);
          else {
            d.resolve(current);
            $scope.$apply();
          }
        });
      });
      return d.promise;
    };

    $scope.createSession = function() {
      console.log("Create Sessions Called");
      var promise = $scope.incrementCurrent().then(function(current) {
        // Create session and open presenter view
        console.log("Got valid session id, now creating.");
        startProgressBar();
        fireBaseSessions.child(current).set($scope.newSession, function(error) {
          console.log("Got response");
          if (error) alert("Failed to create session.");
          else {            
            $location.path('/presenter/' + current);
            $scope.$apply();
          }
        });
      }, function(reason) {
        console.log(reason);
      }, function(update) {
        console.log(update);
      });
    };

  });
