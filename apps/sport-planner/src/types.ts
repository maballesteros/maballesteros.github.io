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
  createdAt: string;
  updatedAt: string;
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
}
