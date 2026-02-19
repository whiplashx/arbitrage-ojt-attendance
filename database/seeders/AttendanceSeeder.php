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

            // Create attendance record with ±1% time variance for realism
            // 1% of 8 hours = 4.8 minutes ≈ 288 seconds
            $variance = rand(-288, 288); // ±1% variance in seconds
            
            $timeInAt = $date->copy()->setTime(12, 0, 0)->addSeconds($variance);
            $timeOutAt = $date->copy()->setTime(20, 0, 0)->addSeconds($variance);
            
            Attendance::create([
                'user_id' => 2,
                'attendance_date' => $date->toDateString(),
                'time_in' => $timeInAt->format('H:i:s'),
                'time_out' => $timeOutAt->format('H:i:s'),
                'time_in_at' => $timeInAt,
                'time_out_at' => $timeOutAt,
                'is_overtime' => false,
                'verification_method' => 'facial',
            ]);

            $this->command->line("Created attendance for {$date->format('Y-m-d')} ({$timeInAt->format('H:i')} - {$timeOutAt->format('H:i')})");
            $created++;
        }

        $this->command->info("\n✓ Seeding completed!");
        $this->command->info("Created: {$created} records");
        $this->command->info("Skipped: {$skipped} records");
        $this->command->info("Total hours: " . ($created * 8) . " hours");
    }
}
