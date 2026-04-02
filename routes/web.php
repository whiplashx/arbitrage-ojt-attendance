<?php

use App\Http\Controllers\FacialRecognitionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Conditional dashboard based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        // If user is admin, redirect to admin dashboard
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // Otherwise show trainee dashboard
        $hasFacialEncoding = $user && $user->facialRecognition()->exists();
        return Inertia::render('dashboard', [
            'hasFacialEncoding' => $hasFacialEncoding,
        ]);
    })->name('dashboard');

    // Admin Dashboard and Routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
        Route::get('dtr-management', function () {
            return Inertia::render('admin/daily-time-record-management');
        })->name('admin.dtr-management');
        Route::get('api/trainees', [AdminController::class, 'getTrainees']);
        Route::get('api/attendance-summary', [AdminController::class, 'getAttendanceSummary']);
        Route::post('api/attendance-by-date', [AdminController::class, 'getAttendanceByDateRange']);
        Route::get('api/trainee/{traineeId}', [AdminController::class, 'getTraineeDetails']);
    });

    Route::get('biometrics', function () {
        $user = auth()->user();
        $hasFacialEncoding = $user && $user->facialRecognition()->exists();
        return Inertia::render('biometrics', [
            'hasFacialEncoding' => $hasFacialEncoding,
        ]);
    })->name('biometrics');

    Route::get('trainee-info', function () {
        return Inertia::render('trainee-info');
    })->name('trainee-info');

    Route::get('attendance-records', function () {
        return Inertia::render('attendance-records');
    })->name('attendance-records');

    Route::get('daily-time-record', function () {
        return Inertia::render('daily-time-record');
    })->name('daily-time-record');
});

// Facial Recognition Routes
Route::post('/api/facial-recognition/store', [FacialRecognitionController::class, 'storeFacialData'])->middleware('auth');
Route::post('/api/facial-recognition/verify', [FacialRecognitionController::class, 'verifyFacialData']);
Route::post('/api/facial-recognition/disable', [FacialRecognitionController::class, 'disableFacialRecognition'])->middleware('auth');
Route::get('/api/facial-recognition/status', [FacialRecognitionController::class, 'getFacialStatus'])->middleware('auth');

// Attendance Routes
Route::middleware('auth')->group(function () {
    Route::post('/api/attendance/store-facial-encoding', [AttendanceController::class, 'storeFacialEncoding']);
    Route::post('/api/attendance/time-in', [AttendanceController::class, 'timeIn']);
    Route::post('/api/attendance/time-out', [AttendanceController::class, 'timeOut']);
    Route::get('/api/attendance/today', [AttendanceController::class, 'getTodayAttendance']);
    Route::get('/api/attendance/monthly', [AttendanceController::class, 'getMonthlyAttendance']);
    Route::get('/api/attendance/history', [AttendanceController::class, 'getAttendanceHistory']);
    Route::get('/api/attendance/all', [AttendanceController::class, 'getAllAttendance']);
    Route::get('/api/attendance/month/{month}', [AttendanceController::class, 'getAttendanceByMonth']);
    Route::get('/api/attendance/total-hours', [AttendanceController::class, 'getTotalHoursWorked']);
    Route::put('/api/attendance/{id}/task', [AttendanceController::class, 'updateDailyTask']);
});

// User Routes
Route::middleware('auth')->group(function () {
    Route::get('/api/user/ojt-info', [UserController::class, 'getOjtInfo']);
    Route::put('/api/user/ojt-info', [UserController::class, 'updateOjtInfo']);
    Route::put('/api/user/trainee-info', [UserController::class, 'updateTraineeInfo']);
});

require __DIR__.'/settings.php';
