import { FormEvent, useMemo, useState } from 'react';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Objective } from '@/types';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ObjectiveChip } from '@/components/ObjectiveChip';

interface ObjectiveFormState {
  id?: string;
  name: string;
  colorHex: string;
  descriptionMarkdown: string;
}

const EMPTY_FORM: ObjectiveFormState = {
  name: '',
  colorHex: '#60a5fa',
  descriptionMarkdown: ''
};

const PASTEL_PALETTE: string[] = [
  '#F97316',
  '#FB7185',
  '#F43F5E',
  '#EC4899',
  '#D946EF',
  '#A855F7',
  '#8B5CF6',
  '#6366F1',
  '#4F46E5',
  '#3B82F6',
  '#38BDF8',
  '#0EA5E9',
  '#06B6D4',
  '#14B8A6',
  '#0D9488',
  '#10B981',
  '#22C55E',
  '#65A30D',
  '#84CC16',
  '#A3E635',
  '#FACC15',
  '#FBBF24',
  '#F59E0B',
  '#EA580C',
  '#C2410C',
  '#E11D48',
  '#EF4444',
  '#F87171',
  '#FB923C',
  '#F472B6',
  '#FDE047',
  '#7C3AED'
];

export default function ObjectivesView() {
  const objectives = useAppStore((state) => state.objectives);
  const addObjective = useAppStore((state) => state.addObjective);
  const updateObjective = useAppStore((state) => state.updateObjective);
  const deleteObjective = useAppStore((state) => state.deleteObjective);

  const works = useAppStore((state) => state.works);

  const [formState, setFormState] = useState<ObjectiveFormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const worksPerObjective = useMemo(() => {
    const counts = new Map<string, number>();
    works.forEach((work) => {
      counts.set(work.objectiveId, (counts.get(work.objectiveId) ?? 0) + 1);
    });
    return counts;
  }, [works]);

  const sortedObjectives = useMemo(
    () => [...objectives].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es')),
    [objectives]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      setFeedback({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }
    const payload = {
      name: formState.name.trim(),
      colorHex: formState.colorHex,
      descriptionMarkdown: formState.descriptionMarkdown
    };
    if (formState.id) {
      updateObjective(formState.id, payload);
      setFeedback({ type: 'success', text: 'Objetivo actualizado.' });
    } else {
      addObjective(payload);
      setFeedback({ type: 'success', text: 'Objetivo creado.' });
    }
    setFormState(EMPTY_FORM);
  };

  const handleEdit = (objective: Objective) => {
    setFormState({
      id: objective.id,
      name: objective.name,
      colorHex: objective.colorHex,
      descriptionMarkdown: objective.descriptionMarkdown
    });
  };

  const handleDelete = (id: string) => {
    const ok = deleteObjective(id);
    setFeedback(
      ok
        ? { type: 'success', text: 'Objetivo eliminado.' }
        : { type: 'error', text: 'No se puede eliminar porque tiene trabajos asociados.' }
    );
  };

  const handleDistributeColors = () => {
    if (objectives.length === 0) {
      setFeedback({ type: 'error', text: 'No hay objetivos a los que asignar colores.' });
      return;
    }
    const palette = [...PASTEL_PALETTE];
    const updates: Array<{ id: string; colorHex: string }> = objectives.map((objective, index) => {
      const color = palette[index % palette.length];
      return { id: objective.id, colorHex: color };
    });
    updates.forEach(({ id, colorHex }) => updateObjective(id, { colorHex }));
    setFeedback({ type: 'success', text: 'Colores repartidos equitativamente entre los objetivos.' });
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Objetivos</h1>
            <p className="text-white/60">
              Define categorías de trabajo con color y contexto para identificar visualmente cada ejercicio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={handleDistributeColors}>
              Repartir colores
            </button>
          </div>
        </div>
        {feedback && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <section className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">{formState.id ? 'Editar objetivo' : 'Nuevo objetivo'}</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Nombre</label>
              <input
                type="text"
                className="input-field"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ej. Resistencia, Técnica, Juego"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Color identificativo</label>
              <div className="flex flex-wrap gap-3">
                <input
                  type="color"
                  className="h-12 w-12 cursor-pointer rounded-full border border-white/20 bg-transparent"
                  value={formState.colorHex}
                  onChange={(event) => setFormState((prev) => ({ ...prev, colorHex: event.target.value }))}
                  aria-label="Elegir color personalizado"
                />
                <input
                  type="text"
                  className="input-field max-w-[140px]"
                  value={formState.colorHex}
                  onChange={(event) => setFormState((prev) => ({ ...prev, colorHex: event.target.value }))}
                  placeholder="#60a5fa"
                  aria-label="Código hex del color"
                />
              </div>
              <div className="grid grid-cols-8 gap-2 rounded-3xl border border-white/10 bg-white/5 p-3">
                {PASTEL_PALETTE.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setFormState((prev) => ({ ...prev, colorHex: hex }))}
                    className={clsx(
                      'relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60',
                      formState.colorHex.toLowerCase() === hex.toLowerCase() &&
                        'ring-2 ring-white/80 ring-offset-2 ring-offset-slate-900'
                    )}
                    style={{ backgroundColor: hex }}
                    aria-label={`Seleccionar color ${hex}`}
                  >
                    {formState.colorHex.toLowerCase() === hex.toLowerCase() && (
                      <span className="text-xs font-semibold text-slate-900">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Descripción (Markdown)</label>
              <textarea
                className="input-field min-h-[140px]"
                value={formState.descriptionMarkdown}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, descriptionMarkdown: event.target.value }))
                }
                placeholder="Explica cuándo usar este tipo de trabajo, objetivos pedagógicos, etc."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {formState.id ? 'Guardar objetivo' : 'Crear objetivo'}
              </button>
              {formState.id && (
                <button type="button" className="btn-secondary" onClick={() => setFormState(EMPTY_FORM)}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-6">
          {sortedObjectives.length === 0 ? (
            <div className="glass-panel p-10 text-center text-white/50">
              Aún no has creado objetivos. Crea uno con el formulario para clasificarlos por color y descripción.
            </div>
          ) : (
            sortedObjectives.map((objective) => (
              <div key={objective.id} className="glass-panel space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <ObjectiveChip objective={objective} />
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{worksPerObjective.get(objective.id) ?? 0} trabajos</span>
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1 text-xs"
                      onClick={() => handleEdit(objective)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300"
                      onClick={() => handleDelete(objective.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <MarkdownContent content={objective.descriptionMarkdown} />
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
