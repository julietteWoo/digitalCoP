<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherTeachingPlan extends Model
{

     protected $fillable = [
        'teacher_id',
        'teaching_plan_id'
    ];

    public function teacher()
    {
        return $this->belongsTo(Node::class, 'teacher_id');
    }

    public function teachingplan() 
    { 
         return $this->belongsTo(Node::class, 'teaching_plan_id'); 
    }
}