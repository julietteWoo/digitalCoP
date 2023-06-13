//this is for authenticated user to editing discussion
// public/js/controllers/mainCtrl.js
var dcopDiscussionControllers = angular.module('dcopDiscussionControllers', ['ui.bootstrap'])

function isSessionAlive(currID) {
    var link = window.location.href;
    //TODO other link including teachingplan and node
    var base_link = link.substring(0, link.indexOf("/forum#/"));
    if(currID == undefined) {
         window.location = base_link + "/"
    } else return true;
};

dcopDiscussionControllers.controller('blankController', ['$scope','CurrentUser','Comment',
    function($scope, CurrentUser, Comment) {
          console.log("this is a blankpage");
    }
]);

// Show topics and add topic page
dcopDiscussionControllers.controller('discussionController', ['$scope','$location','CurrentUser','Discussion', '$rootScope',
    function($scope, $location,CurrentUser, Discussion, $rootScope ) {
        // object to hold all the data for the new comment form
        $scope.newTopic = {};

        // loading variable to show the spinning loading icon
        $scope.loading = true;
        $scope.user = null;

        //flag for show and hide add window, by default is hiding
        $scope.showAddTopic = false;

        // Check Active Session and get topic list
        CurrentUser.get()
            .success(function(currentDetail) {
                if(isSessionAlive(currentDetail)) {
                    $scope.user = currentDetail;
                    //get topic list
                    Discussion.get()
                    .success(function(data) {
                        $scope.topics = data.map(item=>{
                            item.updated_at = formatTime(item.updated_at);
                            return item;
                        });

                        $scope.loading = false;
                    })
                    .error(function(e) {
                        console.log(e);
                        alert("Couldn't load discussion list. Please contact admin.");
                    });
                }
            })
            .error(function(e){
                console.log(e);
            });

        //function to direct to topic view page
        $scope.view = function(topicId) {

            // Check Active Session
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {

                        //get to the topic view page
                        $location.path('/discussionview/' + topicId);
                    }
            });
        };
    }
]);

// get the topic view page and show the comment list
dcopDiscussionControllers.controller('discussionViewController', ['$scope','$routeParams','$sce','CurrentUser','Discussion','Comment', 'taApplyCustomRenderers',
    function($scope, $routeParams, $sce, CurrentUser, Discussion, Comment, taApplyCustomRenderers) {
        // object to hold all the data for the comment
        $scope.newComment = {};
        //object to hold the current topic
        $scope.currentTopic = {};
        taApplyCustomRenderers();
        // loading variable to show the spinning loading icon
        $scope.loading = true;

        /*
            page function controller
        */
        //for editing comment
        $scope.editComment = false;
        $scope.viewComment = true;
        $scope.editTopic = false;
        $scope.editingComment = null;

        //for editing topic
        $scope.editTopic = false;
        $scope.editingTopic = {};

        //comment style for height adjustment;
        $scope.commentWindowheight =  "500px";

        /*
            initialize current user session and topic with comment list
        */
        //get current User id
        CurrentUser.get()
                .success(function(currentDetail) {
                    $scope.currentUser = currentDetail;
                });

        //get Topic and comment list
        CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        Discussion.view({id: $routeParams.id})
                            .success(function(data){
                                $scope.currentTopic = data;

                                /*
                                    polish data
                                */
                                $scope.currentTopic.updated_at = formatTime($scope.currentTopic.updated_at); //format time
                                $scope.currentTopic.contentPolished = $sce.trustAsHtml($scope.currentTopic.content); //format richtext
                             
                                //get comment list after get the topic
                                Comment.get({id: $routeParams.id})
                                    .success(function(data) {
                                        $scope.comments = data.replies.map(item=>{
                                            //polishing data
                                            item.updated_at = formatTime(item.updated_at);
                                            item.contentPolished = $sce.trustAsHtml(item.content);

                                            return item;
                                        });

                                        $scope.loading = false;
                                    })
                                    .error(function(e){
                                        console.log(e);
                                        alert("The server has got some issue to get the comment list, please contact admin");
                                    });
                            });
                    }
                });

        /*
            reset function
        */
        $scope.reset = function(){
            //for editing comment
            $scope.editComment = false;
            $scope.viewComment = true;
            $scope.editTopic = false;
            $scope.editingComment = null;

            //for editing topic
            $scope.editTopic = false;
            $scope.editingTopic = {};

            $scope.commentWindowheight =  "500px";
        }

        /*
            Topic editing function
        */

        //start topic editing
        $scope.editTopicFunction = function(id, content,title) {
            $scope.editTopic = true;
            $scope.editingTopic.id = id;
            $scope.editingTopic.content = content;
            $scope.editingTopic.title = title;
            $scope.commentWindowheight =  "auto";
        };

        //function for updating topic 
        $scope.updateTopic = function() {
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        if(Object.keys($scope.editingTopic).length != 0){
                            Discussion.update($scope.editingTopic)
                                .success(function(e){
                                    alert('your topic has been updated');

                                    //reset loading
                                    $scope.loading = true;

                                    //refresh topic 
                                    Discussion.view({id: $routeParams.id})
                                        .success(function(data) {
                                            $scope.currentTopic = data;

                                            /*
                                                polish data
                                            */
                                            $scope.currentTopic.updated_at = formatTime($scope.currentTopic.updated_at); //for time format
                                            $scope.currentTopic.contentPolished = $sce.trustAsHtml($scope.currentTopic.content); //for rich text


                                            $scope.loading = false;

                                            //reset flags
                                            $scope.reset();
                                    })
                                        .error(function(e) {
                                        alert("topic loading error, please contact admin")
                                        //reset flags
                                        $scope.reset();

                                    });
                                })
                                .error(function(e){
                                    alert('your topic can not been updated, please contact admin');
                                    console.log(e);
                                    //reset flags
                                    $scope.reset();
                                });
                        }
                    }
                });
        };


        /*
            Comment editiong function
        */

        //function for create a new comment
        $scope.createNewComment = function(topicId) {
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        $scope.newComment.user_id = currentDetail;
                        var valid=true;

                        //do validation
                        if(!$scope.newComment.content){ // all required
                            valid = false;
                            alert("you can not submit an empty reply");
                        }
                        $scope.newComment.topic_id = topicId;
                        $scope.newComment.public_flag = 'public';

                        //after valid do create
                        if(valid==true){
                            Comment.save( $scope.newComment)
                                .success(function(e){
                                    //set field back to null
                                    $scope.newComment.content = null;
                                    alert('your comment has been sent');

                                    //reset loading
                                    $scope.loading = true;

                                    //refresh topic list
                                    Comment.get({id: topicId})
                                        .success(function(data) {
                                            $scope.currentTopic.node_list = (data.node_list==null || data.node_list=='')? []:data.node_list.split(",");

                                            $scope.comments = data.replies.map(item=>{

                                                //polish data
                                                item.updated_at = formatTime(item.updated_at);
                                                item.contentPolished = $sce.trustAsHtml(item.content);

                                                return item;
                                            });

                                            

                                            $scope.loading = false;

                                            //reset flags
                                            $scope.reset();
                                    })
                                        .error(function(e) {
                                        alert("list loading issue, please contact admin");
                                    });

                                })
                                .error(function(e) {
                                    alert("Couldn't create new comment. Please contact admin.");
                                    console.log(e);
                                });
                        }

                    }
            });
                
        };

        //function for start editing
        $scope.editCommentFunction = function(commentId) {
            $scope.editComment = true;
            $scope.viewComment = false;
            $scope.editingComment = commentId; 
            $scope.commentWindowheight =  "auto";
        };

        //function for updating comment function
        $scope.updateComment = function(comment) {
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        if($scope.editingComment != null){
                            if(comment.contentPolished){
                                delete comment.contentPolished
                            }
                            //put publicFlag mark in the array
                            comment.public_flag = 'public';
                            Comment.update(comment)
                                .success(function(e){
                                    alert('your comment has been updated');

                                    //reset loading
                                    $scope.loading = true;

                                    //refresh comment list
                                    Comment.get({id: $routeParams.id})
                                        .success(function(data) {
                                            $scope.comments = data.replies.map(item=>{

                                                //polish data
                                                item.updated_at = formatTime(item.updated_at);
                                                item.contentPolished = $sce.trustAsHtml(item.content);

                                                return item;
                                            });

                                            $scope.loading = false;

                                            //reset flags
                                            $scope.reset();
                                    })
                                        .error(function(e) {
                                        alert("list loading issue, please contact admin")

                                        //reset flags
                                        $scope.reset();
                                    });
                                })
                                .error(function(e){
                                    alert('your comment can not been updated, please contact admin');

                                    //reset flags
                                    $scope.reset();
                                });
                        }
                    }
                });
        };

        //function for deletd comment 
        $scope.deleteCommentFunction = function(commentId) {
            var confirmation = window.confirm("Are you sure you want to delete?");
            if (confirmation) {
                CurrentUser.get()
                    .success(function(currentDetail) {
                        if(isSessionAlive(currentDetail)) {
                                Comment.destroy({id:commentId, public_flag:'public'})
                                    .success(function(e){
                                        alert('your comment has been deleted');

                                        //reset loading
                                        $scope.loading = true;

                                        //refresh topic list
                                        Comment.get({id: $routeParams.id})
                                            .success(function(data) {
                                                $scope.comments = data.replies.map(item=>{

                                                //polish data
                                                item.updated_at = formatTime(item.updated_at);
                                                item.contentPolished = $sce.trustAsHtml(item.content);

                                                return item;
                                            });
                                                $scope.loading = false;

                                                //reset flags
                                                $scope.reset();
                                        })
                                            .error(function(e) {
                                            alert("list loading issue, please contact admin")

                                            //reset flags
                                            $scope.reset();
                                        });
                                    })
                                    .error(function(e){
                                        console.log(e);
                                        alert('your comment can not been deleted, please contact admin');

                                        //reset flags
                                        $scope.reset();
                                    });
                        }
                    });
            }
        };

    }
]);

//upload image controller
dcopDiscussionControllers.controller('UploadImageModalInstance',['$scope', '$modalInstance','ImageUpload', '$rootScope',
    function($scope,$modalInstance,ImageUpload, $rootScope){
        $scope.myFile = undefined;
        $scope.progress = 0;
        $scope.imagePath = undefined;

        $scope.upload = function(imageFile){
            var file = imageFile;
            ImageUpload.uploadFileToUrl(file, function(data){
                $scope.imagePath = data;
                $scope.insert();
            });
        };

        $scope.insert = function(){
            if($scope.imagePath != undefined){
                $rootScope.$emit('UpdateContent',{url: $scope.imagePath});
            }
            $modalInstance.close($scope.imagePath);
        };

    }
]);

// file upload directive
dcopDiscussionControllers.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
// Controller for admin.scala.html
function HeaderController($scope, $location) {
    $scope.isActive = function (viewLocation) { 
        var path = $location.path();// Store path of current view
        // if(viewLocation == "/edit") {// If users select edit / add new / self service form
        //     path = "/" + path.split("/")[2];// Get user's id
        //     if (path.split("/")[3] == 0) {// If users id = 0, redirect back to /users
        //         path = "/users";
        //     }
        // }
        return true;
    };
}

//time format function
function formatTime(time){
    return new Date(time).toISOString().replace(/T/, ' ').replace(/\..+/, '');
}