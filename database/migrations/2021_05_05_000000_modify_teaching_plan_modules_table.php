<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyTeachingPlanModulesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('teaching_plan_modules', function (Blueprint $table) {
            $table->string('content_group')->nullable(); //list node automaticlly saved from all the comment
        });
    }

    public function down()
    {
        
    }
}