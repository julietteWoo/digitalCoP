<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{

     protected $fillable = [
        'subject',
        'subject_group', // comment nodes
    ];

}