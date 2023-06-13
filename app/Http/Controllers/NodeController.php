<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NodeController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public $folder = "idea";
	public $heading = "Get Ideas";
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