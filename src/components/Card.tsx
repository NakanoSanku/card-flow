import React, { useEffect, useRef, useState } from 'react';
import { Copy, ExternalLink, Terminal, Image as ImageIcon, FileText, Github } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import VideoEmbed from './VideoEmbed';
import GithubRepoInfo from './GithubRepoInfo';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    slug?: string;
    onHeightChange?: (slug: string, height: number) => void;
    title: string;
    date?: Date;
    tags: string[];
    type: 'prompt' | 'script' | 'app' | 'github';
    icon?: string;
    color?: string;
    image?: string;
    video?: string;
    url?: string;
    content: string; // HTML content from Markdown
}

export default function Card({
    slug,
    onHeightChange,
    title,
    date,
    tags,
    type,
    icon,
    color,
    image,
    video,
    url,
    content
}: CardProps) {
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!slug || !onHeightChange || typeof window === 'undefined') return;
        const element = cardRef.current;
        if (!element || typeof ResizeObserver === 'undefined') return;

        const notify = () => {
            const rect = element.getBoundingClientRect();
            if (rect.height) {
                onHeightChange(slug, rect.height);
            }
        };

        notify();

        const observer = new ResizeObserver(() => {
            notify();
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [slug, onHeightChange]);

    const handleCopy = () => {
        // Extract text from code block or just raw content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const codeBlock = tempDiv.querySelector('code');
        const text = codeBlock ? codeBlock.innerText : tempDiv.innerText;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const Icon = () => {
        if (icon && (icon.startsWith('http') || icon.startsWith('/'))) {
            return <img src={icon} alt={title} className="w-6 h-6 rounded-sm object-cover" />;
        }
        if (icon) return <span className="text-xl">{icon}</span>;

        switch (type) {
            case 'prompt': return <ImageIcon className="w-5 h-5" />;
            case 'script': return <Terminal className="w-5 h-5" />;
            case 'app': return <ExternalLink className="w-5 h-5" />;
            case 'github': return <Github className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div
            ref={cardRef}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
        >
            <div className="p-4 pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800", color && `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`)}>
                            <Icon />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{title}</h3>
                            {date && <p className="text-xs text-zinc-500 mt-0.5">{new Date(date).toLocaleDateString()}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {image && (
                <div className="w-full">
                    <img src={image} alt={title} className="w-full h-auto object-cover" />
                </div>
            )}

            {video && (
                <div className="p-4 pb-2">
                    <VideoEmbed url={video} />
                </div>
            )}

            <div className="p-4 pt-2 flex-1">
                {type === 'github' && url && (
                    <GithubRepoInfo url={url} />
                )}
                <div
                    className="prose prose-sm dark:prose-invert max-w-none mb-4 text-zinc-600 dark:text-zinc-300 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {(type === 'app' || type === 'github') && url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    {type === 'github' ? 'View on GitHub →' : 'Visit Website →'}
                </a>
            ) : (
                <button
                    onClick={handleCopy}
                    className="block w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    {copied ? <span className="text-green-500 font-bold">Copied!</span> : "Copy Content"}
                </button>
            )}
        </div>
    );
}
