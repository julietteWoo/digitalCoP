<?php

namespace App\Http\Controllers;

use App\comment;
use Illuminate\Http\Request;
use Response;
use App\Models\User;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\Topic;
use App\Models\TeachingPlan;
use App\Models\TeachingPlanModule;
use App\Models\TeacherTeachingPlan;
use App\Models\NodesTeachingPlan;
use Google\Cloud\Core\ServiceBuilder;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;
use Auth;
use DB;

class TeachingplanAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI(){
        $data = ['plans' =>$this->getTeachingplanList(),
                'userplans' =>$this->getUserTeachingplanList(),
                'studentplans' =>$this->getStudentPlanList(),
                'projectplans' =>$this->getProjectPlanList(),
                ];

        return $this->APIindex($data);
    }

    /**
     * Display a single resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function viewAPI(Request $request){
        $input = $request->all();

        $data = $this->getTeachingplan($input['id']);

        //return Response::json($data);
        return $this->APIview($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeAPI(Request $request){
        // set inputs
        $input = $request->all();
        $userid = Auth::user()->id;

        //pass value to title to make major tag
        $title = $input['title'];

        if(!array_key_exists("category",$input) ){//by default category is Student
            $input['category']="Student";
        }

        //call google entities
        $title = $this->googleEntity($title);
        $teachingplanData = [
            "public" => $input['public'],
            "title" => $input['title'],
            "allow_collaboration_flag" => $input['allow_collaboration_flag']=='true'? 1:0,
            "content" => $input['content'],
            "user_id" => $userid,
            "node_list" =>null,
            "title_node" => implode(",", $title['nodeList']),
            "category" => $input['category']
        ];

        //save the teaching plan
        $teachingplan = TeachingPlan::create($teachingplanData);
        //create teaching plan and Nodes connection
        $this->nodeInput($title, $teachingplan);
        
        //when the teacher create a student plan, the plan will automatically  set access to the teachers for my students plan
        if($input['category']=="Student"){
            $teacherTeachingPlanData = [
                "teacher_id" => $userid,
                "teaching_plan_id" => $teachingplan['id']
            ];
            $teacherTeachingPlan = TeacherTeachingPlan::create($teacherTeachingPlanData);

        }
        
        //set up teaching plan modules
        $moduleContent = $input['content']==null? '':$input['content'];
        if(array_key_exists('subjectSection',$input)){
            foreach( $input['subjectSection']as $subjectModule ){//loop subjectSection
                $subject = $subjectModule['subject']==0?null:$subjectModule['subject'];
                if(array_key_exists('section',$subjectModule)){
                    foreach($subjectModule['section'] as $teachingplanModule){ //loop section
                        if($teachingplanModule!=null){
                            $teachingplanModuleData = [
                                "subject_id"=> $subject,
                                'user_id' => $userid,
                                'teaching_plan_id' => $teachingplan['id'],
                                'content_title' => $teachingplanModule['content_title'],
                                'content_group' => array_key_exists('content_group',$teachingplanModule)? $teachingplanModule['content_group']:null,
                                'content' => $teachingplanModule['content']
                            ]; 
                            TeachingPlanModule::create($teachingplanModuleData);

                            $moduleContent = $moduleContent.$teachingplanModule['content'];
                        }
                    }
                }
            }
        }

        //ADD module node list
        //get all the module content and clean up
        $moduleContent = $this->cleanUpContent($moduleContent);

        //call google entities
        $response = $this->googleEntity($moduleContent);
        //remove same entity from title
        $response['nodeList'] = array_diff($response['nodeList'], $title['nodeList']);

        //add node list
        //input node and node connection with Teaching plan
        $this->nodeInput($response, $teachingplan);

        //add nodes connection for content to title only 
        $this->inputNodeConnection($title, $response);

        //update teaching plan
        $teachingplan['node_list'] = implode(",", $response['nodeList']);
        $teachingplan ->update();

        // finally return topic
        return $teachingplan;
        
    }

    /**

    **/

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
     public function updateAPI(Request $request){
        // set inputs
        $input = $request->all();

        $teachingplan = TeachingPlan::find($input['id']);
        if($input['part_name']=='title'||$input['part_name']=='summary'){
            if($input['part_name']=='summary'){
                $input['part_name']='content';
            }
            $teachingplan[$input['part_name']] = $input['part'];
            $teachingplan->update();

            //update node list
            if($input['part_name']=='title'){//title update
                $this->updateTeachingPlanTitleNode($teachingplan);
            }else{ // summary update
                $this->updateTeachingPlanNodelist($input['id']);
            }

        }else if($input['part_name']=='option'){
            $teachingplan['allow_collaboration_flag'] = $input['part']['allow_collaboration_flag']=='true'?1:0;
            $teachingplan['public'] = $input['part']['public'];
            $teachingplan->update();
        }else if($input['part_name']=='category'){
            /*
            when ever the plan change from project to student or student to project, teacher teaching plan will always keep the record for easy resume
            if($input['part']['category']!= "Student"){//the update is not a student plan
                //check if it is in the teacher teaching plan list, if yes delete, if no do nothing
            }elseif($input['part']['category']== "Student"){//update is a student plan
                //check if it is in the teacher teaching plan list, if yes do nothing, if no add in
            }
            */
            $teachingplan['category'] = $input['part']['category'];
            $teachingplan->update();


        }
        
        return $teachingplan;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function destroyAPI(Request $request){
        $input = $request->all();
        $teachingplan = TeachingPlan::find($input['id']);

        if(Auth::user()->id == $teachingplan['user_id'] || Auth::user()->type == 'admin'){
            //find all the teachingplan module
            $teachingplanmodules = TeachingPlanModule::select('*')
                                ->where('teaching_plan_id','=',$input['id'])
                                ->get();
            //delete all the related teachingplan module
            foreach($teachingplanmodules as $module){
                $module->delete();
            }

            //deconnect nodes
            $teachingplan['content'] = '';
            $teachingplan ->update();
            $this->updateTeachingPlanNodelist($input['id']);
            //find all the teaching plan node connection
            $nodeTeachingplan = NodesTeachingPlan::where('teaching_plan_id','=',$input['id'])->get();
            foreach($nodeTeachingplan as $nodeTeachingplanConneciton){
                $nodeTeachingplanConneciton->delete();
            }
            //delete or reduce count of each node
            foreach(explode(",", $teachingplan['title_node']) as $tpNode){
                //reduce or delete node
                $node=Node::where('name','=',$tpNode)->first();
                //if count more than one
                if($node && $node['count']>1){
                    $node['count'] = $node['count']-1;
                }else if($node && $node['count']<=1){
                    $node ->delete();
                }
            }

            //delete teacher teaching plan
            $teacherTeachibgPLan = TeacherTeachingPlan::where('teaching_plan_id','=',$input['id'])->get();
            foreach($teacherTeachibgPLan as $teacherTeachingplanConneciton){
                $teacherTeachingplanConneciton->delete();
            }

            //delete teaching plan
            $teachingplan->delete();
             
        }else{
            error_log('only the owner and admin can delete the plan');
        }
    }

    //add teacher to collaborative teaching plan
    public function addTeacherAPI(Request $request){

        $input = $request->all();
        $teachers = User::select("users.id")->get()->toArray();

        $teachers = array_map(function($teacher){
            return $teacher['id'];
        }, $teachers);
        //validate the input
        if(in_array($input['teacherId'], $teachers)){
            $teacherTeachingPlanList = TeacherTeachingPlan::select('teacher_id')->where('teacher_teaching_plans.teaching_plan_id','=',$input['id'])->get()->toArray();
            $teacherTeachingPlanList = array_map(function($teacher){
                return $teacher['teacher_id'];
            }, $teacherTeachingPlanList);
            if(!in_array($input['teacherId'],$teacherTeachingPlanList)){

                $insert=[ 
                    "teacher_id" => $input['teacherId'],
                    "teaching_plan_id" => $input['id']
                ];
                // save topic fields
                $TeacherTeachingPlan = TeacherTeachingPlan::create($insert);
            }

            return "done";
        }

        //if( $input["teacherId"] )
       
        // if($teacherTeachingPlan==null){

        // }
        return $teachers;
    }

    //delete teacher from collaborative teaching plan
    public function deleteTeacherAPI(Request $request){

        $input = $request->all();
        return null;
    }

    //get teacher list for adding to collaborative teaching plan
    public function getTeacherListAPI(Request $request){

        $input = $request->all();
        $teacherTeachingPlan = TeacherTeachingPlan::select("teacher_id")->where("teaching_plan_id","=",$input['id'])->get();
        $teachers = User::select("users.name", "users.id")
                        ->whereNotIn('users.id', $teacherTeachingPlan)
                        ->get();
        return $teachers;
    }

    //update nodes connection to teaching plan title
    private function updateTeachingPlanTitleNode($teachingplan){
        $originalTitleNodes = explode(",",$teachingplan['title_node']);
        $tpTitleNode = $this->googleEntity($teachingplan['title']);
        $moduleNode = explode(",",$teachingplan['node_list']);

        //update teachibgplan title_node
        $teachingplan['title_node'] = implode(",", $tpTitleNode['nodeList']);
        $teachingplan ->update();

        //remove duplicate with node list
        $tpTitleNode = array_diff($tpTitleNode['nodeList'], $moduleNode);

        $diffNodesFromOrigin = array_diff($originalTitleNodes, $tpTitleNode); //nodes that in Origin but not in new
        $diffNodesFromNew = array_diff($tpTitleNode, $originalTitleNodes); //nodes that in new but not in Origin

        //delete nodes in $diffNodesFromOrigin
        if(sizeof($diffNodesFromOrigin)!=0){
            foreach($diffNodesFromOrigin as $nodeToDelete){
                if($nodeToDelete!=null && $nodeToDelete!=''){
                    $nodeTPEntity = NodesTeachingPlan::select('nodes_teaching_plans.id')
                                    ->join('nodes','node_id','=','nodes.id')
                                    ->where('nodes_teaching_plans.teaching_plan_id','=', $teachingplan['id'])
                                    ->where('nodes.name','=', $nodeToDelete)
                                    ->first();
                    //get node id
                    $titleNode = Node::where('name', '=', $nodeToDelete)->first();

                    //update node Teaching plan //if the node not exit in title and node list then delete, otherwise keep
                    if($nodeTPEntity && !in_array($nodeToDelete, $moduleNode)){
                        $nodeTPEntity->delete();
                    }

                    //update the nodes_node
                    foreach($moduleNode as $key => $startPoint){
                        if($startPoint!=null && $startPoint!=''){
                            //get topic node id
                            $tpNodeID = Node::where('name','=',$startPoint)
                                        ->first();

                            if(!$tpNodeID){//if tp node is not exist/ remove from the title_nodes
                                $this->resetTeachingPlanNodes($moduleNode, $key, $teachingplan);
                            }else{//if exist, decrease or delete connection
                                $tpNodeID = $tpNodeID['id'];

                                //compare node_id
                                if($tpNodeID>$titleNode['id']){
                                    $nodesNodeEntity = NodesNode::where('first_node_id','=',$titleNode['id'])
                                                    ->where('second_node_id','=',$tpNodeID)
                                                    ->first();
                                    $this->decreaseNodeCount($nodesNodeEntity);
                                }else if($titleNode['id']>$tpNodeID){
                                    $nodesNodeEntity = NodesNode::where('first_node_id','=',$tpNodeID)
                                                    ->where('second_node_id','=',$titleNode['id'])
                                                    ->first();
                                    $this->decreaseNodeCount($nodesNodeEntity);
                                }
                            }
                        }
                    }

                    //update the node
                    if($titleNode['count']>1){
                        $titleNode['count'] = $titleNode['count']-1;
                        $titleNode->save();
                    }else if($titleNode['count']==1){
                        $titleNode->delete();
                    }
                }
            }
        }

        //add nodes in $diffNodesFromOrigin
        if(sizeof($diffNodesFromNew)!=0){
            foreach($diffNodesFromNew as $nodeToAdd){
                if($nodeToAdd!=null && $nodeToAdd!=''){
                    //find node or create node
                    $nodeEntityToAdd = Node::where('name', '=', $nodeToAdd)->first();

                    if ($nodeEntityToAdd === null) { //not exist, to create
                        $nodeEntityToAdd = Node::create(['name'=>$nodeToAdd, 'count'=>1]);

                        //create node topic connection
                        $nodeTeachingPlanEntityToAdd = NodesTeachingPlan::create(['node_id'=>$nodeEntityToAdd['id'], 'teaching_plan_id'=> $teachingplan['id']]);

                        //create node node connection to each topic start point nodes
                        foreach($moduleNode as $key => $startPoint){
                            if($startPoint!=null && $startPoint!=''){
                                //get starPoint ID
                                $tpNodeID = Node::where('name','=',$startPoint)->first();

                                if($tpNodeID===null){//if not exsit
                                    $this->resetTeachingPlanNodes($moduleNode, $key, $teachingplan);
                                }else{
                                    $tpNodeID = $tpNodeID['id'];

                                    //create node node
                                    $nodesNodeEntityToAdd = NodesNode::create(['first_node_id'=>$tpNodeID,'second_node_id'=>$nodeEntityToAdd['id'] ,'count'=>1]);
                                }
                            }
                        }
                    }else{
                        //exist add count
                        $nodeEntityToAdd['count']=$nodeEntityToAdd['count']+1;
                        $nodeEntityToAdd->save();

                        //create node topic connection
                        //find if exist
                        $nodeTeachingPlanEntityToAdd = NodesTeachingPlan::where('node_id', '=', $nodeEntityToAdd['id'])
                                                ->where('teaching_plan_id','=',$teachingplan['id'])
                                                ->first();
                        
                        if ($nodeTeachingPlanEntityToAdd === null) {
                            //not exist, to create
                            $nodeTeachingPlanEntityToAdd = NodesTeachingPlan::create(['node_id'=>$nodeEntityToAdd['id'], 'teaching_plan_id'=>$teachingplan['id']]);
                        }//else do nothing

                        //create node node connection to each topic start point nodes
                        foreach($moduleNode as $key => $startPoint){
                            if($startPoint!=null && $startPoint!=''){
                                //get starPoint ID
                                $tpNodeID = Node::where('name','=',$startPoint)->first();

                                if($tpNodeID===null){
                                    $this->resetTeachingPlanNodes($moduleNode, $key, $teachingplan);
                                }else{
                                    $tpNodeID = $tpNodeID['id'];

                                    //compare id 
                                    if($nodeEntityToAdd['id']>$tpNodeID){ 
                                        $this->createNodesNode($tpNodeID, $nodeEntityToAdd['id']);
                                    }else if($tpNodeID>$nodeEntityToAdd['id']){
                                        $this->createNodesNode($nodeEntityToAdd['id'], $tpNodeID);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private function resetTeachingPlanNodes($tpNodes, $key, $tp){
        //delete node in $topicStartNodes
        unset($tpNodes[$key]);
        // get teaching plan
        //update $title nodes
        $tp['node_list'] = implode(",", $tpNodes);
        $tp->save();
    }

    private function getlist(){
        $teachingplanList = TeachingPlan::select('teaching_plans.id','teaching_plans.title','teaching_plans.allow_collaboration_flag', 'users.name as author','teaching_plans.updated_at')
                        ->join('users','user_id','=','users.id')
                        ->groupBy('teaching_plans.id')
                        ->orderBy('teaching_plans.updated_at','Desc');
        return $teachingplanList;
    }
    // get list of teaching plans
    private function getTeachingplanList(){
        $userType=Auth::user()->type;
        $teachingplanList = $this->getlist()
                        ->where(function($query) use ($userType){
                            if($userType!="admin"){
                                $query->where('teaching_plans.public','=','Public');
                            }else{
                                $query->where('teaching_plans.public','=','Public');
                            }
                        })
                        ->get();
        return $teachingplanList;
    }

    //get list of student learning plan
    private function getStudentPlanList(){
        $userType=Auth::user()->type;
        if($userType!="admin"){
            $teacherTeachingplanList =TeacherTeachingPlan::select('teaching_plan_id')
                                    ->where('teacher_id','=',Auth::user()->id)
                                    ->get();
            $teachingplanList = TeachingPlan::select('teaching_plans.id','teaching_plans.title','teaching_plans.updated_at')
                        ->whereIn('teaching_plans.id',$teacherTeachingplanList)
                        ->groupBy('teaching_plans.id')
                        ->orderBy('teaching_plans.updated_at','Desc')
                        ->get();                        
        }else{
            $teachingplanList = $this->getlist()
                                    ->where('teaching_plans.category','=','Student')
                                    ->get();
        }

        $teachingplanList = array_map(function($a){
                return [
                    'id' => $a["id"],
                    'title' => $a["title"],
                    'updated_at'=>$a["updated_at"],
                    'teacherList' =>$this->getCollaborationTeacherList($a["id"])
                ];
            }, $teachingplanList->toArray());


       return $teachingplanList;
        
    }

    //get list of collaboration teachers for the student plan
    private function getCollaborationTeacherList($id){
        return $teacherTeachibgPlan = TeacherTeachingPlan::select('users.name', 'users.email', 'users.id')
                                ->join('users','teacher_id','=','users.id')
                                ->where('users.name','!=','testeacher')
                                ->where('teaching_plan_id','=',$id)
                                ->get();
    }

    //get list of project plan
    private function getProjectPlanList(){
        $userType=Auth::user()->type;
        $teachingplanList = $this->getlist()
                        ->where('teaching_plans.category','!=','Student')
                        ->orWhere('teaching_plans.category','=',null)
                        ->get();
        return $teachingplanList;
    }

    // get list of teaching plans of the users
    private function getUserTeachingplanList(){
        
        $teachingplanList = TeachingPlan::select('teaching_plans.id','teaching_plans.title','teaching_plans.allow_collaboration_flag', 'teaching_plans.public','teaching_plans.updated_at')
                        ->join('users','user_id','=','users.id')
                        ->where('users.id','=', Auth::user()->id)
                        ->groupBy('teaching_plans.id')
                        ->orderBy('teaching_plans.updated_at','Desc')
                        ->get();
        return $teachingplanList;
    }

    //get single teaching plan
    private function getTeachingplan(int $id){
        
        $teachingplan = TeachingPlan::select('teaching_plans.id','users.id','users.name as author','teaching_plans.title','teaching_plans.title_node','teaching_plans.content','teaching_plans.updated_at', 'teaching_plans.public', 'teaching_plans.allow_collaboration_flag','teaching_plans.node_list','teaching_plans.user_id','teaching_plans.category')
                        ->join('users','user_id','=','users.id')
                        ->where('teaching_plans.id','=', $id)
                        ->get()
                        ->first();

        $teachingplan['allow_collaboration_flag']=$teachingplan['allow_collaboration_flag']==1?true:false;

        //get topic list
        $teachingplanNodesList = NodesTeachingPlan::select('node_id')->where('teaching_plan_id','=',$id)->get();
        $teachingplan['topic_list'] = Topic::select('topics.id','topics.title')
                                        ->join('nodes_topics','topic_id','=','topics.id')
                                        ->whereIn('node_id',$teachingplanNodesList)
                                        ->get();
        return $teachingplan;
    }

    //input node data
    private function nodeInput($arr, $teachingplan){
        foreach($arr['nodeList'] as $nodeEntity){
            $node = Node::where('name', '=', $nodeEntity)->first();

            if($node===null){ //if not exist
                $node['name'] = $nodeEntity;
                $node['count'] = 1;
                $node = Node::create($node);

            }else{ //if exist
                $node['count'] = $node['count']+1;
                $node->update((array)$node);
            }

            //create node and teachingplan connection or update
            //find if exist
            $node_teaching_plan = NodesTeachingPlan::where('teaching_plan_id', '=', $teachingplan['id'])
                                    ->where('node_id','=', $node['id'])
                                    ->first();

            if($node_teaching_plan===null){//only create if not exist
                $node_teaching_plan['teaching_plan_id'] = $teachingplan['id'];
                $node_teaching_plan['node_id'] = $node['id'];

                $node_teaching_plan = NodesTeachingPlan::create((array)$node_teaching_plan);
            }
        }
    }
}