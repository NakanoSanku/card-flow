import React from 'react';

interface VideoEmbedProps {
    url: string;
}

export default function VideoEmbed({ url }: VideoEmbedProps) {
    const [isActive, setIsActive] = React.useState(false);

    const isImageUrl = (mediaUrl: string): boolean => {
        return /\.(gif|png|jpe?g|webp|avif)$/i.test(mediaUrl);
    };

    const isVideoFileUrl = (mediaUrl: string): boolean => {
        return /\.(mp4|webm|ogg)$/i.test(mediaUrl);
    };

    const isAudioFileUrl = (mediaUrl: string): boolean => {
        return /\.(mp3|m4a|aac|flac|wav|opus)$/i.test(mediaUrl);
    };

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

            // If it's a direct media file link, we handle it separately
            if (isImageUrl(videoUrl) || isVideoFileUrl(videoUrl) || isAudioFileUrl(videoUrl)) {
                return null;
            }

            return null;
        } catch {
            return null;
        }
    };

    const embedUrl = getEmbedUrl(url);

    if (!embedUrl) {
        // Direct image (including GIF) support
        if (isImageUrl(url)) {
            return (
                <div className="w-full rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-center">
                    <img
                        src={url}
                        alt="Embedded media"
                        className="w-full h-auto object-contain"
                    />
                </div>
            );
        }

        // Direct video file support
        if (isVideoFileUrl(url)) {
            return (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-center">
                    <video
                        src={url}
                        className="w-full h-full"
                        controls
                    />
                </div>
            );
        }

        // Direct audio file support
        if (isAudioFileUrl(url)) {
            return (
                <div className="w-full rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40 px-4 py-3 flex items-center">
                    <audio
                        src={url}
                        className="w-full"
                        controls
                    />
                </div>
            );
        }

        return (
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-center">
                <p className="text-zinc-500 text-sm">Invalid video URL</p>
            </div>
        );
    }

    if (!isActive) {
        return (
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-900/80 text-white px-4 py-2 text-xs md:text-sm font-medium hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-50 dark:focus:ring-offset-zinc-900"
                >
                    <span>点击播放视频</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40">
            <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
                allowFullScreen
                title="Video embed"
            />
        </div>
    );
}
