<?php

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    /**
     * Export attendance data to CSV.
     */
    public function csv(Request $request)
    {
        $this->authorize('export', Attendance::class);

        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $departmentId = $request->input('department_id');

        $startDate = Carbon::parse($month)->startOfMonth();
        $endDate = Carbon::parse($month)->endOfMonth();

        $usersQuery = User::with(['role', 'department'])
            ->where('is_active', true)
            ->whereHas('role', function ($q) {
                $q->where('name', 'user');
            });

        if ($departmentId) {
            $usersQuery->where('department_id', $departmentId);
        }

        $users = $usersQuery->get();

        $filename = "attendance_export_{$month}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($users, $startDate, $endDate) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'Employee ID',
                'Name',
                'Department',
                'Total Days',
                'Hadir',
                'Telat',
                'Izin',
                'Sakit',
                'Alpha',
            ]);

            // Data
            foreach ($users as $user) {
                $attendances = Attendance::where('user_id', $user->id)
                    ->whereBetween('date', [$startDate, $endDate])
                    ->get();

                fputcsv($file, [
                    $user->employee_id,
                    $user->name,
                    $user->department->name ?? '-',
                    $attendances->count(),
                    $attendances->where('status', 'hadir')->count(),
                    $attendances->where('status', 'telat')->count(),
                    $attendances->where('status', 'izin')->count(),
                    $attendances->where('status', 'sakit')->count(),
                    $attendances->where('status', 'alpha')->count(),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
