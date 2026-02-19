<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\FacialRecognition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Store facial recognition data for a user.
     */
    public function storeFacialEncoding(Request $request)
    {
        $request->validate([
            'encoding' => 'required|array',
        ]);

        $user = Auth::user();
        $encoding = $request->input('encoding');

        // Create or update facial recognition record
        FacialRecognition::updateOrCreate(
            ['user_id' => $user->id],
            [
                'encoding' => $encoding,
                'encoding_hash' => Hash::make(json_encode($encoding)),
                'registered_at' => Carbon::now(),
                'last_verified_at' => Carbon::now(),
                'is_active' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Facial recognition registered successfully',
        ]);
    }

    /**
     * Record time in for the user.
     */
    public function timeIn(Request $request)
    {
        $request->validate([
            'encoding' => 'required|array',
        ]);

        $user = Auth::user();
        $today = Carbon::now()->toDateString();

        // Check if user already timed in today
        $existingAttendance = Attendance::where('user_id', $user->id)
            ->where('attendance_date', $today)
            ->first();

        if ($existingAttendance && $existingAttendance->time_in) {
            return response()->json([
                'success' => false,
                'message' => 'You have already timed in today',
            ], 400);
        }

        // Create or update attendance record
        $attendance = Attendance::updateOrCreate(
            [
                'user_id' => $user->id,
                'attendance_date' => $today,
            ],
            [
                'time_in' => Carbon::now()->toTimeString(),
                'time_in_at' => Carbon::now(),
                'verification_method' => 'facial',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Time in recorded successfully',
            'data' => $attendance,
        ]);
    }

    /**
     * Record time out for the user.
     */
    public function timeOut(Request $request)
    {
        $request->validate([
            'encoding' => 'required|array',
            'is_overtime' => 'required|boolean',
        ]);

        $user = Auth::user();
        $today = Carbon::now()->toDateString();

        // Check if user has timed in
        $attendance = Attendance::where('user_id', $user->id)
            ->where('attendance_date', $today)
            ->first();

        if (!$attendance || !$attendance->time_in) {
            return response()->json([
                'success' => false,
                'message' => 'Please time in first before timing out',
            ], 400);
        }

        if ($attendance->time_out) {
            return response()->json([
                'success' => false,
                'message' => 'You have already timed out today',
            ], 400);
        }

        // Update attendance record with time out
        $attendance->update([
            'time_out' => Carbon::now()->toTimeString(),
            'time_out_at' => Carbon::now(),
            'is_overtime' => $request->input('is_overtime', false),
            'verification_method' => 'facial',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Time out recorded successfully',
            'data' => $attendance,
        ]);
    }

    /**
     * Get today's attendance record.
     */
    public function getTodayAttendance()
    {
        $user = Auth::user();
        $today = Carbon::now()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('attendance_date', $today)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }
}
