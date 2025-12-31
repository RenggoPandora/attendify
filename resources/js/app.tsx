import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { route as ziggyRoute } from 'ziggy-js';
import { SplashScreen } from './components/splash-screen';

// Make Ziggy route helper available globally
window.route = ziggyRoute;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <SplashScreen />
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#3B82F6', // Blue color for progress bar
    },
});

// This will set light / dark mode on load...
initializeTheme();
