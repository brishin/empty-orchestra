'use strict';

angular.module('emptyOrchestraApp')
  .controller('MainCtrl', function ($scope, angularFire, $q) {
    $scope.sessions = {};
    $scope.newSession = {
      "name": ""
    };
    $scope.viewMode = "";
    var fireBaseSessions = 
      new Firebase("https://empty-orchestra.firebaseio.com/sessions");
    angularFire(fireBaseSessions, $scope, "sessions");
    
    $scope.incrementCurrent = function() {
      var d = $q.defer();
      fireBaseSessions.child('current').on('value', function(snapshot) {
        var current = snapshot.val();     // last created session
        if (!current) current = 0;
        current++;
        console.log(current);
        fireBaseSessions.child('current').set(current);
        d.resolve(current);
      });
      return d.promise;
    };

    $scope.createSession = function() {
      $scope.incrementCurrent().then(function(current) {
        console.log(current);
      });
    };

  });
