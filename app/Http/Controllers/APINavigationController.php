<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Requests\PasswordRequest;
use App\Http\Requests;
use App\Models\Log;
use Session;
use Auth;


class APINavigationController extends BaseAPIFrameworkController 
{

	// Reply List
	public function commentAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			//the function will be called after storeComment and update Comment
			$this->recordLog("commentAPI", serialize($request->all()));

			//redirect to comment controller
			$commentAPIController = new CommentAPIController();
			return $commentAPIController->indexAPI($request);
		}
	}

	// Reply Create
	public function storeCommentAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("storeCommentAPI", serialize($request->all()));

			//redirect to comment controller
			$commentAPIController = new CommentAPIController();
			return $commentAPIController->storeAPI($request);
		}
	}

	// Reply Update
	public function updateCommentAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("updateCommentAPI", serialize($request->all()));

			//redirect to comment controller
			$commentAPIController = new CommentAPIController();
			return $commentAPIController->updateAPI($request);
		}
	}

	// Reply destroy
	public function deleteCommentAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("deleteCommentAPI", serialize($request->all()));

			//redirect to comment controller
			$commentAPIController = new CommentAPIController();
			return $commentAPIController->destroyAPI($request);
		}
	}


	// Timesheet
	public function timesheet(){

		if( Auth::user()!=null && Auth::user()->type == 'community'){
				return null;
		}else{
			//Add log
			$this->recordLog("timesheetListAPI",'');

			//redirect to timesheet controller
			$timesheetController = new TimesheetAPIController();
			return $timesheetController->index();
		}
	}

	// Teaching plan module list
	public function teachingplanModuleAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("teachingplanModuleListAPI", '');

			//redirect to topic controller indexAPI function
			$teachingplanModuleAPIController = new TeachingplanModuleAPIController();
			return $teachingplanModuleAPIController->indexAPI($request);
		}
	}

	// Teachingplan Module Create
	public function storeTeachingplanModuleAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("storeTeachingplanModuleAPI", serialize($request->all()));

			//redirect to comment controller
			$teachingplanModuleAPIController = new TeachingplanModuleAPIController();
			return $teachingplanModuleAPIController->storeAPI($request);
		}
	}

	// Teachingplan module Update
	public function updateTeachingplanModuleAPI(Request $request){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			///Add log
			$this->recordLog("updateTeachingplanModuleAPI", serialize($request->all()));

			//redirect to topic controller
			$teachingplanModuleAPIController = new TeachingplanModuleAPIController();
			return $teachingplanModuleAPIController->updateAPI($request);
		}
	}

	// Teachingplan Module destroy
	public function deleteTeachingplanModuleAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("deleteTeachingplanModuleAPI", serialize($request->all()));

			//redirect to comment controller
			$teachingplanModuleAPIController = new TeachingplanModuleAPIController();
			return $teachingplanModuleAPIController->destroyAPI($request);
		}
	}

	// Teaching plan list
	public function teachingplanAPI(){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("teachingplanListAPI", '');

			//redirect to topic controller indexAPI function
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->indexAPI();
		}
	}

	// Create New teaching plan 
	public function storeTeachingplanAPI(Request $request){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("storeTeachingplancAPI", serialize($request->all()));

			//redirect to topic controller storeAPI function
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->storeAPI($request);
		}
	}

	// View single teachingplam
	public function singleTeachingplanAPI(Request $request){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("singleTeachingplanAPI", serialize($request->all()));

			//redirect to topic controller viewAPI function
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->viewAPI($request);
		}
	}

	// Teachingplan Update
	public function updateTeachingplanAPI(Request $request){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			///Add log
			$this->recordLog("updateTeachingplanAPI", serialize($request->all()));

			//redirect to topic controller
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->updateAPI($request);
		}
	}

	// Teachingplan destroy
	public function deleteTeachingplanAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("deleteTeachingplanAPI", serialize($request->all()));

			//redirect to teaching plan controller
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->destroyAPI($request);
		}
	}


	// Teacher Teachingplan create
	public function addTeacherTeachingplanAPI(Request $request){
		if( Auth::user()->type =='admin'){ //only admin do 
			//Add log
			$this->recordLog("addTeacherTeachingplanAPI", serialize($request->all()));

			//redirect to teaching plan controller
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->addTeacherAPI($request);
		}else{
			return null;
		}
	}

	// Teacher Teachingplan delete
	public function deleteTeacherTeachingplanAPI(Request $request){
		if( Auth::user()->type =='admin'){ // only admin do 
			//Add log
			$this->recordLog("deleteTeacherTeachingplanAPI", serialize($request->all()));

			//redirect to teaching plan controller
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->deleteTeacherAPI($request);
		}else{
			return null;
		}
	}

	// Teacher list for teacher teachingplan
	public function getListTeacherTeachingplanAPI(Request $request){
		if( Auth::user()->type =='admin'){ // only admin do 
			//Add log
			$this->recordLog("getlistTeacherTeachingplanAPI", serialize($request->all()));

			//redirect to teaching plan controller
			$teachingplanAPIController = new TeachingplanAPIController();
			return $teachingplanAPIController->getTeacherListAPI($request);
		}else{
			return null;
		}
	}


	// Forum subject list
	public function subjectAPI(){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("subjectAPI", '');
			//redirect to topic controller indexAPI function
			$subjectAPIController = new SubjectAPIController();
			return $subjectAPIController->indexAPI();
		}
	}

	// Forum topic list
	public function topicAPI(){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("topicListAPI", '');

			//redirect to topic controller indexAPI function
			$topicAPIController = new TopicAPIController();
			return $topicAPIController->indexAPI();
		}
	}

	// Forum single topic
	public function singleTopicAPI(Request $request){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("singleTopicAPI", serialize($request->all()));

			//redirect to topic controller viewAPI function
			$topicAPIController = new TopicAPIController();
			return $topicAPIController->viewAPI($request);
		}
	}

	// Create New Topic in Forum
	public function storeTopicAPI(Request $request){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("storeTopicAPI", serialize($request->all()));

			//redirect to topic controller storeAPI function
			$topicAPIController = new TopicAPIController();
			return $topicAPIController->storeAPI($request);
		}
	}

	// Topic Update
	public function updateTopicAPI(Request $request){

		if( Auth::user()==null ||Auth::user()->type == 'community'){
			return null;
		}else{
			///Add log
			$this->recordLog("updateTopicAPI", serialize($request->all()));

			//redirect to topic controller
			$topicAPIController = new TopicAPIController();
			return $topicAPIController->updateAPI($request);
		}
	}


	// Forum topic list
	public function discussionAPI(){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			//this function will be called after update and create topic
			$this->recordLog("discussionListAPI", '');

			//redirect to topic controller indexAPI function
			$DiscussionAPIController = new PublicDiscussionAPIController();
			return $DiscussionAPIController->indexAPI();
		}
		
	}

	// Forum single topic
	public function singleDiscussionAPI(Request $request){

		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("singleDiscussionAPI", serialize($request->all()));

			//redirect to topic controller viewAPI function
			$DiscussionAPIController = new PublicDiscussionAPIController();
			return $DiscussionAPIController->viewAPI($request);
		}
		
	}

	// Create New Topic in Forum
	public function storeDiscussionAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("storeDisccusionAPI", serialize($request->all()));

			//redirect to topic controller storeAPI function
			$DiscussionAPIController = new PublicDiscussionAPIController();
			return $DiscussionAPIController->storeAPI($request);
		}
	}

	// Topic Update
	public function updateDiscussionAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			///Add log
			$this->recordLog("updateDiscussionAPI", serialize($request->all()));

			//redirect to topic controller
			$DiscussionAPIController = new PublicDiscussionAPIController();
			return $DiscussionAPIController->updateAPI($request);
		}
	}

	// Node information list
	public function singleNodeAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("singleNodeAPI", serialize($request->all()));

			//redirect to topic controller
			$nodeAPIController = new NodeAPIController();
			return $nodeAPIController->viewAPI($request);
		}
	}

	// Node information list
	public function nodeAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("nodeAPI", serialize($request->all()));

			//redirect to topic controller
			$nodeAPIController = new NodeAPIController();
			return $nodeAPIController->indexAPI($request);
		}
	}

		// Reply Create
	public function newNodeAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("newNodeAPI", serialize($request->all()));

			//redirect to comment controller
			$nodeAPIController = new NodeAPIController();
			return $nodeAPIController->storeAPI($request);
		}
	}

	//upload image
	public function uploadImageAPI(Request $request){
		if( Auth::user()==null || Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$data = ['name' => 'no file!' ];

			if ($request->hasFile('image')) {
			    $data['name'] = $request->file('image')->getClientOriginalName();
			} 

			$this->recordLog("uploadImage", serialize($data));

			//redirect to image controller
			$imageAPIController = new ImageAPIController();
			return $imageAPIController->storeAPI($request);
		}
	}

}