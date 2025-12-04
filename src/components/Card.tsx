import React, { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Terminal,
  Image as ImageIcon,
  FileText,
  Github,
  Globe,
  ShoppingCart,
  CheckCircle2,
  Copy,
  Star,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import VideoEmbed from "./VideoEmbed";
import GithubRepoInfo, { type GithubRepoData } from "./GithubRepoInfo";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const colorClasses: Record<string, string> = {
  red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  zinc: "bg-zinc-100 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400",
};

interface CardProps {
  slug?: string;
  onHeightChange?: (slug: string, height: number) => void;
  title: string;
  date?: Date;
  type: "prompt" | "script" | "video" | "app" | "github" | "website";
  icon?: string;
  color?: string;
  image?: string;
  video?: string;
  url?: string;
  content: string; // HTML content from Markdown
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  wingetUnsupported?: boolean;
}

export default function Card({
  slug,
  onHeightChange,
  title,
  date,
  type,
  icon,
  color,
  image,
  video,
  url,
  content,
  selectable,
  selected,
  onSelectedChange,
  wingetUnsupported,
}: CardProps) {
  const [copied, setCopied] = useState(false);
  const [githubTitle, setGithubTitle] = useState<string | null>(null);
  const [githubRepo, setGithubRepo] = useState<GithubRepoData | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const getAutoIconUrl = (link?: string | null): string | null => {
    if (!link) return null;
    try {
      const urlObj = new URL(link);
      return `${urlObj.origin}/favicon.ico`;
    } catch {
      return null;
    }
  };

  const autoIconUrl = !icon && type !== "github" ? getAutoIconUrl(url) : null;

  useEffect(() => {
    if (!slug || !onHeightChange || typeof window === "undefined") return;
    const element = cardRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

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
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const codeBlock = tempDiv.querySelector("code");
    const text = codeBlock
      ? codeBlock.textContent ?? ""
      : tempDiv.textContent ?? "";

    if (!text) return;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = () => {
    if (icon && (icon.startsWith("http") || icon.startsWith("/"))) {
      return (
        <img
          src={icon}
          alt={title}
          className="w-6 h-6 rounded-sm object-cover"
        />
      );
    }
    if (autoIconUrl) {
      return (
        <img
          src={autoIconUrl}
          alt={title}
          className="w-6 h-6 rounded-sm object-cover"
        />
      );
    }
    if (icon) return <span className="text-xl">{icon}</span>;

    switch (type) {
      case "prompt":
        return <ImageIcon className="w-5 h-5" />;
      case "script":
        return <Terminal className="w-5 h-5" />;
      case "video":
        return <ImageIcon className="w-5 h-5" />;
      case "app":
        return <ExternalLink className="w-5 h-5" />;
      case "website":
        return <Globe className="w-5 h-5" />;
      case "github":
        return <Github className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const showExternalLink =
    (type === "app" || type === "github" || type === "website") && !!url;

  const copyLabel =
    type === "script"
      ? "Copy Script"
      : type === "prompt"
      ? "Copy Prompt"
      : "Copy Content";

  const handleToggleSelect = () => {
    if (!selectable || !onSelectedChange || wingetUnsupported) return;
    onSelectedChange(!selected);
  };

  const displayTitle =
    type === "github" && githubTitle ? githubTitle : title;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const blocks = Array.from(
      card.querySelectorAll<HTMLElement>("[data-code-block]"),
    );

    const cleanups: (() => void)[] = [];

    blocks.forEach((block) => {
      const body = block.querySelector<HTMLElement>("[data-code-body]");
      const fade = block.querySelector<HTMLElement>("[data-code-fade]");
      const toggleButton = block.querySelector<HTMLButtonElement>(
        "[data-action='toggle']",
      );
      const copyButton = block.querySelector<HTMLButtonElement>(
        "[data-action='copy']",
      );

      const collapsedMaxHeight = 16 * 16;

      const setExpanded = (expanded: boolean) => {
        const isOverflowing = body
          ? body.scrollHeight > collapsedMaxHeight
          : false;

        if (body) {
          body.style.maxHeight =
            expanded || !isOverflowing ? "none" : "16rem";
        }
        if (fade) {
          const shouldHideFade = expanded || !isOverflowing;
          fade.style.opacity = shouldHideFade ? "0" : "1";
          fade.style.visibility = shouldHideFade ? "hidden" : "visible";
        }
        if (toggleButton) {
          toggleButton.textContent = expanded ? "Collapse" : "Expand";
          toggleButton.style.display = isOverflowing ? "inline-flex" : "none";
        }
        block.setAttribute("data-expanded", expanded ? "true" : "false");
      };

      setExpanded(false);

      if (toggleButton) {
        const handleToggle = () => {
          const expanded = block.getAttribute("data-expanded") === "true";
          setExpanded(!expanded);
        };
        toggleButton.addEventListener("click", handleToggle);
        cleanups.push(() => toggleButton.removeEventListener("click", handleToggle));
      }

      if (copyButton) {
        const originalLabel = copyButton.textContent || "Copy";
        const handleCopyClick = () => {
          const code = block.querySelector("code");
          const text = code?.textContent || "";
          if (!text || !navigator.clipboard) return;

          navigator.clipboard.writeText(text);
          copyButton.textContent = "Copied!";
          setTimeout(() => {
            copyButton.textContent = originalLabel;
          }, 1500);
        };
        copyButton.addEventListener("click", handleCopyClick);
        cleanups.push(() =>
          copyButton.removeEventListener("click", handleCopyClick),
        );
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [content]);

  return (
    <div
      ref={cardRef}
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800",
                color && colorClasses[color],
              )}
            >
              <Icon />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {displayTitle}
              </h3>
              {date && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {new Date(date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1" />
        </div>
      </div>

      {image && (
        <div className="w-full px-4">
          <div className="w-full rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40">
            <img src={image} alt={title} className="w-full h-auto object-cover" />
          </div>
        </div>
      )}

      {video && (
        <div className="p-4 pb-2">
          <VideoEmbed url={video} />
        </div>
      )}

      <div className="p-4 pt-2 flex-1">
        {type === "github" && url && (
          <GithubRepoInfo
            url={url}
            onLoaded={(data) => {
              setGithubTitle(data.full_name);
              setGithubRepo(data);
            }}
          />
        )}

        <div
          className="prose prose-sm dark:prose-invert max-w-none mb-4 text-zinc-600 dark:text-zinc-300 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: content }}
        />

      </div>

      {type === "video" && (video || url) ? (
        <div className="flex items-center w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
          <a
            href={video || url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span>Watch Video</span>
          </a>
        </div>
      ) : type === "app" && showExternalLink ? (
        <div className="flex items-center w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
          {wingetUnsupported ? (
            <span className="text-xs md:text-sm text-zinc-400 dark:text-zinc-500">
              Not available on Winget
            </span>
          ) : (
            selectable &&
            onSelectedChange && (
              <button
                type="button"
                onClick={handleToggleSelect}
                className={cn(
                  "inline-flex items-center justify-center gap-1 px-0 py-0 text-xs md:text-sm font-medium bg-transparent transition-colors",
                  selected
                    ? "text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                    : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
                )}
              >
                {selected ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                <span>{selected ? "Added" : "Add to install list"}</span>
              </button>
            )
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span>Visit Website</span>
          </a>
        </div>
      ) : showExternalLink ? (
        type === "github" ? (
          <div className="flex items-center justify-between w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4 text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
              {githubRepo?.language && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80 dark:bg-emerald-400/80" />
                  <span>{githubRepo.language}</span>
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span className="tabular-nums">{githubRepo?.stargazers_count.toLocaleString()}</span>
                </span>
              </div>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              <span>View on GitHub</span>
            </a>
          </div>
        ) : (
          <div className="flex items-center w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span>Visit Website</span>
            </a>
          </div>
        )
      ) : (
        <div className="flex items-center w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "ml-auto inline-flex items-center gap-1 text-xs md:text-sm font-medium transition-colors",
              copied
                ? "text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                : "text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400",
            )}
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{copied ? "Copied!" : copyLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}
