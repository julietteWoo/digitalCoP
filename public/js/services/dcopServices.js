// public/js/services/commentService.js

var dcopServices = angular.module('dcopServices', ['ngResource']);

//node services
dcopServices.factory('Node', [ '$http',function($http) {

    return {
        // get all the nodes 
        view : function(id) {
            return $http({
                method:'POST',
                url:'/api/nodeapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        //get a node
        get : function(name) {
            return $http({
                method:'POST',
                url:'/api/nodesapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
                data: $.param(name)
            });
        },

        // save a comment (pass in comment data)
        save : function(nodeInfo) {
            return $http({
                method: 'POST',
                url: '/api/newnodeapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(nodeInfo)
            });
        },
    }
}]);

//comment services
dcopServices.factory('Comment', [ '$http',function($http) {

    return {
        // get all the comments of a certain topic
        get : function(id) {
            return $http({
                method:'POST',
                url:'/api/commentsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // save a comment (pass in comment data)
        save : function(commentData) {
            return $http({
                method: 'POST',
                url: '/api/commentapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(commentData)
            });
        },

        // update a comment (pass in comment data)
        update : function(commentData) {
            return $http({
                method: 'POST',
                url: '/api/updatecommentapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(commentData)
            });
        },

        // destroy a comment
        destroy : function(id) {
            return $http({
                method: 'POST',
                url: '/api/deletecommentsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        }
    }
}]);

//topic services
dcopServices.factory('Topic', [ '$http',function($http) {

    return {
        //get all the topics
        get : function() {
            return $http({
                method:'GET',
                url:'/api/topicsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
            });
        },

        //get a the topic
        view : function(id) {
            return $http({
                method:'POST',
                url:'/api/topicapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // save a topic 
        save : function(topicData) {
            return $http({
                method: 'POST',
                url: '/api/topicsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(topicData)
            });
        },

        // update a topic (pass in topic data)
        update : function(topicData) {
            return $http({
                method: 'POST',
                url: '/api/updatetopicsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(topicData)
            });
        },

        // destroy a topic
        destroy : function(id) {
            return $http.delete('/api/topicsapi/' + id);
        }
    }
}]);

//teacher teaching plan service
dcopServices.factory('TeacherTeachingPlan', [ '$http',function($http) {
    return{
         // add teacher teaching plan
        save : function(id){
            return $http({
                method: 'POST',
                url: '/api/addteacherteachingplanapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // add teacher teaching plan
        delete : function(id){
            return $http({
                method: 'POST',
                url: '/api/deleteteacherteachingplanapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // get teacher teaching plan list
        get : function(id) {
            return $http({
                method: 'POST',
                url: '/api/getlistteacherteachingplanapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },
    }
}]);


//teachingplan services
dcopServices.factory('TeachingPlan', [ '$http',function($http) {

    return {
        //get all the teaching plan
        get : function() {
            return $http({
                method:'GET',
                url:'/api/teachingplansapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
            });
        },

        //get a the teaching plan
        view : function(id) {
            return $http({
                method:'POST',
                url:'/api/teachingplanapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // save a teaching plan
        save : function(teachingplanData) {
            return $http({
                method: 'POST',
                url: '/api/teachingplansapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(teachingplanData)
            });
        },

        // update a topic (pass in topic data)
        update : function(teachingplanData) {
            return $http({
                method: 'POST',
                url: '/api/updateteachingplansapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(teachingplanData)
            });
        },

        // destroy a teachingplan
        destroy : function(id) {
            return $http({
                method: 'POST',
                url: '/api/deleteteachingplanapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        }
    }
}]);

//teachingplan module services
dcopServices.factory('TeachingPlanModule', [ '$http',function($http) {

    return {
        //get all the teaching plan
        get : function(id) {
            return $http({
                method:'POST',
                url:'/api/teachingplanmodulesapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // save a comment (pass in comment data)
        save : function(teachingplanData) {
            return $http({
                method: 'POST',
                url: '/api/teachingplanmoduleapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(teachingplanData)
            });
        },

        // update a topic (pass in topic data)
        update : function(teachingplanData) {
            return $http({
                method: 'POST',
                url: '/api/updateteachingplanmodulesapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(teachingplanData)
            });
        },

        // // destroy a teachingplan module
        destroy : function(id) {
            return $http({
                method: 'POST',
                url: '/api/deleteteachingplanmoduleapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        }
    }
}]);

//subject services
dcopServices.factory('Subject', [ '$http',function($http) {

    return {
        //get all the subjects
        get : function() {
            return $http({
                method:'GET',
                url:'/api/subjectsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
            });
        },
    }
}]);

//timesheet services
dcopServices.factory('Timesheet', [ '$http',function($http) {

    return {
        //get all the timesheet
        get : function() {
            return $http({
                method:'GET',
                url:'/api/timesheetsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
            });
        },
    }
}]);


//discussion services
dcopServices.factory('Discussion', [ '$http',function($http) {

    return {
        //get all the topics
        get : function() {
            return $http({
                method:'GET',
                url:'/api/discussionapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
            });
        },

        //get a the topic
        view : function(id) {
            return $http({
                method:'POST',
                url:'/api/discussionapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // save a topic 
        save : function(topicData) {
            return $http({
                method: 'POST',
                url: '/api/discussionsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(topicData)
            });
        },

        // update a topic (pass in topic data)
        update : function(topicData) {
            return $http({
                method: 'POST',
                url: '/api/updateddiscussionapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(topicData)
            });
        },

        // destroy a topic
        destroy : function(id) {
            return $http.delete('/api/discussionsapi/' + id);
        }
    }
}]);


//get user credential service
dcopServices.factory('CurrentUser', [ '$http', function($http) {
    return {
        // get current User by token
        get : function() {
            return $http({
                method:'GET',
                url:'/api/getUser',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
            });
        }
    }
}]);


//file upload service
dcopServices.service('ImageUpload', [ '$http', '$location', function($http) {
    this.uploadFileToUrl = function(file, callback){

        var fd= new FormData();
        fd.append('image', file);
        fd.append('dataParts', angular.toJson([]));
        $http.post('/api/imageapi', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function (data) {
            callback(data);
        })
        .error(function(e){
            console.log(e);
        });;
    }
}]);