<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNodesNodesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nodes_nodes', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('first_node_id')->unsigned();
            $table->foreign('first_node_id')->references('id')->on('nodes');
            $table->bigInteger('second_node_id')->unsigned();
            $table->foreign('second_node_id')->references('id')->on('nodes');
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
        Schema::dropIfExists('nodes_nodes');
    }
}