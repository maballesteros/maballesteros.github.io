import { useMemo, useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Session, SessionWork, Work, Objective, Assistant, AttendanceStatus } from '@/types';
import { ObjectiveChip } from './ObjectiveChip';
import { MarkdownContent } from './MarkdownContent';
import { formatMinutesToTime, parseTimeToMinutes } from '@/utils/time';

const NO_OBJECTIVE_KEY = '__no_objective__';
const NO_OBJECTIVE_LABEL = 'Sin objetivo';

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  absent: 'Ausente',
  pending: 'Pendiente'
};

interface SessionEditorProps {
  session: Session;
  works: Work[];
  objectives: Objective[];
  onDateChange?: (date: string) => void;
  assistants: Assistant[];
}

interface WorkPickerItemProps {
  work: Work;
  objective?: Objective;
  parentChain?: string;
  onSelect: (workId: string) => void;
}

function WorkPickerItem({ work, objective, parentChain, onSelect }: WorkPickerItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(work.id)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/30"
    >
      <div>
        <p className="text-sm font-semibold text-white">{work.name}</p>
        <p className="text-xs text-white/50">{work.estimatedMinutes} min</p>
        {parentChain ? (
          <p className="text-[11px] text-white/40">Deriva de {parentChain}</p>
        ) : null}
      </div>
      <ObjectiveChip objective={objective} size="sm" />
    </button>
  );
}

interface ObjectiveOption {
  id: string;
  name: string;
}

interface SortableWorkRowProps {
  item: SessionWork;
  work?: Work;
  objective?: Objective;
  expanded: boolean;
  onToggleExpanded: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateDetails: (id: string, patch: Partial<SessionWork>) => void;
  onReplace: (newWorkId: string) => void;
  startTimeLabel: string;
  durationMinutes: number;
  objectiveOptions: ObjectiveOption[];
  worksByObjective: Map<string, Work[]>;
  currentObjectiveId?: string;
  workPathById: Map<string, string>;
}

function SortableWorkRow({
  item,
  work,
  objective,
  expanded,
  onToggleExpanded,
  onRemove,
  onUpdateDetails,
  onReplace,
  startTimeLabel,
  durationMinutes,
  objectiveOptions,
  worksByObjective,
  currentObjectiveId,
  workPathById
}: SortableWorkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [swapOpen, setSwapOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const focusValue = item.focusLabel ?? '';
  const focusDisplay = focusValue.trim();
  const hasFocus = focusDisplay.length > 0;
  const descriptionContent = item.customDescriptionMarkdown ?? work?.descriptionMarkdown ?? '';
  const hasDescription = descriptionContent.trim().length > 0;
  const videoUrls = (work?.videoUrls ?? []).map((url) => url.trim()).filter(Boolean);
  const hasVideos = videoUrls.length > 0;
  const hasDetails = hasDescription || hasVideos;
  const workPath = work?.id ? workPathById.get(work.id) ?? work?.name ?? '' : '';
  const parentChain = workPath.split(' · ').slice(0, -1).join(' · ');

  const handleFocusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onUpdateDetails(item.id, { focusLabel: value === '' ? undefined : value });
  };

  const selectOptions = objectiveOptions.length > 0 ? objectiveOptions : [{ id: '', name: 'Sin objetivo' }];

  const defaultObjectiveId = useMemo(() => {
    if (currentObjectiveId && worksByObjective.has(currentObjectiveId)) {
      return currentObjectiveId;
    }
    const matching = selectOptions[0]?.id ?? currentObjectiveId ?? '';
    return matching;
  }, [currentObjectiveId, selectOptions, worksByObjective]);

  const [selectedObjectiveId, setSelectedObjectiveId] = useState(defaultObjectiveId);

  useEffect(() => {
    if (swapOpen) {
      setSelectedObjectiveId(defaultObjectiveId);
    }
  }, [swapOpen, defaultObjectiveId]);

  const availableReplacements = useMemo(() => {
    const baseList = worksByObjective.get(selectedObjectiveId) ?? [];
    return baseList
      .filter((candidate) => candidate.id !== work?.id)
      .sort((a, b) => {
        const pathA = workPathById.get(a.id) ?? a.name;
        const pathB = workPathById.get(b.id) ?? b.name;
        return pathA.localeCompare(pathB, 'es', { sensitivity: 'base' });
      });
  }, [selectedObjectiveId, worksByObjective, work?.id, workPathById]);

  const hasAnyReplacement = useMemo(() => {
    for (const list of worksByObjective.values()) {
      if (list.some((candidate) => candidate.id !== work?.id)) {
        return true;
      }
    }
    return false;
  }, [worksByObjective, work?.id]);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg shadow-black/20 transition',
        isDragging && 'ring-2 ring-sky-400/70'
      )}
    >
      {objective ? (
        <div
          className="absolute inset-0 -z-[1] rounded-3xl opacity-30 blur-xl"
          style={{ backgroundColor: objective.colorHex }}
        />
      ) : null}
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70"
          {...listeners}
          {...attributes}
          aria-label="Reordenar trabajo"
        >
          ⠿
        </button>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                {work?.name ?? 'Trabajo eliminado'}
                {hasFocus ? (
                  <span className="ml-2 text-sky-300">· {focusDisplay}</span>
                ) : null}
              </p>
              {parentChain ? (
                <p className="text-xs text-white/50">Deriva de {parentChain}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                <span className="text-xs uppercase tracking-wide text-white/40">{startTimeLabel}</span>
                <span className="text-white/30">·</span>
                <span>{durationMinutes} min</span>
              </div>
              <div className="max-w-md">
                <label className="text-xs uppercase tracking-wide text-white/40">Foco dentro del trabajo</label>
                <input
                  type="text"
                  value={item.focusLabel ?? ''}
                  onChange={handleFocusChange}
                  placeholder="Ej. 1/7 – Apertura"
                  className="input-field mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasDetails ? (
                <button
                  type="button"
                  onClick={() => onToggleExpanded(item.id)}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white',
                    expanded && 'border-white/40 text-white'
                  )}
                >
                  <span className={clsx('transition-transform', expanded ? 'rotate-90' : 'rotate-0')}>▶</span>
                  {expanded ? 'Ocultar detalles' : 'Ver detalles'}
                </button>
              ) : null}
              <ObjectiveChip objective={objective} size="sm" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSwapOpen((prev) => !prev)}
            disabled={!hasAnyReplacement}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-sky-400/60 hover:text-white disabled:opacity-40"
            aria-label="Intercambiar trabajo por otro de la misma categoría"
            aria-expanded={swapOpen}
          >
            ⇆
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/40 text-rose-300 hover:border-rose-400 hover:text-rose-200"
            aria-label="Eliminar trabajo de la sesión"
          >
            ✕
          </button>
        </div>
      </div>
      {swapOpen ? (
        <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Objetivo</label>
            <select
              className="input-field"
              value={selectedObjectiveId}
              onChange={(event) => setSelectedObjectiveId(event.target.value)}
            >
              {selectOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            {availableReplacements.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/15 px-3 py-2 text-xs text-white/60">
                No hay trabajos disponibles en este objetivo.
              </p>
            ) : (
              availableReplacements.map((option) => {
                const optionPath = workPathById.get(option.id) ?? option.name;
                const optionParentChain = optionPath.split(' · ').slice(0, -1).join(' · ');
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onReplace(option.id);
                      setSwapOpen(false);
                    }}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-white/15 px-3 py-2 text-left text-xs font-semibold text-white/80 transition hover:border-sky-400/60 hover:text-white"
                  >
                    <div className="flex flex-col text-left">
                      <span>{option.name}</span>
                      {optionParentChain ? (
                        <span className="text-[11px] text-white/40">Deriva de {optionParentChain}</span>
                      ) : null}
                    </div>
                    <span className="text-[11px] text-white/40">{option.estimatedMinutes} min</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
      {hasDetails && expanded ? (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          {hasDescription ? (
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Descripción</label>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                <MarkdownContent content={descriptionContent} enableWorkLinks />
              </div>
            </div>
          ) : null}
          {hasVideos ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/40">Vídeos de referencia</p>
              <div className="flex flex-wrap gap-2">
                {videoUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white shadow shadow-red-500/40">
                      ▶
                    </span>
                    Ver vídeo
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      <span className="absolute -left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-950/90 text-xs font-semibold text-white/60">
        {item.order + 1}
      </span>
    </article>
  );
}

export function SessionEditor({ session, works, objectives, assistants, onDateChange }: SessionEditorProps) {
  const updateSession = useAppStore((state) => state.updateSession);
  const addWorkToSession = useAppStore((state) => state.addWorkToSession);
  const removeWorkFromSession = useAppStore((state) => state.removeWorkFromSession);
  const reorderSessionWork = useAppStore((state) => state.reorderSessionWork);
  const updateSessionWorkDetails = useAppStore((state) => state.updateSessionWorkDetails);
  const replaceSessionWork = useAppStore((state) => state.replaceSessionWork);
  const setAttendanceStatus = useAppStore((state) => state.setAttendanceStatus);

  const [query, setQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const objectiveMap = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);
  const workMap = useMemo(() => new Map(works.map((work) => [work.id, work])), [works]);
  const workPathById = useMemo(() => {
    const cache = new Map<string, string>();
    const buildPath = (workId: string, stack: Set<string>): string => {
      if (cache.has(workId)) return cache.get(workId)!;
      const work = workMap.get(workId);
      if (!work) return '';
      const parentId = work.parentWorkId;
      if (!parentId) {
        cache.set(workId, work.name);
        return work.name;
      }
      if (stack.has(workId)) {
        cache.set(workId, work.name);
        return work.name;
      }
      stack.add(workId);
      const parentPath = buildPath(parentId, stack);
      stack.delete(workId);
      const path = parentPath ? `${parentPath} · ${work.name}` : work.name;
      cache.set(workId, path);
      return path;
    };
    works.forEach((work) => buildPath(work.id, new Set()));
    return cache;
  }, [works, workMap]);
  const objectiveOptions = useMemo<ObjectiveOption[]>(() => {
    const nameById = new Map(objectives.map((objective) => [objective.id, objective.name]));
    const options: ObjectiveOption[] = objectives.map((objective) => ({ id: objective.id, name: objective.name }));
    const seen = new Set(options.map((option) => option.id));
    const ensureOption = (id?: string | null) => {
      const key = id ?? NO_OBJECTIVE_KEY;
      if (seen.has(key)) return;
      const name = key === NO_OBJECTIVE_KEY ? NO_OBJECTIVE_LABEL : nameById.get(key) ?? 'Otro objetivo';
      options.push({ id: key, name });
      seen.add(key);
    };
    works.forEach((work) => {
      ensureOption(work.objectiveId);
    });
    return options;
  }, [objectives, works]);

  const worksByObjective = useMemo(() => {
    const map = new Map<string, Work[]>();
    works.forEach((work) => {
      const key = work.objectiveId ?? NO_OBJECTIVE_KEY;
      const list = map.get(key) ?? [];
      list.push(work);
      map.set(key, list);
    });
    map.forEach((list) => {
      list.sort((a, b) => {
        const pathA = workPathById.get(a.id) ?? a.name;
        const pathB = workPathById.get(b.id) ?? b.name;
        return pathA.localeCompare(pathB, 'es', { sensitivity: 'base' });
      });
    });
    return map;
  }, [works, workPathById]);

  const filteredWorks = useMemo(() => {
    if (!query) return works;
    const normalized = query.toLowerCase();
    return works.filter((work) => {
      const objective = objectiveMap.get(work.objectiveId);
      const path = workPathById.get(work.id) ?? '';
      return (
        work.name.toLowerCase().includes(normalized) ||
        work.descriptionMarkdown.toLowerCase().includes(normalized) ||
        objective?.name.toLowerCase().includes(normalized) ||
        path.toLowerCase().includes(normalized)
      );
    });
  }, [works, query, objectiveMap, workPathById]);
  const getParentChain = useCallback(
    (workId: string): string => {
      const path = workPathById.get(workId);
      if (!path) return '';
      const segments = path.split(' · ');
      segments.pop();
      return segments.join(' · ');
    },
    [workPathById]
  );

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddWork = (workId: string) => {
    addWorkToSession(session.id, { workId });
    setQuery('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = session.workItems.findIndex((item) => item.id === active.id);
    const newIndex = session.workItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderSessionWork(session.id, oldIndex, newIndex);
  };

  const handleSessionField = (field: 'title' | 'date' | 'startTime' | 'description' | 'notes') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateSession(session.id, { [field]: value });
      if (field === 'date' && onDateChange) {
        onDateChange(value);
      }
    };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Título</label>
            <input
              type="text"
              className="input-field"
              value={session.title}
              onChange={handleSessionField('title')}
              placeholder="Nombre de la sesión"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Fecha</label>
            <input
              type="date"
              className="input-field"
              value={session.date}
              onChange={handleSessionField('date')}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Hora de inicio</label>
            <input
              type="time"
              className="input-field"
              value={session.startTime ?? '18:30'}
              onChange={handleSessionField('startTime')}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Descripción</label>
          <textarea
            className="input-field min-h-[120px]"
            value={session.description ?? ''}
            onChange={handleSessionField('description')}
            placeholder="Contexto general, objetivos o recordatorios"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Notas privadas</label>
          <textarea
            className="input-field min-h-[100px]"
            value={session.notes ?? ''}
            onChange={handleSessionField('notes')}
            placeholder="Notas para ti o recordatorios de material"
          />
        </div>
      </div>

      <section className="space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Trabajos en la sesión</h3>
            <p className="text-sm text-white/60">Arrastra para reorganizar, pulsa ⋮ para ajustar detalles.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="search"
              className="input-field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en catálogo"
            />
            {query && (
              <div className="absolute top-12 z-10 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-xl">
                {filteredWorks.length === 0 ? (
                  <p className="p-4 text-sm text-white/50">Sin resultados. Revisa el catálogo.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredWorks.map((work) => (
                      <WorkPickerItem
                        key={work.id}
                        work={work}
                        objective={objectiveMap.get(work.objectiveId)}
                        parentChain={getParentChain(work.id)}
                        onSelect={handleAddWork}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="space-y-4">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={session.workItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-5">
                {session.workItems.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/20 p-10 text-center text-white/50">
                    Añade trabajos desde el catálogo con el buscador superior.
                  </div>
                ) : (
                  (() => {
                    let accumulatedMinutes = 0;
                    const startMinutes = parseTimeToMinutes(session.startTime, '18:30');
                    return session.workItems.map((item) => {
                      const currentWork = workMap.get(item.workId);
                      const objective = currentWork
                        ? objectiveMap.get(currentWork.objectiveId)
                        : undefined;
                      const durationMinutes = item.customDurationMinutes ?? currentWork?.estimatedMinutes ?? 0;
                      const startLabel = formatMinutesToTime(startMinutes + accumulatedMinutes);
                      accumulatedMinutes += durationMinutes;
                      return (
                        <SortableWorkRow
                          key={item.id}
                          item={item}
                          work={currentWork}
                          objective={objective}
                          expanded={expandedItems.has(item.id)}
                          onToggleExpanded={toggleExpanded}
                          onRemove={() => removeWorkFromSession(session.id, item.id)}
                          onUpdateDetails={(id, patch) => updateSessionWorkDetails(session.id, id, patch)}
                          onReplace={(newWorkId) => replaceSessionWork(session.id, item.id, newWorkId)}
                          startTimeLabel={startLabel}
                          durationMinutes={durationMinutes}
                          objectiveOptions={objectiveOptions}
                          worksByObjective={worksByObjective}
                          currentObjectiveId={currentWork?.objectiveId ?? NO_OBJECTIVE_KEY}
                          workPathById={workPathById}
                        />
                      );
                    });
                  })()
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Previsión de asistencia</h3>
            <p className="text-sm text-white/60">
              Indica quién esperas que asista. La asistencia real se marca durante la sesión desde la Home.
            </p>
          </div>
        </header>
        <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4">
          {assistants.length === 0 ? (
            <p className="text-sm text-white/60">
              Aún no tienes asistentes definidos. Añádelos desde la sección correspondiente para empezar a registrar asistencia.
            </p>
          ) : (
            assistants.map((assistant) => {
              const attendance = session.attendance.find((entry) => entry.assistantId === assistant.id);
              const forecastStatus = attendance?.status ?? 'pending';
              const liveStatus = attendance?.actualStatus;
              return (
                <div
                  key={assistant.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{assistant.name}</p>
                    {assistant.notes ? <p className="text-xs text-white/50">{assistant.notes}</p> : null}
                    {liveStatus ? (
                      <p className="text-xs text-white/40">
                        Último registro real: {ATTENDANCE_LABELS[liveStatus]}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {(['present', 'absent', 'pending'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAttendanceStatus(session.id, assistant.id, value)}
                        className={clsx(
                          'rounded-full px-3 py-1 text-xs font-semibold transition',
                          forecastStatus === value
                            ? value === 'present'
                              ? 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-200'
                              : value === 'absent'
                                ? 'border border-rose-500/60 bg-rose-500/20 text-rose-200'
                                : 'border border-white/30 bg-white/10 text-white'
                            : 'border border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        )}
                      >
                        {ATTENDANCE_LABELS[value]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
