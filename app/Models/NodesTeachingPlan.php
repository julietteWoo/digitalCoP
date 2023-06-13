<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NodesTeachingPlan extends Model
{

     protected $fillable = [
        'node_id',
        'teaching_plan_id'
    ];

    public function nodes()
    {
        return $this->belongsTo(Node::class, 'node_id');
    }

    public function teachingplan() 
    { 
         return $this->hasMany(Node::class, 'teaching_plan_id'); 
    }
}