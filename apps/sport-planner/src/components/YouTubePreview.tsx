import clsx from 'clsx';
import { getYouTubeEmbedUrl } from '@/utils/youtube';

interface YouTubePreviewProps {
  url: string;
  title: string;
  maxWidth?: number;
  className?: string;
}

export function YouTubePreview({ url, title, maxWidth = 300, className }: YouTubePreviewProps) {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(trimmed);

  if (!embedUrl) {
    return (
      <div className={clsx('flex w-full justify-center', className)}>
        <a
          href={trimmed}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-400 hover:text-white"
        >
          URL no reconocida, abrir enlace
        </a>
      </div>
    );
  }

  return (
    <div className={clsx('flex w-full justify-center', className)}>
      <div
        className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-inner shadow-black/50"
        style={{ maxWidth }}
      >
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="block w-full"
          style={{ aspectRatio: '16 / 9' }}
        />
      </div>
    </div>
  );
}
