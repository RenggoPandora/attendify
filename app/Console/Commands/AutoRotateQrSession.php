<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AutoRotateQrSession extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qr:auto-rotate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically rotate QR session every 15 seconds (stored in cache)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Generate new QR token
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
        
        $this->info('QR Session rotated successfully! Token: ' . $token);
        $this->info('Valid until: ' . $qrData['valid_until']);
        
        return 0;
    }
}
