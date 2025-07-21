<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('full_name');
            $table->date('date_of_birth');
            $table->string('place_of_birth')->nullable();
            $table->string('nationality')->nullable();
            $table->float('height')->nullable();
            $table->float('weight')->nullable();
            $table->enum('preferred_foot', ['left', 'right', 'both'])->nullable();
            $table->integer('jersey_number')->nullable();
            $table->enum('position', ['GK', 'DF', 'MF', 'FW'])->nullable();
            $table->enum('status', ['active', 'injured', 'suspended', 'inactive'])->default('active');
            $table->string('market_value')->nullable();
            $table->text('bio')->nullable();
            $table->string('photo_url')->nullable();
            $table->foreignId('team_id')->constrained('teams');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
