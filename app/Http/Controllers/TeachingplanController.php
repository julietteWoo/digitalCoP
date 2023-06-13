<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TeachingplanController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "teaching_plan";
	public $heading = "Teaching Plan";
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