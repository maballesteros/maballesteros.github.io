import { useMemo, useState, useEffect, type ChangeEvent } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Session, AttendanceStatus, SessionAttendance, ActualAttendanceStatus } from '@/types';
import { ObjectiveChip } from '@/components/ObjectiveChip';
import { MarkdownContent } from '@/components/MarkdownContent';
import { YouTubePreview } from '@/components/YouTubePreview';
import { formatMinutesToTime, parseTimeToMinutes } from '@/utils/time';

const ATTENDANCE_ORDER: AttendanceStatus[] = ['present', 'absent', 'pending'];

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  absent: 'Ausente',
  pending: 'Pendiente'
};

const FORECAST_BADGE_CLASSES: Record<AttendanceStatus, string> = {
  present: 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  absent: 'border border-rose-500/40 bg-rose-500/10 text-rose-100',
  pending: 'border border-white/20 bg-white/10 text-white/70'
};

const ACTUAL_SUMMARY_ORDER: ActualAttendanceStatus[] = ['present', 'absent'];

const ACTUAL_SUMMARY_LABELS: Record<ActualAttendanceStatus, string> = {
  present: 'Han venido',
  absent: 'Faltan'
};

const ACTUAL_SUMMARY_BADGE_CLASSES: Record<ActualAttendanceStatus, string> = {
  present: 'border border-emerald-500/60 bg-emerald-500/15 text-emerald-100 shadow shadow-emerald-500/15',
  absent: 'border border-rose-500/60 bg-rose-500/10 text-rose-100 shadow shadow-rose-500/10'
};

const ACTUAL_TOGGLE_BASE_CLASSES =
  'group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/30 sm:text-sm';

const ACTUAL_TOGGLE_PRESENT_CLASSES =
  'border-emerald-500/60 bg-emerald-500/15 text-emerald-100 shadow-sm shadow-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-500/20';

const ACTUAL_TOGGLE_ABSENT_CLASSES =
  'border-white/15 bg-white/5 text-white/60 hover:border-white/40 hover:text-white';

const ACTUAL_TOGGLE_INDICATOR_CLASSES =
  'flex h-6 w-6 items-center justify-center rounded-full border text-[12px] transition sm:h-7 sm:w-7';

const ACTUAL_TOGGLE_INDICATOR_PRESENT =
  'border-emerald-400 bg-emerald-400/20 text-emerald-100 shadow shadow-emerald-500/25';

const ACTUAL_TOGGLE_INDICATOR_ABSENT =
  'border-white/25 text-white/40 group-hover:border-white/50 group-hover:text-white/80';

const EMPTY_ATTENDANCE: SessionAttendance[] = [];

function formatDate(dateIso: string) {
  return dayjs(dateIso).locale('es').format('dddd, D [de] MMMM');
}

export default function HomeView() {
  const sessions = useAppStore((state) => state.sessions);
  const works = useAppStore((state) => state.works);
  const objectives = useAppStore((state) => state.objectives);
  const assistants = useAppStore((state) => state.assistants);
  const setAttendanceActualStatus = useAppStore((state) => state.setAttendanceActualStatus);
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

  const sessionStartMinutes = useMemo(
    () => parseTimeToMinutes(currentSession?.startTime, '18:30'),
    [currentSession?.startTime]
  );

  const workSchedule = useMemo(() => {
    if (!currentSession) {
      return new Map<string, { startLabel: string; duration: number }>();
    }
    let accumulated = 0;
    const schedule = new Map<string, { startLabel: string; duration: number }>();
    currentSession.workItems.forEach((sessionWork) => {
      const work = workMap.get(sessionWork.workId);
      const duration = sessionWork.customDurationMinutes ?? work?.estimatedMinutes ?? 0;
      const startLabel = formatMinutesToTime(sessionStartMinutes + accumulated);
      schedule.set(sessionWork.id, { startLabel, duration });
      accumulated += duration;
    });
    return schedule;
  }, [currentSession, workMap, sessionStartMinutes]);

  const activeAssistants = useMemo(
    () =>
      assistants
        .filter((assistant) => assistant.active)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })),
    [assistants]
  );

  const attendanceEntries = currentSession?.attendance ?? EMPTY_ATTENDANCE;
  const attendanceInfo = useMemo(() => {
    const map = new Map<string, SessionAttendance>();
    attendanceEntries.forEach((entry) => {
      map.set(entry.assistantId, entry);
    });
    let presentCount = 0;
    activeAssistants.forEach((assistant) => {
      if (map.get(assistant.id)?.actualStatus === 'present') {
        presentCount += 1;
      }
    });
    const summary: Record<ActualAttendanceStatus, number> = {
      present: presentCount,
      absent: Math.max(activeAssistants.length - presentCount, 0)
    };
    return { map, summary };
  }, [attendanceEntries, activeAssistants]);

  const attendanceMap = attendanceInfo.map;
  const actualSummary = attendanceInfo.summary;

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

  const handleActualStatusChange = (assistantId: string, status: ActualAttendanceStatus) => {
    if (!currentSession) return;
    setAttendanceActualStatus(currentSession.id, assistantId, status);
  };

  return (
    <div className="space-y-3 sm:space-y-6">

      {emptyState && (
        <section className="glass-panel flex flex-col items-center justify-center gap-5 p-4 text-center sm:gap-6 sm:p-10">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-sky-500/30 to-purple-500/30 shadow-lg shadow-sky-500/20 sm:h-32 sm:w-32">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" className="text-white/80 sm:h-14 sm:w-14">
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
        <section className="glass-panel space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
          <header className="space-y-3 sm:flex sm:items-start sm:justify-between sm:gap-6 sm:space-y-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                <span className="sm:hidden">Sesión</span>
                <span className="hidden sm:inline">Fecha</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{formatDate(currentSession.date)}</h2>
              <p className="text-sm font-medium text-white/80 sm:text-lg">{currentSession.title}</p>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 sm:w-auto">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-white">Duración estimada</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  {(currentSession.workItems
                    .map((item) => {
                      const work = workMap.get(item.workId);
                      const minutes = item.customDurationMinutes ?? work?.estimatedMinutes ?? 0;
                      return minutes;
                    })
                    .reduce((acc, val) => acc + val, 0)) || 0}{' '}
                  min
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <label className="text-[11px] uppercase tracking-wide text-white/40 sm:text-xs">Ir a fecha</label>
                <input
                  type="date"
                  className="input-field w-full sm:w-auto"
                  value={currentSession?.date ?? today}
                  onChange={handleDateSelect}
                />
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={!hasPrev}
                className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold disabled:opacity-40 sm:h-10 sm:text-sm"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!hasNext}
                className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold disabled:opacity-40 sm:h-10 sm:text-sm"
              >
                Siguiente →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/plan" className="btn-primary h-9 rounded-2xl px-4 text-xs font-semibold sm:h-10 sm:text-sm">
                Abrir planificador
              </Link>
              <Link
                to={`/plan?session=${currentSession.id}`}
                className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold sm:h-10 sm:text-sm"
              >
                Editar sesión
              </Link>
            </div>
          </div>

          {currentSession.description && (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-3 sm:p-4">
              <MarkdownContent content={currentSession.description} />
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Trabajos</h3>
            <div className="space-y-3 sm:space-y-4">
              {currentSession.workItems.map((item) => {
                const work = workMap.get(item.workId);
                const objective = work ? objectiveMap.get(work.objectiveId) : undefined;
                const isExpanded = expandedItems.has(item.id);
                const scheduleEntry = workSchedule.get(item.id);
                const startLabel = scheduleEntry?.startLabel ?? formatMinutesToTime(sessionStartMinutes);
                const durationMinutes = scheduleEntry?.duration ?? (item.customDurationMinutes ?? work?.estimatedMinutes ?? 0);
                const focusLabel = (item.focusLabel ?? '').trim();
                const hasFocus = focusLabel.length > 0;
                const descriptionContent = item.customDescriptionMarkdown ?? work?.descriptionMarkdown ?? '';
                const hasDescription = descriptionContent.trim().length > 0;
                const videoUrls = (work?.videoUrls ?? []).map((url) => url.trim()).filter(Boolean);
                const hasVideos = videoUrls.length > 0;
                const showDetailsToggle = hasDescription || hasVideos;
                const workSubtitle = (work?.subtitle ?? '').trim();

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-2.5 rounded-3xl border border-white/10 bg-white/5 p-2.5 shadow shadow-black/20 sm:gap-3 sm:p-4"
                    style={
                      objective
                        ? {
                            background: `linear-gradient(120deg, ${objective.colorHex}1a, rgba(15,23,42,0.8))`
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3">
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
                              {hasFocus ? (
                                <span className="ml-2 text-sky-300">· {focusLabel}</span>
                              ) : null}
                            </p>
                            {workSubtitle ? <p className="text-sm text-white/70">{workSubtitle}</p> : null}
                            <p className="text-sm text-white/60">
                              <span className="text-xs uppercase tracking-wide text-white/40">{startLabel}</span>
                              <span className="mx-2 text-white/30">·</span>
                              <span>{durationMinutes} min</span>
                            </p>
                          </div>
                          <ObjectiveChip objective={objective} size="sm" />
                        </div>
                        {(showDetailsToggle || hasVideos) && (
                          <div className="flex items-center gap-3 text-xs text-white/50">
                            {showDetailsToggle ? (
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
                            ) : null}
                            {hasVideos ? (
                              <span>
                                {videoUrls.length} vídeo{videoUrls.length > 1 ? 's' : ''}
                              </span>
                            ) : null}
                          </div>
                        )}
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
                    {showDetailsToggle && isExpanded && (
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        {hasDescription ? (
                          <MarkdownContent content={descriptionContent} enableWorkLinks />
                        ) : null}
                        {hasVideos ? (
                          <div className="space-y-3">
                            {videoUrls.map((url, index) => (
                              <div key={`${item.id}-video-${index}`} className="space-y-2">
                                <YouTubePreview url={url} title={`${work?.name ?? 'Trabajo'} vídeo ${index + 1}`} />
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
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {assistants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-3 text-xs text-white/70 sm:text-sm sm:p-4">
              <p className="font-semibold text-white">¿Quiénes participan?</p>
              <p className="mt-1">
                Crea tu lista de asistentes para poder registrar quién ha venido a clase en tiempo real.
              </p>
              <Link to="/assistants" className="btn-secondary mt-3 h-8 rounded-2xl px-3 text-xs">
                Gestionar asistentes
              </Link>
            </div>
          ) : activeAssistants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-3 text-xs text-white/70 sm:text-sm sm:p-4">
              <p className="font-semibold text-white">Todos los asistentes están inactivos.</p>
              <p className="mt-1">
                Activa al menos uno desde la sección de asistentes para poder marcar su asistencia.
              </p>
              <Link to="/assistants" className="btn-secondary mt-3 h-8 rounded-2xl px-3 text-xs">
                Ir a asistentes
              </Link>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3 sm:space-y-4 sm:p-5">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Asistencia en vivo</p>
                  <p className="text-xs text-white/50 sm:text-sm">Marca quién está presente en la sesión actual.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACTUAL_SUMMARY_ORDER.map((status) => (
                    <span
                      key={status}
                      className={clsx(
                        'inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs',
                        ACTUAL_SUMMARY_BADGE_CLASSES[status]
                      )}
                    >
                      {actualSummary[status]} {ACTUAL_SUMMARY_LABELS[status]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {activeAssistants.map((assistant) => {
                  const record = attendanceMap.get(assistant.id);
                  const forecastStatus = record?.status ?? 'pending';
                  const isPresent = record?.actualStatus === 'present';
                  const toggleAttendance = () =>
                    handleActualStatusChange(assistant.id, isPresent ? 'absent' : 'present');
                  return (
                    <article
                      key={assistant.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-2.5 sm:p-4"
                    >
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{assistant.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/50 sm:text-xs">
                            <span className="uppercase tracking-wide text-white/40">Previsión</span>
                            <span
                              className={clsx(
                                'inline-flex items-center gap-2 rounded-full px-2 py-0.5 font-semibold',
                                FORECAST_BADGE_CLASSES[forecastStatus]
                              )}
                            >
                              {ATTENDANCE_LABELS[forecastStatus]}
                            </span>
                            <span className="hidden text-white/30 sm:inline">·</span>
                            <span className="uppercase tracking-wide text-white/40">Asistencia</span>
                            <span
                              className={clsx(
                                'font-semibold',
                                isPresent ? 'text-emerald-200' : 'text-white/60'
                              )}
                            >
                              {isPresent ? 'Presente' : 'No asistió'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right sm:flex-row sm:items-center sm:gap-3">
                          <button
                            type="button"
                            onClick={toggleAttendance}
                            aria-pressed={isPresent}
                            aria-label={`${isPresent ? 'Desmarcar asistencia de' : 'Marcar asistencia de'} ${assistant.name}`}
                            title={isPresent ? 'Desmarcar asistencia' : 'Marcar como presente'}
                            className={clsx(
                              ACTUAL_TOGGLE_BASE_CLASSES,
                              isPresent ? ACTUAL_TOGGLE_PRESENT_CLASSES : ACTUAL_TOGGLE_ABSENT_CLASSES
                            )}
                          >
                            <span
                              className={clsx(
                                ACTUAL_TOGGLE_INDICATOR_CLASSES,
                                isPresent ? ACTUAL_TOGGLE_INDICATOR_PRESENT : ACTUAL_TOGGLE_INDICATOR_ABSENT
                              )}
                            >
                              {isPresent ? (
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M4 8.5 6.5 11l5-6"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                <span className="h-2.5 w-2.5 rounded-full bg-white/30 transition group-hover:bg-white/60" />
                              )}
                            </span>
                            <span>{isPresent ? 'Ha asistido' : 'Marcar asistencia'}</span>
                          </button>
                          <span
                            className={clsx(
                              'text-[10px] font-medium uppercase tracking-[0.25em] sm:text-[11px]',
                              isPresent ? 'text-emerald-200' : 'text-white/40'
                            )}
                          >
                            {isPresent ? 'PRESENTE' : 'AUSENTE'}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
