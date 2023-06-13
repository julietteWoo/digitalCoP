<?php
/*
 This is the WY Partnership framework file
 - Auth Middleware in constructor
 - Default renderviews
 - supporting functions
 - Static & dynamic selection arrays
 - Email function
*/


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Http\Requests;
use App\Models\User;
use App\Models\Topic;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\Reply;

use Config;
use Auth;
use Mail;
use Validator;
use Session;


class BaseFrameworkController extends Controller
{
    // Constructor
    public function __construct() {
    	 // go pass the auth middle to check for authentication
         $this->middleware('auth');
    }


    // Common Variables
    public $folder = null;
    public $heading = null;
    public $subheading = null;

    /*
    The below is a list of static Enums for Selection purposes common to any applications
    */
    //define user type
    public $userType = [
        "admin" => "admin",
        "teacher" => "teacher",
        "profession" => "profession",
        "community" => "community"
    ];

    // This is the main render function in Framework controller
    public function render($folder, $view, $heading, $subheading, $data, $itemID,$dataSet ){

        // returning the view
        return view('layouts.main', [
            'folder' => $folder,
            'view' => $view,
            'heading' => $heading,
            'subheading' => $subheading,
            'data' => $data,
            'itemID' => $itemID,
            'dataSet' => $dataSet,
        ]);
    }

    private function getUserList(){
        $allusers = User::select("users.id",'users.name')
                    ->where('users.type','!=', 'community')
                    ->where('users.name','!=', 'testeacher')
                    ->orderBy('users.name','Asc')
                    ->get();
        return $allusers;
    }

    public function renderindex($data){
        $data=array_merge($data, ['userlist'=>$this->getUserList()]);
        return $this->render($this->folder, "index", $this->heading, $this->subheading, $data, '','' );
    }

    public function renderindexdataset($data,$dataSet){
        $data=array_merge($data, ['userlist'=>$this->getUserList()]);
        return $this->render($this->folder, "index", $this->heading, $this->subheading, $data, '',$dataSet );
    }

    public function rendershow($data){
        $data=array_merge($data, ['userlist'=>$this->getUserList()]);
        return $this->render($this->folder, "show", $this->heading, $this->subheading,$data, $data['id'],'' );
    }

    public function rendershowdataset($data,$dataSet){
        $data=array_merge($data, ['userlist'=>$this->getUserList()]);
        return $this->render($this->folder, "show", $this->heading, $this->subheading, $data, $data->id,$dataSet );
    }

    public function rendercreate($dataSet){
        $data=['userlist'=>$this->getUserList()];
        return $this->render($this->folder, "create", $this->heading, $this->subheading,$data, '', $dataSet);
    }

    public function renderedit($data, $dataSet){
        $data=array_merge($data, ['userlist'=>$this->getUserList()]);
        return $this->render($this->folder, "edit", $this->heading, $this->subheading,$data, $data->id, $dataSet);
    }

    public function rendernorecord(){

        return $this->render('', "norecord", $this->heading, $this->subheading, '', 0,'' );
    }


    public function rendernoaccess(){
        return $this->render('', "noaccess", 'No Access', '', '', 0,'' );
    }

    public function deleteTopic($id, $topic){
        /* 
            delete all related things
        */
        //find related nodes
        $nodesTopic = NodesTopic::select("node_id")
                            ->where('topic_id' ,'=', $id);
       
        //get topic start nodes and cotent nodes
        $topicTitleNode = explode(',',$topic['start_point']);
        $topicContentNode = explode(',',$topic['node_recommand']);
        $topicCommentNode = explode(',',$topic['node_list']);

        //reduce nodes connection or delete nodes connection
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
        $this->deleteOrUpdateNodes($topicCommentNode);

        //find comment and delete
        $topic->replies()->delete();

        //delete topic
        $topic -> delete();
    }

    public function dataMap(array $myArray){
        return array_map(function($row){
            return $row['name'];
        }, $myArray);
    }
}