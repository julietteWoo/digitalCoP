<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use App\Http\Requests\PasswordRequest;
use App\Http\Requests;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Topic;
use App\Models\TeachingPlan;
use App\Models\TeachingPlanModule;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\Subject;
use Auth;
use Validator;
use Session;
use DB;


class DashboardController extends BaseFrameworkController
{
	public $folder = "dashboard";
	public $heading = "Dashboard";

	public function index() {

		$data = [
			//top bar items
			'num_nodes' => $this->getNodeNum(),
			'num_nodes_month' => $this->getNodesMonth(),
			'num_topics' => $this->getTopicsNum(),
			'num_topics_month' => $this->getTopicsMonth(),
			'num_teachingplans' => $this->getTeachinglansNum(),
			'num_teachingplans_month' => $this->getTeachinglansMonth(),
			'num_steam' => $this->getSteamNum(),
			'num_steam_month' => $this->getSteamMonth(),

			// DONUT chart
			'overall' => $this->getOverall(),
			'overall_value' => $this->getOverallValue(),
			'arts' => $this->getArts(),
			'arts_value' => $this->getArtsValue(),
			'stem' => $this->getStem(),
			'stem_value' => $this->getStemValue(),

			// PIE Chart 
			'subjects' => $this->getSubjects(),
			'subjects_value' => $this->getSubjectsValue(),

			//BAR chart
			'node_subject'=> $this->getSubjects(),
			'node_subject_value'=> $this->getNodeSubjectsValue(),

			//TABLE
			'common_nodes' => $this->getMostConnectNodes(),
			'update_nodes' => $this->getNewestUpdateNodes(),
			'new_nodes' => $this->getNewNodes(),
			'hot_topics' => $this->getHotTopics(),
			'update_topics' => $this->getNewestUpdateTopics(),
			'new_topics' => $this->getNewTopics(),
			'discussion' => $this->getDiscussion()


		];
		// return $data;  //this is for testing and debug

		return $this->renderindex($data);
	}


	// -----------------------------------------------------------------------------------------
	// TOP UNITS
	// -----------------------------------------------------------------------------------------
	private function getNodeNum(){
		
		//return sizeOf($node);
		$nodeNumber = Node::select('nodes.id')
                ->get()->count();
		return $nodeNumber;
	}

	private function getNodesMonth(){
		$nodeMonthNumber = Node::select('nodes.id')
								->whereMonth('created_at', Carbon::now()->month)
                        		->get()->count();
		return $nodeMonthNumber;
	}

	private function getTopicsNum(){
		
		$topicNumber = Topic::select('topics.id')
						->where('topics.public','!=', 'public')
                        ->get()->count();
		return $topicNumber;
	}

	private function getTopicsMonth(){
		
		$topicNumberMonth = Topic::select('topics.id')
								->where('topics.public','!=', 'public')
								->whereMonth('created_at', Carbon::now()->month)
                        		->get()->count();
		return $topicNumberMonth;
	}

	private function getTeachinglansNum(){
		
		$teachingplanNumber = TeachingPlan::select('teaching_plans.id')
                        ->get()->count();
		return $teachingplanNumber;
	}

	private function getTeachinglansMonth(){
		
		$teachingplanMonth = TeachingPlan::select('teaching_plans.id')
						->whereMonth('created_at', Carbon::now()->month)
                		->get()->count();
		return $teachingplanMonth;
	}

	private function calculateSTEAM($steamTeachingPlan){
		$steamNumber = 0;
		foreach($steamTeachingPlan as $key =>$TP){
			$steamTeachingPlan[$key]=$TP->groupBy('subject_group');
			if(count($steamTeachingPlan[$key])>1){
				$artFlag = 0;
				$stemFlag = 0;
				foreach($steamTeachingPlan[$key] as $subjectKey =>$subjectTP){
					if($subjectKey=='Arts'){
						$artFlag =1;
					}else{
						$stemFlag=1;
					}
				}
				if($artFlag==1 && $stemFlag==1){
					$steamNumber ++;
				}

			}
		};

		return $steamNumber;
	}

	private function getSteamNum(){
		
		$steamTeachingPlan = TeachingPlanModule::select('teaching_plan_id','subjects.subject_group')
					->join('subjects','subject_id','=','subjects.id')
					->get()
					->groupBy('teaching_plan_id');

		return $this->calculateSTEAM($steamTeachingPlan);
	}

	private function getSteamMonth(){
		
		$steamMonth = TeachingPlanModule::select('teaching_plan_id','subjects.subject_group')
					->join('subjects','subject_id','=','subjects.id')
					->whereMonth('teaching_plan_modules.created_at', Carbon::now()->month)
					->get()
					->groupBy('teaching_plan_id');

		return $this->calculateSTEAM($steamMonth);
	}

	// -----------------------------------------------------------------------------------------
	// MIDDLE SECTION-- DONUT CHARTS
	// -----------------------------------------------------------------------------------------
	private function getOverall(){
		
		$overallData = "Arts|Science|Technology|Engineering|Mathematics";
		return $overallData;
	}

	private function getOverallValue(){
		

		$overallValueData = $this->getOverallData();
		return implode("|", $overallValueData);
	}

	private function getOverallData(){
		$nodeSubjectList = Subject::select("subjects.subject_group",'nodes_teaching_plans.node_id','teaching_plans.id as tp','teaching_plan_modules.id as moduleID')
						->join('teaching_plan_modules','subjects.id','=','teaching_plan_modules.subject_id')
						->join('teaching_plans','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
						->join('nodes_teaching_plans', 'teaching_plans.id','=','nodes_teaching_plans.teaching_plan_id')
						->groupby('moduleID')
						->groupby('tp')
						->groupby('node_id')
						->get()
						->groupby('subject_group')
						->toArray();

		$nodeSubjectValueOverallData =[];

		$subjectList = ["Arts","Science","Technology","Engineering","Mathematics"];
		foreach($subjectList as $subject ){
			// if(array_key_exists($subject['subject'],$nodeSubjectList)){
			if(array_key_exists($subject,$nodeSubjectList)){
				array_push($nodeSubjectValueOverallData, count($nodeSubjectList[$subject]));
			}else{
				array_push($nodeSubjectValueOverallData, 0);
			}
		}

		$sum= array_sum($nodeSubjectValueOverallData);
			
		$nodeSubjectValueOverallData = array_map(function($n) use ($sum){
			if($sum==0){
				return 0;
			}else{
				return number_format($n*100/$sum, 2);
			}
		}, $nodeSubjectValueOverallData);

		return $nodeSubjectValueOverallData;
	}

	private function getArts(){
		
		$artsData = $this->getArtsSubject();

		return implode('|',$artsData);
	}

	private function getArtsSubject(){
		
		$artsData = Subject::select('subject')->where('subject_group','=','Arts')->get()->toArray();

		$nodeSubjectData = array_map(function($n){
			return $n['subject'];
		}, $artsData);

		return $nodeSubjectData;
	}

	private function getArtsValue(){

		$artsList = Subject::select("subjects.subject",'nodes_teaching_plans.node_id','teaching_plans.id as tp','teaching_plan_modules.id as moduleID')
						->join('teaching_plan_modules','subjects.id','=','teaching_plan_modules.subject_id')
						->join('teaching_plans','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
						->join('nodes_teaching_plans', 'teaching_plans.id','=','nodes_teaching_plans.teaching_plan_id')
						->where('subjects.subject_group','=','Arts')
						->groupby('moduleID')
						->groupby('tp')
						->groupby('node_id')
						->get()
						->groupby('subject')
						->toArray();

		$artsValueData =[];

		$subjectList = $this->getArtsSubject();
		foreach($subjectList as $subject ){
			// if(array_key_exists($subject['subject'],$nodeSubjectList)){
			if(array_key_exists($subject,$artsList)){
				array_push($artsValueData, count($artsList[$subject]));
			}else{
				array_push($artsValueData, 0);
			}
		}

		$sum= array_sum($artsValueData);

		$artsValueData = array_map(function($n) use ($sum){
			if($sum==0){
				return 0;
			}else{
				return number_format($n*100/$sum, 2);
			}
		}, $artsValueData);
		
		return implode('|',$artsValueData);
	}

	private function getStem(){
		
		$stemData = $this->getStemSubject();
		return implode('|',$stemData);
	}

	private function getStemSubject(){
		
		$artsData = Subject::select('subject')->where('subject_group','!=','Arts')->get()->toArray();

		$nodeSubjectData = array_map(function($n){
			return $n['subject'];
		}, $artsData);

		return $nodeSubjectData;
	}

	private function getStemValue(){
		
		$stemList = Subject::select("subjects.subject",'nodes_teaching_plans.node_id','teaching_plans.id as tp','teaching_plan_modules.id as moduleID')
						->join('teaching_plan_modules','subjects.id','=','teaching_plan_modules.subject_id')
						->join('teaching_plans','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
						->join('nodes_teaching_plans', 'teaching_plans.id','=','nodes_teaching_plans.teaching_plan_id')
						->where('subjects.subject_group','!=','Arts')
						->groupby('moduleID')
						->groupby('tp')
						->groupby('node_id')
						->get()
						->groupby('subject')
						->toArray();

		$stemValueData =[];

		$subjectList = $this->getStemSubject();
		foreach($subjectList as $subject ){
			// if(array_key_exists($subject['subject'],$nodeSubjectList)){
			if(array_key_exists($subject,$stemList)){
				array_push($stemValueData, count($stemList[$subject]));
			}else{
				array_push($stemValueData, 0);
			}
		}

		$sum= array_sum($stemValueData);

		$stemValueData = array_map(function($n) use ($sum){
			if($sum==0){
				return 0;
			}else{
				return number_format($n*100/$sum, 2);
			}
		}, $stemValueData);
		
		return implode('|',$stemValueData);
	}

	// -----------------------------------------------------------------------------------------
	// THIRD SECTION-- PIE and BAR
	// -----------------------------------------------------------------------------------------
	//PIE
	private function getSubjects(){
		
		return implode ("|", $this->getNodeSubjects());
	}

	private function getSubjectsValue(){

		$subjectValue = $this->getNodeSubjectsValueData();
		$sum = array_sum($subjectValue);

		$subjectValueData = array_map(function($n) use ($sum){
			if($sum==0){
				return 0;
			}else{
				return $n/$sum;
			}
		},$subjectValue);

		//return implode ("|", $subjectData)
		return implode ("|", $subjectValueData);
	}

	//BAR
	private function getNodeSubjects(){

		$nodeSubjectList = Subject::select('subjects.subject')->get()->toArray();

		$nodeSubjectData = array_map(function($n){
			return $n['subject'];
		}, $nodeSubjectList);

		return $nodeSubjectData;
	}

	private function getNodeSubjectIds(){

		$nodeSubjectData = Subject::select('subjects.id')->get();

		return $nodeSubjectData;
	}

	private function getNodeSubjectsValue(){

		$nodeSubjectValueData = $this->getNodeSubjectsValueData();

		return implode ("|", $nodeSubjectValueData);
	}

	private function getNodeSubjectsValueData(){

		$nodeSubjectList = Subject::select("subjects.id",'nodes_teaching_plans.node_id','teaching_plans.id as tp','teaching_plan_modules.id as moduleID')
						->join('teaching_plan_modules','subjects.id','=','teaching_plan_modules.subject_id')
						->join('teaching_plans','teaching_plans.id','=','teaching_plan_modules.teaching_plan_id')
						->join('nodes_teaching_plans', 'teaching_plans.id','=','nodes_teaching_plans.teaching_plan_id')
						->groupby('moduleID')
						->groupby('tp')
						->groupby('node_id')
						->get()
						->groupby('id')
						->toArray();
		$nodeSubjectValueData =[];

		$subjectList = $this->getNodeSubjectIds();
		foreach($subjectList as $subject ){
			// if(array_key_exists($subject['subject'],$nodeSubjectList)){
			if(array_key_exists($subject['id'],$nodeSubjectList)){
				array_push($nodeSubjectValueData, count($nodeSubjectList[$subject['id']]));
			}else{
				array_push($nodeSubjectValueData, 0);
			}
		}

		return $nodeSubjectValueData;
	}

	// -----------------------------------------------------------------------------------------
	// FOURTH SECTION-- tables
	// -----------------------------------------------------------------------------------------
	private function getMostConnectNodes(){

		$nodesMostData = Node::Select('name','id')
							->orderBy('count','desc')
							->limit(5)
							->get();
		$nodesMostData = $this->dataMap($nodesMostData->toArray());
		return $nodesMostData;
	}

	private function getNewestUpdateNodes(){

		$nodesUpdateData = Node::Select('name','id')
							->orderBy('updated_at','desc')
							->where('count','!=',0)
							->limit(5)
							->get();
		$nodesUpdateData = $this->dataMap($nodesUpdateData->toArray());
		return $nodesUpdateData;
	}

	private function getNewNodes(){

		$nodesCreatedData = Node::Select('name','id')
							->orderBy('created_at','desc')
							->where('count','!=',0)
							->limit(5)
							->get();
		$nodesCreatedData = $this->dataMap($nodesCreatedData->toArray());
		return $nodesCreatedData;
	}

	private function getHotTopics(){

		$topicsHotData = Topic::Select('topics.title',DB::raw('Count(replies.id) as replies'),'topics.id')
								->leftJoin('replies','topics.id','=','replies.topic_id')
								->where('topics.public','!=','public')
								->groupBy('topics.id')
								->orderBy('replies','desc')
								->limit(5)
								->get();
		return $topicsHotData;
	}

	private function getNewestUpdateTopics(){

		$topicsUpdateData = Topic::Select('topics.title','topics.id')
								->where('topics.public','!=','public')
								->orderBy('updated_at','desc')
								->limit(5)
								->get();
		return $topicsUpdateData;
	}

	private function getNewTopics(){

		$topicsNewData = Topic::Select('topics.title','topics.id')
								->where('topics.public','!=','public')
								->orderBy('created_at','desc')
								->limit(5)
								->get();
		return $topicsNewData;
	}

	private function getDiscussion(){

		$discussionNewData = Topic::Select('topics.id','topics.title',DB::raw('Count(replies.id) as replies'),'nodes.name')
								->where('topics.public','=','public')
								->leftJoin('replies','topics.id','=','replies.topic_id')
								->leftJoin('nodes','topics.start_point','=','nodes.name')
								->groupBy('topics.id')
								->orderBy('replies','desc')
								->limit(5)
								->get();
		return $discussionNewData;
	}

}