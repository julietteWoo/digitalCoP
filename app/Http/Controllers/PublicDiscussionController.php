<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PublicDiscussionController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "public";
	public $heading = "Public Discussion";
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