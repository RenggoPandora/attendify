<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can view a user.
     */
    public function view(User $user, User $model): bool
    {
        // Users can view their own profile
        if ($user->id === $model->id) {
            return true;
        }

        // Admin can view any user
        return $user->isAdmin();
    }

    /**
     * Determine if the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can update users.
     */
    public function update(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can delete users.
     */
    public function delete(User $user, User $model): bool
    {
        // Admin can delete, but not themselves
        return $user->isAdmin() && $user->id !== $model->id;
    }

    /**
     * Determine if the user can assign roles.
     */
    public function assignRole(User $user): bool
    {
        return $user->isAdmin();
    }
}
