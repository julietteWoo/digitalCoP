<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeachingPlan extends Model
{

     protected $fillable = [
        'user_id',
        'title',
        'content',
        'node_list', // nodes
        'allow_collaboration_flag',//allow collaboration or not
        'public',//show to public or not
        'title_node',
        'category' //shows the type of the teaching plan

    ];

    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

}