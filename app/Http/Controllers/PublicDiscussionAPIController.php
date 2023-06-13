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
use Google\Cloud\Core\ServiceBuilder;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;
use Auth;
use DB;

class PublicDiscussionAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI()
    {
        $data = $this->getDiscussionList();
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

        $data = $this->getDiscussion($input['id']);

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

            //put score and magnitude to database table
            $input['sentiment_score'] = null;
            $input['sentiment_magnitude'] = null;
            $input['node_list'] = '';
            $input['node_recommand'] = '';
            $topic = Topic::create($input);
            return ["public"=>'this is for public section'];
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
        $topic->update($input);
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
    private function getDiscussionList(){
        
        $topicList = Topic::select('topics.id','title','users.name as author','topics.updated_at', DB::raw('Count(replies.id) as replies'),'topics.start_point')
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','=','public')
                        ->leftJoin('replies','topics.id','=','replies.topic_id')
                        ->groupBy('topics.id')
                        ->orderBy('topics.updated_at','Desc')
                        ->get();
        return $topicList;
    }

    //get single topic
    private function getDiscussion(int $id){
        
        $topic = Topic::select('topics.id','user_id','title','content','users.name as author','topics.updated_at', 'topics.start_point', 'topics.node_recommand','topics.node_list')
                        ->join('users','user_id','=','users.id')
                        ->where('topics.public','=','public')
                        ->where('topics.id','=',$id)
                        ->get()
                        ->first();
        return $topic;
    }
}