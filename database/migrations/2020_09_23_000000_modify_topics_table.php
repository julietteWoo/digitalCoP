<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyTopicsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('topics', function (Blueprint $table) {
            $table->longText('node_recommand'); //list node automaticlly saved from all the comment
            $table->double('sentiment_score')->nullable();
            $table->double('sentiment_magnitude')->nullable();
        });
    }

    public function down()
    {
        
    }
}