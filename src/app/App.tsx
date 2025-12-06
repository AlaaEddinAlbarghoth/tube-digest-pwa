import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useSettingsStore } from '@/state/settingsStore';

export function App() {
    const { preferences } = useSettingsStore();

    // Ensure default LTR layout (RTL is applied only at text level for Arabic content)
    useEffect(() => {
        const root = window.document.documentElement;
        root.dir = 'ltr';
        // Do not set lang globally - let individual text elements handle their own language
    }, []);

    // Handle theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';

        const theme = preferences.theme === 'system' ? systemTheme : preferences.theme;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [preferences.theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (preferences.theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const root = window.document.documentElement;
            if (e.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [preferences.theme]);

    return <RouterProvider router={router} />;
}
