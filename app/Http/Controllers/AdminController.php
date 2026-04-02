<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Show the admin dashboard.
     */
    public function dashboard()
    {
        // Check if user is admin
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            return redirect()->route('dashboard');
        }

        // Get summary statistics
        $totalTrainees = User::where('role', 'trainee')->count();
        $totalAttendanceRecords = Attendance::count();
        
        // Get today's attendance summary
        $todayAttendance = Attendance::whereDate('attendance_date', today())
            ->with('user')
            ->get();
        
        $todayTimedIn = $todayAttendance->where('time_in', '!=', null)->count();
        $todayTimedOut = $todayAttendance->where('time_out', '!=', null)->count();

        // Get recent attendance records (last 10)
        $recentAttendance = Attendance::with('user')
            ->latest('attendance_date')
            ->limit(10)
            ->get();

        // Get trainees with OJT progress
        $trainees = User::where('role', 'trainee')
            ->with('attendances')
            ->get()
            ->map(function ($user) {
                $totalHours = $user->attendances->sum(function ($attendance) {
                    if ($attendance->time_in && $attendance->time_out) {
                        $in = \Carbon\Carbon::createFromFormat('H:i:s', $attendance->time_in);
                        $out = \Carbon\Carbon::createFromFormat('H:i:s', $attendance->time_out);
                        if ($out < $in) {
                            $out = $out->addDay();
                        }
                        return $in->diffInHours($out);
                    }
                    return 0;
                });
                
                return [
                    'id' => $user->id,
                    'name' => $user->trainee_name ?? $user->name,
                    'email' => $user->email,
                    'course' => $user->course_qualification,
                    'agency' => $user->agency_company,
                    'ojt_start_date' => $user->ojt_start_date,
                    'ojt_end_date' => $user->ojt_end_date,
                    'ojt_total_hours' => $user->ojt_total_hours,
                    'total_hours_worked' => round($totalHours, 2),
                    'progress_percentage' => $user->ojt_total_hours > 0 
                        ? round(($totalHours / $user->ojt_total_hours) * 100, 1)
                        : 0,
                ];
            });

        return Inertia::render('admin/dashboard', [
            'totalTrainees' => $totalTrainees,
            'totalAttendanceRecords' => $totalAttendanceRecords,
            'todayTimedIn' => $todayTimedIn,
            'todayTimedOut' => $todayTimedOut,
            'recentAttendance' => $recentAttendance,
            'trainees' => $trainees,
        ]);
    }

    /**
     * Get all trainees.
     */
    public function getTrainees()
    {
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $trainees = User::where('role', 'trainee')
            ->select('id', 'name', 'trainee_name', 'email', 'course_qualification', 'agency_company', 'ojt_start_date', 'ojt_end_date', 'ojt_total_hours', 'on_site_supervisor')
            ->get();

        return response()->json(['data' => $trainees]);
    }

    /**
     * Get attendance summary.
     */
    public function getAttendanceSummary()
    {
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $summary = [
            'total_records' => Attendance::count(),
            'today_timed_in' => Attendance::whereDate('attendance_date', today())->whereNotNull('time_in')->count(),
            'today_timed_out' => Attendance::whereDate('attendance_date', today())->whereNotNull('time_out')->count(),
            'this_month' => Attendance::whereMonth('attendance_date', now()->month)->count(),
        ];

        return response()->json(['data' => $summary]);
    }

    /**
     * Get attendance records by date range.
     */
    public function getAttendanceByDateRange(Request $request)
    {
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $records = Attendance::with('user')
            ->whereBetween('attendance_date', [$validated['start_date'], $validated['end_date']])
            ->get();

        return response()->json(['data' => $records]);
    }

    /**
     * Get trainee details with full history.
     */
    public function getTraineeDetails($traineeId)
    {
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $trainee = User::where('role', 'trainee')
            ->findOrFail($traineeId);

        $attendanceRecords = Attendance::where('user_id', $traineeId)->get();

        $totalHours = $attendanceRecords->sum(function ($attendance) {
            if ($attendance->time_in && $attendance->time_out) {
                $in = \Carbon\Carbon::createFromFormat('H:i:s', $attendance->time_in);
                $out = \Carbon\Carbon::createFromFormat('H:i:s', $attendance->time_out);
                if ($out < $in) {
                    $out = $out->addDay();
                }
                return $in->diffInHours($out);
            }
            return 0;
        });

        return response()->json([
            'data' => [
                'trainee' => $trainee,
                'attendance_records' => $attendanceRecords,
                'total_hours' => round($totalHours, 2),
                'total_days_worked' => $attendanceRecords->count(),
            ],
        ]);
    }
}
