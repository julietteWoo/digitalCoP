// public/js/controllers/mainCtrl.js
var dcopPublicControllers = angular.module('dcopPublicControllers', ['ui.bootstrap']);

function isSessionAlive(currID) {
    var link = window.location.href;
    //TODO other link including teachingplan and node
    var base_link = link.substring(0, link.indexOf("/forum#/"));
    if(currID == undefined) {
         window.location = base_link + "/"
    } else return true;
};

dcopPublicControllers.controller('nodePublicController', ['$scope','Node', '$modal', '$rootScope',
    function($scope, Node,$modal,$rootScope) {

        //preset color
        var dirDist50 = "#FD8A78";
            dirDist10 = "#F2C379";
            dirDistLess10 = "#8CD6D7";

        //Variable settings
        $scope.title = "node map";
        $scope.data = [];
        $scope.nodes = [];
        $scope.currentNode = null;
        $scope.searchNode = null;

        $scope.searchNodeFlag = false;

        getNode();

        //define functions
        function getNode(){
            // Check Active Session and get topic list
            Node.get({name:$scope.searchNode})
                .success(function(data) {
                    $scope.nodes = data['node'];
                    $scope.data = data['data'];
                    $scope.recentlist = data['recent'];
                    $scope.popularlist = data['popular'];
                    $scope.studentprojectlist = data['studentproject'];
                    $scope.studentprojectlist.shift();

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

        function getNodeData(){
            Node.view({name: $scope.currentNode})
                .success(function(data){
                    $scope.publicDiscussionList=data.publicDiscussionList;

                    //bar chart
                    $scope.nodeprofilesubject = data.subjectList;
                    $scope.nodeprofilesubjectgroup = data.subjectGroupList;
                    $scope.totalSubjectTP = data.totalSubjectTP

                     //donut data
                    $scope.STEAM = data.STEAM;
                    //dounutChart();
                })
                .error(function(e){
                    console.log(e);
                });
 
        }

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

        $scope.getMoreNodeInfo = function(theNode){
            $scope.searchNode = theNode;
            $scope.getSearchNode();
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

        function resetNode(){
            $scope.publicDiscussionList = [];
            $scope.currentNode = null;
        }

        function clearChart(){
            if($scope.chart){
                delete $scope.chart;
            }
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
                        info="be invoved in <b>"+ this.total+ " </b>topics and teaching plans<br>"
                            + this.percentage+ " topics, " + (this.total - this.percentage)+ " teaching plans"
                        break;
                        case dirDist10: 
                        info="been invoved in "+ this.percentage+ " topics," + (this.total - this.percentage)+ " teaching plans"
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
                                 
                                if(this.selected ==false){

                                    //pass value to current focused node
                                    $scope.currentNode = this.id;
                                    //get Node data from server
                                    getNodeData();
                                }else {
                                    resetNode();
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
                                $scope.publicDiscussionList={};
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

        $scope.showDiscussionBoard = function(id){
            $scope.progress = 0;
            $rootScope.discussionId = id;

            $modal.open({
                controller: 'discussionViewBoard',
                templateUrl: '/partials/public_discussion_view.html',
            });
        }
        
    }
]);

dcopPublicControllers.controller('discussionViewBoard', ['$scope','Node', '$modalInstance', 'Discussion','$rootScope', '$sce', 'Comment', 'CurrentUser', 'taApplyCustomRenderers',
    function($scope, Node, $modalInstance, Discussion,$rootScope, $sce, Comment,CurrentUser, taApplyCustomRenderers) {

        /*
            page function controller
        */
        //for editing comment
        $scope.editComment = false;
        $scope.editingComment =0;
        $scope.viewComment = true;

        taApplyCustomRenderers();

        // loading variable to show the spinning loading icon
        $scope.loading = true;

        // object to hold all the data for the comment
        $scope.newComment = {};

        //comment style for height adjustment;
        $scope.commentWindowheight =  "520px";

        //everyone can see
        Discussion.view({id: $rootScope.discussionId})
            .success(function(data) {
                $scope.currentTopic = data;
                $scope.currentUser = null;

                /*
                    polish data
                */
                $scope.currentTopic.updated_at = ($scope.currentTopic.updated_at && $scope.currentTopic.updated_at!= null)? formatTime($scope.currentTopic.updated_at):null; //for time format
                $scope.currentTopic.contentPolished = $sce.trustAsHtml($scope.currentTopic.content); //for rich text

                //loading comments
                            Comment.get({id: $rootScope.discussionId})
                                .success(function(data) {
                                    $scope.comments = data.replies.map(item=>{
                                        //polishing data
                                        item.updated_at = formatTime(item.updated_at);
                                        item.contentPolished = $sce.trustAsHtml(item.content);

                                        return item;
                                    });
                                })
                                .error(function(e){
                                    alert("The server has got some issue to get the comment list, please contact admin");
                                });

                CurrentUser.get()
                    .success(function(currentDetail) {
                        $scope.currentUser = currentDetail;
                    })
                    .error(function(data){});
                $scope.loading = false;

            })
            .error(function(e) {
                alert("There's something wrong during loading this discussion topic, please contact admin");
                console.log(e);

            });

        $scope.reset = function(){
            $scope.editComment = false;
            $scope.editingComment =0; 
            $scope.viewComment = true;

            $scope.commentWindowheight =  "520px";
        }

        $scope.editCommentFunction = function(commentId){
            $scope.editComment = true;
            $scope.viewComment = false;
            $scope.editingComment = commentId; 
            $scope.commentWindowheight =  "auto";
        }

                //function for updating comment function
        $scope.updateComment = function(comment) {
            CurrentUser.get()
                .success(function(currentDetail) {
                    $scope.currentUser = currentDetail;
                    if($scope.currentUser!=null){
                        if(isSessionAlive(currentDetail)) {
                            if($scope.editingComment != null){
                                if(comment.contentPolished){
                                    delete comment.contentPolished
                                }

                                comment.public_flag = 'public';
                                Comment.update(comment)
                                    .success(function(e){
                                        alert('your comment has been updated');

                                        //reset loading
                                        $scope.loading = true;

                                        //refresh comment list
                                        Comment.get({id: $rootScope.discussionId})
                                            .success(function(data) {
                                                $scope.currentTopic.node_list = (data.node_list==null || data.node_list=='')?[]:data.node_list.split(",");
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
                                        Comment.get({id: $rootScope.discussionId})
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
    }

]);

// Controller for admin.scala.html
function HeaderController($scope, $location) {
    $scope.isActive = function (viewLocation) { 
        var path = $location.path();// Store path of current view
        return true;
    };
}

//time format function
function formatTime(time){
    return new Date(time).toISOString().replace(/T/, ' ').replace(/\..+/, '');
}