// public/js/controllers/mainCtrl.js
var dcopControllers = angular.module('dcopControllers', ['ui.bootstrap'])

function isSessionAlive(currID) {
    var link = window.location.href;
    //TODO other link including teachingplan and node
    var base_link = link.substring(0, link.indexOf("/forum#/"));
    if(currID == undefined) {
         window.location = base_link + "/"
    } else return true;
};

dcopControllers.controller('blankController', ['$scope','CurrentUser','Topic','Comment',
    function($scope, CurrentUser, Topic, Comment) {
          console.log("this is a blankpage");
    }
]);

// Show topics and add topic page
dcopControllers.controller('topicController', ['$scope','$location','CurrentUser','Topic', '$rootScope',
    function($scope, $location,CurrentUser, Topic, $rootScope ) {
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
                    Topic.get()
                    .success(function(data) {
                        $scope.topics = data['topic'].map(item=>{
                            item.updated_at = formatTime(item.updated_at);
                            return item;
                        });
                        $scope.studentprojectlist = data['studentproject'];
                        $scope.studentprojectlist.shift();

                        $scope.loading = false;
                    })
                    .error(function(e) {
                        console.log(e);
                        alert("Couldn't load topic list. Please contact admin.");
                    });
                }
            })
            .error(function(e){
                console.log(e);
            });

        //function for create new topic
        $scope.createNewTopic = function() {
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        $scope.newTopic.user_id = currentDetail;
                        $scope.newTopic.public = 'group';
                        var valid=true;

                        //do validation
                        if(!$scope.newTopic.title){ // all required
                            valid = false;
                            alert("title field is required");
                        }else if(!$scope.newTopic.content){
                            valid = false;
                            alert("content field is required");
                        }

                        //after valid do create
                        if(valid==true){
                            Topic.save( $scope.newTopic)
                            .success(function(e){
                                //set field back to null
                                $scope.newTopic.title = null;
                                $scope.newTopic.content = null;
                                alert('your topic has been created');

                                //reset loading
                                $scope.loading = true;

                                //refresh topic list
                                Topic.get()
                                    .success(function(data) {
                                        $scope.topics = data['topic'].map(item=>{
                                            item.updated_at = formatTime(item.updated_at);
                                            return item;
                                        });

                                        $scope.studentprojectlist = data['studentproject'];
                                        $scope.studentprojectlist.shift();
                                        
                                        $scope.loading = false;
                                });

                            })
                            .error(function(e) {
                                console.log(e);
                                alert("Couldn't create new topic. Please contact admin.")
                            });
                        }

                    }
            });
                
        };

        //function to direct to topic view page
        $scope.view = function(topicId) {

            // Check Active Session
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {

                        //get to the topic view page
                        $location.path('/topicview/' + topicId);
                    }
            });
        };

        //function to set show and hid add topic window flag
        $scope.setAddTopicFlag = function(){
            $scope.showAddTopic = !$scope.showAddTopic;
        };
        
        //function to call after insert image
        $rootScope.$on('UpdateContent', function(event, args){
            if($scope.newTopic.content == undefined){
                $scope.newTopic.content = ''+ "<p><img src='"+args.url+"'> </p> ";
            }else{

                $scope.newTopic.content = $scope.newTopic.content+ "<p><img src='"+args.url+"'> </p> ";
            }
        })
    }
]);

// get the topic view page and show the comment list
dcopControllers.controller('topicViewController', ['$scope','$routeParams','$sce','CurrentUser','Topic','Comment', 'Subject', 'taApplyCustomRenderers',
    function($scope, $routeParams, $sce, CurrentUser, Topic, Comment, Subject, taApplyCustomRenderers) {
        // object to hold all the data for the comment
        $scope.newComment = {};
        $scope.newComment.STEAM = [];
        $scope.newComment.subjects = [];
        taApplyCustomRenderers();

        //object to hold the current topic
        $scope.currentTopic = {};
        // loading variable to show the spinning loading icon
        $scope.loading = true;

        /*
            page function controller
        */
        //for editing comment
        $scope.editComment = false;
        $scope.viewComment = true;
        $scope.editingComment = null;

        //for editing topic
        $scope.editTopic = false;
        $scope.editingTopic = {};

        //STEAM tick label
        $scope.STEAM= {
                            'Arts' :false,
                            'Science' :false,
                            'Technology' :false,
                            'Engineering' :false,
                            'Mathematics' :false
                        };

        //subjects tick label
        $scope.subjects ={};

        //tick data
        $scope.newCommentData={};
        //STEAM tick data
        $scope.newCommentData.STEAM={};
        //subjectList data
        $scope.newCommentData.subjectList={};

        //comment style for height adjustment;
        $scope.commentWindowheight =  "400px";
        //$scope.tableWindowWidth =  document.getElementById('standardtable').width;

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
                        Topic.view({id: $routeParams.id})
                            .success(function(data){
                                $scope.currentTopic = data;

                                /*
                                    polish data
                                */
                                $scope.currentTopic.updated_at = formatTime($scope.currentTopic.updated_at); //format time
                                $scope.currentTopic.contentPolished = $sce.trustAsHtml($scope.currentTopic.content); //format richtext

                                //side list
                                $scope.currentTopic.start_point = $scope.currentTopic.start_point==null || $scope.currentTopic.start_point ==''? []:$scope.currentTopic.start_point.split(",");//format string to node array list
                                $scope.currentTopic.node_recommand = $scope.currentTopic.node_recommand==null || $scope.currentTopic.node_recommand==''? []:$scope.currentTopic.node_recommand.split(",");//format string to node array list
                                $scope.currentTopic.node_list = $scope.currentTopic.node_list==null || $scope.currentTopic.node_list==''? []:$scope.currentTopic.node_list.split(",");//format string to node array list
                                $scope.currentTopic.teaching_plan_list = $scope.currentTopic.teaching_plan_list==null || $scope.currentTopic.teaching_plan_list==''? []:$scope.currentTopic.teaching_plan_list;//format string to node array list

                                //get comment list after get the topic
                                Comment.get({id: $routeParams.id})
                                    .success(function(data) {
                                        $scope.comments = data.replies.map(item=>{
                                            //polishing data
                                            item.updated_at = formatTime(item.updated_at);
                                            item.contentPolished = $sce.trustAsHtml(item.content);

                                            item.STEAMDisplay = item.STEAM ==null? null: item.STEAM.split(',');
                                            item.subjectsDisplay = item.subjects ==null? null: item.subjects.split(',');

                                            return item;
                                        });
                                        
                                    })
                                    .error(function(e){
                                        console.log(e);
                                        alert("The server has got some issue to get the comment list, please contact admin");
                                    });

                                //get subject list
                                 Subject.get()
                                    .success(function(data) {

                                        $scope.subjects = data;
                                        
                                    })
                                    .error(function(e) {
                                        console.log(e);
                                        alert("Couldn't load subject list. Please contact admin.");
                                    });

                                $scope.loading = false;
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
            $scope.editingComment = null;

            //for editing topic
            $scope.editTopic = false;
            $scope.editingTopic = {};

            $scope.commentWindowheight =  "400px";

            //STEAM tick data
            $scope.newCommentData.STEAM={};
            //subjectList data
            $scope.newCommentData.subjectList={};
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
                            Topic.update($scope.editingTopic)
                                .success(function(e){
                                    alert('your topic has been updated');

                                    //reset loading
                                    $scope.loading = true;

                                    //refresh topic 
                                    Topic.view({id: $routeParams.id})
                                        .success(function(data) {
                                            $scope.currentTopic = data;

                                            /*
                                                polish data
                                            */
                                            $scope.currentTopic.updated_at = formatTime($scope.currentTopic.updated_at); //for time format
                                            $scope.currentTopic.contentPolished = $sce.trustAsHtml($scope.currentTopic.content); //for rich text

                                            //side list
                                            $scope.currentTopic.start_point = $scope.currentTopic.start_point==null || $scope.currentTopic.start_point==''? []:$scope.currentTopic.start_point.split(",");//format string to node array list
                                            $scope.currentTopic.node_recommand = $scope.currentTopic.node_recommand==null || $scope.currentTopic.node_recommand==''? []:$scope.currentTopic.node_recommand.split(",");//format string to node array list
                                            $scope.currentTopic.node_list = $scope.currentTopic.node_list==null || $scope.currentTopic.node_list==''? []:$scope.currentTopic.node_list.split(",");//format string to node array list
                                            $scope.currentTopic.teaching_plan_list = $scope.currentTopic.teaching_plan_list==null || $scope.currentTopic.teaching_plan_list==''? []:$scope.currentTopic.teaching_plan_list;//format string to node array list

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
        
            //clean up STEAM list
            Object.keys($scope.newCommentData.STEAM).forEach(function(key){
                if($scope.newCommentData.STEAM[key]==true){
                    $scope.newComment.STEAM.push(key);
                }
            })

            //clean subject list
            Object.keys($scope.newCommentData.subjectList).forEach(function(key){
                if($scope.newCommentData.subjectList[key]==true){
                    $scope.newComment.subjects.push(key);
                }
            })

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


                        //after valid do create
                        if(valid==true){
                            Comment.save( $scope.newComment)
                                .success(function(e){

                                    //set field back to null
                                    $scope.newComment.content = null;
                                    $scope.newComment.STEAM = [];
                                    $scope.newComment.subjects =[];
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

                                                item.STEAMDisplay = item.STEAM ==null? null: item.STEAM.split(',');
                                                item.subjectsDisplay = item.subjects ==null? null: item.subjects.split(',');

                                                return item;
                                            });

                                            $scope.loading = false;

                                    })
                                        .error(function(e) {
                                        alert("list loading issue, please contact admin");
                                    });

                                    //reset flags
                                    $scope.reset();

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
        $scope.editCommentFunction = function(commentId, comment) {

            //set hind and show flag
            $scope.editComment = true;
            $scope.viewComment = false;
            $scope.editingComment = commentId; 
            $scope.commentWindowheight =  "auto";

            //prepare data for ticking
            if(comment.STEAMDisplay!=null){
                comment.STEAMDisplay.forEach(function($object){
                    $scope.newCommentData.STEAM[$object] = true;
                });
            }
            if(comment.subjectsDisplay!=null){
                comment.subjectsDisplay.forEach(function($object){
                    $scope.newCommentData.subjectList[$object] = true;
                });
            }
        };

        //function for updating comment function
        $scope.updateComment = function(comment) {

            comment.STEAM=[];
            comment.subjects=[];
            //clean up STEAM list
            Object.keys($scope.newCommentData.STEAM).forEach(function(key){
                if($scope.newCommentData.STEAM[key]==true){
                    comment.STEAM.push(key);
                }
            })

            //clean subject list
            Object.keys($scope.newCommentData.subjectList).forEach(function(key){
                if($scope.newCommentData.subjectList[key]==true){
                    comment.subjects.push(key);
                }
            })

            delete comment.STEAMDisplay;
            delete comment.subjectsDisplay;


            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        if($scope.editingComment != null){
                            if(comment.contentPolished){
                                delete comment.contentPolished
                            }

                            Comment.update(comment)
                                .success(function(e){
                                    alert('your comment has been updated');

                                    //reset loading
                                    $scope.loading = true;

                                    Topic.view({id: $routeParams.id})
                                        .success(function(data){
                                            $scope.currentTopic = data;
                                             /*
                                                polish data
                                            */
                                            $scope.currentTopic.updated_at = formatTime($scope.currentTopic.updated_at); //format time
                                            $scope.currentTopic.contentPolished = $sce.trustAsHtml($scope.currentTopic.content); //format richtext

                                        
                                            //side list
                                            $scope.currentTopic.start_point = data.start_point==null || data.start_point ==''? []:data.start_point.split(",");//format string to node array list
                                            $scope.currentTopic.node_recommand = data.node_recommand==null || data.node_recommand==''? []:data.node_recommand.split(",");//format string to node array list
                                            $scope.currentTopic.node_list = data.node_list==null || data.node_list==''? []:data.node_list.split(",");//format string to node array list
                                            $scope.currentTopic.teaching_plan_list = data.teaching_plan_list==null || data.teaching_plan_list==''? []:data.teaching_plan_list;//format string to node array list
                                        });

                                    //refresh comment list
                                    Comment.get({id: $routeParams.id})
                                        .success(function(data) {
                                            $scope.currentTopic.node_list = (data.node_list==null || data.node_list=='')?[]:data.node_list.split(",");
                                            $scope.comments = data.replies.map(item=>{

                                                //polish data
                                                item.updated_at = formatTime(item.updated_at);
                                                item.contentPolished = $sce.trustAsHtml(item.content);

                                                //indication data
                                                item.STEAMDisplay = item.STEAM ==null? null: item.STEAM.split(',');
                                                item.subjectsDisplay = item.subjects ==null? null: item.subjects.split(',');


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
                                    console.log(e);
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
                                Comment.destroy({id:commentId})
                                    .success(function(e){
                                        alert('your comment has been deleted');

                                        //reset loading
                                        $scope.loading = true;

                                        //refresh topic list
                                        Comment.get({id: $routeParams.id})
                                            .success(function(data) {
                                                $scope.currentTopic.node_list = (data.node_list==null || data.node_list =='')? []: data.node_list;
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
dcopControllers.controller('UploadImageModalInstance',['$scope', '$modalInstance','ImageUpload', '$rootScope',
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
dcopControllers.directive('fileModel', ['$parse', function ($parse) {
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

