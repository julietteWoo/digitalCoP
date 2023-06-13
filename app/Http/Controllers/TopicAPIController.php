<?php

namespace App\Http\Controllers;

use App\comment;
use Illuminate\Http\Request;
use Response;
use App\Models\User;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\TeachingPlan;
use App\Models\Topic;
use Google\Cloud\Core\ServiceBuilder;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;
use Revolution\Google\Sheets\Facades\Sheets;

use Auth;
use DB;

class TopicAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI()
    {
        $data = [   'studentproject'    =>$this->getStudentRequest(),
                    'topic'             =>$this->getTopicList()];

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

        $data = $this->getTopic($input['id']);

        //return Response::json($data);
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
        // set inputs
        $input = $request->all();
        if(strpos($input['title'],'[node free]')==false){ //not mark 'node free'
            $content = $this->cleanUpContent($input['content']);

            //call google sentiment
            $sentiment = $this->googleSentiment($content);

            //put score and magnitude to database table
            $input['sentiment_score'] = $sentiment['score'];
            $input['sentiment_magnitude'] = $sentiment['magnitude'];

            //pass value to title to make major tag
            $title = $input['title'];
            //call google entities
            $title = $this->googleEntity($title);
            $response = $this->googleEntity($content);
            //remove same entity from title
            $response['nodeList'] = array_diff($response['nodeList'], $title['nodeList']);

            //add node list
            //for comment node collected from comment, here set null
            $input['node_list'] = null;
            //for topic title node
            $input['start_point'] = implode(",", $title['nodeList']);
            //for content node
            $input['node_recommand'] = implode(",", $response['nodeList']);

            // save topic fields
            $topic = Topic::create($input);

            //input node and node connection with Topic
            $this->nodeInput($title, $topic, 0);
            $this->nodeInput($response, $topic, 0);

            //add nodes connection for content to title only 
            $this->inputNodeConnection($title, $response);
        
            // finally return topic
            return ["content" => $response, "title"=>$sentiment];

        }else{//mark 'node free' do not analyse node
            // save topic fields
            //for comment node collected from comment, here set null
            $input['node_list'] = null;
            //for topic title node null
            $input['start_point'] = null;
            //for content node null
            $input['node_recommand'] = null;
            $topic = Topic::create($input);
        }

        
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
        $input = $request->all();
        $topic = Topic::find($input['id']);
        
        if(Auth::user()->id == $topic['user_id'] || Auth::user()->type == 'admin'){
            //if change from not node free to node free, the original nodes will be kept and need to manually check and update database
            //this may improve in the future
            if(strpos($input['title'],'[node free]')==false){   // not node free
                 error_log('in not node free here');
                /*
                    rebuild connection
                */
                //find related nodes
                $nodesTopic = NodesTopic::select("node_id")->where("comment", "!=", 1)->where('topic_id','=', $input['id']);

                //get all the nodes
                $topicTitleNode = explode(',',$topic['start_point']);
                $topicContentNode = explode(',',$topic['node_recommand']);
                $topicCommentNode = explode(',',$topic['node_list']);

                //destory all the connections by reducing nodes connection or delete nodes connection
                if($topicTitleNode!=null){
                    //delete connection between content and title
                    if($topicContentNode!= null){
                        $this->destoryConnection($topicTitleNode,$topicContentNode);
                    }
                    //delete connection between comment and title
                    if($topicCommentNode!= null){
                        $this->destoryConnection($topicTitleNode,$topicCommentNode);
                    }
                }

                //delete topic node connection
                $nodesTopic->delete();

                //reduce nodes count or delete nodes
                $this->deleteOrUpdateNodes($topicTitleNode);
                $this->deleteOrUpdateNodes($topicContentNode);
                //do not need to deleteOrUpdate topicCommentNode/node_list as they are not change

                //create node and connection 
                //pass value to clean up content by removing unwanted symbols and tags
                $content = $this->cleanUpContent($input['content']);

                //call google sentiment
                $sentiment = $this->googleSentiment($content);

                //put score and magnitude to database table
                $input['sentiment_score'] = $sentiment['score'];
                $input['sentiment_magnitude'] = $sentiment['magnitude'];

                //pass value to title to make major tag
                $title = $input['title'];
                //call google entities
                $title = $this->googleEntity($title);
                $response = $this->googleEntity($content);
                //remove same entity from title
                $response['nodeList'] = array_diff($response['nodeList'], $title['nodeList']);

                //add node list
                //for topic title node
                $input['start_point'] = implode(",", $title['nodeList']);
                //for content node
                $input['node_recommand'] = implode(",", $response['nodeList']);


                //input node and node connection with Topic
                $this->nodeInput($title, $topic, 0);

                $this->nodeInput($response, $topic, 0);


                /*
                    add node-node connection
                */
                //add nodes connection for content to title
                $this->inputNodeConnection($title, $response);
                //add nodes connection for comment to title
                $commentNodeCarrier['nodeList'] = explode(",",$topic['node_list']);
                $this->inputNodeConnection($title, $commentNodeCarrier);

                $topic->update($input);
            }else{//node free

                $topic->update($input);
                error_log('in  node free here');
            }
        }else{
            error_log('only the owner and adin can update the comment');
        }
        
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

    //input node data
    private function nodeInput($arr, $topic, $commentFlag){
        foreach($arr['nodeList'] as $nodeEntity){
            $node = Node::where('name', '=', $nodeEntity)->first();

            if(!$node){ //if not exist
                $node['name'] = $nodeEntity;
                $node['count'] = 1;
                $node = Node::create($node);

            }else{ //if exist
                $node['count'] = $node['count']+1;
                $node->update((array)$node);
            }

            //create node and topic connection or update
            //find if exist

            $node_topic = NodesTopic::where('topic_id', '=', $topic['id'])
                                    ->where('node_id','=', $node['id'])
                                    ->where('comment','=',$commentFlag)
                                    ->first();

            if(!$node_topic){//only create if not exist
                $node_topic['topic_id'] = $topic['id'];
                $node_topic['node_id'] = $node['id'];
                $node_topic['comment'] = $commentFlag;

                $node_topic = NodesTopic::create((array)$node_topic);
            }

        }
    }

    // get list of topics
    private function getTopicList(){
        
        $topicList = Topic::select('topics.id','title','users.name as author','topics.updated_at', DB::raw('Count(replies.id) as replies'))
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','!=','public')
                        ->leftJoin('replies','topics.id','=','replies.topic_id')
                        ->groupBy('topics.id')
                        ->orderBy('topics.updated_at','Desc')
                        ->get();
        return $topicList;
    }

    // get list of student request
    private function getStudentRequest(){
        
        $sheets = Sheets::spreadsheet('1kiPkFYKnfd887hjOXcEZqb68fZURciXLT4JB5u1U1ns')
                        ->sheet('Form Responses 1')
                        ->all();
        return $sheets;
    }

    //get single topic
    private function getTopic(int $id){
        
        $topic = Topic::select('topics.id','user_id','title','content','users.name as author','topics.updated_at', 'topics.start_point', 'topics.node_recommand','topics.node_list')
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','!=','public')
                        ->where('topics.id','=',$id)
                        ->get()
                        ->first();
        $topicNodesList = NodesTopic::select('node_id')->where('topic_id','=',$id)->get();
        $topic['teaching_plan_list'] = TeachingPlan::select('teaching_plans.id','teaching_plans.title')
                                        ->join('nodes_teaching_plans','teaching_plan_id','=','teaching_plans.id')
                                        ->whereIn('node_id',$topicNodesList)
                                        ->get();
        return $topic;
    }
}