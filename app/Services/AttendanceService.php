<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    protected QrService $qrService;

    public function __construct(QrService $qrService)
    {
        $this->qrService = $qrService;
    }

    /**
     * Submit attendance via QR scan.
     * 
     * @throws \Exception
     */
    public function submitAttendance(User $user, string $qrToken): Attendance
    {
        return DB::transaction(function () use ($user, $qrToken) {
            // 1. Determine QR type based on current time
            $now = Carbon::now();
            $qrType = $this->qrService->determineQrType($now);

            // 2. Validate QR token matches the expected type
            $this->qrService->validateQrToken($qrToken, $qrType);

            // 3. Check if user already submitted this type today
            $this->preventDoubleSubmission($user, $qrType);

            // 4. Record attendance
            $attendance = $this->recordAttendance($user, $qrType, $now);

            // 5. Mark QR token as used by this user
            $this->markTokenUsed($user->id, $qrToken);

            // 6. Log the action
            $this->logAttendance($user, $attendance, "submit_attendance_{$qrType}");

            return $attendance->fresh();
        });
    }

    /**
     * Prevent double submission for the same QR type.
     */
    protected function preventDoubleSubmission(User $user, string $qrType): void
    {
        $today = Carbon::today();
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if ($attendance) {
            if ($qrType === 'check_in' && $attendance->has_checked_in) {
                throw new \Exception('Anda sudah melakukan check-in hari ini.');
            }
            
            if ($qrType === 'check_out' && $attendance->has_checked_out) {
                throw new \Exception('Anda sudah melakukan check-out hari ini.');
            }

            // Validate check-out requires check-in first
            if ($qrType === 'check_out' && !$attendance->has_checked_in) {
                throw new \Exception('Anda harus check-in terlebih dahulu sebelum check-out.');
            }
        } else {
            // No attendance record yet, must be check-in
            if ($qrType === 'check_out') {
                throw new \Exception('Anda harus check-in terlebih dahulu sebelum check-out.');
            }
        }
    }

    /**
     * Record attendance (check-in or check-out).
     */
    protected function recordAttendance(User $user, string $qrType, Carbon $now): Attendance
    {
        $today = Carbon::today();

        // Find or create attendance record
        $attendance = Attendance::firstOrNew([
            'user_id' => $user->id,
            'date' => $today,
        ]);

        if ($qrType === 'check_in') {
            // Validate: Check-in must be before 16:00
            $checkInDeadline = Carbon::today()->setTime(16, 0);
            if ($now->gte($checkInDeadline)) {
                throw new \Exception('Check-in tidak dapat dilakukan setelah pukul 16:00. Silakan scan QR check-out.');
            }
            
            // Record check-in time
            $attendance->check_in = $now;
            $attendance->has_checked_in = true;
            
            // Determine status based on time
            // <= 10:00 = hadir
            // > 10:00 and < 16:00 = telat
            $lateThreshold = Carbon::today()->setTime(10, 0);
            $attendance->status = $now->isAfter($lateThreshold) ? 'telat' : 'hadir';
            
        } elseif ($qrType === 'check_out') {
            // Validate: Check-out must be after 16:00
            $checkOutStart = Carbon::today()->setTime(16, 0);
            if ($now->lt($checkOutStart)) {
                throw new \Exception('Check-out hanya dapat dilakukan setelah pukul 16:00.');
            }
            
            // Validate: Check-out must be after check-in
            if ($attendance->check_in && $now->lte($attendance->check_in)) {
                throw new \Exception('Waktu check-out tidak valid. Check-out harus setelah check-in.');
            }
            
            // Record check-out time
            $attendance->check_out = $now;
            $attendance->has_checked_out = true;
            
            // Status remains as set during check-in (hadir or telat)
            // Don't change status on check-out
        }

        $attendance->save();

        return $attendance;
    }

    /**
     * Mark QR token as used by this user (cache-based, expires at end of day).
     */
    protected function markTokenUsed(int $userId, string $token): void
    {
        $cacheKey = "attendance_token:{$userId}:{$token}";
        $expiresAt = Carbon::now()->endOfDay();
        
        Cache::put($cacheKey, true, $expiresAt);
    }

    /**
     * Log attendance action for audit trail.
     */
    protected function logAttendance(User $user, Attendance $attendance, string $action): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'auditable_type' => Attendance::class,
            'auditable_id' => $attendance->id,
            'new_values' => $attendance->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Edit attendance (HR/Admin only).
     */
    public function editAttendance(User $editor, Attendance $attendance, array $data): Attendance
    {
        $oldValues = $attendance->toArray();

        // Validate check-in and check-out times if provided
        if (isset($data['check_in']) && isset($data['check_out'])) {
            $checkIn = Carbon::parse($data['check_in']);
            $checkOut = Carbon::parse($data['check_out']);
            
            // Validate: Check-in must be before 16:00
            $checkInDeadline = Carbon::parse($attendance->date)->setTime(16, 0);
            if ($checkIn->gte($checkInDeadline)) {
                throw new \Exception('Waktu check-in tidak valid. Check-in harus sebelum pukul 16:00.');
            }
            
            // Validate: Check-out must be after 16:00
            $checkOutStart = Carbon::parse($attendance->date)->setTime(16, 0);
            if ($checkOut->lt($checkOutStart)) {
                throw new \Exception('Waktu check-out tidak valid. Check-out harus setelah pukul 16:00.');
            }
            
            // Validate: Check-out must be after check-in
            if ($checkOut->lte($checkIn)) {
                throw new \Exception('Waktu check-out harus setelah check-in.');
            }
        }

        $attendance->update([
            'status' => $data['status'] ?? $attendance->status,
            'notes' => $data['notes'] ?? $attendance->notes,
            'check_in' => $data['check_in'] ?? $attendance->check_in,
            'check_out' => $data['check_out'] ?? $attendance->check_out,
            'edited_by' => $editor->id,
            'edited_at' => now(),
        ]);

        // Log the edit
        AuditLog::create([
            'user_id' => $editor->id,
            'action' => 'edit_attendance',
            'auditable_type' => Attendance::class,
            'auditable_id' => $attendance->id,
            'old_values' => $oldValues,
            'new_values' => $attendance->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return $attendance->fresh();
    }

    /**
     * Get attendance statistics for a user.
     */
    public function getUserAttendanceStats(User $user, Carbon $startDate, Carbon $endDate): array
    {
        $attendances = Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        return [
            'total_days' => $attendances->count(),
            'hadir' => $attendances->where('status', 'hadir')->count(),
            'telat' => $attendances->where('status', 'telat')->count(),
            'izin' => $attendances->where('status', 'izin')->count(),
            'sakit' => $attendances->where('status', 'sakit')->count(),
            'alpha' => $attendances->where('status', 'alpha')->count(),
        ];
    }
}
