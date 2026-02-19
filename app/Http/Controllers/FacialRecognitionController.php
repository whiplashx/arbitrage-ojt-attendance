<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Exception;

class FacialRecognitionController extends Controller
{
    /**
     * Store facial encoding during registration
     */
    public function storeFacialData(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'facial_encoding' => 'required|string|min:100',
        ]);

        try {
            $user = User::findOrFail($request->user_id);
            
            // Create a hash of the facial data for quick comparison
            $facialDataHash = hash('sha256', $request->facial_encoding);
            
            // Check if this facial data already exists
            if (User::where('facial_data_hash', $facialDataHash)->where('id', '!=', $user->id)->exists()) {
                throw ValidationException::withMessages([
                    'facial_encoding' => ['This facial data is already registered to another account.'],
                ]);
            }

            $user->update([
                'facial_encoding' => $request->facial_encoding,
                'facial_data_hash' => $facialDataHash,
                'facial_registered_at' => now(),
                'facial_enabled' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Facial recognition registered successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register facial data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify facial encoding
     */
    public function verifyFacialData(Request $request)
    {
        $request->validate([
            'facial_encoding' => 'required|string|min:100',
        ]);

        try {
            $incomingEncoding = json_decode($request->facial_encoding, true);
            
            // Find users with facial recognition enabled
            $users = User::where('facial_enabled', true)->get();

            foreach ($users as $user) {
                if ($user->facial_encoding) {
                    $storedEncoding = json_decode($user->facial_encoding, true);
                    
                    // Compare facial encodings (using Euclidean distance)
                    $distance = $this->euclideanDistance($incomingEncoding, $storedEncoding);
                    
                    // If distance is below threshold, it's a match (0.6 is typical threshold)
                    if ($distance < 0.6) {
                        return response()->json([
                            'success' => true,
                            'matched' => true,
                            'user_id' => $user->id,
                            'distance' => $distance,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'matched' => false,
                'message' => 'No matching face found',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate Euclidean distance between two facial encodings
     */
    private function euclideanDistance(array $encoding1, array $encoding2): float
    {
        if (count($encoding1) !== count($encoding2)) {
            throw new Exception('Encoding dimensions do not match');
        }

        $sum = 0;
        foreach ($encoding1 as $key => $val1) {
            $val2 = $encoding2[$key] ?? 0;
            $sum += pow($val1 - $val2, 2);
        }

        return sqrt($sum);
    }

    /**
     * Disable facial recognition for a user
     */
    public function disableFacialRecognition(Request $request)
    {
        $user = $request->user();

        $user->update([
            'facial_encoding' => null,
            'facial_data_hash' => null,
            'facial_registered_at' => null,
            'facial_enabled' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Facial recognition disabled',
        ]);
    }

    /**
     * Get facial recognition status
     */
    public function getFacialStatus(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'enabled' => (bool) $user->facial_enabled,
            'registered_at' => $user->facial_registered_at?->toIso8601String(),
        ]);
    }
}
