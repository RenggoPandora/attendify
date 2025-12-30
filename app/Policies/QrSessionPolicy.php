<?php

namespace App\Policies;

use App\Models\QrSession;
use App\Models\User;

class QrSessionPolicy
{
    /**
     * Determine if the user can view QR sessions.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can create QR sessions.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can update QR sessions.
     */
    public function update(User $user, QrSession $qrSession): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can delete/invalidate QR sessions.
     */
    public function delete(User $user, QrSession $qrSession): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can scan QR for attendance.
     */
    public function scan(User $user): bool
    {
        return $user->is_active && $user->isUser();
    }
}
