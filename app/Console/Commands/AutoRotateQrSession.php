<?php

namespace App\Console\Commands;

use App\Models\QrSession;
use App\Models\User;
use App\Services\QrSessionService;
use Illuminate\Console\Command;

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
    protected $description = 'Automatically rotate QR session every 15 seconds';

    public function __construct(
        protected QrSessionService $qrSessionService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get system admin user (first admin)
        $admin = User::whereHas('role', function ($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$admin) {
            $this->error('No admin user found!');
            return 1;
        }

        // Invalidate all current active sessions
        QrSession::where('is_active', true)->update(['is_active' => false]);

        // Generate new QR session with 30 seconds validity (overlap for safety)
        $qrSession = $this->qrSessionService->generateQrSession(
            $admin,
            'check_in', // Use check_in type
            0.5 // 30 seconds (0.5 minutes)
        );

        $this->info("QR Session rotated successfully! Token: {$qrSession->token}");
        
        return 0;
    }
}
