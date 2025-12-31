<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Admin Dashboard with system overview.
     */
    public function index()
    {
        $today = Carbon::today();

        $stats = [
            'total_users' => User::where('is_active', true)->count(),
            'total_departments' => Department::where('is_active', true)->count(),
            'today_attendance' => Attendance::where('date', $today)->count(),
        ];

        $recentAttendances = Attendance::with(['user.department'])
            ->where('date', $today)
            ->orderBy('check_in', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentAttendances' => $recentAttendances,
        ]);
    }
}
