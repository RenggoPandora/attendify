<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles first
        $this->call(RoleSeeder::class);

        // Create departments
        $itDept = Department::firstOrCreate(
            ['code' => 'IT'],
            [
                'name' => 'Information Technology',
                'description' => 'IT Department',
                'is_active' => true,
            ]
        );

        $hrDept = Department::firstOrCreate(
            ['code' => 'HR'],
            [
                'name' => 'Human Resources',
                'description' => 'HR Department',
                'is_active' => true,
            ]
        );

        $financeDept = Department::firstOrCreate(
            ['code' => 'FIN'],
            [
                'name' => 'Finance',
                'description' => 'Finance Department',
                'is_active' => true,
            ]
        );

        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $hrRole = Role::where('name', 'hr')->first();
        $userRole = Role::where('name', 'user')->first();

        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@attendify.local'],
            [
                'role_id' => $adminRole->id,
                'department_id' => $itDept->id,
                'employee_id' => 'EMP001',
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        // Create HR user
        User::firstOrCreate(
            ['email' => 'hr@attendify.local'],
            [
                'role_id' => $hrRole->id,
                'department_id' => $hrDept->id,
                'employee_id' => 'EMP002',
                'name' => 'HR Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        // Create test employee users
        User::firstOrCreate(
            ['email' => 'employee@attendify.local'],
            [
                'role_id' => $userRole->id,
                'department_id' => $itDept->id,
                'employee_id' => 'EMP003',
                'name' => 'Test Employee',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'john.doe@attendify.local'],
            [
                'role_id' => $userRole->id,
                'department_id' => $financeDept->id,
                'employee_id' => 'EMP004',
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $this->command->info('✓ Seeded: 3 Roles, 3 Departments, 4 Users');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('  Admin:    admin@attendify.local / password');
        $this->command->info('  HR:       hr@attendify.local / password');
        $this->command->info('  Employee: employee@attendify.local / password');
    }
}
