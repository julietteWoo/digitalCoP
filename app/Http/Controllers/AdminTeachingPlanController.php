<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\TeachingPlanModule;
use App\Models\TeachingPlan;
use App\Models\NodesTeachingPlan;
use App\Models\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\TeacherTeachingPlan;

use Auth;
use DB;

class AdminTeachingPlanController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "admin_teaching_plan";
	public $heading = "Admin Teaching Plan";
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $data = [
                "teaching_plan"=> $this->getTeachingPlanList()
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

    private function getTeachingPlanList(){
        return TeachingPlan::select("*")
                    ->get();
    }


    public function destroy(int $id, Request $request){
        //admin delete log
        Log::create(['user_id' => Auth::user()->id,
                        'function' => "AdminTeachingPlanController_Delete",
                        'data' =>""]);

        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $input = $request->all();
            if($input["type"]=='plan'){
                $teachingPlan = TeachingPlan::find($id);
                if(Auth::user()->type == 'admin'){

                    //get related topics
                    $planList = TeachingPlanModule::where('teaching_plan_id','=', $id)->get();
                    if(empty($planList) || sizeof($planList)==0){ //do nothing
                    }
                    else{
                        foreach($planList as $planmodule){
                            TeachingPlanModule::find($planmodule['id'])->delete();
                        }
                    }

                    /*
                        nodes_nodes
                    */
                    //delete nodes connection
                    foreach(explode(',' , $teachingPlan['title_node']) as $nodeName){
                        //find nodes
                        $titleNode = Node::where('nodes.name','=', $nodeName)->first();
                        if($titleNode){
                            foreach (explode(',' , $teachingPlan['node_list']) as $nodeListName){
                                $listNode = Node::where('nodes.name','=', $nodeListName)->first();
                                if($listNode){
                                    if($titleNode['id']>$listNode['id']){
                                        $this->nodesNodesCount($listNode['id'],$titleNode['id']);
                                    }else{
                                        $this->nodesNodesCount($titleNode['id'],$listNode['id']);
                                    }
                                }
                            }
                        }
                    }

                    /*
                        teaching_plan_nodes
                    */
                    //find all teaching plan nodes connection and delete
                    $nodeTeachingPlanList = NodesTeachingPlan::where('teaching_plan_id','=', $id)->get();
                    if(empty($nodeTeachingPlanList) || sizeof($nodeTeachingPlanList)==0){
                    }else{
                        foreach($nodeTeachingPlanList as $plannode){
                            NodesTeachingPlan::find($plannode['id'])->delete();
                        }
                    }

                    /*
                        nodes
                    */
                    //delete in node_list connection
                    if($teachingPlan['node_list']!= null){
                        $this->updateNodeCount($teachingPlan['node_list']);
                    }
                    
                    //delete in title_node connection
                    if($teachingPlan['title_node']!= null){
                        $this->updateNodeCount($teachingPlan['title_node']);
                    }


                    //delete teacher teaching plan
                    $teacherTeachibgPLan = TeacherTeachingPlan::where('teaching_plan_id','=',$id)->get();
                    foreach($teacherTeachibgPLan as $teacherTeachingplanConneciton){
                        $teacherTeachingplanConneciton->delete();
                    }


                    //delete teaching plan session setup
                    session()->flash('flash_message', $teachingPlan['title'] . ' has been deleted.');
                    //delete teaching plan
                    $teachingPlan->delete();

                }
            }else{
                return  "can not delete from admin";
            }

            return redirect()->action("AdminTeachingPlanController@index");
        }
    } 

    private function updateNodeCount(String $nodeList){
        foreach(explode(',' , $nodeList) as $nodeName){
            //find nodes
            $node = Node::where('nodes.name','=', $nodeName)->first();
            if($node){
                //decrease count;
                if($node['count']>1){
                    $node['count'] = $node['count']-1;
                    $node->update();
                }else{
                    $node->delete();
                }
            }
        }
    }

    private function nodesNodesCount(int $firstnode, int $secondnode){
        $nodeNode=NodesNode::where('first_node_id','=',$firstnode)
                            ->where('second_node_id','=',$secondnode)->first();
                if($nodeNode){
                    if($nodeNode['count']>1){
                        $nodeNode['count'] = $nodeNode['count']-1;
                        $nodeNode->update();
                    }else{
                        $nodeNode->delete();
                    }
                }
    }

}