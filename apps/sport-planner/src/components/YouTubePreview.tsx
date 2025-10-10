import clsx from 'clsx';

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('/')[0] ?? '';
    } else if (host.endsWith('youtube.com')) {
      if (parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v') ?? '';
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2] ?? '';
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2] ?? '';
      }
    } else if (host === 'youtube-nocookie.com' && parsed.pathname.startsWith('/embed/')) {
      videoId = parsed.pathname.split('/')[2] ?? '';
    }

    if (!videoId) return null;

    const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    const start = parsed.searchParams.get('start') ?? parsed.searchParams.get('t');
    if (start && /^\d+$/.test(start)) {
      embedUrl.searchParams.set('start', start);
    }
    return embedUrl.toString();
  } catch {
    return null;
  }
}

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
