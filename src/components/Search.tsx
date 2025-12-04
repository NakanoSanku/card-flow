import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
    posts: any[];
    onSearch: (results: any[]) => void;
}

export default function Search({ posts, onSearch }: SearchProps) {
    const [query, setQuery] = useState('');

    const fuse = useMemo(() => {
        return new Fuse(posts, {
            keys: ['data.title', 'data.tags', 'body'],
            threshold: 0.3,
        });
    }, [posts]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (!value) {
            onSearch(posts);
            return;
        }

        const results = fuse.search(value).map(result => result.item);
        onSearch(results);
    };

    return (
        <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-zinc-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl leading-5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                placeholder="Search prompts, scripts, apps..."
                value={query}
                onChange={handleSearch}
            />
        </div>
    );
}
