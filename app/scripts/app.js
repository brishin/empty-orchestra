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
      .when('/observer/:sessionID', {
        templateUrl: 'views/observer-session.html',
        controller: 'ObserverCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
