// public/js/controllers/mainCtrl.js
var dcopTSControllers = angular.module('dcopTSControllers', ['ui.bootstrap']);


function isSessionAlive(currID) {
    var link = window.location.href;
    var base_link = link.substring(0, link.indexOf("/timesheet#/"));
    if(currID == undefined) {
         window.location = base_link + "/"
    } else return true;
};

dcopTSControllers.controller('blankController', ['$scope','CurrentUser',
    function($scope, CurrentUser) {
    }
]);

dcopTSControllers.controller('timesheetController', ['$scope','$location', 'CurrentUser', 'Timesheet',
    function($scope, $location, CurrentUser, Timesheet) {
        
        // loading variable to show the spinning loading icon
        $scope.loading = true;
        $scope.user = null;

        // Check Active Session and get topic list
        CurrentUser.get()
            .success(function(currentDetail) {
                if(isSessionAlive(currentDetail)) {
                    $scope.user = currentDetail;
                    //get timesheet
                    // Timesheet.get()
                    // .success(function(data) {

                        
                    //     $scope.loading = false;
                    // })
                    // .error(function(e) {
                    //     console.log(e);
                    //     alert("Couldn't load teaching plan list. Please contact admin.");
                    // });
                }
            })
            .error(function(e){
                console.log(e);
            });
    }
]);