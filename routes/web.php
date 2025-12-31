<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Employee\AttendanceController as EmployeeAttendanceController;
use App\Http\Controllers\Hr\AttendanceController as HrAttendanceController;
use App\Http\Controllers\Hr\ExportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Splash screen - checks auth & role, then redirects
Route::get('/', function () {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    $user = auth()->user();
    
    // Role-based redirect
    if ($user->isAdmin()) {
        return redirect()->route('admin.dashboard');
    } elseif ($user->isHr()) {
        return redirect()->route('hr.dashboard');
    } else {
        return redirect()->route('employee.dashboard');
    }
})->name('home');

// Employee Routes (User role)
Route::middleware(['auth', 'role:user'])->prefix('employee')->name('employee.')->group(function () {
    Route::get('/dashboard', [EmployeeAttendanceController::class, 'index'])->name('dashboard');
    Route::get('/scan', [EmployeeAttendanceController::class, 'scan'])->name('scan');
    Route::post('/attendance/submit', [EmployeeAttendanceController::class, 'submit'])->name('attendance.submit');
    Route::get('/history', [EmployeeAttendanceController::class, 'history'])->name('history');
});

// HR Routes
Route::middleware(['auth', 'role:hr'])->prefix('hr')->name('hr.')->group(function () {
    Route::get('/dashboard', [HrAttendanceController::class, 'index'])->name('dashboard');
    Route::get('/attendance', [HrAttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance/{attendance}/edit', [HrAttendanceController::class, 'edit'])->name('attendance.edit');
    Route::put('/attendance/{attendance}', [HrAttendanceController::class, 'update'])->name('attendance.update');
    Route::get('/recap', [HrAttendanceController::class, 'recap'])->name('recap');
    Route::get('/export/csv', [ExportController::class, 'csv'])->name('export.csv');
});

// Admin Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // User Management
    Route::resource('users', UserController::class);
    
    // Department Management
    Route::resource('departments', DepartmentController::class);
    
    // QR Session Management
    Route::get('/qr-display', function () {
        $qrService = app(\App\Services\QrService::class);
        $activeQrSession = $qrService->getActiveQrSession();
        
        return Inertia::render('Admin/QrDisplay', [
            'activeQrSession' => $activeQrSession,
        ]);
    })->name('qr-display');
    
    Route::get('/qr-sessions', [QrSessionController::class, 'index'])->name('qr-sessions.index');
    Route::post('/qr-sessions', [QrSessionController::class, 'store'])->name('qr-sessions.store');
    Route::delete('/qr-sessions/{qrSession}', [QrSessionController::class, 'destroy'])->name('qr-sessions.destroy');
    Route::post('/qr-sessions/{qrSession}/rotate', [QrSessionController::class, 'rotate'])->name('qr-sessions.rotate');
});

require __DIR__.'/settings.php';
