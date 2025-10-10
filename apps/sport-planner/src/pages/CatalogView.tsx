import { FormEvent, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Objective, Work } from '@/types';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ObjectiveChip } from '@/components/ObjectiveChip';

interface WorkFormState {
  id?: string;
  name: string;
  objectiveId: string;
  descriptionMarkdown: string;
  estimatedMinutes: number;
  notes: string;
  videoUrls: string[];
}

const EMPTY_FORM: WorkFormState = {
  name: '',
  objectiveId: '',
  descriptionMarkdown: '',
  estimatedMinutes: 10,
  notes: '',
  videoUrls: ['']
};

interface WorkCardProps {
  work: Work;
  objective?: Objective;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function WorkCard({ work, objective, expanded, onToggle, onEdit, onDelete }: WorkCardProps) {
  return (
    <article className="relative space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow shadow-black/30">
      {objective ? (
        <div
          className="absolute inset-0 -z-[1] rounded-3xl opacity-20 blur-3xl"
          style={{ backgroundColor: objective.colorHex }}
        />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{work.name}</h3>
          <p className="text-sm text-white/60">{work.estimatedMinutes} minutos</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <ObjectiveChip objective={objective} size="sm" />
          <button
            type="button"
            onClick={onToggle}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white',
              expanded && 'border-white/40 text-white'
            )}
          >
            <span className={clsx('transition-transform', expanded ? 'rotate-90' : 'rotate-0')}>▶</span>
            {expanded ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
          <button type="button" onClick={onEdit} className="btn-secondary px-3 py-1 text-xs">
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
          >
            Eliminar
          </button>
        </div>
      </div>
      {expanded && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <MarkdownContent content={work.descriptionMarkdown} />
          {work.notes ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-3 text-sm text-white/70">
              {work.notes}
            </div>
          ) : null}
          {work.videoUrls.length > 0 && (
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
          )}
        </div>
      )}
    </article>
  );
}

export default function CatalogView() {
  const works = useAppStore((state) => state.works);
  const objectives = useAppStore((state) => state.objectives);
  const addWork = useAppStore((state) => state.addWork);
  const updateWork = useAppStore((state) => state.updateWork);
  const deleteWork = useAppStore((state) => state.deleteWork);

  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<WorkFormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedWorks, setExpandedWorks] = useState<Set<string>>(new Set());

  const objectiveMap = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);
  const sortedObjectives = useMemo(
    () => [...objectives].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es')),
    [objectives]
  );

  const filteredWorks = useMemo(() => {
    if (!search) return works;
    const normalized = search.toLowerCase();
    return works.filter((work) => {
      const objective = objectiveMap.get(work.objectiveId);
      const workName = work.name ?? '';
      const objectiveName = objective?.name ?? '';
      const description = work.descriptionMarkdown ?? '';
      return (
        workName.toLowerCase().includes(normalized) ||
        description.toLowerCase().includes(normalized) ||
        objectiveName.toLowerCase().includes(normalized)
      );
    });
  }, [works, search, objectiveMap]);

  const worksByObjective = useMemo(() => {
    const map = new Map<string, Work[]>();
    filteredWorks.forEach((work) => {
      const key = objectiveMap.has(work.objectiveId) ? work.objectiveId : '__no_objective__';
      const list = map.get(key) ?? [];
      list.push(work);
      map.set(key, list);
    });
    return map;
  }, [filteredWorks, objectiveMap]);

  const groupedWorks = useMemo(() => {
    const groups: Array<{ objective?: Objective; works: Work[] }> = sortedObjectives.map((objective) => ({
      objective,
      works: (worksByObjective.get(objective.id) ?? []).sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '', 'es')
      )
    }));
    const withoutObjective = (worksByObjective.get('__no_objective__') ?? []).sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', 'es')
    );
    if (withoutObjective.length) {
      groups.push({ objective: undefined, works: withoutObjective });
    }
    return groups.filter((group) => group.works.length > 0);
  }, [sortedObjectives, worksByObjective]);

  useEffect(() => {
    if (formState.objectiveId || sortedObjectives.length === 0) return;
    setFormState((prev) => ({ ...prev, objectiveId: sortedObjectives[0]?.id ?? '' }));
  }, [sortedObjectives, formState.objectiveId]);

  const resetForm = () => {
    setFormState(EMPTY_FORM);
  };

  const handleVideoChange = (index: number, value: string) => {
    setFormState((prev) => {
      const next = [...prev.videoUrls];
      next[index] = value;
      return { ...prev, videoUrls: next };
    });
  };

  const addVideoField = () => {
    setFormState((prev) => ({ ...prev, videoUrls: [...prev.videoUrls, ''] }));
  };

  const toggleExpandedWork = (id: string) => {
    setExpandedWorks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.objectiveId) {
      setFeedback({ type: 'error', text: 'Selecciona un objetivo para el trabajo.' });
      return;
    }
    const payload = {
      name: formState.name.trim(),
      objectiveId: formState.objectiveId,
      descriptionMarkdown: formState.descriptionMarkdown,
      estimatedMinutes: Number(formState.estimatedMinutes) || 0,
      notes: formState.notes,
      videoUrls: formState.videoUrls.map((url) => url.trim()).filter(Boolean)
    };
    if (!payload.name) {
      setFeedback({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }
    if (formState.id) {
      updateWork(formState.id, payload);
      setFeedback({ type: 'success', text: 'Trabajo actualizado correctamente.' });
    } else {
      addWork(payload);
      setFeedback({ type: 'success', text: 'Trabajo creado.' });
    }
    resetForm();
  };

  const handleEdit = (work: Work) => {
    setFormState({
      id: work.id,
      name: work.name,
      objectiveId: work.objectiveId,
      descriptionMarkdown: work.descriptionMarkdown,
      estimatedMinutes: work.estimatedMinutes,
      notes: work.notes ?? '',
      videoUrls: work.videoUrls.length ? work.videoUrls : ['']
    });
    setExpandedWorks((prev) => {
      const next = new Set(prev);
      next.add(work.id);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    const ok = deleteWork(id);
    if (!ok) {
      setFeedback({ type: 'error', text: 'No se puede eliminar porque está siendo usado en alguna sesión.' });
    } else {
      setFeedback({ type: 'success', text: 'Trabajo eliminado.' });
      setExpandedWorks((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trabajos</h1>
            <p className="text-white/60">
              Gestiona ejercicios reutilizables agrupados por objetivo y amplía los detalles solo cuando los necesites.
            </p>
          </div>
          <input
            type="search"
            className="input-field w-full sm:w-80"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, descripción u objetivo"
          />
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <section className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">{formState.id ? 'Editar trabajo' : 'Nuevo trabajo'}</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Nombre</label>
              <input
                type="text"
                className="input-field"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nombre descriptivo"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Objetivo</label>
              <select
                className="input-field"
                value={formState.objectiveId}
                onChange={(event) => setFormState((prev) => ({ ...prev, objectiveId: event.target.value }))}
                required
              >
                <option value="">Selecciona un objetivo</option>
                {sortedObjectives.map((objective) => (
                  <option key={objective.id} value={objective.id}>
                    {objective.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Duración estimada (min)</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={formState.estimatedMinutes}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, estimatedMinutes: Number(event.target.value) }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Descripción (Markdown)</label>
              <textarea
                className="input-field min-h-[140px]"
                value={formState.descriptionMarkdown}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, descriptionMarkdown: event.target.value }))
                }
                placeholder="Usa formato markdown para resaltar puntos importantes."
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Notas opcionales</label>
              <textarea
                className="input-field min-h-[100px]"
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Vídeos de YouTube</label>
              <div className="space-y-2">
                {formState.videoUrls.map((url, index) => (
                  <input
                    key={index}
                    type="url"
                    className="input-field"
                    value={url}
                    onChange={(event) => handleVideoChange(index, event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                ))}
              </div>
              <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={addVideoField}>
                + Añadir enlace
              </button>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="btn-primary">
                {formState.id ? 'Guardar cambios' : 'Crear trabajo'}
              </button>
              {formState.id && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-6">
          {groupedWorks.length === 0 ? (
            <div className="glass-panel p-10 text-center text-white/50">
              Aún no hay trabajos guardados. Empieza creando uno con el formulario.
            </div>
          ) : (
            groupedWorks.map(({ objective, works: worksList }) => {
              const groupTitle = objective ? objective.name : 'Sin objetivo asignado';
              return (
                <div key={objective?.id ?? 'sin-objetivo'} className="glass-panel space-y-4 p-6">
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{groupTitle}</h3>
                      <ObjectiveChip objective={objective} size="sm" />
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {worksList.length} trabajo{worksList.length === 1 ? '' : 's'}
                    </span>
                  </header>
                  <div className="space-y-4">
                    {worksList.map((work) => (
                      <WorkCard
                        key={work.id}
                        work={work}
                        objective={objectiveMap.get(work.objectiveId)}
                        expanded={expandedWorks.has(work.id)}
                        onToggle={() => toggleExpandedWork(work.id)}
                        onEdit={() => handleEdit(work)}
                        onDelete={() => handleDelete(work.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
