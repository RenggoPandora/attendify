<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MarkAbsentEmployees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:mark-absent {--date= : Optional date to mark absent (Y-m-d format)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark employees as absent (alpha) if they have no attendance record for the day';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get target date (use option or yesterday by default)
        // We mark absent for yesterday since the command runs at end of day
        $dateString = $this->option('date');
        $targetDate = $dateString 
            ? Carbon::parse($dateString)->startOfDay()
            : Carbon::yesterday()->startOfDay();

        $this->info("Marking absent employees for: {$targetDate->toDateString()}");

        // Get all employees (users with 'employee' role)
        $employees = User::role('employee')->get();
        $absentCount = 0;

        foreach ($employees as $employee) {
            // Check if attendance record exists for this date
            $attendance = Attendance::where('user_id', $employee->id)
                ->where('date', $targetDate)
                ->first();

            if (!$attendance) {
                // No attendance record, mark as absent (alpha)
                Attendance::create([
                    'user_id' => $employee->id,
                    'date' => $targetDate,
                    'status' => 'alpha',
                    'has_checked_in' => false,
                    'has_checked_out' => false,
                    'check_in' => null,
                    'check_out' => null,
                    'notes' => 'Auto-marked absent (no attendance recorded)',
                ]);

                $absentCount++;
                $this->line("  - {$employee->name} marked as absent");
            }
        }

        $this->info("✓ Marked {$absentCount} employee(s) as absent for {$targetDate->toDateString()}");
        
        Log::info('Auto-mark absent completed', [
            'date' => $targetDate->toDateString(),
            'absent_count' => $absentCount,
        ]);

        return Command::SUCCESS;
    }
}
