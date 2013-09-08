angular.module('emptyOrchestraApp')
.service('routeWatcher', function($rootScope) {
  this.watch = function(callback) {
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous){
      console.log(current);
      if (callback) callback(event, current, previous);
    });
  };
});