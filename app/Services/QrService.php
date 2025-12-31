<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;

class QrService
{
    /**
     * Get or generate active QR session based on time rules.
     * 
     * Rules:
     * - Check-in QR: Generated at 00:00, valid until 23:59
     * - Check-out QR: Generated at 16:00, valid until 23:59
     * 
     * @return array|null
     */
    public function getActiveQrSession(): ?array
    {
        $now = now();
        $currentTime = $now->format('H:i');
        
        // Determine which type of QR should be available
        $qrType = $this->determineQrType($now);
        
        if (!$qrType) {
            return null; // No QR available at this time
        }
        
        $cacheKey = "active_qr_session_{$qrType}";
        $qrData = Cache::get($cacheKey);

        // If no cache or expired, generate new one
        if (!$qrData || $this->isExpired($qrData)) {
            $qrData = $this->generateNewQrSession($qrType);
        }

        return $qrData;
    }

    /**
     * Determine QR type based on current time.
     * 
     * @param Carbon $now
     * @return string|null 'check_in', 'check_out', or null
     */
    public function determineQrType(Carbon $now): ?string
    {
        $currentTime = $now->format('H:i');
        
        // Check-out QR available from 16:00 onwards
        if ($currentTime >= '16:00') {
            return 'check_out';
        }
        
        // Check-in QR available from 00:00 to 15:59
        return 'check_in';
    }

    /**
     * Generate new QR session and store in cache.
     * 
     * @param string $type
     */
    public function generateNewQrSession(string $type): array
    {
        $token = Str::random(32);
        $now = now();
        
        // Set valid time based on type
        if ($type === 'check_in') {
            // Check-in QR: generated at current time, valid for 30 seconds
            $validFrom = $now;
            $validUntil = $now->copy()->addSeconds(30);
        } else {
            // Check-out QR: generated at current time, valid for 30 seconds
            $validFrom = $now;
            $validUntil = $now->copy()->addSeconds(30);
        }
        
        $qrData = [
            'token' => $token,
            'type' => $type,
            'valid_from' => $validFrom->toIso8601String(),
            'valid_until' => $validUntil->toIso8601String(),
            'generated_at' => $now->toIso8601String(),
            'generated_at_time' => $now->format('H:i:s'),
        ];

        // Store in cache with 30 second TTL
        $cacheKey = "active_qr_session_{$type}";
        Cache::put($cacheKey, $qrData, now()->addSeconds(30));

        return $qrData;
    }

    /**
     * Check if QR data is expired.
     */
    protected function isExpired(array $qrData): bool
    {
        $validUntil = Carbon::parse($qrData['valid_until']);
        return now()->gt($validUntil);
    }

    /**
     * Force refresh QR session.
     */
    public function refreshQrSession(): array
    {
        $qrType = $this->determineQrType(now());
        
        if (!$qrType) {
            throw new \Exception('No QR type available at this time');
        }
        
        $cacheKey = "active_qr_session_{$qrType}";
        Cache::forget($cacheKey);
        
        return $this->generateNewQrSession($qrType);
    }

    /**
     * Validate QR token and type.
     * 
     * @param string $token
     * @param string $expectedType
     * @return bool
     */
    public function validateQrToken(string $token, string $expectedType): bool
    {
        $cacheKey = "active_qr_session_{$expectedType}";
        $qrData = Cache::get($cacheKey);
        
        if (!$qrData) {
            return false;
        }
        
        // Check if token matches and not expired
        return $qrData['token'] === $token 
            && $qrData['type'] === $expectedType 
            && !$this->isExpired($qrData);
    }
}
