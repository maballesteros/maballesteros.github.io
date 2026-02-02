import dayjs from 'dayjs';

export interface EbookCatalogEntry {
  id: string;
  title: string;
  author?: string;
  cover?: string;
  description?: string;
  path: string;
}

export interface EbookIndexSection {
  title: string;
  path: string;
}

export interface EbookIndexChapter {
  id: string;
  title: string;
  sections: EbookIndexSection[];
}

export interface EbookIndex {
  title: string;
  basePath: string;
  chapters: EbookIndexChapter[];
}

export interface FlatEbookSection extends EbookIndexSection {
  chapterId: string;
  chapterTitle: string;
}

export const PUBLISHED_EBOOKS_CATALOG_URL = 'https://maballesteros.com/ebooks/ebooks.json';

let ebooksOrigin: string | null = null;

const catalogCache: { value: EbookCatalogEntry[] | null; ts: number } = { value: null, ts: 0 };
const indexCache = new Map<string, Promise<EbookIndex>>();
const markdownCache = new Map<string, Promise<string>>();

function resolveOriginFromUrl(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return 'https://maballesteros.com';
  }
}

function ensureAbsoluteUrl(url: string, fallbackOrigin: string): string {
  const raw = (url ?? '').trim();
  if (!raw) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${fallbackOrigin}${raw}`;
  return `${fallbackOrigin}/${raw}`;
}

export async function fetchEbookCatalog(): Promise<EbookCatalogEntry[]> {
  if (catalogCache.value && Date.now() - catalogCache.ts < 60_000) {
    return catalogCache.value;
  }

  const localUrl = `${window.location.origin}/ebooks/ebooks.json`;
  const tryFetch = async (url: string) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch catalog (${response.status})`);
    const json = (await response.json()) as unknown;
    if (!Array.isArray(json)) return [];
    return json
      .map((entry) => entry as Partial<EbookCatalogEntry>)
      .map((entry) => ({
        id: String(entry.id ?? '').trim(),
        title: String(entry.title ?? '').trim(),
        author: entry.author ? String(entry.author) : undefined,
        cover: entry.cover ? String(entry.cover) : undefined,
        description: entry.description ? String(entry.description) : undefined,
        path: String(entry.path ?? '').trim()
      }))
      .filter((entry) => entry.id && entry.title && entry.path);
  };

  let entries: EbookCatalogEntry[] = [];
  try {
    entries = await tryFetch(localUrl);
    ebooksOrigin = window.location.origin;
  } catch {
    entries = await tryFetch(PUBLISHED_EBOOKS_CATALOG_URL);
    ebooksOrigin = resolveOriginFromUrl(PUBLISHED_EBOOKS_CATALOG_URL);
  }

  catalogCache.value = entries;
  catalogCache.ts = Date.now();
  return entries;
}

export function getEbooksOrigin(): string {
  return ebooksOrigin ?? 'https://maballesteros.com';
}

export function resolveEbookIndexUrl(pathOrUrl: string): string {
  const origin = getEbooksOrigin();
  return ensureAbsoluteUrl(pathOrUrl, origin);
}

export async function fetchEbookIndex(indexUrl: string): Promise<EbookIndex> {
  const absolute = resolveEbookIndexUrl(indexUrl);
  if (!indexCache.has(absolute)) {
    indexCache.set(
      absolute,
      (async () => {
        const response = await fetch(absolute, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Failed to fetch ebook index (${response.status})`);
        const json = (await response.json()) as unknown;
        const raw = (json ?? {}) as Partial<EbookIndex>;
        const title = String(raw.title ?? '').trim() || 'Ebook';
        const basePath = String(raw.basePath ?? '').trim() || '/ebooks/';
        const chapters = Array.isArray(raw.chapters) ? raw.chapters : [];
        return {
          title,
          basePath,
          chapters: chapters
            .map((chapter) => chapter as Partial<EbookIndexChapter>)
            .map((chapter) => ({
              id: String(chapter.id ?? '').trim(),
              title: String(chapter.title ?? '').trim() || 'Chapter',
              sections: (Array.isArray(chapter.sections) ? chapter.sections : [])
                .map((section) => section as Partial<EbookIndexSection>)
                .map((section) => ({
                  title: String(section.title ?? '').trim() || 'Section',
                  path: String(section.path ?? '').trim()
                }))
                .filter((section) => Boolean(section.path))
            }))
            .filter((chapter) => chapter.id && chapter.sections.length > 0)
        };
      })()
    );
  }
  return indexCache.get(absolute)!;
}

export function flattenEbookSections(index: EbookIndex): FlatEbookSection[] {
  const out: FlatEbookSection[] = [];
  (index.chapters ?? []).forEach((chapter) => {
    (chapter.sections ?? []).forEach((section) => {
      out.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        title: section.title,
        path: section.path
      });
    });
  });
  return out;
}

const MONTHS_ES: Array<{ month: number; names: string[] }> = [
  { month: 1, names: ['enero', 'jan', 'january'] },
  { month: 2, names: ['febrero', 'feb', 'february'] },
  { month: 3, names: ['marzo', 'mar', 'march'] },
  { month: 4, names: ['abril', 'abr', 'april'] },
  { month: 5, names: ['mayo', 'may'] },
  { month: 6, names: ['junio', 'jun', 'june'] },
  { month: 7, names: ['julio', 'jul', 'july'] },
  { month: 8, names: ['agosto', 'ago', 'august'] },
  { month: 9, names: ['septiembre', 'setiembre', 'sep', 'september'] },
  { month: 10, names: ['octubre', 'oct', 'october'] },
  { month: 11, names: ['noviembre', 'nov', 'november'] },
  { month: 12, names: ['diciembre', 'dic', 'dec', 'december'] }
];

function normalizeMonthToken(token: string): string {
  return token
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveMonthFromToken(token: string): number | null {
  const normalized = normalizeMonthToken(token);
  const match = MONTHS_ES.find((entry) => entry.names.includes(normalized));
  return match ? match.month : null;
}

function parseDailyKeyFromTitle(title: string): string | null {
  const trimmed = title.trim();
  const match = /^(\d{2})\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)\b/.exec(trimmed);
  if (!match) return null;
  const day = Number(match[1]);
  if (!Number.isFinite(day) || day < 1 || day > 31) return null;
  const month = resolveMonthFromToken(match[2]);
  if (!month) return null;
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDailyKeyFromPath(path: string): string | null {
  const match = /(?:^|\/)(\d{2})_([a-zA-Z]+)\b/.exec(path);
  if (!match) return null;
  const day = Number(match[1]);
  if (!Number.isFinite(day) || day < 1 || day > 31) return null;
  const month = resolveMonthFromToken(match[2]);
  if (!month) return null;
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function resolveDailyFixedSection(index: EbookIndex, dateIso: string): FlatEbookSection | null {
  const date = dayjs(dateIso);
  if (!date.isValid()) return null;
  const key = date.format('MM-DD');
  if (key === '02-29') return null;

  const sections = flattenEbookSections(index);
  const byKey = new Map<string, FlatEbookSection>();

  sections.forEach((section) => {
    const fromTitle = parseDailyKeyFromTitle(section.title);
    const fromPath = parseDailyKeyFromPath(section.path);
    const dayKey = fromTitle ?? fromPath;
    if (!dayKey) return;
    if (!byKey.has(dayKey)) byKey.set(dayKey, section);
  });

  return byKey.get(key) ?? null;
}

export function resolveNextSequentialSection(
  sections: FlatEbookSection[],
  lastReadPath?: string
): { section: FlatEbookSection; index: number } | null {
  if (sections.length === 0) return null;
  const needle = (lastReadPath ?? '').trim();
  if (!needle) return { section: sections[0], index: 0 };
  const index = sections.findIndex((s) => s.path === needle);
  const nextIndex = index === -1 ? 0 : index + 1;
  if (nextIndex >= sections.length) return null;
  return { section: sections[nextIndex], index: nextIndex };
}

export function resolveMarkdownUrl(indexUrl: string, index: EbookIndex, sectionPath: string): string {
  const origin = resolveOriginFromUrl(resolveEbookIndexUrl(indexUrl));
  const basePath = (index.basePath ?? '/').startsWith('/') ? index.basePath : `/${index.basePath}`;
  const joined = `${basePath.replace(/\/?$/, '/')}${sectionPath.replace(/^\//, '')}`;
  return ensureAbsoluteUrl(joined, origin);
}

export async function fetchMarkdown(url: string): Promise<string> {
  const absolute = ensureAbsoluteUrl(url, resolveOriginFromUrl(PUBLISHED_EBOOKS_CATALOG_URL));
  if (!markdownCache.has(absolute)) {
    markdownCache.set(
      absolute,
      (async () => {
        const response = await fetch(absolute, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Failed to fetch markdown (${response.status})`);
        return await response.text();
      })()
    );
  }
  return markdownCache.get(absolute)!;
}

