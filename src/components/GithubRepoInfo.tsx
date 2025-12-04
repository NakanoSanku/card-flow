import React, { useEffect, useState } from 'react';

interface GithubRepoInfoProps {
    url: string;
}

interface GithubRepoData {
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    html_url: string;
}

export default function GithubRepoInfo({ url }: GithubRepoInfoProps) {
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
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`GitHub API error: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (!cancelled) {
                        setRepo(data);
                    }
                })
                .catch(err => {
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
    }, [url]);

    if (!repo || error) {
        return null;
    }

    return (
        <div className="mb-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between gap-2 mb-1">
                <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline truncate"
                >
                    {repo.full_name}
                </a>
                {repo.language && (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[0.65rem]">
                        {repo.language}
                    </span>
                )}
            </div>
            {repo.description && (
                <p className="mb-1 line-clamp-2 text-[0.7rem]">
                    {repo.description}
                </p>
            )}
            <div className="flex flex-wrap gap-2 text-[0.65rem]">
                <span>Stars: {repo.stargazers_count}</span>
                <span>Forks: {repo.forks_count}</span>
                <span>Issues: {repo.open_issues_count}</span>
            </div>
        </div>
    );
}
