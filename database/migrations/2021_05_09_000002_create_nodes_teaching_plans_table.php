<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNodesTeachingPlansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nodes_teaching_plans', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('node_id')->unsigned();
            $table->foreign('node_id')->references('id')->on('nodes');
            $table->bigInteger('teaching_plan_id')->unsigned();
            $table->foreign('teaching_plan_id')->references('id')->on('teaching_plans');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nodes_teaching_plans');
    }
}