<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class QrService
{
    /**
     * Get or generate active QR session.
     * 
     * @return array|null
     */
    public function getActiveQrSession(): ?array
    {
        $qrData = Cache::get('active_qr_session');

        // If no cache or expired, generate new one
        if (!$qrData || $this->isExpired($qrData)) {
            $qrData = $this->generateNewQrSession();
        }

        return $qrData;
    }

    /**
     * Generate new QR session and store in cache.
     */
    protected function generateNewQrSession(): array
    {
        $token = Str::random(32);
        
        $qrData = [
            'token' => $token,
            'type' => 'check_in',
            'valid_from' => now()->toIso8601String(),
            'valid_until' => now()->addSeconds(30)->toIso8601String(),
            'generated_at' => now()->toIso8601String(),
        ];

        // Store in cache with 30 second TTL
        Cache::put('active_qr_session', $qrData, now()->addSeconds(30));

        return $qrData;
    }

    /**
     * Check if QR data is expired.
     */
    protected function isExpired(array $qrData): bool
    {
        $validUntil = \Carbon\Carbon::parse($qrData['valid_until']);
        return now()->gt($validUntil);
    }

    /**
     * Force refresh QR session.
     */
    public function refreshQrSession(): array
    {
        Cache::forget('active_qr_session');
        return $this->generateNewQrSession();
    }
}
