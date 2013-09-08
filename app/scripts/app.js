'use strict';

angular.module('emptyOrchestraApp', ['firebase', 'ngProgress'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/presenter/:sessionID', {
        templateUrl: 'views/presenter-session.html',
        controller: 'PresenterCtrl'
      })
      .when('/audience/:sessionID', {
        templateUrl: 'views/observer-session.html',
        controller: 'ObserverCtrl'
      })
      .when('/notSupported', {
        templateUrl: 'views/not-supported.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function(routeWatcher, $location){
    var rtcSupported = Boolean(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );
    routeWatcher.watch(function(event, current, previous){
      if (!rtcSupported) {
        console.log('Browser not supported.');
        $location.path('/notSupported');
      }
    });
  });
