import { create } from 'zustand';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import type {
  Objective,
  Work,
  Session,
  SessionWork,
  SessionAttendance,
  Assistant,
  AttendanceStatus,
  BackupPayload,
  BackupSessionWork,
  BackupSessionAttendance,
  BackupSession
} from '@/types';

const STORAGE_KEYS = {
  objectives: 'sport-planner-objetivos',
  works: 'sport-planner-trabajos',
  sessions: 'sport-planner-sesiones',
  assistants: 'sport-planner-asistentes'
};

const isBrowser = typeof window !== 'undefined';

const nowIso = () => new Date().toISOString();

const DEFAULT_SESSION_START_TIME = '18:30';

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

const normalizeAttendance = (attendance?: PartialAttendance[]): SessionAttendance[] =>
  (attendance ?? []).map((entry) => {
    const status = isAttendanceStatus(entry.status) ? entry.status : 'pending';
    const actualStatus = isAttendanceStatus(entry.actualStatus) ? entry.actualStatus : undefined;
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
}

const persistCollections = (state: Partial<CollectionsState>) => {
  if (!isBrowser) return;
  const normalized = normalizeCollections(state);
  window.localStorage.setItem(STORAGE_KEYS.objectives, JSON.stringify(normalized.objectives));
  window.localStorage.setItem(STORAGE_KEYS.works, JSON.stringify(normalized.works));
  window.localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(normalized.sessions));
  window.localStorage.setItem(STORAGE_KEYS.assistants, JSON.stringify(normalized.assistants));
};

const normalizeCollections = (state: Partial<CollectionsState>): CollectionsState => ({
  objectives: state.objectives ?? [],
  works: state.works ?? [],
  sessions: (state.sessions ?? []).map((session) => ({
    ...session,
    startTime: session.startTime ?? DEFAULT_SESSION_START_TIME,
    workItems: (session.workItems ?? []).map((item) => ({
      ...item,
      focusLabel: item.focusLabel
    })),
    attendance: normalizeAttendance(session.attendance as PartialAttendance[])
  })),
  assistants: state.assistants ?? []
});

interface ObjectiveInput {
  name: string;
  colorHex: string;
  descriptionMarkdown: string;
}

interface WorkInput {
  name: string;
  objectiveId: string;
  descriptionMarkdown: string;
  estimatedMinutes: number;
  notes?: string;
  videoUrls: string[];
}

interface SessionInput {
  date: string;
  title: string;
  description?: string;
  notes?: string;
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
  sessions: Session[];
  assistants: Assistant[];
  hydrate: () => void;
  setCollections: (payload: CollectionsState) => void;
  reset: () => void;
  addObjective: (input: ObjectiveInput) => Objective;
  updateObjective: (id: string, patch: Partial<ObjectiveInput>) => void;
  deleteObjective: (id: string) => boolean;
  addWork: (input: WorkInput) => Work;
  updateWork: (id: string, patch: Partial<WorkInput>) => void;
  deleteWork: (id: string) => boolean;
  addSession: (input: SessionInput) => Session;
  duplicateSession: (id: string, date: string) => Session | undefined;
  updateSession: (id: string, patch: Partial<SessionInput>) => void;
  deleteSession: (id: string) => void;
  updateSessionWorkItems: (sessionId: string, items: SessionWork[]) => void;
  addWorkToSession: (sessionId: string, item: SessionWorkInput) => SessionWork | undefined;
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
    status: AttendanceStatus,
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
  sessions: [],
  assistants: [],
  hydrate: () => {
    if (get().ready) return;
    const objectives = loadCollection<Objective[]>(STORAGE_KEYS.objectives, []);
    const works = loadCollection<Work[]>(STORAGE_KEYS.works, []);
    const sessions = loadCollection<Session[]>(STORAGE_KEYS.sessions, []).map((session) => ({
      ...session,
      startTime: session.startTime ?? DEFAULT_SESSION_START_TIME,
      workItems: (session.workItems ?? []).map((item) => ({
        ...item,
        focusLabel: item.focusLabel
      })),
      attendance: normalizeAttendance(session.attendance as PartialAttendance[])
    }));
    const assistants = loadCollection<Assistant[]>(STORAGE_KEYS.assistants, []);
    set({
      objectives,
      works,
      sessions,
      assistants,
      ready: true
    });
  },
  setCollections: (payload) => {
    set((state) => {
      const normalized = normalizeCollections({
        objectives: payload.objectives,
        works: payload.works,
        sessions: payload.sessions,
        assistants: payload.assistants
      });
      const merged = {
        ...state,
        ...normalized,
        ready: true
      };
      persistCollections(merged);
      return merged;
    });
  },
  reset: () => {
    set((state) => {
      const normalized = normalizeCollections({
        objectives: [],
        works: [],
        sessions: [],
        assistants: []
      });
      const merged = {
        ...state,
        ...normalized,
        ready: true
      };
      persistCollections(merged);
      return merged;
    });
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
  addWork: (input) => {
    const work: Work = {
      id: nanoid(),
      name: input.name,
      objectiveId: input.objectiveId,
      descriptionMarkdown: input.descriptionMarkdown,
      estimatedMinutes: input.estimatedMinutes,
      notes: input.notes,
      videoUrls: input.videoUrls,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    set((state) => {
      const works = [...state.works, work];
      const merged = { ...state, works };
      persistCollections(merged);
      return merged;
    });
    return work;
  },
  updateWork: (id, patch) => {
    set((state) => {
      const works = state.works.map((work) =>
        work.id === id
          ? {
              ...work,
              ...patch,
              videoUrls: patch.videoUrls ?? work.videoUrls,
              estimatedMinutes: patch.estimatedMinutes ?? work.estimatedMinutes,
              updatedAt: nowIso()
            }
          : work
      );
      const merged = { ...state, works };
      persistCollections(merged);
      return merged;
    });
  },
  deleteWork: (id) => {
    const isInSession = get().sessions.some((session) =>
      session.workItems.some((item) => item.workId === id)
    );
    if (isInSession) return false;
    set((state) => {
      const works = state.works.filter((work) => work.id !== id);
      const merged = { ...state, works };
      persistCollections(merged);
      return merged;
    });
    return true;
  },
  addSession: (input) => {
    const session: Session = {
      id: nanoid(),
      date: input.date,
      title: input.title,
      description: input.description,
      notes: input.notes,
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
    clone.workItems = session.workItems.map((item, index) => ({
      ...item,
      id: nanoid(),
      order: index
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

    const works = (payload.trabajos ?? []).map((work) => ({
      ...work,
      createdAt: work.createdAt ?? now,
      updatedAt: work.updatedAt ?? now,
      videoUrls: work.videoUrls ?? []
    }));

    const assistants = (payload.asistentes ?? []).map((assistant) => ({
      ...assistant,
      createdAt: assistant.createdAt ?? now,
      updatedAt: assistant.updatedAt ?? now,
      active: assistant.active ?? true
    }));

    const sessionsById = new Map<string, Session>();

    (payload.sesiones ?? []).forEach((raw: BackupSession) => {
      const sessionId = raw.id ?? nanoid();
      const session: Session = {
        id: sessionId,
        date: raw.date ?? dayjs().format('YYYY-MM-DD'),
        title: raw.title ?? 'Sesión importada',
        description: raw.description,
        notes: raw.notes,
        workItems: (raw.workItems ?? []).map((item, index) => ({
          id: item.id ?? nanoid(),
          workId: item.workId,
          order: item.order ?? index,
          customDescriptionMarkdown: item.customDescriptionMarkdown,
          customDurationMinutes: item.customDurationMinutes,
          notes: item.notes,
          focusLabel: item.focusLabel,
          completed: item.completed ?? false
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
          date: raw.fecha ? dayjs(raw.fecha).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
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
        completed: false
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
    (payload.sesiones_asistencias ?? []).forEach((raw: BackupSessionAttendance) => {
      const sessionId = raw.session_id;
      if (!sessionId) return;
      const assistantId = raw.assistantId ?? raw.asistente_id;
      if (!assistantId) return;
      const status = parseAttendanceStatus(raw.status ?? raw.estado) ?? 'pending';
      const actualStatus = parseAttendanceStatus(raw.actualStatus ?? raw.estado_real);
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
      ready: true
    });
    persistCollections({ objectives, works, sessions, assistants });
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
        focusLabel: item.focusLabel
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
      date: session.date,
      title: session.title,
      description: session.description,
      notes: session.notes,
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
      sesiones_asistencias: sesionesAsistencias
    };
    return payload;
  }
}));

export type { AppState, CollectionsState };
