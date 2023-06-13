// Forum

var dcopApp = angular.module('dcopApp', [ 'ngRoute','dcopControllers', 'dcopServices','textAngular'])
    .config(function($provide){
         // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', '$modal', function(taRegisterTool, taOptions, $modal) { // $delegate is the taOptions we are decorating
            taRegisterTool('uploadImage', {
                iconclass: "fa fa-image",
                action: function() {
                	imageLink = $modal.open({
                		controller: 'UploadImageModalInstance',
                		templateUrl: '/partials/imageupload.html',
                	}).result.then(
                		function(result){
                			document.execCommand('insertImage', true, result);
                    		return result;
                		}, function(){
                		}
                    );
                }
            });
            taOptions.toolbar[1].push('uploadImage');
            return taOptions;
        }]);
    });

dcopApp.config([ '$routeProvider', function($routeProvider) {
	// $httpProvider.defaults.cache = false;
 //    if (!$httpProvider.defaults.headers.get) {
 //      $httpProvider.defaults.headers.get = {};
 //    }
 //    // disable IE ajax request caching
 //    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    
	$routeProvider
	.when('/topic', {
		templateUrl : '/partials/topic.html',
		controller : 'topicController'
	})
	.when('/topicview/:id', {
		templateUrl : '/partials/topic_view.html',
		controller : 'topicViewController'
	})
	.when('/', {
		templateUrl : '/partials/blank.html',
		controller : 'blankController'
	})
	.otherwise({
		redirectTo : '/'
	});
} ]);


// Node / Get Ideas
var dcopNodeApp = angular.module('dcopNodeApp', [ 'ngRoute','dcopNodeControllers', 'dcopServices','textAngular'])
	.config(function($provide){
         // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', '$modal', function(taRegisterTool, taOptions, $modal) { // $delegate is the taOptions we are decorating
            taRegisterTool('uploadImage', {
                iconclass: "fa fa-image",
                action: function() {
                	imageLink = $modal.open({
                		controller: 'UploadImageModalInstance',
                		templateUrl: '/partials/imageupload.html',
                	}).result.then(
                		function(result){
                			document.execCommand('insertImage', true, result);
                    		return result;
                		}, function(){
                		}
                    );
                }
            });
            taOptions.toolbar[1].push('uploadImage');
            return taOptions;
        }]);
    });

dcopNodeApp.config([ '$routeProvider', function($routeProvider) {

	$routeProvider
	.when('/node', {
		templateUrl : '/partials/node.html',
		controller : 'nodeController'
	})
    .when('/node/:id', {
        templateUrl : '/partials/node.html',
        controller : 'nodeController'
    })
    .when('/create', {
        templateUrl : '/partials/node_create.html',
        controller : 'nodeCreateController'
    })
	.when('/', {
		templateUrl : '/partials/blank.html',
		controller : 'blankController'
	})
	.otherwise({
		redirectTo : '/'
	});
} ]);

// Teaching Plan
var dcopTPApp = angular.module('dcopTPApp', [ 'ngRoute','dcopTPControllers', 'dcopServices','textAngular'])
    .config(function($provide){
         // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', '$modal', function(taRegisterTool, taOptions, $modal) { // $delegate is the taOptions we are decorating
            taRegisterTool('uploadImage', {
                iconclass: "fa fa-image",
                action: function() {
                    imageLink = $modal.open({
                        controller: 'UploadImageModalInstance',
                        templateUrl: '/partials/imageupload.html',
                    }).result.then(
                        function(result){
                            document.execCommand('insertImage', true, result);
                            return result;
                        }, function(){
                        }
                    );
                }
            });
            taOptions.toolbar[1].push('uploadImage');
            return taOptions;
        }]);
    });

dcopTPApp.config([ '$routeProvider', function($routeProvider) {

	$routeProvider
	.when('/teachingplan', {
		templateUrl : '/partials/teachingplan.html',
		controller : 'teachingplanController'
	})
	.when('/', {
		templateUrl : '/partials/blank.html',
		controller : 'blankController'
	})
    .when('/create',{
        templateUrl : '/partials/teachingplan_create.html',
        controller : 'teachingplanCreateController'
    })
    .when('/view/:id',{
        templateUrl : '/partials/teachingplan_view.html',
        controller : 'teachingplanViewEditController'
    })
	.otherwise({
		redirectTo : '/'
	});
} ]);

// Timesheet
var dcopTSApp = angular.module('dcopTSApp', [ 'ngRoute','dcopTSControllers', 'dcopServices','textAngular']);

dcopTSApp.config([ '$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/timesheet', {
        templateUrl : '/partials/timesheet.html',
        controller : 'timesheetController'
    })
    .when('/', {
        templateUrl : '/partials/blank.html',
        controller : 'blankController'
    })
    .otherwise({
        redirectTo : '/'
    });
} ]);


// Discussion board
var dcopDiscussionApp = angular.module('dcopDiscussionApp', [ 'ngRoute','dcopDiscussionControllers', 'dcopServices','textAngular']);

dcopDiscussionApp.config([ '$routeProvider', function($routeProvider) {

    $routeProvider
    .when('/discussion', {
        templateUrl : '/partials/discussion.html',
        controller : 'discussionController'
    })
    .when('/discussionview/:id', {
        templateUrl : '/partials/discussion_view.html',
        controller : 'discussionViewController'
    })
    .when('/', {
        templateUrl : '/partials/blank.html',
        controller : 'blankController'
    })
    .otherwise({
        redirectTo : '/'
    });
} ]);