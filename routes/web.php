<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('home');
})->name('/');

Route::get('/terms', function () {
    return view('term_of_use');
})->name('terms');

Route::get('/privacypolicy', function () {
    return view('privacy_policy');
})->name('privacypolicy');

Route::get('/public', function () {
    return view('public_community');
})->name('public');

Auth::routes();

Route::get('/forum', 'NavigatorController@forum')->name('forum');
Route::get('/node', 'NavigatorController@node')->name('node');
Route::get('/teachingplan', 'NavigatorController@teachingplan')->name('teachingplan');
Route::get('/publicdiscussion', 'NavigatorController@publicDiscussion')->name('publicDiscussion');
Route::get('/timesheet', 'NavigatorController@timesheet')->name('timesheet');

Route::get('/dashboard','NavigatorController@dashboard')->name('dashboard');
//Route::get('/adminmanagement','NavigatorController@adminManagement')->name('adminManagement');

//profile page
Route::get('/profile','NavigatorController@profile' );
Route::post('/profile','NavigatorController@profileupdate' );

// admin Controllers
Route::resource('adminmanagement','AdminController');
Route::resource('adminreplymanagement','AdminReplyController');

Route::post('nodemanagement', 'AdminNodeController@update');
Route::resource('nodemanagement','AdminNodeController',['except'=>['update', 'store']]);
Route::resource('usermanagement','AdminUserController');
Route::resource('subjectmanagement','AdminSubjectController');
Route::resource('teachingplanmanagement','AdminTeachingPlanController');

//email function
Route::post('message', 'NavigatorController@message');


//api route for angular
//current user
Route::get('/api/getUser', 'APINavigationController@getCurrentUser')->name('getCurrentUser');


//timesheets
Route::get('/api/timesheetsapi', 'APINavigationController@timesheet')->name('timesheet');//submit a timesheet

//topic
Route::get('/api/topicsapi', 'APINavigationController@topicAPI')->name('topicAPI'); //get topic list
Route::post('/api/topicsapi', 'APINavigationController@storeTopicAPI')->name('storeTopicAPI');//save a topic
Route::post('/api/topicapi', 'APINavigationController@singleTopicAPI')->name('singleTopicAPI'); //get single topic
Route::post('/api/updatetopicsapi', 'APINavigationController@updateTopicAPI')->name('updateTopicAPI');//update a topic

//teachingplan
Route::get('/api/teachingplansapi', 'APINavigationController@teachingplanAPI')->name('teachingplanAPI'); //get teaching plan list
Route::post('/api/teachingplansapi', 'APINavigationController@storeTeachingplanAPI')->name('storeTeachingplanAPI'); //save a teaching plan
Route::post('/api/teachingplanapi', 'APINavigationController@singleTeachingplanAPI')->name('singleTeachingplanAPI'); //get single teaching plan
Route::post('/api/updateteachingplansapi', 'APINavigationController@updateTeachingplanAPI')->name('updateTeachingplanAPI');//update a teaching plan
Route::post('/api/deleteteachingplanapi', 'APINavigationController@deleteTeachingplanAPI')->name('deleteTeachingplanAPI');//delete teachingplan 
Route::post('/api/addteacherteachingplanapi', 'APINavigationController@addTeacherTeachingplanAPI')->name('addTeacherTeachingplanAPI');//add teacher teachingplan 
Route::post('/api/deleteteacherteachingplanapi', 'APINavigationController@deleteTeacherTeachingplanAPI')->name('deleteTeacherTeachingplanAPI');//delete teacher teachingplan 
Route::post('/api/getlistteacherteachingplanapi', 'APINavigationController@getListTeacherTeachingplanAPI')->name('getListTeacherTeachingplanAPI');//get teacher list for teachingplan 



//teachingplan modules
Route::post('/api/teachingplanmodulesapi', 'APINavigationController@teachingplanModuleAPI')->name('teachingplanmoduleAPI'); //get teaching plan module list
Route::post('/api/updateteachingplanmodulesapi', 'APINavigationController@updateTeachingplanModuleAPI')->name('updateTeachingplanModuleAPI');//update a teaching plan module
Route::post('/api/teachingplanmoduleapi', 'APINavigationController@storeTeachingplanModuleAPI')->name('storeTeachingplanModuleAPI');//save a teachingplan module
Route::post('/api/deleteteachingplanmoduleapi', 'APINavigationController@deleteTeachingplanModuleAPI')->name('deleteTeachingplanModuleAPI');//delete teachingplan module

//subject
Route::get('/api/subjectsapi', 'APINavigationController@subjectAPI')->name('subjectAPI'); //get subject list

//comment and reply
Route::post('/api/commentsapi', 'APINavigationController@commentAPI')->name('forumAPI');//get comment list of certain topic
Route::post('/api/commentapi', 'APINavigationController@storeCommentAPI')->name('storeCommentAPI');//save a comment
Route::post('/api/updatecommentapi', 'APINavigationController@updateCommentAPI')->name('updateCommentAPI');//update a comment of certain topic
Route::post('/api/deletecommentsapi', 'APINavigationController@deleteCommentAPI')->name('deleteCommentAPI');//delete comment list of certain topic

//node
Route::post('/api/nodeapi', 'APINavigationController@singleNodeAPI')->name('singleNode');//delete comment list of certain topic
Route::post('/api/nodesapi', 'APINavigationController@nodeAPI')->name('nodeAPI'); //get node list 
Route::post('/api/newnodeapi', 'APINavigationController@newNodeAPI')->name('newNodeAPI');

//upload image
Route::post('/api/imageapi', 'APINavigationController@uploadImageAPI')->name('uploadImage');//upload image

//discussion
Route::get('/api/discussionapi', 'APINavigationController@discussionAPI')->name('discussionAPI'); //get discussion list
Route::post('/api/discussionsapi', 'APINavigationController@storeDiscussionAPI')->name('storeDiscussionAPI');
Route::post('/api/discussionapi', 'APINavigationController@singleDiscussionAPI')->name('singleDiscussionAPI'); //get single discussion
Route::post('/api/updateddiscussionapi', 'APINavigationController@updateDiscussionAPI')->name('updateDiscussionAPI');//update a discussion

//public page, No Authentication
Route::post('/api/publicnodeapi', 'PublicAPIController@viewAPI')->name('singleNodePublic');//delete comment list of certain topic
Route::post('/api/publicnodesapi', 'PublicAPIController@indexAPI')->name('infoAPIPublic'); //get node info
Route::post('/api/publicdiscussionapi', 'PublicAPIController@discussionViewAPI')->name('discussionAPIPublic'); //get node info
Route::post('/api/publiccommentsapi', 'PublicAPIController@commentAPI')->name('replyAPIPublic');//get comment list of certain topic
Route::post('/api/publiccommentapi', 'PublicAPIController@commentStoreAPI')->name('replyAddAPIPublic');//create comment
Route::post('/api/publicupdatecommentapi', 'PublicAPIController@updateCommentAPI')->name('updateCommentPublicAPI');//update a comment
Route::post('/api/publicdeletecommentsapi', 'PublicAPIController@deleteCommentAPI')->name('deleteCommentPublicAPI');//delete comment list of certain topic





