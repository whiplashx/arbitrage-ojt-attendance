<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'attendance_date',
        'time_in',
        'time_out',
        'time_in_at',
        'time_out_at',
        'is_overtime',
        'verification_method',
        'notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'time_in' => 'string', // Store as string (HH:MM:SS) since column is TIME
        'time_out' => 'string', // Store as string (HH:MM:SS) since column is TIME
        'time_in_at' => 'datetime',
        'time_out_at' => 'datetime',
        'is_overtime' => 'boolean',
    ];

    /**
     * Get the user that owns the attendance record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
