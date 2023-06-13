<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Topic;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\Reply;
use App\Models\Log;

use Auth;
use DB;

class AdminController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "admin";
	public $heading = "Admin Forum";
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $data = [
                "topics"=> $this->getTopicList()
            ];

            return $this->renderindex($data);
        }
        
    }

    private function getTopicList(){
        return Topic::select("topics.id",'topics.title',"topics.content","users.name as user", DB::raw('Count(replies.id) as replies'), "topics.public" )
                    ->join('users','user_id','=','users.id')
                    ->leftJoin('replies','topics.id','=','replies.topic_id')
                    ->groupBy('topics.id')
                    ->get();
    }


    public function destroy(int $id, Request $request){
        //admin delete log
        Log::create(['user_id' => Auth::user()->id,
                        'function' => "AdminController_Delete",
                        'data' =>""]);

        $input = $request->all();
        if($input["type"]=='topic'){
            $topic = Topic::find($id);
            if(Auth::user()->id == $topic['user_id'] || Auth::user()->type == 'admin'){
                $this->deleteTopic($id, $topic);
            }else{
                error_log('only the owner and admin can delete the topic');
            }
        }
        else{
           return  "can not delete";
        }
        return redirect()->action("AdminController@index");
        
    }   
}