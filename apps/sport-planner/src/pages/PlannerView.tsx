import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import { SessionEditor } from '@/components/SessionEditor';
import { ObjectiveChip } from '@/components/ObjectiveChip';
import type { Session, Objective, Work } from '@/types';
import { getCalendarMatrix, isSameDate } from '@/utils/dates';

dayjs.locale('es');

function formatMonthTitle(reference: string) {
  return dayjs(reference).format('MMMM YYYY');
}

function SessionSummaryCard({
  session,
  objectives,
  works,
  isActive,
  onSelect,
  onDuplicate,
  onDelete
}: {
  session: Session;
  objectives: Objective[];
  works: Work[];
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const objectiveMap = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);
  const workMap = useMemo(() => new Map(works.map((work) => [work.id, work])), [works]);

  const primaryObjective = useMemo(() => {
    const firstWork = session.workItems[0];
    if (!firstWork) return undefined;
    const work = workMap.get(firstWork.workId);
    if (!work) return undefined;
    return objectiveMap.get(work.objectiveId);
  }, [session.workItems, workMap, objectiveMap]);

  const duration = session.workItems.reduce((acc, item) => {
    const work = workMap.get(item.workId);
    return acc + (item.customDurationMinutes ?? work?.estimatedMinutes ?? 0);
  }, 0);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'group relative flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-500/10',
        isActive && 'ring-2 ring-sky-400/70'
      )}
    >
      {primaryObjective ? (
        <div
          className="absolute inset-0 -z-[1] rounded-3xl opacity-20 blur-2xl transition group-hover:opacity-40"
          style={{ backgroundColor: primaryObjective.colorHex }}
        />
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-white">{session.title || 'Sesión sin título'}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            {session.workItems.length} trabajos · {duration} min
          </p>
        </div>
        <ObjectiveChip objective={primaryObjective} size="sm" />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-white/60">
        {session.workItems.slice(0, 3).map((item) => {
          const work = workMap.get(item.workId);
          const subtitle = (work?.subtitle ?? '').trim();
          return (
            <span key={item.id} className="rounded-full border border-white/10 px-3 py-1">
              {subtitle ? `${work?.name ?? 'Trabajo'} · ${subtitle}` : work?.name ?? 'Trabajo'}
            </span>
          );
        })}
        {session.workItems.length > 3 ? (
          <span className="rounded-full border border-white/10 px-3 py-1">+{session.workItems.length - 3}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <ObjectiveChip objective={primaryObjective} size="sm" />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
            className="btn-secondary px-3 py-1 text-xs"
          >
            Duplicar
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
          >
            Eliminar
          </button>
        </div>
      </div>
    </button>
  );
}

export default function PlannerView() {
  const sessions = useAppStore((state) => state.sessions);
  const works = useAppStore((state) => state.works);
  const objectives = useAppStore((state) => state.objectives);
  const assistants = useAppStore((state) => state.assistants);

  const addSession = useAppStore((state) => state.addSession);
  const duplicateSession = useAppStore((state) => state.duplicateSession);
  const deleteSession = useAppStore((state) => state.deleteSession);

  const [searchParams, setSearchParams] = useSearchParams();

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach((session) => {
      const key = dayjs(session.date).format('YYYY-MM-DD');
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    });
    map.forEach((list) =>
      list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'es'))
    );
    return map;
  }, [sessions]);

  const initialSessionId = searchParams.get('session') ?? undefined;
  const initialSession = initialSessionId ? sessions.find((session) => session.id === initialSessionId) : undefined;

  const today = dayjs().format('YYYY-MM-DD');
  const defaultDate = initialSession?.date ?? today;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [monthAnchor, setMonthAnchor] = useState(dayjs(selectedDate).startOf('month').format('YYYY-MM-DD'));
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(initialSessionId);

  useEffect(() => {
    if (initialSessionId && !sessions.find((session) => session.id === initialSessionId)) {
      setActiveSessionId(undefined);
      setSearchParams({}, { replace: true });
    }
  }, [initialSessionId, sessions, setSearchParams]);

  const calendarMatrix = useMemo(() => getCalendarMatrix(dayjs(monthAnchor)), [monthAnchor]);

  const monthSessions = useMemo(() => {
    const anchor = dayjs(monthAnchor);
    return sessions
      .filter((session) => {
        const date = dayjs(session.date);
        return date.year() === anchor.year() && date.month() === anchor.month();
      })
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [sessions, monthAnchor]);

  const monthlySessionsByDate = useMemo(
    () => {
      const groups = new Map<string, Session[]>();
      monthSessions.forEach((session) => {
        const key = dayjs(session.date).format('YYYY-MM-DD');
        const list = groups.get(key) ?? [];
        list.push(session);
        groups.set(key, list);
      });
      return Array.from(groups.entries())
        .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
        .map(([date, list]) => ({
          date,
          sessions: list.slice().sort((lhs, rhs) => (lhs.title ?? '').localeCompare(rhs.title ?? '', 'es'))
        }));
    },
    [monthSessions]
  );

  const sessionsForSelectedDate = sessionsByDate.get(selectedDate) ?? [];
  useEffect(() => {
    if (sessionsForSelectedDate.length > 0) {
      if (!activeSessionId || !sessionsForSelectedDate.some((session) => session.id === activeSessionId)) {
        setActiveSessionId(sessionsForSelectedDate[0].id);
      }
    } else {
      setActiveSessionId(undefined);
    }
  }, [sessionsForSelectedDate, activeSessionId]);

  const activeSession = activeSessionId
    ? sessions.find((session) => session.id === activeSessionId)
    : undefined;

  const handleSelectDate = (dateIso: string) => {
    setSelectedDate(dateIso);
    setMonthAnchor(dayjs(dateIso).startOf('month').format('YYYY-MM-DD'));
  };

  const handleCreateSession = () => {
    const session = addSession({
      date: selectedDate,
      title: 'Nueva sesión',
      description: '',
      notes: ''
    });
    setActiveSessionId(session.id);
  };

  const handleDuplicateSession = (sessionId: string) => {
    const duplicated = duplicateSession(sessionId, selectedDate);
    if (duplicated) {
      setActiveSessionId(duplicated.id);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    if (activeSessionId === sessionId) {
      setActiveSessionId(undefined);
    }
  };

  const handleMonthChange = (offset: number) => {
    const newMonth = dayjs(monthAnchor).add(offset, 'month');
    setMonthAnchor(newMonth.format('YYYY-MM-DD'));
    setSelectedDate((prev) => {
      const maybe = dayjs(prev);
      if (maybe.month() === newMonth.month() && maybe.year() === newMonth.year()) {
        return prev;
      }
      return newMonth.startOf('month').format('YYYY-MM-DD');
    });
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Planificador</h1>
            <p className="text-white/60">
              Organiza tus sesiones con un calendario gráfico, duplica lo que funciona y edita cada detalle con drag &
              drop.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => handleMonthChange(-1)}>
              ← Mes anterior
            </button>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
              {formatMonthTitle(monthAnchor)}
            </div>
            <button type="button" className="btn-secondary" onClick={() => handleMonthChange(1)}>
              Mes siguiente →
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1.5fr] xl:grid-cols-[1.6fr_1.4fr]">
        <section className="glass-panel flex flex-col gap-6 p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-white/50">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="rounded-full bg-white/5 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarMatrix.flat().map((date) => {
              const dateKey = date.format('YYYY-MM-DD');
              const daySessions = sessionsByDate.get(dateKey) ?? [];
              const isCurrentMonth = date.month() === dayjs(monthAnchor).month();
              const isToday = isSameDate(dateKey, today);
              const isSelected = isSameDate(dateKey, selectedDate);

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => handleSelectDate(dateKey)}
                  className={clsx(
                    'relative flex h-20 flex-col items-center justify-between rounded-2xl border p-2 text-sm transition',
                    isSelected
                      ? 'border-sky-400/60 bg-sky-500/20 text-white shadow-lg shadow-sky-500/20'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30',
                    !isCurrentMonth && 'text-white/30'
                  )}
                >
                  <span
                    className={clsx(
                      'flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold',
                      isToday ? 'bg-white text-slate-900' : ''
                    )}
                  >
                    {date.format('D')}
                  </span>
                  <div className="flex w-full flex-wrap justify-center gap-1">
                    {daySessions.slice(0, 3).map((session) => {
                      const firstWork = session.workItems[0];
                      const work = firstWork ? works.find((work) => work.id === firstWork.workId) : undefined;
                      const objective = work ? objectives.find((objective) => objective.id === work.objectiveId) : undefined;
                      return (
                        <span
                          key={session.id}
                          className="h-2 w-6 rounded-full"
                          style={{ backgroundColor: objective?.colorHex ?? 'rgba(255,255,255,0.4)' }}
                        />
                      );
                    })}
                    {daySessions.length > 3 ? (
                      <span className="h-2 w-2 rounded-full border border-white/40" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Sesiones del mes</p>
              <h2 className="text-lg font-semibold text-white">{formatMonthTitle(monthAnchor)}</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {monthSessions.length} {monthSessions.length === 1 ? 'sesión' : 'sesiones'}
            </span>
          </div>
          <div className="custom-scrollbar -m-2 max-h-[32rem] space-y-3 overflow-y-auto p-2">
            {monthlySessionsByDate.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/50">
                Aún no hay sesiones planificadas para este mes. Selecciona un día en el calendario para crear la primera.
              </div>
            ) : (
              monthlySessionsByDate.map(({ date, sessions: list }) => {
                const sessionCountLabel = list.length === 1 ? '1 sesión' : `${list.length} sesiones`;
                return (
                  <div
                    key={date}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectDate(date)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelectDate(date);
                      }
                    }}
                    className={clsx(
                      'cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3 text-sm transition hover:border-white/40 hover:bg-white/10',
                      isSameDate(date, selectedDate) && 'border-sky-400/50 bg-sky-500/10 shadow shadow-sky-500/10'
                    )}
                  >
                    <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                      <span>{dayjs(date).format('ddd · D MMM')}</span>
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/50">
                        {sessionCountLabel}
                      </span>
                    </p>
                    <div className="mt-3 space-y-2 text-xs">
                      {list.map((session) => {
                        const description = (session.description ?? '').trim();
                        const durationMinutes = session.workItems.reduce((total, item) => {
                          const work = works.find((workItem) => workItem.id === item.workId);
                          return total + (item.customDurationMinutes ?? work?.estimatedMinutes ?? 0);
                      }, 0);
                      return (
                        <button
                          key={session.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleSelectDate(date);
                            setActiveSessionId(session.id);
                          }}
                          className={clsx(
                            'flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-left transition hover:border-white/30 hover:text-white',
                            session.id === activeSessionId && isSameDate(date, selectedDate) && 'border-sky-400/60 text-white'
                          )}
                        >
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="truncate font-medium">{session.title || 'Sesión sin título'}</span>
                            <span className="text-[11px] uppercase tracking-wide text-white/40">
                              {session.workItems.length} · {durationMinutes} min
                            </span>
                          </div>
                          {description ? (
                            <p
                              className="text-[11px] leading-relaxed text-white/60"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {description}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="glass-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Sesiones en</p>
            <h2 className="text-2xl font-semibold text-white">{dayjs(selectedDate).format('dddd, D [de] MMMM')}</h2>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleCreateSession} className="btn-primary">
              + Nueva sesión
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {sessionsForSelectedDate.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/50">
              Aún no hay sesiones planificadas este día. Crea una con el botón superior.
            </div>
          ) : (
            sessionsForSelectedDate.map((session) => (
              <SessionSummaryCard
                key={session.id}
                session={session}
                objectives={objectives}
                works={works}
                isActive={session.id === activeSessionId}
                onSelect={() => setActiveSessionId(session.id)}
                onDuplicate={() => handleDuplicateSession(session.id)}
                onDelete={() => handleDeleteSession(session.id)}
              />
            ))
          )}
        </div>
      </section>

      {activeSession && (
        <div className="glass-panel p-6">
          <SessionEditor
            session={activeSession}
            works={works}
            objectives={objectives}
            assistants={assistants}
            onDateChange={(date) => {
              setSelectedDate(date);
              setMonthAnchor(dayjs(date).startOf('month').format('YYYY-MM-DD'));
            }}
          />
        </div>
      )}
    </div>
  );
}
