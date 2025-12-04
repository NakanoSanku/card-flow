import React, { useEffect, useRef, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Fuse from 'fuse.js';

interface SearchProps {
    posts: any[];
    onSearch: (results: any[]) => void;
}

export default function Search({ posts, onSearch }: SearchProps) {
    const [query, setQuery] = useState('');
    const fuseRef = useRef<Fuse<any> | null>(null);

    useEffect(() => {
        const docs = posts.map((post) => {
            const plainBody =
                typeof post.body === 'string'
                    ? post.body.replace(/<[^>]+>/g, ' ')
                    : '';
            return {
                ...post,
                __text: `${post.data?.title ?? ''} ${post.data?.type ?? ''} ${plainBody}`,
            };
        });

        fuseRef.current = new Fuse(docs, {
            keys: ['__text'],
            threshold: 0.35,
            ignoreLocation: true,
        });
    }, [posts]);

    const runFallbackSearch = (value: string) => {
        const lower = value.toLowerCase();
        const fallback = posts.filter((post) => {
            const title = (post.data?.title ?? '').toLowerCase();
            const bodyText =
                typeof post.body === 'string'
                    ? post.body.replace(/<[^>]+>/g, ' ').toLowerCase()
                    : '';
            const type = (post.data?.type ?? '').toLowerCase();
            return (
                title.includes(lower) ||
                bodyText.includes(lower) ||
                type.includes(lower)
            );
        });
        onSearch(fallback);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (!value) {
            onSearch(posts);
            return;
        }

        const fuse = fuseRef.current;
        if (!fuse) {
            runFallbackSearch(value);
            return;
        }

        const results = fuse.search(value);
        onSearch(results.map((r) => r.item));
    };

    return (
        <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-zinc-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl leading-5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                placeholder="Search prompts, scripts, apps, websites..."
                value={query}
                onChange={handleSearch}
            />
        </div>
    );
}
