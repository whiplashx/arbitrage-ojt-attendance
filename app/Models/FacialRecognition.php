<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacialRecognition extends Model
{
    protected $fillable = [
        'user_id',
        'encoding',
        'encoding_hash',
        'registered_at',
        'last_verified_at',
        'is_active',
    ];

    protected $casts = [
        'encoding' => 'array',
        'registered_at' => 'datetime',
        'last_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the facial recognition.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
