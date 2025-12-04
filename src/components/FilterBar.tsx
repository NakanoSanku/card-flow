import React from 'react';
import { clsx } from 'clsx';

interface FilterBarProps {
    tags: string[];
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

export default function FilterBar({ tags, selectedTag, onSelectTag }: FilterBarProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
                onClick={() => onSelectTag(null)}
                className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    selectedTag === null
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                )}
            >
                All
            </button>
            {tags.map(tag => (
                <button
                    key={tag}
                    onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
                    className={clsx(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        selectedTag === tag
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    )}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}
