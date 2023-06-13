<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Response;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

use Session;
use Auth;

class ImageAPIController extends BaseAPIFrameworkController
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function indexAPI(Request $request)
    {
        // $input = $request->all();

        // $data = $this->getCommentList($input['id']);

        // return $this->APIindex($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeAPI(Request $request)
    {
        if ($request->hasFile('image')) {
            //  Let's do everything here
            if ($request->file('image')->isValid()) {
                //
                $validated = $request->validate([
                    'image' => 'image|max:1014',
                ]);

                $fileName = pathinfo($request->file('image')->getClientOriginalName(),PATHINFO_FILENAME).time();

                Storage::disk('s3') ->put($fileName,fopen($request->file('image'),'r+'));
                $url = Storage::disk('s3') ->url($fileName);
                Session::flash('success', "Success!");
                return $url;
            }else{
                return null;
            }
        }else{
            return null;
        }

        // finally return image url

    }

}