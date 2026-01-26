import { useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/store/appStore';
import type { KungfuProgram, KungfuProgramSelector, KungfuCadenceConfig, KungfuTodayPlanConfig } from '@/types';

type Feedback = { type: 'success' | 'error'; text: string } | null;

const normalizeListLower = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  );

const normalizeIdList = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const toCsv = (list?: string[]) => (list ?? []).join(', ');

function normalizeSelectorDraft(selector: KungfuProgramSelector): KungfuProgramSelector {
  const tags = selector.byTags ? normalizeListLower(toCsv(selector.byTags)) : undefined;
  const nodeTypes = selector.byNodeTypes ? normalizeListLower(toCsv(selector.byNodeTypes)) : undefined;
  const workIds = selector.byWorkIds ? normalizeIdList(toCsv(selector.byWorkIds)) : undefined;

  const next: KungfuProgramSelector = {};
  if (tags && tags.length > 0) next.byTags = tags;
  if (nodeTypes && nodeTypes.length > 0) next.byNodeTypes = nodeTypes;
  if (workIds && workIds.length > 0) next.byWorkIds = workIds;
  return next;
}

function normalizePrograms(programs: KungfuProgram[]): KungfuProgram[] {
  return programs.map((program) => ({
    ...program,
    name: program.name.trim() || 'Kung Fu program',
    include: (program.include ?? []).map(normalizeSelectorDraft).filter((selector) => Object.keys(selector).length > 0),
    exclude: (program.exclude ?? []).map(normalizeSelectorDraft).filter((selector) => Object.keys(selector).length > 0)
  }));
}

function normalizeCadence(cadence: KungfuCadenceConfig): KungfuCadenceConfig {
  const targetsDays: Record<string, number> = {};
  Object.entries(cadence.targetsDays ?? {}).forEach(([key, value]) => {
    const cleanKey = key.trim().toLowerCase();
    const cleanValue = Number(value);
    if (!cleanKey) return;
    if (!Number.isFinite(cleanValue)) return;
    targetsDays[cleanKey] = Math.max(1, Math.round(cleanValue));
  });

  const overrides = (cadence.overrides ?? [])
    .map((override) => ({
      match: { tagsAny: normalizeListLower(toCsv(override.match?.tagsAny ?? [])) },
      multiplier: Math.max(0.1, Number(override.multiplier) || 1)
    }))
    .filter((override) => override.match.tagsAny.length > 0);

  return { targetsDays, overrides };
}

function normalizeTodayPlan(plan: KungfuTodayPlanConfig): KungfuTodayPlanConfig {
  const maxItems = Math.max(1, Math.round(Number(plan.maxItems) || 12));
  const minutesBudget = Math.max(1, Number(plan.minutesBudget) || 30);

  const focusMinutes = Math.max(0, Number(plan.template?.focusMinutes) || 0);
  const rouletteMinutes = Math.max(0, Number(plan.template?.rouletteMinutes) || 0);
  const recapMinutes = Math.max(0, Number(plan.template?.recapMinutes) || 0);
  const totalMinutes = Math.max(0, focusMinutes + rouletteMinutes + recapMinutes);

  const focusSelectors = (plan.focusSelectors ?? [])
    .map(normalizeSelectorDraft)
    .filter((selector) => Object.keys(selector).length > 0);
  const rouletteSelectors = (plan.rouletteSelectors ?? [])
    .map(normalizeSelectorDraft)
    .filter((selector) => Object.keys(selector).length > 0);

  const defaultMinutesByNodeType: Record<string, number> = {};
  Object.entries(plan.defaultMinutesByNodeType ?? {}).forEach(([key, value]) => {
    const cleanKey = key.trim().toLowerCase();
    const cleanValue = Number(value);
    if (!cleanKey) return;
    if (!Number.isFinite(cleanValue)) return;
    defaultMinutesByNodeType[cleanKey] = Math.max(0.25, cleanValue);
  });

  return {
    limitMode: plan.limitMode,
    maxItems,
    minutesBudget,
    template: { totalMinutes, focusMinutes, rouletteMinutes, recapMinutes },
    defaultMinutesByNodeType,
    focusSelectors,
    rouletteSelectors
  };
}

const EMPTY_SELECTOR: KungfuProgramSelector = {};

export default function PersonalSettingsView() {
  const programs = useAppStore((state) => state.kungfuPrograms);
  const cadence = useAppStore((state) => state.kungfuCadence);
  const todayPlan = useAppStore((state) => state.kungfuTodayPlan);

  const setPrograms = useAppStore((state) => state.setKungfuPrograms);
  const setCadence = useAppStore((state) => state.setKungfuCadence);
  const setTodayPlan = useAppStore((state) => state.setKungfuTodayPlan);

  const [draftPrograms, setDraftPrograms] = useState<KungfuProgram[]>(programs);
  const [draftCadence, setDraftCadence] = useState<KungfuCadenceConfig>(cadence);
  const [draftTodayPlan, setDraftTodayPlan] = useState<KungfuTodayPlanConfig>(todayPlan);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setDraftPrograms(programs);
  }, [programs]);

  useEffect(() => {
    setDraftCadence(cadence);
  }, [cadence]);

  useEffect(() => {
    setDraftTodayPlan(todayPlan);
  }, [todayPlan]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      JSON.stringify(programs) !== JSON.stringify(draftPrograms) ||
      JSON.stringify(cadence) !== JSON.stringify(draftCadence) ||
      JSON.stringify(todayPlan) !== JSON.stringify(draftTodayPlan)
    );
  }, [programs, cadence, todayPlan, draftPrograms, draftCadence, draftTodayPlan]);

  const showFeedback = (next: Feedback) => {
    setFeedback(next);
    if (!next) return;
    window.setTimeout(() => setFeedback(null), next.type === 'success' ? 1800 : 2600);
  };

  const handleSave = () => {
    try {
      const normalizedPrograms = normalizePrograms(draftPrograms);
      const normalizedCadence = normalizeCadence(draftCadence);
      const normalizedTodayPlan = normalizeTodayPlan(draftTodayPlan);
      setPrograms(normalizedPrograms);
      setCadence(normalizedCadence);
      setTodayPlan(normalizedTodayPlan);
      showFeedback({ type: 'success', text: 'Guardado.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar.';
      showFeedback({ type: 'error', text: message });
    }
  };

  const handleDiscard = () => {
    setDraftPrograms(programs);
    setDraftCadence(cadence);
    setDraftTodayPlan(todayPlan);
    showFeedback({ type: 'success', text: 'Cambios descartados.' });
  };

  const templateTotalMismatch =
    Math.round((draftTodayPlan.template?.focusMinutes ?? 0) + (draftTodayPlan.template?.rouletteMinutes ?? 0) + (draftTodayPlan.template?.recapMinutes ?? 0)) !==
    Math.round(draftTodayPlan.template?.totalMinutes ?? 0);

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kung Fu · Ajustes</h1>
            <p className="text-white/60">Programa, cadencias y plantilla de sesión para el modo Personal.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/personal" className="btn-secondary">
              Volver a hoy
            </Link>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary" onClick={handleDiscard} disabled={!hasUnsavedChanges}>
                Descartar
              </button>
              <button type="button" className="btn-primary" onClick={handleSave} disabled={!hasUnsavedChanges}>
                Guardar
              </button>
            </div>
          </div>
        </div>

        {feedback ? (
          <div
            className={clsx(
              'mt-4 rounded-2xl border px-4 py-3 text-sm',
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            )}
          >
            {feedback.text}
          </div>
        ) : null}
      </header>

      <section className="glass-panel space-y-5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Plan de hoy</h2>
          <p className="text-sm text-white/60">Controla cuántos ítems se sugieren y el presupuesto de minutos.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Modo de límite</label>
            <select
              className="input-field"
              value={draftTodayPlan.limitMode}
              onChange={(event) =>
                setDraftTodayPlan((prev) => ({ ...prev, limitMode: event.target.value as KungfuTodayPlanConfig['limitMode'] }))
              }
            >
              <option value="count">Por cantidad</option>
              <option value="minutes">Por minutos</option>
              <option value="both">Cantidad y minutos</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Máx. ítems</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={draftTodayPlan.maxItems}
              onChange={(event) => setDraftTodayPlan((prev) => ({ ...prev, maxItems: Number(event.target.value) }))}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Presupuesto (min)</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={draftTodayPlan.minutesBudget}
              onChange={(event) => setDraftTodayPlan((prev) => ({ ...prev, minutesBudget: Number(event.target.value) }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Foco (min)</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={draftTodayPlan.template.focusMinutes}
              onChange={(event) =>
                setDraftTodayPlan((prev) => ({
                  ...prev,
                  template: { ...prev.template, focusMinutes: Number(event.target.value) }
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Ruleta (min)</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={draftTodayPlan.template.rouletteMinutes}
              onChange={(event) =>
                setDraftTodayPlan((prev) => ({
                  ...prev,
                  template: { ...prev.template, rouletteMinutes: Number(event.target.value) }
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Recap (min)</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={draftTodayPlan.template.recapMinutes}
              onChange={(event) =>
                setDraftTodayPlan((prev) => ({
                  ...prev,
                  template: { ...prev.template, recapMinutes: Number(event.target.value) }
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Total (min)</label>
            <input
              type="number"
              min={0}
              className={clsx('input-field', templateTotalMismatch && 'border-amber-400/60')}
              value={draftTodayPlan.template.totalMinutes}
              onChange={(event) =>
                setDraftTodayPlan((prev) => ({
                  ...prev,
                  template: { ...prev.template, totalMinutes: Number(event.target.value) }
                }))
              }
            />
            {templateTotalMismatch ? (
              <p className="text-xs text-amber-200/90">Sugerencia: total = foco + ruleta + recap.</p>
            ) : null}
          </div>
        </div>

        <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white/80">Estimación de minutos por tipo</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Object.entries(draftTodayPlan.defaultMinutesByNodeType)
              .sort(([a], [b]) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
              .map(([key, value]) => (
                <label key={key} className="grid gap-2">
                  <span className="text-xs uppercase tracking-wide text-white/40">{key}</span>
                  <input
                    type="number"
                    min={0.25}
                    step={0.25}
                    className="input-field"
                    value={value}
                    onChange={(event) =>
                      setDraftTodayPlan((prev) => ({
                        ...prev,
                        defaultMinutesByNodeType: {
                          ...prev.defaultMinutesByNodeType,
                          [key]: Number(event.target.value)
                        }
                      }))
                    }
                  />
                </label>
              ))}
          </div>
        </details>

        <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white/80">Sacos: foco vs ruleta</summary>
          <p className="mt-2 text-sm text-white/60">
            Reglas opcionales para forzar qué entra en cada saco. La ruleta tiene prioridad sobre el foco.
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">Ruleta (OR)</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setDraftTodayPlan((prev) => ({
                      ...prev,
                      rouletteSelectors: [...(prev.rouletteSelectors ?? []), { ...EMPTY_SELECTOR }]
                    }))
                  }
                >
                  + Regla
                </button>
              </div>
              {(draftTodayPlan.rouletteSelectors ?? []).length === 0 ? (
                <p className="text-xs text-white/50">
                  Vacío = ruleta automática (técnicas + tag <span className="font-semibold text-white">roulette</span>).
                </p>
              ) : null}

              {(draftTodayPlan.rouletteSelectors ?? []).map((selector, selectorIndex) => (
                <div
                  key={`roulette-${selectorIndex}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Regla {selectorIndex + 1}</p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-200 hover:text-rose-100"
                      onClick={() =>
                        setDraftTodayPlan((prev) => ({
                          ...prev,
                          rouletteSelectors: (prev.rouletteSelectors ?? []).filter((_, i) => i !== selectorIndex)
                        }))
                      }
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-xs text-white/50">Tags (AND)</span>
                      <input
                        type="text"
                        className="input-field"
                        value={toCsv(selector.byTags)}
                        placeholder="bei-shaolin"
                        onChange={(event) => {
                          const nextTags = normalizeListLower(event.target.value);
                          setDraftTodayPlan((prev) => {
                            const rouletteSelectors = [...(prev.rouletteSelectors ?? [])];
                            rouletteSelectors[selectorIndex] = { ...rouletteSelectors[selectorIndex], byTags: nextTags };
                            return { ...prev, rouletteSelectors };
                          });
                        }}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-white/50">Node types</span>
                      <input
                        type="text"
                        className="input-field"
                        value={toCsv(selector.byNodeTypes)}
                        placeholder="application, technique"
                        onChange={(event) => {
                          const nextNodeTypes = normalizeListLower(event.target.value);
                          setDraftTodayPlan((prev) => {
                            const rouletteSelectors = [...(prev.rouletteSelectors ?? [])];
                            rouletteSelectors[selectorIndex] = {
                              ...rouletteSelectors[selectorIndex],
                              byNodeTypes: nextNodeTypes
                            };
                            return { ...prev, rouletteSelectors };
                          });
                        }}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-white/50">Work IDs</span>
                      <input
                        type="text"
                        className="input-field"
                        value={toCsv(selector.byWorkIds)}
                        placeholder="id1, id2"
                        onChange={(event) => {
                          const nextIds = normalizeIdList(event.target.value);
                          setDraftTodayPlan((prev) => {
                            const rouletteSelectors = [...(prev.rouletteSelectors ?? [])];
                            rouletteSelectors[selectorIndex] = { ...rouletteSelectors[selectorIndex], byWorkIds: nextIds };
                            return { ...prev, rouletteSelectors };
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">Forzar foco (OR)</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setDraftTodayPlan((prev) => ({
                      ...prev,
                      focusSelectors: [...(prev.focusSelectors ?? []), { ...EMPTY_SELECTOR }]
                    }))
                  }
                >
                  + Regla
                </button>
              </div>
              {(draftTodayPlan.focusSelectors ?? []).length === 0 ? (
                <p className="text-xs text-white/50">Opcional: por ejemplo, forzar técnicas concretas a foco.</p>
              ) : null}

              {(draftTodayPlan.focusSelectors ?? []).map((selector, selectorIndex) => (
                <div key={`focus-${selectorIndex}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Regla {selectorIndex + 1}</p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-200 hover:text-rose-100"
                      onClick={() =>
                        setDraftTodayPlan((prev) => ({
                          ...prev,
                          focusSelectors: (prev.focusSelectors ?? []).filter((_, i) => i !== selectorIndex)
                        }))
                      }
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-xs text-white/50">Tags (AND)</span>
                      <input
                        type="text"
                        className="input-field"
                        value={toCsv(selector.byTags)}
                        placeholder="segment"
                        onChange={(event) => {
                          const nextTags = normalizeListLower(event.target.value);
                          setDraftTodayPlan((prev) => {
                            const focusSelectors = [...(prev.focusSelectors ?? [])];
                            focusSelectors[selectorIndex] = { ...focusSelectors[selectorIndex], byTags: nextTags };
                            return { ...prev, focusSelectors };
                          });
                        }}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-white/50">Node types</span>
                      <input
                        type="text"
                        className="input-field"
                        value={toCsv(selector.byNodeTypes)}
                        placeholder="segment"
                        onChange={(event) => {
                          const nextNodeTypes = normalizeListLower(event.target.value);
                          setDraftTodayPlan((prev) => {
                            const focusSelectors = [...(prev.focusSelectors ?? [])];
                            focusSelectors[selectorIndex] = { ...focusSelectors[selectorIndex], byNodeTypes: nextNodeTypes };
                            return { ...prev, focusSelectors };
                          });
                        }}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-white/50">Work IDs</span>
                      <input
                        type="text"
                        className="input-field"
                        value={toCsv(selector.byWorkIds)}
                        placeholder="id1, id2"
                        onChange={(event) => {
                          const nextIds = normalizeIdList(event.target.value);
                          setDraftTodayPlan((prev) => {
                            const focusSelectors = [...(prev.focusSelectors ?? [])];
                            focusSelectors[selectorIndex] = { ...focusSelectors[selectorIndex], byWorkIds: nextIds };
                            return { ...prev, focusSelectors };
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </section>

      <section className="glass-panel space-y-5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Programas</h2>
          <p className="text-sm text-white/60">Define qué trabajos entran en el pool (include/exclude).</p>
        </div>

        <div className="space-y-4">
          {draftPrograms.map((program, programIndex) => (
            <div key={program.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      className="accent-sky-400"
                      checked={program.enabled}
                      onChange={(event) => {
                        setDraftPrograms((prev) =>
                          prev.map((item, idx) => (idx === programIndex ? { ...item, enabled: event.target.checked } : item))
                        );
                      }}
                    />
                    Enabled
                  </label>
                  <span className="text-xs text-white/40">id: {program.id}</span>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDraftPrograms((prev) => prev.filter((_, idx) => idx !== programIndex))}
                  disabled={draftPrograms.length <= 1}
                >
                  Eliminar
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-wide text-white/40">Nombre</span>
                  <input
                    type="text"
                    className="input-field"
                    value={program.name}
                    onChange={(event) =>
                      setDraftPrograms((prev) =>
                        prev.map((item, idx) => (idx === programIndex ? { ...item, name: event.target.value } : item))
                      )
                    }
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white/80">Include (OR)</p>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        setDraftPrograms((prev) =>
                          prev.map((item, idx) =>
                            idx === programIndex ? { ...item, include: [...(item.include ?? []), { ...EMPTY_SELECTOR }] } : item
                          )
                        )
                      }
                    >
                      + Regla
                    </button>
                  </div>

                  {(program.include ?? []).length === 0 ? (
                    <p className="text-xs text-white/50">Vacío = incluye todo (se aplican excludes).</p>
                  ) : null}

                  {(program.include ?? []).map((selector, selectorIndex) => (
                    <div key={`include-${program.id}-${selectorIndex}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Regla {selectorIndex + 1}</p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-200 hover:text-rose-100"
                          onClick={() =>
                            setDraftPrograms((prev) =>
                              prev.map((item, idx) =>
                                idx === programIndex
                                  ? { ...item, include: (item.include ?? []).filter((_, i) => i !== selectorIndex) }
                                  : item
                              )
                            )
                          }
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3">
                        <label className="grid gap-1">
                          <span className="text-xs text-white/50">Tags (AND)</span>
                          <input
                            type="text"
                            className="input-field"
                            value={toCsv(selector.byTags)}
                            placeholder="kungfu, eagleclaw"
                            onChange={(event) => {
                              const nextTags = normalizeListLower(event.target.value);
                              setDraftPrograms((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== programIndex) return item;
                                  const include = [...(item.include ?? [])];
                                  const nextSelector = { ...include[selectorIndex], byTags: nextTags };
                                  include[selectorIndex] = nextSelector;
                                  return { ...item, include };
                                })
                              );
                            }}
                          />
                        </label>
                        <label className="grid gap-1">
                          <span className="text-xs text-white/50">Node types</span>
                          <input
                            type="text"
                            className="input-field"
                            value={toCsv(selector.byNodeTypes)}
                            placeholder="technique, form"
                            onChange={(event) => {
                              const nextNodeTypes = normalizeListLower(event.target.value);
                              setDraftPrograms((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== programIndex) return item;
                                  const include = [...(item.include ?? [])];
                                  const nextSelector = { ...include[selectorIndex], byNodeTypes: nextNodeTypes };
                                  include[selectorIndex] = nextSelector;
                                  return { ...item, include };
                                })
                              );
                            }}
                          />
                        </label>
                        <label className="grid gap-1">
                          <span className="text-xs text-white/50">Work IDs</span>
                          <input
                            type="text"
                            className="input-field"
                            value={toCsv(selector.byWorkIds)}
                            placeholder="id1, id2"
                            onChange={(event) => {
                              const nextIds = normalizeIdList(event.target.value);
                              setDraftPrograms((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== programIndex) return item;
                                  const include = [...(item.include ?? [])];
                                  const nextSelector = { ...include[selectorIndex], byWorkIds: nextIds };
                                  include[selectorIndex] = nextSelector;
                                  return { ...item, include };
                                })
                              );
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white/80">Exclude (OR)</p>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        setDraftPrograms((prev) =>
                          prev.map((item, idx) =>
                            idx === programIndex ? { ...item, exclude: [...(item.exclude ?? []), { ...EMPTY_SELECTOR }] } : item
                          )
                        )
                      }
                    >
                      + Regla
                    </button>
                  </div>

                  {(program.exclude ?? []).length === 0 ? (
                    <p className="text-xs text-white/50">Opcional: excluye coincidencias (útil para pausar cosas).</p>
                  ) : null}

                  {(program.exclude ?? []).map((selector, selectorIndex) => (
                    <div key={`exclude-${program.id}-${selectorIndex}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Regla {selectorIndex + 1}</p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-200 hover:text-rose-100"
                          onClick={() =>
                            setDraftPrograms((prev) =>
                              prev.map((item, idx) =>
                                idx === programIndex
                                  ? { ...item, exclude: (item.exclude ?? []).filter((_, i) => i !== selectorIndex) }
                                  : item
                              )
                            )
                          }
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3">
                        <label className="grid gap-1">
                          <span className="text-xs text-white/50">Tags (AND)</span>
                          <input
                            type="text"
                            className="input-field"
                            value={toCsv(selector.byTags)}
                            placeholder="pause"
                            onChange={(event) => {
                              const nextTags = normalizeListLower(event.target.value);
                              setDraftPrograms((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== programIndex) return item;
                                  const exclude = [...(item.exclude ?? [])];
                                  const nextSelector = { ...exclude[selectorIndex], byTags: nextTags };
                                  exclude[selectorIndex] = nextSelector;
                                  return { ...item, exclude };
                                })
                              );
                            }}
                          />
                        </label>
                        <label className="grid gap-1">
                          <span className="text-xs text-white/50">Node types</span>
                          <input
                            type="text"
                            className="input-field"
                            value={toCsv(selector.byNodeTypes)}
                            placeholder="style"
                            onChange={(event) => {
                              const nextNodeTypes = normalizeListLower(event.target.value);
                              setDraftPrograms((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== programIndex) return item;
                                  const exclude = [...(item.exclude ?? [])];
                                  const nextSelector = { ...exclude[selectorIndex], byNodeTypes: nextNodeTypes };
                                  exclude[selectorIndex] = nextSelector;
                                  return { ...item, exclude };
                                })
                              );
                            }}
                          />
                        </label>
                        <label className="grid gap-1">
                          <span className="text-xs text-white/50">Work IDs</span>
                          <input
                            type="text"
                            className="input-field"
                            value={toCsv(selector.byWorkIds)}
                            placeholder="id1, id2"
                            onChange={(event) => {
                              const nextIds = normalizeIdList(event.target.value);
                              setDraftPrograms((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== programIndex) return item;
                                  const exclude = [...(item.exclude ?? [])];
                                  const nextSelector = { ...exclude[selectorIndex], byWorkIds: nextIds };
                                  exclude[selectorIndex] = nextSelector;
                                  return { ...item, exclude };
                                })
                              );
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setDraftPrograms((prev) => [
                ...prev,
                { id: nanoid(), name: 'Nuevo programa', enabled: false, include: [{ byTags: ['kungfu'] }], exclude: [] }
              ])
            }
          >
            + Añadir programa
          </button>
        </div>
      </section>

      <section className="glass-panel space-y-5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Cadencias</h2>
          <p className="text-sm text-white/60">Objetivo de días por tipo, con overrides por tags.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(draftCadence.targetsDays ?? {})
            .sort(([a], [b]) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
            .map(([key, value]) => (
              <label key={key} className="grid gap-2">
                <span className="text-xs uppercase tracking-wide text-white/40">{key}</span>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={value}
                  onChange={(event) =>
                    setDraftCadence((prev) => ({
                      ...prev,
                      targetsDays: { ...prev.targetsDays, [key]: Number(event.target.value) }
                    }))
                  }
                />
              </label>
            ))}
        </div>

        <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white/80">Overrides</summary>
          <div className="mt-3 space-y-3">
            {(draftCadence.overrides ?? []).map((override, index) => (
              <div key={`override-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Override {index + 1}</p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-200 hover:text-rose-100"
                    onClick={() =>
                      setDraftCadence((prev) => ({ ...prev, overrides: (prev.overrides ?? []).filter((_, i) => i !== index) }))
                    }
                  >
                    Quitar
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-white/50">Tags (ANY)</span>
                    <input
                      type="text"
                      className="input-field"
                      value={toCsv(override.match.tagsAny)}
                      placeholder="weapon"
                      onChange={(event) => {
                        const tagsAny = normalizeListLower(event.target.value);
                        setDraftCadence((prev) => {
                          const overrides = [...(prev.overrides ?? [])];
                          overrides[index] = { ...override, match: { tagsAny } };
                          return { ...prev, overrides };
                        });
                      }}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-white/50">Multiplier</span>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      className="input-field"
                      value={override.multiplier}
                      onChange={(event) => {
                        const multiplier = Number(event.target.value);
                        setDraftCadence((prev) => {
                          const overrides = [...(prev.overrides ?? [])];
                          overrides[index] = { ...override, multiplier };
                          return { ...prev, overrides };
                        });
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setDraftCadence((prev) => ({
                  ...prev,
                  overrides: [...(prev.overrides ?? []), { match: { tagsAny: [] }, multiplier: 1 }]
                }))
              }
            >
              + Añadir override
            </button>
          </div>
        </details>
      </section>
    </div>
  );
}
