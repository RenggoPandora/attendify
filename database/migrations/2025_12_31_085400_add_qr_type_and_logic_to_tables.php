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
        // Add time tracking to qr_sessions
        Schema::table('qr_sessions', function (Blueprint $table) {
            $table->time('generated_at_time')->nullable()->after('type');
        });

        // Add check-in and check-out tracking to attendances
        Schema::table('attendances', function (Blueprint $table) {
            $table->boolean('has_checked_in')->default(false)->after('check_in');
            $table->boolean('has_checked_out')->default(false)->after('check_out');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qr_sessions', function (Blueprint $table) {
            $table->dropColumn('generated_at_time');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['has_checked_in', 'has_checked_out']);
        });
    }
};
