import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Session, AttendanceStatus, SessionAttendance, ActualAttendanceStatus, Objective, Work } from '@/types';
import { ObjectiveChip } from '@/components/ObjectiveChip';
import { MarkdownContent } from '@/components/MarkdownContent';
import { SessionEditor } from '@/components/SessionEditor';
import { SessionWorkViewCard } from '@/components/SessionWorkViewCard';
import { formatMinutesToTime, parseTimeToMinutes } from '@/utils/time';
import { getCalendarMatrix, isSameDate } from '@/utils/dates';

dayjs.locale('es');

type Mode = 'view' | 'edit';

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

function formatMonthTitle(reference: string) {
  return dayjs(reference).format('MMMM YYYY');
}

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (nextMode: Mode) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
      <button
        type="button"
        className={clsx(
          'rounded-full px-4 py-2 text-sm font-semibold transition',
          mode === 'view' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
        )}
        onClick={() => {
          if (mode === 'view') return;
          onChange('view');
        }}
      >
        Vista
      </button>
      <button
        type="button"
        className={clsx(
          'rounded-full px-4 py-2 text-sm font-semibold transition',
          mode === 'edit' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
        )}
        onClick={() => {
          if (mode === 'edit') return;
          onChange('edit');
        }}
      >
        Editar
      </button>
    </div>
  );
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

export default function ClassSessionsView() {
  const allSessions = useAppStore((state) => state.sessions);
  const plans = useAppStore((state) => state.plans);
  const works = useAppStore((state) => state.works);
  const objectives = useAppStore((state) => state.objectives);
  const assistants = useAppStore((state) => state.assistants);

  const addSession = useAppStore((state) => state.addSession);
  const duplicateSession = useAppStore((state) => state.duplicateSession);
  const deleteSession = useAppStore((state) => state.deleteSession);

  const setAttendanceActualStatus = useAppStore((state) => state.setAttendanceActualStatus);
  const toggleCompletion = useAppStore((state) => state.toggleSessionWorkCompletion);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlanIdParam = (searchParams.get('plan') ?? '').trim();
  const sessionParam = searchParams.get('session') ?? undefined;
  const mode: Mode = searchParams.get('mode') === 'edit' ? 'edit' : 'view';

  const classPlans = useMemo(
    () => plans.filter((plan) => plan.kind === 'class' && plan.enabled),
    [plans]
  );

  const selectedPlan = useMemo(() => {
    if (classPlans.length === 0) return undefined;
    const byParam = classPlans.find((plan) => plan.id === selectedPlanIdParam);
    return byParam ?? classPlans[0];
  }, [classPlans, selectedPlanIdParam]);

  const selectedPlanId = selectedPlan?.id ?? 'classes';

  useEffect(() => {
    if (!selectedPlan) return;
    if (selectedPlanIdParam === selectedPlan.id) return;
    const next = new URLSearchParams(searchParams);
    next.set('plan', selectedPlan.id);
    setSearchParams(next, { replace: true });
  }, [selectedPlan, selectedPlanIdParam, searchParams, setSearchParams]);

  const sessions = useMemo(
    () =>
      allSessions.filter(
        (session) => session.kind === 'class' && (session.planId ?? 'classes') === selectedPlanId
      ),
    [allSessions, selectedPlanId]
  );

  const [calendarOpen, setCalendarOpen] = useState(() => mode === 'edit');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()),
    [sessions]
  );

  const today = dayjs().format('YYYY-MM-DD');
  const nextSession = useMemo(
    () => sortedSessions.find((session) => session.date >= today) ?? sortedSessions[sortedSessions.length - 1],
    [sortedSessions, today]
  );

  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(() => {
    if (sessionParam && sessions.some((session) => session.id === sessionParam)) return sessionParam;
    return nextSession?.id;
  });

  const setMode = (nextMode: Mode) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode === 'edit') {
      next.set('mode', 'edit');
    } else {
      next.delete('mode');
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!sessionParam) return;
    if (sessions.some((session) => session.id === sessionParam)) {
      setActiveSessionId(sessionParam);
    }
  }, [sessionParam, sessions]);

  useEffect(() => {
    if (activeSessionId && sessions.some((session) => session.id === activeSessionId)) return;
    if (sessionParam && sessions.some((session) => session.id === sessionParam)) {
      setActiveSessionId(sessionParam);
      return;
    }
    setActiveSessionId(nextSession?.id);
  }, [activeSessionId, sessionParam, sessions, nextSession]);

  const activeSession = useMemo<Session | undefined>(() => {
    if (activeSessionId) {
      return sortedSessions.find((session) => session.id === activeSessionId) ?? nextSession;
    }
    return nextSession;
  }, [sortedSessions, activeSessionId, nextSession]);

  const activeSessionProgress = useMemo(() => {
    const items = activeSession?.workItems ?? [];
    const total = items.length;
    const done = items.filter((item) => item.completed ?? false).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
  }, [activeSession?.workItems]);

  const lastSeenByWorkId = useMemo(() => {
    const map = new Map<string, string>();
    if (!activeSession) return map;
    sortedSessions.forEach((session) => {
      if (session.date >= activeSession.date) return;
      session.workItems.forEach((item) => {
        if (!item.workId) return;
        map.set(item.workId, session.date);
      });
    });
    return map;
  }, [sortedSessions, activeSession]);

  const updateSearchParamSession = (nextId: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (nextId) {
      next.set('session', nextId);
    } else {
      next.delete('session');
    }
    setSearchParams(next, { replace: true });
  };

  const selectSession = (id: string | undefined) => {
    setActiveSessionId(id);
    updateSearchParamSession(id);
  };

  const defaultSelectedDate = activeSession?.date ?? today;
  const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);
  const [monthAnchor, setMonthAnchor] = useState(dayjs(defaultSelectedDate).startOf('month').format('YYYY-MM-DD'));

  useEffect(() => {
    if (!activeSession) return;
    setSelectedDate(activeSession.date);
    setMonthAnchor(dayjs(activeSession.date).startOf('month').format('YYYY-MM-DD'));
  }, [activeSession]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach((session) => {
      const key = dayjs(session.date).format('YYYY-MM-DD');
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    });
    map.forEach((list) => list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'es')));
    return map;
  }, [sessions]);

  const sessionsForSelectedDate = useMemo(() => sessionsByDate.get(selectedDate) ?? [], [sessionsByDate, selectedDate]);

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

  const monthlySessionsByDate = useMemo(() => {
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
  }, [monthSessions]);

  const handleSelectDate = (dateIso: string) => {
    setSelectedDate(dateIso);
    setMonthAnchor(dayjs(dateIso).startOf('month').format('YYYY-MM-DD'));
    const daySessions = sessionsByDate.get(dateIso) ?? [];
    if (daySessions.length > 0) {
      selectSession(daySessions[0].id);
    } else {
      selectSession(undefined);
    }
  };

  const handleCreateSession = () => {
    const session = addSession({
      date: selectedDate,
      planId: selectedPlanId,
      title: 'Nueva sesión',
      description: '',
      notes: ''
    });
    selectSession(session.id);
  };

  const handleDuplicateSession = (sessionId: string) => {
    const duplicated = duplicateSession(sessionId, selectedDate);
    if (duplicated) {
      selectSession(duplicated.id);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    if (activeSessionId === sessionId) {
      selectSession(undefined);
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

  const objectiveMap = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);
  const workMap = useMemo(() => new Map(works.map((work) => [work.id, work])), [works]);

  const emptyState = sortedSessions.length === 0;

  const activeAssistants = useMemo(
    () =>
      assistants
        .filter((assistant) => assistant.active)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })),
    [assistants]
  );

  const attendanceEntries = activeSession?.attendance ?? EMPTY_ATTENDANCE;
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

  const sessionStartMinutes = useMemo(
    () => parseTimeToMinutes(activeSession?.startTime, '18:30'),
    [activeSession?.startTime]
  );

  const workSchedule = useMemo(() => {
    if (!activeSession) {
      return new Map<string, { startLabel: string; duration: number }>();
    }
    let accumulated = 0;
    const schedule = new Map<string, { startLabel: string; duration: number }>();
    activeSession.workItems.forEach((sessionWork) => {
      const work = workMap.get(sessionWork.workId);
      const duration = sessionWork.customDurationMinutes ?? work?.estimatedMinutes ?? 0;
      const startLabel = formatMinutesToTime(sessionStartMinutes + accumulated);
      schedule.set(sessionWork.id, { startLabel, duration });
      accumulated += duration;
    });
    return schedule;
  }, [activeSession, workMap, sessionStartMinutes]);

  const sessionIndex = activeSession ? sortedSessions.findIndex((session) => session.id === activeSession.id) : -1;
  const hasPrev = sessionIndex > 0;
  const hasNext = sessionIndex >= 0 && sessionIndex < sortedSessions.length - 1;

  const goPrev = () => {
    if (!hasPrev) return;
    selectSession(sortedSessions[sessionIndex - 1].id);
  };

  const goNext = () => {
    if (!hasNext) return;
    selectSession(sortedSessions[sessionIndex + 1].id);
  };

  const handleDateSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    if (!date) return;
    handleSelectDate(date);
    const found = sessionsByDate.get(date);
    if (found && found.length > 0) {
      selectSession(found[0].id);
    }
  };

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
    if (!activeSession) return;
    setAttendanceActualStatus(activeSession.id, assistantId, status);
  };

  const calendarPanel = calendarOpen ? (
    <section className="glass-panel space-y-6 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Calendario</p>
          <h2 className="text-xl font-semibold text-white">{formatMonthTitle(monthAnchor)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary" onClick={() => handleMonthChange(-1)}>
            ← Mes anterior
          </button>
          <button type="button" className="btn-secondary" onClick={() => handleMonthChange(1)}>
            Mes siguiente →
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1.7fr]">
        <section className="space-y-4">
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

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Sesiones en</p>
              <h3 className="text-2xl font-semibold text-white">{dayjs(selectedDate).format('dddd, D [de] MMMM')}</h3>
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
                  isActive={session.id === activeSession?.id}
                  onSelect={() => selectSession(session.id)}
                  onDuplicate={() => handleDuplicateSession(session.id)}
                  onDelete={() => handleDeleteSession(session.id)}
                />
              ))
            )}
          </div>

          {monthlySessionsByDate.length > 0 ? (
            <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-white/80">
                Ver sesiones del mes ({monthSessions.length})
              </summary>
              <div className="custom-scrollbar mt-3 max-h-[22rem] space-y-3 overflow-y-auto pr-1">
                {monthlySessionsByDate.map(({ date, sessions: list }) => {
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
                                selectSession(session.id);
                              }}
                              className={clsx(
                                'flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-left transition hover:border-white/30 hover:text-white',
                                session.id === activeSession?.id && isSameDate(date, selectedDate) && 'border-sky-400/60 text-white'
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
                })}
              </div>
            </details>
          ) : null}
        </section>
      </div>
    </section>
  ) : null;

  return (
    <div className="space-y-6">
      {emptyState || !activeSession ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <ModeSwitch mode={mode} onChange={setMode} />
          <button type="button" className="btn-secondary" onClick={() => setCalendarOpen((prev) => !prev)}>
            {calendarOpen ? 'Ocultar calendario' : 'Abrir calendario'}
          </button>
        </div>
      ) : null}

      {calendarPanel}

      {emptyState ? (
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
            <p className="text-lg font-semibold text-white sm:text-2xl">Aún no hay sesiones</p>
            <p className="mx-auto max-w-md text-sm text-white/60 sm:text-base">
              Crea tu primera sesión en el calendario y empieza a construir tu plan reutilizable.
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={() => setCalendarOpen(true)}>
            Abrir calendario
          </button>
        </section>
      ) : activeSession ? (
        <section className="glass-panel space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
          <header className="space-y-3 sm:flex sm:items-start sm:justify-between sm:gap-6 sm:space-y-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                <span className="sm:hidden">Sesión</span>
                <span className="hidden sm:inline">Fecha</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{formatDate(activeSession.date)}</h2>
              <p className="text-sm font-medium text-white/80 sm:text-lg">{activeSession.title}</p>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 sm:w-auto">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-white">Duración estimada</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  {(activeSession.workItems
                    .map((item) => {
                      const work = workMap.get(item.workId);
                      const minutes = item.customDurationMinutes ?? work?.estimatedMinutes ?? 0;
                      return minutes;
                    })
                    .reduce((acc, val) => acc + val, 0)) || 0}{' '}
                  min
                </span>
              </div>
              <div>
                <p className="mt-1 text-xs text-white/60">
                  Progreso: {activeSessionProgress.done}/{activeSessionProgress.total} · {activeSessionProgress.percent}%
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950/50">
                  <div
                    className="h-full rounded-full bg-white/25"
                    style={{ width: `${Math.min(Math.max(activeSessionProgress.percent, 0), 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <label className="text-[11px] uppercase tracking-wide text-white/40 sm:text-xs">Ir a fecha</label>
                <input
                  type="date"
                  className="input-field w-full sm:w-auto"
                  value={activeSession.date ?? today}
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
            <div className="flex flex-wrap items-center gap-2">
              <ModeSwitch mode={mode} onChange={setMode} />
              <button
                type="button"
                className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold sm:h-10 sm:text-sm"
                onClick={() => setCalendarOpen((prev) => !prev)}
              >
                {calendarOpen ? 'Ocultar calendario' : 'Abrir calendario'}
              </button>
            </div>
          </div>

          {mode === 'edit' ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 sm:p-4">
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
          ) : (
            <>
              {activeSession.description && (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-3 sm:p-4">
                  <MarkdownContent content={activeSession.description} />
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm uppercase tracking-[0.3em] text-white/40">Trabajos</h3>
                <div className="space-y-3 sm:space-y-4">
                  {activeSession.workItems.map((item) => {
                    const work = workMap.get(item.workId);
                    const objective = work ? objectiveMap.get(work.objectiveId) : undefined;
                    const isExpanded = expandedItems.has(item.id);
                    const scheduleEntry = workSchedule.get(item.id);
                    const startLabel = scheduleEntry?.startLabel ?? formatMinutesToTime(sessionStartMinutes);
                    const durationMinutes =
                      scheduleEntry?.duration ?? (item.customDurationMinutes ?? work?.estimatedMinutes ?? 0);
                    const focusLabel = (item.focusLabel ?? '').trim();
                    const descriptionContent = item.customDescriptionMarkdown ?? work?.descriptionMarkdown ?? '';
                    const videoUrls = (work?.videoUrls ?? []).map((url) => url.trim()).filter(Boolean);
                    const workSubtitle = (work?.subtitle ?? '').trim();

                    return (
                      <SessionWorkViewCard
                        key={item.id}
                        title={work?.name ?? 'Trabajo eliminado'}
                        titleExtra={focusLabel}
                        subtitle={workSubtitle}
                        objective={objective}
                        checked={item.completed ?? false}
                        onCheckedChange={(nextChecked) => toggleCompletion(activeSession.id, item.id, nextChecked)}
                        orderNumber={(item.order ?? 0) + 1}
                        startLabel={startLabel}
                        durationMinutes={durationMinutes}
                        tags={work?.tags}
                        lastSeenLabel={
                          lastSeenByWorkId.get(item.workId)
                            ? dayjs(lastSeenByWorkId.get(item.workId)!).format('D MMM YYYY')
                            : undefined
                        }
                        descriptionMarkdown={descriptionContent}
                        videoUrls={videoUrls}
                        isExpanded={isExpanded}
                        onToggleExpanded={() => toggleExpanded(item.id)}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {mode === 'view' ? (
            assistants.length === 0 ? (
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
                    const toggleAttendance = () => handleActualStatusChange(assistant.id, isPresent ? 'absent' : 'present');
                    return (
                      <article key={assistant.id} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 sm:p-4">
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
                              <span className={clsx('font-semibold', isPresent ? 'text-emerald-200' : 'text-white/60')}>
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
            )
          ) : null}
        </section>
      ) : (
        <div className="glass-panel p-10 text-center text-white/60">Selecciona una sesión desde el calendario.</div>
      )}
    </div>
  );
}
