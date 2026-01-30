import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import clsx from 'clsx';
import { Link, useSearchParams } from 'react-router-dom';

import { useAppStore } from '@/store/appStore';
import { SessionEditor } from '@/components/SessionEditor';
import type { Session } from '@/types';

dayjs.locale('es');

export default function PersonalSessionsView() {
  const plans = useAppStore((state) => state.plans);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlanIdParam = (searchParams.get('plan') ?? '').trim();

  const personalPlans = useMemo(
    () => plans.filter((plan) => plan.kind === 'personal' && plan.enabled),
    [plans]
  );

  const selectedPlan = useMemo(() => {
    if (personalPlans.length === 0) return undefined;
    const byParam = personalPlans.find((plan) => plan.id === selectedPlanIdParam);
    return byParam ?? personalPlans[0];
  }, [personalPlans, selectedPlanIdParam]);

  const selectedPlanId = selectedPlan?.id ?? 'personal-kungfu';

  useEffect(() => {
    if (!selectedPlan) return;
    if (selectedPlanIdParam === selectedPlan.id) return;
    const next = new URLSearchParams(searchParams);
    next.set('plan', selectedPlan.id);
    setSearchParams(next, { replace: true });
  }, [selectedPlan, selectedPlanIdParam, searchParams, setSearchParams]);

  const sessions = useAppStore((state) => state.sessions).filter(
    (session) => session.kind === 'personal' && (session.planId ?? 'personal-kungfu') === selectedPlanId
  );
  const works = useAppStore((state) => state.works);
  const objectives = useAppStore((state) => state.objectives);
  const assistants = useAppStore((state) => state.assistants);
  const addSession = useAppStore((state) => state.addSession);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()),
    [sessions]
  );

  const initialSessionId = searchParams.get('session') ?? undefined;
  const initialSession = initialSessionId ? sessions.find((session) => session.id === initialSessionId) : undefined;

  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(initialSession?.id);

  useEffect(() => {
    if (initialSessionId && !sessions.some((session) => session.id === initialSessionId)) {
      setSelectedSessionId(undefined);
      const next = new URLSearchParams(searchParams);
      next.delete('session');
      setSearchParams(next, { replace: true });
    }
  }, [initialSessionId, sessions, searchParams, setSearchParams]);

  const selectedSession: Session | undefined = selectedSessionId
    ? sessions.find((session) => session.id === selectedSessionId)
    : undefined;

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const next = new URLSearchParams(searchParams);
    next.set('session', sessionId);
    next.set('plan', selectedPlanId);
    setSearchParams(next, { replace: true });
  };

  const handleCreateToday = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const existing = sessions.find((session) => session.date === today);
    if (existing) {
      handleSelectSession(existing.id);
      return;
    }
    const created = addSession({
      date: today,
      kind: 'personal',
      planId: selectedPlanId,
      title: selectedPlan?.name ?? 'Entrenamiento personal',
      description: '',
      notes: ''
    });
    handleSelectSession(created.id);
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{selectedPlan?.name ?? 'Personal'} · Sesiones</h1>
            <p className="text-white/60">Histórico y edición de sesiones para este plan.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={`/personal?plan=${encodeURIComponent(selectedPlanId)}`} className="btn-secondary">
              Volver a hoy
            </Link>
            <Link to={`/settings?plan=${encodeURIComponent(selectedPlanId)}`} className="btn-secondary">
              Ajustes
            </Link>
            <button type="button" className="btn-primary" onClick={handleCreateToday}>
              Crear/abrir hoy
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <section className="glass-panel space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Sesiones</h2>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {sortedSessions.length}
            </span>
          </div>
          {sortedSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/50">
              No hay sesiones personales todavía. Crea la sesión de hoy para empezar a registrar tu entrenamiento.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSessions.map((session) => {
                const trainedCount = session.workItems.filter(
                  (item) => (item.completed ?? false) || typeof item.result !== 'undefined'
                ).length;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => handleSelectSession(session.id)}
                    className={clsx(
                      'flex w-full flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/30 hover:bg-white/10',
                      session.id === selectedSessionId && 'border-sky-400/60 bg-sky-500/10 shadow shadow-sky-500/10'
                    )}
                  >
                    <p className="text-sm font-semibold text-white">{session.title || 'Sesión sin título'}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      {dayjs(session.date).format('ddd · D MMM YYYY')}
                    </p>
                    <p className="text-xs text-white/60">
                      {trainedCount}/{session.workItems.length} registrados
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="glass-panel p-6">
          {selectedSession ? (
            <SessionEditor
              session={selectedSession}
              works={works}
              objectives={objectives}
              assistants={assistants}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/50">
              Selecciona una sesión para verla y editarla.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
