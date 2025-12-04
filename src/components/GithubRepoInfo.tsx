import React, { useEffect, useState } from 'react';
import { Star, GitFork, CircleDot } from 'lucide-react';

interface GithubRepoData {
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    html_url: string;
}

interface GithubRepoInfoProps {
    url: string;
    onLoaded?: (repo: GithubRepoData) => void;
}

export default function GithubRepoInfo({ url, onLoaded }: GithubRepoInfoProps) {
    const [repo, setRepo] = useState<GithubRepoData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const parsed = new URL(url);
            if (!parsed.hostname.includes('github.com')) return;

            const parts = parsed.pathname.split('/').filter(Boolean);
            if (parts.length < 2) return;

            const [owner, repoName] = parts;
            const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;

            let cancelled = false;

            fetch(apiUrl)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`GitHub API error: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data: GithubRepoData) => {
                    if (!cancelled) {
                        setRepo(data);
                        if (onLoaded) {
                            onLoaded(data);
                        }
                    }
                })
                .catch((err: Error) => {
                    if (!cancelled) {
                        setError(err.message);
                    }
                });

            return () => {
                cancelled = true;
            };
        } catch {
            // Invalid URL, ignore
        }
    }, [url, onLoaded]);

    if (!repo || error) {
        return null;
    }

    return (
        <div className="mb-3 text-xs text-zinc-600 dark:text-zinc-300">
            {repo.description && (
                <p className="mb-2 text-[0.75rem] leading-snug line-clamp-3">
                    {repo.description}
                </p>
            )}
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem]">
                {repo.language && (
                    <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500/80 dark:bg-emerald-400/80" />
                        <span>{repo.language}</span>
                    </span>
                )}
                <div className="ml-auto flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        <span className="tabular-nums">
                            {repo.stargazers_count.toLocaleString()}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="tabular-nums">
                            {repo.forks_count.toLocaleString()}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <CircleDot className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="tabular-nums">
                            {repo.open_issues_count.toLocaleString()}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}
