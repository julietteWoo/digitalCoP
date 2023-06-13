<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NodesTopic extends Model
{

     protected $fillable = [
        'node_id',
        'topic_id',
        'comment'
    ];

    public function nodes()
    {
        return $this->belongsTo(Node::class, 'node_id');
    }

    public function topics() 
    { 
         return $this->hasMany(Node::class, 'topic_id'); 
    }
}