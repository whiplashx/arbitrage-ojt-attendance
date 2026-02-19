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
     * Calculate Euclidean distance between two face encodings.
     * Lower distance = more similar faces.
     */
    private function calculateDistance(array $encoding1, array $encoding2): float
    {
        // Ensure both encodings have the same length
        if (count($encoding1) !== count($encoding2)) {
            return 999.0; // Return very high distance if lengths don't match
        }

        $sum = 0.0;
        for ($i = 0; $i < count($encoding1); $i++) {
            $diff = (float)$encoding1[$i] - (float)$encoding2[$i];
            $sum += $diff * $diff;
        }
        return sqrt($sum);
    }

    /**
     * Verify if the provided encoding matches the user's registered face.
     * Distance threshold of 0.45 is used (0 = identical, 1 = completely different).
     * Lower threshold = stricter face matching
     */
    private function verifyFacialEncoding(int $userId, array $encoding, float $threshold = 0.45): bool
    {
        $facialRecognition = FacialRecognition::where('user_id', $userId)
            ->where('is_active', true)
            ->first();

        if (!$facialRecognition) {
            \Log::warning('No facial recognition found for user: ' . $userId);
            return false;
        }

        // Handle both array and JSON string encodings
        $storedEncoding = $facialRecognition->encoding;
        if (is_string($storedEncoding)) {
            $storedEncoding = json_decode($storedEncoding, true);
        }

        if (!is_array($storedEncoding)) {
            \Log::error('Stored encoding is not an array for user: ' . $userId);
            return false;
        }

        if (!is_array($encoding)) {
            \Log::error('Provided encoding is not an array for user: ' . $userId);
            return false;
        }

        // Log encoding info for debugging
        \Log::info('Verifying encoding for user: ' . $userId);
        \Log::info('Stored encoding length: ' . count($storedEncoding) . ', Provided encoding length: ' . count($encoding));
        \Log::info('Stored encoding sample: ' . implode(',', array_slice($storedEncoding, 0, 5)));
        \Log::info('Provided encoding sample: ' . implode(',', array_slice($encoding, 0, 5)));

        $distance = $this->calculateDistance($encoding, $storedEncoding);
        \Log::info('Facial verification distance: ' . $distance . ' (threshold: ' . $threshold . ') for user: ' . $userId);
        
        if ($distance > $threshold) {
            \Log::warning('Facial verification FAILED - distance ' . $distance . ' exceeds threshold ' . $threshold . ' for user: ' . $userId);
            return false;
        }
        
        \Log::info('Facial verification PASSED - distance ' . $distance . ' is within threshold ' . $threshold . ' for user: ' . $userId);
        return true;
    }
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

        \Log::info('Storing facial encoding for user: ' . $user->id . ' with encoding count: ' . count($encoding));

        // Create or update facial recognition record
        $facial = FacialRecognition::updateOrCreate(
            ['user_id' => $user->id],
            [
                'encoding' => $encoding, // Store as array - Laravel will JSON encode it
                'encoding_hash' => Hash::make(json_encode($encoding)),
                'registered_at' => Carbon::now(),
                'last_verified_at' => Carbon::now(),
                'is_active' => true,
            ]
        );

        \Log::info('Facial encoding saved successfully. ID: ' . $facial->id);

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

        \Log::info('Time in request for user: ' . $user->id . ' on ' . $today);

        // Verify facial encoding matches user's registered face
        if (!$this->verifyFacialEncoding($user->id, $request->input('encoding'))) {
            \Log::warning('Facial verification failed for user: ' . $user->id);
            return response()->json([
                'success' => false,
                'message' => 'Facial verification failed. Please try again.',
            ], 401);
        }

        \Log::info('Facial verification passed for user: ' . $user->id);

        // Check if user already timed in today
        $existingAttendance = Attendance::where('user_id', $user->id)
            ->where('attendance_date', $today)
            ->first();

        if ($existingAttendance && $existingAttendance->time_in) {
            \Log::warning('User already timed in today: ' . $user->id);
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

        \Log::info('Time in recorded successfully for user: ' . $user->id . ' at ' . $attendance->time_in);

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

        \Log::info('Time out request for user: ' . $user->id . ' on ' . $today);

        // Verify facial encoding matches user's registered face
        if (!$this->verifyFacialEncoding($user->id, $request->input('encoding'))) {
            \Log::warning('Facial verification failed for user: ' . $user->id);
            return response()->json([
                'success' => false,
                'message' => 'Facial verification failed. Please try again.',
            ], 401);
        }

        \Log::info('Facial verification passed for user: ' . $user->id);

        // Check if user has timed in
        $attendance = Attendance::where('user_id', $user->id)
            ->where('attendance_date', $today)
            ->first();

        if (!$attendance || !$attendance->time_in) {
            \Log::warning('User has not timed in today: ' . $user->id);
            return response()->json([
                'success' => false,
                'message' => 'Please time in first before timing out',
            ], 400);
        }

        if ($attendance->time_out) {
            \Log::warning('User already timed out today: ' . $user->id);
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

        \Log::info('Time out recorded successfully for user: ' . $user->id . ' at ' . $attendance->time_out);

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
