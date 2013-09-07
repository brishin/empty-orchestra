angular.module('emptyOrchestraApp')
.filter('notEmpty', function(){
  return function(input) {
    var output = [];
    for (var i = 0; i < input.length; i++) {
      if (input[i]) {
        output.push(input[i]);
      }
    }
    return output;
  }
});