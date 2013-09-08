angular.module('emptyOrchestraApp')
  .factory('observerSession', function() {
    return {
      observe: function() {
        return 'Hello World!';
      }
    };
  });