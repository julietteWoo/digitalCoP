<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Requests\PasswordRequest;
use App\Http\Requests;
use App\Models\Log;
use App\Models\User;
use Session;
use Auth;
use Mail;


class NavigatorController extends BaseFrameworkController 
{
	public $folder = "navigator";
	public $heading = "Navigator";
	public $subheading = "Navigator";

	// Dashboard
	public function dashboard(){

		if( Auth::user()!=null && Auth::user()->type == 'community'){
				return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_dashboard",'');

			//redirect to dashboard controller
			$dashboardController = new DashboardController();
			return $dashboardController->index();
		}
	}

	// forum
	public function forum(){
		if( Auth::user()!=null && Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_forum",'');

			//redirect to dashboard controller
			$forumController = new ForumController();
			return $forumController->index();
		}
	}

	// forum
	public function timesheet(){
		if( Auth::user()!=null && Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_timesheet", '');

			//redirect to dashboard controller
			$forumController = new TimesheetController();
			return $forumController->index();
		}
	}

	// teachingplan
	public function teachingplan(){
		if( Auth::user()!=null && Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_teachingplan", '');

			//redirect to dashboard controller
			$teachingplanController = new TeachingplanController();
			return $teachingplanController->index();
		}
	}

	// node
	public function node(){
		if( Auth::user()!=null && Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_node", '');

			//redirect to dashboard controller
			$nodeController = new NodeController();
			return $nodeController->index();
		}
	}

	// node
	public function publicDiscussion(){
		if( Auth::user()!=null && Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_publicDiscussion", '');

			//redirect to dashboard controller
			$publicDiscussionController = new PublicDiscussionController();
			return $publicDiscussionController->index();
		}	
	}


	// Profile
	public function profile(){
		if( Auth::user()!=null && Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_profile",'');

			//redirect to comment controller
			$profileController = new ProfileController();
			return $profileController->show();
		}
	}

	//profile update username
	public function profileupdate(Request $request){
		if( Auth::user()!=null && Auth::user()->type == 'community'){
			return null;
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_profileUpdate",'');

			//redirect to comment controller
			$profileController = new ProfileController();
			return $profileController->update($request);
		}
	}

		// Message
	public function message(Request $request){

		if( Auth::user()!=null && Auth::user()->type == 'community'){
				return redirect()->back();
		}else{
			//Add log
			$this->recordLog("LaravelMainNav_message",'');
			$input =  $request->all(); 
			unset($input['_token']);
			$userIDs = $input;
			unset($userIDs['message']);
			$userIDs= array_keys($userIDs);
			foreach($userIDs as $user){
				$user = User::find($user);

	 			//send email
		        Mail::raw($input['message'], function ($message) use ($user) {
    				$message->to($user['email'], $name = $user['name']);
    				$message->subject('New Information In DCoP by '.Auth::user()->name);
				});
			}
			
			return redirect()->back();
		}
	}



}