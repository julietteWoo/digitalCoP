<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TimesheetController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

 public $folder = "timesheet";
    public $heading = "Timesheet";
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $data = [];

        return $this->renderindex([
            'data' => $data,
        ]);

    }
}