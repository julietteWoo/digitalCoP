<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reply extends Model
{

     protected $fillable = [
        'user_id',
        'topic_id',
        'content',
        'sentiment_score',
        'sentiment_magnitude',
        'STEAM',
        'subjects'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

}