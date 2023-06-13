<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyRepliesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('replies', function (Blueprint $table) {
            $table->string('STEAM')->nullable(); //list of STEAM
            $table->string('subjects')->nullable(); //list of subjects
        });
    }

    public function down()
    {
        
    }
}