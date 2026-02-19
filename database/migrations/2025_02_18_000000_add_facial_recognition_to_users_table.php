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
        Schema::table('users', function (Blueprint $table) {
            $table->longText('facial_encoding')->nullable()->after('password');
            $table->string('facial_data_hash')->nullable()->after('facial_encoding')->unique();
            $table->timestamp('facial_registered_at')->nullable()->after('facial_data_hash');
            $table->boolean('facial_enabled')->default(false)->after('facial_registered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'facial_encoding',
                'facial_data_hash',
                'facial_registered_at',
                'facial_enabled',
            ]);
        });
    }
};
