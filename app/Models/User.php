<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'facial_encoding',
        'facial_data_hash',
        'facial_registered_at',
        'facial_enabled',
        'ojt_start_date',
        'ojt_end_date',
        'ojt_total_hours',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'facial_encoding',
        'facial_data_hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'facial_registered_at' => 'datetime',
            'facial_enabled' => 'boolean',
            'ojt_start_date' => 'date',
            'ojt_end_date' => 'date',
            'ojt_total_hours' => 'decimal:2',
        ];
    }

    /**
     * Get the user's facial recognition record.
     */
    public function facialRecognition(): HasOne
    {
        return $this->hasOne(FacialRecognition::class);
    }

    /**
     * Get the user's attendance records.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
