<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the authenticated user (or first user if none authenticated)
        $user = User::first(); // or Auth::user() if running in context

        if (!$user) {
            $this->command->error('No user found in database');
            return;
        }

        $startDate = Carbon::createFromFormat('Y-m-d', '2026-02-03');
        $endDate = Carbon::createFromFormat('Y-m-d', '2026-02-19');

        $this->command->info("Creating attendance records for user: {$user->name} ({$user->id})");
        $this->command->info("Date range: {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')}");

        $created = 0;
        $skipped = 0;

        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if ($date->dayOfWeek === 0 || $date->dayOfWeek === 6) {
                $this->command->line("Skipping {$date->format('Y-m-d')} (Weekend)");
                $skipped++;
                continue;
            }

            // Check if attendance already exists for this date
            $existingAttendance = Attendance::where('user_id', $user->id)
                ->where('attendance_date', $date->toDateString())
                ->first();

            if ($existingAttendance) {
                $this->command->line("Skipping {$date->format('Y-m-d')} (Already exists)");
                $skipped++;
                continue;
            }

            // Create attendance record
            Attendance::create([
                'user_id' => $user->id,
                'attendance_date' => $date->toDateString(),
                'time_in' => '12:00:00', // 12 PM
                'time_out' => '20:00:00', // 8 PM
                'time_in_at' => $date->copy()->setTime(12, 0, 0),
                'time_out_at' => $date->copy()->setTime(20, 0, 0),
                'is_overtime' => false,
                'verification_method' => 'facial',
            ]);

            $this->command->line("Created attendance for {$date->format('Y-m-d')} (12:00 PM - 8:00 PM)");
            $created++;
        }

        $this->command->info("\n✓ Seeding completed!");
        $this->command->info("Created: {$created} records");
        $this->command->info("Skipped: {$skipped} records");
        $this->command->info("Total hours: " . ($created * 8) . " hours");
    }
}
