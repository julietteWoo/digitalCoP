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
            $table->double('sentiment_score')->nullable();
            $table->double('sentiment_magnitude')->nullable();
        });
    }

    public function down()
    {
        
    }
}