<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NodesNode extends Model
{

     protected $fillable = [
        'first_node_id',
        'second_node_id',
        'count', //when the reply updated, this field update. can be null
    ];

    public function firstnodes()
    {
        return $this->belongsTo(Node::class, 'first_node_id');
    }

    public function secondnodes() 
    { 
         return $this->belongsTo(Node::class, 'second_node_id'); 
    }
}