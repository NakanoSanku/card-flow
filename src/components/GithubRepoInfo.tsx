import React, { useEffect, useState } from "react";
import githubMeta from "../data/github-meta.json";

export type GithubRepoData = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  html_url: string;
};

type GithubMetaMap = Record<string, GithubRepoData>;

interface GithubRepoInfoProps {
  url: string;
  onLoaded?: (repo: GithubRepoData) => void;
}

function getRepoKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const [owner, repo] = parts;
    return `${owner}/${repo}`;
  } catch {
    return null;
  }
}

export default function GithubRepoInfo({ url, onLoaded }: GithubRepoInfoProps) {
  const [repo, setRepo] = useState<GithubRepoData | null>(null);

  useEffect(() => {
    const key = getRepoKeyFromUrl(url);
    if (!key) return;

    const map = githubMeta as GithubMetaMap;
    const data = map[key];
    if (!data) return;

    setRepo(data);
    if (onLoaded) {
      onLoaded(data);
    }
  }, [url, onLoaded]);

  if (!repo) {
    return null;
  }

  return (
    <div className="mb-3 text-xs text-zinc-600 dark:text-zinc-300">
      {repo.description && (
        <p className="mb-2 text-[0.85rem] leading-snug">{repo.description}</p>
      )}
    </div>
  );
}
