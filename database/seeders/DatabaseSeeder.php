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
        $admin = User::firstOrCreate(
            ['email' => 'admin@attendify.local'],
            [
                'department_id' => $itDept->id,
                'employee_id' => 'EMP001',
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        if ($admin->wasRecentlyCreated) {
            $admin->roles()->sync([$adminRole->id]);
        }

        // Create HR user (with user role - can scan attendance)
        $hr = User::firstOrCreate(
            ['email' => 'hr@attendify.local'],
            [
                'department_id' => $hrDept->id,
                'employee_id' => 'EMP002',
                'name' => 'HR Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        if ($hr->wasRecentlyCreated) {
            $hr->roles()->sync([$hrRole->id, $userRole->id]); // HR + Employee
        }

        // Create test employee users
        $employee = User::firstOrCreate(
            ['email' => 'employee@attendify.local'],
            [
                'department_id' => $itDept->id,
                'employee_id' => 'EMP003',
                'name' => 'Test Employee',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        if ($employee->wasRecentlyCreated) {
            $employee->roles()->sync([$userRole->id]);
        }

        $john = User::firstOrCreate(
            ['email' => 'john.doe@attendify.local'],
            [
                'department_id' => $financeDept->id,
                'employee_id' => 'EMP004',
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        if ($john->wasRecentlyCreated) {
            $john->roles()->sync([$userRole->id]);
        }

        $this->command->info('✓ Seeded: 3 Roles, 3 Departments, 4 Users');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('  Admin:    admin@attendify.local / password (role: admin)');
        $this->command->info('  HR:       hr@attendify.local / password (roles: hr + user)');
        $this->command->info('  Employee: employee@attendify.local / password (role: user)');
    }
}
