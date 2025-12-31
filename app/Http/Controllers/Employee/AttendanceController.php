<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
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
     * Show employee dashboard with today's attendance status.
     */
    public function index()
    {
        $user = auth()->user();
        $today = Carbon::today();

        $todayAttendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        return Inertia::render('Employee/Dashboard', [
            'todayAttendance' => $todayAttendance,
            'user' => $user->load('roles', 'department'),
        ]);
    }

    /**
     * Show QR scan page.
     */
    public function scan()
    {
        // Get or generate active QR session on-demand
        $qrService = app(\App\Services\QrService::class);
        $activeQrSession = $qrService->getActiveQrSession();

        return Inertia::render('Employee/ScanQr', [
            'activeQrSession' => $activeQrSession,
        ]);
    }

    /**
     * Submit attendance via QR token.
     */
    public function submit(Request $request)
    {
        $request->validate([
            'qr_token' => 'required|string',
        ]);

        try {
            $user = auth()->user();
            $attendance = $this->attendanceService->submitAttendance(
                $user,
                $request->qr_token
            );

            return back()->with('success', 'Absensi berhasil dicatat!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show personal attendance history.
     */
    public function history(Request $request)
    {
        $user = auth()->user();
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        
        $startDate = Carbon::parse($month)->startOfMonth();
        $endDate = Carbon::parse($month)->endOfMonth();

        $attendances = Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        $stats = $this->attendanceService->getUserAttendanceStats(
            $user,
            $startDate,
            $endDate
        );

        return Inertia::render('Employee/History', [
            'attendances' => $attendances,
            'stats' => $stats,
            'currentMonth' => $month,
        ]);
    }
}
