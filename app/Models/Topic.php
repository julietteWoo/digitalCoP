<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{

     protected $fillable = [
        'user_id',
        'title',
        'content',
        'start_point',// the topic title nodes
        'node_list', // comment nodes
        'latest_reply_update', //when the reply updated, this field update. can be null
        'sentiment_score',
        'sentiment_magnitude',
        'node_recommand', //content nodets
        'public',//show to public or not

    ];

    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

    // public function index()
    // {

    //     $comments = request()->user()->tasks;

    //     return response()->json([
    //         'comments' => $comments,
    //     ], 200);
    // }

    public function replies(){
        return $this->hasMany(Reply::class, 'topic_id');
    }
}
