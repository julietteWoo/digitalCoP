<?php

namespace App\Http\Controllers;

use App\comment;
use Illuminate\Http\Request;
use Response;
use App\Models\User;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTeachingPlan;
use App\Models\TeachingPlan;
use App\Models\TeachingPlanModule;
use Google\Cloud\Core\ServiceBuilder;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;
use Auth;
use DB;

class TeachingplanModuleAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI(Request $request)
    {

        $input = $request->all();
        
        $data = $this->getTeachingplanModuleList($input['id']);
        return $this->APIindex($data);
    }

    public function storeAPI(Request $request)
    {
        // set inputs
        $input = $request->all();
        //save teaching plan module fields
        $teachingplanmodule = TeachingPlanModule::create($input);

        //update teaching plan node list
         $this->updateTeachingPlanNodelist($teachingplanmodule['teaching_plan_id']);
        
        // finally return teachingplan module
        return $teachingplanmodule;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
     public function updateAPI(Request $request)
    {
        // set inputs
        $input = $request->all();

        //get teaching plan module
        $teachingplanmodule = TeachingPlanModule::find($input['id']);
        $teachingplanmodule['content'] = $input['part']['content'];
        $teachingplanmodule['content_title'] = $input['part']['content_title'];
        $teachingplanmodule['content_group'] = $input['part']['content_group'];
        //update teaching plan module
        $teachingplanmodule->update();

        //update node infomration in teaching plan
        $this->updateTeachingPlanNodelist($teachingplanmodule['teaching_plan_id']);

        return $teachingplanmodule;
        
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function destroyAPI(Request $request)
    {
        $input = $request->all();
        $teachingplanmodule = TeachingPlanModule::find($input['id']);
        $teachingplan = TeachingPlan::find($teachingplanmodule['teachingplan_id']);

        if(Auth::user()->id == $teachingplanmodule['user_id'] || Auth::user()->type == 'admin' || $teachingplan['allow_collaboration_flag'] ==1){
            $teachingplanmodule->delete();

            //update teaching plan node list
            $this->updateTeachingPlanNodelist($teachingplanmodule['teaching_plan_id']);
             
        }else{
            error_log('only the owner and admin can delete the module');
        }
    }

    // get list of teaching plan modules
    private function getTeachingplanModuleList(int $id){
        
        $teachingplanModuleList = TeachingPlanModule::select('teaching_plan_modules.id','teaching_plan_modules.subject_id','teaching_plan_modules.content_group','teaching_plan_modules.content_title','teaching_plan_modules.content','users.name as author','teaching_plan_modules.updated_at','subjects.subject')
                        ->join('users','user_id','=','users.id')
                        ->leftjoin('subjects','subject_id','=','subjects.id')
                        ->where('teaching_plan_modules.teaching_plan_id','=',$id)
                        ->get()
                        ->groupby('subject');

        foreach($teachingplanModuleList as $key => $teachingplanSubject){
            $teachingplanModuleList[$key] = $teachingplanSubject->groupby('content_group');
        }
        return $teachingplanModuleList;
    }


}