<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\TeachingPlanModule;
use App\Models\Subject;
use App\Models\Log;
use Illuminate\Support\Facades\Hash;

use Auth;
use DB;

class AdminSubjectController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "subject";
	public $heading = "Admin Subject";
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $data = [
                "subjects"=> $this->getSubjectList()
            ];

            return $this->renderindex($data);
        }

    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $dataSet = [
                "userType" => $this->userType
            ];
            return $this->rendercreate($dataSet);
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
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            //validate input
            $request->validate([
                'subject' => 'required',
                'subject_group' => 'required'
            ]);

            $input = $request->all();
            $subject=Subject::create($input);

            session()->flash('flash_message', $subject->subject . ' has been created.');
            return redirect('/subjectmanagement');
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function edit(comment $comment)
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
    public function update(Request $request, comment $comment)
    {
        //
    }

    private function getSubjectList(){
        return Subject::select("subjects.id",'subjects.subject',"subjects.subject_group")
                    ->get();
    }


    public function destroy(int $id, Request $request){
        //admin delete log
        Log::create(['user_id' => Auth::user()->id,
                        'function' => "AdminSubjectController_Delete",
                        'data' =>""]);

        if(Auth::user()->type == 'admin'){
            $input = $request->all();
            if($input["type"]=='subject'){
                $subject = Subject::find($id);
                if(Auth::user()->type == 'admin'){

                    //get related topics
                    $planList = TeachingPlanModule::where('subject_id','=', $subject['id'])->get();
                    if(empty($planList) || sizeof($planList)==0){
                        //delete subject
                        session()->flash('flash_message', $subject->subject . ' has been deleted.');
                        $subject->delete();
                    }
                    else{
                        session()->flash('flash_message', $subject->subject . ' can not be deleted.');
                        
                    }
                }
            }else{
                return  "can not delete from admin";
            }

            return redirect()->action("AdminSubjectController@index");
        }
    } 

}