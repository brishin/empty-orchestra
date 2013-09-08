'use strict';

var app = angular.module('emptyOrchestraApp');

app.controller('PresenterCtrl', function ($scope, $q, $routeParams) {
  $scope.sessionID = $routeParams.sessionID;
});
               
app.controller('ObserverCtrl', function ($scope, $q, $routeParams) {
  $scope.sessionID = $routeParams.sessionID;
});
