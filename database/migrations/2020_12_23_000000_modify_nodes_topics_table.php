<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyNodesTopicsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nodes_topics', function (Blueprint $table) {
            $table->integer('comment'); //connection from comment 1, connection from topic 0
        });
    }

    public function down()
    {
        
    }
}