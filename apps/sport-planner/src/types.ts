export type AttendanceStatus = 'present' | 'absent' | 'pending';
export type ActualAttendanceStatus = Extract<AttendanceStatus, 'present' | 'absent'>;

export interface Objective {
  id: string;
  name: string;
  colorHex: string;
  descriptionMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkVisibility = 'private' | 'shared' | 'public';

export interface WorkCollaborator {
  id: string;
  email: string;
  role: 'editor';
  userId?: string | null;
  createdAt: string;
}

export interface NodeTypeDefinition {
  key: string;
  label: string;
}

export interface TagDefinition {
  name: string;
}

export interface WorkTaxonomy {
  nodeTypes: NodeTypeDefinition[];
  tags: TagDefinition[];
}

export type WorkScheduleKind = 'day_of_year' | 'day_of_month' | 'day_of_week';

export interface WorkSchedule {
  kind: WorkScheduleKind;
  number: number;
}

export type EbookMode = 'daily_fixed' | 'sequential';

export interface EbookRef {
  /**
   * Stable identifier coming from ebooks.json (e.g. "diario-del-guerrero").
   */
  ebookId: string;
  /**
   * Absolute or host-relative URL to the ebook index.json (e.g. https://.../ebooks/foo/index.json).
   */
  indexUrl: string;
  mode: EbookMode;
}

export interface Work {
  id: string;
  name: string;
  subtitle?: string;
  objectiveId: string;
  parentWorkId?: string | null;
  descriptionMarkdown: string;
  estimatedMinutes: number;
  notes?: string;
  videoUrls: string[];
  nodeType?: string;
  schedule?: WorkSchedule;
  ebookRef?: EbookRef;
  tags: string[];
  orderHint?: number;
  nextWorkId?: string | null;
  variantOfWorkId?: string | null;
  createdAt: string;
  updatedAt: string;
  visibility: WorkVisibility;
  ownerId: string;
  ownerEmail: string;
  collaborators?: WorkCollaborator[];
  collaboratorEmails?: string[];
  canEdit?: boolean;
  isOwner?: boolean;
}

export type SessionKind = 'class' | 'personal';

export type PlanKind = SessionKind;

export interface Plan {
  id: string;
  name: string;
  kind: PlanKind;
  enabled: boolean;
  cadence?: KungfuCadenceConfig;
  todayPlan?: KungfuTodayPlanConfig;
  createdAt: string;
  updatedAt: string;
}

export interface KungfuProgramSelector {
  byTags?: string[];
  byWorkIds?: string[];
  byNodeTypes?: string[];
}

export interface KungfuProgram {
  id: string;
  name: string;
  enabled: boolean;
  include: KungfuProgramSelector[];
  exclude: KungfuProgramSelector[];
}

export interface KungfuCadenceOverride {
  match: {
    tagsAny: string[];
  };
  multiplier: number;
}

export interface KungfuCadenceConfig {
  targetsDays: Record<string, number>;
  overrides: KungfuCadenceOverride[];
}

export type KungfuTodayLimitMode = 'count' | 'minutes' | 'both';

export interface KungfuTodayTemplate {
  totalMinutes: number;
  focusMinutes: number;
  rouletteMinutes: number;
  recapMinutes: number;
}

export interface KungfuTodayPlanConfig {
  limitMode: KungfuTodayLimitMode;
  maxItems: number;
  minutesBudget: number;
  template: KungfuTodayTemplate;
  defaultMinutesByNodeType: Record<string, number>;
  focusSelectors?: KungfuProgramSelector[];
  rouletteSelectors?: KungfuProgramSelector[];
  groups?: KungfuPlanGroupConfig[];
}

export type KungfuPlanGroupType = 'work' | 'note';
export type KungfuPlanGroupStrategy = 'overdue' | 'weighted';
export type KungfuPlanGroupHierarchyRule = 'allow_all' | 'prefer_leaves';

export interface KungfuPlanGroupConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  type?: KungfuPlanGroupType;
  daysOfWeek?: number[]; // 0=Sunday ... 6=Saturday (dayjs().day())
  limitMode?: KungfuTodayLimitMode;
  maxItems?: number;
  minutesBudget?: number;
  strategy?: KungfuPlanGroupStrategy;
  include?: KungfuProgramSelector[];
  exclude?: KungfuProgramSelector[];
  hierarchyRule?: KungfuPlanGroupHierarchyRule;
}

export interface SessionWork {
  id: string;
  workId: string;
  order: number;
  customDescriptionMarkdown?: string;
  customDurationMinutes?: number;
  notes?: string;
  focusLabel?: string;
  completed?: boolean;
  result?: 'ok' | 'doubt' | 'fail';
  effort?: number;
  /**
   * Optional payload describing what content this item resolved to (e.g. a section inside an ebook).
   * This is persisted so a session stays stable even if resolution rules change.
   */
  contentRef?: {
    kind: 'ebook_section';
    ebookId: string;
    indexUrl: string;
    sectionPath: string;
    sectionTitle?: string;
    chapterTitle?: string;
  };
  /**
   * For ebook items, keeps track of which section paths were marked as read in this session.
   * Stored for traceability and to compute "next" entry for sequential ebooks (per plan).
   */
  readPaths?: string[];
}

export interface SessionAttendance {
  assistantId: string;
  status: AttendanceStatus;
  actualStatus?: ActualAttendanceStatus;
  notes?: string;
  actualNotes?: string;
}

export interface Session {
  id: string;
  planId?: string;
  date: string; // ISO date (yyyy-mm-dd)
  kind: SessionKind;
  title: string;
  description?: string;
  notes?: string;
  notesByGroupId?: Record<string, string>;
  workItems: SessionWork[];
  attendance: SessionAttendance[];
  startTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assistant {
  id: string;
  name: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackupSession {
  id: string;
  planId?: string;
  date: string;
  kind?: SessionKind;
  title: string;
  description?: string;
  notes?: string;
  notesByGroupId?: Record<string, string>;
  workItems?: SessionWork[];
  attendance?: SessionAttendance[];
  startTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackupSessionWork {
  id?: string;
  session_id: string;
  trabajo_id: string;
  orden?: number;
  descripcionPersonalizada?: string;
  duracionPersonalizada?: number;
  notas?: string;
  fecha?: string;
  titulo?: string;
  descripcion?: string;
  notasSesion?: string;
  foco?: string;
  focusLabel?: string;
  result?: string;
  resultado?: string;
  effort?: number;
  esfuerzo?: number;
  completed?: boolean;
}

export interface BackupSessionAttendance {
  session_id: string;
  assistantId?: string;
  asistente_id?: string;
  estado?: string;
  status?: string;
  notas?: string;
  notes?: string;
  actualStatus?: string;
  estado_real?: string;
  actualNotes?: string;
  notas_reales?: string;
}

export interface BackupPayload {
  version: number;
  usuarios: unknown[];
  objetivos: Objective[];
  trabajos: Work[];
  sesiones: BackupSession[];
  sesiones_trabajos: BackupSessionWork[];
  asistentes: Assistant[];
  sesiones_asistencias: BackupSessionAttendance[];
  plans?: Plan[];
  kungfuPrograms?: KungfuProgram[];
  kungfuCadence?: KungfuCadenceConfig;
  kungfuTodayPlan?: KungfuTodayPlanConfig;
  workTaxonomy?: WorkTaxonomy;
}
