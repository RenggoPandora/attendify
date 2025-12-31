<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    // Helper methods for role checking
    public function isAdmin(): bool
    {
        return $this->name === 'admin';
    }

    public function isHr(): bool
    {
        return $this->name === 'hr';
    }

    public function isUser(): bool
    {
        return $this->name === 'user';
    }
}
