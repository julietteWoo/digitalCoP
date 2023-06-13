<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TimesheetAPIController extends BaseFrameworkController
{
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $data = [];

        return $this->APIindex([
            'data' => $data,
        ]);

    }
}