<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;

class DepartmentPolicy
{
    /**
     * Determine if the user can view any departments.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can view a department.
     */
    public function view(User $user, Department $department): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can create departments.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can update departments.
     */
    public function update(User $user, Department $department): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can delete departments.
     */
    public function delete(User $user, Department $department): bool
    {
        return $user->isAdmin();
    }
}
