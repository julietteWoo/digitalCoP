<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyTeachingPlansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('teaching_plans', function (Blueprint $table) {
            $table->string('title_node')->nullable(); //list node automaticlly saved from all the comment
        });
    }

    public function down()
    {
        
    }
}