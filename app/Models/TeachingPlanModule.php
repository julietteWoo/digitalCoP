<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeachingPlanModule extends Model
{

     protected $fillable = [
        'user_id',
        'teaching_plan_id',
        'subject_id',
        'content_title',
        'content',
        'content_group'
    ];

    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

    public function teachingplan(){
        return $this->belongsTo(TeachingPlan::class, 'teaching_plan_id');
    }

}