// Dependencies
angular.module('myApp', [
  'ngRoute',
  'myApp.top'
])

  .config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('!');
    // $locationProvider.html5Mode(true);
  }])

  // Routes
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/:yyyymmdd?', {
        templateUrl: 'top/index.html',
        controller: 'topCtrl as main'
      })
  }]);
