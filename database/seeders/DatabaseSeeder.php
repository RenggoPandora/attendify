<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use App\Models\Attendance;
use App\Models\PermitLetter;
use Carbon\Carbon;
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
        $departments = $this->seedDepartments();
        
        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $hrRole = Role::where('name', 'hr')->first();
        $userRole = Role::where('name', 'user')->first();

        // Create users
        $users = $this->seedUsers($departments, $adminRole, $hrRole, $userRole);

        // Seed attendance history (last 30 days)
        $this->seedAttendanceHistory($users['employees']);

        // Seed permit letters for some absences
        $this->seedPermitLetters($users['employees']);

        $this->displaySummary($users);
    }

    /**
     * Seed departments.
     */
    private function seedDepartments(): array
    {
        $departments = [
            [
                'code' => 'IT',
                'name' => 'Information Technology',
                'description' => 'Handles all IT infrastructure, software development, and technical support',
                'is_active' => true,
            ],
            [
                'code' => 'HR',
                'name' => 'Human Resources',
                'description' => 'Manages recruitment, employee relations, and organizational development',
                'is_active' => true,
            ],
            [
                'code' => 'FIN',
                'name' => 'Finance & Accounting',
                'description' => 'Responsible for financial planning, budgeting, and accounting operations',
                'is_active' => true,
            ],
            [
                'code' => 'MKT',
                'name' => 'Marketing & Sales',
                'description' => 'Drives business growth through marketing strategies and sales operations',
                'is_active' => true,
            ],
            [
                'code' => 'OPS',
                'name' => 'Operations',
                'description' => 'Manages daily operations and process optimization',
                'is_active' => true,
            ],
        ];

        $result = [];
        foreach ($departments as $dept) {
            $result[$dept['code']] = Department::firstOrCreate(
                ['code' => $dept['code']],
                $dept
            );
        }

        $this->command->info('✓ Seeded: ' . count($result) . ' Departments');
        return $result;
    }

    /**
     * Seed users with realistic data.
     */
    private function seedUsers(array $departments, $adminRole, $hrRole, $userRole): array
    {
        $users = [
            'admin' => [],
            'hr' => [],
            'employees' => [],
        ];

        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@attendify.local'],
            [
                'department_id' => $departments['IT']->id,
                'employee_id' => 'ADM001',
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        if ($admin->wasRecentlyCreated) {
            $admin->roles()->sync([$adminRole->id]);
        }
        $users['admin'][] = $admin;

        // HR users
        $hrUsers = [
            ['email' => 'hr@attendify.local', 'id' => 'HR001', 'name' => 'Sarah Johnson', 'dept' => 'HR'],
            ['email' => 'hr.manager@attendify.local', 'id' => 'HR002', 'name' => 'Michael Chen', 'dept' => 'HR'],
        ];

        foreach ($hrUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'department_id' => $departments[$userData['dept']]->id,
                    'employee_id' => $userData['id'],
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]
            );
            if ($user->wasRecentlyCreated) {
                $user->roles()->sync([$hrRole->id, $userRole->id]);
            }
            $users['hr'][] = $user;
        }

        // Regular employees
        $employees = [
            // IT Department
            ['email' => 'john.doe@attendify.local', 'id' => 'IT001', 'name' => 'John Doe', 'dept' => 'IT'],
            ['email' => 'alice.wong@attendify.local', 'id' => 'IT002', 'name' => 'Alice Wong', 'dept' => 'IT'],
            ['email' => 'david.smith@attendify.local', 'id' => 'IT003', 'name' => 'David Smith', 'dept' => 'IT'],
            ['email' => 'emma.wilson@attendify.local', 'id' => 'IT004', 'name' => 'Emma Wilson', 'dept' => 'IT'],
            
            // Finance
            ['email' => 'robert.lee@attendify.local', 'id' => 'FIN001', 'name' => 'Robert Lee', 'dept' => 'FIN'],
            ['email' => 'lisa.tan@attendify.local', 'id' => 'FIN002', 'name' => 'Lisa Tan', 'dept' => 'FIN'],
            ['email' => 'james.brown@attendify.local', 'id' => 'FIN003', 'name' => 'James Brown', 'dept' => 'FIN'],
            
            // Marketing
            ['email' => 'sophia.martinez@attendify.local', 'id' => 'MKT001', 'name' => 'Sophia Martinez', 'dept' => 'MKT'],
            ['email' => 'oliver.garcia@attendify.local', 'id' => 'MKT002', 'name' => 'Oliver Garcia', 'dept' => 'MKT'],
            ['email' => 'emily.rodriguez@attendify.local', 'id' => 'MKT003', 'name' => 'Emily Rodriguez', 'dept' => 'MKT'],
            
            // Operations
            ['email' => 'william.anderson@attendify.local', 'id' => 'OPS001', 'name' => 'William Anderson', 'dept' => 'OPS'],
            ['email' => 'ava.thomas@attendify.local', 'id' => 'OPS002', 'name' => 'Ava Thomas', 'dept' => 'OPS'],
            ['email' => 'lucas.moore@attendify.local', 'id' => 'OPS003', 'name' => 'Lucas Moore', 'dept' => 'OPS'],
        ];

        foreach ($employees as $empData) {
            $user = User::firstOrCreate(
                ['email' => $empData['email']],
                [
                    'department_id' => $departments[$empData['dept']]->id,
                    'employee_id' => $empData['id'],
                    'name' => $empData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]
            );
            if ($user->wasRecentlyCreated) {
                $user->roles()->sync([$userRole->id]);
            }
            $users['employees'][] = $user;
        }

        $this->command->info('✓ Seeded: ' . (count($users['admin']) + count($users['hr']) + count($users['employees'])) . ' Users');
        return $users;
    }

    /**
     * Seed attendance history for the last 30 days.
     */
    private function seedAttendanceHistory(array $employees): void
    {
        $this->command->info('Seeding attendance history...');
        
        $attendanceCount = 0;
        $today = Carbon::today();
        
        // Generate attendance for last 30 days (excluding weekends)
        for ($i = 29; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i);
            
            // Skip weekends
            if ($date->isWeekend()) {
                continue;
            }
            
            foreach ($employees as $employee) {
                // 90% attendance rate (realistic scenario)
                $attendanceChance = rand(1, 100);
                
                if ($attendanceChance <= 90) {
                    // Present with varied check-in times (7:00 - 15:59)
                    // Must be before 16:00 as per business rules
                    $checkInHour = rand(7, 15);
                    
                    // If hour is 15, minute must be < 60 to ensure < 16:00
                    if ($checkInHour === 15) {
                        $checkInMinute = rand(0, 50); // Max 15:50 to be safe
                    } else {
                        $checkInMinute = rand(0, 59);
                    }
                    
                    $checkIn = $date->copy()->setTime($checkInHour, $checkInMinute);
                    
                    // Determine status based on check-in time
                    // <= 10:00 = hadir
                    // > 10:00 and < 16:00 = telat
                    if ($checkIn->format('H:i') <= '10:00') {
                        $status = 'hadir';
                    } else {
                        $status = 'telat';
                    }
                    
                    // Check-out must be after 16:00 AND after check-in
                    $checkOutHour = rand(16, 18);
                    $checkOutMinute = rand(0, 59);
                    $checkOut = $date->copy()->setTime($checkOutHour, $checkOutMinute);
                    
                    // Validate check-out is after check-in
                    if ($checkOut->lte($checkIn)) {
                        // If check-out would be before/equal check-in, adjust it
                        $checkOut = $checkIn->copy()->addHours(rand(1, 3));
                    }
                    
                    Attendance::create([
                        'user_id' => $employee->id,
                        'date' => $date,
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'status' => $status,
                        'has_checked_in' => true,
                        'has_checked_out' => true,
                    ]);
                    
                    $attendanceCount++;
                } elseif ($attendanceChance <= 95) {
                    // Absent with permit (5% chance - sakit/izin)
                    $permitStatus = rand(0, 1) ? 'sakit' : 'izin';
                    
                    Attendance::create([
                        'user_id' => $employee->id,
                        'date' => $date,
                        'status' => $permitStatus,
                        'has_checked_in' => false,
                        'has_checked_out' => false,
                        'notes' => $permitStatus === 'sakit' ? 'Sakit demam' : 'Keperluan keluarga',
                    ]);
                    
                    $attendanceCount++;
                } else {
                    // Alpha (5% chance - no reason)
                    Attendance::create([
                        'user_id' => $employee->id,
                        'date' => $date,
                        'status' => 'alpha',
                        'has_checked_in' => false,
                        'has_checked_out' => false,
                        'notes' => 'Auto-marked absent (no attendance recorded)',
                    ]);
                    
                    $attendanceCount++;
                }
            }
        }
        
        $this->command->info('✓ Seeded: ' . $attendanceCount . ' Attendance records');
    }

    /**
     * Seed permit letters for some absences.
     */
    private function seedPermitLetters(array $employees): void
    {
        $this->command->info('Seeding permit letters...');
        
        $permitCount = 0;
        
        // Get some recent sakit/izin attendances without permit letters
        $absences = Attendance::whereIn('status', ['sakit', 'izin'])
            ->whereDoesntHave('permitLetters')
            ->where('date', '>=', Carbon::today()->subDays(15))
            ->limit(10)
            ->get();
        
        foreach ($absences as $attendance) {
            $isApproved = rand(0, 1);
            $hrUser = User::whereHas('roles', function ($q) {
                $q->where('name', 'hr');
            })->first();
            
            PermitLetter::create([
                'user_id' => $attendance->user_id,
                'attendance_id' => $attendance->id,
                'permit_date' => $attendance->date,
                'reason' => $attendance->status === 'sakit' ? 'Sakit' : 'Izin',
                'description' => $attendance->status === 'sakit' 
                    ? 'Sakit demam dan batuk, memerlukan istirahat sesuai surat dokter'
                    : 'Keperluan keluarga yang mendesak dan tidak dapat ditunda',
                'file_path' => 'uploads/permit-letters/sample-' . uniqid() . '.pdf',
                'file_name' => 'Surat_' . ($attendance->status === 'sakit' ? 'Sakit' : 'Izin') . '_' . $attendance->date->format('Ymd') . '.pdf',
                'status' => $isApproved ? 'approved' : 'pending',
                'approved_at' => $isApproved ? now() : null,
                'approved_by' => $isApproved ? $hrUser?->id : null,
            ]);
            
            $permitCount++;
        }
        
        $this->command->info('✓ Seeded: ' . $permitCount . ' Permit letters');
    }

    /**
     * Display seeding summary.
     */
    private function displaySummary(array $users): void
    {
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('       SEEDING COMPLETED!');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('📋 Login Credentials (all passwords: password)');
        $this->command->info('');
        $this->command->info('👤 ADMIN:');
        $this->command->info('   • admin@attendify.local');
        $this->command->info('');
        $this->command->info('👔 HR MANAGERS:');
        $this->command->info('   • hr@attendify.local (Sarah Johnson)');
        $this->command->info('   • hr.manager@attendify.local (Michael Chen)');
        $this->command->info('');
        $this->command->info('👷 EMPLOYEES (sample):');
        $this->command->info('   • john.doe@attendify.local (IT Department)');
        $this->command->info('   • alice.wong@attendify.local (IT Department)');
        $this->command->info('   • robert.lee@attendify.local (Finance)');
        $this->command->info('   • sophia.martinez@attendify.local (Marketing)');
        $this->command->info('   • william.anderson@attendify.local (Operations)');
        $this->command->info('');
        $this->command->info('📊 Total Users: ' . (count($users['admin']) + count($users['hr']) + count($users['employees'])));
        $this->command->info('📅 Attendance data: Last 30 days (weekdays only)');
        $this->command->info('📝 Permit letters: Sample approved and pending');
        $this->command->info('');
    }
}
