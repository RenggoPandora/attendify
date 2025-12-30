<?php

namespace App\Services;

use App\Models\QrSession;
use App\Models\User;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class QrSessionService
{
    /**
     * Generate a new QR session.
     * 
     * @param User $admin The admin creating the session
     * @param string $type 'check_in' or 'check_out'
     * @param int $validMinutes How long the QR code is valid
     * @return QrSession
     */
    public function generateQrSession(User $admin, string $type, int $validMinutes = 15): QrSession
    {
        return DB::transaction(function () use ($admin, $type, $validMinutes) {
            $token = $this->generateUniqueToken();
            $validFrom = Carbon::now();
            $validUntil = Carbon::now()->addMinutes($validMinutes);

            $qrSession = QrSession::create([
                'token' => $token,
                'type' => $type,
                'valid_from' => $validFrom,
                'valid_until' => $validUntil,
                'is_active' => true,
                'created_by' => $admin->id,
            ]);

            // Cache the QR session for fast validation
            $this->cacheQrSession($qrSession);

            // Log the action
            $this->logQrSessionAction($admin, $qrSession, 'generate_qr_session');

            return $qrSession;
        });
    }

    /**
     * Generate a unique token for QR session.
     */
    protected function generateUniqueToken(): string
    {
        do {
            // Generate a secure random token (32 chars)
            $token = Str::random(32);
        } while (QrSession::where('token', $token)->exists());

        return $token;
    }

    /**
     * Cache QR session for fast validation during peak hours.
     */
    protected function cacheQrSession(QrSession $qrSession): void
    {
        $cacheKey = "qr_session:{$qrSession->token}";
        $expiresAt = $qrSession->valid_until;

        Cache::put($cacheKey, [
            'id' => $qrSession->id,
            'type' => $qrSession->type,
            'valid_from' => $qrSession->valid_from,
            'valid_until' => $qrSession->valid_until,
            'is_active' => $qrSession->is_active,
        ], $expiresAt);
    }

    /**
     * Invalidate a QR session.
     */
    public function invalidateQrSession(User $admin, QrSession $qrSession): QrSession
    {
        return DB::transaction(function () use ($admin, $qrSession) {
            $qrSession->update(['is_active' => false]);

            // Remove from cache
            Cache::forget("qr_session:{$qrSession->token}");

            // Log the action
            $this->logQrSessionAction($admin, $qrSession, 'invalidate_qr_session');

            return $qrSession;
        });
    }

    /**
     * Get active QR session from cache or database.
     */
    public function getActiveQrSession(string $token): ?QrSession
    {
        // Try cache first
        $cacheKey = "qr_session:{$token}";
        $cached = Cache::get($cacheKey);

        if ($cached && $cached['is_active']) {
            return QrSession::find($cached['id']);
        }

        // Fallback to database
        return QrSession::where('token', $token)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Rotate QR session (invalidate old, generate new).
     */
    public function rotateQrSession(User $admin, QrSession $oldSession, int $validMinutes = 15): QrSession
    {
        return DB::transaction(function () use ($admin, $oldSession, $validMinutes) {
            // Invalidate old session
            $this->invalidateQrSession($admin, $oldSession);

            // Generate new session with same type
            $newSession = $this->generateQrSession($admin, $oldSession->type, $validMinutes);

            // Log the rotation
            AuditLog::create([
                'user_id' => $admin->id,
                'action' => 'rotate_qr_session',
                'auditable_type' => QrSession::class,
                'auditable_id' => $newSession->id,
                'old_values' => ['old_session_id' => $oldSession->id],
                'new_values' => ['new_session_id' => $newSession->id],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $newSession;
        });
    }

    /**
     * Get all active QR sessions.
     */
    public function getActiveSessions(): \Illuminate\Database\Eloquent\Collection
    {
        return QrSession::active()
            ->with('creator')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Clean up expired QR sessions (can be run via scheduler).
     */
    public function cleanupExpiredSessions(): int
    {
        $expired = QrSession::where('valid_until', '<', now())
            ->where('is_active', true)
            ->get();

        foreach ($expired as $session) {
            $session->update(['is_active' => false]);
            Cache::forget("qr_session:{$session->token}");
        }

        return $expired->count();
    }

    /**
     * Log QR session action for audit trail.
     */
    protected function logQrSessionAction(User $admin, QrSession $qrSession, string $action): void
    {
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => $action,
            'auditable_type' => QrSession::class,
            'auditable_id' => $qrSession->id,
            'new_values' => $qrSession->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get QR session statistics.
     */
    public function getQrSessionStats(Carbon $startDate, Carbon $endDate): array
    {
        $sessions = QrSession::whereBetween('created_at', [$startDate, $endDate])->get();

        return [
            'total_sessions' => $sessions->count(),
            'active_sessions' => $sessions->where('is_active', true)->count(),
            'expired_sessions' => $sessions->where('is_active', false)->count(),
            'check_in_sessions' => $sessions->where('type', 'check_in')->count(),
            'check_out_sessions' => $sessions->where('type', 'check_out')->count(),
        ];
    }
}
