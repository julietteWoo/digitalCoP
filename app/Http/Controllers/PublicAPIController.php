<?php

namespace App\Http\Controllers;

use App\comment;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;

use Response;
use App\Models\User;
use App\Models\Topic;
use App\Models\Reply;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\NodesTeachingPlan;
use App\Models\Subject;

use Revolution\Google\Sheets\Facades\Sheets;

use DB;

use Auth;

class PublicAPIController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI(Request $request)
    {
        $this->recordLog("publicNodeIndexAPI", '');

        $input = $request->all();

        $data = $this->getNodeList(array_key_exists('name',$input)? $input['name']:null);

        return $this->APIindex($data);
    }

    /**
     * Display a single resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function viewAPI(Request $request)
    {
        $this->recordLog("publicNodeViewAPI", serialize($request->all()));
        $input = $request->all();
        $data = $this->getNode($input['name']);
        return $this->APIview($data);
    }

    public function discussionViewAPI(Request $request)
    {
        $this->recordLog("publicDiscussionViewAPI", serialize($request->all()));
        $input = $request->all();
        $data = $this->getDiscussion($input['id']);
        return $this->APIview($data);
    }

    // Reply List
    public function commentAPI(Request $request){
        //Add log
        //the function will be called after listed Comments
        $this->recordLog("publicCommentAPI", serialize($request->all()));

        //redirect to comment controller
        $input = $request->all();

        $data = $this->getCommentList($input['id']);

        return $this->APIindex($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function commentStoreAPI(Request $request)
    {   

        //only loged user can add
        if( Auth::user() == null){
            return null;
        }else{
            //Add log
            $this->recordLog("publicStoreCommentAPI", serialize($request->all()));

            //redirect to comment controller
            $commentAPIController = new CommentAPIController();
            return $commentAPIController->storeAPI($request);
        }
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
     public function updateCommentAPI(Request $request)
    {
        //only loged user can add
        if( Auth::user()==null ){
            return null;
        }else{
            //Add log
            $this->recordLog("publicUpdateCommentAPI", serialize($request->all()));

            //redirect to comment controller
            $commentAPIController = new CommentAPIController();
            return $commentAPIController->updateAPI($request);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function deleteCommentAPI(Request $request)
    {
        //only loged user can add
        if( Auth::user()==null ){
            return null;
        }else{
            //Add log
            $this->recordLog("publicDeleteCommentAPI", serialize($request->all()));
            //redirect to comment controller
            $commentAPIController = new CommentAPIController();
            return $commentAPIController->destroyAPI($request);
        }
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
                            ->where('nodes.count','!=', 0)
                            ->where('nodes.note','=',null)
                            ->limit(6)
                            ->get()
                            ->toArray();

            $nodeIDList = array_map(function($a){
                return $a['id'];
            }, $nodeList);

            $dataSet = NodesNode::orderBy('nodes_nodes.count','Desc')
                            ->whereIn('first_node_id',$nodeIDList)
                            ->orWhereIn('second_node_id',$nodeIDList)
                            ->limit(10)
                            ->get();
        }else{
            $nodeList = Node::select('nodes.id','nodes.name','nodes.count')
                            ->where(DB::raw('lower(nodes.name)'),'LIKE','%'.strtolower($searchWord).'%')
                            //->where('nodes.name','=', $searchWord)
                            ->where('nodes.count','!=', 0)
                            ->orderBy('nodes.count','Desc')
                            ->limit(6)
                            ->get()
                            ->toArray();
            $nodeIDList = array_map(function($a){
                return $a['id'];
            }, $nodeList);

            $dataSet = NodesNode::orderBy('nodes_nodes.count','Desc')
                            ->whereIn('first_node_id',$nodeIDList)
                            ->orWhereIn('second_node_id',$nodeIDList)
                            ->limit(10)
                            ->get();
        }

        //get data list
        $data = $dataSet->map(function($set){
            return [$set->firstnodes->name, $set->secondnodes->name];
        });

        //get recent discussion list
        $recentdata = Topic::Select('topics.id','topics.title',DB::raw('Count(replies.id) as replies'),'topics.start_point')
                                ->where('topics.public','=','public')
                                ->leftJoin('replies','topics.id','=','replies.topic_id')
                                ->groupBy('topics.id')
                                ->orderBy('topics.updated_at','desc')
                                ->limit(5)
                                ->get();

        //get recent discussion list
        $populardata = Topic::Select('topics.id','topics.title',DB::raw('Count(replies.id) as replies'),'topics.start_point')
                                ->where('topics.public','=','public')
                                ->leftJoin('replies','topics.id','=','replies.topic_id')
                                ->groupBy('topics.id')
                                ->orderBy('replies','desc')
                                ->limit(5)
                                ->get();

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

        $sheets = Sheets::spreadsheet('1kiPkFYKnfd887hjOXcEZqb68fZURciXLT4JB5u1U1ns')
                        ->sheet('Form Responses 1')
                        ->all();

        return [
            'node' => $nodeList==null?[]:$nodeList,            
            'data' => $data==null?[]:$data,
            'recent' =>$recentdata,
            'popular' => $populardata,
            'studentproject' => $sheets
        ];
    }

    //get single topic
    private function getNode(string $name){
        $topicId = NodesTopic::select('topics.id')
                        ->join('nodes', 'node_id','=','nodes.id')
                        ->join('topics','topic_id','=','topics.id')
                        ->where('nodes.name','=', $name)
                        ->get();

        $publicDiscussionList = Topic::select('topics.id as topicId','users.id','users.name','title','users.name as author','topics.updated_at',DB::raw('Count(replies.id) as replies'))
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','=','public')
                        ->leftJoin('replies','topics.id','=','replies.topic_id')
                        ->where('topics.public','=','public')
                        ->where('topics.start_point','=',$name)
                        ->groupBy('topics.id')
                        ->orderBy('topics.updated_at','Desc')
                        ->get();

        $nodeId = Node::where('name','=',$name)->first();
        $teachingplanIds = NodesTeachingPlan::select('teaching_plan_id')->where('node_id','=', $nodeId['id']);
        $subjectTPlist = Subject::select('subjects.id','subjects.subject','subjects.subject_group','teaching_plans.id as teachingplan')
                        ->rightjoin('teaching_plan_modules','teaching_plan_modules.subject_id','=','subjects.id')
                        ->leftjoin('teaching_plans','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
                        ->whereIn('teaching_plans.id',$teachingplanIds)
                        ->groupby('subjects.id') 
                        ->groupby('teaching_plans.id') 
                        ->get();
        $totalSubjectTP = count($subjectTPlist);
        $subjectList = $subjectTPlist->groupby('subject');

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
                                    'percentage' =>(count($subjectTP)*100/$totalSubjectTP).'%'];
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
            //donut char
            'STEAM' => $STEAM,

            //bar chart
            'subjectList'=> $subjectList,
            'totalSubjectTP' => $totalSubjectTP,
            'subjectGroupList' => $subjectGroupList,

            //table
            'publicDiscussionList' => $publicDiscussionList

        ];
        return $node;
    }

    //get single discussion topic
    private function getDiscussion(int $id){
        
        $topic = Topic::select('topics.id','user_id','title','content','users.name as author','topics.updated_at', 'topics.start_point', 'topics.node_recommand','topics.node_list')
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','=','public')
                        ->where('topics.id','=',$id)
                        ->get()
                        ->first();
        return $topic;
    }

    //get reply list
    private function getCommentList(int $id){

        $comment = ['replies' => Reply::select('replies.id','user_id','content','users.name as author','replies.updated_at')
                                    ->join('users','replies.user_id','=','users.id')
                                    ->where('topic_id','=',$id)
                                    ->orderBy('replies.id')
                                    ->get()];
        return $comment;
    }
}