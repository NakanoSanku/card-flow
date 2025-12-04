import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterBarProps {
    types: string[];
    selectedType: string | null;
    onSelectType: (type: string | null) => void;
}

export default function FilterBar({ types, selectedType, onSelectType }: FilterBarProps) {
    const VISIBLE_COUNT = 8;
    const [startIndex, setStartIndex] = useState(0);

    const maxStartIndex = Math.max(types.length - VISIBLE_COUNT, 0);
    const clampedStartIndex = Math.min(startIndex, maxStartIndex);
    const visibleTypes = types.slice(clampedStartIndex, clampedStartIndex + VISIBLE_COUNT);

    const canScrollLeft = clampedStartIndex > 0;
    const canScrollRight = clampedStartIndex + VISIBLE_COUNT < types.length;

    const handlePrev = () => {
        setStartIndex(prev => Math.max(prev - VISIBLE_COUNT, 0));
    };

    const handleNext = () => {
        setStartIndex(prev => Math.min(prev + VISIBLE_COUNT, maxStartIndex));
    };

    return (
        <div className="w-full mb-8 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
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

            <div className="flex items-center gap-2 max-w-full">
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

                <div className="flex items-center gap-2 overflow-hidden">
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
