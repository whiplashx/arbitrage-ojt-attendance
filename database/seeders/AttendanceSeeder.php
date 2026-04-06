<?php

namespace Database\Seeders;

use App\Models\Attendance;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Populates attendance records for multiple trainees with 2-sentence daily tasks
     */
    public function run(): void
    {
        $attendances = [];

        // Task descriptions (2 sentences each)
        $tasks = [
            'Attended team standup meeting and discussed project roadmap. Completed backend API implementation for user authentication module.',
            'Reviewed code from pull requests and provided constructive feedback. Fixed critical bugs in the payment processing system.',
            'Researched new technologies for database optimization. Documented findings and presented recommendations to the team.',
            'Developed unit tests for core business logic components. Improved code coverage from 65% to 82%.',
            'Integrated third-party payment gateway into existing system. Conducted thorough testing and resolved compatibility issues.',
            'Attended project stakeholder meeting to discuss requirements. Created detailed technical specifications for upcoming features.',
            'Optimized database queries for better performance. Reduced average query execution time by approximately 40%.',
            'Collaborated with UI/UX team on responsive design implementation. Fixed cross-browser compatibility issues.',
            'Conducted security audit of authentication system. Implemented additional security measures and encryption protocols.',
            'Trained new team members on development workflow and coding standards. Prepared comprehensive onboarding documentation.',
            'Fixed critical bugs in production environment. Implemented monitoring and alerting systems for early issue detection.',
            'Participated in architecture planning session for microservices migration. Documented design decisions and created implementation timeline.',
            'Deployed new version to staging environment and conducted regression testing. Validated all features working as expected.',
            'Reviewed system performance metrics and identified bottlenecks. Implemented caching strategy to improve response times.',
            'Updated API documentation with new endpoints and parameters. Ensured all changes are clearly documented for developers.',
        ];

        // User IDs 3, 4, 5 with attendance records and tasks
        for ($userId = 3; $userId <= 5; $userId++) {
            // Generate records for February through early April 2026 (50 working days)
            $dates = [
                // February 2026
                '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06',
                '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13',
                '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
                '2026-02-23', '2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27',
                // March 2026
                '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06',
                '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13',
                '2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20',
                '2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27',
                '2026-03-30', '2026-03-31',
                // April 2026
                '2026-04-01', '2026-04-02', '2026-04-03',
                '2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10',
            ];

            foreach ($dates as $index => $date) {
                $hour = 10 + rand(0, 2);
                $minute = rand(0, 59);
                $timeIn = sprintf('%02d:%02d:00', $hour, $minute);
                $timeOut = sprintf('%02d:%02d:00', $hour + 8 + rand(0, 2), rand(0, 59));

                $timeInAt = "$date " . $timeIn;
                $timeOutAt = "$date " . $timeOut;

                $attendances[] = [
                    'user_id' => $userId,
                    'attendance_date' => $date,
                    'time_in' => $timeIn,
                    'time_out' => $timeOut,
                    'time_in_at' => $timeInAt,
                    'time_out_at' => $timeOutAt,
                    'is_overtime' => rand(0, 1),
                    'verification_method' => 'facial',
                    'daily_task' => $tasks[array_rand($tasks)],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Insert in batches to avoid query size limits
        $chunks = array_chunk($attendances, 100);
        foreach ($chunks as $chunk) {
            Attendance::insert($chunk);
        }

        $this->command->info("✓ Seeding completed!");
        $this->command->info("Total attendance records inserted: " . count($attendances));
        $this->command->info("Records created for users 3, 4, and 5 with daily tasks.");
   }
}
