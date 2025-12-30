<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    /**
     * Determine if the user can view any attendances.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isHr();
    }

    /**
     * Determine if the user can view their own attendance.
     */
    public function view(User $user, Attendance $attendance): bool
    {
        // Users can view their own attendance
        if ($user->id === $attendance->user_id) {
            return true;
        }

        // HR and Admin can view any attendance
        return $user->isAdmin() || $user->isHr();
    }

    /**
     * Determine if the user can create attendance (via QR scan).
     */
    public function create(User $user): bool
    {
        // All authenticated users can create their own attendance
        return $user->is_active;
    }

    /**
     * Determine if the user can update attendance.
     */
    public function update(User $user, Attendance $attendance): bool
    {
        // Only HR and Admin can edit attendance
        return $user->isAdmin() || $user->isHr();
    }

    /**
     * Determine if the user can delete attendance.
     */
    public function delete(User $user, Attendance $attendance): bool
    {
        // Only Admin can delete attendance
        return $user->isAdmin();
    }

    /**
     * Determine if the user can export attendance data.
     */
    public function export(User $user): bool
    {
        return $user->isAdmin() || $user->isHr();
    }
}
