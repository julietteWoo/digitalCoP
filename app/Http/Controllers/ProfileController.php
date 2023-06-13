<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Topic;
use App\Models\TeachingPlan;
use App\Models\TeachingPlanModule;
use App\Models\Subject;
use App\Models\User;
use App\Models\Log;

use Auth;
use DB;

class ProfileController extends BaseFrameworkController
{

    public $folder = "profile";
    public $heading = "Profile";

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show()
    {

        if(Auth::user()!=null){

            $user=Auth::user()->id;

            $data = [
            // // top bar items
            'id' => $user,
            'subject' => $this->getSubject($user),
            'teaching_plans' => $this->getTeachingplanList(), //co_plan
            'user_teaching_plans' => $this->getUserTeachingplanList(), //user planed
            'topics' => $this->getTopicsList(), //in comment
            'user_topics' => $this->getUserTopicsList(), //user created
            'public_board' => $this->getPublicBoardList(),
            'user_public_board' => $this->getUserPublicBoardList(),
            ];



            // return $data;
            return $this->rendershow($data);
        }
        
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        //get user
        $input = $request->all();
        $user = User::find(Auth::user()->id);
        $user['name'] = $input['username'];
        $user->update();
        return redirect()->action("NavigatorController@profileupdate");
    }


    //________DATA support function
    private function getSubject(int $id){

    	//TODO :subject
    	$subjectTPlist = Subject::select('subjects.id','subjects.subject','subjects.subject_group','teaching_plans.id as teachingplan')
                        ->rightjoin('teaching_plan_modules','teaching_plan_modules.subject_id','=','subjects.id')
                        ->leftjoin('teaching_plans','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
                        ->where(function($query) use ($id){
                             return $query->where('teaching_plans.user_id' ,'=', $id)
                                            ->orWhere('teaching_plan_modules.user_id' ,'=', $id);
                        })
                        ->groupby('subjects.id') 
                        ->groupby('teaching_plans.id') 
                        ->get();
        $subjectList = $subjectTPlist->groupby('subject');
        $totalSubjectTP = count($subjectTPlist);

        $colorIndex = ["progress-bar","progress-bar-primary","progress-bar-success","progress-bar-danger","progress-bar-warning"];
        $index = 0;

        foreach( $subjectList as $key=> $subjectTP){
            $indexNumber = $index%5;
            $index ++;
            $subjectList[$key] = ['subject_group' => $subjectTP[0]['subject_group'],
                                    'count' => count($subjectTP),
                                    'color' => $colorIndex[$indexNumber],
                                    'percentage' =>round((count($subjectTP)*100/$totalSubjectTP),2).'%',
                                    'number' =>round((count($subjectTP)*100/$totalSubjectTP),2)];
        }
    	return $subjectList;
    }

    // get list of teaching plans user joined
    private function getTeachingplanList(){
        
        $teachingplanList = TeachingPlan::select('teaching_plans.id','teaching_plans.title','teaching_plans.allow_collaboration_flag', 'teaching_plans.public','users.name as author','teaching_plans.updated_at')
                        ->join('users','user_id','=','users.id')
                        ->join('teaching_plan_modules','teaching_plan_id','=','teaching_plans.id')
                        ->where('teaching_plan_modules.user_id','=',Auth::user()->id)
                        ->where('teaching_plans.user_id','!=',Auth::user()->id)
                        ->groupby('teaching_plans.id')
                        ->orderBy('teaching_plans.updated_at','Desc')
                        ->get();
        return $teachingplanList;
    }

     // get list of teaching plans of the users
    private function getUserTeachingplanList(){
        
        $teachingplanList = TeachingPlan::select('teaching_plans.id','teaching_plans.title','teaching_plans.allow_collaboration_flag', 'teaching_plans.public','teaching_plans.updated_at')
                        ->join('users','user_id','=','users.id')
                        ->where('teaching_plans.user_id','=', Auth::user()->id)
                        ->groupBy('teaching_plans.id')
                        ->orderBy('teaching_plans.updated_at','Desc')
                        ->get();
        return $teachingplanList;
    }

    // get list of topics user joined
    private function getTopicsList(){
        
        $topicList = Topic::select('topics.id','title','users.name as author','topics.updated_at', DB::raw('Count(replies.id) as replies'))
                         ->join('users','user_id','=','users.id')
                         ->where('topics.public','!=','public')
                         ->leftJoin('replies','topics.id','=','replies.topic_id')
                         ->where('replies.user_id','=',Auth::user()->id)
                         ->groupBy('topics.id')
                         ->orderBy('topics.updated_at','Desc')
                        ->get();
        return $topicList;
    }

    // get list of topics
    private function getUserTopicsList(){
        
        $topicList = Topic::select('topics.id','title','users.name as author','topics.updated_at', DB::raw('Count(replies.id) as replies'))
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','!=','public')
                        ->where('topics.user_id','=', Auth::user()->id)
                        ->leftJoin('replies','topics.id','=','replies.topic_id')
                        ->groupBy('topics.id')
                        ->orderBy('topics.updated_at','Desc')
                        ->get();
        return $topicList;
    }

    // get list of topics user joined
    private function getPublicBoardList(){
        
        $topicList = Topic::select('topics.id','title','users.name as author','topics.updated_at', DB::raw('Count(replies.id) as replies'))
                         ->join('users','user_id','=','users.id')
                         ->where('topics.public','=','public')
                         ->leftJoin('replies','topics.id','=','replies.topic_id')
                         ->where('replies.user_id','=',Auth::user()->id)
                         ->groupBy('topics.id')
                         ->orderBy('topics.updated_at','Desc')
                        ->get();
        return $topicList;
    }

    // get list of topics
    private function getUserPublicBoardList(){
        
        $topicList = Topic::select('topics.id','title','users.name as author','topics.updated_at', DB::raw('Count(replies.id) as replies'))
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','=','public')
                        ->where('topics.user_id','=', Auth::user()->id)
                        ->leftJoin('replies','topics.id','=','replies.topic_id')
                        ->groupBy('topics.id')
                        ->orderBy('topics.updated_at','Desc')
                        ->get();
        return $topicList;
    }

}