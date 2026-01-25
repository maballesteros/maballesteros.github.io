function parseTimeParam(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  if (/^\\d+(\\.\\d+)?$/.test(trimmed)) {
    return Math.floor(Number(trimmed));
  }

  if (/^(\\d+:)+\\d+$/.test(trimmed)) {
    const parts = trimmed.split(':').map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part))) {
      return null;
    }
    return parts.reduce((acc, part) => acc * 60 + part, 0);
  }

  const match = trimmed.match(/^(?:(\\d+)h)?(?:(\\d+)m)?(?:(\\d+)s?)?$/i);
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

