import React, { useEffect, useState } from 'react';
export interface GithubRepoData {
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
                <p className="text-[0.85rem] leading-snug text-zinc-600 dark:text-zinc-300">
                    {repo.description}
                </p>
            )}
        </div>
    );
}
