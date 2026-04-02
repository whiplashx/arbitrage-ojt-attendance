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
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'), // Change this to a secure password!
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        if ($admin->wasRecentlyCreated) {
            $this->command->info('Admin user created successfully!');
            $this->command->line('Email: admin@example.com');
            $this->command->line('Password: password');
            $this->command->warn('⚠️  Please change the password immediately after first login!');
        } else {
            $this->command->line('Admin user already exists.');
        }

        // Optional: Create additional admin users
        $additionalAdmins = [
            [
                'name' => 'System Administrator',
                'email' => 'sysadmin@example.com',
                'password' => 'sysadmin123',
            ],
            [
                'name' => 'OJT Coordinator',
                'email' => 'coordinator@example.com',
                'password' => 'coordinator123',
            ],
        ];

        foreach ($additionalAdmins as $adminData) {
            $admin = User::firstOrCreate(
                ['email' => $adminData['email']],
                [
                    'name' => $adminData['name'],
                    'password' => Hash::make($adminData['password']),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]
            );

            if ($admin->wasRecentlyCreated) {
                $this->command->info("Admin user '{$adminData['name']}' created successfully!");
                $this->command->line("Email: {$adminData['email']}");
                $this->command->line("Password: {$adminData['password']}");
            }
        }

        $this->command->newLine();
        $this->command->info('✓ Admin seeder completed!');
    }
}
