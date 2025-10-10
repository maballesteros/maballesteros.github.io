import { useMemo, useState, type ChangeEvent } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Session, SessionWork, Work, Objective, Assistant } from '@/types';
import { ObjectiveChip } from './ObjectiveChip';
import { MarkdownContent } from './MarkdownContent';

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
  onSelect: (workId: string) => void;
}

function WorkPickerItem({ work, objective, onSelect }: WorkPickerItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(work.id)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/30"
    >
      <div>
        <p className="text-sm font-semibold text-white">{work.name}</p>
        <p className="text-xs text-white/50">{work.estimatedMinutes} min</p>
      </div>
      <ObjectiveChip objective={objective} size="sm" />
    </button>
  );
}

interface SortableWorkRowProps {
  item: SessionWork;
  work?: Work;
  objective?: Objective;
  expanded: boolean;
  onToggleExpanded: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateDetails: (id: string, patch: Partial<SessionWork>) => void;
}

function SortableWorkRow({
  item,
  work,
  objective,
  expanded,
  onToggleExpanded,
  onRemove,
  onUpdateDetails
}: SortableWorkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const duration = item.customDurationMinutes ?? work?.estimatedMinutes ?? 0;

  const handleChange = (field: keyof SessionWork) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (field === 'customDurationMinutes') {
      const parsed = parseInt(value, 10);
      onUpdateDetails(item.id, { customDurationMinutes: Number.isNaN(parsed) ? undefined : parsed });
    } else {
      onUpdateDetails(item.id, { [field]: value } as Partial<SessionWork>);
    }
  };

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
            <div>
              <p className="text-lg font-semibold text-white">{work?.name ?? 'Trabajo eliminado'}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">{duration} min</p>
            </div>
            <div className="flex items-center gap-2">
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
              <ObjectiveChip objective={objective} size="sm" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      {expanded && (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Descripción</label>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <MarkdownContent content={item.customDescriptionMarkdown ?? work?.descriptionMarkdown} />
            </div>
          </div>
          {work?.videoUrls?.length ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/40">Vídeos de referencia</p>
              <div className="flex flex-wrap gap-2">
                {work.videoUrls.map((url) => (
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
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-white/40">Descripción personalizada</label>
            <textarea
              className="input-field min-h-[100px] resize-y"
              value={item.customDescriptionMarkdown ?? ''}
              onChange={handleChange('customDescriptionMarkdown')}
              placeholder="Puedes detallar variaciones para esta sesión"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Duración personalizada (min)</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={item.customDurationMinutes ?? ''}
                onChange={handleChange('customDurationMinutes')}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Notas rápidas</label>
              <textarea
                className="input-field min-h-[80px]"
                value={item.notes ?? ''}
                onChange={handleChange('notes')}
                placeholder="Notas visibles solo en modo edición"
              />
            </div>
          </div>
        </div>
      )}
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
  const setAttendanceStatus = useAppStore((state) => state.setAttendanceStatus);

  const [query, setQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const objectiveMap = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);
  const workMap = useMemo(() => new Map(works.map((work) => [work.id, work])), [works]);

  const filteredWorks = useMemo(() => {
    if (!query) return works;
    const normalized = query.toLowerCase();
    return works.filter((work) => {
      const objective = objectiveMap.get(work.objectiveId);
      return (
        work.name.toLowerCase().includes(normalized) ||
        work.descriptionMarkdown.toLowerCase().includes(normalized) ||
        objective?.name.toLowerCase().includes(normalized)
      );
    });
  }, [works, query, objectiveMap]);

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

  const handleSessionField = (field: 'title' | 'date' | 'description' | 'notes') =>
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
        <div className="grid gap-2 sm:grid-cols-2">
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
                  session.workItems.map((item) => (
                    <SortableWorkRow
                      key={item.id}
                      item={item}
                      work={workMap.get(item.workId)}
                      objective={objectiveMap.get(workMap.get(item.workId)?.objectiveId ?? '')}
                      expanded={expandedItems.has(item.id)}
                      onToggleExpanded={toggleExpanded}
                      onRemove={() => removeWorkFromSession(session.id, item.id)}
                      onUpdateDetails={(id, patch) => updateSessionWorkDetails(session.id, id, patch)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Asistencia</h3>
            <p className="text-sm text-white/60">Marca presencia por asistente. Esto se sincroniza con la vista de la sesión.</p>
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
              const status = attendance?.status ?? 'pending';
              return (
                <div
                  key={assistant.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{assistant.name}</p>
                    {assistant.notes ? <p className="text-xs text-white/50">{assistant.notes}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {(['present', 'absent', 'pending'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAttendanceStatus(session.id, assistant.id, value)}
                        className={clsx(
                          'rounded-full px-3 py-1 text-xs font-semibold transition',
                          status === value
                            ? value === 'present'
                              ? 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-200'
                              : value === 'absent'
                                ? 'border border-rose-500/60 bg-rose-500/20 text-rose-200'
                                : 'border border-white/30 bg-white/10 text-white'
                            : 'border border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        )}
                      >
                        {value === 'present' ? 'Presente' : value === 'absent' ? 'Ausente' : 'Pendiente'}
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
