import { useMemo, useState, useEffect, type ChangeEvent } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Session } from '@/types';
import { ObjectiveChip } from '@/components/ObjectiveChip';
import { MarkdownContent } from '@/components/MarkdownContent';

function formatDate(dateIso: string) {
  return dayjs(dateIso).locale('es').format('dddd, D [de] MMMM');
}

export default function HomeView() {
  const sessions = useAppStore((state) => state.sessions);
  const works = useAppStore((state) => state.works);
  const objectives = useAppStore((state) => state.objectives);
  const toggleCompletion = useAppStore((state) => state.toggleSessionWorkCompletion);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) =>
        dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      ),
    [sessions]
  );

  const today = dayjs().format('YYYY-MM-DD');
  const nextSession = useMemo(
    () => sortedSessions.find((session) => session.date >= today) ?? sortedSessions[sortedSessions.length - 1],
    [sortedSessions, today]
  );

  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(nextSession?.id);

  useEffect(() => {
    if (!currentSessionId && nextSession) {
      setCurrentSessionId(nextSession.id);
    }
  }, [currentSessionId, nextSession]);

  const currentSession = useMemo<Session | undefined>(
    () => sortedSessions.find((session) => session.id === currentSessionId) ?? nextSession,
    [sortedSessions, currentSessionId, nextSession]
  );

  const objectiveMap = useMemo(() => {
    const map = new Map(objectives.map((objective) => [objective.id, objective]));
    return map;
  }, [objectives]);

  const workMap = useMemo(() => {
    const map = new Map(works.map((work) => [work.id, work]));
    return map;
  }, [works]);

  const sessionIndex = currentSession
    ? sortedSessions.findIndex((session) => session.id === currentSession.id)
    : -1;
  const hasPrev = sessionIndex > 0;
  const hasNext = sessionIndex >= 0 && sessionIndex < sortedSessions.length - 1;

  const goPrev = () => {
    if (hasPrev) {
      setCurrentSessionId(sortedSessions[sessionIndex - 1].id);
    }
  };

  const goNext = () => {
    if (hasNext) {
      setCurrentSessionId(sortedSessions[sessionIndex + 1].id);
    }
  };

  const handleDateSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    if (!date) return;
    const found = sortedSessions.find((session) => session.date === date);
    if (found) {
      setCurrentSessionId(found.id);
    }
  };

  const emptyState = sortedSessions.length === 0;

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Próxima sesión</h1>
            <p className="text-white/60">
              Revisa la sesión que toca ahora y marca los trabajos que completes en tiempo real.
            </p>
          </div>
          {sortedSessions.length > 0 && (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <label className="text-xs uppercase tracking-wide text-white/40">Ir a fecha</label>
              <input
                type="date"
                className="input-field w-auto"
                value={currentSession?.date ?? today}
                onChange={handleDateSelect}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className="btn-secondary disabled:opacity-40"
          >
            ← Anterior
          </button>
          <button type="button" onClick={goNext} disabled={!hasNext} className="btn-secondary disabled:opacity-40">
            Siguiente →
          </button>
          <Link to="/plan" className="btn-primary">
            Abrir planificador
          </Link>
          {currentSession && (
            <Link to={`/plan?session=${currentSession.id}`} className="btn-secondary">
              Editar sesión
            </Link>
          )}
        </div>
      </header>

      {emptyState && (
        <section className="glass-panel flex flex-col items-center justify-center gap-6 p-10 text-center">
          <div className="grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-sky-500/30 to-purple-500/30 shadow-lg shadow-sky-500/20">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <path
                d="M6 3v2M18 3v2M3.5 10h17M5 7h14a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Todavía no hay sesiones</h2>
            <p className="max-w-md text-balance text-white/60">
              Usa el planificador para crear tu primera sesión. Una vez guardada aparecerá aquí automáticamente.
            </p>
          </div>
          <Link to="/plan" className="btn-primary">
            Planificar sesión
          </Link>
        </section>
      )}

      {currentSession && !emptyState && (
        <section className="glass-panel space-y-6 p-6 sm:p-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Fecha</p>
              <h2 className="font-display text-3xl font-semibold text-white">{formatDate(currentSession.date)}</h2>
              <p className="mt-1 text-lg font-medium text-white/80">{currentSession.title}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <p className="font-semibold text-white">Duración estimada</p>
              <p>
                {currentSession.workItems
                  .map((item) => {
                    const work = workMap.get(item.workId);
                    const minutes = item.customDurationMinutes ?? work?.estimatedMinutes ?? 0;
                    return minutes;
                  })
                  .reduce((acc, val) => acc + val, 0)}{' '}
                minutos
              </p>
            </div>
          </header>

          {currentSession.description && (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <MarkdownContent content={currentSession.description} />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Trabajos</h3>
            <div className="space-y-4">
              {currentSession.workItems.map((item) => {
                const work = workMap.get(item.workId);
                const objective = work ? objectiveMap.get(work.objectiveId) : undefined;
                const isExpanded = expandedItems.has(item.id);

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow shadow-black/20"
                    style={
                      objective
                        ? {
                            background: `linear-gradient(120deg, ${objective.colorHex}1a, rgba(15,23,42,0.8))`
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-4">
                      <label className="mt-1 flex items-center gap-3 text-left">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded-full border-2 border-white/30 bg-transparent text-sky-400 transition focus:ring-sky-400"
                          checked={item.completed ?? false}
                          onChange={(event) =>
                            toggleCompletion(currentSession.id, item.id, event.target.checked)
                          }
                        />
                      </label>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-lg font-semibold text-white">
                              {work?.name ?? 'Trabajo eliminado'}
                            </p>
                            <p className="text-sm text-white/60">
                              {item.customDurationMinutes ?? work?.estimatedMinutes ?? 0} min
                            </p>
                          </div>
                          <ObjectiveChip objective={objective} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/50">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(item.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                          >
                            <span
                              className={clsx(
                                'transition-transform',
                                isExpanded ? 'rotate-90' : 'rotate-0'
                              )}
                            >
                              ▶
                            </span>
                            {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                          </button>
                          {work?.videoUrls?.length ? (
                            <span>{work.videoUrls.length} vídeo{work.videoUrls.length > 1 ? 's' : ''}</span>
                          ) : null}
                        </div>
                      </div>
                      <div
                        className={clsx(
                          'mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-semibold uppercase text-white/60',
                          item.completed ? 'bg-white/20 text-white' : ''
                        )}
                      >
                        {item.order + 1}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <MarkdownContent
                          content={item.customDescriptionMarkdown ?? work?.descriptionMarkdown}
                        />
                        {work?.videoUrls?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {work.videoUrls.map((url) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                              >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white shadow shadow-red-500/40">
                                  ▶
                                </span>
                                Ver vídeo
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
