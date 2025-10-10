import clsx from 'clsx';

function parseTimeParam(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.floor(Number(trimmed));
  }

  if (/^(\d+:)+\d+$/.test(trimmed)) {
    const parts = trimmed.split(':').map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part))) {
      return null;
    }
    return parts.reduce((acc, part) => acc * 60 + part, 0);
  }

  const match = trimmed.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  if (match) {
    const hours = match[1] ? Number(match[1]) : 0;
    const minutes = match[2] ? Number(match[2]) : 0;
    const seconds = match[3] ? Number(match[3]) : 0;
    if (hours || minutes || seconds) {
      return hours * 3600 + minutes * 60 + seconds;
    }
  }

  return null;
}

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
    const startSeconds = parseTimeParam(parsed.searchParams.get('start') ?? parsed.searchParams.get('t'));
    if (startSeconds !== null) {
      embedUrl.searchParams.set('start', String(startSeconds));
    }

    const endSeconds = parseTimeParam(parsed.searchParams.get('end'));
    if (endSeconds !== null) {
      embedUrl.searchParams.set('end', String(endSeconds));
    }

    const playlist = parsed.searchParams.get('list');
    if (playlist) {
      embedUrl.searchParams.set('list', playlist);
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
