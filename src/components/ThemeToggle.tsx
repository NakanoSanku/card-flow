import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
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
        const order: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = order.indexOf(theme);
        const nextTheme = order[(currentIndex + 1) % order.length];
        handleThemeChange(nextTheme);
    };

    const icon =
        theme === 'dark' ? (
            <Moon className="w-5 h-5" />
        ) : theme === 'light' ? (
            <Sun className="w-5 h-5" />
        ) : (
            <Monitor className="w-5 h-5" />
        );

    return (
        <button
            type="button"
            onClick={cycleTheme}
            className={`rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-900/40 p-3 text-zinc-700 dark:text-zinc-200 hover:-translate-y-0.5 transition-transform ${className}`}
            aria-label={`Switch theme (current: ${theme})`}
            title="Switch theme"
        >
            {icon}
        </button>
    );
}
