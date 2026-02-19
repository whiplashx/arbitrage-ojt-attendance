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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('attendance_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->timestamp('time_in_at')->nullable();
            $table->timestamp('time_out_at')->nullable();
            $table->boolean('is_overtime')->default(false);
            $table->string('verification_method')->default('facial'); // facial, manual, etc
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('attendance_date');
            $table->unique(['user_id', 'attendance_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
