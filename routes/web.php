<?php

use App\Http\Controllers\FacialRecognitionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    $user = auth()->user();
    $hasFacialEncoding = $user && $user->facialRecognition()->exists();
    return Inertia::render('dashboard', [
        'hasFacialEncoding' => $hasFacialEncoding,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('biometrics', function () {
    $user = auth()->user();
    $hasFacialEncoding = $user && $user->facialRecognition()->exists();
    return Inertia::render('biometrics', [
        'hasFacialEncoding' => $hasFacialEncoding,
    ]);
})->middleware(['auth', 'verified'])->name('biometrics');

Route::get('trainee-info', function () {
    return Inertia::render('trainee-info');
})->middleware(['auth', 'verified'])->name('trainee-info');

Route::get('attendance-records', function () {
    return Inertia::render('attendance-records');
})->middleware(['auth', 'verified'])->name('attendance-records');

Route::get('daily-time-record', function () {
    return Inertia::render('daily-time-record');
})->middleware(['auth', 'verified'])->name('daily-time-record');

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
