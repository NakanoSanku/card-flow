import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Search from './Search';
import FilterBar from './FilterBar';
import Card from './Card';
import ThemeToggle from './ThemeToggle';
import { Copy, CheckCircle2, ChevronDown } from 'lucide-react';
import hljs from 'highlight.js';

interface MainProps {
  initialPosts: any[];
  allTypes: string[];
}

export default function Main({ initialPosts, allTypes }: MainProps) {
  const [filteredPosts, setFilteredPosts] = useState(initialPosts);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [columnCount, setColumnCount] = useState(1);
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const [selectedAppSlugs, setSelectedAppSlugs] = useState<string[]>(() => []);
  const [copiedInstallCommand, setCopiedInstallCommand] = useState(false);
  const [showInstallCommand, setShowInstallCommand] = useState(false);

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    setFilteredPosts(shuffleArray(initialPosts));
  }, [initialPosts]);

  useEffect(() => {
    const updateColumns = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      let count = 1;

      if (width >= 1280) {
        count = 4;
      } else if (width >= 1024) {
        count = 3;
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
    if (selectedType) {
      posts = posts.filter((post) => post.data.type === selectedType);
    }
    return posts;
  }, [filteredPosts, selectedType]);

  const handleToggleAppSelect = useCallback((slug: string, selected: boolean) => {
    setSelectedAppSlugs((prev) => {
      if (selected) {
        const filtered = prev.filter((s) => s !== slug);
        return [slug, ...filtered];
      }
      return prev.filter((s) => s !== slug);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAppSlugs([]);
  }, []);

  const selectedApps = useMemo(() => {
    const apps: { slug: string; title: string; wingetId: string }[] = [];

    if (selectedAppSlugs.length === 0) return apps;

    for (const slug of selectedAppSlugs) {
      const post = initialPosts.find(
        (p) => p.slug === slug && p.data.type === 'app',
      );
      if (!post) continue;

      const wingetId = (post.data as any).wingetId as string | undefined;
      if (!wingetId) continue;

      apps.push({
        slug,
        title: post.data.title,
        wingetId,
      });
    }

    return apps;
  }, [initialPosts, selectedAppSlugs]);

  const installCommand = useMemo(() => {
    if (selectedApps.length === 0) return '';
    const quotedIds = selectedApps
      .map((app) => `"${app.wingetId}"`)
      .join(', ');
    return `$apps = @(${quotedIds}); foreach ($id in $apps) { winget install --id $id -e }`;
  }, [selectedApps]);

  const highlightedInstallCommand = useMemo(() => {
    if (!installCommand) return '';
    try {
      return hljs.highlight(installCommand, { language: 'powershell' }).value;
    } catch {
      return hljs.highlight(installCommand, { language: 'plaintext' }).value;
    }
  }, [installCommand]);

  const handleCopyInstallCommand = useCallback(() => {
    if (!installCommand) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(installCommand);
    setCopiedInstallCommand(true);
    setTimeout(() => setCopiedInstallCommand(false), 2000);
  }, [installCommand]);

  const handleCardHeightChange = useCallback((slug: string, height: number) => {
    if (!slug) return;
    setCardHeights((prev) => {
      if (prev[slug] === height) return prev;
      return { ...prev, [slug]: height };
    });
  }, []);

  const columns = useMemo(() => {
    const count = Math.max(columnCount, 1);
    const cols: any[][] = Array.from({ length: count }, () => []);
    const heights = Array.from({ length: count }, () => 0);

    displayedPosts.forEach((post) => {
      const slug = post.slug as string | undefined;
      const h = (slug && cardHeights[slug]) || 0;

      let targetIndex = 0;
      let minHeight = heights[0];
      for (let i = 1; i < count; i++) {
        if (heights[i] < minHeight) {
          minHeight = heights[i];
          targetIndex = i;
        }
      }

      cols[targetIndex].push(post);
      heights[targetIndex] += h;
    });

    return cols;
  }, [displayedPosts, columnCount, cardHeights]);

  const previewApps = selectedApps.slice(0, 2);
  const extraAppCount = selectedApps.length - previewApps.length;
  const remainingApps =
    extraAppCount > 0 ? selectedApps.slice(previewApps.length) : [];

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
        types={allTypes}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      <div className="flex gap-4">
        {columns.map((columnPosts, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 flex flex-col gap-4 min-w-0"
          >
            {columnPosts.map((post) => {
              const wingetId = (post.data as any).wingetId as
                | string
                | undefined;
              const isApp = post.data.type === 'app';
              const selectable = isApp && !!wingetId;

              return (
                <Card
                  key={post.slug}
                  slug={post.slug}
                  onHeightChange={handleCardHeightChange}
                  title={post.data.title}
                  date={post.data.date}
                  type={post.data.type}
                  icon={post.data.icon}
                  color={post.data.color}
                  image={post.data.image}
                  video={post.data.video}
                  url={post.data.url}
                  content={post.body}
                  selectable={selectable}
                  wingetUnsupported={isApp && !wingetId}
                  selected={selectedAppSlugs.includes(post.slug as string)}
                  onSelectedChange={(selected) =>
                    handleToggleAppSelect(post.slug as string, selected)
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      {selectedApps.length > 0 && installCommand && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center pointer-events-none z-40 px-3 sm:px-4">
          <section className="pointer-events-auto w-full max-w-3xl">
            <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-white/60 dark:border-zinc-700/70 backdrop-blur-xl shadow-lg shadow-zinc-900/20 px-3 py-2 md:px-4 md:py-2.5 flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex-1 min-w-0 flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  {previewApps.map((app) => (
                    <div
                      key={app.slug}
                      className="inline-flex items-center gap-1.5 max-w-[140px] px-2.5 py-1 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-white/60 dark:border-zinc-700/70 text-[11px] text-zinc-800 dark:text-zinc-100 flex-shrink-0"
                    >
                      <span className="truncate font-normal">
                        {app.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAppSelect(app.slug, false)}
                        className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                        aria-label={`Remove ${app.title}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {extraAppCount > 0 && (
                    <div className="relative inline-flex items-center group flex-shrink-0">
                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-300">
                        +{extraAppCount}
                      </div>
                      <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 opacity-0 scale-95 transform-gpu transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/95 text-[11px] text-zinc-50 shadow-lg min-w-[160px] max-w-[240px] px-3 py-2">
                          <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                            More apps
                          </p>
                          <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                            {remainingApps.map((app) => (
                              <li
                                key={app.slug}
                                className="truncate text-[11px] text-zinc-100"
                                title={app.title}
                              >
                                • {app.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyInstallCommand}
                  className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full text-white shadow-sm transition-all duration-150 active:scale-[0.97] bg-gradient-to-r ${
                    copiedInstallCommand
                      ? 'from-emerald-500 via-emerald-500 to-emerald-400 hover:from-emerald-500 hover:via-emerald-500 hover:to-emerald-400'
                      : 'from-sky-500 via-indigo-500 to-emerald-500 hover:from-sky-400 hover:via-indigo-400 hover:to-emerald-400'
                  }`}
                >
                  {copiedInstallCommand ? (
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span className="whitespace-nowrap">
                    {copiedInstallCommand ? 'Copied' : 'Copy command'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-300/60 dark:border-zinc-700/70 text-zinc-600 dark:text-zinc-300 bg-white/40 dark:bg-zinc-900/40 hover:bg-white/70 dark:hover:bg-zinc-900/70 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstallCommand((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors px-2 py-1 rounded-full bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm"
              >
                <span>{showInstallCommand ? 'Hide command' : 'Show command'}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showInstallCommand ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {showInstallCommand && (
              <div className="mt-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl text-xs md:text-sm font-mono overflow-hidden">
                <div className="text-zinc-50 overflow-x-auto">
                  <pre className="px-3 py-3 whitespace-pre-wrap break-words">
                    <code
                      className="hljs language-powershell"
                      dangerouslySetInnerHTML={{
                        __html: highlightedInstallCommand || installCommand,
                      }}
                    />
                  </pre>
                </div>
              </div>
            )}
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
