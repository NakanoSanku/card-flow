import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Search from './Search';
import FilterBar from './FilterBar';
import Card from './Card';
import ThemeToggle from './ThemeToggle';
import { Copy, CheckCircle2 } from 'lucide-react';
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
  const [selectedAppSlugs, setSelectedAppSlugs] = useState<Set<string>>(
    () => new Set(),
  );
  const [copiedInstallCommand, setCopiedInstallCommand] = useState(false);

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
                  selected={selectedAppSlugs.has(post.slug as string)}
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
        <div className="fixed inset-x-0 bottom-4 flex justify-center pointer-events-none z-40">
          <section className="pointer-events-auto w-full max-w-3xl mx-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col p-4">
            <div className="flex items-start justify-between mb-3 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 mb-1 font-semibold">
                  Winget install helper
                </p>
                <h2 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedApps.length} app(s) selected, ready for one-shot Winget install
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Run the command below in PowerShell to install all selected apps with winget.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyInstallCommand}
                  className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full text-white transition-colors shadow-sm ${
                    copiedInstallCommand
                      ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600'
                      : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-600'
                  }`}
                >
                  {copiedInstallCommand ? (
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {copiedInstallCommand ? 'Copied Command' : 'Copy Command'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs px-3 py-1.5 rounded-full border border-zinc-300/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-white/60 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
              <div className="mb-2 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-md px-2 py-2">
              <p className="font-semibold mb-1">Selected apps</p>
              <div className="flex flex-wrap gap-2">
                {selectedApps.map((app) => (
                  <div
                    key={app.slug}
                    className="inline-flex items-center gap-2 max-w-full px-3 py-1 rounded-full border border-zinc-200 bg-white dark:bg-zinc-900/60 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 antialiased"
                  >
                    <span className="truncate max-w-[140px] font-normal">
                      {app.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAppSelect(app.slug, false)}
                      className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs md:text-sm font-mono rounded-lg overflow-hidden border border-zinc-800">
              <div className="bg-zinc-900 text-zinc-50 overflow-x-auto">
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
