import { Fragment, useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import clsx from 'clsx';
import { Link, useSearchParams } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';

import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/contexts/useAuth';
import { SessionEditor } from '@/components/SessionEditor';
import { SessionWorkViewCard } from '@/components/SessionWorkViewCard';
import type {
  KungfuProgramSelector,
  KungfuCadenceConfig,
  KungfuTodayPlanConfig,
  KungfuPlanGroupConfig,
  KungfuPlanGroupHierarchyRule,
  KungfuPlanGroupStrategy,
  KungfuPlanGroupType,
  Work,
  WorkSchedule,
  Session,
  SessionWork
} from '@/types';

dayjs.locale('es');

type TrainingResult = NonNullable<SessionWork['result']>;
type Mode = 'view' | 'edit';

const PERSONAL_EXCLUDE_TAG = 'personal-exclude';

const RESULT_LABELS: Record<TrainingResult, string> = {
  ok: 'OK',
  doubt: 'Dudosa',
  fail: 'Fallo'
};

const RESULT_STYLES: Record<TrainingResult, string> = {
  ok: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-100 hover:border-emerald-400',
  doubt: 'border-amber-400/40 bg-amber-500/10 text-amber-200 hover:border-amber-300',
  fail: 'border-rose-500/50 bg-rose-500/10 text-rose-200 hover:border-rose-400'
};

function normalizeTags(tags: string[] | undefined): string[] {
  return Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
    )
  );
}

function matchesSelector(work: Work, selector: KungfuProgramSelector): boolean {
  const tags = normalizeTags(work.tags);
  const nodeType = work.nodeType ?? 'work';

  if (selector.byWorkIds && selector.byWorkIds.length > 0) {
    if (!selector.byWorkIds.includes(work.id)) return false;
  }

  if (selector.byNodeTypes && selector.byNodeTypes.length > 0) {
    if (!selector.byNodeTypes.includes(nodeType)) return false;
  }

  if (selector.byTags && selector.byTags.length > 0) {
    const needle = selector.byTags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    if (!needle.every((tag) => tags.includes(tag))) return false;
  }

  return true;
}

function getTargetDays(work: Work, cadence: KungfuCadenceConfig): number {
  const nodeType = work.nodeType ?? 'work';
  const base = cadence.targetsDays[nodeType] ?? cadence.targetsDays.work ?? 7;
  const tags = normalizeTags(work.tags);

  const multiplier = (cadence.overrides ?? []).reduce((acc, override) => {
    const tagsAny = override.match?.tagsAny?.map((tag) => tag.trim().toLowerCase()).filter(Boolean) ?? [];
    if (tagsAny.length === 0) return acc;
    const matches = tagsAny.some((tag) => tags.includes(tag));
    return matches ? acc * (override.multiplier || 1) : acc;
  }, 1);

  const adjusted = Math.max(1, Math.round(base * multiplier));
  return adjusted;
}

function isTrainableWork(work: Work): boolean {
  const nodeType = (work.nodeType ?? '').trim().toLowerCase();
  if (nodeType === 'style') return false;
  return true;
}

function estimateWorkMinutes(work: Work, config: KungfuTodayPlanConfig): number {
  const explicit = typeof work.estimatedMinutes === 'number' ? work.estimatedMinutes : 0;
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const nodeType = (work.nodeType ?? 'work').trim().toLowerCase() || 'work';
  const fallback = config.defaultMinutesByNodeType[nodeType] ?? config.defaultMinutesByNodeType.work ?? 3;
  return Math.max(0.25, Number(fallback) || 3);
}

function dayOfYear(date: dayjs.Dayjs): number {
  return date.startOf('day').diff(date.startOf('year'), 'day') + 1;
}

function scheduleMatchesDate(schedule: WorkSchedule, todayIso: string): boolean {
  const date = dayjs(todayIso);
  const number = Math.trunc(Number(schedule.number));
  if (!Number.isFinite(number)) return false;
  switch (schedule.kind) {
    case 'day_of_year':
      return dayOfYear(date) === number;
    case 'day_of_month':
      return date.date() === number;
    case 'day_of_week':
      return date.day() === number;
    default:
      return false;
  }
}

function getPlanGroups(plan: KungfuTodayPlanConfig): KungfuPlanGroupConfig[] {
  const groups = plan.groups ?? [];
  if (groups.length > 0) {
    return [...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const focusMinutes = Math.max(0, Number(plan.template?.focusMinutes) || 18);
  const rouletteMinutes = Math.max(0, Number(plan.template?.rouletteMinutes) || 10);
  const recapMinutes = Math.max(0, Number(plan.template?.recapMinutes) || 0);
  const focusSelectors = plan.focusSelectors ?? [];
  const rouletteSelectors = plan.rouletteSelectors ?? [];

  const focusInclude = focusSelectors.length > 0 ? focusSelectors : [{ byNodeTypes: ['segment', 'form'] }];
  const rouletteInclude =
    rouletteSelectors.length > 0 ? rouletteSelectors : [{ byNodeTypes: ['technique'] }, { byTags: ['roulette'] }];

  const legacyGroups: KungfuPlanGroupConfig[] = [
    {
      id: 'formas',
      name: 'Formas',
      enabled: true,
      order: 1,
      type: 'work',
      limitMode: 'minutes',
      minutesBudget: focusMinutes,
      strategy: 'overdue',
      hierarchyRule: 'prefer_leaves',
      include: focusInclude,
      exclude: []
    },
    {
      id: 'tecnicas',
      name: 'Técnicas',
      enabled: true,
      order: 2,
      type: 'work',
      limitMode: 'minutes',
      minutesBudget: rouletteMinutes,
      strategy: 'weighted',
      hierarchyRule: 'allow_all',
      include: rouletteInclude,
      exclude: []
    }
  ];

  if (recapMinutes > 0) {
    legacyGroups.push({
      id: 'recap',
      name: 'Recap',
      enabled: true,
      order: 99,
      type: 'note',
      limitMode: 'minutes',
      minutesBudget: recapMinutes
    });
  }

  return legacyGroups;
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

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedShuffle<T>(items: T[], weight: (item: T) => number, seedLabel: string): T[] {
  const random = mulberry32(fnv1a32(seedLabel));
  return items
    .map((item) => {
      const w = Math.max(0.0001, weight(item));
      const r = Math.max(1e-9, random());
      const score = -Math.log(r) / w;
      return { item, score };
    })
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}

type HistoryEntry = {
  date: string;
  result?: SessionWork['result'];
  effort?: number;
};

function buildHistory(personalSessions: Session[]): Map<string, HistoryEntry> {
  const history = new Map<string, HistoryEntry>();
  personalSessions.forEach((session) => {
    session.workItems.forEach((item) => {
      const trained = (item.completed ?? false) || typeof item.result !== 'undefined';
      if (!trained) return;
      const existing = history.get(item.workId);
      if (!existing || dayjs(session.date).isAfter(existing.date)) {
        history.set(item.workId, { date: session.date, result: item.result, effort: item.effort });
      }
    });
  });
  return history;
}

type DueWork = {
  work: Work;
  targetDays: number;
  lastSeen?: string;
  daysSince?: number;
  overdueScore: number;
  lastResult?: SessionWork['result'];
};

type PlannedSelection = {
  groups: Array<{
    group: KungfuPlanGroupConfig;
    items: DueWork[];
    plannedMinutes: number;
  }>;
  plannedMinutes: {
    work: number;
    reserved: number;
    total: number;
  };
  totalItems: number;
};

function computeDueList(opts: {
  works: Work[];
  personalSessions: Session[];
  cadence: KungfuCadenceConfig;
  today: string;
}): DueWork[] {
  const { works, personalSessions, cadence, today } = opts;
  const history = buildHistory(personalSessions);

  return works
    .filter((work) => isTrainableWork(work))
    .filter((work) => {
      const nodeType = (work.nodeType ?? '').trim().toLowerCase();
      if (nodeType !== 'reading') return true;
      if (!work.schedule) return true;
      return scheduleMatchesDate(work.schedule, today);
    })
    .filter((work) => !normalizeTags(work.tags).includes(PERSONAL_EXCLUDE_TAG))
    .map((work) => {
      const entry = history.get(work.id);
      const targetDays = getTargetDays(work, cadence);
      if (!entry) {
        return {
          work,
          targetDays,
          overdueScore: 10_000
        };
      }
      const daysSince = Math.max(dayjs(today).diff(dayjs(entry.date), 'day'), 0);
      const overdue = Math.max(daysSince - targetDays, 0);
      return {
        work,
        targetDays,
        lastSeen: entry.date,
        daysSince,
        overdueScore: overdue,
        lastResult: entry.result
      };
    })
    .sort((a, b) => {
      if (b.overdueScore !== a.overdueScore) return b.overdueScore - a.overdueScore;
      const aDays = a.daysSince ?? 10_000;
      const bDays = b.daysSince ?? 10_000;
      if (bDays !== aDays) return bDays - aDays;
      return a.work.name.localeCompare(b.work.name, 'es', { sensitivity: 'base' });
    });
}

function formatLastSeen(lastSeen?: string) {
  if (!lastSeen) return 'Nunca';
  const date = dayjs(lastSeen);
  return date.format('D MMM YYYY');
}

function computePlan(opts: {
  dueList: DueWork[];
  todaySession?: Session;
  plan: KungfuTodayPlanConfig;
  today: string;
  childCountByWorkId: Map<string, number>;
}): PlannedSelection {
  const { dueList, todaySession, plan, today, childCountByWorkId } = opts;
  const limitByCount = plan.limitMode === 'count' || plan.limitMode === 'both';
  const limitByMinutes = plan.limitMode === 'minutes' || plan.limitMode === 'both';

  const maxItemsTotal = limitByCount ? Math.max(1, Math.round(plan.maxItems || 12)) : Number.POSITIVE_INFINITY;
  const minutesBudgetTotal = limitByMinutes ? Math.max(0, Number(plan.minutesBudget) || 0) : Number.POSITIVE_INFINITY;

  const trainedToday = new Set(
    (todaySession?.workItems ?? [])
      .filter((item) => (item.completed ?? false) || typeof item.result !== 'undefined')
      .map((item) => item.workId)
  );

  const available = dueList.filter((entry) => !trainedToday.has(entry.work.id));
  const todayDow = dayjs(today).day();
  const groups = getPlanGroups(plan)
    .filter((group) => group.enabled)
    .filter((group) => {
      const days = group.daysOfWeek ?? [];
      return days.length === 0 || days.includes(todayDow);
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const reservedMinutes = groups
    .filter((group) => (group.type ?? 'work') === 'note')
    .reduce((acc, group) => {
      const groupLimitByMinutes = group.limitMode === 'minutes' || group.limitMode === 'both';
      if (!groupLimitByMinutes) return acc;
      return acc + Math.max(0, Number(group.minutesBudget) || 0);
    }, 0);

  const minutesBudgetForWork = Number.isFinite(minutesBudgetTotal)
    ? Math.max(0, minutesBudgetTotal - reservedMinutes)
    : Number.POSITIVE_INFINITY;

  const seedLabel = `kungfu-${today}`;

  const weightForWeighted = (entry: DueWork) => {
    const base = entry.overdueScore >= 10_000 ? 1000 : Math.max(0, entry.overdueScore + 1);
    if (entry.lastResult === 'fail') return base * 1.6;
    if (entry.lastResult === 'doubt') return base * 1.25;
    return base;
  };

  const minutesForEntry = (entry: DueWork) => estimateWorkMinutes(entry.work, plan);

  const nodeTypeRank = (work: Work): number => {
    const nodeType = (work.nodeType ?? 'work').trim().toLowerCase() || 'work';
    const rankMap: Record<string, number> = {
      segment: 30,
      drill: 22,
      form: 20,
      work: 10,
      application: 0,
      technique: 0,
      link: 0,
      style: -100
    };
    return rankMap[nodeType] ?? 5;
  };

  const sortByOverdue = (list: DueWork[]) =>
    [...list].sort((a, b) => {
      if (b.overdueScore !== a.overdueScore) return b.overdueScore - a.overdueScore;
      const aDays = a.daysSince ?? 10_000;
      const bDays = b.daysSince ?? 10_000;
      if (bDays !== aDays) return bDays - aDays;
      const rankDelta = nodeTypeRank(b.work) - nodeTypeRank(a.work);
      if (rankDelta !== 0) return rankDelta;
      return a.work.name.localeCompare(b.work.name, 'es', { sensitivity: 'base' });
    });

  const assigned = new Set<string>();
  const plannedGroups: PlannedSelection['groups'] = [];
  let plannedWorkMinutes = 0;
  let plannedItems = 0;

  for (const group of groups) {
    const groupType: KungfuPlanGroupType = (group.type ?? 'work') as KungfuPlanGroupType;
    if (groupType === 'note') {
      plannedGroups.push({ group, items: [], plannedMinutes: 0 });
      continue;
    }

    const includeRules = group.include ?? [];
    const excludeRules = group.exclude ?? [];

    let pool = available.filter((entry) => {
      if (assigned.has(entry.work.id)) return false;
      const included = includeRules.length === 0 ? true : includeRules.some((selector) => matchesSelector(entry.work, selector));
      if (!included) return false;
      const excluded = excludeRules.some((selector) => matchesSelector(entry.work, selector));
      return !excluded;
    });

    const hierarchyRule: KungfuPlanGroupHierarchyRule = (group.hierarchyRule ?? 'allow_all') as KungfuPlanGroupHierarchyRule;
    if (hierarchyRule === 'prefer_leaves') {
      const parentIds = new Set(pool.map((entry) => entry.work.parentWorkId).filter(Boolean) as string[]);
      pool = pool.filter((entry) => {
        if (!parentIds.has(entry.work.id)) return true;
        return (childCountByWorkId.get(entry.work.id) ?? 0) === 0;
      });
    }

    const strategy: KungfuPlanGroupStrategy = (group.strategy ?? 'overdue') as KungfuPlanGroupStrategy;
    const ordered =
      strategy === 'weighted'
        ? weightedShuffle(pool, weightForWeighted, `${seedLabel}-${group.id}`)
        : sortByOverdue(pool);

    const groupLimitMode = group.limitMode ?? 'minutes';
    const groupLimitByCount = groupLimitMode === 'count' || groupLimitMode === 'both';
    const groupLimitByMinutes = groupLimitMode === 'minutes' || groupLimitMode === 'both';

    const groupMaxItemsRaw = Number(group.maxItems);
    const groupMaxItems = groupLimitByCount
      ? Number.isFinite(groupMaxItemsRaw) && groupMaxItemsRaw > 0
        ? Math.round(groupMaxItemsRaw)
        : Number.POSITIVE_INFINITY
      : Number.POSITIVE_INFINITY;

    const groupMinutesBudgetRaw = Number(group.minutesBudget);
    const groupMinutesBudget = groupLimitByMinutes
      ? Number.isFinite(groupMinutesBudgetRaw)
        ? Math.max(0, groupMinutesBudgetRaw)
        : Number.POSITIVE_INFINITY
      : Number.POSITIVE_INFINITY;

    const items: DueWork[] = [];
    let groupMinutes = 0;

    for (const entry of ordered) {
      if (plannedItems >= maxItemsTotal) break;
      if (items.length >= groupMaxItems) break;
      const minutes = minutesForEntry(entry);
      if (groupMinutes + minutes > groupMinutesBudget) continue;
      if (plannedWorkMinutes + minutes > minutesBudgetForWork) continue;

      items.push(entry);
      groupMinutes += minutes;
      plannedWorkMinutes += minutes;
      plannedItems += 1;
      assigned.add(entry.work.id);
      if (limitByMinutes && plannedWorkMinutes >= minutesBudgetForWork) break;
    }

    plannedGroups.push({ group, items, plannedMinutes: Math.round(groupMinutes * 10) / 10 });
    if (plannedItems >= maxItemsTotal) break;
    if (limitByMinutes && plannedWorkMinutes >= minutesBudgetForWork) break;
  }

  const plannedTotalMinutes = Math.round((plannedWorkMinutes + reservedMinutes) * 10) / 10;

  return {
    groups: plannedGroups,
    plannedMinutes: {
      work: Math.round(plannedWorkMinutes * 10) / 10,
      reserved: Math.round(reservedMinutes * 10) / 10,
      total: plannedTotalMinutes
    },
    totalItems: plannedItems
  };
}

export default function PersonalTodayView() {
  const works = useAppStore((state) => state.works);
  const sessions = useAppStore((state) => state.sessions);
  const plans = useAppStore((state) => state.plans);
  const objectives = useAppStore((state) => state.objectives);
  const assistants = useAppStore((state) => state.assistants);
  const cadenceFallback = useAppStore((state) => state.kungfuCadence);
  const todayPlanFallback = useAppStore((state) => state.kungfuTodayPlan);

  useAuth();

  const addSession = useAppStore((state) => state.addSession);
  const addWorkToSession = useAppStore((state) => state.addWorkToSession);
  const updateSessionWorkDetails = useAppStore((state) => state.updateSessionWorkDetails);
  const updateSessionWorkItems = useAppStore((state) => state.updateSessionWorkItems);
  const updateSession = useAppStore((state) => state.updateSession);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlanIdParam = (searchParams.get('plan') ?? '').trim();

  const todayIso = dayjs().format('YYYY-MM-DD');
  const dateParam = (searchParams.get('date') ?? '').trim();
  const activeDate = dayjs(dateParam, 'YYYY-MM-DD', true).isValid() ? dateParam : todayIso;
  const mode: Mode = searchParams.get('mode') === 'edit' ? 'edit' : 'view';

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

  useEffect(() => {
    const shouldSetDate = !dayjs(dateParam, 'YYYY-MM-DD', true).isValid();
    if (!shouldSetDate) return;
    const next = new URLSearchParams(searchParams);
    next.set('date', activeDate);
    setSearchParams(next, { replace: true });
  }, [activeDate, dateParam, searchParams, setSearchParams]);

  const cadence = selectedPlan?.cadence ?? cadenceFallback;
  const todayPlan = selectedPlan?.todayPlan ?? todayPlanFallback;

  const personalSessions = useMemo(
    () =>
      sessions.filter(
        (session) => session.kind === 'personal' && (session.planId ?? 'personal-kungfu') === selectedPlanId
      ),
    [sessions, selectedPlanId]
  );

  const activeSession = useMemo(
    () => personalSessions.find((session) => session.date === activeDate),
    [personalSessions, activeDate]
  );

  const dueList = useMemo(
    () =>
      computeDueList({
        works,
        personalSessions,
        cadence,
        today: activeDate
      }),
    [works, personalSessions, cadence, activeDate]
  );

  const childCountByWorkId = useMemo(() => {
    const counts = new Map<string, number>();
    works.forEach((work) => {
      const parentId = work.parentWorkId ?? '';
      if (!parentId) return;
      counts.set(parentId, (counts.get(parentId) ?? 0) + 1);
    });
    return counts;
  }, [works]);

  const worksById = useMemo(() => new Map(works.map((work) => [work.id, work])), [works]);
  const objectiveById = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [expandedWorkDetails, setExpandedWorkDetails] = useState<Set<string>>(new Set());

  const ensureSession = useCallback(
    (dateIso?: string): Session => {
      const key = (dateIso ?? activeDate).trim() || activeDate;
      const existing = personalSessions.find((session) => session.date === key);
      if (existing) return existing;
    return addSession({
      date: key,
      kind: 'personal',
      planId: selectedPlanId,
      title: selectedPlan?.name ?? 'Entrenamiento personal',
      description: '',
      notes: ''
    });
    },
    [activeDate, addSession, personalSessions, selectedPlan?.name, selectedPlanId]
  );

  const dedupeSessionWorkItems = useCallback((items: SessionWork[]): SessionWork[] => {
    const ordered = (items ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const byWorkId = new Map<string, SessionWork>();
    const orderKeys: string[] = [];

    ordered.forEach((item) => {
      const workId = item.workId;
      if (!workId) return;
      const existing = byWorkId.get(workId);
      if (!existing) {
        byWorkId.set(workId, { ...item });
        orderKeys.push(workId);
        return;
      }

      const merged: SessionWork = {
        ...existing,
        customDescriptionMarkdown: existing.customDescriptionMarkdown ?? item.customDescriptionMarkdown,
        customDurationMinutes: existing.customDurationMinutes ?? item.customDurationMinutes,
        notes: existing.notes ?? item.notes,
        focusLabel: existing.focusLabel ?? item.focusLabel,
        completed: Boolean(existing.completed ?? false) || Boolean(item.completed ?? false),
        result: existing.result ?? item.result,
        effort: existing.effort ?? item.effort
      };

      byWorkId.set(workId, merged);
    });

    return orderKeys.map((workId, index) => ({ ...byWorkId.get(workId)!, order: index }));
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const items = activeSession.workItems ?? [];
    const workIdCounts = items.reduce((acc, item) => {
      const workId = item.workId;
      if (!workId) return acc;
      acc.set(workId, (acc.get(workId) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());

    const hasDuplicates = Array.from(workIdCounts.values()).some((count) => count > 1);
    if (!hasDuplicates) return;

    const deduped = dedupeSessionWorkItems(items);
    if (deduped.length === items.length) return;
    updateSessionWorkItems(activeSession.id, deduped);
  }, [activeSession, updateSessionWorkItems, dedupeSessionWorkItems]);

  const activeGroupsForToday = useMemo(() => {
    const todayDow = dayjs(activeDate).day();
    return getPlanGroups(todayPlan)
      .filter((group) => group.enabled)
      .filter((group) => {
        const days = group.daysOfWeek ?? [];
        return days.length === 0 || days.includes(todayDow);
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [todayPlan, activeDate]);

  useEffect(() => {
    const next: Record<string, string> = {};
    const fromSession = activeSession?.notesByGroupId ?? undefined;
    if (fromSession) {
      Object.entries(fromSession).forEach(([key, value]) => {
        const cleanKey = (key ?? '').trim();
        if (!cleanKey) return;
        next[cleanKey] = String(value ?? '');
      });
    }
    const legacy = (activeSession?.notes ?? '').toString();
    if (legacy.trim().length > 0) {
      const firstNoteGroupId =
        activeGroupsForToday.find((group) => (group.type ?? 'work') === 'note')?.id ?? 'note';
      if (!next[firstNoteGroupId]) {
        next[firstNoteGroupId] = legacy;
      }
    }
    setNoteDrafts(next);
  }, [activeSession?.notes, activeSession?.notesByGroupId, activeGroupsForToday]);

  const groupOrderByLabel = useMemo(() => {
    const map = new Map<string, number>();
    activeGroupsForToday
      .filter((group) => (group.type ?? 'work') !== 'note')
      .forEach((group, index) => {
        map.set(group.name, index);
      });
    return map;
  }, [activeGroupsForToday]);

  const getGroupLabelForWork = useCallback(
    (work: Work): string => {
      const groups = activeGroupsForToday.filter((group) => (group.type ?? 'work') !== 'note');
      for (const group of groups) {
        const includeRules = group.include ?? [];
        const excludeRules = group.exclude ?? [];
        const included =
          includeRules.length === 0 ? true : includeRules.some((selector) => matchesSelector(work, selector));
        if (!included) continue;
        const excluded = excludeRules.some((selector) => matchesSelector(work, selector));
        if (excluded) continue;
        return group.name;
      }
      return 'Hoy';
    },
    [activeGroupsForToday]
  );

  const activeWorkGroupNames = useMemo(() => {
    return new Set(
      activeGroupsForToday
        .filter((group) => (group.type ?? 'work') !== 'note')
        .map((group) => group.name)
        .filter(Boolean)
    );
  }, [activeGroupsForToday]);

  const resolveGroupLabelForItem = useCallback(
    (item: { focusLabel?: string }, work: Work) => {
      const current = (item.focusLabel ?? '').trim();
      if (current && activeWorkGroupNames.has(current)) return current;
      return getGroupLabelForWork(work);
    },
    [activeWorkGroupNames, getGroupLabelForWork]
  );

  const buildNextSessionWorkItems = useCallback(
    (sessionId: string) => {
      const freshSession = useAppStore.getState().sessions.find((s) => s.id === sessionId);
      if (!freshSession) return null;

      const nextItems = (freshSession.workItems ?? []).map((item) => {
        const work = worksById.get(item.workId);
        if (!work) return item;
        const resolved = resolveGroupLabelForItem(item, work);
        if (resolved === item.focusLabel) return item;
        return { ...item, focusLabel: resolved };
      });

      nextItems.sort((a, b) => {
        const labelA = a.focusLabel ?? 'Hoy';
        const labelB = b.focusLabel ?? 'Hoy';
        const orderA = groupOrderByLabel.get(labelA) ?? 999;
        const orderB = groupOrderByLabel.get(labelB) ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.order ?? 0) - (b.order ?? 0);
      });

      return nextItems;
    },
    [groupOrderByLabel, worksById, resolveGroupLabelForItem]
  );

  const [isFillingPlan, setIsFillingPlan] = useState(false);

  const fillTodayPlan = useCallback(
    (opts?: { reason?: string; includeDiagnostics?: boolean }) => {
      if (isFillingPlan) return;
      if (dueList.length === 0) return;

      setIsFillingPlan(true);
      try {
        const session = activeSession ?? ensureSession();

        const itemsBefore = session.workItems ?? [];
        const existingWorkIds = new Set(itemsBefore.map((item) => item.workId));

        const limitByCount = todayPlan.limitMode === 'count' || todayPlan.limitMode === 'both';
        if (limitByCount && existingWorkIds.size >= Math.max(1, Math.round(todayPlan.maxItems || 12))) {
          if (opts?.includeDiagnostics) {
            setFeedback({
              type: 'success',
              text: 'Plan ya está lleno por cantidad. Sube el máximo de ítems en Ajustes.'
            });
            window.setTimeout(() => setFeedback(null), 2500);
          }
          return;
        }

        const existingUsageByGroupId = new Map<string, { minutes: number; items: number }>();

        itemsBefore.forEach((item) => {
          const work = worksById.get(item.workId);
          if (!work) return;
          const label = resolveGroupLabelForItem(item, work);
          const group = activeGroupsForToday.find((g) => g.name === label);
          const groupId = group?.id ?? label;
          const prev = existingUsageByGroupId.get(groupId) ?? { minutes: 0, items: 0 };
          existingUsageByGroupId.set(groupId, {
            minutes: prev.minutes + estimateWorkMinutes(work, todayPlan),
            items: prev.items + 1
          });
        });

        const existingMinutesTotal = itemsBefore.reduce((acc, item) => {
          const work = worksById.get(item.workId);
          if (!work) return acc;
          return acc + estimateWorkMinutes(work, todayPlan);
        }, 0);

        const adjustedPlan: KungfuTodayPlanConfig = {
          ...todayPlan,
          maxItems: Math.max(0, Math.round((todayPlan.maxItems ?? 0) - existingWorkIds.size)),
          minutesBudget: Math.max(0, Number(todayPlan.minutesBudget ?? 0) - existingMinutesTotal),
          groups: activeGroupsForToday.map((group) => {
            const usage = existingUsageByGroupId.get(group.id);
            const next: KungfuPlanGroupConfig = { ...group };
            if (usage) {
              if (typeof group.minutesBudget === 'number' && Number.isFinite(group.minutesBudget)) {
                next.minutesBudget = Math.max(0, group.minutesBudget - usage.minutes);
              }
              if (typeof group.maxItems === 'number' && Number.isFinite(group.maxItems)) {
                next.maxItems = Math.max(0, Math.round(group.maxItems - usage.items));
              }
            }
            return next;
          })
        };

        const availableDue = dueList.filter((entry) => !existingWorkIds.has(entry.work.id));
        const additions = computePlan({
          dueList: availableDue,
          todaySession: undefined,
          plan: adjustedPlan,
          today: activeDate,
          childCountByWorkId
        });

        let addedCount = 0;
        additions.groups
          .filter((groupEntry) => (groupEntry.group.type ?? 'work') !== 'note')
          .forEach((groupEntry) => {
            groupEntry.items.forEach((entry) => {
              addWorkToSession(session.id, {
                workId: entry.work.id,
                focusLabel: groupEntry.group.name,
                customDurationMinutes: estimateWorkMinutes(entry.work, todayPlan)
              });
              addedCount += 1;
            });
          });

        const nextItems = buildNextSessionWorkItems(session.id);
        if (nextItems) {
          updateSessionWorkItems(session.id, dedupeSessionWorkItems(nextItems));
        }

        if (opts?.includeDiagnostics) {
          if (addedCount > 0) {
            setFeedback({
              type: 'success',
              text: `Plan actualizado: +${addedCount} ítem${addedCount === 1 ? '' : 's'}.`
            });
            window.setTimeout(() => setFeedback(null), 2000);
          } else {
            const diagnostics = activeGroupsForToday
              .filter((group) => (group.type ?? 'work') !== 'note')
              .map((group) => {
                const includeRules = group.include ?? [];
                const excludeRules = group.exclude ?? [];
                const matching = availableDue.filter((entry) => {
                  const included =
                    includeRules.length === 0
                      ? true
                      : includeRules.some((selector) => matchesSelector(entry.work, selector));
                  if (!included) return false;
                  const excluded = excludeRules.some((selector) => matchesSelector(entry.work, selector));
                  return !excluded;
                });
                const budget =
                  group.limitMode === 'minutes' || group.limitMode === 'both'
                    ? Math.max(0, Number(group.minutesBudget) || 0)
                    : undefined;
                const maxItems =
                  group.limitMode === 'count' || group.limitMode === 'both'
                    ? Math.max(0, Math.round(Number(group.maxItems) || 0))
                    : undefined;
                const parts = [
                  `${group.name}: ${matching.length} match`,
                  typeof budget === 'number' ? `${budget}m` : null,
                  typeof maxItems === 'number' ? `${maxItems} items` : null
                ].filter(Boolean);
                return parts.join(' · ');
              })
              .slice(0, 3)
              .join(' | ');
            setFeedback({
              type: 'success',
              text: diagnostics
                ? `No hay nuevos ítems para añadir. ${diagnostics}`
                : 'No hay nuevos ítems para añadir con los límites actuales.'
            });
            window.setTimeout(() => setFeedback(null), 4000);
          }
        }
      } finally {
        setIsFillingPlan(false);
      }
    },
    [
      isFillingPlan,
      dueList,
      activeSession,
      ensureSession,
      todayPlan,
      worksById,
      activeGroupsForToday,
      activeDate,
      childCountByWorkId,
      addWorkToSession,
      updateSessionWorkItems,
      dedupeSessionWorkItems,
      buildNextSessionWorkItems,
      resolveGroupLabelForItem
    ]
  );

  const recreateTodaySession = useCallback(() => {
    if (isFillingPlan) return;

    const ok = window.confirm(
      'Recrear sesión volverá a planificar el día seleccionado. Mantendrá los ítems ya registrados (OK/Dudosa/Fallo) y las notas, pero quitará el resto. ¿Continuar?'
    );
    if (!ok) return;

    const session = activeSession ?? ensureSession();
    const kept = (session.workItems ?? [])
      .filter((item) => (item.completed ?? false) || typeof item.result !== 'undefined')
      .map((item) => {
        const work = worksById.get(item.workId);
        if (!work) return item;
        return { ...item, focusLabel: resolveGroupLabelForItem(item, work) };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item, index) => ({ ...item, order: index }));

    updateSessionWorkItems(session.id, dedupeSessionWorkItems(kept));
    window.setTimeout(() => fillTodayPlan({ reason: 'recreate', includeDiagnostics: true }), 0);
  }, [
    dedupeSessionWorkItems,
    ensureSession,
    fillTodayPlan,
    isFillingPlan,
    resolveGroupLabelForItem,
    activeSession,
    updateSessionWorkItems,
    worksById
  ]);

  useEffect(() => {
    if (dueList.length === 0) return;

    const session = activeSession ?? ensureSession();
    const hasAnyPlanLabels = (session.workItems ?? []).some((item) => Boolean(item.focusLabel));
    const shouldSeed = !hasAnyPlanLabels;

    if (!shouldSeed) return;
    fillTodayPlan({ reason: 'initial-seed' });
  }, [
    dueList,
    todayPlan,
    activeDate,
    childCountByWorkId,
    updateSessionWorkItems,
    worksById,
    activeGroupsForToday,
    groupOrderByLabel,
    getGroupLabelForWork,
    activeSession,
    ensureSession,
    fillTodayPlan
  ]);

  const todaysLoggedCount = activeSession
    ? activeSession.workItems.filter((item) => (item.completed ?? false) || typeof item.result !== 'undefined').length
    : 0;

  const noteGroupsForToday = useMemo(
    () => activeGroupsForToday.filter((group) => (group.type ?? 'work') === 'note'),
    [activeGroupsForToday]
  );

  const globalProgress = useMemo(() => {
    const items = activeSession?.workItems ?? [];
    const totalWorks = items.length;
    const doneWorks = items.filter((item) => (item.completed ?? false) || typeof item.result !== 'undefined').length;

    const totalNotes = noteGroupsForToday.length;
    const doneNotes = noteGroupsForToday.filter((group) => (noteDrafts[group.id] ?? '').trim().length > 0).length;

    const total = totalWorks + totalNotes;
    const done = doneWorks + doneNotes;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent, totalWorks, doneWorks, totalNotes, doneNotes };
  }, [noteDrafts, noteGroupsForToday, activeSession?.workItems]);

  const todayEntriesByGroup = useMemo(() => {
    const entriesByGroup = new Map<string, DueWork[]>();
    const totalsByGroup = new Map<string, { total: number; done: number }>();

    const todaySessionItems = activeSession?.workItems ?? [];
    todaySessionItems
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((item) => {
        const due = dueList.find((entry) => entry.work.id === item.workId);
        const work = worksById.get(item.workId);
        if (!work) return;
        const isDone = (item.completed ?? false) || typeof item.result !== 'undefined';
        const fallback: DueWork = {
          work,
          targetDays: getTargetDays(work, cadence),
          overdueScore: 0,
          lastSeen: due?.lastSeen,
          daysSince: due?.daysSince,
          lastResult: due?.lastResult
        };
        const entry = due ?? fallback;
        const label = resolveGroupLabelForItem(item, work);
        const list = entriesByGroup.get(label) ?? [];
        list.push(entry);
        entriesByGroup.set(label, list);

        const totals = totalsByGroup.get(label) ?? { total: 0, done: 0 };
        totals.total += 1;
        if (isDone) totals.done += 1;
        totalsByGroup.set(label, totals);
      });

    return Array.from(entriesByGroup.entries())
      .map(([label, entries]) => {
        const totals = totalsByGroup.get(label) ?? { total: entries.length, done: 0 };
        return { label, entries, total: totals.total, done: totals.done };
      })
      .sort((a, b) => {
        const orderA = groupOrderByLabel.get(a.label) ?? 999;
        const orderB = groupOrderByLabel.get(b.label) ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
      });
  }, [activeSession?.workItems, dueList, worksById, cadence, groupOrderByLabel, resolveGroupLabelForItem]);

  const sectionsToRender = useMemo(() => {
    type WorkSection = { kind: 'work'; label: string; entries: DueWork[]; total: number; done: number };
    type NoteSection = { kind: 'note'; group: KungfuPlanGroupConfig };

    const byLabel = new Map(todayEntriesByGroup.map((section) => [section.label, section] as const));
    const renderedLabels = new Set<string>();
    const out: Array<WorkSection | NoteSection> = [];

    activeGroupsForToday.forEach((group) => {
      if ((group.type ?? 'work') === 'note') {
        out.push({ kind: 'note', group });
        return;
      }

      const section = byLabel.get(group.name);
      if (!section) return;
      renderedLabels.add(section.label);
      out.push({ kind: 'work', ...section });
    });

    todayEntriesByGroup.forEach((section) => {
      if (renderedLabels.has(section.label)) return;
      out.push({ kind: 'work', ...section });
    });

    return out;
  }, [activeGroupsForToday, todayEntriesByGroup]);

  const renderEntry = (entry: DueWork) => {
    const work = entry.work;
    const tags = normalizeTags(work.tags);
    const displayTags = tags.filter((tag) => tag !== PERSONAL_EXCLUDE_TAG);
    const isExpanded = expandedWorkDetails.has(work.id);
    const sessionItem = activeSession?.workItems.find((item) => item.workId === work.id);
    const currentResult = sessionItem?.result as TrainingResult | undefined;
    const isDone = Boolean(sessionItem?.completed ?? false) || typeof sessionItem?.result !== 'undefined';

    const videoUrls = (work.videoUrls ?? []).map((url) => url.trim()).filter(Boolean);
    const objective = objectiveById.get(work.objectiveId);
    const durationMinutes = sessionItem?.customDurationMinutes ?? work.estimatedMinutes ?? estimateWorkMinutes(work, todayPlan);

    const focusLabelRaw = (sessionItem?.focusLabel ?? '').trim();
    const titleExtra = focusLabelRaw && activeWorkGroupNames.has(focusLabelRaw) ? '' : focusLabelRaw;

    const statusPill =
      currentResult
        ? {
            label: RESULT_LABELS[currentResult],
            className: RESULT_STYLES[currentResult]
          }
        : undefined;

    const toggleExpanded = () =>
      setExpandedWorkDetails((prev) => {
        const next = new Set(prev);
        if (next.has(work.id)) next.delete(work.id);
        else next.add(work.id);
        return next;
      });

    const toggleDone = (nextChecked: boolean) => {
      const session = ensureSession();
      const existing = session.workItems.find((item) => item.workId === work.id);
      if (!existing) {
        const created = addWorkToSession(session.id, {
          workId: work.id,
          focusLabel: resolveGroupLabelForItem({ focusLabel: undefined }, work),
          customDurationMinutes: durationMinutes
        });
        if (!created) return;
        updateSessionWorkDetails(session.id, created.id, {
          completed: nextChecked,
          result: nextChecked ? 'ok' : undefined
        });
        return;
      }

      if (nextChecked) {
        updateSessionWorkDetails(session.id, existing.id, {
          completed: true,
          result: existing.result ?? 'ok'
        });
      } else {
        updateSessionWorkDetails(session.id, existing.id, {
          completed: false,
          result: undefined
        });
      }
    };

    return (
      <SessionWorkViewCard
        key={work.id}
        title={work.name}
        titleExtra={titleExtra}
        subtitle={work.subtitle}
        objective={objective}
        checked={isDone}
        onCheckedChange={toggleDone}
        orderNumber={(sessionItem?.order ?? 0) + 1}
        durationMinutes={durationMinutes}
        tags={displayTags}
        statusPill={statusPill}
        lastSeenLabel={formatLastSeen(entry.lastSeen)}
        descriptionMarkdown={work.descriptionMarkdown}
        notesMarkdown={work.notes}
        videoUrls={videoUrls}
        isExpanded={isExpanded}
        onToggleExpanded={toggleExpanded}
        detailsActions={
          <Link to={`/catalog?workId=${encodeURIComponent(work.id)}`} className="btn-secondary">
            Editar en catálogo
          </Link>
        }
      />
    );
  };

  const saveNoteForGroup = (groupId: string) => {
    const session = ensureSession();
    const cleanId = (groupId ?? '').trim();
    if (!cleanId) return;
    const rawValue = noteDrafts[cleanId] ?? '';
    const isEmpty = rawValue.trim().length === 0;
    const nextNotesByGroupId = { ...(session.notesByGroupId ?? {}) };
    if (isEmpty) {
      delete nextNotesByGroupId[cleanId];
    } else {
      nextNotesByGroupId[cleanId] = rawValue;
    }
    const firstNoteGroupId =
      activeGroupsForToday.find((group) => (group.type ?? 'work') === 'note')?.id ?? cleanId;
    updateSession(session.id, {
      notesByGroupId: Object.keys(nextNotesByGroupId).length > 0 ? nextNotesByGroupId : undefined,
      notes: nextNotesByGroupId[firstNoteGroupId] ?? ''
    });
  };

  useEffect(() => {
    if (activeSession) return;
    ensureSession(activeDate);
  }, [activeDate, activeSession, ensureSession]);

  const estimatedMinutes = useMemo(() => {
    const items = activeSession?.workItems ?? [];
    return Math.round(
      items.reduce((acc, item) => {
        const work = worksById.get(item.workId);
        if (!work) return acc;
        const minutes = item.customDurationMinutes ?? work.estimatedMinutes ?? estimateWorkMinutes(work, todayPlan);
        return acc + minutes;
      }, 0)
    );
  }, [activeSession?.workItems, worksById, todayPlan]);

  const setMode = (nextMode: Mode) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode === 'edit') next.set('mode', 'edit');
    else next.delete('mode');
    setSearchParams(next, { replace: true });
  };

  const setDate = (nextDate: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('date', nextDate);
    next.delete('session');
    setSearchParams(next, { replace: true });
  };

  const handleDateSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) return;
    setDate(dayjs(value).format('YYYY-MM-DD'));
  };

  const goPrev = () => setDate(dayjs(activeDate).subtract(1, 'day').format('YYYY-MM-DD'));
  const goNext = () => setDate(dayjs(activeDate).add(1, 'day').format('YYYY-MM-DD'));
  const goToday = () => setDate(todayIso);

  return (
    <div className="space-y-6">
      <header className="glass-panel space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <div className="space-y-3 sm:flex sm:items-start sm:justify-between sm:gap-6 sm:space-y-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
              <span className="sm:hidden">Sesión</span>
              <span className="hidden sm:inline">Fecha</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {dayjs(activeDate).format('dddd, D [de] MMMM')}
            </h1>
            <p className="text-sm font-medium text-white/80 sm:text-lg">
              {activeSession?.title ?? selectedPlan?.name ?? 'Entrenamiento personal'}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 sm:w-auto">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-white">Duración estimada</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">{estimatedMinutes} min</span>
            </div>
            <div>
              <p className="mt-1 text-xs text-white/50">
                {todaysLoggedCount} {todaysLoggedCount === 1 ? 'ítem registrado' : 'ítems registrados'}
              </p>
              <p className="mt-2 text-xs text-white/60">
                Progreso: {globalProgress.done}/{globalProgress.total} · {globalProgress.percent}%
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950/50">
                <div
                  className="h-full rounded-full bg-white/25"
                  style={{ width: `${Math.min(Math.max(globalProgress.percent, 0), 100)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <label className="text-[11px] uppercase tracking-wide text-white/40 sm:text-xs">Ir a fecha</label>
              <input type="date" className="input-field w-full sm:w-auto" value={activeDate} onChange={handleDateSelect} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold sm:h-10 sm:text-sm"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={goToday}
              disabled={activeDate === todayIso}
              className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold disabled:opacity-40 sm:h-10 sm:text-sm"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={goNext}
              className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold sm:h-10 sm:text-sm"
            >
              Siguiente →
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ModeSwitch mode={mode} onChange={setMode} />
            <Menu as="div" className="relative">
              <Menu.Button className="btn-secondary h-9 rounded-2xl px-3 text-xs font-semibold sm:h-10 sm:text-sm">
                Plan ▾
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-white/10 bg-slate-950/95 p-1 shadow-xl shadow-black/40 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        className={clsx(
                          'w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                          active ? 'bg-white/10 text-white' : 'text-white/80',
                          (isFillingPlan || dueList.length === 0) && 'opacity-50'
                        )}
                        onClick={() => fillTodayPlan({ reason: 'manual-refresh', includeDiagnostics: true })}
                        disabled={isFillingPlan || dueList.length === 0}
                        title="Añade ítems si has cambiado la configuración de grupos o límites"
                      >
                        {isFillingPlan ? 'Actualizando…' : 'Actualizar plan'}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        className={clsx(
                          'w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                          active ? 'bg-white/10 text-white' : 'text-white/80',
                          isFillingPlan && 'opacity-50'
                        )}
                        onClick={recreateTodaySession}
                        disabled={isFillingPlan}
                        title="Rehace la planificación del día manteniendo lo registrado"
                      >
                        Recrear sesión
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        {feedback && (
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
        )}
      </header>

      {dueList.length === 0 ? (
        <div className="glass-panel p-10 text-center text-white/50">
          No hay ningún trabajo incluido en tu programa activo. Añade la tag <span className="font-semibold text-white">kungfu</span> a los trabajos que quieras entrenar.
        </div>
      ) : mode === 'edit' ? (
        <section className="space-y-4">
          {activeSession ? (
            <div className="glass-panel p-3 sm:p-4">
              <SessionEditor session={activeSession} works={works} objectives={objectives} assistants={assistants} />
            </div>
          ) : (
            <div className="glass-panel p-10 text-center text-white/60">Cargando sesión…</div>
          )}

          {sectionsToRender
            .filter((section) => section.kind === 'note')
            .map((section) => {
              const groupId = section.group.id;
              const noteValue = noteDrafts[groupId] ?? '';
              const isDone = noteValue.trim().length > 0;
              return (
                <div key={section.group.id} className="glass-panel space-y-3 p-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                        {section.group.name} ({Math.max(0, Number(section.group.minutesBudget) || 0)} min)
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={clsx(
                            'rounded-full border px-3 py-1 text-xs font-semibold',
                            isDone
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/15 bg-white/5 text-white/60'
                          )}
                        >
                          {isDone ? 'OK' : 'Pendiente'}
                        </span>
                        <p className="text-sm text-white/60">Notas de la sesión · se guarda al salir del campo.</p>
                      </div>
                    </div>
                  </div>
                  <textarea
                    className="input-field min-h-[120px] w-full resize-y"
                    value={noteValue}
                    onChange={(event) =>
                      setNoteDrafts((prev) => ({
                        ...prev,
                        [groupId]: event.target.value
                      }))
                    }
                    onBlur={() => saveNoteForGroup(groupId)}
                    placeholder="Escribe aquí…"
                  />
                </div>
              );
            })}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="space-y-3">
            {todayEntriesByGroup.length === 0 ? (
              <div className="glass-panel p-10 text-center text-white/50">
                No hay ítems planificados para hoy. Revisa <span className="font-semibold text-white">Ajustes</span> o marca más trabajos como entrenables.
              </div>
            ) : null}

            {sectionsToRender.map((section) => {
              if (section.kind === 'note') {
                const groupId = section.group.id;
                const noteValue = noteDrafts[groupId] ?? '';
                const isDone = noteValue.trim().length > 0;
                return (
                  <div key={section.group.id} className="glass-panel space-y-3 p-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                          {section.group.name} ({Math.max(0, Number(section.group.minutesBudget) || 0)} min)
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={clsx(
                              'rounded-full border px-3 py-1 text-xs font-semibold',
                              isDone
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                : 'border-white/15 bg-white/5 text-white/60'
                            )}
                          >
                            {isDone ? 'OK' : 'Pendiente'}
                          </span>
                          <p className="text-sm text-white/60">Notas de la sesión · se guarda al salir del campo.</p>
                        </div>
                      </div>
                    </div>
                    <textarea
                      className="input-field min-h-[120px] w-full resize-y"
                      value={noteValue}
                      onChange={(event) =>
                        setNoteDrafts((prev) => ({
                          ...prev,
                          [groupId]: event.target.value
                        }))
                      }
                      onBlur={() => saveNoteForGroup(groupId)}
                      placeholder="Escribe aquí…"
                    />
                  </div>
                );
              }

              const safeTotal = Math.max(0, section.total);
              const safeDone = Math.min(Math.max(0, section.done), safeTotal);
              const percent = safeTotal > 0 ? Math.round((safeDone / safeTotal) * 100) : 0;
              return (
                <section key={section.label} className="glass-panel space-y-4 p-3 sm:space-y-5 sm:p-6">
                  <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{section.label}</p>
                      <p className="mt-1 text-sm text-white/60">
                        {safeDone}/{safeTotal} ítem{safeTotal === 1 ? '' : 's'} · {percent}% completado
                      </p>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950/50">
                        <div
                          className="h-full rounded-full bg-white/25"
                          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3 sm:space-y-4">{section.entries.map(renderEntry)}</div>
                </section>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
