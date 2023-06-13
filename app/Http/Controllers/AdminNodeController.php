<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Node;
use App\Models\Log;

use Auth;
use DB;

class AdminNodeController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "admin_node";
	public $heading = "Node Management";
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        if(Auth::user()!=null && Auth::user()->type == 'admin'){
            $data = [
                "nodes"=> $this->getNodeList()
            ];

            return $this->renderindex($data);
        }
        
    }

    private function getNodeList(){
        return Node::select("nodes.id","nodes.name","nodes.note")
                    ->orderBy("nodes.id")
                    ->get();
    }


    public function update(Request $request){
        //admin delete log
        Log::create(['user_id' => Auth::user()->id,
                        'function' => "AdminNodeController_Update",
                        'data' =>""]);
  
        $input = $request->all();
        error_log(implode('+',$input));
        $node = Node::find($input['id']);
        $node['note']=$input['note'];
        $node->update();
        return redirect()->action("AdminNodeController@index");
        
    }   
}