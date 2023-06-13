<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Response;
use App\Models\User;
use App\Models\Reply;
use App\Models\Topic;
use App\Models\NodesTopic;
use App\Models\NodesNode;
use App\Models\Node;
use Illuminate\Support\Facades\Log;

use Auth;

class CommentAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI(Request $request)
    {
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
    public function storeAPI(Request $request)
    {
        // set inputs
        $input = $request->all();
        $publicFlag = true; //true means it is not a public topic

        //setup subject suggession fields
        $input['STEAM'] = array_key_exists('STEAM', $input)? implode(",",$input['STEAM']) : null;
        $input['subjects'] = array_key_exists('subjects', $input)? implode(",",$input['subjects']) : null;

        //pass value to clean up content
        $content = $this->cleanUpContent($input['content']);

        //call google sentiment
        $sentiment = $this->googleSentiment($content);

        //put score and magnitude to database table
        $input['sentiment_score'] = $sentiment['score'];
        $input['sentiment_magnitude'] = $sentiment['magnitude'];

        if(array_key_exists('public_flag', $input) && $input['public_flag'] == 'public'){
            unset($input['public_flag']); //remove the public mark before save to the database//comment data table do not have publicFlag column.
            $publicFlag = false;
        }

        // save topic fields
        $reply = Reply::create($input);

        //update topic
        //do not need to update the updated time for topic here
        //$this->updateTopic($reply->topic_id);
        //use this instead
        if($publicFlag==true){

            $this->updateTopicWithNodeList($reply->topic_id);
        }

        // finally return topic
        return $reply;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function view(comment $comment)
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
    public function updateAPI(Request $request)
    {
        $input = $request->all();
        $reply = Reply::find($input['id']);
        $publicFlag = true; //true means it is not a public topic

        //pass value to clean up content
        $content = $this->cleanUpContent($input['content']);

        //call google sentiment
        $sentiment = $this->googleSentiment($content);

        //put score and magnitude to database table
        $input['sentiment_score'] = $sentiment['score'];
        $input['sentiment_magnitude'] = $sentiment['magnitude'];


         //setup subject suggession fields
        $input['STEAM'] = array_key_exists('STEAM', $input)? implode(",",$input['STEAM']) : null;
        $input['subjects'] = array_key_exists('subjects', $input)? implode(",",$input['subjects']) : null;
        
        //update comment
        if(Auth::user()->id == $reply['user_id'] || Auth::user()->type == 'admin'){

            if(array_key_exists('public_flag', $input) && $input['public_flag'] == 'public'){
                unset($input['public_flag']); //remove the public mark before save to the database//comment data table do not have publicFlag column.
                $publicFlag = false;
            }

            $reply->update($input);

            //update topic
            //do not need to update toipc updated time
            //$this->updateTopic($reply->topic_id);
            //use this instead
            if($publicFlag==true){
                $this->updateTopicWithNodeList($reply->topic_id);
            }
        }else{
            error_log('only the owner and adin can update the comment');
        }
        return $reply;
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
        $reply = Reply::find($input['id']);
        $publicFlag = true; //true means it is not a public topic
        error_log("test1");
        if(Auth::user()->id == $reply['user_id'] || Auth::user()->type == 'admin'){
            $reply->delete();
             
            if(array_key_exists('public_flag', $input) && $input['public_flag'] == 'public'){
                $publicFlag = false;
            }
            //update topic
            if($publicFlag==true){
                $this->updateTopicWithNodeList($reply->topic_id);
            }
        }else{
            error_log('only the owner and admin can delete the comment');
        }
    }

    //get comment list
    private function getCommentList(int $id){

        $comment = ['node_list' => Topic::find($id)['node_list'] == ''? null:Topic::find($id)['node_list'],
                    'replies' => Reply::select('replies.id','user_id','content','users.name as author','replies.updated_at','STEAM','subjects')
                                    ->join('users','replies.user_id','=','users.id')
                                    ->where('topic_id','=',$id)
                                    ->orderBy('replies.id')
                                    ->get()];
        return $comment;
    }

    private function updateTopic(int $id){
        //find the topic
        $topic = Topic::find($id);
        $topic->touch();
    }
}