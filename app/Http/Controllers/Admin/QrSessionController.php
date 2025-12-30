<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QrSession;
use App\Services\QrSessionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QrSessionController extends Controller
{
    public function __construct(
        protected QrSessionService $qrSessionService
    ) {}

    /**
     * Display QR session management page.
     */
    public function index()
    {
        $this->authorize('viewAny', QrSession::class);

        $qrSessions = QrSession::with('creator')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/QrSessions/Index', [
            'qrSessions' => $qrSessions,
        ]);
    }

    /**
     * Generate new QR session.
     */
    public function store(Request $request)
    {
        $this->authorize('create', QrSession::class);

        $request->validate([
            'type' => 'required|in:check_in,check_out',
            'valid_minutes' => 'required|integer|min:5|max:120',
        ]);

        try {
            $admin = auth()->user();
            $qrSession = $this->qrSessionService->generateQrSession(
                $admin,
                $request->type,
                $request->valid_minutes
            );

            return back()->with('success', 'QR Session generated successfully.')
                ->with('qrSession', $qrSession);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Invalidate QR session.
     */
    public function destroy(QrSession $qrSession)
    {
        $this->authorize('delete', $qrSession);

        try {
            $admin = auth()->user();
            $this->qrSessionService->invalidateQrSession($admin, $qrSession);

            return back()->with('success', 'QR Session invalidated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Rotate QR session (invalidate old, generate new).
     */
    public function rotate(QrSession $qrSession, Request $request)
    {
        $this->authorize('update', $qrSession);

        $request->validate([
            'valid_minutes' => 'required|integer|min:5|max:120',
        ]);

        try {
            $admin = auth()->user();
            $newSession = $this->qrSessionService->rotateQrSession(
                $admin,
                $qrSession,
                $request->valid_minutes
            );

            return back()->with('success', 'QR Session rotated successfully.')
                ->with('qrSession', $newSession);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
