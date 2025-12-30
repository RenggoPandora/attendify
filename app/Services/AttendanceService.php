<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\QrSession;
use App\Models\User;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    /**
     * Submit attendance via QR scan.
     * 
     * @throws \Exception
     */
    public function submitAttendance(User $user, string $qrToken): Attendance
    {
        return DB::transaction(function () use ($user, $qrToken) {
            // 1. Validate QR session
            $qrSession = $this->validateQrSession($qrToken);

            // 2. Check if user already submitted today
            $this->preventDoubleSubmission($user, $qrSession);

            // 3. Create or update attendance
            $attendance = $this->recordAttendance($user, $qrSession);

            // 4. Mark QR token as used by this user (cache-based)
            $this->markTokenUsed($user->id, $qrToken);

            // 5. Log the action
            $this->logAttendance($user, $attendance, 'submit_attendance');

            return $attendance->fresh();
        });
    }

    /**
     * Validate QR session is active and within time window.
     */
    protected function validateQrSession(string $token): QrSession
    {
        $qrSession = QrSession::where('token', $token)
            ->where('is_active', true)
            ->first();

        if (!$qrSession) {
            throw new \Exception('QR code tidak valid atau sudah tidak aktif.');
        }

        if (!$qrSession->isValid()) {
            throw new \Exception('QR code sudah kadaluarsa.');
        }

        return $qrSession;
    }

    /**
     * Prevent double submission within same QR session.
     */
    protected function preventDoubleSubmission(User $user, QrSession $qrSession): void
    {
        $cacheKey = "attendance_token:{$user->id}:{$qrSession->token}";

        if (Cache::has($cacheKey)) {
            throw new \Exception('Anda sudah melakukan absensi dengan QR code ini.');
        }

        // Check database for today's attendance
        $today = Carbon::today();
        $existingAttendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->where('qr_session_id', $qrSession->id)
            ->first();

        if ($existingAttendance) {
            throw new \Exception('Anda sudah melakukan absensi hari ini.');
        }
    }

    /**
     * Record attendance (check-in or check-out).
     */
    protected function recordAttendance(User $user, QrSession $qrSession): Attendance
    {
        $today = Carbon::today();
        $now = Carbon::now();

        // Find existing attendance for today
        $attendance = Attendance::firstOrNew([
            'user_id' => $user->id,
            'date' => $today,
        ]);

        // Determine check-in or check-out
        if ($qrSession->type === 'check_in') {
            $attendance->check_in = $now;
            $attendance->qr_session_id = $qrSession->id;
            
            // Determine status based on time (example: late after 8:30 AM)
            $lateThreshold = Carbon::today()->setTime(8, 30);
            $attendance->status = $now->isAfter($lateThreshold) ? 'telat' : 'hadir';
        } else {
            $attendance->check_out = $now;
        }

        $attendance->save();

        return $attendance;
    }

    /**
     * Mark QR token as used by this user (cache-based, expires with QR session).
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

        $attendance->update([
            'status' => $data['status'] ?? $attendance->status,
            'notes' => $data['notes'] ?? $attendance->notes,
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
