import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { MarkdownContent } from '@/components/MarkdownContent';
import { useAppStore } from '@/store/appStore';
import type { SessionWork, Work } from '@/types';
import {
  fetchEbookIndex,
  fetchMarkdown,
  flattenEbookSections,
  resolveDailyFixedSection,
  resolveMarkdownUrl,
  resolveNextSequentialSection
} from '@/services/ebookService';

function markdownToPlainText(markdown: string): string {
  let text = String(markdown ?? '');
  if (!text.trim()) return '';

  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/^---\n[\s\S]*?\n---\n/m, '');

  text = text.replace(/```([\s\S]*?)```/g, (_match, code) => String(code ?? '').trim());
  text = text.replace(/`([^`]+)`/g, '$1');

  text = text.replace(/^>\s?/gm, '');
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  text = text.replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, '- ');

  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const a = String(alt ?? '').trim();
    const u = String(url ?? '').trim();
    if (a && u) return `${a} (${u})`;
    return a || u;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const l = String(label ?? '').trim();
    const u = String(url ?? '').trim();
    if (l && u) return `${l} (${u})`;
    return l || u;
  });

  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  text = text.replace(/~~(.*?)~~/g, '$1');

  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

async function copyToClipboard(text: string): Promise<boolean> {
  const value = String(text ?? '');
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = value;
      el.setAttribute('readonly', 'true');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function mergeReadPaths(existing: string[] | undefined, nextPath: string): string[] {
  const cleaned = (existing ?? []).map((p) => String(p ?? '').trim()).filter(Boolean);
  const candidate = String(nextPath ?? '').trim();
  if (!candidate) return cleaned;
  if (cleaned.includes(candidate)) return cleaned;
  return [...cleaned, candidate];
}

function lastNonEmpty(values: string[] | undefined): string | undefined {
  const cleaned = (values ?? []).map((value) => String(value ?? '').trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned[cleaned.length - 1] : undefined;
}

export function EbookWorkDetails({
  work,
  sessionId,
  sessionDate,
  planId,
  sessionItem
}: {
  work: Work;
  sessionId: string;
  sessionDate: string;
  planId: string;
  sessionItem: SessionWork;
}) {
  const ebookRef = work.ebookRef;
  const sessions = useAppStore((state) => state.sessions);
  const updateSessionWorkDetails = useAppStore((state) => state.updateSessionWorkDetails);

  const [indexError, setIndexError] = useState<string | null>(null);
  const [markdownError, setMarkdownError] = useState<string | null>(null);
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexData, setIndexData] = useState<Awaited<ReturnType<typeof fetchEbookIndex>> | null>(null);

  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied' | 'error'>('idle');

  const sections = useMemo(() => (indexData ? flattenEbookSections(indexData) : []), [indexData]);

  const lastReadPath = useMemo(() => {
    const own = lastNonEmpty(sessionItem.readPaths);
    if (own) return own;
    const prevSessions = sessions
      .filter((session) => session.planId === planId && dayjs(session.date).isBefore(dayjs(sessionDate), 'day'))
      .slice()
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    for (const session of prevSessions) {
      const item = (session.workItems ?? []).find((entry) => entry.workId === work.id);
      if (!item) continue;
      if (item.result !== 'ok' && item.completed !== true) continue;
      const path = lastNonEmpty(item.readPaths);
      if (path) return path;
    }
    return undefined;
  }, [planId, sessionDate, sessionItem.readPaths, sessions, work.id]);

  useEffect(() => {
    if (!ebookRef?.indexUrl) return;
    let cancelled = false;
    setIndexLoading(true);
    setIndexError(null);
    void (async () => {
      try {
        const index = await fetchEbookIndex(ebookRef.indexUrl);
        if (cancelled) return;
        setIndexData(index);
      } catch (error) {
        if (cancelled) return;
        setIndexError(error instanceof Error ? error.message : 'Error loading ebook index');
        setIndexData(null);
      } finally {
        if (!cancelled) setIndexLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ebookRef?.indexUrl]);

  const resolved = useMemo(() => {
    if (!ebookRef || !indexData) return null;

    const pinned = sessionItem.contentRef;
    if (
      pinned &&
      pinned.kind === 'ebook_section' &&
      pinned.ebookId === ebookRef.ebookId &&
      pinned.indexUrl === ebookRef.indexUrl
    ) {
      const foundIndex = sections.findIndex((section) => section.path === pinned.sectionPath);
      if (foundIndex >= 0) {
        return { section: sections[foundIndex], index: foundIndex };
      }
    }

    if (ebookRef.mode === 'daily_fixed') {
      const daily = resolveDailyFixedSection(indexData, sessionDate);
      if (!daily) return null;
      const dailyIndex = sections.findIndex((section) => section.path === daily.path);
      return { section: daily, index: dailyIndex >= 0 ? dailyIndex : 0 };
    }

    return resolveNextSequentialSection(sections, lastReadPath);
  }, [ebookRef, indexData, lastReadPath, sections, sessionDate, sessionItem.contentRef]);

  useEffect(() => {
    if (!ebookRef || !resolved) return;
    const current = sessionItem.contentRef;
    const needsUpdate =
      !current ||
      current.kind !== 'ebook_section' ||
      current.ebookId !== ebookRef.ebookId ||
      current.indexUrl !== ebookRef.indexUrl ||
      current.sectionPath !== resolved.section.path;
    if (!needsUpdate) return;
    updateSessionWorkDetails(sessionId, sessionItem.id, {
      contentRef: {
        kind: 'ebook_section',
        ebookId: ebookRef.ebookId,
        indexUrl: ebookRef.indexUrl,
        sectionPath: resolved.section.path,
        sectionTitle: resolved.section.title,
        chapterTitle: resolved.section.chapterTitle
      }
    });
  }, [ebookRef, resolved, sessionId, sessionItem.id, sessionItem.contentRef, updateSessionWorkDetails]);

  useEffect(() => {
    if (!resolved) return;
    if (cursorIndex === null) {
      setCursorIndex(resolved.index);
    }
  }, [cursorIndex, resolved]);

  useEffect(() => {
    if (cursorIndex === null || !indexData || !ebookRef) return;
    const section = sections[cursorIndex];
    if (!section) return;

    let cancelled = false;
    setMarkdownLoading(true);
    setMarkdownError(null);
    void (async () => {
      try {
        const url = resolveMarkdownUrl(ebookRef.indexUrl, indexData, section.path);
        const content = await fetchMarkdown(url);
        if (cancelled) return;
        setMarkdown(content);
      } catch (error) {
        if (cancelled) return;
        setMarkdown('');
        setMarkdownError(error instanceof Error ? error.message : 'Error loading content');
      } finally {
        if (!cancelled) setMarkdownLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cursorIndex, ebookRef, indexData, sections]);

  const canAdvance = ebookRef?.mode === 'sequential' && cursorIndex !== null && cursorIndex + 1 < sections.length;

  const currentSection = cursorIndex !== null ? sections[cursorIndex] : null;
  const progressLabel =
    ebookRef?.mode === 'sequential' && cursorIndex !== null
      ? `${cursorIndex + 1}/${sections.length}`
      : undefined;

  const handleAdvance = () => {
    if (!canAdvance) return;
    setCursorIndex((prev) => (prev === null ? prev : Math.min(prev + 1, sections.length - 1)));
  };

  const handleCopy = async () => {
    if (!ebookRef || !currentSection || !indexData) return;
    const url = resolveMarkdownUrl(ebookRef.indexUrl, indexData, currentSection.path);
    const titleLine = `${indexData.title} — ${currentSection.title}`;
    const chapterLine = currentSection.chapterTitle ? `(${currentSection.chapterTitle})` : '';
    const plain = markdownToPlainText(markdown);
    const payload = [titleLine, chapterLine, '', plain, '', url].filter((line) => String(line ?? '').trim().length > 0).join('\n');
    const ok = await copyToClipboard(payload);
    setCopyFeedback(ok ? 'copied' : 'error');
    window.setTimeout(() => setCopyFeedback('idle'), ok ? 1500 : 2500);
  };

  const handleMarkRead = () => {
    if (!ebookRef || !currentSection) return;
    updateSessionWorkDetails(sessionId, sessionItem.id, {
      completed: true,
      result: sessionItem.result ?? 'ok',
      contentRef: {
        kind: 'ebook_section',
        ebookId: ebookRef.ebookId,
        indexUrl: ebookRef.indexUrl,
        sectionPath: currentSection.path,
        sectionTitle: currentSection.title,
        chapterTitle: currentSection.chapterTitle
      },
      readPaths: mergeReadPaths(sessionItem.readPaths, currentSection.path)
    });
    if (ebookRef.mode === 'sequential') {
      handleAdvance();
    }
  };

  if (!ebookRef) {
    return (
      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-200">
        Este work es `nodeType=ebook` pero no tiene `ebookRef` configurado.
      </div>
    );
  }

  if (indexLoading) {
    return <p className="text-sm text-white/60">Cargando ebook…</p>;
  }

  if (indexError) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
        Error cargando ebook: {indexError}
      </div>
    );
  }

  if (!resolved || !currentSection || !indexData) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
        No hay entrada disponible para esta fecha.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">{indexData.title}</p>
          <p className="text-sm font-semibold text-white">
            {currentSection.title}
            {progressLabel ? <span className="ml-2 text-xs font-semibold text-white/50">({progressLabel})</span> : null}
          </p>
          <p className="text-xs text-white/50">{currentSection.chapterTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={clsx(
              'btn-secondary',
              copyFeedback === 'copied' && 'border-emerald-400/30 text-emerald-100',
              copyFeedback === 'error' && 'border-rose-400/30 text-rose-100'
            )}
            onClick={handleCopy}
          >
            {copyFeedback === 'copied' ? 'Copiado' : copyFeedback === 'error' ? 'Error al copiar' : 'Copiar'}
          </button>
          {ebookRef.mode === 'sequential' ? (
            <button type="button" className="btn-secondary" onClick={handleAdvance} disabled={!canAdvance}>
              Ver más
            </button>
          ) : null}
          <button type="button" className={clsx('btn-secondary', 'border-emerald-400/30')} onClick={handleMarkRead}>
            Marcar leído
          </button>
        </div>
      </div>

      {markdownLoading ? <p className="text-sm text-white/60">Cargando contenido…</p> : null}
      {markdownError ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
          Error cargando contenido: {markdownError}
        </div>
      ) : null}

      {markdown ? <MarkdownContent content={markdown} enableWorkLinks /> : null}
    </div>
  );
}
