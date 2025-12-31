import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left side - Form */}
            <div className="relative flex flex-col gap-4 p-6 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/60 to-indigo-50/80 backdrop-blur-3xl"></div>
                <div className="relative z-10 flex justify-center gap-2 md:justify-start">
                    <Link href={route('home')} className="flex items-center gap-2 font-medium">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
                            <img 
                                src="/assets/logo.png" 
                                alt="Attendify" 
                                className="h-6 w-6 object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Attendify</span>
                    </Link>
                </div>
                <div className="relative z-10 flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <div className="rounded-2xl bg-white/70 backdrop-blur-xl p-8 shadow-xl border border-white/40">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2 text-center">
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                                    <p className="text-sm text-gray-600">
                                        {description}
                                    </p>
                                </div>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right side - Image/Illustration */}
            <div className="relative hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 lg:block">
                <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <div className="space-y-8 text-center">
                        <div className="flex justify-center">
                            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-8 shadow-2xl border border-white/20">
                                <img 
                                    src="/assets/logo.png" 
                                    alt="Attendify Logo" 
                                    className="h-24 w-24 object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-4 max-w-md">
                            <h2 className="text-4xl font-bold text-white">
                                Welcome to Attendify
                            </h2>
                            <p className="text-lg text-blue-100">
                                Sistem absensi modern untuk mengelola kehadiran karyawan dengan mudah dan efisien
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-8">
                            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4 border border-white/20">
                                <div className="text-3xl font-bold text-white">QR</div>
                                <div className="text-sm text-blue-100">Code Based</div>
                            </div>
                            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4 border border-white/20">
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-sm text-blue-100">Access</div>
                            </div>
                            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4 border border-white/20">
                                <div className="text-3xl font-bold text-white">Real</div>
                                <div className="text-sm text-blue-100">Time</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
