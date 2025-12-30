<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\QrSession;
use App\Models\User;
use App\Policies\AttendancePolicy;
use App\Policies\DepartmentPolicy;
use App\Policies\QrSessionPolicy;
use App\Policies\UserPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(Attendance::class, AttendancePolicy::class);
        Gate::policy(Department::class, DepartmentPolicy::class);
        Gate::policy(QrSession::class, QrSessionPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
    }
}
