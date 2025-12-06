import React, { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterBarProps {
    types: string[];
    selectedType: string | null;
    onSelectType: (type: string | null) => void;
}

export default function FilterBar({ types, selectedType, onSelectType }: FilterBarProps) {
    const getVisibleCount = () => {
        if (typeof window === 'undefined') return 6;
        if (window.innerWidth < 480) return 4;
        if (window.innerWidth < 768) return 6;
        return 8;
    };

    // Start with a fixed value so SSR and client match, then adjust on mount.
    const [visibleCount, setVisibleCount] = useState(6);
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        const handleResize = () => setVisibleCount(getVisibleCount());

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxStartIndex = Math.max(types.length - visibleCount, 0);
    const clampedStartIndex = Math.min(startIndex, maxStartIndex);
    const visibleTypes = useMemo(
        () => types.slice(clampedStartIndex, clampedStartIndex + visibleCount),
        [types, clampedStartIndex, visibleCount]
    );

    useEffect(() => {
        setStartIndex(prev => Math.min(prev, maxStartIndex));
    }, [maxStartIndex]);

    const canScrollLeft = clampedStartIndex > 0;
    const canScrollRight = clampedStartIndex + visibleCount < types.length;

    const handlePrev = () => {
        setStartIndex(prev => Math.max(prev - visibleCount, 0));
    };

    const handleNext = () => {
        setStartIndex(prev => Math.min(prev + visibleCount, maxStartIndex));
    };

    return (
        <div className="w-full mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                    onClick={() => onSelectType(null)}
                    className={clsx(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                        selectedType === null
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    )}
                >
                    All
                </button>
            </div>

            <div className="flex items-center gap-2 max-w-full w-full sm:w-auto sm:justify-center">
                <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!canScrollLeft}
                    className={clsx(
                        "p-1.5 rounded-full border text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm transition-colors",
                        !canScrollLeft
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    aria-label="Previous types"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex flex-wrap items-center gap-2 overflow-hidden max-w-full">
                    {visibleTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => onSelectType(type === selectedType ? null : type)}
                            className={clsx(
                                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                selectedType === type
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canScrollRight}
                    className={clsx(
                        "p-1.5 rounded-full border text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm transition-colors",
                        !canScrollRight
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    aria-label="Next types"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
