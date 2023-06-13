<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Facades\Log;
use Illuminate\Routing\Controller as BaseController;
use App\Models\Topic;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\Reply;
use App\Models\Log as Log2;
use Response;
use Auth;

use Google\Cloud\Core\ServiceBuilder;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;

use Illuminate\Support\Str;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    //create log function
    public function recordLog(string $action, string $data){

        Log2::create(['user_id' => Auth::user()==null? 0:Auth::user()->id,
                        'function' => $action,
                        'data' =>$data]);
    }

    // get Current User
    public function getCurrentUser(){
        //this function do not need to be logged

        $currentUser = Auth::user();
        return $currentUser==null? null:$currentUser->id;
        
    }

     //eliminate word list
    public $excludeList=[
        'ACARA',
        'access',
        'activity',
        'action',
        'all',
        'answer',
        'anyone',
        'anything',
        'assignment',
        'australia curriculum',
        'block',
        'class',
        'classmage',
        'conclusion',
        'content',
        'collaboration',
        'college',
        'communication',
        'curricula',
        'curriculum',
        'curriculum area',
        'Curriculum Area',
        'detail',
        'design',
        'design and technology',
        'design decision',
        'design idea',
        'design project',
        'developer',
        'development',
        'diagram',
        'discipline',
        'discussion question',
        'discussion',
        'doc',
        'document',
        'docx',
        'end',
        'event',
        'everyone',
        'everything',
        'example',
        'experience',
        'experiment',
        'file',
        'form',
        'function',
        'graph',
        'group',
        'gif',
        'help',
        'importance',
        'idea',
        'image',
        'img',
        'impact',
        'information',
        'innovation',
        'inquiry',
        'instruction',
        'instructor',
        'investigation',
        'investigator',
        'issue',
        'jpeg',
        'jpg',
        'kid',
        'knowledge',
        'learning',
        'learning need',
        'learning goal',
        'learning outcome',
        'left',
        'letter',
        'less',
        'lesson',
        'list',
        'lot',
        'many',
        'method',
        'more',
        'most',
        'name',
        'need',
        'node',
        'note',
        'nothing',
        'objective',
        'one',
        'other',
        'panel',
        'part',
        'person',
        'pdf',
        'picture',
        'plan',
        'png',
        'potential',
        'presentation',
        'principle',
        'problem',
        'process',
        'production',
        'program',
        'programming',
        'programming problem',
        'project',
        'purpose',
        'question',
        'quite',
        'record',
        'reference',
        'report',
        'research',
        'resource',
        'result',
        'right',
        'school',
        'science',
        'section',
        'sentence',
        'session',
        'set-up',
        'setting',
        'sheet',
        'short story',
        'skill',
        'side',
        'solution',
        'someone',
        'something',
        'STEAM',
        'STEM',
        'STEM discipline',
        'story',
        'student',
        'study',
        'subject',
        'table',
        'task',
        'teacher',   
        'teaching',
        'team',
        'technology',
        'test',
        'testing',
        'text',
        'touch',
        'theme',
        'thing',
        'topic',
        'understanding',
        'unit',
        'use',
        'variety',
        'victoria curriculum',
        'way',
        'welcome',
        'word',
        'worksheet',
        'work',
        'XLSX'
    ];

    //singular and plural different meaning list
    public $singluarExclution = [
        "air",
        "blind",
        "character",
        "custom",
        "force",
        "spectacle",
        "manner"
    ];

    //subject list //NOT IN USE
    public $subjectList = [
        "mathematics",
        "engineer",
        "chemistry",
        "science",
        "physics"
    ];

    //for distroy connecton between nodes in topic title content and comment
    public function destoryConnection(Array $topicList, Array $entityList){
        //find the connection
        foreach($topicList as $titleEntity){
            foreach($entityList as $entity){
                //find two node id
                $title = Node::where('name', '=', $titleEntity) ->first();
                $content = Node::where('name', '=', $entity ) ->first();
                $titleId = $title['id'];
                $contentId = $content==null?0:$content['id'];

                //compare id
                if($contentId!=0 && $titleId < $contentId){
                    //find from connection table
                    $connection = NodesNode::where('first_node_id' ,'=', $titleId)
                                        ->where('second_node_id','=', $contentId)
                                        ->first();

                    //if count bigger than one reduce count, else delete
                    if($connection){
                        $this->deleteOrUpdate($connection);
                    }

                }else if($contentId!=0){
                    //find from connection table
                    $connection = NodesNode::where('first_node_id' ,'=', $contentId)
                                        ->where('second_node_id','=', $titleId)
                                        ->first();

                    //if count bigger than one reduce count, else delete
                    if($connection){
                        $this->deleteOrUpdate($connection);
                    }
                }
            }
        }
    }

    //for destory connection between nodes
    public function deleteOrUpdate($connection){
        //if count bigger than one reduce count, else delete
        if($connection['count']>1){
            
            //reduce and update
            $connection['count'] -=1;
            $connection->update((Array)$connection);
        }else{
            
            //delete
            $connection ->delete();
        }
    }

    //for destory or reduce nodes count 
    public function deleteOrUpdateNodes(Array $nodeList){
        foreach($nodeList as $node){
            //find the node
            $nodeObject = Node::where('name', '=', $node) ->first();

            //if count bigger than one reduce, otherwise delete
            if($nodeObject){
                if($nodeObject['count']>1){
                    //reduce and update
                    $nodeObject['count'] -= 1;
                    $nodeObject->update((Array)$nodeObject);
                }else{
                    //delete
                    //$nodeObject ->delete();
                    //NOTE: in case of system break down, instead of delete, mark node count to zero.
                    $nodeObject['count'] = 0;
                    $nodeObject->update((Array)$nodeObject);
                    
                }
            }
        }
    }

    //This part can be replaced by any other algorithm process working with AI to produce better node list
    public function updateTopicWithNodeList(int $id){//for creating and update

        //find topic
        $topic = Topic::find($id);

        if(strpos($topic['title'],'[node free]')==false){ // not node free
            //get topic start nodes
            $topicStartNodes = explode(",", $topic['start_point']);

            //get original node
            $originalNodeList = explode(",", $topic['node_list']);

            //combine all the comments together
            $commentsList = $topic->replies;
            $wholeComments = '';

            foreach( $commentsList as $comment){
                $wholeComments = $wholeComments.$comment['content'];
            }

            $response = $this->googleEntity($this->cleanUpContent($wholeComments));

            //update topic node_list
            $topic['node_list'] = implode(",", $response['nodeList']);
            $topic->save();

            /*
                update node
            */
            //compare the originalNodeList with new $response['nodeList']
            $diffNodesFromOrigin = array_diff($originalNodeList, $response['nodeList']); //nodes that in Origin but not in new
            $diffNodesFromNew = array_diff($response['nodeList'], $originalNodeList); //nodes that in new but not in Origin

            //update the node into node_topic table that mark the comment flag 1
            //delete nodes in $diffNodesFromOrigin
            if(sizeof($diffNodesFromOrigin)!=0){
                foreach($diffNodesFromOrigin as $nodeToDelete){
                    if($nodeToDelete!=null && $nodeToDelete!=''){
                        $nodeTopicEntity = NodesTopic::select('nodes_topics.id')
                                        ->join('nodes','node_id','=','nodes.id')
                                        ->where('nodes_topics.comment','=',1)
                                        ->where('nodes_topics.topic_id','=', $id)
                                        ->where('nodes.name','=', $nodeToDelete)
                                        ->first();

                        //get comment node id
                        $commentNode = Node::where('name', '=', $nodeToDelete)->first();

                        //update nodeTopic
                        if($nodeTopicEntity){
                            $nodeTopicEntity->delete();
                        }

                        //update the nodes_node
                        foreach($topicStartNodes as $key => $startPoint){
                            if($startPoint!=null && $startPoint!=''){
                                //get topic node id
                                $topicNodeID = Node::where('name','=',$startPoint)
                                            ->first();

                                if(!$topicNodeID){//if topic node is not exist
                                    $this->resetTopicStartPoint($topicStartNodes, $key, $topic);
                                }else{//if exist, decrease or delete connection
                                    $topicNodeID = $topicNodeID['id'];

                                    //compare node_id
                                    if($topicNodeID>$commentNode['id']){
                                        $nodesNodeEntity = NodesNode::where('first_node_id','=',$commentNode['id'])
                                                        ->where('second_node_id','=',$topicNodeID)
                                                        ->first();
                                        $this->decreaseNodeCount($nodesNodeEntity);
                                    }else if($commentNode['id']>$topicNodeID){
                                        $nodesNodeEntity = NodesNode::where('first_node_id','=',$topicNodeID)
                                                        ->where('second_node_id','=',$commentNode['id'])
                                                        ->first();
                                        $this->decreaseNodeCount($nodesNodeEntity);
                                    }
                                }
                            }
                        }

                        //update the node
                        if($commentNode['count']>1){
                            $commentNode['count'] = $commentNode['count']-1;
                            $commentNode->save();
                        }else if($commentNode['count']==1){
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

                        if (!$nodeEntityToAdd) {
                            //not exist, to create
                            $nodeEntityToAdd = Node::create(['name'=>$nodeToAdd, 'count'=>1]);

                            //create node topic connection
                            $nodeTopicEntityToAdd = NodesTopic::create(['node_id'=>$nodeEntityToAdd['id'], 'topic_id'=> $id,'comment'=>1]);

                            //create node node connection to each topic start point nodes
                            foreach($topicStartNodes as $key => $startPoint){
                                if($startPoint!=null && $startPoint!=''){
                                    //get starPoint ID
                                    $topicNodeID = Node::where('name','=',$startPoint)->first();

                                    if(!$topicNodeID){//if not exsit
                                        $this->resetTopicStartPoint($topicStartNodes, $key, $topic);
                                    }else{
                                        $topicNodeID = $topicNodeID['id'];

                                        //create node node
                                        $nodesNodeEntityToAdd = NodesNode::create(['first_node_id'=>$topicNodeID,'second_node_id'=>$nodeEntityToAdd['id'] ,'count'=>1]);
                                    }
                                }
                            }
                        }else{
                            //exist add count
                            $nodeEntityToAdd['count']=$nodeEntityToAdd['count']+1;
                            $nodeEntityToAdd->save();

                            //create node topic connection
                            //find if exist
                            $nodeTopicEntityToAdd = NodesTopic::where('node_id', '=', $nodeEntityToAdd['id'])
                                                    ->where('topic_id','=',$id)
                                                    ->where('comment', '=', 1)
                                                    ->first();
                            
                            if (!$nodeTopicEntityToAdd) {
                                //not exist, to create
                                $nodeTopicEntityToAdd = NodesTopic::create(['node_id'=>$nodeEntityToAdd['id'], 'topic_id'=>$id,'comment'=>1]);
                            }//else do nothing

                            //create node node connection to each topic start point nodes
                            foreach($topicStartNodes as $key => $startPoint){
                                if($startPoint!=null && $startPoint!=''){
                                    //get starPoint ID
                                    $topicNodeID = Node::where('name','=',$startPoint)->first();

                                    if(!$topicNodeID){
                                        $this->resetTopicStartPoint($topicStartNodes, $key, $topic);
                                    }else{
                                        $topicNodeID = $topicNodeID['id'];

                                        //compare id 
                                        if($nodeEntityToAdd['id']>$topicNodeID){ 
                                            $this->createNodesNode($topicNodeID, $nodeEntityToAdd['id']);
                                        }else if($topicNodeID>$nodeEntityToAdd['id']){
                                            $this->createNodesNode($nodeEntityToAdd['id'], $topicNodeID);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public function resetTopicStartPoint($topicStartNodes, $key, $topic){
        //delete node in $topicStartNodes
        unset($topicStartNodes[$key]);
        //update $topicStartNodes
        $topic['start_point'] = implode(",", $topicStartNodes);
        $topic->save();
    }

    public function decreaseNodeCount($nodesNodeEntity){
        if($nodesNodeEntity){
            if($nodesNodeEntity['count']<=1){
                //delete
                $nodesNodeEntity->delete();
            }else if($nodesNodeEntity['count']>1){
                //count down
                $nodesNodeEntity['count'] = $nodesNodeEntity['count']-1;
                $nodesNodeEntity->save();
            }
        }
    }

    public function createNodesNode(int $firstId, int $secondID){
        //check if exit
        $nodesNodeEntityToAdd = NodesNode::where('first_node_id','=',$firstId)
                                ->where('second_node_id','=',$secondID)
                                ->first();

        if(!$nodesNodeEntityToAdd){
            //not exist, to create
            $nodesNodeEntityToAdd = NodesNode::create(['first_node_id'=>$firstId,'second_node_id'=>$secondID ,'count'=>1]);
        }else{
            //exist, to add count
            $nodesNodeEntityToAdd['count'] = $nodesNodeEntityToAdd['count']+1;
            $nodesNodeEntityToAdd->save();
        }

    }

    public function cleanUpContent(string $content){

        //clean up
        //replace bullet as strip_tags not work properly with bullets, it need to be replaced with space
        $content = str_replace('<li>', ' ',$content); 
        $content = str_replace('</li>', '. ',$content);

        $content = str_replace('<p>', ' ',$content); 
        $content = str_replace('</p>', '. ',$content);
        //replace <br> tag
        $content = str_replace('</br>', '. ',$content);
        $content = str_replace('<br>', '. ',$content);
        //replace special thing
        $content = str_replace('#65279', '. ',$content);
        $content = str_replace('&#65279', '. ',$content);
        $content = str_replace('&', ' and ',$content);

        //curriculum codes
        $content = str_replace('ACELA', ' ',$content);//curriculum code 
        $content = str_replace('ACELY', ' ',$content);//curriculum code 
        $content = str_replace('ACDSEH', ' ',$content);//curriculum code 
        $content = str_replace('ACHHK', ' ',$content);//curriculum code 
        $content = str_replace('ACMNA', ' ',$content);//curriculum code 
        $content = str_replace('ACMSP', ' ',$content);//curriculum code 
        $content = str_replace('ACPPS', ' ',$content);//curriculum code 
        $content = str_replace('ACEEN', ' ',$content);//curriculum code 
        $content = str_replace('ACEEA', ' ',$content);//curriculum code 
        $content = str_replace('ACEEE', ' ',$content);//curriculum code 
        $content = str_replace('ACELR', ' ',$content);//curriculum code 
        $content = str_replace('ACMEM', ' ',$content);//curriculum code 
        $content = str_replace('ACMGM', ' ',$content);//curriculum code 
        $content = str_replace('ACMMM', ' ',$content);//curriculum code 
        $content = str_replace('ACMSM', ' ',$content);//curriculum code 
        $content = str_replace('ACSBL', ' ',$content);//curriculum code 
        $content = str_replace('ACSCH', ' ',$content);//curriculum code 
        $content = str_replace('ACSES', ' ',$content);//curriculum code 
        $content = str_replace('ACSPH', ' ',$content);//curriculum code 
        $content = str_replace('ACHAH', ' ',$content);//curriculum code 
        $content = str_replace('ACHGE', ' ',$content);//curriculum code 
        $content = str_replace('ACHMH', ' ',$content);//curriculum code 
        $content = str_replace('ACSSU', ' ',$content);//curriculum code 
        $content = str_replace('ACHASS', ' ',$content);//curriculum code 
        $content = str_replace('ACDSEH', ' ',$content);//curriculum code 
        $content = str_replace('ACOKFH', ' ',$content);//curriculum code 
        $content = str_replace('ACHHS', ' ',$content);//curriculum code 
        $content = str_replace('ACHGK', ' ',$content);//curriculum code 
        $content = str_replace('ACHGS', ' ',$content);//curriculum code 
        $content = str_replace('ACHCK', ' ',$content);//curriculum code 
        $content = str_replace('ACHCS', ' ',$content);//curriculum code 
        $content = str_replace('ACHES', ' ',$content);//curriculum code         
        $content = str_replace('ACHEK', ' ',$content);//curriculum code
        $content = str_replace('ACSHE', ' ',$content);//curriculum code  
        $content = str_replace('ACSIS', ' ',$content);//curriculum code
        $content = str_replace('ACMMG', ' ',$content);//curriculum code
        $content = str_replace('ACELT', ' ',$content);//curriculum code
        $content = str_replace('ACADAM', ' ',$content);//curriculum code
        $content = str_replace('ACADRM', ' ',$content);//curriculum code
        $content = str_replace('ACAMAM', ' ',$content);//curriculum code
        $content = str_replace('ACAMUM', ' ',$content);//curriculum code
        $content = str_replace('ACAVAM', ' ',$content);//curriculum code
        $content = str_replace('ACTDEK', ' ',$content);//curriculum code
        $content = str_replace('ACTDEP', ' ',$content);//curriculum code
        $content = str_replace('ACTDIK', ' ',$content);//curriculum code
        $content = str_replace('ACTDIP', ' ',$content);//curriculum code
        $content = str_replace('ACPMP', ' ',$content);//curriculum code
        $content = str_replace('ACLARC', ' ',$content);//curriculum code
        $content = str_replace('ACLARU', ' ',$content);//curriculum code
        $content = str_replace('ACLASFC', ' ',$content);//curriculum code
        $content = str_replace('ACLASFU', ' ',$content);//curriculum code
        $content = str_replace('ACLCHC', ' ',$content);//curriculum code
        $content = str_replace('ACLCHU', ' ',$content);//curriculum code
        $content = str_replace('ACLFWC', ' ',$content);//curriculum code
        $content = str_replace('ACLFWU', ' ',$content);//curriculum code
        $content = str_replace('AACLCLE', ' ',$content);//curriculum code
        $content = str_replace('ACLCLU', ' ',$content);//curriculum code
        $content = str_replace('ACLFRC', ' ',$content);//curriculum code
        $content = str_replace('ACLFRU', ' ',$content);//curriculum code
        $content = str_replace('ACLGEC', ' ',$content);//curriculum code
        $content = str_replace('ACLGEU', ' ',$content);//curriculum code
        $content = str_replace('ACLHIC', ' ',$content);//curriculum code
        $content = str_replace('ACLHIU', ' ',$content);//curriculum code
        $content = str_replace('ACLINC', ' ',$content);//curriculum code
        $content = str_replace('ACLINU', ' ',$content);//curriculum code
        $content = str_replace('ACLITC', ' ',$content);//curriculum code
        $content = str_replace('ACLITU', ' ',$content);//curriculum code
        $content = str_replace('ACLJAC', ' ',$content);//curriculum code
        $content = str_replace('ACLJAU', ' ',$content);//curriculum code
        $content = str_replace('ACLKOU', ' ',$content);//curriculum code
        $content = str_replace('ACLKOC', ' ',$content);//curriculum code
        $content = str_replace('ACLMGC', ' ',$content);//curriculum code
        $content = str_replace('ACLMGU', ' ',$content);//curriculum code
        $content = str_replace('ACLSPC', ' ',$content);//curriculum code
        $content = str_replace('ACLSPU', ' ',$content);//curriculum code
        $content = str_replace('ACLTUC', ' ',$content);//curriculum code
        $content = str_replace('ACLTUU', ' ',$content);//curriculum code
        $content = str_replace('ACLVIC', ' ',$content);//curriculum code
        $content = str_replace('ACLVIU', ' ',$content);//curriculum code

        $content = str_replace('VCSSU', ' ',$content);//curriculum code
        $content = str_replace('VCPSCSE', ' ',$content);//curriculum code
        $content = str_replace('VCPSCSO', ' ',$content);//curriculum code
        $content = str_replace('VCCCTQ', ' ',$content);//curriculum code
        $content = str_replace('VCCCTM', ' ',$content);//curriculum code
        $content = str_replace('VCDSCD', ' ',$content);//curriculum code
        $content = str_replace('VCDSTS', ' ',$content);//curriculum code
        $content = str_replace('VCDSTC', ' ',$content);//curriculum code
        $content = str_replace('VCSIS', ' ',$content);//curriculum code
        $content = str_replace('VCICCB', ' ',$content);//curriculum code
        $content = str_replace('VCICCC', ' ',$content);//curriculum code
        $content = str_replace('VCICCD', ' ',$content);//curriculum code
        $content = str_replace('VCMNA', ' ',$content);//curriculum code
        $content = str_replace('VCDTDS', ' ',$content);//curriculum code
        $content = str_replace('VCMMG', ' ',$content);//curriculum code
        $content = str_replace('VCMSP', ' ',$content);//curriculum code
        $content = str_replace('VCDTCDI', ' ',$content);//curriculum code
        $content = str_replace('VCDTD', ' ',$content);//curriculum code
        $content = str_replace('VCCCG', ' ',$content);//curriculum code
        $content = str_replace('VCCCL', ' ',$content);//curriculum code
        $content = str_replace('VCCCC', ' ',$content);//curriculum code
        $content = str_replace('VCEBR', ' ',$content);//curriculum code
        $content = str_replace('VCEBC', ' ',$content);//curriculum code
        $content = str_replace('VCEBB', ' ',$content);//curriculum code
        $content = str_replace('VCEBW', ' ',$content);//curriculum code
        $content = str_replace('VCEBN', ' ',$content);//curriculum code
        $content = str_replace('VCEBE', ' ',$content);//curriculum code
        $content = str_replace('VCGGC', ' ',$content);//curriculum code
        $content = str_replace('VCGGK', ' ',$content);//curriculum code
        $content = str_replace('VCHHC', ' ',$content);//curriculum code
        $content = str_replace('VCHHK', ' ',$content);//curriculum code
        $content = str_replace('VCARC', ' ',$content);//curriculum code
        $content = str_replace('VCARU', ' ',$content);//curriculum code
        $content = str_replace('VCASFC', ' ',$content);//curriculum code
        $content = str_replace('VCASFU', ' ',$content);//curriculum code
        $content = str_replace('VCASFC', ' ',$content);//curriculum code
        $content = str_replace('VCZHC', ' ',$content);//curriculum code
        $content = str_replace('VCZHU', ' ',$content);//curriculum code
        $content = str_replace('VCGRCE', ' ',$content);//curriculum code
        $content = str_replace('VCGRCU', ' ',$content);//curriculum code
        $content = str_replace('VCFRC', ' ',$content);//curriculum code
        $content = str_replace('VCFRU', ' ',$content);//curriculum code
        $content = str_replace('VCDEC', ' ',$content);//curriculum code
        $content = str_replace('VCDEU', ' ',$content);//curriculum code
        $content = str_replace('VCHIC', ' ',$content);//curriculum code
        $content = str_replace('VCHIU', ' ',$content);//curriculum code
        $content = str_replace('VCIDC', ' ',$content);//curriculum code
        $content = str_replace('VCIDU', ' ',$content);//curriculum code
        $content = str_replace('VCITC', ' ',$content);//curriculum code
        $content = str_replace('VCITU', ' ',$content);//curriculum code
        $content = str_replace('VCJAC', ' ',$content);//curriculum code
        $content = str_replace('VCJAU', ' ',$content);//curriculum code
        $content = str_replace('VCKOC', ' ',$content);//curriculum code
        $content = str_replace('VCKOU', ' ',$content);//curriculum code
        $content = str_replace('VCLAE', ' ',$content);//curriculum code
        $content = str_replace('VCLAU', ' ',$content);//curriculum code
        $content = str_replace('VCELC', ' ',$content);//curriculum code
        $content = str_replace('VCELU', ' ',$content);//curriculum code
        $content = str_replace('VCNRC', ' ',$content);//curriculum code
        $content = str_replace('VCNRU', ' ',$content);//curriculum code
        $content = str_replace('VCRAC', ' ',$content);//curriculum code
        $content = str_replace('VCRAU', ' ',$content);//curriculum code
        $content = str_replace('VCESC', ' ',$content);//curriculum code
        $content = str_replace('VCESU', ' ',$content);//curriculum code
        $content = str_replace('VCTRC', ' ',$content);//curriculum code
        $content = str_replace('VCTRU', ' ',$content);//curriculum code
        $content = str_replace('VCLVC', ' ',$content);//curriculum code
        $content = str_replace('VCLVU', ' ',$content);//curriculum code
        $content = str_replace('VCVIC', ' ',$content);//curriculum code
        $content = str_replace('VCVIU', ' ',$content);//curriculum code
        $content = str_replace('VCADAP', ' ',$content);//curriculum code
        $content = str_replace('VCADAD', ' ',$content);//curriculum code
        $content = str_replace('VCADAR', ' ',$content);//curriculum code
        $content = str_replace('VCADAE', ' ',$content);//curriculum code
        $content = str_replace('VCADRD', ' ',$content);//curriculum code
        $content = str_replace('VCADRE', ' ',$content);//curriculum code
        $content = str_replace('VCADRR', ' ',$content);//curriculum code
        $content = str_replace('VCADRP', ' ',$content);//curriculum code
        $content = str_replace('VCAMAE', ' ',$content);//curriculum code
        $content = str_replace('VCAMAM', ' ',$content);//curriculum code
        $content = str_replace('VCAMAP', ' ',$content);//curriculum code
        $content = str_replace('VCAMAR', ' ',$content);//curriculum code
        $content = str_replace('VCAMUE', ' ',$content);//curriculum code
        $content = str_replace('VCAMUM', ' ',$content);//curriculum code
        $content = str_replace('VCAMUP', ' ',$content);//curriculum code
        $content = str_replace('VCAMUR', ' ',$content);//curriculum code
        $content = str_replace('VCAVAE', ' ',$content);//curriculum code
        $content = str_replace('VCAVAV', ' ',$content);//curriculum code
        $content = str_replace('VCAVAP', ' ',$content);//curriculum code
        $content = str_replace('VCAVAR', ' ',$content);//curriculum code
        $content = str_replace('VCAVCDE', ' ',$content);//curriculum code
        $content = str_replace('VCAVCDV', ' ',$content);//curriculum code
        $content = str_replace('VCAVCDR', ' ',$content);//curriculum code
        $content = str_replace('VCCCTR', ' ',$content);//curriculum code
        $content = str_replace('VCELA', ' ',$content);//curriculum code
        $content = str_replace('VCELT', ' ',$content);//curriculum code
        $content = str_replace('VCELY', ' ',$content);//curriculum code
        $content = str_replace('VCEALA', ' ',$content);//curriculum code
        $content = str_replace('VCEALC', ' ',$content);//curriculum code
        $content = str_replace('VCEALL', ' ',$content);//curriculum code
        $content = str_replace('VCECU', ' ',$content);//curriculum code
        $content = str_replace('VCECD', ' ',$content);//curriculum code

        //remove rich text html tags
        $content = strip_tags($content);

        //remove &nbsp
        $content = str_replace('&nbsp;', '. ',$content);

        //remove link (images are included in the tags so will be removed when tags are removed, hyperlink will also be removed with tag, the link text should be remove here)
        $linkPattern = "#(https\?:\/\/)\?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)#";
        $content = preg_replace($linkPattern, ' ', $content);


        return $content;
    }

    public function googleEntity($content){

        /*
            Google service setup
        */
        $cloud = new ServiceBuilder([
            'keyFilePath' => base_path('digitalCoP-111e9a161707.json'),
            'projectId' => 'digitalcop'
        ]);
        $language = $cloud->language();

        // Detect keywords
        $response = $language->analyzeEntities($content, [])->info()['entities'];

        /*
            keyword processing list
            $finalData for thredhold keywords, such as :counting more than 1? and indicator may also set a more then 0.01?
        */
        //save processed keywords
        $responseData = [];
        //safe filtered keywords
        $finalData = [];
        //calculate average salience
        $salienceList = [];
        $entityCount = 0;

        /*
            $researchData process
            data cleaning
        */
        foreach($response as $entity){

            $hasRomved = false;

            /*
                remove words with dot except acronym
                textRank has removed all the dot from all the word except acronym
            */
            if(strpos($entity['name'], '.') !== false){
                //find if it is a acronym strpos($key, '.')==1 lenth,  [3],[5]...is dot
                if(strpos($entity['name'], '.')==1){

                    $isAcronym = true;
                    for($i=1; $i<strlen($entity['name'])-1;$i+=2){
                        if(substr($entity['name'], $i,1)=='.'){
                            $isAcronym =false;
                        }
                    }

                    if($isAcronym){//if is Acronym leave in the list
                        
                    }else{ //if is not Acronym delete from the list
                        $hasRomved = true;
                    }
                }else if(strpos($entity['name'], '.')==strlen($entity['name'])-1){ //. is the end of the word , To simplicity remove these nodes
                    //CAN IMPROVE ALGORITHM
                    //remove the word by turn the flag
                    $hasRomved = true;

                }else{
                    //remove the word by turn the flag
                    $hasRomved = true;
                }
            }

            //eliminate all the numbers, price
            if($entity['type']== "NUMBER" || $entity['type']=="PRICE" || $entity['type']=='ADDRESS' ||  $entity['type']=='PHONE_NUMBER' || $entity['type']=='DATE' ){
                //remove the word by turn the flag
                $hasRomved = true;
            }

            /*
                process the data to save in $responseData
                data singlar and plural data cleaning
                merge google and textRank result
            */
            if($hasRomved!= true){
                foreach($entity['mentions'] as $mentions){

                    //parameter init
                    //pass singulated processed entity name
                    $entityName = $entity['name'];

                    //word pre processing
                    /*
                        singular plural work, remove turn plural to singular if the meaning is the same
                    */
                    //check if the word is not in the plural singular examption list
                    if(!in_array(Str::singular($entity['name']),$this->singluarExclution)){
                        $entityName = Str::singular($entity['name']);
                    }

                    /*
                        process proper noun and acronym
                        if the word been mentioned as a peroper noun, it will keep the capital letter otherwise all turned to lower case or it is a all capital (acronym) word
                    */
                    if($mentions['type'] =="PROPER" || strtoupper($entityName) == $entityName){
                        //if the word is all capital here only consider as acronym
                        if(strtoupper($entityName) == $entityName){
                            //acronym do nothing, keep all letter capital
                        }else{
                            //if the word is proper noun but not acronym make it first letter upcase
                            $entityName = ucwords($entityName);
                        }
                        
                    }else if(str_word_count($entityName)>1){
                        /*
                            process not proper noun or acronym
                        */
                        // if the word is not "PROPER" and longer than one word
                        $wordList = explode(' ', $entityName);

                        //if the word is not a acronym, turn the word to lower case one by one
                        $entityAssemble = '';
                        foreach($wordList as $wordEntity){
                            //if this single word is not acronym or proper noun (here take all capital letter word as proper noun all acronym)
                            if(strtoupper($wordEntity)!=$wordEntity){
                                $wordEntity = strtolower($wordEntity);
                            }
                            $entityAssemble = ($entityAssemble=='')? $wordEntity : $entityAssemble.' '.$wordEntity;
                        }
                        $entityName = $entityAssemble;
                    }else{
                        //if single word and not proper or acrynom set all lowercase
                        $entityName = strtolower($entityName);
                    }

                    /*
                        remove words from exclude list, these words are less interest and too common in school environment
                    */
                    if(!in_array(Str::singular($entityName),$this->excludeList)){
                        if (array_key_exists($entityName,$responseData)) {
                            //get the highest salient
                            if($responseData[$entityName]['salience']<$entity['salience']){
                                $responseData[$entityName]['salience'] = $entity['salience'];
                            }
                            //if mentions type == PROPER set to PROPER
                            if($responseData[$entityName]['subtype']!="PROPER" && $mentions['type']== 'PROPER'){
                                $responseData[$entityName]['subtype']=="PROPER";
                            }

                            $responseData[$entityName]['count'] += 1;
                        }else{
                            
                            $responseData[$entityName] = [ 
                                'type' => $entity['type'],
                                'subtype' => $mentions['type'], 
                                'count' => 1,
                                'salience' => $entity['salience']
                            ];
                        }

                        //push salience into array
                        $entityCount++;
                        array_push($salienceList,$entity['salience']);
                    }
                }
            }
        }

        //Log::info("+++++++++");
        //Log::info($responseData);

        /*
            calculate overall Salience average
        */
        $amount = count($salienceList);
        $varianceSalience = 0;
        $averageSalience = 0;
        $repeatedWordTag = 0;
        $nodeList = [];
        if($amount!= 0){
            $averageSalience = array_sum($salienceList)/count($salienceList);
            $varianceSalience = $this -> deviation($salienceList, $averageSalience,$amount);
            $repeatedWordTag = ($entityCount-$amount)/$amount; //word repeat ratio 
        }
        

        /*
            $finalData process
            filtering data 
        */
        // switch case
        $caseTag=0;
        //benchmark parameters
        $averageBenchmark = 0.5; //range[0-1]
        $repeatedWordBenchmark = 0.5;
        $deviationBenchmark = 0.25; //range [0-0.5] mean absolute deviation

        if($amount<=3){
            $caseTag=9;
        }else if($averageSalience <=$averageBenchmark && $repeatedWordTag >= $repeatedWordBenchmark){ //
            if($varianceSalience > $deviationBenchmark){ //variance very high
                $caseTag=1;    
             }else{ //variance very low
                $caseTag=2;  
            }
        }else if($averageSalience <=$averageBenchmark && $repeatedWordTag < $repeatedWordBenchmark){
            if($varianceSalience > $deviationBenchmark){ //variance very high
                $caseTag=3;    
             }else{ //variance very low
                $caseTag=4; 
            }
        }else if($averageSalience >$averageBenchmark && $repeatedWordTag >= $repeatedWordBenchmark ){
            if($varianceSalience > $deviationBenchmark){ //variance very high
                $caseTag=5;    
             }else{ //variance very low
                $caseTag=6; 
            }
        }else{
            if($varianceSalience > $deviationBenchmark){ //variance very high
                $caseTag=7;    
             }else{ //variance very low
                $caseTag=8; 
            }
        }

        //average hurdle parameters
        $topAverageHurdle = 1.25;
        $highAverageHurdle = 0.9;
        $middleAverageHurdle = 0.8;
        $lowAverageHurdle = 0.7;

        foreach($responseData as $key=>$filterData){
            $wordlist = explode(' ', $entityName);
            //get all the proper noun if not UNKNOWN
            if( $filterData['subtype'] == 'PROPER'&& ($filterData['type']=='LOCATION' ||$filterData['type']=='ORGANIZATION'||$filterData['type']=='EVENT' || $filterData['type']=='WORK_OF_ART' || $filterData['type']=='OTHER' || $filterData['type']=='PERSON' ||$filterData['type']=='CONSUMER_GOOD')){
                $finalData[$key] = $filterData;
                array_push($nodeList, $key);
            }else{
                switch ($caseTag) {
                    //not focus
                    case '1': //text not focused, word repeated a lot, variation high   //usually long text
                        if($filterData['salience']>$averageSalience){ //get above above average word
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    case '2': //text not focused, word repeated a lot, variation low
                        $adjustSalience = ($averageSalience * $topAverageHurdle)>=1?1:$averageSalience * $topAverageHurdle;
                        if($filterData['salience']>$adjustSalience || ( $filterData['salience']>$highAverageHurdle && $filterData['count']>1 )){ //get 80% above average word and 20% repeated word below average not 'other'
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    case '3': //text not focused, word not repeated a lot, variation high
                        if($filterData['salience']>$averageSalience || ($filterData['count']>1)){ //get above average word or repeated word
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    case '4': //text not focused, word not repeated a lot, variation low 
                        if($filterData['salience']>$averageSalience * $lowAverageHurdle && $filterData['count']>1){ //get 40% of repeated word
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    //focus
                    //word repeated alot
                    case '5': //text focused, word repeated a lot, variation high  
                        if($filterData['salience']>$averageSalience){ //get above average  && repeated word
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    case '6': //text focused, word repeated a lot, variation low
                        if($filterData['salience']>$averageSalience * $middleAverageHurdle && $filterData['count']>1){ //get repeated word 30% below average
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    //word not repeated a lot
                    case '7': //text focused, word not repeated a lot, variation high  //may be short text
                        if($filterData['salience']>$averageSalience || $filterData['count']>1){ //get above average word and 25% repeated word below average 
                            //get counnpand word
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    case '8': //text focused, word not repeated a lot, variation low
                        if($filterData['salience']>$averageSalience || $filterData['count']>1){ //get above average word and repeted word
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;

                    case '9': //keywords less than 3 //very short input
                        if($filterData['salience']>=$averageSalience || $filterData['count']>1){ //get above average word and repeted word to make sure at least one word will be in the list
                            $finalData[$key] = $filterData;
                            array_push($nodeList, $key);
                        }
                        break;
                    
                    default:
                        # code...
                        break;
                }
            }
        }

        return ['google'=>count($response), 'new'=>$responseData,'filter'=>$finalData, 'average'=> $averageSalience, 'variance' => $varianceSalience, 'nodeList' =>$nodeList];
    }

    private function deviation($arr, $avg, $count){
          
        $variance = 0.0; 
          
        foreach($arr as $i) 
        { 
            // sum of squares of differences between  
            // all numbers and means. 
            $variance += pow(($i - $avg), 2); 
        } 
        return (float)sqrt($variance/$count); 
    }


    public function APIindex($data){
        return Response::json($data);
    }

    public function APIview($data){
        return Response::json($data);
    }

}
