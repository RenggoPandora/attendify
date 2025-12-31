import { useEffect, useState } from 'react';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        // Start fade out animation after 2 seconds
        const fadeOutTimer = setTimeout(() => {
            setIsAnimatingOut(true);
        }, 2000);

        // Remove component after fade out completes
        const removeTimer = setTimeout(() => {
            setIsVisible(false);
        }, 3000); // 2000ms delay + 1000ms fade out

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div 
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 transition-opacity duration-1000 ease-in-out ${
                isAnimatingOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse"></div>
                    <img 
                        src="/assets/logo.png" 
                        alt="Attendify" 
                        className="relative w-32 h-32 object-contain drop-shadow-2xl"
                    />
                </div>
                
                {/* App Name */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Attendify
                    </h1>
                    <p className="text-blue-100 text-sm font-medium">
                        Smart Attendance System
                    </p>
                </div>

                {/* Loading Spinner */}
                <div className="flex gap-2 mt-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
