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
            $table->string('trainee_name')->nullable()->after('name')->comment('Official name of trainee for records');
            $table->string('course_qualification')->nullable()->after('trainee_name')->comment('Course/Qualification being pursued');
            $table->string('agency_company')->nullable()->after('course_qualification')->comment('Agency or Company where OJT is conducted');
            $table->string('on_site_supervisor')->nullable()->after('agency_company')->comment('On-site supervisor name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('trainee_name');
            $table->dropColumn('course_qualification');
            $table->dropColumn('agency_company');
            $table->dropColumn('on_site_supervisor');
        });
    }
};
