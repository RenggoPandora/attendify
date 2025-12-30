<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        foreach ($roles as $role) {
            if ($request->user()->hasRole($role)) {
                return $next($request);
            }
        }

        // User doesn't have required role - redirect to their appropriate dashboard
        $user = $request->user();
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard')->with('error', 'Access denied.');
        } elseif ($user->isHr()) {
            return redirect()->route('hr.dashboard')->with('error', 'Access denied.');
        } else {
            return redirect()->route('employee.dashboard')->with('error', 'Access denied.');
        }
    }
}
