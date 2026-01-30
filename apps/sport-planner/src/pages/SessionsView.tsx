import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import ClassSessionsView from './ClassSessionsView';
import PersonalTodayView from './PersonalTodayView';

export default function SessionsView() {
  const plans = useAppStore((state) => state.plans);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlanIdParam = (searchParams.get('plan') ?? '').trim();

  const enabledPlans = useMemo(() => plans.filter((plan) => plan.enabled), [plans]);

  const orderedPlans = useMemo(() => {
    const next = [...enabledPlans];
    next.sort((a, b) => {
      const kindOrder = a.kind === b.kind ? 0 : a.kind === 'class' ? -1 : 1;
      if (kindOrder !== 0) return kindOrder;
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
    return next;
  }, [enabledPlans]);

  const selectedPlan = useMemo(() => {
    if (orderedPlans.length === 0) return undefined;
    const byParam = orderedPlans.find((plan) => plan.id === selectedPlanIdParam);
    return byParam ?? orderedPlans[0];
  }, [orderedPlans, selectedPlanIdParam]);

  const selectedPlanId = selectedPlan?.id ?? 'classes';

  useEffect(() => {
    if (!selectedPlan) return;
    if (selectedPlanIdParam === selectedPlan.id) return;
    const next = new URLSearchParams(searchParams);
    next.set('plan', selectedPlan.id);
    setSearchParams(next, { replace: true });
  }, [selectedPlan, selectedPlanIdParam, searchParams, setSearchParams]);

  const handleSelectPlan = (planId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('plan', planId);
    next.delete('session');
    setSearchParams(next, { replace: true });
  };

  if (!selectedPlan) {
    return (
      <div className="glass-panel p-10 text-center text-white/60">
        No hay planes activos. Ve a Ajustes y crea/activa uno.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sesiones</h1>
            <p className="text-white/60">Vista unificada por planes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {orderedPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleSelectPlan(plan.id)}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  plan.id === selectedPlanId
                    ? 'border-sky-400/70 bg-sky-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                )}
                title={plan.kind === 'class' ? 'Plan de clases' : 'Plan personal'}
              >
                {plan.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {selectedPlan.kind === 'class' ? <ClassSessionsView /> : <PersonalTodayView />}
    </div>
  );
}

