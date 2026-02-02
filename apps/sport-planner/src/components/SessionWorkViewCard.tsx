import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ObjectiveChip } from './ObjectiveChip';
import { MarkdownContent } from './MarkdownContent';
import { YouTubePreview } from './YouTubePreview';
import type { Objective } from '@/types';

function normalizeTags(tags: string[] | undefined): string[] {
  return Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
    )
  );
}

export type SessionWorkStatusPill = {
  label: string;
  className: string;
};

export type SessionWorkViewCardProps = {
  title: string;
  titleExtra?: string;
  subtitle?: string;
  objective?: Objective;

  checked: boolean;
  onCheckedChange: (next: boolean) => void;

  orderNumber: number;
  startLabel?: string;
  durationMinutes?: number;

  tags?: string[];
  statusPill?: SessionWorkStatusPill;
  lastSeenLabel?: string;

  descriptionMarkdown?: string;
  notesMarkdown?: string;
  videoUrls?: string[];
  detailsContent?: ReactNode;

  isExpanded: boolean;
  onToggleExpanded: () => void;

  actions?: ReactNode;
  detailsActions?: ReactNode;
};

export function SessionWorkViewCard({
  title,
  titleExtra,
  subtitle,
  objective,
  checked,
  onCheckedChange,
  orderNumber,
  startLabel,
  durationMinutes,
  tags,
  statusPill,
  lastSeenLabel,
  descriptionMarkdown,
  notesMarkdown,
  videoUrls,
  detailsContent,
  isExpanded,
  onToggleExpanded,
  actions,
  detailsActions
}: SessionWorkViewCardProps) {
  const cleanTitleExtra = (titleExtra ?? '').trim();
  const hasTitleExtra = cleanTitleExtra.length > 0;
  const cleanSubtitle = (subtitle ?? '').trim();
  const cleanDescription = (descriptionMarkdown ?? '').trim();
  const cleanNotes = (notesMarkdown ?? '').trim();
  const cleanVideoUrls = (videoUrls ?? []).map((url) => url.trim()).filter(Boolean);
  const hasDetailsContent = Boolean(detailsContent);

  const normalizedTags = normalizeTags(tags);
  const hasTags = normalizedTags.length > 0;
  const hasMeta = Boolean(startLabel) || typeof durationMinutes === 'number' || Boolean(lastSeenLabel);
  const hasDetails = hasDetailsContent || cleanDescription.length > 0 || cleanNotes.length > 0 || cleanVideoUrls.length > 0;
  const hasDetailsActions = Boolean(detailsActions);

  const handleToggleExpanded = () => {
    if (!hasDetails) return;
    onToggleExpanded();
  };

  return (
    <article
      role={hasDetails ? 'button' : undefined}
      tabIndex={hasDetails ? 0 : undefined}
      onClick={() => handleToggleExpanded()}
      onKeyDown={(event) => {
        if (!hasDetails) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleToggleExpanded();
        }
      }}
      className={clsx(
        'flex flex-col gap-2.5 rounded-3xl border border-white/10 bg-white/5 p-2.5 shadow shadow-black/20 sm:gap-3 sm:p-4',
        hasDetails && 'cursor-pointer hover:border-white/20'
      )}
      style={
        objective
          ? {
              background: `linear-gradient(120deg, ${objective.colorHex}1a, rgba(15,23,42,0.8))`
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <label
          className="mt-1 flex items-center gap-3 text-left"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            className="h-5 w-5 rounded-full border-2 border-white/30 bg-transparent text-sky-400 transition focus:ring-sky-400"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
          />
        </label>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-white">
                  {title}
                  {hasTitleExtra ? <span className="ml-2 text-sky-300">· {cleanTitleExtra}</span> : null}
                </p>
                {statusPill ? (
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                      statusPill.className
                    )}
                  >
                    {statusPill.label}
                  </span>
                ) : null}
              </div>
              {cleanSubtitle ? <p className="text-sm text-white/70">{cleanSubtitle}</p> : null}
              {hasMeta ? (
                <p className="text-sm text-white/60">
                  {startLabel ? <span className="text-xs uppercase tracking-wide text-white/40">{startLabel}</span> : null}
                  {startLabel && typeof durationMinutes === 'number' ? <span className="mx-2 text-white/30">·</span> : null}
                  {typeof durationMinutes === 'number' ? <span>{durationMinutes} min</span> : null}
                  {(startLabel || typeof durationMinutes === 'number') && lastSeenLabel ? (
                    <span className="mx-2 text-white/30">·</span>
                  ) : null}
                  {lastSeenLabel ? <span className="text-xs text-white/50">Última vez: {lastSeenLabel}</span> : null}
                </p>
              ) : null}
            </div>
            <ObjectiveChip objective={objective} size="sm" />
          </div>

          {hasTags ? (
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-white/40">
              {normalizedTags.slice(0, 8).map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5">
                  {tag}
                </span>
              ))}
              {normalizedTags.length > 8 ? <span className="text-white/50">+{normalizedTags.length - 8}</span> : null}
            </div>
          ) : null}

          {hasDetails ? (
            <div className="flex items-center gap-3 text-xs text-white/50">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleExpanded();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
              >
                <span className={clsx('transition-transform', isExpanded ? 'rotate-90' : 'rotate-0')}>▶</span>
                {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
              {cleanVideoUrls.length > 0 ? (
                <span>
                  {cleanVideoUrls.length} vídeo{cleanVideoUrls.length > 1 ? 's' : ''}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className={clsx(
            'mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-semibold uppercase text-white/60',
            checked ? 'bg-white/20 text-white' : ''
          )}
        >
          {orderNumber}
        </div>
      </div>

      {actions ? (
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {actions}
        </div>
      ) : null}

      {hasDetails && isExpanded ? (
        <div
          className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3 sm:p-4"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {hasDetailsContent ? detailsContent : null}
          {cleanDescription ? <MarkdownContent content={cleanDescription} enableWorkLinks /> : null}
          {cleanNotes ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Notas</p>
              <MarkdownContent content={cleanNotes} enableWorkLinks />
            </div>
          ) : null}
          {cleanVideoUrls.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Vídeos</p>
              <div className="grid gap-4 lg:grid-cols-3">
                {cleanVideoUrls.map((url, index) => (
                  <div key={`${title}-video-${index}`} className="space-y-2">
                    <YouTubePreview url={url} title={`${title} vídeo ${index + 1}`} />
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                    >
                      Abrir en YouTube
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {hasDetailsActions ? (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">{detailsActions}</div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
