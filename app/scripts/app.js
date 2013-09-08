'use strict';

angular.module('emptyOrchestraApp', ['firebase', 'ngProgress'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/presenter/:sessionID', {
        templateUrl: 'views/presenterSession.html',
        controller: 'PresenterCtrl'
      })
      .when('/observer/:sessionID', {
        templateUrl: 'views/observerSession.html',
        controller: 'ObserverCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
