import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/contexts/useAuth';
import { MarkdownContent } from '@/components/MarkdownContent';
import { YouTubePreview } from '@/components/YouTubePreview';
import type {
  KungfuProgram,
  KungfuProgramSelector,
  KungfuCadenceConfig,
  KungfuTodayPlanConfig,
  KungfuPlanGroupConfig,
  KungfuPlanGroupHierarchyRule,
  KungfuPlanGroupStrategy,
  KungfuPlanGroupType,
  Work,
  Session,
  SessionWork
} from '@/types';

dayjs.locale('es');

type TrainingResult = NonNullable<SessionWork['result']>;

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

const DEFAULT_EFFORT = 6;

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

function isWorkIncludedByPrograms(work: Work, programs: KungfuProgram[]): boolean {
  const enabledPrograms = (programs ?? []).filter((program) => program.enabled);
  if (normalizeTags(work.tags).includes(PERSONAL_EXCLUDE_TAG)) return false;
  if (enabledPrograms.length === 0) {
    return normalizeTags(work.tags).includes('kungfu');
  }

  return enabledPrograms.some((program) => {
    const included =
      program.include.length === 0 ? true : program.include.some((selector) => matchesSelector(work, selector));
    const excluded = program.exclude.some((selector) => matchesSelector(work, selector));
    return included && !excluded;
  });
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
  programs: KungfuProgram[];
  cadence: KungfuCadenceConfig;
  today: string;
}): DueWork[] {
  const { works, personalSessions, programs, cadence, today } = opts;
  const history = buildHistory(personalSessions);

  return works
    .filter((work) => isTrainableWork(work))
    .filter((work) => isWorkIncludedByPrograms(work, programs))
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
  const programs = useAppStore((state) => state.kungfuPrograms);
  const cadence = useAppStore((state) => state.kungfuCadence);
  const todayPlan = useAppStore((state) => state.kungfuTodayPlan);

  const updateWork = useAppStore((state) => state.updateWork);
  const { user } = useAuth();

  const addSession = useAppStore((state) => state.addSession);
  const addWorkToSession = useAppStore((state) => state.addWorkToSession);
  const updateSessionWorkDetails = useAppStore((state) => state.updateSessionWorkDetails);
  const updateSession = useAppStore((state) => state.updateSession);

  const today = dayjs().format('YYYY-MM-DD');

  const personalSessions = useMemo(() => sessions.filter((session) => session.kind === 'personal'), [sessions]);

  const todaySession = useMemo(
    () => personalSessions.find((session) => session.date === today),
    [personalSessions, today]
  );

  const dueList = useMemo(
    () =>
      computeDueList({
        works,
        personalSessions,
        programs,
        cadence,
        today
      }),
    [works, personalSessions, programs, cadence, today]
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

  const planned = useMemo(
    () => computePlan({ dueList, todaySession, plan: todayPlan, today, childCountByWorkId }),
    [dueList, todaySession, todayPlan, today, childCountByWorkId]
  );

  const actorContext = useMemo(
    () =>
      user
        ? {
            actorId: user.id,
            actorEmail: user.email ?? ''
          }
        : null,
    [user]
  );

  const [effortByWorkId, setEffortByWorkId] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recapNote, setRecapNote] = useState<string>(todaySession?.notes ?? '');
  const [togglingWorkId, setTogglingWorkId] = useState<string | null>(null);
  const [expandedWorkDetails, setExpandedWorkDetails] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRecapNote(todaySession?.notes ?? '');
  }, [todaySession?.notes]);

  const ensureTodaySession = (): Session => {
    if (todaySession) return todaySession;
    return addSession({
      date: today,
      kind: 'personal',
      title: 'Entrenamiento personal',
      description: '',
      notes: ''
    });
  };

  const logWork = (workId: string, result: TrainingResult) => {
    try {
      const session = ensureTodaySession();
      const effort = effortByWorkId[workId] ?? DEFAULT_EFFORT;
      const clampedEffort = Math.min(Math.max(Math.round(effort), 1), 10);
      const existing = session.workItems.find((item) => item.workId === workId);

      if (existing) {
        updateSessionWorkDetails(session.id, existing.id, {
          result,
          effort: clampedEffort,
          completed: true
        });
      } else {
        const created = addWorkToSession(session.id, { workId });
        if (!created) {
          throw new Error('No se pudo añadir el trabajo a la sesión.');
        }
        updateSessionWorkDetails(session.id, created.id, {
          result,
          effort: clampedEffort,
          completed: true
        });
      }

      setFeedback({ type: 'success', text: 'Registrado.' });
      window.setTimeout(() => setFeedback(null), 1800);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar.';
      setFeedback({ type: 'error', text: message });
      window.setTimeout(() => setFeedback(null), 2500);
    }
  };

  const todaysLoggedCount = todaySession
    ? todaySession.workItems.filter((item) => (item.completed ?? false) || typeof item.result !== 'undefined').length
    : 0;

  const showLimitByCount = todayPlan.limitMode === 'count' || todayPlan.limitMode === 'both';
  const showLimitByMinutes = todayPlan.limitMode === 'minutes' || todayPlan.limitMode === 'both';
  const plannedWorkGroups = planned.groups.filter((entry) => (entry.group.type ?? 'work') !== 'note');
  const plannedNoteGroups = planned.groups.filter((entry) => entry.group.type === 'note');
  const hasWorkSuggestions = plannedWorkGroups.some((entry) => entry.items.length > 0);
  const groupsSummary = [
    ...plannedWorkGroups.map((entry) => {
      const budget = Number(entry.group.minutesBudget);
      return Number.isFinite(budget) && budget > 0 ? `${entry.group.name} ${budget} min` : entry.group.name;
    }),
    ...plannedNoteGroups.map((entry) => {
      const budget = Number(entry.group.minutesBudget);
      return Number.isFinite(budget) && budget > 0 ? `${entry.group.name} ${budget} min` : entry.group.name;
    })
  ]
    .filter(Boolean)
    .join(' · ');

  const renderEntry = (entry: DueWork) => {
    const work = entry.work;
    const tags = normalizeTags(work.tags);
    const isExcluded = tags.includes(PERSONAL_EXCLUDE_TAG);
    const displayTags = tags.filter((tag) => tag !== PERSONAL_EXCLUDE_TAG);
    const nextEffort = effortByWorkId[work.id] ?? DEFAULT_EFFORT;
    const canTogglePersonal = (work.canEdit ?? false) && ((work.nodeType ?? '').trim().toLowerCase() !== 'style');
    const isBusy = togglingWorkId === work.id;
    const isExpanded = expandedWorkDetails.has(work.id);

    const trimmedDescription = (work.descriptionMarkdown ?? '').trim();
    const trimmedNotes = (work.notes ?? '').trim();
    const videoUrls = (work.videoUrls ?? []).map((url) => url.trim()).filter(Boolean);
    const hasDetails = trimmedDescription.length > 0 || trimmedNotes.length > 0 || videoUrls.length > 0;

    const togglePersonalIncluded = async () => {
      if (!actorContext) {
        setFeedback({ type: 'error', text: 'Inicia sesión para editar trabajos.' });
        window.setTimeout(() => setFeedback(null), 2500);
        return;
      }
      if (!canTogglePersonal) return;
      setTogglingWorkId(work.id);
      try {
        const nextTags = isExcluded
          ? displayTags
          : Array.from(new Set([...displayTags, PERSONAL_EXCLUDE_TAG]));
        await updateWork(work.id, { tags: nextTags }, actorContext);
        setFeedback({
          type: 'success',
          text: isExcluded ? 'Incluido en el plan personal.' : 'Excluido del plan personal.'
        });
        window.setTimeout(() => setFeedback(null), 1800);
      } catch (error) {
        console.error('No se pudo actualizar el trabajo', error);
        setFeedback({ type: 'error', text: 'No se pudo actualizar el trabajo.' });
        window.setTimeout(() => setFeedback(null), 2500);
      } finally {
        setTogglingWorkId(null);
      }
    };

    return (
      <article
        key={work.id}
        className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow shadow-black/15"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-start gap-3">
              {hasDetails ? (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedWorkDetails((prev) => {
                      const next = new Set(prev);
                      if (next.has(work.id)) {
                        next.delete(work.id);
                      } else {
                        next.add(work.id);
                      }
                      return next;
                    })
                  }
                  className={clsx(
                    'mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white',
                    isExpanded ? 'rotate-90 border-white/30 text-white' : ''
                  )}
                  aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                  title={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                >
                  ▶
                </button>
              ) : null}
              <div>
                <p className="text-lg font-semibold text-white">{work.name}</p>
                {work.subtitle ? <p className="text-sm text-white/70">{work.subtitle}</p> : null}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-white/40">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                {work.nodeType ?? 'work'}
              </span>
              {displayTags.slice(0, 6).map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5">
                  {tag}
                </span>
              ))}
              {displayTags.length > 6 ? <span className="text-white/50">+{displayTags.length - 6}</span> : null}
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Última vez</p>
              <p className="mt-1 font-semibold text-white">{formatLastSeen(entry.lastSeen)}</p>
              <p className="mt-1 text-xs text-white/50">
                Objetivo: {entry.targetDays} día{entry.targetDays === 1 ? '' : 's'} ·{' '}
                {entry.overdueScore >= 10_000 ? 'Nuevo' : `${entry.overdueScore} vencido`}
              </p>
            </div>
          </div>
        </div>

        {hasDetails && isExpanded ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            {trimmedDescription.length > 0 ? <MarkdownContent content={trimmedDescription} enableWorkLinks /> : null}
            {trimmedNotes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Notas</p>
                <MarkdownContent content={trimmedNotes} enableWorkLinks />
              </div>
            ) : null}
            {videoUrls.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Vídeos</p>
                <div className="grid gap-4 lg:grid-cols-3">
                  {videoUrls.map((url, index) => (
                    <div key={`${work.id}-video-${index}`} className="space-y-2">
                      <YouTubePreview url={url} title={`${work.name} vídeo ${index + 1}`} />
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
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(RESULT_LABELS) as TrainingResult[]).map((value) => (
              <button
                key={value}
                type="button"
                className={clsx(
                  'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition',
                  RESULT_STYLES[value]
                )}
                onClick={() => logWork(work.id, value)}
              >
                {RESULT_LABELS[value]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/40">RPE</label>
            <input
              type="number"
              min={1}
              max={10}
              value={nextEffort}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                setEffortByWorkId((prev) => ({
                  ...prev,
                  [work.id]: Number.isFinite(parsed) ? parsed : DEFAULT_EFFORT
                }));
              }}
              className="input-field w-20 text-center"
            />
            <Link to={`/catalog?workId=${encodeURIComponent(work.id)}`} className="btn-secondary">
              Ver en catálogo
            </Link>
            <button
              type="button"
              onClick={togglePersonalIncluded}
              disabled={!canTogglePersonal || isBusy}
              className={clsx(
                'inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold transition disabled:opacity-50',
                isExcluded
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:border-rose-400'
              )}
              title={isExcluded ? 'Incluir en el plan personal' : 'Excluir del plan personal'}
            >
              {isBusy ? '...' : isExcluded ? 'Incluir' : 'Excluir'}
            </button>
          </div>
        </div>
      </article>
    );
  };

  const saveRecap = () => {
    const session = ensureTodaySession();
    updateSession(session.id, { notes: recapNote });
    setFeedback({ type: 'success', text: 'Recap guardado.' });
    window.setTimeout(() => setFeedback(null), 1800);
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kung Fu · Hoy</h1>
            <p className="text-white/60">Plan directo de entrenamiento basado en cadencias y tu histórico personal.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Sesión de hoy</p>
              <p className="mt-1 font-semibold text-white">
                {dayjs(today).format('dddd, D [de] MMMM')}
              </p>
              <p className="mt-1 text-xs text-white/50">
                {todaysLoggedCount} {todaysLoggedCount === 1 ? 'ítem registrado' : 'ítems registrados'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/personal/sessions" className="btn-secondary">
                Ver sesiones
              </Link>
              <Link to="/personal/settings" className="btn-secondary">
                Ajustes
              </Link>
            </div>
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
      ) : (
        <section className="space-y-4">
          <div className="glass-panel flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Sugerencias</h2>
              <p className="text-sm text-white/60">
                Priorizadas por lo “vencido” respecto a su cadencia objetivo.
              </p>
              <p className="mt-1 text-xs text-white/50">
                {groupsSummary ? `Grupos: ${groupsSummary}` : 'Grupos: (sin configurar)'}
                {showLimitByCount ? ` · máx ${todayPlan.maxItems} ítems` : ''}
                {showLimitByMinutes ? ` · ${todayPlan.minutesBudget} min` : ''}
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {planned.totalItems} sugeridos · {planned.plannedMinutes.total} min
            </span>
          </div>

          <div className="space-y-3">
            {!hasWorkSuggestions ? (
              <div className="glass-panel p-10 text-center text-white/50">
                No hay sugerencias con los límites actuales. Revisa <span className="font-semibold text-white">Ajustes</span> o marca más trabajos como entrenables.
              </div>
            ) : null}

            {plannedWorkGroups
              .filter((entry) => entry.items.length > 0)
              .map((entry) => (
                <section key={entry.group.id} className="glass-panel space-y-4 p-3 sm:space-y-5 sm:p-6">
                  <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{entry.group.name}</p>
                      <p className="text-sm text-white/60">
                        {entry.items.length} ítem{entry.items.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                      {entry.plannedMinutes} min
                    </span>
                  </header>
                  <div className="space-y-3 sm:space-y-4">{entry.items.map(renderEntry)}</div>
                </section>
              ))}

            {plannedNoteGroups.length > 0 ? (
              <div className="glass-panel space-y-3 p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      {plannedNoteGroups[0].group.name} ({Math.max(0, Number(plannedNoteGroups[0].group.minutesBudget) || 0)} min)
                    </p>
                    <p className="text-sm text-white/60">Una corrección concreta para mañana.</p>
                  </div>
                  <button type="button" className="btn-secondary" onClick={saveRecap}>
                    Guardar recap
                  </button>
                </div>
                <textarea
                  className="input-field min-h-[90px] w-full resize-y"
                  value={recapNote}
                  onChange={(event) => setRecapNote(event.target.value)}
                  placeholder="Ej: Transición B→C: bajar hombros y cerrar cadera."
                />
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
