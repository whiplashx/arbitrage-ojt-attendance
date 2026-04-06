<?php

namespace Database\Seeders;

use App\Models\Attendance;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Populates attendance records for user_id 1 (josh) from SQL dump data
     */
    public function run(): void
    {
        // All attendance records for user_id 1 (josh) from the SQL dump
        $attendances = [
            ['user_id' => 2, 'attendance_date' => '2026-02-19', 'time_in' => '11:55:01', 'time_out' => '21:31:25', 'time_in_at' => '2026-02-19 11:55:22', 'time_out_at' => '2026-02-19 20:01:25', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 15:13:02', 'updated_at' => '2026-02-19 20:01:25'],
            ['user_id' => 2, 'attendance_date' => '2026-02-03', 'time_in' => '11:01:47', 'time_out' => '21:01:47', 'time_in_at' => '2026-02-03 12:01:47', 'time_out_at' => '2026-02-03 20:01:47', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-04', 'time_in' => '11:59:46', 'time_out' => '20:59:46', 'time_in_at' => '2026-02-04 11:59:46', 'time_out_at' => '2026-02-04 19:59:46', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-05', 'time_in' => '11:56:28', 'time_out' => '19:56:28', 'time_in_at' => '2026-02-05 11:56:28', 'time_out_at' => '2026-02-05 19:56:28', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-06', 'time_in' => '12:01:28', 'time_out' => '21:01:28', 'time_in_at' => '2026-02-06 12:01:28', 'time_out_at' => '2026-02-06 20:01:28', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-09', 'time_in' => '12:01:24', 'time_out' => '20:01:24', 'time_in_at' => '2026-02-09 12:01:24', 'time_out_at' => '2026-02-09 20:01:24', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-10', 'time_in' => '11:57:01', 'time_out' => '19:57:01', 'time_in_at' => '2026-02-10 11:57:01', 'time_out_at' => '2026-02-10 19:57:01', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-11', 'time_in' => '11:56:43', 'time_out' => '19:56:43', 'time_in_at' => '2026-02-11 11:56:43', 'time_out_at' => '2026-02-11 19:56:43', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-12', 'time_in' => '12:01:46', 'time_out' => '23:01:46', 'time_in_at' => '2026-02-12 12:01:46', 'time_out_at' => '2026-02-12 20:01:46', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-13', 'time_in' => '11:56:15', 'time_out' => '21:02:15', 'time_in_at' => '2026-02-13 11:56:15', 'time_out_at' => '2026-02-13 19:56:15', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-16', 'time_in' => '11:31:10', 'time_out' => '20:03:08', 'time_in_at' => '2026-02-16 12:03:08', 'time_out_at' => '2026-02-16 20:03:08', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-17', 'time_in' => '12:02:20', 'time_out' => '20:02:20', 'time_in_at' => '2026-02-17 12:02:20', 'time_out_at' => '2026-02-17 20:02:20', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-18', 'time_in' => '11:55:33', 'time_out' => '19:55:33', 'time_in_at' => '2026-02-18 11:55:33', 'time_out_at' => '2026-02-18 19:55:33', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-19 18:59:35', 'updated_at' => '2026-02-19 18:59:35'],
            ['user_id' => 2, 'attendance_date' => '2026-02-20', 'time_in' => '11:46:07', 'time_out' => '21:20:24', 'time_in_at' => '2026-02-20 11:46:07', 'time_out_at' => '2026-02-20 20:20:24', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-20 11:46:07', 'updated_at' => '2026-02-20 20:20:24'],
            ['user_id' => 2, 'attendance_date' => '2026-02-26', 'time_in' => '11:29:51', 'time_out' => '21:30:25', 'time_in_at' => '2026-02-26 11:29:51', 'time_out_at' => '2026-02-26 21:30:25', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-26 11:29:51', 'updated_at' => '2026-02-26 21:30:25'],
            ['user_id' => 2, 'attendance_date' => '2026-02-27', 'time_in' => '10:45:38', 'time_out' => '21:22:00', 'time_in_at' => '2026-02-27 10:45:38', 'time_out_at' => '2026-02-27 21:22:00', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-02-27 10:45:38', 'updated_at' => '2026-02-27 21:22:00'],
            ['user_id' => 2, 'attendance_date' => '2026-03-02', 'time_in' => '10:55:27', 'time_out' => '21:10:47', 'time_in_at' => '2026-03-02 10:55:27', 'time_out_at' => '2026-03-02 21:10:47', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-02 10:55:27', 'updated_at' => '2026-03-02 21:10:47'],
            ['user_id' => 2, 'attendance_date' => '2026-03-03', 'time_in' => '10:58:50', 'time_out' => '20:59:22', 'time_in_at' => '2026-03-03 10:58:50', 'time_out_at' => '2026-03-03 20:59:22', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-03 10:58:50', 'updated_at' => '2026-03-03 20:59:22'],
            ['user_id' => 2, 'attendance_date' => '2026-03-04', 'time_in' => '10:24:21', 'time_out' => '21:30:22', 'time_in_at' => '2026-03-04 10:24:21', 'time_out_at' => '2026-03-04 21:30:22', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-04 10:24:21', 'updated_at' => '2026-03-04 21:30:22'],
            ['user_id' => 2, 'attendance_date' => '2026-03-05', 'time_in' => '10:30:53', 'time_out' => '21:00:09', 'time_in_at' => '2026-03-05 10:30:53', 'time_out_at' => '2026-03-05 21:00:09', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-05 10:30:53', 'updated_at' => '2026-03-05 21:00:09'],
            ['user_id' => 2, 'attendance_date' => '2026-03-06', 'time_in' => '10:16:10', 'time_out' => '21:01:50', 'time_in_at' => '2026-03-06 10:16:10', 'time_out_at' => '2026-03-06 21:01:50', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-06 10:16:10', 'updated_at' => '2026-03-06 21:01:50'],
            ['user_id' => 2, 'attendance_date' => '2026-03-09', 'time_in' => '10:53:50', 'time_out' => '20:34:18', 'time_in_at' => '2026-03-09 10:53:50', 'time_out_at' => '2026-03-09 20:34:18', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-09 10:53:50', 'updated_at' => '2026-03-09 20:34:18'],
            ['user_id' => 2, 'attendance_date' => '2026-03-10', 'time_in' => '10:12:26', 'time_out' => '21:22:44', 'time_in_at' => '2026-03-10 10:12:26', 'time_out_at' => '2026-03-10 21:22:44', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-10 10:12:26', 'updated_at' => '2026-03-10 21:22:44'],
            ['user_id' => 2, 'attendance_date' => '2026-03-11', 'time_in' => '10:11:35', 'time_out' => '20:40:48', 'time_in_at' => '2026-03-11 10:11:35', 'time_out_at' => '2026-03-11 20:40:48', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-11 10:11:35', 'updated_at' => '2026-03-11 20:40:48'],
            ['user_id' => 2, 'attendance_date' => '2026-03-12', 'time_in' => '10:04:18', 'time_out' => '20:44:39', 'time_in_at' => '2026-03-12 10:04:18', 'time_out_at' => '2026-03-12 20:44:39', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-12 10:04:18', 'updated_at' => '2026-03-12 20:44:39'],
            ['user_id' => 2, 'attendance_date' => '2026-03-13', 'time_in' => '10:14:48', 'time_out' => '21:17:43', 'time_in_at' => '2026-03-13 10:14:48', 'time_out_at' => '2026-03-13 21:17:43', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-13 10:14:48', 'updated_at' => '2026-03-13 21:17:43'],
            ['user_id' => 2, 'attendance_date' => '2026-03-16', 'time_in' => '10:20:43', 'time_out' => '21:14:29', 'time_in_at' => '2026-03-16 10:46:43', 'time_out_at' => '2026-03-16 21:14:29', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-16 10:46:43', 'updated_at' => '2026-03-16 21:14:29'],
            ['user_id' => 2, 'attendance_date' => '2026-03-17', 'time_in' => '10:30:00', 'time_out' => '21:45:38', 'time_in_at' => '2026-03-17 12:09:09', 'time_out_at' => '2026-03-17 23:45:38', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-17 12:09:09', 'updated_at' => '2026-03-17 23:45:38'],
            ['user_id' => 2, 'attendance_date' => '2026-03-18', 'time_in' => '11:15:57', 'time_out' => '19:24:52', 'time_in_at' => '2026-03-18 11:15:57', 'time_out_at' => '2026-03-18 17:24:52', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-18 11:15:57', 'updated_at' => '2026-03-18 17:24:52'],
            ['user_id' => 2, 'attendance_date' => '2026-03-19', 'time_in' => '09:52:09', 'time_out' => '22:36:36', 'time_in_at' => '2026-03-19 09:52:09', 'time_out_at' => '2026-03-19 22:36:36', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-19 09:52:09', 'updated_at' => '2026-03-19 22:36:36'],
            ['user_id' => 2, 'attendance_date' => '2026-03-23', 'time_in' => '10:28:14', 'time_out' => '21:30:04', 'time_in_at' => '2026-03-23 10:28:14', 'time_out_at' => '2026-03-23 22:13:04', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-23 10:28:14', 'updated_at' => '2026-03-23 22:13:04'],
            ['user_id' => 2, 'attendance_date' => '2026-03-24', 'time_in' => '10:26:38', 'time_out' => '20:14:26', 'time_in_at' => '2026-03-24 10:46:38', 'time_out_at' => '2026-03-24 20:14:26', 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-24 10:46:38', 'updated_at' => '2026-03-24 20:14:26'],
            ['user_id' => 2, 'attendance_date' => '2026-03-25', 'time_in' => '10:08:04', 'time_out' => '18:00:00', 'time_in_at' => '2026-03-25 10:08:04', 'time_out_at' => NULL, 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-25 10:08:04', 'updated_at' => '2026-03-25 10:08:04'],
            ['user_id' => 2, 'attendance_date' => '2026-03-26', 'time_in' => '10:06:02', 'time_out' => NULL, 'time_in_at' => '2026-03-26 10:26:02', 'time_out_at' => NULL, 'is_overtime' => 0, 'verification_method' => 'facial', 'created_at' => '2026-03-26 10:26:02', 'updated_at' => '2026-03-26 10:26:02'],
        ];

        // Insert in batches to avoid query size limits
        $chunks = array_chunk($attendances, 100);
        foreach ($chunks as $chunk) {
            Attendance::insert($chunk);
        }

        $this->command->info("✓ Seeding completed!");
        $this->command->info("Total attendance records inserted for user_id 1: " . count($attendances));
   }
}
