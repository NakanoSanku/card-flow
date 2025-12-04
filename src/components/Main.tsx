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
    const [selectedAppSlugs, setSelectedAppSlugs] = useState<Set<string>>(new Set());
    const [copiedInstallCommand, setCopiedInstallCommand] = useState(false);

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

    const handleToggleAppSelect = useCallback((slug: string, selected: boolean) => {
        setSelectedAppSlugs(prev => {
            const next = new Set(prev);
            if (selected) {
                next.add(slug);
            } else {
                next.delete(slug);
            }
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedAppSlugs(new Set());
    }, []);

    const selectedApps = useMemo(() => {
        const apps: { slug: string; title: string; wingetId: string }[] = [];

        for (const post of initialPosts) {
            if (post.data.type !== 'app') continue;
            if (!selectedAppSlugs.has(post.slug as string)) continue;

            const wingetId = (post.data as any).wingetId as string | undefined;
            if (!wingetId) continue;

            apps.push({
                slug: post.slug as string,
                title: post.data.title,
                wingetId,
            });
        }

        return apps;
    }, [initialPosts, selectedAppSlugs]);

    const installCommand = useMemo(() => {
        if (selectedApps.length === 0) return '';
        const quotedIds = selectedApps.map(app => `"${app.wingetId}"`).join(', ');
        return `$apps = @(${quotedIds}); foreach ($id in $apps) { winget install --id $id -e }`;
    }, [selectedApps]);

    const handleCopyInstallCommand = useCallback(() => {
        if (!installCommand) return;
        if (typeof navigator === 'undefined' || !navigator.clipboard) return;
        navigator.clipboard.writeText(installCommand);
        setCopiedInstallCommand(true);
        setTimeout(() => setCopiedInstallCommand(false), 2000);
    }, [installCommand]);

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
                        {columnPosts.map((post) => {
                            const wingetId = (post.data as any).wingetId as string | undefined;
                            const isApp = post.data.type === 'app';
                            const selectable = isApp && !!wingetId;

                            return (
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
                                    selectable={selectable}
                                    wingetUnsupported={isApp && !wingetId}
                                    selected={selectedAppSlugs.has(post.slug as string)}
                                    onSelectedChange={(selected) => handleToggleAppSelect(post.slug as string, selected)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {selectedApps.length > 0 && installCommand && (
                <div className="fixed inset-x-0 bottom-4 flex justify-center pointer-events-none z-40">
                    <section className="pointer-events-auto w-full max-w-3xl mx-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 shadow-lg backdrop-blur">
                        <div className="flex items-center justify-between mb-3 gap-2">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    已选 {selectedApps.length} 个应用 · 一键 Winget 安装
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    在 PowerShell 中执行下面这条命令即可依次安装所选应用。
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopyInstallCommand}
                                    className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                                >
                                    {copiedInstallCommand ? '已复制' : '复制命令'}
                                </button>
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="text-xs px-2 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    清空选择
                                </button>
                            </div>
                        </div>
                        <div className="mb-2 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            已选应用：{selectedApps.map(a => a.title).join('、')}
                        </div>
                        <div className="text-xs md:text-sm font-mono bg-zinc-900 text-zinc-50 rounded-lg p-3 overflow-x-auto">
                            {installCommand}
                        </div>
                    </section>
                </div>
            )}

            {displayedPosts.length === 0 && (
                <div className="text-center text-zinc-500 py-12">
                    No cards found matching your criteria.
                </div>
            )}
        </div>
    );
}
