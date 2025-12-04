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

    const cycleTheme = () => {
        const order: Theme[] = ['system', 'light', 'dark'];
        const currentIndex = order.indexOf(theme);
        const nextTheme = order[(currentIndex + 1) % order.length];
        handleThemeChange(nextTheme);
    };

    const icon = theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />;
    const label = theme === 'light' ? 'Switch to dark mode' : theme === 'dark' ? 'Use system theme' : 'Switch to light mode';

    return (
        <button
            onClick={cycleTheme}
            aria-label={label}
            className="rounded-full p-3 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-100 shadow-lg border border-zinc-200 dark:border-zinc-700 hover:-translate-y-0.5 transition-transform"
            title={label}
        >
            {icon}
        </button>
    );
}
