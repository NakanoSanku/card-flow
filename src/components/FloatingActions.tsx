import React from 'react';
import ThemeToggle from './ThemeToggle';
import { ArrowUp, Github } from 'lucide-react';

function FloatingButton({
    onClick,
    href,
    label,
    children,
}: {
    onClick?: () => void;
    href?: string;
    label: string;
    children: React.ReactNode;
}) {
    const classes =
        'rounded-full p-3 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-100 shadow-lg border border-zinc-200 dark:border-zinc-700 hover:-translate-y-0.5 transition-transform';

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
                aria-label={label}
                title={label}
            >
                {children}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} className={classes} aria-label={label} title={label}>
            {children}
        </button>
    );
}

export default function FloatingActions() {
    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
            <ThemeToggle />
            <FloatingButton onClick={handleBackToTop} label="Back to top">
                <ArrowUp className="w-5 h-5" />
            </FloatingButton>
            <FloatingButton href="https://github.com/NakanoSanku/card-flow" label="View source on GitHub">
                <Github className="w-5 h-5" />
            </FloatingButton>
        </div>
    );
}
