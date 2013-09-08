'use strict';

var app = angular.module('emptyOrchestraApp');

app.controller('PresenterCtrl', function ($scope, $q, $routeParams, progressbar) {
  progressbar.complete();
  $scope.sessionID = $routeParams.sessionID;
});
               
app.controller('ObserverCtrl', function ($scope, $q, $routeParams, progressbar, observerSessionFactory) {
  progressbar.complete();
  $scope.sessionID = $routeParams.sessionID;
  observerSessionFactory.observe();
});
