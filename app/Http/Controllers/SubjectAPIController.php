<?php

namespace App\Http\Controllers;

use App\comment;
use Illuminate\Http\Request;
use Response;
use App\Models\User;
use App\Models\Node;
use App\Models\NodesNode;
use App\Models\NodesTopic;
use App\Models\Subject;
use App\Models\TeachingPlan;
use Google\Cloud\Core\ServiceBuilder;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;
use Auth;
use DB;

class SubjectAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI()
    {
        $data = $this->getSubjectList();

        return $this->APIindex($data);
    }

    // get list of subjects  
    private function getSubjectList(){
        return Subject::select("subjects.id",'subjects.subject')
                    ->get();
    }
}