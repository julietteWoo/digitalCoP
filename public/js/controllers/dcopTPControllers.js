// public/js/controllers/mainCtrl.js
var dcopTPControllers = angular.module('dcopTPControllers', ['ui.bootstrap']);


function isSessionAlive(currID) {
    var link = window.location.href;
    var base_link = link.substring(0, link.indexOf("/teachingplan#/"));
    if(currID == undefined) {
         window.location = base_link + "/"
    } else return true;
};

dcopTPControllers.controller('blankController', ['$scope','CurrentUser','TeachingPlan',
    function($scope, CurrentUser, TeachingPlan) {
    }
]);

dcopTPControllers.controller('teachingplanController', ['$scope','$location', 'CurrentUser','TeachingPlan', 'TeacherTeachingPlan',
    function($scope, $location, CurrentUser, TeachingPlan, TeacherTeachingPlan) {
        
        // loading variable to show the spinning loading icon
        $scope.loading = true;
        $scope.user = null;
        $scope.admin = false;

        // Check Active Session and get topic list
        CurrentUser.get()
            .success(function(currentDetail) {
                if(isSessionAlive(currentDetail)) {
                    $scope.user = currentDetail;
                     if(currentDetail==1){ //1 is root admin 
                        $scope.admin =true;
                     }
                    //get plan list
                    TeachingPlan.get()
                    .success(function(data) {

                        //for group tab
                        $scope.plans = data.plans.map(item=>{
                            item.updated_at = formatTime(item.updated_at);
                            return item;
                        });

                        //for individual tab
                        $scope.userplans = data.userplans.map(item=>{
                            item.updated_at = formatTime(item.updated_at);
                            return item;
                        });

                        //for student tab
                        $scope.studentplans = data.studentplans.map(item=>{
                            item.updated_at = formatTime(item.updated_at);
                            return item;
                        });

                        //for project tab
                        $scope.projectplans = data.projectplans.map(item=>{
                            item.updated_at = formatTime(item.updated_at);
                            return item;
                        });
                    
                        $scope.loading = false;
                    })
                    .error(function(e) {
                        console.log(e);
                        alert("Couldn't load teaching plan list. Please contact admin.");
                    });
                }
            })
            .error(function(e){
                console.log(e);
            });

        $scope.createNewTP = function() {
            // Check Active Session
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {

                        //get to the teaching plan create page
                        $location.path('/create');
                    }
            });
        }

        $scope.view = function(id) {
            // Check Active Session
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {

                        //get to the teaching plan view page
                        $location.path('/view/'+id);
                    }
            });
        }

        $scope.addTeacher = function(id){
            // Check Active Session
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        //get teacher list
                        TeacherTeachingPlan.get({'id':id})
                            .success(function(data) { 
                                $scope.teacherList = "";
                                data.forEach(function(teacher){
                                    $scope.teacherList = $scope.teacherList + teacher.id +" : "+ teacher.name+ ";  ";
                                });

                                $scope.loading = false;

                                var confirm = window.prompt($scope.teacherList)

                                if(confirm!=null||confirm!=''){
                                    addTeacherTeachingPlan(id,confirm);
                                }  
                            })
                            .error(function(e) {
                                console.log(e);
                                alert("Couldn't add teacher to the collaborate plan");
                            });

                        
                    }
                });
        }

        var addTeacherTeachingPlan = function(id, teacherId){         
            //add teacher teaching plan
            TeacherTeachingPlan.save({"id":id, "teacherId":teacherId})
                .success(function(data) {  
                    //get plan list
                    TeachingPlan.get()
                        .success(function(data) {

                            //for student tab
                            $scope.studentplans = data.studentplans.map(item=>{
                                item.updated_at = formatTime(item.updated_at);
                                return item;
                            });
                        })
                        .error(function(e) {
                            console.log(e);
                            alert("Couldn't load teaching plan list. Please contact admin.");
                        });            
                    $scope.loading = false;
                })
                .error(function(e) {
                    console.log(e);
                    alert("Couldn't add teacher to the collaborate plan");
                });
                   
        }

        $scope.deleteTeacher = function(id, teacherId){
            // Check Active Session
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {

                        
                        //get plan list
                        TeacherTeachingPlan.delete(id, teacherId)
                            .success(function(data) { 
                            console.log(data);              
                                $scope.loading = false;
                            })
                            .error(function(e) {
                                console.log(e);
                                alert("Couldn't delete teacher from the collaborate plan");
                            });
                    }
                });

        }
    }
]);

dcopTPControllers.controller('teachingplanCreateController', ['$scope','CurrentUser','TeachingPlan', '$sce', 'Subject', '$location', 'taApplyCustomRenderers',
    function($scope, CurrentUser, TeachingPlan, $sce, Subject, $location, taApplyCustomRenderers) {
        
        // loading variable to show the spinning loading icon
        $scope.loading = true;
        $scope.user = null;
        taApplyCustomRenderers();

        //object of new teaching plan
        $scope.newTP = {};
        $scope.newTP.allow_collaboration_flag = false; //default collaboration flag
        $scope.newTP.content = null;

        $scope.newTP.subjectSection = []; 
        $scope.newTP.subjectSection[0] = {subject:0,
                                            section:[{content:null,
                                                    content_title:null}]
                                        };

        $scope.newTP.public= "Private"; //by defualt teaching plan is private

        var subjectSectionCount = 0; //subject section count initialise

        // Check Active Session and get topic list
        CurrentUser.get()
            .success(function(currentDetail) {
                if(isSessionAlive(currentDetail)) {
                    $scope.user = currentDetail;
                    //get topic list
                    Subject.get()
                    .success(function(data) {

                        $scope.subjects = data;
                        $scope.subjects.push({id:0, subject: 'None of above'})
                        $scope.loading = false;
                    })
                    .error(function(e) {
                        console.log(e);
                        alert("Couldn't load subject list. Please contact admin.");
                    });
                }
            })
            .error(function(e){
                console.log(e);
            });

        $scope.change =function(){
            if($scope.newTP.allow_collaboration_flag==true){
                $scope.newTP.public= "Public"
            }
        }

        $scope.addSubjectSection = function() {
            if(subjectSectionCount<20){// subject amount limitation
                subjectSectionCount++;
                $scope.newTP.subjectSection[subjectSectionCount]={subject:0,
                                                                    section:[{content:null,
                                                                            content_title:null}]
                                                                };
            }

        }

        $scope.addSection = function(subject) {
            if(subject.section.length<=20){ //set section amount limitation of each subject
                subject.section.push({
                                                content:null,
                                                content_title:null});
            }
        }

        var removeItem = (items, i)=>items.slice(0, i).concat(items.slice(i+1, items.length));

        $scope.createNewTP = function() {
            //data check
            var valid = true;
            var alertMessage = '';
            //validate the teaching plan part
            if(!$scope.newTP.title||$scope.newTP.title==null){//title is empty => alert
                alertMessage += 'teaching plan title can not be empty'
                valid = false;
            }else{//validate the teaching plan modules

                var tempData=[];
                var tempSubjectData=[];
                var i=0;
                var j=0;
                $scope.newTP.subjectSection.forEach( function(subjectData, subjectIndex) {
                    subjectData.section.forEach(function(data, index){
                        //remove empty section
                        if(data.content_title ==null && data.content ==null ) {
                            // //remove this empty section 
                            // subjectData.section=removeItem(subjectData.section, index);
                            // console.log(subjectData);
                        }else if( !data.content_title||(data.content_title && data.content_title ==null)){
                            alertMessage +='\nsection title could not be empty';
                            valid = false;
                        }else if( !data.content || (data.content && data.content ==null)){
                            alertMessage += '\n section content could not be empty';
                            valid = false;
                        }else{
                            tempData[i]=data;
                            i++;
                        }
                    });
                    if(tempData.length!=0){
                        tempSubjectData[j]=subjectData;
                        tempSubjectData[j].section=tempData;
                        j++;
                    }
                    //reset tempData
                    tempData =[];
                });
                $scope.newTP.subjectSection = tempSubjectData;
            }

            if(valid){
                // Check Active Session
                CurrentUser.get()
                    .success(function(currentDetail) {
                        if(isSessionAlive(currentDetail)) {

                            if($scope.newTP.title && $scope.newTP.title!=null && $scope.newTP.title!=''){//title must not be empty
                                //save plan list
                                TeachingPlan.save($scope.newTP)
                                .success(function(data) {

                                   $location.path('/view/'+data.id);

                                })
                                .error(function(e) {
                                    console.log(e);
                                    alert("Couldn't create teaching plan. Please contact admin.");
                                });
                            }else{
                                alert("The system has problem create teaching plan. Please contact admin.");
                            }
                            
                        }
                });
            }else{
                alert(alertMessage);
            }
        }
    }
]);

dcopTPControllers.controller('teachingplanViewEditController', ['$scope','CurrentUser','TeachingPlan', 'TeachingPlanModule','$sce', 'Subject', '$location', '$routeParams','taApplyCustomRenderers',
    function($scope, CurrentUser, TeachingPlan, TeachingPlanModule, $sce, Subject, $location, $routeParams, taApplyCustomRenderers) {
        
        // loading variable to show the spinning loading icon
        $scope.loading = true;
        $scope.user = null;
        taApplyCustomRenderers();

        //editing flag
        $scope.editTitle =false;
        $scope.editSummary =false;
        $scope.editOptions =false;
        $scope.editTypeOptions = false;
        $scope.editModule =false;
        $scope.deleteFlag =false;

        $scope.collaborationShowFlag = false;

        //section adding
        $scope.newSubjectSection=false;

        //editing object     
        $scope.editTP = {};
        $scope.editTP.content = null;

        // Check Active Session and get topic list
        CurrentUser.get()
            .success(function(currentDetail) {
                if(isSessionAlive(currentDetail)) {
                    $scope.user = currentDetail;
                    //get subject list
                    Subject.get()
                        .success(function(data) {

                            $scope.subjects = data;
                            $scope.subjects.push({id:0, subject: 'None of above'})
                            
                        })
                        .error(function(e) {
                            console.log(e);
                            alert("Couldn't load subject list. Please contact admin.");
                        });

                    //load teaching plan
                    TeachingPlan.view({id: $routeParams.id})
                        .success(function(data) {

                            $scope.TP = data;

                            //set delete Flag, if the user is the creator, the button show
                            if(currentDetail==$scope.TP.user_id){
                                $scope.deleteFlag =true;
                            }

                            //set collaborationShowFlag
                            if(($scope.TP.allow_collaboration_flag && $scope.TP.allow_collaboration_flag==true )|| currentDetail==$scope.TP.user_id){
                                $scope.collaborationShowFlag = true;
                            }

                            /*
                                polish data
                            */
                            //side list
                            $scope.TP.title_node = $scope.TP.title_node==null || $scope.TP.title_node ==''? []:$scope.TP.title_node.split(",");//format string to node array list
                            $scope.TP.node_list = $scope.TP.node_list==null || $scope.TP.node_list==''? []:$scope.TP.node_list.split(",");//format string to node array list

                            //load teaching plan module
                            TeachingPlanModule.get({id: $routeParams.id})
                                 .success(function(data) {

                                    $scope.TPmodule = data;
                                    $scope.CurrentSubject=Object.keys($scope.TPmodule)[0];
                                })
                                .error(function(e) {
                                    console.log(e);
                                    alert("Couldn't load teaching plan module list. Please contact admin.");
                                });
                        })
                        .error(function(e) {
                            console.log(e);
                            alert("Couldn't load teaching plan. Please contact admin.");
                        });

                    $scope.loading = false;
                }
            })
            .error(function(e){
                console.log(e);
            });

        $scope.change = function(){
            if($scope.TP.allow_collaboration_flag==true){
                $scope.TP.public = "Public";
            }
            $scope.editOptions = true;
        }

        $scope.changePrivate = function(){
            if($scope.TP.public=='Private'){
                $scope.TP.allow_collaboration_flag=false;
            }
            $scope.editOptions = true;
        }

        $scope.changeType = function(){
            $scope.editTypeOptions = true;
        }

        $scope.addSection = function(subject) {
            if(subject.section.length<=2){ //set section amount limitation of each subject
                subject.section.push({
                    content:null,
                    content_title:null});
            }
        }

        $scope.edit = function(part){
            switch(part){
                case "title":
                    $scope.editTitle =true;
                    $scope.editTP.title = $scope.TP.title
                    break;
                case "summary":
                    $scope.editSummary =true;
                    $scope.editTP.content = $scope.TP.content
                    break;
            }
        }

        $scope.editM = function(moduleId){
            $scope.editingModule = moduleId;
            $scope.editModule =true;
        }

        $scope.cancel = function(part){
            switch(part){
                case "title":
                    $scope.editTitle =false;
                    break;
                case "summary":
                    $scope.editSummary =false;
                    break;
                case "option":
                    $scope.editOptions =false;
                    break;
                 case "category":
                    $scope.editTypeOptions =false;
                    break;
                case "module":
                    $scope.editingModule = null;
                    $scope.editModule =false;
                    break;
                case "NewModule":
                    $scope.newSubjectSection =false;
                    $scope.newsubject = {};
                    break;

            }
        }

        $scope.save = function(part){ //save teaching plan
            CurrentUser.get()
                .success(function(currentDetail) {
                    if(isSessionAlive(currentDetail)) {
                        //if is option pass the value to editTP
                        if(part=='option'){
                            $scope.editTP[part]={
                                    allow_collaboration_flag:$scope.TP.allow_collaboration_flag,
                                    public:$scope.TP.public
                                }
                        }else if(part=='category'){
                            $scope.editTP[part]={
                                    category:$scope.TP.category
                                }
                        }
                        
                        TeachingPlan.update({
                            id: $routeParams.id,
                            part_name : part,
                            part: part=='summary'?$scope.editTP['content']:$scope.editTP[part]
                        })

                        .success(function(e){
                            //call to reload the teaching plan
                            if(part=='title'||part=='summary'){
                                TeachingPlan.view({id: $routeParams.id})
                                .success(function(data) {

                                    $scope.TP = data;
                                    if(currentDetail==$scope.TP.user_id){
                                        $scope.deleteFlag =true;
                                    }

                                    /*
                                        polish data
                                    */
                                    //side list
                                    $scope.TP.title_node = $scope.TP.title_node==null || $scope.TP.title_node ==''? []:$scope.TP.title_node.split(",");//format string to node array list
                                    $scope.TP.node_list = $scope.TP.node_list==null || $scope.TP.node_list==''? []:$scope.TP.node_list.split(",");//format string to node array list

                                
                                })
                                .error(function(e) {
                                    console.log(e);
                                    alert("Couldn't load teaching plan. Please contact admin.");
                                });
                            }
                            //set edit flag back
                            $scope.cancel(part);
                        })
                        .error(function(e){
                            console.log(e);
                            alert('your teaching plan can not been updated, please contact admin');
                        });
                    }
                });
        }

        var validationFunction = function(data){
            //data check
            var valid = true;
            var alertMessage = '';
            if(!data){
                alertMessage += 'section can not be empty';
                valid = false;
            }else if(!data.content_title){
                alertMessage +='\nsection title could not be empty';
                valid = false;
            }else if(!data.content){
                alertMessage += '\n section content could not be empty';
                valid = false;
            }
            if(!valid){
                alert(alertMessage);
            }
            return valid;
        }

        $scope.saveM = function(moduleInfo){ //save module
            if(validationFunction(moduleInfo)){
                CurrentUser.get()
                    .success(function(currentDetail) {
                        if(isSessionAlive(currentDetail)) {

                            TeachingPlanModule.update({id: moduleInfo.id,
                                                part: moduleInfo } )
                                .success(function(e){

                                                        //load teaching plan
                                    TeachingPlan.view({id: $routeParams.id})
                                        .success(function(data) {
                                            /*
                                                polish data
                                            */
                                            //side list
                                            $scope.TP.title_node = data.title_node==null || data.title_node ==''? []:data.title_node.split(",");//format string to node array list
                                            $scope.TP.node_list = data.node_list==null || data.node_list==''? []:data.node_list.split(",");//format string to node array list
                                            $scope.TP.topic_list = data.topic_list;
                                        })
                                        .error(function(e) {
                                            console.log(e);
                                            alert("Couldn't load teaching plan. Please contact admin.");
                                        });

                                    //call to reload the teaching plan modules
                                    TeachingPlanModule.get({id: $routeParams.id})
                                         .success(function(data) {
                                            $scope.TPmodule = data;
                                            $scope.CurrentSubject=Object.keys($scope.TPmodule)[0];
                                        })
                                        .error(function(e) {
                                            console.log(e);
                                            alert("Couldn't load teaching plan module list. Please contact admin.");
                                        });
                                    
                                    //set edit flag back
                                    $scope.cancel("module");
                                })
                                .error(function(e){
                                    console.log(e);
                                    alert('your teaching plan can not been updated, please contact admin');
                                });
                        }
                    });
            }
        }

        $scope.tabChoose = function(subjectKey){
            $scope.CurrentSubject = subjectKey;
        }

        $scope.saveSubjectM = function(){ //save new module
            //validate data
            if(validationFunction($scope.newsubject)){
                CurrentUser.get()
                    .success(function(currentDetail) {
                        if(isSessionAlive(currentDetail)) {
                            $scope.newsubject.teaching_plan_id = $routeParams.id;
                            $scope.newsubject.user_id = currentDetail;
                            TeachingPlanModule.save($scope.newsubject)
                                .success(function(e){
                                    //reset new subject to null
                                    $scope.newsubject = {};

                                    //call to reload the teaching plan modules
                                    TeachingPlanModule.get({id: $routeParams.id})
                                         .success(function(data) {
                                            $scope.TPmodule = data;
                                            $scope.CurrentSubject=Object.keys($scope.TPmodule)[0];
                                        })
                                        .error(function(e) {
                                            console.log(e);
                                            alert("Couldn't load teaching plan module list. Please contact admin.");
                                        });
                                    
                                    //set edit flag back
                                    $scope.cancel("module");
                                    $scope.cancel("NewModule");
                                })
                                .error(function(e){
                                    console.log(e);
                                    alert('your teaching plan module can not been add, please contact admin');
                                });
                        }
                    });
            }
        }

        $scope.addSubjectSection = function() {
            $scope.newSubjectSection=true;
        }

        $scope.deleteM = function(moduleId){
            var confirmation = window.confirm("Are you sure you want to delete?");
            if (confirmation) {
                CurrentUser.get()
                    .success(function(currentDetail) {
                        if(isSessionAlive(currentDetail)) {
                            TeachingPlanModule.destroy({id:moduleId})
                                .success(function(e){
                                    //call to reload the teaching plan modules
                                    TeachingPlanModule.get({id: $routeParams.id})
                                         .success(function(data) {
                                            $scope.TPmodule = data;
                                            $scope.CurrentSubject=Object.keys($scope.TPmodule)[0];
                                           
                                        })
                                        .error(function(e) {
                                            console.log(e);
                                            alert("Couldn't load teaching plan module list. Please contact admin.");
                                        });
                                    
                                    //set edit flag back
                                    $scope.cancel("module");
                                    $scope.newSubjectSection=false;
                                    
                                })
                                .error(function(e){
                                    console.log(e);
                                    alert('your teaching plan module can not been delete, please contact admin');
                                });
                        }
                    });
            }
        }

        $scope.deleteSection = function(subjectsection){
            Object.keys(subjectsection).forEach(function(sec){
                subjectsection[sec].forEach(function(mod){
                    $scope.deleteM(mod.id);
                });
            });
        }

        $scope.deleteTP = function(){
            var confirmation = window.confirm("Are you sure you want to delete?");
            if (confirmation) {
                CurrentUser.get()
                    .success(function(currentDetail) {
                        if(isSessionAlive(currentDetail)) {
                            TeachingPlan.destroy({id:$routeParams.id})
                                .success(function(e){
                                    //redirect to list
                                    $location.path('/teachingplan');
                                })
                                .error(function(e){
                                    console.log(e);
                                    alert('your teaching plan can not been delete, please contact admin');
                                });
                        }
                    });
            }
        }
    }
]);

//upload image controller
dcopTPControllers.controller('UploadImageModalInstance',['$scope', '$modalInstance','ImageUpload', '$rootScope',
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
dcopTPControllers.directive('fileModel', ['$parse', function ($parse) {
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
