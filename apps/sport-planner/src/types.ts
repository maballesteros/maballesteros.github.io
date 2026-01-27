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
  date: string; // ISO date (yyyy-mm-dd)
  kind: SessionKind;
  title: string;
  description?: string;
  notes?: string;
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
  date: string;
  kind?: SessionKind;
  title: string;
  description?: string;
  notes?: string;
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
  kungfuPrograms?: KungfuProgram[];
  kungfuCadence?: KungfuCadenceConfig;
  kungfuTodayPlan?: KungfuTodayPlanConfig;
}
