'use strict';

angular.module('emptyOrchestraApp')
  .controller('MainCtrl', function ($scope, angularFire) {
    $scope.rooms = [];
    var fireBase = new Firebase("https://empty-orchestra.firebaseio.com/rooms");
    angularFire(fireBase, $scope, "rooms");

    $scope.addRoom = function () {
      $scope.rooms.push({name: $scope.newRoomName});
    }

  });
