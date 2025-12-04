import React, { useState, useMemo, useCallback } from 'react';
import Search from './Search';
import FilterBar from './FilterBar';
import Card from './Card';
import ThemeToggle from './ThemeToggle';

interface MainProps {
    initialPosts: any[];
    allTags: string[];
}

export default function Main({ initialPosts, allTags }: MainProps) {
    const [filteredPosts, setFilteredPosts] = useState(initialPosts);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [columnCount, setColumnCount] = useState(1);
    const [itemHeights, setItemHeights] = useState<Record<string, number>>({});

    // Fisher-Yates shuffle algorithm
    const shuffleArray = (array: any[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    React.useEffect(() => {
        setFilteredPosts(shuffleArray(initialPosts));
    }, [initialPosts]);

    // Match Tailwind breakpoints roughly, for column count
    React.useEffect(() => {
        const updateColumns = () => {
            if (typeof window === 'undefined') return;
            const width = window.innerWidth;
            let count = 1;
            if (width >= 1280) {
                count = 4;
            } else if (width >= 1024) {
                count = 3;
            } else if (width >= 768) {
                count = 2;
            } else if (width >= 640) {
                count = 2;
            }
            setColumnCount(count);
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    const handleSearch = (results: any[]) => {
        setFilteredPosts(results);
    };

    const displayedPosts = useMemo(() => {
        let posts = filteredPosts;
        if (selectedTag) {
            posts = posts.filter(post => post.data.tags.includes(selectedTag));
        }
        return posts;
    }, [filteredPosts, selectedTag]);

    const handleItemHeightChange = useCallback((slug: string, height: number) => {
        setItemHeights(prev => {
            const current = prev[slug];
            if (current === height) return prev;
            return { ...prev, [slug]: height };
        });
    }, []);

    // Distribute posts into columns to balance total "height"
    const columns = useMemo(() => {
        const count = Math.max(columnCount, 1);
        const cols: any[][] = Array.from({ length: count }, () => []);
        const heights = new Array(count).fill(0);

        for (const post of displayedPosts) {
            const slug = post.slug as string;
            const measuredHeight = itemHeights[slug];
            const estimatedHeight = (() => {
                let h = 1;
                const body = post.body ?? '';
                const bodyLength = typeof body === 'string' ? body.length : 0;
                h += bodyLength / 600;
                if (post.data?.image) h += 3;
                if (post.data?.video) h += 4;
                return h;
            })();
            const weight = measuredHeight || estimatedHeight;

            let targetIndex = 0;
            let minHeight = heights[0];
            for (let i = 1; i < count; i++) {
                if (heights[i] < minHeight) {
                    minHeight = heights[i];
                    targetIndex = i;
                }
            }
            cols[targetIndex].push(post);
            heights[targetIndex] += weight;
        }

        return cols;
    }, [displayedPosts, columnCount, itemHeights]);

    return (
        <div className="container mx-auto px-2 py-12">
            <header className="text-center mb-12">
                <div className="flex justify-end mb-4 gap-2">
                    <ThemeToggle />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
                    CardFlow
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    A minimalist masonry card site for your prompts, scripts, and apps.
                    Markdown driven, no database required.
                </p>
            </header>

            <Search posts={initialPosts} onSearch={handleSearch} />

            <FilterBar
                tags={allTags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
            />

            <div className="flex gap-4">
                {columns.map((columnPosts, columnIndex) => (
                    <div key={columnIndex} className="flex-1 flex flex-col gap-4">
                        {columnPosts.map((post) => (
                            <Card
                                key={post.slug}
                                slug={post.slug}
                                onHeightChange={handleItemHeightChange}
                                title={post.data.title}
                                date={post.data.date}
                                tags={post.data.tags}
                                type={post.data.type}
                                icon={post.data.icon}
                                color={post.data.color}
                                image={post.data.image}
                                video={post.data.video}
                                url={post.data.url}
                                content={post.body}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {displayedPosts.length === 0 && (
                <div className="text-center text-zinc-500 py-12">
                    No cards found matching your criteria.
                </div>
            )}
        </div>
    );
}
