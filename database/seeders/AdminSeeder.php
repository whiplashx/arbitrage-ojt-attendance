<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user with default credentials
        $admin = User::firstOrCreate(
            ['email' => 'info@arbitrage.com.ph'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'), // Change this to a secure password!
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

       
        }

    }
