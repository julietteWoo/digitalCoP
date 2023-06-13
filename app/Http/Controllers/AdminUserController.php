<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Topic;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\Reply;
use App\Models\Log;
use Illuminate\Support\Facades\Hash;

use Auth;
use DB;

class AdminUserController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "adminUser";
	public $heading = "Admin User";
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $data = [
                "users"=> $this->getUserList()
            ];

            return $this->renderindex($data);
        }

    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $dataSet = [
                "userType" => $this->userType
            ];
            return $this->rendercreate($dataSet);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            //validate input
            $request->validate([
                'name' => 'required',
                'email' => 'required',
                'password' => 'required|min:8',
                'type' => 'required'
            ]);

            $input = $request->all();
            $input['password'] = Hash::make($input['password']);
            $user=User::create($input);

            session()->flash('flash_message', $user->name . ' has been created.');
            return redirect('/usermanagement');
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\comment  $comment
     * @return \Illuminate\Http\Response
     */
    public function edit(comment $comment)
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
    public function update(Request $request, comment $comment)
    {
        //
    }

    private function getUserList(){
        return User::select("users.id",'users.name',"users.email","users.type")
                    ->get();
    }


    public function destroy(int $id, Request $request){
        //admin delete log
        Log::create(['user_id' => Auth::user()->id,
                        'function' => "AdminUserController_Delete",
                        'data' =>""]);

        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $input = $request->all();
            if($input["type"]=='user'){
                $user = User::find($id);
                if(Auth::user()->type == 'admin'){

                    //get related topics
                    $topicList = Topic::where('user_id','=', $user['id'])->get();

                    foreach($topicList as $topic){
                        //delete related topics
                        $this->deleteTopic($topic['id'], $topic);
                    }

                    //delete related replies
                    //get all the topic list involving the user's reply
                    $relatedTopicList = Topic::select('topics.id')
                                    ->join('replies', 'replies.topic_id','=','topics.id')
                                    ->where('replies.user_id','=', $user['id'])
                                    ->get();
                    
                    $replyList = Reply::where('user_id','=', $user['id'])->get();

                    //delete replies
                    foreach($replyList as $reply){
                       $reply->delete();
                    }

                    //refresh related topics
                    foreach($relatedTopicList as $topic){
                        $this->updateTopicWithNodeList($topic['id']);
                    }

                    //delete user
                    session()->flash('flash_message', $user->name . ' has been deleted.');
                    $user->delete();
                }
            }else{
                return  "can not delete from admin";
            }

            return redirect()->action("AdminUserController@index");
        }
    } 

}