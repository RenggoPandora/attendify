<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'qr_session_id',
        'date',
        'check_in',
        'check_out',
        'status',
        'notes',
        'edited_by',
        'edited_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'check_in' => 'datetime',
            'check_out' => 'datetime',
            'edited_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function qrSession(): BelongsTo
    {
        return $this->belongsTo(QrSession::class);
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    // Helper methods
    public function isLate(): bool
    {
        return $this->status === 'telat';
    }

    public function isPresent(): bool
    {
        return in_array($this->status, ['hadir', 'telat']);
    }
}
