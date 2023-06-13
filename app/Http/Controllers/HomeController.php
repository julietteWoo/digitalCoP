<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends BaseFrameworkController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $data = [];

        return view('home',[
            'data' => $data,
        ]);

    }
}
