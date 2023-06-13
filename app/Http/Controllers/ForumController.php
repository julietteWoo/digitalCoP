<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ForumController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "forum";
	public $heading = "Forum";
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