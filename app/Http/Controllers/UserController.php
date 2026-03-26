<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Get OJT information for the authenticated user.
     */
    public function getOjtInfo()
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data' => [
                'ojt_start_date' => $user->ojt_start_date,
                'ojt_end_date' => $user->ojt_end_date,
                'ojt_total_hours' => $user->ojt_total_hours,
            ],
        ]);
    }

    /**
     * Update OJT information for the authenticated user.
     */
    public function updateOjtInfo(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'ojt_start_date' => 'nullable|date',
            'ojt_end_date' => 'nullable|date|after:ojt_start_date',
            'ojt_total_hours' => 'nullable|numeric|min:1',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'OJT information updated successfully',
            'data' => [
                'ojt_start_date' => $user->ojt_start_date,
                'ojt_end_date' => $user->ojt_end_date,
                'ojt_total_hours' => $user->ojt_total_hours,
            ],
        ]);
    }

    /**
     * Update trainee information for the authenticated user.
     */
    public function updateTraineeInfo(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'trainee_name' => 'nullable|string|max:255',
            'course_qualification' => 'nullable|string|max:255',
            'agency_company' => 'nullable|string|max:255',
            'on_site_supervisor' => 'nullable|string|max:255',
            'ojt_start_date' => 'nullable|date',
            'ojt_end_date' => 'nullable|date',
            'ojt_total_hours' => 'nullable|numeric|min:1',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Trainee information updated successfully',
            'data' => [
                'trainee_name' => $user->trainee_name,
                'course_qualification' => $user->course_qualification,
                'agency_company' => $user->agency_company,
                'on_site_supervisor' => $user->on_site_supervisor,
                'ojt_start_date' => $user->ojt_start_date,
                'ojt_end_date' => $user->ojt_end_date,
                'ojt_total_hours' => $user->ojt_total_hours,
            ],
        ]);
    }
}

