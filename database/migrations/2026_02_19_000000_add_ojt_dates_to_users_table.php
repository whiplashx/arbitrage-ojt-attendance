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
            $table->date('ojt_start_date')->nullable()->after('facial_enabled');
            $table->date('ojt_end_date')->nullable()->after('ojt_start_date');
            $table->decimal('ojt_total_hours', 8, 2)->default(160)->after('ojt_end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('ojt_start_date');
            $table->dropColumn('ojt_end_date');
            $table->dropColumn('ojt_total_hours');
        });
    }
};
