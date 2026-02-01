import { create } from 'zustand';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import type {
  Objective,
  Work,
  Plan,
  PlanKind,
  Session,
  SessionWork,
  SessionAttendance,
  Assistant,
  AttendanceStatus,
  ActualAttendanceStatus,
  BackupPayload,
  BackupSessionWork,
  BackupSessionAttendance,
  BackupSession,
  KungfuProgram,
  KungfuProgramSelector,
  KungfuCadenceConfig,
  KungfuTodayPlanConfig,
  KungfuPlanGroupConfig,
  KungfuPlanGroupHierarchyRule,
  KungfuPlanGroupStrategy,
  KungfuPlanGroupType,
  KungfuTodayLimitMode,
  WorkTaxonomy,
  NodeTypeDefinition,
  TagDefinition,
  WorkScheduleKind
} from '@/types';
import { slugify } from '@/lib/slugify';
import {
  fetchAccessibleWorks,
  createWork as createWorkRemote,
  updateWork as updateWorkRemote,
  deleteWork as deleteWorkRemote,
  type WorkCreateInput,
  type WorkUpdateInput,
  type WorkActionContext
} from '@/services/workService';

const STORAGE_KEYS = {
  objectives: 'sport-planner-objetivos',
  works: 'sport-planner-trabajos',
  sessions: 'sport-planner-sesiones',
  assistants: 'sport-planner-asistentes',
  plans: 'sport-planner-plans',
  kungfuPrograms: 'sport-planner-kungfu-programs',
  kungfuCadence: 'sport-planner-kungfu-cadence',
  kungfuTodayPlan: 'sport-planner-kungfu-today-plan',
  workTaxonomy: 'sport-planner-work-taxonomy'
};

const isBrowser = typeof window !== 'undefined';

const nowIso = () => new Date().toISOString();

const DEFAULT_SESSION_START_TIME = '18:30';

const DEFAULT_CLASS_PLAN_ID = 'classes';
const DEFAULT_PERSONAL_PLAN_ID = 'personal-kungfu';

const DEFAULT_KUNGFU_PROGRAMS: KungfuProgram[] = [
  {
    id: 'default',
    name: 'Kung Fu — activo',
    enabled: true,
    include: [{ byTags: ['kungfu'] }],
    exclude: []
  }
];

const DEFAULT_KUNGFU_CADENCE: KungfuCadenceConfig = {
  targetsDays: {
    work: 7,
    technique: 5,
    segment: 8,
    form: 10,
    drill: 7
  },
  overrides: []
};

const DEFAULT_KUNGFU_TODAY_PLAN: KungfuTodayPlanConfig = {
  limitMode: 'count',
  maxItems: 12,
  minutesBudget: 30,
  template: {
    totalMinutes: 30,
    focusMinutes: 18,
    rouletteMinutes: 10,
    recapMinutes: 2
  },
  defaultMinutesByNodeType: {
    work: 3,
    technique: 1.5,
    segment: 6,
    form: 15,
    drill: 4,
    reading: 5,
    link: 2
  },
  focusSelectors: [],
  rouletteSelectors: [],
  groups: [
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
  ]
};

const DEFAULT_WORK_TAXONOMY: WorkTaxonomy = {
  nodeTypes: [
    { key: 'form', label: 'Form' },
    { key: 'segment', label: 'Segment' },
    { key: 'application', label: 'Application' },
    { key: 'technique', label: 'Technique' },
    { key: 'drill', label: 'Drill' },
    { key: 'reading', label: 'Reading' },
    { key: 'work', label: 'Work' },
    { key: 'link', label: 'Link' },
    { key: 'style', label: 'Style' }
  ],
  tags: []
};

const isPlanKind = (value: unknown): value is PlanKind => value === 'class' || value === 'personal';

const PLAN_NAME_COLLATOR = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

const parseLeadingOrderPrefix = (name: string): { order: number | null; rest: string } => {
  const trimmed = (name ?? '').trim();
  const match = trimmed.match(/^(\d+)\s*[\.)-]?\s*(.*)$/);
  if (!match) return { order: null, rest: trimmed };
  const order = Number(match[1]);
  if (!Number.isFinite(order)) return { order: null, rest: trimmed };
  return { order: Math.trunc(order), rest: (match[2] ?? '').trim() };
};

const normalizePlan = (raw: unknown, fallback: Plan): Plan => {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Partial<Plan>;
  const id = String(obj.id ?? '').trim();
  if (!id) return fallback;
  const kind = isPlanKind(obj.kind) ? obj.kind : fallback.kind;
  const name = String(obj.name ?? '').trim() || fallback.name;
  const enabled = typeof obj.enabled === 'boolean' ? obj.enabled : fallback.enabled;
  const createdAt = String(obj.createdAt ?? '').trim() || fallback.createdAt;
  const updatedAt = String(obj.updatedAt ?? '').trim() || fallback.updatedAt;
  return {
    ...fallback,
    id,
    kind,
    name,
    enabled,
    cadence: obj.cadence ?? fallback.cadence,
    todayPlan: obj.todayPlan ?? fallback.todayPlan,
    createdAt,
    updatedAt
  };
};

const makeDefaultPlans = (now: string, cadence: KungfuCadenceConfig, todayPlan: KungfuTodayPlanConfig): Plan[] => [
  {
    id: DEFAULT_CLASS_PLAN_ID,
    name: 'Clases',
    kind: 'class',
    enabled: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: DEFAULT_PERSONAL_PLAN_ID,
    name: 'Personal Kung Fu',
    kind: 'personal',
    enabled: true,
    cadence,
    todayPlan,
    createdAt: now,
    updatedAt: now
  }
];

const normalizePlans = (
  rawPlans: unknown,
  legacyCadence: KungfuCadenceConfig,
  legacyTodayPlan: KungfuTodayPlanConfig,
  now: string
): Plan[] => {
  const defaults = makeDefaultPlans(now, legacyCadence, legacyTodayPlan);
  const list = Array.isArray(rawPlans) ? rawPlans : [];
  const normalized = list
    .map((entry) => {
      const entryId = String((entry as Partial<Plan> | undefined)?.id ?? '').trim();
      const fallback =
        defaults.find((plan) => plan.id === entryId) ??
        ({
          id: entryId || nanoid(),
          name: 'Plan',
          kind: 'personal',
          enabled: true,
          cadence: legacyCadence,
          todayPlan: legacyTodayPlan,
          createdAt: now,
          updatedAt: now
        } satisfies Plan);
      return normalizePlan(entry, fallback);
    })
    .filter((plan) => plan.id.length > 0);

  const byId = new Map<string, Plan>();
  normalized.forEach((plan) => {
    byId.set(plan.id, plan);
  });

  defaults.forEach((plan) => {
    if (!byId.has(plan.id)) {
      byId.set(plan.id, plan);
    }
  });

  const personal = byId.get(DEFAULT_PERSONAL_PLAN_ID);
  if (personal) {
    byId.set(DEFAULT_PERSONAL_PLAN_ID, {
      ...personal,
      cadence: personal.cadence ?? legacyCadence,
      todayPlan: personal.todayPlan ?? legacyTodayPlan
    });
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aParsed = parseLeadingOrderPrefix(a.name);
    const bParsed = parseLeadingOrderPrefix(b.name);
    const aOrder = aParsed.order ?? Number.POSITIVE_INFINITY;
    const bOrder = bParsed.order ?? Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const byName = PLAN_NAME_COLLATOR.compare(aParsed.rest || a.name, bParsed.rest || b.name);
    if (byName !== 0) return byName;
    return PLAN_NAME_COLLATOR.compare(a.id, b.id);
  });
};

const normalizeNodeTypeDefinitions = (value: unknown): NodeTypeDefinition[] => {
  const raw = Array.isArray(value) ? value : [];
  const cleaned = raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const obj = entry as { key?: unknown; label?: unknown };
      const key = String(obj.key ?? '').trim().toLowerCase();
      const label = String(obj.label ?? '').trim();
      if (!key) return null;
      return { key, label: label || key };
    })
    .filter(Boolean) as NodeTypeDefinition[];
  const map = new Map<string, NodeTypeDefinition>();
  cleaned.forEach((nt) => {
    map.set(nt.key, nt);
  });
  DEFAULT_WORK_TAXONOMY.nodeTypes.forEach((nt) => {
    if (!map.has(nt.key)) {
      map.set(nt.key, nt);
    }
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
};

const normalizeTagDefinitions = (value: unknown): TagDefinition[] => {
  const raw = Array.isArray(value) ? value : [];
  const cleaned = raw
    .map((entry) => {
      if (typeof entry === 'string') {
        const name = entry.trim().toLowerCase();
        return name ? { name } : null;
      }
      if (!entry || typeof entry !== 'object') return null;
      const obj = entry as { name?: unknown };
      const name = String(obj.name ?? '').trim().toLowerCase();
      return name ? { name } : null;
    })
    .filter(Boolean) as TagDefinition[];
  const map = new Map<string, TagDefinition>();
  cleaned.forEach((tag) => map.set(tag.name, tag));
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
};

const normalizeWorkTaxonomy = (raw: unknown, works: Work[]): WorkTaxonomy => {
  const base = (raw && typeof raw === 'object' ? (raw as { nodeTypes?: unknown; tags?: unknown }) : {}) ?? {};
  const nodeTypes = normalizeNodeTypeDefinitions(base.nodeTypes);
  const tags = normalizeTagDefinitions(base.tags);

  const nodeTypeMap = new Map(nodeTypes.map((nt) => [nt.key, nt]));
  const tagMap = new Map(tags.map((tag) => [tag.name, tag]));

  works.forEach((work) => {
    const nodeTypeKey = (work.nodeType ?? '').trim().toLowerCase();
    if (nodeTypeKey && !nodeTypeMap.has(nodeTypeKey)) {
      nodeTypeMap.set(nodeTypeKey, { key: nodeTypeKey, label: nodeTypeKey });
    }
    (work.tags ?? []).forEach((tag) => {
      const key = String(tag ?? '').trim().toLowerCase();
      if (key && !tagMap.has(key)) {
        tagMap.set(key, { name: key });
      }
    });
  });

  return {
    nodeTypes: Array.from(nodeTypeMap.values()).sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' })),
    tags: Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
  };
};

const normalizeListLower = (value: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => String(item ?? '').trim().toLowerCase())
        .filter((item) => item.length > 0)
    )
  );

const normalizeWorkIdList = (value: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => String(item ?? '').trim())
        .filter((item) => item.length > 0)
    )
  );

const isTodayLimitMode = (value: unknown): value is KungfuTodayLimitMode =>
  value === 'count' || value === 'minutes' || value === 'both';

const isGroupType = (value: unknown): value is KungfuPlanGroupType => value === 'work' || value === 'note';

const isGroupStrategy = (value: unknown): value is KungfuPlanGroupStrategy => value === 'overdue' || value === 'weighted';

const isHierarchyRule = (value: unknown): value is KungfuPlanGroupHierarchyRule =>
  value === 'allow_all' || value === 'prefer_leaves';

const normalizeSelector = (selector: KungfuProgramSelector): KungfuProgramSelector => {
  const next: KungfuProgramSelector = {};
  const tags = normalizeListLower(selector.byTags);
  const nodeTypes = normalizeListLower(selector.byNodeTypes);
  const workIds = normalizeWorkIdList(selector.byWorkIds);
  if (tags.length > 0) next.byTags = tags;
  if (nodeTypes.length > 0) next.byNodeTypes = nodeTypes;
  if (workIds.length > 0) next.byWorkIds = workIds;
  return next;
};

const normalizeSelectorRules = (selectors: KungfuProgramSelector[] | undefined): KungfuProgramSelector[] =>
  (selectors ?? []).map(normalizeSelector).filter((selector) => Object.keys(selector).length > 0);

const normalizeDaysOfWeek = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  const days = value
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
    .map((entry) => Math.round(entry))
    .filter((entry) => entry >= 0 && entry <= 6);
  return Array.from(new Set(days)).sort((a, b) => a - b);
};

const normalizeDefaultMinutesByNodeType = (value: unknown): Record<string, number> => {
  const next: Record<string, number> = {};
  if (!value || typeof value !== 'object') return { ...DEFAULT_KUNGFU_TODAY_PLAN.defaultMinutesByNodeType };
  Object.entries(value as Record<string, unknown>).forEach(([key, rawValue]) => {
    const cleanKey = key.trim().toLowerCase();
    const cleanValue = Number(rawValue);
    if (!cleanKey) return;
    if (!Number.isFinite(cleanValue)) return;
    next[cleanKey] = Math.max(0.25, cleanValue);
  });
  return Object.keys(next).length > 0 ? next : { ...DEFAULT_KUNGFU_TODAY_PLAN.defaultMinutesByNodeType };
};

const normalizeGroup = (group: KungfuPlanGroupConfig, fallbackOrder: number): KungfuPlanGroupConfig => {
  const id = String(group.id ?? '').trim() || nanoid();
  const type = isGroupType(group.type) ? group.type : 'work';
  const enabled = typeof group.enabled === 'boolean' ? group.enabled : true;
  const name = String(group.name ?? '').trim() || (type === 'note' ? 'Recap' : 'Grupo');
  const order = Number.isFinite(Number(group.order)) ? Number(group.order) : fallbackOrder;
  const daysOfWeek = normalizeDaysOfWeek(group.daysOfWeek);
  const limitMode = isTodayLimitMode(group.limitMode) ? group.limitMode : 'minutes';
  const maxItems = Number.isFinite(Number(group.maxItems)) ? Math.max(0, Math.round(Number(group.maxItems))) : undefined;
  const minutesBudget = Number.isFinite(Number(group.minutesBudget)) ? Math.max(0, Number(group.minutesBudget)) : undefined;
  const strategy = isGroupStrategy(group.strategy) ? group.strategy : 'overdue';
  const hierarchyRule = isHierarchyRule(group.hierarchyRule) ? group.hierarchyRule : 'allow_all';

  const include = normalizeSelectorRules(group.include);
  const exclude = normalizeSelectorRules(group.exclude);

  return {
    id,
    name,
    enabled,
    order,
    type,
    daysOfWeek,
    limitMode,
    maxItems,
    minutesBudget,
    strategy,
    hierarchyRule,
    include,
    exclude
  };
};

const legacyGroupsFromPlan = (plan: KungfuTodayPlanConfig): KungfuPlanGroupConfig[] => {
  const focusMinutes = Math.max(0, Number(plan.template?.focusMinutes) || 0);
  const rouletteMinutes = Math.max(0, Number(plan.template?.rouletteMinutes) || 0);
  const recapMinutes = Math.max(0, Number(plan.template?.recapMinutes) || 0);
  const focusSelectors = normalizeSelectorRules(plan.focusSelectors);
  const rouletteSelectors = normalizeSelectorRules(plan.rouletteSelectors);

  const focusInclude = focusSelectors.length > 0 ? focusSelectors : [{ byNodeTypes: ['segment', 'form'] }];
  const rouletteInclude =
    rouletteSelectors.length > 0 ? rouletteSelectors : [{ byNodeTypes: ['technique'] }, { byTags: ['roulette'] }];

  const groups: KungfuPlanGroupConfig[] = [
    {
      id: 'formas',
      name: 'Formas',
      enabled: true,
      order: 1,
      type: 'work',
      limitMode: 'minutes',
      minutesBudget: focusMinutes > 0 ? focusMinutes : 18,
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
      minutesBudget: rouletteMinutes > 0 ? rouletteMinutes : 10,
      strategy: 'weighted',
      hierarchyRule: 'allow_all',
      include: rouletteInclude,
      exclude: []
    }
  ];

  if (recapMinutes > 0) {
    groups.push({
      id: 'recap',
      name: 'Recap',
      enabled: true,
      order: 99,
      type: 'note',
      limitMode: 'minutes',
      minutesBudget: recapMinutes
    });
  }

  return groups;
};

const normalizeKungfuTodayPlan = (raw: KungfuTodayPlanConfig | undefined): KungfuTodayPlanConfig => {
  const plan = raw ?? DEFAULT_KUNGFU_TODAY_PLAN;
  const limitMode = isTodayLimitMode(plan.limitMode) ? plan.limitMode : DEFAULT_KUNGFU_TODAY_PLAN.limitMode;
  const maxItems = Math.max(1, Math.round(Number(plan.maxItems) || DEFAULT_KUNGFU_TODAY_PLAN.maxItems));
  const minutesBudget = Math.max(1, Number(plan.minutesBudget) || DEFAULT_KUNGFU_TODAY_PLAN.minutesBudget);

  const focusMinutes = Math.max(0, Number(plan.template?.focusMinutes) || DEFAULT_KUNGFU_TODAY_PLAN.template.focusMinutes);
  const rouletteMinutes = Math.max(0, Number(plan.template?.rouletteMinutes) || DEFAULT_KUNGFU_TODAY_PLAN.template.rouletteMinutes);
  const recapMinutes = Math.max(0, Number(plan.template?.recapMinutes) || DEFAULT_KUNGFU_TODAY_PLAN.template.recapMinutes);
  const totalMinutes = Math.max(0, focusMinutes + rouletteMinutes + recapMinutes);

  const defaultMinutesByNodeType = normalizeDefaultMinutesByNodeType(plan.defaultMinutesByNodeType);
  const focusSelectors = normalizeSelectorRules(plan.focusSelectors);
  const rouletteSelectors = normalizeSelectorRules(plan.rouletteSelectors);

  const baseGroups = (plan.groups ?? []).length > 0 ? (plan.groups ?? []) : legacyGroupsFromPlan(plan);
  const groups = baseGroups
    .map((group, index) => normalizeGroup(group, index + 1))
    .sort((a, b) => a.order - b.order)
    .map((group, index) => ({ ...group, order: index + 1 }));

  return {
    ...plan,
    limitMode,
    maxItems,
    minutesBudget,
    template: { totalMinutes, focusMinutes, rouletteMinutes, recapMinutes },
    defaultMinutesByNodeType,
    focusSelectors,
    rouletteSelectors,
    groups
  };
};

const normalizeParentWorkId = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeTagList = (tags?: Array<string | null | undefined>): string[] =>
  Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => (tag ?? '').trim().toLowerCase())
        .filter((tag) => tag.length > 0)
    )
  );

const normalizeOptionalText = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const isWorkScheduleKind = (value: unknown): value is WorkScheduleKind =>
  value === 'day_of_year' || value === 'day_of_month' || value === 'day_of_week';

const normalizeEmailList = (emails?: Array<string | null | undefined>): string[] =>
  Array.from(
    new Set(
      (emails ?? [])
        .map((email) => (email ?? '').trim().toLowerCase())
        .filter((email) => email.length > 0)
    )
  );

const ensureWorkDefaults = (input: Partial<Work> & { id: string }): Work => {
  const now = nowIso();
  const parentWorkId = normalizeParentWorkId(input.parentWorkId ?? null);
  const nextWorkId = normalizeParentWorkId(input.nextWorkId ?? null);
  const variantOfWorkId = normalizeParentWorkId(input.variantOfWorkId ?? null);
  const nodeType = normalizeOptionalText(input.nodeType ?? undefined);
  const tags = normalizeTagList(input.tags);
  const scheduleKind = isWorkScheduleKind(input.schedule?.kind) ? input.schedule?.kind : undefined;
  const scheduleNumberRaw = input.schedule?.number;
  const scheduleNumber = typeof scheduleNumberRaw === 'number' && Number.isFinite(scheduleNumberRaw)
    ? Math.trunc(scheduleNumberRaw)
    : undefined;
  const schedule = scheduleKind && typeof scheduleNumber === 'number'
    ? { kind: scheduleKind, number: scheduleNumber }
    : undefined;
  const orderHint =
    typeof input.orderHint === 'number' && Number.isFinite(input.orderHint)
      ? input.orderHint
      : undefined;

  const collaboratorsArray = (input.collaborators ?? []).map((item, index) => ({
    id: item.id ?? `${input.id}-collab-${index}`,
    email: (item.email ?? '').trim().toLowerCase(),
    role: item.role ?? 'editor',
    userId: item.userId ?? null,
    createdAt: item.createdAt ?? now
  }));

  const collaboratorEmails = normalizeEmailList([
    ...(input.collaboratorEmails ?? []),
    ...collaboratorsArray.map((collaborator) => collaborator.email)
  ]);

  const videoUrls = Array.isArray(input.videoUrls)
    ? input.videoUrls.map((url) => (typeof url === 'string' ? url.trim() : '')).filter(Boolean)
    : [];

  return {
    id: input.id,
    name: input.name ?? 'Trabajo sin nombre',
    subtitle: normalizeOptionalText(input.subtitle),
    objectiveId: input.objectiveId ?? '',
    parentWorkId,
    nodeType,
    schedule,
    tags,
    orderHint,
    nextWorkId,
    variantOfWorkId,
    descriptionMarkdown: input.descriptionMarkdown ?? '',
    estimatedMinutes: input.estimatedMinutes ?? 0,
    notes: normalizeOptionalText(input.notes),
    videoUrls,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    visibility: input.visibility ?? 'private',
    ownerId: input.ownerId ?? 'local-owner',
    ownerEmail: (input.ownerEmail ?? '').trim().toLowerCase(),
    collaborators: collaboratorsArray,
    collaboratorEmails,
    canEdit: input.canEdit ?? true,
    isOwner: input.isOwner ?? true
  };
};

const wouldCreateParentCycle = (works: Work[], workId: string, candidateParentId?: string | null): boolean => {
  if (!candidateParentId) return false;
  if (candidateParentId === workId) return true;
  const visited = new Set<string>();
  let current: string | null | undefined = candidateParentId;
  while (current) {
    if (current === workId) {
      return true;
    }
    if (visited.has(current)) {
      break;
    }
    visited.add(current);
    const parent = works.find((work) => work.id === current)?.parentWorkId;
    current = parent ?? null;
  }
  return false;
};

const loadCollection = <T>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`No se pudo cargar ${key} desde localStorage`, error);
    return fallback;
  }
};

type PartialAttendance = Partial<SessionAttendance> & { assistantId: string };

const isAttendanceStatus = (value: unknown): value is AttendanceStatus =>
  value === 'present' || value === 'absent' || value === 'pending';

const isActualAttendanceStatus = (value: unknown): value is ActualAttendanceStatus =>
  value === 'present' || value === 'absent';

const normalizeAttendance = (attendance?: PartialAttendance[]): SessionAttendance[] =>
  (attendance ?? []).map((entry) => {
    const status = isAttendanceStatus(entry.status) ? entry.status : 'pending';
    const actualStatus = isActualAttendanceStatus(entry.actualStatus) ? entry.actualStatus : undefined;
    return {
      assistantId: entry.assistantId,
      status,
      actualStatus,
      notes: entry.notes,
      actualNotes: entry.actualNotes
    };
  });

interface CollectionsState {
  objectives: Objective[];
  works: Work[];
  sessions: Session[];
  assistants: Assistant[];
  plans: Plan[];
  kungfuPrograms: KungfuProgram[];
  kungfuCadence: KungfuCadenceConfig;
  kungfuTodayPlan: KungfuTodayPlanConfig;
  workTaxonomy: WorkTaxonomy;
}

const isQuotaExceededError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const err = error as { name?: unknown; code?: unknown };
  const name = String(err.name ?? '');
  const code = typeof err.code === 'number' ? err.code : Number(err.code);
  return name === 'QuotaExceededError' || code === 22 || code === 1014;
};

const buildCompactWorksForStorage = (works: Work[]): Work[] =>
  works.map((work) => ({
    id: work.id,
    name: work.name,
    subtitle: work.subtitle,
    objectiveId: work.objectiveId,
    parentWorkId: work.parentWorkId ?? null,
    descriptionMarkdown: '',
    estimatedMinutes: work.estimatedMinutes ?? 0,
    notes: undefined,
    videoUrls: [],
    nodeType: work.nodeType,
    schedule: work.schedule,
    tags: work.tags ?? [],
    orderHint: work.orderHint,
    nextWorkId: work.nextWorkId ?? null,
    variantOfWorkId: work.variantOfWorkId ?? null,
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    visibility: work.visibility ?? 'private',
    ownerId: work.ownerId,
    ownerEmail: work.ownerEmail,
    collaborators: [],
    collaboratorEmails: [],
    canEdit: work.canEdit,
    isOwner: work.isOwner
  }));

const persistCollections = (state: Partial<CollectionsState>) => {
  if (!isBrowser) return;
  const base: Partial<CollectionsState> = {
    objectives: loadCollection<Objective[]>(STORAGE_KEYS.objectives, []),
    works: loadCollection<Work[]>(STORAGE_KEYS.works, []),
    sessions: loadCollection<Session[]>(STORAGE_KEYS.sessions, []),
    assistants: loadCollection<Assistant[]>(STORAGE_KEYS.assistants, []),
    plans: loadCollection<Plan[]>(STORAGE_KEYS.plans, []),
    kungfuPrograms: loadCollection<KungfuProgram[]>(STORAGE_KEYS.kungfuPrograms, DEFAULT_KUNGFU_PROGRAMS),
    kungfuCadence: loadCollection<KungfuCadenceConfig>(STORAGE_KEYS.kungfuCadence, DEFAULT_KUNGFU_CADENCE),
    kungfuTodayPlan: loadCollection<KungfuTodayPlanConfig>(STORAGE_KEYS.kungfuTodayPlan, DEFAULT_KUNGFU_TODAY_PLAN),
    workTaxonomy: loadCollection<WorkTaxonomy>(STORAGE_KEYS.workTaxonomy, DEFAULT_WORK_TAXONOMY)
  };
  const normalized = normalizeCollections({ ...base, ...state });

  const safeSet = (key: string, value: unknown) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (!isQuotaExceededError(error)) {
        console.warn(`No se pudo persistir ${key} en localStorage`, error);
        return false;
      }

      if (key === STORAGE_KEYS.works) {
        try {
          const compactWorks = buildCompactWorksForStorage(normalized.works);
          window.localStorage.setItem(key, JSON.stringify(compactWorks));
          console.warn('localStorage quota alcanzada: guardando catálogo en modo reducido (sin markdown).');
          return true;
        } catch (fallbackError) {
          console.warn('localStorage quota alcanzada: no se pudo persistir el catálogo.', fallbackError);
          return false;
        }
      }

      console.warn(`localStorage quota alcanzada: omitiendo persistencia de ${key}.`);
      return false;
    }
  };

  safeSet(STORAGE_KEYS.objectives, normalized.objectives);
  safeSet(STORAGE_KEYS.works, normalized.works);
  safeSet(STORAGE_KEYS.sessions, normalized.sessions);
  safeSet(STORAGE_KEYS.assistants, normalized.assistants);
  safeSet(STORAGE_KEYS.plans, normalized.plans);
  safeSet(STORAGE_KEYS.kungfuPrograms, normalized.kungfuPrograms);
  safeSet(STORAGE_KEYS.kungfuCadence, normalized.kungfuCadence);
  safeSet(STORAGE_KEYS.kungfuTodayPlan, normalized.kungfuTodayPlan);
  safeSet(STORAGE_KEYS.workTaxonomy, normalized.workTaxonomy);
};

const normalizeCollections = (state: Partial<CollectionsState>): CollectionsState => {
  const now = nowIso();
  const works = (state.works ?? []).map((work) => {
    const legacyParent = (work as unknown as { parent_work_id?: string | null }).parent_work_id;
    return ensureWorkDefaults({
      ...work,
      id: (work as { id: string }).id,
      parentWorkId: normalizeParentWorkId(work.parentWorkId ?? legacyParent ?? null)
    });
  });

  const workTaxonomy = normalizeWorkTaxonomy(state.workTaxonomy ?? DEFAULT_WORK_TAXONOMY, works);
  const kungfuCadence = state.kungfuCadence ?? DEFAULT_KUNGFU_CADENCE;
  const kungfuTodayPlan = normalizeKungfuTodayPlan(state.kungfuTodayPlan ?? DEFAULT_KUNGFU_TODAY_PLAN);
  const plans = normalizePlans(state.plans, kungfuCadence, kungfuTodayPlan, now);

  return {
    objectives: state.objectives ?? [],
    works,
    sessions: (state.sessions ?? []).map((session) => ({
      ...session,
      planId:
        (session.planId ?? '').trim() ||
        ((session.kind ?? 'class') === 'personal' ? DEFAULT_PERSONAL_PLAN_ID : DEFAULT_CLASS_PLAN_ID),
      kind: session.kind ?? 'class',
      startTime: session.startTime ?? DEFAULT_SESSION_START_TIME,
      workItems: (session.workItems ?? []).map((item) => ({
        ...item,
        focusLabel: item.focusLabel,
        completed: item.completed ?? false
      })),
      attendance: normalizeAttendance(session.attendance as PartialAttendance[])
    })),
    assistants: state.assistants ?? [],
    plans,
    kungfuPrograms: state.kungfuPrograms ?? DEFAULT_KUNGFU_PROGRAMS,
    kungfuCadence,
    kungfuTodayPlan,
    workTaxonomy
  };
};

interface ObjectiveInput {
  name: string;
  colorHex: string;
  descriptionMarkdown: string;
}

type WorkInput = WorkCreateInput;
type WorkPatchInput = WorkUpdateInput;

interface SessionInput {
  date: string;
  kind?: 'class' | 'personal';
  planId?: string;
  title: string;
  description?: string;
  notes?: string;
  notesByGroupId?: Record<string, string>;
  startTime?: string;
}

interface SessionWorkInput {
  workId: string;
  customDescriptionMarkdown?: string;
  customDurationMinutes?: number;
  notes?: string;
  focusLabel?: string;
}

interface AssistantInput {
  name: string;
  notes?: string;
  active?: boolean;
}

interface AppState {
  ready: boolean;
  objectives: Objective[];
  works: Work[];
  worksLoading: boolean;
  sessions: Session[];
  assistants: Assistant[];
  plans: Plan[];
  kungfuPrograms: KungfuProgram[];
  kungfuCadence: KungfuCadenceConfig;
  kungfuTodayPlan: KungfuTodayPlanConfig;
  workTaxonomy: WorkTaxonomy;
  hydrate: () => void;
  setCollections: (payload: CollectionsState) => void;
  setWorks: (works: Work[]) => void;
  loadWorks: (context: WorkActionContext) => Promise<void>;
  reset: () => void;
  setKungfuPrograms: (programs: KungfuProgram[]) => void;
  setKungfuCadence: (cadence: KungfuCadenceConfig) => void;
  setKungfuTodayPlan: (plan: KungfuTodayPlanConfig) => void;
  setWorkTaxonomy: (taxonomy: WorkTaxonomy) => void;
  addPlan: (input: { name: string; kind: PlanKind }) => Plan;
  updatePlan: (id: string, patch: Partial<Omit<Plan, 'id' | 'createdAt'>>) => void;
  duplicatePlan: (id: string) => Plan | undefined;
  deletePlan: (id: string) => boolean;
  upsertNodeType: (raw: string) => string | null;
  removeNodeType: (key: string) => boolean;
  upsertTag: (raw: string) => string | null;
  removeTag: (name: string) => boolean;
  addObjective: (input: ObjectiveInput) => Objective;
  updateObjective: (id: string, patch: Partial<ObjectiveInput>) => void;
  deleteObjective: (id: string) => boolean;
  addWork: (input: WorkInput, context: WorkActionContext) => Promise<Work>;
  updateWork: (id: string, patch: WorkPatchInput, context: WorkActionContext) => Promise<Work>;
  deleteWork: (id: string, context: WorkActionContext) => Promise<boolean>;
  addSession: (input: SessionInput) => Session;
  duplicateSession: (id: string, date: string) => Session | undefined;
  updateSession: (id: string, patch: Partial<SessionInput>) => void;
  deleteSession: (id: string) => void;
  updateSessionWorkItems: (sessionId: string, items: SessionWork[]) => void;
  addWorkToSession: (sessionId: string, item: SessionWorkInput) => SessionWork | undefined;
  duplicateSessionWork: (sessionId: string, sessionWorkId: string) => SessionWork | undefined;
  removeWorkFromSession: (sessionId: string, sessionWorkId: string) => void;
  toggleSessionWorkCompletion: (sessionId: string, sessionWorkId: string, completed: boolean) => void;
  reorderSessionWork: (sessionId: string, fromIndex: number, toIndex: number) => void;
  updateSessionWorkDetails: (
    sessionId: string,
    sessionWorkId: string,
    patch: Partial<Omit<SessionWork, 'id' | 'workId' | 'order'>>
  ) => void;
  replaceSessionWork: (sessionId: string, sessionWorkId: string, workId: string) => void;
  setAttendanceActualStatus: (
    sessionId: string,
    assistantId: string,
    status: ActualAttendanceStatus,
    notes?: string
  ) => void;
  setAttendanceStatus: (
    sessionId: string,
    assistantId: string,
    status: AttendanceStatus,
    notes?: string
  ) => void;
  addAssistant: (input: AssistantInput) => Assistant;
  updateAssistant: (id: string, patch: Partial<AssistantInput>) => void;
  deleteAssistant: (id: string) => void;
  importBackup: (payload: BackupPayload) => void;
  exportBackup: () => BackupPayload;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  objectives: [],
  works: [],
  worksLoading: false,
  sessions: [],
  assistants: [],
  plans: makeDefaultPlans(nowIso(), DEFAULT_KUNGFU_CADENCE, DEFAULT_KUNGFU_TODAY_PLAN),
  kungfuPrograms: DEFAULT_KUNGFU_PROGRAMS,
  kungfuCadence: DEFAULT_KUNGFU_CADENCE,
  kungfuTodayPlan: DEFAULT_KUNGFU_TODAY_PLAN,
  workTaxonomy: DEFAULT_WORK_TAXONOMY,
  hydrate: () => {
    if (get().ready) return;
    const objectives = loadCollection<Objective[]>(STORAGE_KEYS.objectives, []);
    const works = loadCollection<Work[]>(STORAGE_KEYS.works, []).map((work) => {
      const legacyParent = (work as unknown as { parent_work_id?: string | null }).parent_work_id;
      return ensureWorkDefaults({
        ...work,
        id: (work as { id: string }).id,
        parentWorkId: normalizeParentWorkId(work.parentWorkId ?? legacyParent ?? null)
      });
    });
    const rawTaxonomy = loadCollection<WorkTaxonomy>(STORAGE_KEYS.workTaxonomy, DEFAULT_WORK_TAXONOMY);
    const workTaxonomy = normalizeWorkTaxonomy(rawTaxonomy, works);
    const sessions = loadCollection<Session[]>(STORAGE_KEYS.sessions, []).map((session) => ({
      ...session,
      planId:
        (session.planId ?? '').trim() ||
        ((session.kind ?? 'class') === 'personal' ? DEFAULT_PERSONAL_PLAN_ID : DEFAULT_CLASS_PLAN_ID),
      kind: session.kind ?? 'class',
      startTime: session.startTime ?? DEFAULT_SESSION_START_TIME,
      workItems: (session.workItems ?? []).map((item) => ({
        ...item,
        focusLabel: item.focusLabel,
        completed: item.completed ?? false
      })),
      attendance: normalizeAttendance(session.attendance as PartialAttendance[])
    }));
    const assistants = loadCollection<Assistant[]>(STORAGE_KEYS.assistants, []);
    const kungfuPrograms = loadCollection<KungfuProgram[]>(STORAGE_KEYS.kungfuPrograms, DEFAULT_KUNGFU_PROGRAMS);
    const kungfuCadence = loadCollection<KungfuCadenceConfig>(STORAGE_KEYS.kungfuCadence, DEFAULT_KUNGFU_CADENCE);
    const kungfuTodayPlan = loadCollection<KungfuTodayPlanConfig>(
      STORAGE_KEYS.kungfuTodayPlan,
      DEFAULT_KUNGFU_TODAY_PLAN
    );
    const normalizedTodayPlan = normalizeKungfuTodayPlan(kungfuTodayPlan);
    const plansRaw = loadCollection<Plan[]>(STORAGE_KEYS.plans, []);
    const plans = normalizePlans(plansRaw, kungfuCadence, normalizedTodayPlan, nowIso());
    set({
      objectives,
      works,
      sessions,
      assistants,
      plans,
      kungfuPrograms,
      kungfuCadence,
      kungfuTodayPlan: normalizedTodayPlan,
      workTaxonomy,
      ready: true
    });
  },
  setCollections: (payload) => {
    set((state) => {
      const normalized = normalizeCollections({
        objectives: payload.objectives ?? state.objectives,
        works: payload.works ?? state.works,
        sessions: payload.sessions ?? state.sessions,
        assistants: payload.assistants ?? state.assistants,
        plans: payload.plans ?? state.plans,
        kungfuPrograms: payload.kungfuPrograms ?? state.kungfuPrograms,
        kungfuCadence: payload.kungfuCadence ?? state.kungfuCadence,
        kungfuTodayPlan: payload.kungfuTodayPlan ?? state.kungfuTodayPlan,
        workTaxonomy: payload.workTaxonomy ?? state.workTaxonomy
      });
      const merged = {
        ...state,
        ...normalized,
        ready: true
      };
      persistCollections(normalized);
      return merged;
    });
  },
  setWorks: (works) => {
    const normalized = works.map((work) => ensureWorkDefaults(work));
    set((state) => {
      const workTaxonomy = normalizeWorkTaxonomy(state.workTaxonomy, normalized);
      const merged = {
        ...state,
        works: normalized,
        workTaxonomy
      };
      persistCollections({ works: normalized });
      return merged;
    });
  },
  loadWorks: async (context) => {
    set({ worksLoading: true });
    try {
      const fetched = await fetchAccessibleWorks(context);
      const normalizedFetched = fetched.map((work) => ensureWorkDefaults(work));
      const existing = get().works;
      const remoteIds = new Set(normalizedFetched.map((work) => work.id));

      const legacyCandidates = existing.filter(
        (work) =>
          !remoteIds.has(work.id) &&
          (!work.ownerId || work.ownerId === 'local-owner' || work.ownerId === context.actorId)
      );

      const migratedWorks: Work[] = [];
      for (const legacy of legacyCandidates) {
        try {
          const migrated = await createWorkRemote(
            {
              id: legacy.id,
              name: legacy.name,
              subtitle: legacy.subtitle,
              objectiveId: legacy.objectiveId,
              parentWorkId: legacy.parentWorkId ?? null,
              nodeType: legacy.nodeType,
              tags: legacy.tags,
              orderHint: legacy.orderHint,
              nextWorkId: legacy.nextWorkId ?? null,
              variantOfWorkId: legacy.variantOfWorkId ?? null,
              descriptionMarkdown: legacy.descriptionMarkdown,
              estimatedMinutes: legacy.estimatedMinutes,
              notes: legacy.notes,
              videoUrls: legacy.videoUrls,
              visibility: legacy.visibility ?? 'private',
              collaboratorEmails: legacy.collaboratorEmails ?? []
            },
            context
          );
          const normalizedMigrated = ensureWorkDefaults(migrated);
          migratedWorks.push(normalizedMigrated);
          remoteIds.add(normalizedMigrated.id);
        } catch (error) {
          console.error(`No se pudo migrar el trabajo legacy ${legacy.id}`, error);
        }
      }

      const combined = [...normalizedFetched];
      migratedWorks.forEach((work) => {
        if (!remoteIds.has(work.id)) {
          remoteIds.add(work.id);
          combined.push(work);
        } else {
          const index = combined.findIndex((item) => item.id === work.id);
          if (index >= 0) {
            combined[index] = work;
          } else {
            combined.push(work);
          }
        }
      });

      const normalized = combined
        .map((work) => ensureWorkDefaults(work))
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

      set((state) => {
        const workTaxonomy = normalizeWorkTaxonomy(state.workTaxonomy, normalized);
        const merged = {
          ...state,
          works: normalized,
          workTaxonomy
        };
        persistCollections({ works: normalized });
        return merged;
      });
    } finally {
      set({ worksLoading: false });
    }
  },
  reset: () => {
    set((state) => {
      const normalized = normalizeCollections({
        objectives: [],
        works: [],
        sessions: [],
        assistants: [],
        kungfuPrograms: DEFAULT_KUNGFU_PROGRAMS,
        kungfuCadence: DEFAULT_KUNGFU_CADENCE,
        kungfuTodayPlan: DEFAULT_KUNGFU_TODAY_PLAN,
        workTaxonomy: DEFAULT_WORK_TAXONOMY
      });
      const merged = {
        ...state,
        ...normalized,
        ready: true,
        worksLoading: false
      };
      persistCollections(merged);
      return merged;
    });
  },
  setKungfuPrograms: (programs) => {
    const normalizedPrograms = Array.isArray(programs) ? programs : DEFAULT_KUNGFU_PROGRAMS;
    set((state) => {
      const merged = { ...state, kungfuPrograms: normalizedPrograms };
      persistCollections(merged);
      return merged;
    });
  },
  setKungfuCadence: (cadence) => {
    const normalizedCadence = cadence ?? DEFAULT_KUNGFU_CADENCE;
    set((state) => {
      const merged = { ...state, kungfuCadence: normalizedCadence };
      persistCollections(merged);
      return merged;
    });
  },
  setKungfuTodayPlan: (plan) => {
    const normalizedPlan = normalizeKungfuTodayPlan(plan ?? DEFAULT_KUNGFU_TODAY_PLAN);
    set((state) => {
      const merged = { ...state, kungfuTodayPlan: normalizedPlan };
      persistCollections(merged);
      return merged;
    });
  },
  setWorkTaxonomy: (taxonomy) => {
    set((state) => {
      const workTaxonomy = normalizeWorkTaxonomy(taxonomy ?? DEFAULT_WORK_TAXONOMY, state.works);
      const merged = { ...state, workTaxonomy };
      persistCollections(merged);
      return merged;
    });
  },
  addPlan: ({ name, kind }) => {
    const now = nowIso();
    const plan: Plan = {
      id: nanoid(),
      name: name.trim() || (kind === 'class' ? 'Clases' : 'Personal'),
      kind,
      enabled: true,
      cadence: kind === 'personal' ? get().kungfuCadence : undefined,
      todayPlan: kind === 'personal' ? get().kungfuTodayPlan : undefined,
      createdAt: now,
      updatedAt: now
    };
    set((state) => {
      const plans = normalizePlans([...state.plans, plan], state.kungfuCadence, state.kungfuTodayPlan, now);
      const merged = { ...state, plans };
      persistCollections(merged);
      return merged;
    });
    return plan;
  },
  updatePlan: (id, patch) => {
    const now = nowIso();
    set((state) => {
      const plans = normalizePlans(
        state.plans.map((plan) =>
          plan.id === id
            ? {
                ...plan,
                ...patch,
                updatedAt: now
              }
            : plan
        ),
        state.kungfuCadence,
        state.kungfuTodayPlan,
        now
      );
      const merged = { ...state, plans };
      persistCollections(merged);
      return merged;
    });
  },
  duplicatePlan: (id) => {
    const source = get().plans.find((plan) => plan.id === id);
    if (!source) return undefined;
    const now = nowIso();
    const clone: Plan = {
      ...source,
      id: nanoid(),
      name: `${source.name} (copia)`,
      createdAt: now,
      updatedAt: now
    };
    set((state) => {
      const plans = normalizePlans([...state.plans, clone], state.kungfuCadence, state.kungfuTodayPlan, now);
      const merged = { ...state, plans };
      persistCollections(merged);
      return merged;
    });
    return clone;
  },
  deletePlan: (id) => {
    const state = get();
    if (id === DEFAULT_CLASS_PLAN_ID || id === DEFAULT_PERSONAL_PLAN_ID) return false;
    const hasSessions = state.sessions.some((session) => (session.planId ?? '') === id);
    if (hasSessions) return false;
    set((prev) => {
      const now = nowIso();
      const plans = normalizePlans(
        prev.plans.filter((plan) => plan.id !== id),
        prev.kungfuCadence,
        prev.kungfuTodayPlan,
        now
      );
      const merged = { ...prev, plans };
      persistCollections(merged);
      return merged;
    });
    return true;
  },
  upsertNodeType: (raw) => {
    const key = slugify(raw);
    if (!key) return null;
    const label = raw.trim() || key;
    set((state) => {
      const existing = state.workTaxonomy.nodeTypes ?? [];
      const next = existing.some((nt) => nt.key === key)
        ? existing.map((nt) => (nt.key === key ? { ...nt, label } : nt))
        : [...existing, { key, label }];
      const workTaxonomy = normalizeWorkTaxonomy(
        { ...state.workTaxonomy, nodeTypes: next },
        state.works
      );
      const merged = { ...state, workTaxonomy };
      persistCollections(merged);
      return merged;
    });
    return key;
  },
  removeNodeType: (key) => {
    const normalizedKey = (key ?? '').trim().toLowerCase();
    if (!normalizedKey) return false;
    const inUse = get().works.some((work) => (work.nodeType ?? '').trim().toLowerCase() === normalizedKey);
    if (inUse) return false;
    set((state) => {
      const next = (state.workTaxonomy.nodeTypes ?? []).filter((nt) => nt.key !== normalizedKey);
      const workTaxonomy = normalizeWorkTaxonomy({ ...state.workTaxonomy, nodeTypes: next }, state.works);
      const merged = { ...state, workTaxonomy };
      persistCollections(merged);
      return merged;
    });
    return true;
  },
  upsertTag: (raw) => {
    const name = slugify(raw);
    if (!name) return null;
    set((state) => {
      const existing = state.workTaxonomy.tags ?? [];
      const next = existing.some((tag) => tag.name === name) ? existing : [...existing, { name }];
      const workTaxonomy = normalizeWorkTaxonomy({ ...state.workTaxonomy, tags: next }, state.works);
      const merged = { ...state, workTaxonomy };
      persistCollections(merged);
      return merged;
    });
    return name;
  },
  removeTag: (name) => {
    const normalizedName = slugify(name ?? '');
    if (!normalizedName) return false;
    const inUse = get().works.some((work) => (work.tags ?? []).includes(normalizedName));
    if (inUse) return false;
    set((state) => {
      const next = (state.workTaxonomy.tags ?? []).filter((tag) => tag.name !== normalizedName);
      const workTaxonomy = normalizeWorkTaxonomy({ ...state.workTaxonomy, tags: next }, state.works);
      const merged = { ...state, workTaxonomy };
      persistCollections(merged);
      return merged;
    });
    return true;
  },
  addObjective: (input) => {
    const objective: Objective = {
      id: nanoid(),
      name: input.name,
      colorHex: input.colorHex,
      descriptionMarkdown: input.descriptionMarkdown,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    set((state) => {
      const next = { objectives: [...state.objectives, objective] };
      const merged = { ...state, ...next };
      persistCollections(merged);
      return merged;
    });
    return objective;
  },
  updateObjective: (id, patch) => {
    set((state) => {
      const objectives = state.objectives.map((objective) =>
        objective.id === id
          ? {
              ...objective,
              ...patch,
              updatedAt: nowIso()
            }
          : objective
      );
      const merged = { ...state, objectives };
      persistCollections(merged);
      return merged;
    });
  },
  deleteObjective: (id) => {
    const hasWorks = get().works.some((work) => work.objectiveId === id);
    if (hasWorks) return false;
    set((state) => {
      const objectives = state.objectives.filter((objective) => objective.id !== id);
      const merged = { ...state, objectives };
      persistCollections(merged);
      return merged;
    });
    return true;
  },
  addWork: async (input, context) => {
    const state = get();
    const parentCandidate = normalizeParentWorkId(input.parentWorkId);
    const parentWorkId =
      parentCandidate && state.works.some((work) => work.id === parentCandidate)
        ? parentCandidate
        : null;

    const payload: WorkCreateInput = {
      name: input.name,
      subtitle: normalizeOptionalText(input.subtitle),
      objectiveId: input.objectiveId,
      parentWorkId,
      nodeType: normalizeOptionalText(input.nodeType) ?? undefined,
      tags: normalizeTagList(input.tags),
      orderHint:
        typeof input.orderHint === 'number' && Number.isFinite(input.orderHint) ? input.orderHint : undefined,
      nextWorkId: normalizeParentWorkId(input.nextWorkId ?? null),
      variantOfWorkId: normalizeParentWorkId(input.variantOfWorkId ?? null),
      descriptionMarkdown: input.descriptionMarkdown,
      estimatedMinutes: input.estimatedMinutes,
      notes: normalizeOptionalText(input.notes),
      videoUrls: (input.videoUrls ?? []).map((url) => url.trim()).filter((url) => url.length > 0),
      visibility: input.visibility ?? 'private',
      collaboratorEmails: normalizeEmailList(input.collaboratorEmails ?? [])
    };

    const created = await createWorkRemote(payload, context);
    const normalized = ensureWorkDefaults(created);

    set((prev) => {
      const works = [...prev.works.filter((work) => work.id !== normalized.id), normalized];
      const workTaxonomy = normalizeWorkTaxonomy(prev.workTaxonomy, works);
      persistCollections({ works, workTaxonomy });
      return {
        ...prev,
        works,
        workTaxonomy
      };
    });

    return normalized;
  },
  updateWork: async (id, patch, context) => {
    const state = get();
    const currentWork = state.works.find((work) => work.id === id);
    if (!currentWork) {
      throw new Error('Trabajo no encontrado');
    }

    let parentWorkId = currentWork.parentWorkId ?? null;
    if (patch.parentWorkId !== undefined) {
      const candidate = normalizeParentWorkId(patch.parentWorkId);
      if (
        candidate &&
        (!state.works.some((item) => item.id === candidate) ||
          wouldCreateParentCycle(state.works, id, candidate))
      ) {
        parentWorkId = null;
      } else {
        parentWorkId = candidate;
      }
    }

    const payload: WorkUpdateInput = {
      ...patch,
      subtitle: patch.subtitle !== undefined ? normalizeOptionalText(patch.subtitle) ?? null : undefined,
      parentWorkId,
      nodeType: patch.nodeType !== undefined ? normalizeOptionalText(patch.nodeType ?? undefined) ?? null : undefined,
      tags: patch.tags ? normalizeTagList(patch.tags) : undefined,
      orderHint:
        patch.orderHint !== undefined
          ? typeof patch.orderHint === 'number' && Number.isFinite(patch.orderHint)
            ? patch.orderHint
            : null
          : undefined,
      nextWorkId:
        patch.nextWorkId !== undefined ? normalizeParentWorkId(patch.nextWorkId ?? null) : undefined,
      variantOfWorkId:
        patch.variantOfWorkId !== undefined ? normalizeParentWorkId(patch.variantOfWorkId ?? null) : undefined,
      notes: patch.notes !== undefined ? normalizeOptionalText(patch.notes) ?? null : undefined,
      videoUrls: patch.videoUrls
        ? patch.videoUrls.map((url) => url.trim()).filter((url) => url.length > 0)
        : undefined,
      collaboratorEmails: patch.collaboratorEmails
        ? normalizeEmailList(patch.collaboratorEmails)
        : undefined
    };

    const updated = await updateWorkRemote(id, payload, context);
    const normalized = ensureWorkDefaults(updated);

    set((prev) => {
      const works = prev.works.map((work) => (work.id === normalized.id ? normalized : work));
      const workTaxonomy = normalizeWorkTaxonomy(prev.workTaxonomy, works);
      persistCollections({ works, workTaxonomy });
      return {
        ...prev,
        works,
        workTaxonomy
      };
    });

    return normalized;
  },
  deleteWork: async (id, _context) => {
    const isInSession = get().sessions.some((session) =>
      session.workItems.some((item) => item.workId === id)
    );
    if (isInSession) return false;
    const hasChildren = get().works.some((work) => work.parentWorkId === id);
    if (hasChildren) return false;

    await deleteWorkRemote(id);

    set((state) => {
      const works = state.works.filter((work) => work.id !== id);
      const workTaxonomy = normalizeWorkTaxonomy(state.workTaxonomy, works);
      persistCollections({ works, workTaxonomy });
      return {
        ...state,
        works,
        workTaxonomy
      };
    });
    return true;
  },
  addSession: (input) => {
    const planId =
      (input.planId ?? '').trim() ||
      ((input.kind ?? 'class') === 'personal' ? DEFAULT_PERSONAL_PLAN_ID : DEFAULT_CLASS_PLAN_ID);
    const session: Session = {
      id: nanoid(),
      planId,
      date: input.date,
      kind: input.kind ?? (get().plans.find((plan) => plan.id === planId)?.kind ?? 'class'),
      title: input.title,
      description: input.description,
      notes: input.notes,
      notesByGroupId: input.notesByGroupId,
      workItems: [],
      attendance: [],
      startTime: input.startTime ?? DEFAULT_SESSION_START_TIME,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    set((state) => {
      const sessions = [...state.sessions, session];
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
    return session;
  },
  duplicateSession: (id, date) => {
    const session = get().sessions.find((s) => s.id === id);
    if (!session) return undefined;
    const now = nowIso();
    const clone: Session = {
      ...session,
      id: nanoid(),
      date,
      startTime: session.startTime ?? DEFAULT_SESSION_START_TIME,
      createdAt: now,
      updatedAt: now,
      title: `${session.title} (copia)`
    };
    clone.workItems = session.workItems
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        ...item,
        id: nanoid(),
        order: index,
        completed: false
      }));
    clone.attendance = session.attendance.map((entry) => ({
      assistantId: entry.assistantId,
      status: 'pending',
      notes: entry.notes,
      actualStatus: undefined,
      actualNotes: undefined
    }));
    set((state) => {
      const sessions = [...state.sessions, clone];
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
    return clone;
  },
  updateSession: (id, patch) => {
    set((state) => {
      const sessions = state.sessions.map((session) =>
        session.id === id
          ? {
              ...session,
              ...patch,
              updatedAt: nowIso()
            }
          : session
      );
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  deleteSession: (id) => {
    set((state) => {
      const sessions = state.sessions.filter((session) => session.id !== id);
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  updateSessionWorkItems: (sessionId, items) => {
    set((state) => {
      const sessions = state.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              workItems: items.map((item, index) => ({ ...item, order: index })),
              updatedAt: nowIso()
            }
          : session
      );
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  addWorkToSession: (sessionId, input) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return undefined;
    const newItem: SessionWork = {
      id: nanoid(),
      workId: input.workId,
      customDescriptionMarkdown: input.customDescriptionMarkdown,
      customDurationMinutes: input.customDurationMinutes,
      notes: input.notes,
      focusLabel: input.focusLabel,
      completed: false,
      order: session.workItems.length
    };
    const updated = {
      ...session,
      workItems: [...session.workItems, newItem],
      updatedAt: nowIso()
    };
    set((state) => {
      const sessions = state.sessions.map((s) => (s.id === sessionId ? updated : s));
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
    return newItem;
  },
  duplicateSessionWork: (sessionId, sessionWorkId) => {
    let duplicatedItem: SessionWork | undefined;
    let didUpdate = false;
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const targetIndex = session.workItems.findIndex((item) => item.id === sessionWorkId);
        if (targetIndex === -1) return session;
        didUpdate = true;
        const source = session.workItems[targetIndex];
        const cloned: SessionWork = {
          ...source,
          id: nanoid(),
          completed: false
        };
        const items = [...session.workItems];
        items.splice(targetIndex + 1, 0, cloned);
        const workItems = items.map((item, order) => {
          const next = { ...item, order };
          if (item.id === cloned.id) {
            duplicatedItem = next;
          }
          return next;
        });
        return {
          ...session,
          workItems,
          updatedAt: nowIso()
        };
      });
      if (!didUpdate) {
        return state;
      }
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
    return duplicatedItem;
  },
  removeWorkFromSession: (sessionId, sessionWorkId) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const workItems = session.workItems
          .filter((item) => item.id !== sessionWorkId)
          .map((item, index) => ({ ...item, order: index }));
        return {
          ...session,
          workItems,
          updatedAt: nowIso()
        };
      });
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  toggleSessionWorkCompletion: (sessionId, sessionWorkId, completed) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          workItems: session.workItems.map((item) =>
            item.id === sessionWorkId
              ? {
                  ...item,
                  completed
                }
              : item
          ),
          updatedAt: nowIso()
        };
      });
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  reorderSessionWork: (sessionId, fromIndex, toIndex) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const items = [...session.workItems];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        return {
          ...session,
          workItems: items.map((item, index) => ({ ...item, order: index })),
          updatedAt: nowIso()
        };
      });
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  updateSessionWorkDetails: (sessionId, sessionWorkId, patch) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          workItems: session.workItems.map((item) =>
            item.id === sessionWorkId
              ? {
                  ...item,
                  ...patch
                }
              : item
          ),
          updatedAt: nowIso()
        };
      });
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  replaceSessionWork: (sessionId, sessionWorkId, workId) => {
    if (!get().works.some((work) => work.id === workId)) return;
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const workItems = session.workItems.map((item) => {
          if (item.id !== sessionWorkId) return item;
          return {
            ...item,
            workId,
            customDescriptionMarkdown: undefined,
            customDurationMinutes: undefined,
            notes: undefined,
            focusLabel: undefined,
            completed: false
          };
        });
        return {
          ...session,
          workItems,
          updatedAt: nowIso()
        };
      });
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  setAttendanceActualStatus: (sessionId, assistantId, status, notes) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const existing = session.attendance.find((entry) => entry.assistantId === assistantId);
        let attendance: SessionAttendance[];
        if (existing) {
          attendance = session.attendance.map((entry) => {
            if (entry.assistantId !== assistantId) return entry;
            const next: SessionAttendance = {
              ...entry,
              actualStatus: status
            };
            if (typeof notes !== 'undefined') {
              next.actualNotes = notes;
            }
            return next;
          });
        } else {
          const nextEntry: SessionAttendance = {
            assistantId,
            status: 'pending',
            actualStatus: status
          };
          if (typeof notes !== 'undefined') {
            nextEntry.actualNotes = notes;
          }
          attendance = [...session.attendance, nextEntry];
        }
        return {
          ...session,
          attendance,
          updatedAt: nowIso()
        };
      });
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  setAttendanceStatus: (sessionId, assistantId, status, notes) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const existing = session.attendance.find((entry) => entry.assistantId === assistantId);
        let attendance: SessionAttendance[];
        if (existing) {
          attendance = session.attendance.map((entry) =>
            entry.assistantId === assistantId
              ? { ...entry, status, notes }
              : entry
          );
        } else {
          attendance = [
            ...session.attendance,
            {
              assistantId,
              status,
              notes
            }
          ];
        }
        return {
          ...session,
          attendance,
          updatedAt: nowIso()
        };
      });
      const merged = { ...state, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  addAssistant: (input) => {
    const assistant: Assistant = {
      id: nanoid(),
      name: input.name,
      notes: input.notes,
      active: input.active ?? true,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    set((state) => {
      const assistants = [...state.assistants, assistant];
      const merged = { ...state, assistants };
      persistCollections(merged);
      return merged;
    });
    return assistant;
  },
  updateAssistant: (id, patch) => {
    set((state) => {
      const assistants = state.assistants.map((assistant) =>
        assistant.id === id
          ? {
              ...assistant,
              ...patch,
              updatedAt: nowIso()
            }
          : assistant
      );
      const merged = { ...state, assistants };
      persistCollections(merged);
      return merged;
    });
  },
  deleteAssistant: (id) => {
    set((state) => {
      const assistants = state.assistants.filter((assistant) => assistant.id !== id);
      const sessions = state.sessions.map((session) => ({
        ...session,
        attendance: session.attendance.filter((entry) => entry.assistantId !== id)
      }));
      const merged = { ...state, assistants, sessions };
      persistCollections(merged);
      return merged;
    });
  },
  importBackup: (payload) => {
    const version = payload.version ?? 1;
    if (version !== 1) {
      throw new Error('Versión de backup no soportada');
    }
    const now = nowIso();

    const objectives = (payload.objetivos ?? []).map((objective) => ({
      ...objective,
      createdAt: objective.createdAt ?? now,
      updatedAt: objective.updatedAt ?? now
    }));

    const works = (payload.trabajos ?? []).map((work) => {
      const legacyParent = (work as unknown as { parent_work_id?: string | null }).parent_work_id;
      const legacyNodeType = (work as unknown as { node_type?: string | null }).node_type;
      const legacyTags = (work as unknown as { tags?: unknown }).tags;
      const legacyOrderHint = (work as unknown as { order_hint?: number | null }).order_hint;
      const legacyNext = (work as unknown as { next_work_id?: string | null }).next_work_id;
      const legacyVariant = (work as unknown as { variant_of_work_id?: string | null }).variant_of_work_id;
      return {
        ...work,
        subtitle: normalizeOptionalText(work.subtitle),
        parentWorkId: normalizeParentWorkId(work.parentWorkId ?? legacyParent ?? null),
        nodeType: normalizeOptionalText(work.nodeType ?? legacyNodeType ?? undefined),
        tags: normalizeTagList(
          Array.isArray(work.tags)
            ? work.tags
            : Array.isArray(legacyTags)
              ? (legacyTags as string[])
              : []
        ),
        orderHint:
          typeof work.orderHint === 'number'
            ? work.orderHint
            : typeof legacyOrderHint === 'number'
              ? legacyOrderHint
              : undefined,
        nextWorkId: normalizeParentWorkId(work.nextWorkId ?? legacyNext ?? null),
        variantOfWorkId: normalizeParentWorkId(work.variantOfWorkId ?? legacyVariant ?? null),
        createdAt: work.createdAt ?? now,
        updatedAt: work.updatedAt ?? now,
        videoUrls: work.videoUrls ?? []
      };
    });

    const assistants = (payload.asistentes ?? []).map((assistant) => ({
      ...assistant,
      createdAt: assistant.createdAt ?? now,
      updatedAt: assistant.updatedAt ?? now,
      active: assistant.active ?? true
    }));

    const kungfuPrograms = payload.kungfuPrograms ?? DEFAULT_KUNGFU_PROGRAMS;
    const kungfuCadence = payload.kungfuCadence ?? DEFAULT_KUNGFU_CADENCE;
    const kungfuTodayPlan = payload.kungfuTodayPlan ?? DEFAULT_KUNGFU_TODAY_PLAN;
    const workTaxonomy = normalizeWorkTaxonomy(payload.workTaxonomy ?? DEFAULT_WORK_TAXONOMY, works);
    const plans = normalizePlans(payload.plans, kungfuCadence, normalizeKungfuTodayPlan(kungfuTodayPlan), now);

    const sessionsById = new Map<string, Session>();

    (payload.sesiones ?? []).forEach((raw: BackupSession) => {
      const sessionId = raw.id ?? nanoid();
      const rawNotesByGroup = (raw as unknown as { notesByGroupId?: Record<string, string> | null }).notesByGroupId ?? undefined;
      const session: Session = {
        id: sessionId,
        planId:
          (raw.planId ?? '').trim() ||
          ((raw.kind ?? 'class') === 'personal' ? DEFAULT_PERSONAL_PLAN_ID : DEFAULT_CLASS_PLAN_ID),
        date: raw.date ?? dayjs().format('YYYY-MM-DD'),
        kind: raw.kind ?? 'class',
        title: raw.title ?? 'Sesión importada',
        description: raw.description,
        notes: raw.notes,
        notesByGroupId: rawNotesByGroup ?? undefined,
        workItems: (raw.workItems ?? []).map((item, index) => ({
          id: item.id ?? nanoid(),
          workId: item.workId,
          order: item.order ?? index,
          customDescriptionMarkdown: item.customDescriptionMarkdown,
          customDurationMinutes: item.customDurationMinutes,
          notes: item.notes,
          focusLabel: item.focusLabel,
          completed: item.completed ?? false,
          result: item.result,
          effort: item.effort
        })),
        attendance: normalizeAttendance(raw.attendance as PartialAttendance[]),
        startTime: raw.startTime ?? DEFAULT_SESSION_START_TIME,
        createdAt: raw.createdAt ?? now,
        updatedAt: raw.updatedAt ?? now
      };
      session.workItems = session.workItems
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index }));
      sessionsById.set(sessionId, session);
    });

    (payload.sesiones_trabajos ?? []).forEach((raw: BackupSessionWork) => {
      const sessionId = raw.session_id;
      if (!sessionId) return;
      if (!sessionsById.has(sessionId)) {
        sessionsById.set(sessionId, {
          id: sessionId,
          planId: DEFAULT_CLASS_PLAN_ID,
          date: raw.fecha ? dayjs(raw.fecha).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          kind: 'class',
          title: raw.titulo ?? 'Sesión importada',
          description: raw.descripcion,
          notes: raw.notasSesion ?? raw.notas,
          workItems: [],
          attendance: [],
          startTime: DEFAULT_SESSION_START_TIME,
          createdAt: now,
          updatedAt: now
        });
      }
      const session = sessionsById.get(sessionId)!;
      session.workItems.push({
        id: raw.id ?? nanoid(),
        workId: raw.trabajo_id,
        order: raw.orden ?? session.workItems.length,
        customDescriptionMarkdown: raw.descripcionPersonalizada,
        customDurationMinutes: raw.duracionPersonalizada,
        notes: raw.notas,
        focusLabel: raw.focusLabel ?? raw.foco,
        completed: raw.completed ?? false,
        result: (raw.result ?? raw.resultado) as SessionWork['result'] | undefined,
        effort: raw.effort ?? raw.esfuerzo
      });
    });

    sessionsById.forEach((session) => {
      session.workItems = session.workItems
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index }));
      session.startTime = session.startTime ?? DEFAULT_SESSION_START_TIME;
    });

    const attendanceBySession = new Map<string, SessionAttendance[]>();
    const parseAttendanceStatus = (value?: string): AttendanceStatus | undefined =>
      isAttendanceStatus(value) ? value : undefined;
    const parseActualAttendanceStatus = (value?: string): ActualAttendanceStatus | undefined =>
      isActualAttendanceStatus(value) ? value : undefined;
    (payload.sesiones_asistencias ?? []).forEach((raw: BackupSessionAttendance) => {
      const sessionId = raw.session_id;
      if (!sessionId) return;
      const assistantId = raw.assistantId ?? raw.asistente_id;
      if (!assistantId) return;
      const status = parseAttendanceStatus(raw.status ?? raw.estado) ?? 'pending';
      const actualStatus = parseActualAttendanceStatus(raw.actualStatus ?? raw.estado_real);
      const entry: SessionAttendance = {
        assistantId,
        status,
        notes: raw.notes ?? raw.notas,
        actualStatus: actualStatus,
        actualNotes: raw.actualNotes ?? raw.notas_reales
      };
      const list = attendanceBySession.get(sessionId) ?? [];
      list.push(entry);
      attendanceBySession.set(sessionId, list);
    });

    attendanceBySession.forEach((attendance, sessionId) => {
      const session = sessionsById.get(sessionId);
      if (session) {
        session.attendance = attendance;
      }
    });

    const sessions = Array.from(sessionsById.values());

    set({
      objectives,
      works,
      sessions,
      assistants,
      plans,
      kungfuPrograms,
      kungfuCadence,
      kungfuTodayPlan,
      workTaxonomy,
      ready: true
    });
    persistCollections({
      objectives,
      works,
      sessions,
      assistants,
      plans,
      kungfuPrograms,
      kungfuCadence,
      kungfuTodayPlan,
      workTaxonomy
    });
  },
  exportBackup: () => {
    const state = get();
    const sesionesTrabajos: BackupSessionWork[] = state.sessions.flatMap((session) =>
      session.workItems.map((item) => ({
        id: item.id,
        session_id: session.id,
        trabajo_id: item.workId,
        orden: item.order,
        descripcionPersonalizada: item.customDescriptionMarkdown,
        duracionPersonalizada: item.customDurationMinutes,
        notas: item.notes,
        foco: item.focusLabel,
        focusLabel: item.focusLabel,
        completed: item.completed ?? false,
        result: item.result,
        effort: item.effort
      }))
    );
    const sesionesAsistencias: BackupSessionAttendance[] = state.sessions.flatMap((session) =>
      session.attendance.map((entry) => ({
        session_id: session.id,
        assistantId: entry.assistantId,
        estado: entry.status,
        notas: entry.notes,
        ...(entry.actualStatus
          ? {
              actualStatus: entry.actualStatus,
              estado_real: entry.actualStatus
            }
          : {}),
        ...(entry.actualNotes
          ? {
              actualNotes: entry.actualNotes,
              notas_reales: entry.actualNotes
            }
          : {})
      }))
    );

    const sesiones: BackupSession[] = state.sessions.map((session) => ({
      id: session.id,
      planId: session.planId,
      date: session.date,
      kind: session.kind,
      title: session.title,
      description: session.description,
      notes: session.notes,
      notesByGroupId: session.notesByGroupId,
      startTime: session.startTime,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));

    const payload: BackupPayload = {
      version: 1,
      usuarios: [],
      objetivos: state.objectives,
      trabajos: state.works,
      sesiones,
      sesiones_trabajos: sesionesTrabajos,
      asistentes: state.assistants,
      sesiones_asistencias: sesionesAsistencias,
      plans: state.plans,
      kungfuPrograms: state.kungfuPrograms,
      kungfuCadence: state.kungfuCadence,
      kungfuTodayPlan: state.kungfuTodayPlan,
      workTaxonomy: state.workTaxonomy
    };
    return payload;
  }
}));

export type { AppState, CollectionsState };
