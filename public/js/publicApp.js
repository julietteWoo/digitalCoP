// This is for public acess page use

var dcopPublicApp = angular.module('dcopPublicApp', [ 'ngRoute','dcopPublicControllers', 'dcopPublicServices','textAngular']);

dcopPublicApp.config([ '$routeProvider', function($routeProvider) {

	$routeProvider
	.when('/', {
		templateUrl : '/partials/public_node.html',
		controller : 'nodePublicController'
	})
	.otherwise({
		redirectTo : '/'
	});
} ]);