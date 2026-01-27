import { useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/store/appStore';
import type {
  KungfuProgram,
  KungfuProgramSelector,
  KungfuCadenceConfig,
  KungfuTodayPlanConfig,
  KungfuPlanGroupConfig,
  KungfuPlanGroupHierarchyRule,
  KungfuPlanGroupStrategy,
  KungfuPlanGroupType,
  KungfuTodayLimitMode
} from '@/types';

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

  const defaultMinutesByNodeType: Record<string, number> = {};
  Object.entries(plan.defaultMinutesByNodeType ?? {}).forEach(([key, value]) => {
    const cleanKey = key.trim().toLowerCase();
    const cleanValue = Number(value);
    if (!cleanKey) return;
    if (!Number.isFinite(cleanValue)) return;
    defaultMinutesByNodeType[cleanKey] = Math.max(0.25, cleanValue);
  });

  const isLimitMode = (value: unknown): value is KungfuTodayLimitMode =>
    value === 'count' || value === 'minutes' || value === 'both';
  const isGroupType = (value: unknown): value is KungfuPlanGroupType => value === 'work' || value === 'note';
  const isStrategy = (value: unknown): value is KungfuPlanGroupStrategy => value === 'overdue' || value === 'weighted';
  const isHierarchy = (value: unknown): value is KungfuPlanGroupHierarchyRule =>
    value === 'allow_all' || value === 'prefer_leaves';

  const normalizeDays = (raw: unknown): number[] => {
    if (!Array.isArray(raw)) return [];
    const days = raw
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .map((value) => Math.round(value))
      .filter((value) => value >= 0 && value <= 6);
    return Array.from(new Set(days)).sort((a, b) => a - b);
  };

  const normalizeGroupDraft = (group: KungfuPlanGroupConfig, fallbackOrder: number): KungfuPlanGroupConfig => {
    const id = (group.id ?? '').trim() || nanoid();
    const type = isGroupType(group.type) ? group.type : 'work';
    const enabled = typeof group.enabled === 'boolean' ? group.enabled : true;
    const order = Number.isFinite(Number(group.order)) ? Number(group.order) : fallbackOrder;
    const name = (group.name ?? '').trim() || (type === 'note' ? 'Recap' : 'Grupo');
    const limitMode = isLimitMode(group.limitMode) ? group.limitMode : 'minutes';
    const maxItems = Number.isFinite(Number(group.maxItems)) ? Math.max(0, Math.round(Number(group.maxItems))) : undefined;
    const minutesBudget = Number.isFinite(Number(group.minutesBudget)) ? Math.max(0, Number(group.minutesBudget)) : undefined;
    const strategy = isStrategy(group.strategy) ? group.strategy : 'overdue';
    const hierarchyRule = isHierarchy(group.hierarchyRule) ? group.hierarchyRule : 'allow_all';

    const include = (group.include ?? []).map(normalizeSelectorDraft).filter((selector) => Object.keys(selector).length > 0);
    const exclude = (group.exclude ?? []).map(normalizeSelectorDraft).filter((selector) => Object.keys(selector).length > 0);

    return {
      id,
      name,
      enabled,
      order,
      type,
      daysOfWeek: normalizeDays(group.daysOfWeek),
      limitMode,
      maxItems,
      minutesBudget,
      strategy,
      hierarchyRule,
      include,
      exclude
    };
  };

  const baseGroups =
    (plan.groups ?? []).length > 0
      ? (plan.groups ?? [])
      : ([
          {
            id: 'formas',
            name: 'Formas',
            enabled: true,
            order: 1,
            type: 'work',
            limitMode: 'minutes',
            minutesBudget: 18,
            strategy: 'overdue',
            hierarchyRule: 'prefer_leaves',
            include: [{ byNodeTypes: ['segment', 'form'] }],
            exclude: []
          },
          {
            id: 'tecnicas',
            name: 'Técnicas',
            enabled: true,
            order: 2,
            type: 'work',
            limitMode: 'minutes',
            minutesBudget: 10,
            strategy: 'weighted',
            hierarchyRule: 'allow_all',
            include: [{ byNodeTypes: ['technique'] }, { byTags: ['roulette'] }],
            exclude: []
          },
          {
            id: 'recap',
            name: 'Recap',
            enabled: true,
            order: 99,
            type: 'note',
            limitMode: 'minutes',
            minutesBudget: 2
          }
        ] as KungfuPlanGroupConfig[]);

  const normalizedGroups = baseGroups
    .map((group, index) => normalizeGroupDraft(group, index + 1))
    .sort((a, b) => a.order - b.order)
    .map((group, index) => ({ ...group, order: index + 1 }));

  const workGroups = normalizedGroups.filter((group) => (group.type ?? 'work') !== 'note');
  const noteGroups = normalizedGroups.filter((group) => group.type === 'note');
  const focusMinutes = Math.max(0, Number(workGroups[0]?.minutesBudget) || 0);
  const rouletteMinutes = Math.max(0, Number(workGroups[1]?.minutesBudget) || 0);
  const recapMinutes = Math.max(0, Number(noteGroups[0]?.minutesBudget) || 0);
  const totalMinutes = Math.max(0, focusMinutes + rouletteMinutes + recapMinutes);

  return {
    limitMode: plan.limitMode,
    maxItems,
    minutesBudget,
    template: { totalMinutes, focusMinutes, rouletteMinutes, recapMinutes },
    defaultMinutesByNodeType,
    focusSelectors: [],
    rouletteSelectors: [],
    groups: normalizedGroups
  };
}

const EMPTY_SELECTOR: KungfuProgramSelector = {};

const DAY_OPTIONS: Array<{ label: string; value: number }> = [
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
  { label: 'D', value: 0 }
];

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

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Grupos</h3>
              <p className="text-sm text-white/60">Define bloques con reglas, días de la semana y límites.</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setDraftTodayPlan((prev) => {
                  const ordered = [...(prev.groups ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                  const nextGroup: KungfuPlanGroupConfig = {
                    id: nanoid(),
                    name: 'Nuevo grupo',
                    enabled: true,
                    order: ordered.length + 1,
                    type: 'work',
                    daysOfWeek: [],
                    limitMode: 'minutes',
                    maxItems: 12,
                    minutesBudget: 5,
                    strategy: 'overdue',
                    hierarchyRule: 'allow_all',
                    include: [],
                    exclude: []
                  };
                  const next = [...ordered, nextGroup].map((group, index) => ({ ...group, order: index + 1 }));
                  return { ...prev, groups: next };
                })
              }
            >
              + Grupo
            </button>
          </div>

          <div className="space-y-4">
            {[...(draftTodayPlan.groups ?? [])]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((group, index, list) => {
                const groupType: KungfuPlanGroupType = (group.type ?? 'work') as KungfuPlanGroupType;
                const days = group.daysOfWeek ?? [];
                const isAllDays = days.length === 0;
                const limitMode = (group.limitMode ?? 'minutes') as KungfuTodayLimitMode;
                const strategy = (group.strategy ?? 'overdue') as KungfuPlanGroupStrategy;
                const hierarchyRule = (group.hierarchyRule ?? 'allow_all') as KungfuPlanGroupHierarchyRule;

                const updateGroup = (patch: Partial<KungfuPlanGroupConfig>) => {
                  setDraftTodayPlan((prev) => {
                    const ordered = [...(prev.groups ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    const next = ordered
                      .map((item) => (item.id === group.id ? { ...item, ...patch } : item))
                      .map((item, idx) => ({ ...item, order: idx + 1 }));
                    return { ...prev, groups: next };
                  });
                };

                const moveGroup = (direction: -1 | 1) => {
                  setDraftTodayPlan((prev) => {
                    const ordered = [...(prev.groups ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    const from = ordered.findIndex((item) => item.id === group.id);
                    const to = from + direction;
                    if (from < 0 || to < 0 || to >= ordered.length) return prev;
                    const next = ordered.slice();
                    const temp = next[from];
                    next[from] = next[to];
                    next[to] = temp;
                    return { ...prev, groups: next.map((item, idx) => ({ ...item, order: idx + 1 })) };
                  });
                };

                const removeGroup = () => {
                  setDraftTodayPlan((prev) => {
                    const ordered = [...(prev.groups ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    const next = ordered.filter((item) => item.id !== group.id).map((item, idx) => ({ ...item, order: idx + 1 }));
                    return { ...prev, groups: next.length > 0 ? next : prev.groups };
                  });
                };

                const updateSelectorList = (
                  key: 'include' | 'exclude',
                  updater: (prevList: KungfuProgramSelector[]) => KungfuProgramSelector[]
                ) => {
                  const current = (group[key] ?? []) as KungfuProgramSelector[];
                  updateGroup({ [key]: updater(current) } as Partial<KungfuPlanGroupConfig>);
                };

                return (
                  <div key={group.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="inline-flex items-center gap-2 text-sm text-white/70">
                            <input
                              type="checkbox"
                              className="accent-sky-400"
                              checked={group.enabled}
                              onChange={(event) => updateGroup({ enabled: event.target.checked })}
                            />
                            Enabled
                          </label>
                          <input
                            type="text"
                            className="input-field flex-1"
                            value={group.name}
                            onChange={(event) => updateGroup({ name: event.target.value })}
                            placeholder="Nombre del grupo"
                          />
                          <select
                            className="input-field w-36"
                            value={groupType}
                            onChange={(event) => updateGroup({ type: event.target.value as KungfuPlanGroupType })}
                          >
                            <option value="work">Trabajos</option>
                            <option value="note">Nota</option>
                          </select>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Días</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                className={clsx(
                                  'rounded-full border px-3 py-1 text-xs font-semibold transition',
                                  isAllDays
                                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                                    : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                                )}
                                onClick={() => updateGroup({ daysOfWeek: [] })}
                                title="Vacío = todos los días"
                              >
                                Todos
                              </button>
                              {DAY_OPTIONS.map((day) => {
                                const active = isAllDays ? true : days.includes(day.value);
                                return (
                                  <button
                                    key={day.value}
                                    type="button"
                                    className={clsx(
                                      'h-8 w-8 rounded-full border text-xs font-semibold transition',
                                      active
                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                                        : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                                    )}
                                    onClick={() => {
                                      const next = isAllDays ? [day.value] : days.includes(day.value) ? days.filter((d) => d !== day.value) : [...days, day.value];
                                      updateGroup({ daysOfWeek: next.sort((a, b) => a - b) });
                                    }}
                                    title={active ? 'Activo' : 'Inactivo'}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-white/50">Si eliges días específicos, solo aparecerá esos días.</p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <label className="grid gap-1">
                              <span className="text-xs uppercase tracking-wide text-white/40">Límite</span>
                              <select
                                className="input-field"
                                value={limitMode}
                                onChange={(event) => updateGroup({ limitMode: event.target.value as KungfuTodayLimitMode })}
                              >
                                <option value="count">Cantidad</option>
                                <option value="minutes">Minutos</option>
                                <option value="both">Ambos</option>
                              </select>
                            </label>
                            <label className="grid gap-1">
                              <span className="text-xs uppercase tracking-wide text-white/40">Máx ítems</span>
                              <input
                                type="number"
                                min={0}
                                className="input-field"
                                value={group.maxItems ?? 0}
                                onChange={(event) => updateGroup({ maxItems: Number(event.target.value) })}
                              />
                            </label>
                            <label className="grid gap-1">
                              <span className="text-xs uppercase tracking-wide text-white/40">Máx min</span>
                              <input
                                type="number"
                                min={0}
                                className="input-field"
                                value={group.minutesBudget ?? 0}
                                onChange={(event) => updateGroup({ minutesBudget: Number(event.target.value) })}
                              />
                            </label>
                          </div>
                        </div>

                        {groupType === 'work' ? (
                          <div className="mt-2 grid gap-4 lg:grid-cols-2">
                            <label className="grid gap-1">
                              <span className="text-xs uppercase tracking-wide text-white/40">Estrategia</span>
                              <select
                                className="input-field"
                                value={strategy}
                                onChange={(event) => updateGroup({ strategy: event.target.value as KungfuPlanGroupStrategy })}
                              >
                                <option value="overdue">Vencido (cadencia)</option>
                                <option value="weighted">Ponderado (ruleta)</option>
                              </select>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white/70">
                              <input
                                type="checkbox"
                                className="accent-sky-400"
                                checked={hierarchyRule === 'prefer_leaves'}
                                onChange={(event) =>
                                  updateGroup({
                                    hierarchyRule: (event.target.checked ? 'prefer_leaves' : 'allow_all') as KungfuPlanGroupHierarchyRule
                                  })
                                }
                              />
                              Preferir hijos (evita padres cuando existan)
                            </label>
                          </div>
                        ) : null}

                        {groupType === 'work' ? (
                          <div className="mt-4 grid gap-5 lg:grid-cols-2">
                            {(['include', 'exclude'] as const).map((bucket) => (
                              <div key={`${group.id}-${bucket}`} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-white/80">
                                    {bucket === 'include' ? 'Include (OR)' : 'Exclude (OR)'}
                                  </p>
                                  <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => updateSelectorList(bucket, (prevList) => [...prevList, { ...EMPTY_SELECTOR }])}
                                  >
                                    + Regla
                                  </button>
                                </div>

                                {(group[bucket] ?? []).length === 0 ? (
                                  <p className="text-xs text-white/50">
                                    {bucket === 'include' ? 'Vacío = incluye todo (se aplican excludes).' : 'Vacío = no excluye nada.'}
                                  </p>
                                ) : null}

                                {(group[bucket] ?? []).map((selector, selectorIndex) => (
                                  <div
                                    key={`${bucket}-${group.id}-${selectorIndex}`}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                                        Regla {selectorIndex + 1}
                                      </p>
                                      <button
                                        type="button"
                                        className="text-xs font-semibold text-rose-200 hover:text-rose-100"
                                        onClick={() =>
                                          updateSelectorList(bucket, (prevList) => prevList.filter((_, i) => i !== selectorIndex))
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
                                          placeholder="kungfu, bei-shaolin"
                                          onChange={(event) => {
                                            const nextTags = normalizeListLower(event.target.value);
                                            updateSelectorList(bucket, (prevList) => {
                                              const nextList = [...prevList];
                                              nextList[selectorIndex] = { ...nextList[selectorIndex], byTags: nextTags };
                                              return nextList;
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
                                          placeholder="segment, form"
                                          onChange={(event) => {
                                            const nextNodeTypes = normalizeListLower(event.target.value);
                                            updateSelectorList(bucket, (prevList) => {
                                              const nextList = [...prevList];
                                              nextList[selectorIndex] = { ...nextList[selectorIndex], byNodeTypes: nextNodeTypes };
                                              return nextList;
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
                                            updateSelectorList(bucket, (prevList) => {
                                              const nextList = [...prevList];
                                              nextList[selectorIndex] = { ...nextList[selectorIndex], byWorkIds: nextIds };
                                              return nextList;
                                            });
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => moveGroup(-1)}
                          disabled={index === 0}
                          title="Subir"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => moveGroup(1)}
                          disabled={index === list.length - 1}
                          title="Bajar"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={removeGroup}
                          disabled={list.length <= 1}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
