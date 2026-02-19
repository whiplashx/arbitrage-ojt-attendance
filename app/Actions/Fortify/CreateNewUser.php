<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $userData = [
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ];

        // Add facial encoding if provided during registration
        if (!empty($input['facial_encoding'])) {
            $userData['facial_encoding'] = $input['facial_encoding'];
            $userData['facial_data_hash'] = hash('sha256', $input['facial_encoding']);
            $userData['facial_registered_at'] = now();
            $userData['facial_enabled'] = true;
        }

        return User::create($userData);
    }
}
