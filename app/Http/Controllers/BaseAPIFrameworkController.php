<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as Request2;
use Carbon\Carbon;
use App\Http\Requests;
use Response;

use Google\Cloud\Core\ServiceBuilder;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;

use Illuminate\Support\Str;

use Config;
use Auth;
use Mail;
use Validator;
use Session;

use App\Models\NodesTeachingPlan;
use App\Models\TeachingPlan;
use App\Models\TeachingPlanModule;
use App\Models\NodesNode;
use App\Models\Node;

class BaseAPIFrameworkController extends Controller {

    // For Admin Authenticatione
    public function __construct() {
        $this->middleware('auth');
    }

    public function googleSentiment($content){

        //Google service setup
        $cloud = new ServiceBuilder([
            'keyFilePath' => base_path('digitalCoP-111e9a161707.json'),
            'projectId' => 'digitalcop'
        ]);
        $language = $cloud->language();

        // Detect the sentiment of the text
        $annotation = $language->analyzeSentiment($content);
        $sentiment = $annotation->sentiment();
        return $sentiment;
    }

    public function textRankAnaylise($content){

        $api = new TextRankFacade();
        // English implementation for stopwords/junk words:
        $stopWords = new English();
        $api->setStopWords($stopWords);

        // Array of the most important keywords:
        $keyword = $api->getOnlyKeyWords($content); 
        
        // Array of the sentences from the most important part of the text: doesn't look working
        // $highlights = $api->getHighlights($content); 
        // Array of the most important sentences from the text:
        //$summary = $api->summarizeTextBasic($content);

        //clean up keywords before sending
        foreach($keyword as $key =>$indicator){

            $hasRemoved = false;

            /*
                remove words with dot except acronym
                textRank has removed all the dot from all the word
                this part only work on acronym with split dot
                Those without split acronym can not be identified in textRank
            */
            if(strpos($key, '.') !== false){
                //find if it is a acronym strpos($key, '.')==1 lenth,  [3],[5]...is dot
                if(strpos($key, '.')==1){

                    $isAcronym = true;
                    /*
                        CANIMPROVE: This part can be improved
                        the cases such as a., b., not been eliminated
                        but it has very little impact on the whole process as it will be screen out from googleAPI  keyword list
                    */
                    for($i=1; $i<strlen($key)-1;$i+=2){
                        if(substr($key, $i,1)!='.'){
                            $isAcronym =false;
                        }
                    }

                    if($isAcronym){
                        /*
                            put dot at the end if its not endup with dot
                        */
                        //check if the dot is at the end
                        if(substr($key, -1,1)!='.'){ 
                            //if yes, add dot at the end, the word with '.' is always come after without '.' at the end
                            $keyword[$key.'.'] = $keyword[$key];
                            //remove the word
                            unset($keyword[$key]);
                            $hasRemoved = true;
                        }
                        /*
                            CANIMPROVE: This part can be improved by capitalize all the letters
                        */
                    }else{
                        //not a acronym remove
                        unset($keyword[$key]);
                        $hasRemoved = true;
                    }
                }else{ //if the '.' is between words or after a word
                    /*
                        CANIMPROVE: This part can be imporved, to be simple, now just remove it
                        seperate words from dot and merge the indicate value
                    */
                    //remove the word
                    unset($keyword[$key]);
                    $hasRemoved = true;
                }
            }


            /*
                singular plural work
            */
            //check the key is singular if not do the action
            if($hasRemoved != true){
                if(Str::singular($key) != $key){

                    //check if the word is in the plural singular examption list, if not do the action
                    if(!in_array(Str::singular($key),$this->singluarExclution)){
                        /*
                            singular word come before plural,
                            if exists, which means the singlar word should have been processed, add indicator value should not impact other later process
                            if not exist, which means the singlar word was not mensioned in the list before.
                        */
                        //check if there's the singular form of key, if yes do the action
                        if(array_key_exists( Str::singular($key) ,$keyword)){
                            //if has the singular form and in the list already, addup the indicators
                            $keyword[Str::singular($key)] += $indicator;
                        }else{ //if no singular form in the list add new key
                            $keyword[Str::singular($key)] = $indicator;
                         }
                        //remove old purler key
                        unset($keyword[$key]);
                        $hasRemoved = true;
                    }
                }
            }
            
        }

        return [ "keywords" => $keyword];
    }

    public function inputNodeConnection($title, $response){
        /*
            this part make the node connections
            the first node id is always smaller than the second
        */
        //input node connection
        foreach($title['nodeList'] as $nodeEntity){
            if($response['nodeList']!=null){
                foreach($response['nodeList'] as $associateEntity){
                    $nodeOne = Node::where('name', '=', $nodeEntity)->first();
                    $nodeTwo = Node::where('name', '=', $associateEntity)->first();
                    //only when both exist in the node list (should be) will add the connection
                    if($nodeOne && $nodeTwo){
                        //compare id first id is always smaller than the second id
                        if($nodeOne['id']<$nodeTwo['id']){
                            $node_node =NodesNode::where('first_node_id', '=', $nodeOne['id'])
                                        ->where('second_node_id', '=', $nodeTwo['id'])
                                        ->first();
                            //if exist add count
                            if($node_node){
                                $node_node['count'] += 1;
                                $node_node->update((array)$node_node);
                            }else{ // if not exist
                                $node_node['first_node_id'] = $nodeOne['id'];
                                $node_node['second_node_id'] = $nodeTwo['id'];
                                $node_node['count'] = 1;
                                $node_nodeConnection = NodesNode::create((array)$node_node);
                            }
                        }else if($nodeOne['id']>$nodeTwo['id']){
                            $node_node =NodesNode::where('first_node_id', '=', $nodeTwo['id'])
                                        ->where('second_node_id', '=', $nodeOne['id'])
                                        ->first();
                            //if exist add count
                            if($node_node){
                                $node_node['count'] += 1;
                                $node_node->update((array)$node_node);
                            }else{ // if not exist
                                $node_node['first_node_id'] = $nodeTwo['id'];
                                $node_node['second_node_id'] = $nodeOne['id'];
                                $node_node['count'] = 1;
                                $node_nodeConnection = NodesNode::create((array)$node_node);
                            }
                        }
                    }  
                }
            }
        }
    }

    //update nodelist
    public function updateTeachingPlanNodelist($teachingplanId){
        //find teaching plan
        $teachingplan = TeachingPlan::find($teachingplanId);
        //find all the modules of the teaching plan
        $teachingplanmodules = $this->getTeachingplanModuleListForUpdate($teachingplanId);

        //get module content
        $moduleContent = $teachingplan['content']==null? '':$teachingplan['content'];
        foreach($teachingplanmodules as $subjectModule){
            $moduleContent = $moduleContent.$subjectModule['content'];
        }

        //get all the module content and clean up
        $moduleContent = $this->cleanUpContent($moduleContent);

        //call google entities
        $response = $this->googleEntity($moduleContent);
        //remove same entity from title

        $teachingPlanStartNodes = explode(",", $teachingplan['title_node']);
        $response['nodeList'] = array_diff($response['nodeList'], $teachingPlanStartNodes);

        $originalNodeList = explode(",", $teachingplan['node_list']);

        //update teaching plan
        $teachingplan['node_list'] = implode(",", $response['nodeList']);
        $teachingplan->update();

        //compare the old list
        $this->updateTeachingPlanNodesConnection($originalNodeList,$response['nodeList'],$teachingplanId,$teachingPlanStartNodes,$teachingplan);
    }

        //node connection update for teaching plan
    public function updateTeachingPlanNodesConnection($originalNodeList, $responseNodeList, $id, $teachingPlanStartNodes, $teachingplan){
        
        /*
            update node
        */
        //compare the originalNodeList with new $response['nodeList']
        $diffNodesFromOrigin = array_diff($originalNodeList, $responseNodeList); //nodes that in Origin but not in new
        $diffNodesFromNew = array_diff($responseNodeList, $originalNodeList); //nodes that in new but not in Origin

        //update the node into node_topic table that mark the comment flag 1
        //delete nodes in $diffNodesFromOrigin
        if(sizeof($diffNodesFromOrigin)!=0){
            foreach($diffNodesFromOrigin as $nodeToDelete){
                if($nodeToDelete!=null && $nodeToDelete!=''){
                    $nodeTPEntity = NodesTeachingPlan::select('nodes_teaching_plans.id')
                                    ->join('nodes','node_id','=','nodes.id')
                                    ->where('nodes_teaching_plans.teaching_plan_id','=', $id)
                                    ->where('nodes.name','=', $nodeToDelete)
                                    ->first();

                    //get node id
                    $commentNode = Node::where('name', '=', $nodeToDelete)->first();

                    //update node Teaching plan
                    if($nodeTPEntity){
                        $nodeTPEntity->delete();
                    }

                    //update the nodes_node
                    foreach($teachingPlanStartNodes as $key => $startPoint){
                        if($startPoint!=null && $startPoint!=''){
                            //get topic node id
                            $tpNodeID = Node::where('name','=',$startPoint)
                                        ->first();

                            if(!$tpNodeID){//if tp node is not exist/ remove from the title_nodes
                                $this->resetTeachingPlanTitleNodes($teachingPlanStartNodes, $key, $teachingplan);
                            }else{//if exist, decrease or delete connection
                                $tpNodeID = $tpNodeID['id'];

                                //compare node_id
                                if($commentNode!=null && $tpNodeID>$commentNode['id']){
                                    $nodesNodeEntity = NodesNode::where('first_node_id','=',$commentNode['id'])
                                                    ->where('second_node_id','=',$tpNodeID)
                                                    ->first();
                                    $this->decreaseNodeCount($nodesNodeEntity);
                                }else if($commentNode!=null && $commentNode['id']>$tpNodeID){
                                    $nodesNodeEntity = NodesNode::where('first_node_id','=',$tpNodeID)
                                                    ->where('second_node_id','=',$commentNode['id'])
                                                    ->first();
                                    $this->decreaseNodeCount($nodesNodeEntity);
                                }
                            }
                        }
                    }

                    //update the node
                    if($commentNode!=null && $commentNode['count']>1){
                        $commentNode['count'] = $commentNode['count']-1;
                        $commentNode->save();
                    }else if($commentNode!=null && $commentNode['count']==1){
                        $commentNode->delete();
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

                    if (!$nodeEntityToAdd) { //not exist, to create
                        $nodeEntityToAdd = Node::create(['name'=>$nodeToAdd, 'count'=>1]);

                        //create node topic connection
                        $nodeTeachingPlanEntityToAdd = NodesTeachingPlan::create(['node_id'=>$nodeEntityToAdd['id'], 'teaching_plan_id'=> $id]);

                        //create node node connection to each topic start point nodes
                        foreach($teachingPlanStartNodes as $key => $startPoint){
                            if($startPoint!=null && $startPoint!=''){
                                //get starPoint ID
                                $tpNodeID = Node::where('name','=',$startPoint)->first();

                                if(!$tpNodeID){//if not exsit
                                    $this->resetTeachingPlanTitleNodes($teachingPlanStartNodes, $key, $teachingplan);
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
                                                ->where('teaching_plan_id','=',$id)
                                                ->first();
                        
                        //not exist, to create
                        if (!$nodeTeachingPlanEntityToAdd) {
                            $nodeTeachingPlanEntityToAdd = NodesTeachingPlan::create(['node_id'=>$nodeEntityToAdd['id'], 'teaching_plan_id'=>$id]);
                        }//else do nothing

                        //create node node connection to each topic start point nodes
                        foreach($teachingPlanStartNodes as $key => $startPoint){
                            if($startPoint!=null && $startPoint!=''){
                                //get starPoint ID
                                $tpNodeID = Node::where('name','=',$startPoint)->first();

                                if(!$tpNodeID){
                                    $this->resetTeachingPlanTitleNodes($teachingPlanStartNodes, $key, $teachingplan);
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

    // get list of teaching plans
    private function getTeachingplanModuleListForUpdate(int $id){
        
        $teachingplanModuleList = TeachingPlanModule::select('teaching_plan_modules.content')
                        ->where('teaching_plan_modules.teaching_plan_id','=',$id)
                        ->get();

        return $teachingplanModuleList;
    }

    //remove node from title nodes
    private function resetTeachingPlanTitleNodes($tpTitleNodes, $key, $tp){
        //delete node in $topicStartNodes
        unset($tpTitleNodes[$key]);
        // get teaching plan
        //update $title nodes
        $tp['title_node'] = implode(",", $tpTitleNodes);
        $tp->save();
    }


}