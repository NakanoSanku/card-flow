import React, { useState, useMemo } from 'react';
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

            <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {displayedPosts.map((post) => (
                    <Card
                        key={post.slug}
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

            {displayedPosts.length === 0 && (
                <div className="text-center text-zinc-500 py-12">
                    No cards found matching your criteria.
                </div>
            )}
        </div>
    );
}
