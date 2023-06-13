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

class AdminReplyController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "admin_reply";
	public $heading = "Admin Management";
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $data = [
                "replies"=> $this->getReplyList()
            ];

            return $this->renderindex($data);
        }
        
    }

    private function getReplyList(){
        return Reply::select("replies.id","topics.title","replies.content","users.name as user", "topics.public","replies.updated_at")
                    ->join('users','user_id','=','users.id')
                    ->join('topics','topic_id','=','topics.id')
                    ->orderBy("replies.id")
                    ->get();
    }


    public function destroy(int $id, Request $request){
        //admin delete log
        Log::create(['user_id' => Auth::user()->id,
                        'function' => "AdminReplyController_Delete",
                        'data' =>""]);

        $input = $request->all();
        if($input["type"]=='reply'){
            $reply = Reply::find($id);
            if(Auth::user()->id == $reply['user_id'] || Auth::user()->type == 'admin'){
                
                //delete reply
                $reply -> delete();
            }else{
                error_log('only the owner and admin can delete the topic');
            }
        }
        else{
           return  "can not delete";
        }
        return redirect()->action("AdminReplyController@index");
        
    }   
}