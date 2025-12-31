<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Migrate existing role_id data to role_user pivot table
        $users = DB::table('users')->whereNotNull('role_id')->get();
        
        foreach ($users as $user) {
            DB::table('role_user')->insert([
                'user_id' => $user->id,
                'role_id' => $user->role_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        // Step 2: Drop role_id column from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add role_id column
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('id')->constrained();
        });
        
        // Migrate back (take first role if user has multiple)
        $roleUsers = DB::table('role_user')->get();
        
        foreach ($roleUsers as $roleUser) {
            DB::table('users')
                ->where('id', $roleUser->user_id)
                ->whereNull('role_id')
                ->update(['role_id' => $roleUser->role_id]);
        }
    }
};
