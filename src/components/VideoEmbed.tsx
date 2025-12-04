import React from 'react';

interface VideoEmbedProps {
    url: string;
}

export default function VideoEmbed({ url }: VideoEmbedProps) {
    const getEmbedUrl = (videoUrl: string): string | null => {
        try {
            const urlObj = new URL(videoUrl);

            // YouTube
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                let videoId = '';
                if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1);
                } else {
                    videoId = urlObj.searchParams.get('v') || '';
                }
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }

            // Bilibili
            if (urlObj.hostname.includes('bilibili.com')) {
                const match = videoUrl.match(/\/video\/(BV[a-zA-Z0-9]+)/);
                if (match) {
                    return `https://player.bilibili.com/player.html?bvid=${match[1]}&page=1&high_quality=1`;
                }
            }

            return null;
        } catch {
            return null;
        }
    };

    const embedUrl = getEmbedUrl(url);

    if (!embedUrl) {
        return (
            <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-zinc-500 text-sm">Invalid video URL</p>
            </div>
        );
    }

    return (
        <div className="w-full aspect-video">
            <iframe
                src={embedUrl}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video embed"
            />
        </div>
    );
}
