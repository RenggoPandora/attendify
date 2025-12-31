<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\User;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    /**
     * HR Dashboard - Attendance monitoring.
     */
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $departmentId = $request->input('department_id');
        
        $query = Attendance::with(['user.department', 'user.role'])
            ->where('date', $date);

        if ($departmentId) {
            $query->whereHas('user', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        $attendances = $query->orderBy('check_in', 'asc')->get();
        
        $departments = Department::where('is_active', true)->get();

        $stats = [
            'total' => $attendances->count(),
            'hadir' => $attendances->where('status', 'hadir')->count(),
            'telat' => $attendances->where('status', 'telat')->count(),
            'izin' => $attendances->where('status', 'izin')->count(),
            'sakit' => $attendances->where('status', 'sakit')->count(),
            'alpha' => $attendances->where('status', 'alpha')->count(),
        ];

        return Inertia::render('Hr/Dashboard', [
            'attendances' => $attendances,
            'departments' => $departments,
            'stats' => $stats,
            'filters' => [
                'date' => $date,
                'department_id' => $departmentId,
            ],
        ]);
    }

    /**
     * Show edit attendance form.
     */
    public function edit(Attendance $attendance)
    {
        $this->authorize('update', $attendance);

        return Inertia::render('Hr/EditAttendance', [
            'attendance' => $attendance->load('user'),
        ]);
    }

    /**
     * Update attendance status.
     */
    public function update(Request $request, Attendance $attendance)
    {
        $this->authorize('update', $attendance);

        $request->validate([
            'status' => 'required|in:hadir,telat,izin,sakit,alpha',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $editor = auth()->user();
            $this->attendanceService->editAttendance(
                $editor,
                $attendance,
                $request->only(['status', 'notes'])
            );

            return redirect()->route('hr.attendance.index')
                ->with('success', 'Attendance updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Monthly recap for payroll export.
     */
    public function recap(Request $request)
    {
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $departmentId = $request->input('department_id');

        $startDate = Carbon::parse($month)->startOfMonth();
        $endDate = Carbon::parse($month)->endOfMonth();

        $usersQuery = User::with(['roles', 'department', 'permitLetters' => function ($q) use ($startDate, $endDate) {
                $q->whereBetween('permit_date', [$startDate, $endDate])
                    ->orderBy('permit_date', 'desc');
            }])
            ->where('is_active', true)
            ->whereHas('roles', function ($q) {
                $q->where('name', 'user');
            });

        if ($departmentId) {
            $usersQuery->where('department_id', $departmentId);
        }

        $users = $usersQuery->get()->map(function ($user) use ($startDate, $endDate) {
            $stats = $this->attendanceService->getUserAttendanceStats(
                $user,
                $startDate,
                $endDate
            );

            return [
                'user' => $user,
                'stats' => $stats,
            ];
        });

        $departments = Department::where('is_active', true)->get();

        return Inertia::render('Hr/Recap', [
            'users' => $users,
            'departments' => $departments,
            'currentMonth' => $month,
            'filters' => [
                'department_id' => $departmentId,
            ],
        ]);
    }
}
