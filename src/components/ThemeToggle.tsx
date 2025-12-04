import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('system');

    useEffect(() => {
        // Get initial theme from localStorage or default to system
        const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;

        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else if (newTheme === 'light') {
            root.classList.remove('dark');
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    useEffect(() => {
        if (theme !== 'system') return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const cycleTheme = () => {
        const order: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = order.indexOf(theme);
        const nextTheme = order[(currentIndex + 1) % order.length];
        handleThemeChange(nextTheme);
    };

    const renderIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="w-5 h-5" aria-hidden="true" />;
            case 'dark':
                return <Moon className="w-5 h-5" aria-hidden="true" />;
            default:
                return <Monitor className="w-5 h-5" aria-hidden="true" />;
        }
    };

    return (
        <button
            onClick={cycleTheme}
            className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/70 shadow-lg text-zinc-700 dark:text-zinc-100 hover:-translate-y-0.5 transition-transform duration-200"
            title={`Switch theme (current: ${theme})`}
        >
            {renderIcon()}
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
