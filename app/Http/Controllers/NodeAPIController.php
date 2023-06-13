<?php

namespace App\Http\Controllers;

use App\comment;
use Illuminate\Http\Request;
use Response;
use App\Models\User;
use App\Models\Topic;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\NodesTeachingPlan;
use App\Models\TeachingPlan;
use App\Models\TeachingPlanModule;
use App\Models\Subject;
use DB;
use Illuminate\Support\Facades\Log;

class NodeAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI(Request $request)
    {
        $input = $request->all();

        $data = $this->getNodeList( array_key_exists('name',$input)? $input['name']:null);

        return $this->APIindex($data);
    }

    /**
     * Display a single resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function viewAPI(Request $request)
    {
        $input = $request->all();

        $data = $this->getSingleNode($input['name']);

        return $this->APIview($data);
    }



    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeAPI(Request $request)
    {
        $input = $request->all();
        //check if exist
        $node = Node::where('name','=',$input['name'])->first();
        if($node ==null){
            // if not is not exist, create node
            $node = Node::create($input);
        }

        return $node;
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
       
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function destroy(comment $comment)
    {
        //
    }

    // get list of topics
    private function getNodeList($searchWord){
        //preset color
        $dirDist50 = "#FD8A78"; //red
        $dirDist10 = "#F2C379"; //yellow
        $dirDistLess10 = "#8CD6D7"; //blue
        
        if($searchWord==null){
            $nodeList = Node::select('nodes.id','nodes.name','nodes.count')
                            ->orderBy('nodes.count','Desc')
                            ->limit(8)
                            ->get()
                            ->toArray();
            $nodeIDList = array_map(function($a){
                return $a['id'];
            }, $nodeList);

            $dataSet = NodesNode::orderBy('nodes_nodes.count','Desc')
                            ->whereIn('first_node_id',$nodeIDList)
                            ->orWhereIn('second_node_id',$nodeIDList)
                            ->limit(15)
                            ->get();

        }else{
            $nodeList = Node::select('nodes.id','nodes.name','nodes.count')
                            ->where(DB::raw('lower(nodes.name)'),'LIKE','%'.strtolower($searchWord).'%')
                            //->where('nodes.name','=',$searchWord)
                            ->limit(8)
                            ->get()
                            ->toArray();

            $nodeIDList = array_map(function($a){
                return $a['id'];
            }, $nodeList);

            $dataSet = NodesNode::orderBy('nodes_nodes.count','Desc')
                            ->whereIn('first_node_id',$nodeIDList)
                            ->orWhereIn('second_node_id',$nodeIDList)
                            ->limit(15)
                            ->get();
        }

        //get data list
        $data = $dataSet->map(function($set){
            return [$set->firstnodes->name, $set->secondnodes->name];
        });

        //if the list is not empty mapping the list
        if(count($nodeList)>0){
            //get count range
            $difference = $nodeList[0]['count']-end($nodeList)['count'];
            $divider = ceil($difference/3)+end($nodeList)['count']-1;
            $dividerTwo = 2*$difference/3+end($nodeList)['count'];

            $nodeList = array_map(function($a) use ($divider, $dividerTwo, $dirDist50, $dirDist10, $dirDistLess10) {
                return [
                    'id' => $a['name'],
                    'marker' => [ "radius" => $a['count'] >= $dividerTwo? 30:($a['count'] > $divider?20:10)],
                    'color' => $a['count'] >= $dividerTwo? $dirDist50 : ($a['count'] > $divider? $dirDist10 : $dirDistLess10),
                    'percentage' => $a['count'],
                    'total' => $a['count']
                ];
            },$nodeList); 
        }    

        return [
            'node' => $nodeList==null?[]:$nodeList,            
            'data' => $data==null?[]:$data
        ];
    }

    //get single node
    private function getSingleNode(string $name){
        $topicId = NodesTopic::select('topics.id')
                        ->join('nodes', 'node_id','=','nodes.id')
                        ->join('topics','topic_id','=','topics.id')
                        ->where('nodes.name','=', $name)
                        ->get();

        $forumList = Topic::select('topics.id as topicId','users.id','users.name','title','users.name as author','topics.updated_at',DB::raw('Count(replies.id) as replies'))
                        ->join('users','user_id','=','users.id')
                        ->leftJoin('replies','topics.id','=','replies.topic_id')
                        ->whereIn('topics.id',$topicId)
                        ->where('topics.public','=',"group")
                        ->groupBy('topicId')
                        ->orderBy('topics.updated_at','Desc')
                        ->get();

        $publicDiscussionList = Topic::select('topics.id as topicId','users.id','title','users.name as author','topics.updated_at',DB::raw('Count(replies.id) as replies'))
                        ->join('users','user_id','=','users.id')
                        ->leftJoin('replies','topics.id','=','replies.topic_id')
                        ->where('topics.public','=','public')
                        ->where('topics.start_point','=',$name)
                        ->where('topics.public','=',"public")
                        ->groupBy('topicId')
                        ->orderBy('topics.updated_at','Desc')
                        ->get();
        $tpId = NodesTeachingPlan::select('teaching_plans.id')
                        ->join('nodes', 'node_id','=','nodes.id')
                        ->join('teaching_plans','teaching_plan_id','=','teaching_plans.id')
                        ->where('nodes.name','=', $name)
                        ->get();

        $teachingplanList = Teachingplan::select('teaching_plans.id as tpId','users.id','title','users.name as author','teaching_plans.updated_at')
                        ->join('users','user_id','=','users.id')
                        ->whereIn('teaching_plans.id',$tpId)
                        ->groupBy('tpId')
                        ->orderBy('teaching_plans.updated_at','Desc')
                        ->get();

        foreach($teachingplanList as $tp){
            $tp['subject'] = implode(',',array_map(function($a){
                return $a['subject'];
            },Teachingplan::select('subjects.subject')
                        ->join('teaching_plan_modules','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
                        ->join('subjects','teaching_plan_modules.subject_id','=','subjects.id')
                        ->where('teaching_plans.id','=',$tp['tpId'])
                        ->groupBy('subjects.subject')
                        ->get()
                        ->toArray()));
        }

        $nodeId = Node::where('name','=',$name)->first();
        $teachingplanIds = NodesTeachingPlan::select('teaching_plan_id')->where('node_id','=', $nodeId['id']);
        $subjectTPlist = Subject::select('subjects.id','subjects.subject','subjects.subject_group','teaching_plans.id as teachingplan')
                        ->rightjoin('teaching_plan_modules','teaching_plan_modules.subject_id','=','subjects.id')
                        ->leftjoin('teaching_plans','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
                        ->whereIn('teaching_plans.id',$teachingplanIds)
                        ->groupby('subjects.id') 
                        ->groupby('teaching_plans.id') 
                        ->get();
        $subjectList = $subjectTPlist->groupby('subject');
        $totalSubjectTP = count($subjectTPlist);

        $colorIndex = ["progress-bar","progress-bar-primary","progress-bar-success","progress-bar-danger","progress-bar-warning"];
        $STEAMColor = [ 'General' => '#adb5bd',
                        'Arts' => '#dc3545',
                        'Science' => '#198754',
                        'Technology' => '#0d6efd',
                        'Mathematics' => '#ffc107',
                        'Engineering' => '#fd7e14',
                        'STEM' => '#1cb0b0',
                        'STEAM' => '#f584f5'
                        ];
        $index = 0;
        foreach( $subjectList as $key=> $subjectTP){
            $indexNumber = $index%5;
            $index ++;
            $subjectList[$key] = ['subject_group' => $subjectTP[0]['subject_group'],
                                    'count' => count($subjectTP),
                                    'color' => $colorIndex[$indexNumber],
                                    'percentage' =>number_format((count($subjectTP)*100/$totalSubjectTP),2).'%'];
        }

       //work on dount chart
        $subjectGroupList = $subjectTPlist->groupby('subject_group');
        $STEAM = [];
        foreach($subjectGroupList as $key=> $group){
            array_push($STEAM,[ 'name' => $key,
                                "color" => $key==''?$STEAMColor['General']:$STEAMColor[$key] ,
                                "y" =>count($group)/$totalSubjectTP
                                ]);
        }


        $node = [
            'subjectList'=> $subjectList,
            'totalSubjectTP' => $totalSubjectTP,
            'subjectGroupList' => $subjectGroupList,

            // DONUT chart
            'STEAM' => $STEAM,

            //table list
            'teachingPlanList' => $teachingplanList,
            'forumList' => $forumList,
            'publicDiscussionList' => $publicDiscussionList

        ];
        return $node;
    }
}