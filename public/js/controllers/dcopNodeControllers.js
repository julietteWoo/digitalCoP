// public/js/controllers/mainCtrl.js
var dcopNodeControllers = angular.module('dcopNodeControllers', ['ui.bootstrap']);


function isSessionAlive(currID) {
    var link = window.location.href;
    var base_link = link.substring(0, link.indexOf("/node#/"));
    if(currID == undefined) {
         window.location = base_link + "/"
    } else return true;
};

dcopNodeControllers.controller('blankController', ['$scope','CurrentUser','Topic','Comment',
    function($scope, CurrentUser, Topic, Comment) {
          console.log("this is blank in node");
    }
]);

dcopNodeControllers.controller('nodeController', ['$scope','Node','CurrentUser','Topic','Comment', 'Discussion', '$modal', '$rootScope', '$routeParams',
    function($scope, Node, CurrentUser, Topic, Comment, Discussion, $modal, $rootScope,$routeParams) {

        //preset color
        var dirDist50 = "#FD8A78";
            dirDist10 = "#F2C379";
            dirDistLess10 = "#8CD6D7";

        //Variable settings
        $scope.title = "node map";
        $scope.data = [];
        $scope.nodes = [];
        $scope.showAddPublic= false;
        $scope.currentNode = null;
        $scope.searchNode = null;
        $scope.showAddTopic =false;

        $scope.searchNodeFlag = false;

        // Check Active Session and get topic list
        CurrentUser.get()
            .success(function(currentDetail) {
                if(isSessionAlive(currentDetail)) {
                    $scope.user = currentDetail;

                    getNode();

                    if($routeParams.id){
                        console.log($routeParams.id);
                        //pass value to current focused node
                        $scope.currentNode = $routeParams.id;

                        //get Node data from server
                        getNodeData($scope.currentNode);
                    }
                }
            })
            .error(function(e){
                console.log(e);
            });

        function getNode(){
            if($routeParams.id){
                $scope.searchNode = $routeParams.id;
            }
            Node.get({name:$scope.searchNode})
                .success(function(data) {
                    $scope.nodes = data['node'];
                    $scope.data = data['data'];
                    clearChart();
                    drawChart();

                })
                .error(function(e) {
                    console.log(e);
                    alert("Couldn't load node list.");
                });
        }

        function dounutChart(){
            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'STEAMChart',
                    type: 'pie'
                },
                title: {
                    text: 'STEAM'
                },

                credits: {                                 
                    enabled:  false                          
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: false
                        },
                        size: 100,
                        innerSize: '50%',
                        center: ['50%', '40%']
                    }
                },
                series: [{
                    data: $scope.STEAM
                }]
            },function(chart) { // on complete

                var xpos = '50%';
                var ypos = '50%';
                var circleradius = 102;

                // Render the circle
                chart.renderer.circle(xpos, ypos, circleradius).attr({
                    fill: '#ffffff',
                }).add();

            });
        }

        function getNodeData(nameData){
            Node.view({name: nameData})
                .success(function(data){
                    $scope.forumList = data.forumList;
                    $scope.teachingPlanList = data.teachingPlanList;
                    $scope.publicDiscussionList = data.publicDiscussionList;
                    $scope.nodeprofilesubject = data.subjectList;
                    $scope.nodeprofilesubjectgroup = data.subjectGroupList;
                    $scope.totalSubjectTP = data.totalSubjectTP

                    //donut data
                    $scope.STEAM = data.STEAM;

                    dounutChart();
                })
                .error(function(e){
                    console.log(e);
                });

        }

        function clearChart(){
            if($scope.chart){
                delete $scope.chart;
            }
        }

        function reset(){
            $scope.forumList= [];
            $scope.teachingPlanList= [];
            $scope.publicDiscussionList= [];
            $scope.nodeprofilesubject = [];
            $scope.currentNode = null;
        }

        function drawChart(){
            $scope.chart = new Highcharts.chart('container', {

            chart: { type: 'networkgraph', marginTop: 80 },
            title: {text: $scope.title},

            tooltip:{
                formatter:function(){
                    var info="";

                    switch(this.color){
                        case dirDist50: 
                        info="be mentioned"+ this.total+ " </b>times in teaching plans and topics<br>"
                        break;
                        case dirDist10: 
                        info="been invoved "+ this.total+ " teaching plans and topics"
                        break;
                        case dirDistLess10: 
                        info="be invoved in <b>"+ this.total+ " </b>topics and teaching plans<br>"
                        break;
                        default:
                        info="search for more infomration"
                    }
                return "<b>"+this.key + "</b>: "+info;
              }
            },


            plotOptions: {
                networkgraph: {
                    keys: ['from', 'to'],
                    layoutAlgorithm: {
                        enableSimulation: true,
                        integration: 'verlet',
                        linkLength: 100
                    },
                    allowPointSelect: true,//you need this to allow selection
                    point:{
                        events:{
                            click:function(){
                                 
                                if(this.selected !=true){

                                    //pass value to current focused node
                                    $scope.currentNode = this.id;

                                    //get Node data from server
                                    getNodeData($scope.currentNode);
                                }else {
                                    reset();
                                }
                                
                            },
                            select: function(event) {
                                if (typeof this.isNode !== 'undefined') return;//to disable selecting the root node
                                this.custom_old_color = this.color;//save old color
                                this.selected =true;
                                this.update({
                                    color: 'red'
                                  });

                            },
                            unselect: function(event) {
                                if (typeof this.isNode !== 'undefined') return;
                                this.selected =false;
                                this.update({
                                    color: this.custom_old_color//restore old color
                                });
                            }
                        }
                    }
                }
            },

            series: [{ marker: {radius: 13,},
                       dataLabels: {enabled: true, linkFormat: '', allowOverlap: true,style: { textOutline: false}},
                       data: $scope.data,
                       nodes: $scope.nodes
                    }]
        });
        }

        //flag set for add discussion
        $scope.setAddPublicFlag = function(){
            $scope.showAddPublic = !$scope.showAddPublic;
        }

        //flag set for add topic
        $scope.setAddTopicFlag = function(){
            $scope.showAddTopic = !$scope.showAddTopic;
        }

        //function for create new discussion in the discussion board
        $scope.createNewTopic = function() {
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        $scope.newTopicObject.user_id = currentDetail;
                        $scope.newTopicObject.public = 'group';
                        var valid=true;
                        if($scope.currentNode!=null){
                            $scope.newTopicObject.start_point = $scope.currentNode;
                            $scope.newTopicObject.title = $scope.currentNode;
                            
                            //do validation
                            if(!$scope.newTopicObject.content){
                                valid = false;
                                alert("content field is required");
                            }

                            //after valid do create
                            if(valid==true){
                                Topic.save( $scope.newTopicObject)
                                .success(function(e){
                                    //set field back to null
                                    $scope.newTopicObject.title = null;
                                    $scope.newTopicObject.content = null;
                                    alert('your public discussion has been created');

                                    //reset loading
                                    $scope.loading = true;
                                    $scope.showAddTopic = false;
                                    //refresh everything
                                    Node.view({name: $scope.currentNode})
                                        .success(function(data){
                                            $scope.forumList=data.forumList;
                                            $scope.teachingPlanList=data.teachingPlanList;
                                            $scope.publicDiscussionList=data.publicDiscussionList;
                                            $scope.nodeprofilesubject = data.subjectList;
                                        })
                                        .error(function(e){
                                            console.log(e);
                                        });

                                })
                                .error(function(e) {
                                    console.log(e);
                                    alert("Couldn't create new public discussion. Please contact admin.")
                                });
                            }else{
                                alert("please click on the node you want to create public discussion in the node map");
                            }
                        }
                    }
            });
                
        };

        //function for create new discussion in the discussion board
        $scope.createNewPublicBoard = function() {
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        $scope.newTopic.user_id = currentDetail;
                        $scope.newTopic.public = 'public';
                        var valid=true;
                        if($scope.currentNode!=null){
                            $scope.newTopic.start_point = $scope.currentNode;

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
                                Discussion.save( $scope.newTopic)
                                .success(function(e){
                                    //set field back to null
                                    $scope.newTopic.title = null;
                                    $scope.newTopic.content = null;
                                    alert('your public discussion has been created');
                                    console.log(e);

                                    //reset loading
                                    $scope.loading = true;
                                    $scope.showAddPublic = false;
                                    //refresh everything
                                    Node.view({name: $scope.currentNode})
                                        .success(function(data){
                                            $scope.forumList=data.forumList;
                                            $scope.teachingPlanList=data.teachingPlanList;
                                            $scope.publicDiscussionList=data.publicDiscussionList;
                                            $scope.nodeprofilesubject = data.subjectList;
                                        })
                                        .error(function(e){
                                            console.log("error");
                                            console.log(e);
                                        });

                                })
                                .error(function(e) {
                                    console.log(e);
                                    alert("Couldn't create new public discussion. Please contact admin.")
                                });
                            }else{
                                alert("please click on the node you want to create public discussion in the node map");
                            }
                        }

                    }
            });
                
        };

        $scope.getSearchNode = function(){
            //get search node chart data
            getNode();
            //get searching node data
            //getNodeData($scope.searchNode);
            //$scope.currentNode = $scope.searchNode
            $scope.currentNode = null; //NOTE: because the search may return a list of node, so do not show any node information until click on one node
            //clear old chart
            clearChart();
            //draw new chart
            drawChart();

            $scope.searchNodeFlag = true;
        }

        $scope.clearSearchNode = function(){
            //clear node search
            $scope.searchNode =null;
            //get node list
            getNode();

            //reset value
            $scope.currentNode = null;
            $scope.searchNodeFlag = false;
            reset();

            //clear old chart
            clearChart();
            //draw new chart
            drawChart();

        }

        $scope.addNode = function(){

            $modal.open({
                controller: 'nodeCreateController',
                templateUrl: '/partials/node_create.html',
            })
            .result.then(function(){
                //call node search 
                console.log('test one');
                console.log($rootScope.newNode);
                $scope.currentNode = $rootScope.newNode;
                getNodeData($rootScope.newNode);

                //clear old chart
                clearChart();
                //draw new chart
                drawChart();
            });
        }

        
    }
]);

dcopNodeControllers.controller('nodeCreateController', ['$scope','CurrentUser','Topic','Comment','Node', '$modalInstance','$rootScope',
    function($scope, CurrentUser, Topic, Comment, Node,$modalInstance,$rootScope) {
        $scope.newNode = null;

        $scope.addNode = function($name){
            CurrentUser.get()
            .success(function(currentDetail) {
                if(isSessionAlive(currentDetail)) {
                    Node.save({name: $name , count:0})
                    .success(function(e){
                        $rootScope.newNode = $name;
                        $scope.newNode = null;
                        $modalInstance.close();
                    })
                    .error(function(e){
                        console.log(e);
                    })
                }
            })
            .error(function(e){
                console.log(e);
            });

        }
    }
]);

//upload image controller
dcopNodeControllers.controller('UploadImageModalInstance',['$scope', '$modalInstance','ImageUpload', '$rootScope',
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
dcopNodeControllers.directive('fileModel', ['$parse', function ($parse) {
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