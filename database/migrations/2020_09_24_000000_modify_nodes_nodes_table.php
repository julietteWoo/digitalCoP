<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyNodesNodesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('nodes_nodes', function (Blueprint $table) {
            $table->integer('count');
        });
    }

    public function down()
    {
        
    }
}