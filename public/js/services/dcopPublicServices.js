//this is a service for both non authenticated and authenticated use in the public board
var dcopPublicServices = angular.module('dcopPublicServices', ['ngResource']);


//node services
dcopPublicServices.factory('Node', [ '$http',function($http){

    return {
        // get all the discussion of the nodes
        view : function(name) {
            return $http({
                method:'POST',
                url:'/api/publicnodeapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(name)
            });
        },

        //get all the nodes
        get : function(name) {
            return $http({
                method:'POST',
                url:'/api/publicnodesapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
                data: $.param(name)
            });
        }
    }
}]);

//comment services
dcopPublicServices.factory('Comment', [ '$http',function($http) {

    return {
        // get all the comments of a certain topic
        get : function(id) {
            return $http({
                method:'POST',
                url:'/api/publiccommentsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        },

        // save a comment (pass in comment data)
        save : function(commentData) {
            return $http({
                method: 'POST',
                url: '/api/publiccommentapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(commentData)
            });
        },

        // update a comment (pass in comment data)
        update : function(commentData) {
            return $http({
                method: 'POST',
                url: '/api/publicupdatecommentapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(commentData)
            });
        },

        // destroy a comment
        destroy : function(id) {
            return $http({
                method: 'POST',
                url: '/api/publicdeletecommentsapi',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded','X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                data: $.param(id)
            });
        }
    }
}]);

//discussion services
dcopPublicServices.factory('Discussion', [ '$http',function($http) {

    return {
        //get all the topics
        view : function(id) {
            return $http({
                method:'POST',
                url:'/api/publicdiscussionapi',
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
dcopPublicServices.factory('CurrentUser', [ '$http', function($http) {
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
dcopPublicServices.service('ImageUpload', [ '$http', '$location', function($http) {
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