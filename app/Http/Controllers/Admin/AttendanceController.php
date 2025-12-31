<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        // Parse dates
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Get total employees (users with 'user' role - includes HR who also scan attendance)
        $totalEmployees = User::whereHas('roles', function ($query) {
            $query->where('name', 'user');
        })->where('is_active', true)->count();

        // Stats for the selected period (only employees - users with 'user' role)
        $attendances = Attendance::whereBetween('check_in', [$start, $end])
            ->whereHas('user.roles', function ($query) {
                $query->where('name', 'user');
            })
            ->get();
        
        $stats = [
            'total_present' => $attendances->where('status', 'present')->count(),
            'total_late' => $attendances->where('status', 'late')->count(),
            'total_absent' => (int) $this->calculateAbsent($start, $end, $totalEmployees, $attendances->count()),
            'attendance_rate' => $totalEmployees > 0 
                ? (int) round(($attendances->count() / ($totalEmployees * ($start->diffInDays($end) + 1))) * 100)
                : 0,
        ];

        // Daily attendance for chart (last 7 days or selected range)
        $chartDays = min(7, $start->diffInDays($end) + 1);
        $dailyStats = [];
        
        for ($i = $chartDays - 1; $i >= 0; $i--) {
            $date = $end->copy()->subDays($i);
            $dayAttendances = Attendance::whereDate('check_in', $date->format('Y-m-d'))
                ->whereHas('user.roles', function ($query) {
                    $query->where('name', 'user');
                })
                ->get();
            
            $dailyStats[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'present' => $dayAttendances->where('status', 'present')->count(),
                'late' => $dayAttendances->where('status', 'late')->count(),
            ];
        }

        // Department summary
        $departments = Department::where('is_active', true)
            ->withCount(['users' => function ($query) {
                $query->whereHas('roles', function ($q) {
                    $q->where('name', 'user');
                })->where('is_active', true);
            }])
            ->get();

        $departmentStats = $departments->map(function ($dept) use ($start, $end) {
            $deptAttendances = Attendance::whereBetween('check_in', [$start, $end])
                ->whereHas('user', function ($query) use ($dept) {
                    $query->where('department_id', $dept->id)
                        ->whereHas('roles', function ($q) {
                            $q->where('name', 'user');
                        });
                })
                ->get();

            $workDays = $start->diffInDays($end) + 1;
            $expectedAttendances = $dept->users_count * $workDays;

            return [
                'id' => $dept->id,
                'name' => $dept->name,
                'total_employees' => $dept->users_count,
                'present' => $deptAttendances->where('status', 'present')->count(),
                'late' => $deptAttendances->where('status', 'late')->count(),
                'absent' => (int) max(0, $expectedAttendances - $deptAttendances->count()),
                'attendance_rate' => $expectedAttendances > 0 
                    ? (int) round(($deptAttendances->count() / $expectedAttendances) * 100)
                    : 0,
            ];
        });

        return Inertia::render('Admin/Attendance', [
            'stats' => $stats,
            'dailyStats' => $dailyStats,
            'departmentStats' => $departmentStats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function calculateAbsent($start, $end, $totalEmployees, $totalAttendances)
    {
        $workDays = $start->diffInDays($end) + 1;
        $expectedAttendances = $totalEmployees * $workDays;
        return max(0, $expectedAttendances - $totalAttendances);
    }
}
