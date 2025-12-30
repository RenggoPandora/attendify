<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access - manage users, departments, QR sessions, and all settings',
            ],
            [
                'name' => 'hr',
                'display_name' => 'Human Resources',
                'description' => 'Monitor attendance, edit records, and export payroll data',
            ],
            [
                'name' => 'user',
                'display_name' => 'Employee',
                'description' => 'Submit attendance via QR scan and view personal attendance history',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
