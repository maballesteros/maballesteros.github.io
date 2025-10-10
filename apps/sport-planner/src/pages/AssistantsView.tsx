import { FormEvent, useState } from 'react';
import clsx from 'clsx';

import { useAppStore } from '@/store/appStore';
import type { Assistant } from '@/types';

interface AssistantFormState {
  id?: string;
  name: string;
  notes: string;
  active: boolean;
}

const EMPTY_FORM: AssistantFormState = {
  name: '',
  notes: '',
  active: true
};

export default function AssistantsView() {
  const assistants = useAppStore((state) => state.assistants);
  const addAssistant = useAppStore((state) => state.addAssistant);
  const updateAssistant = useAppStore((state) => state.updateAssistant);
  const deleteAssistant = useAppStore((state) => state.deleteAssistant);

  const [formState, setFormState] = useState<AssistantFormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      setFeedback({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }
    const payload = {
      name: formState.name.trim(),
      notes: formState.notes,
      active: formState.active
    };
    if (formState.id) {
      updateAssistant(formState.id, payload);
      setFeedback({ type: 'success', text: 'Asistente actualizado.' });
    } else {
      addAssistant(payload);
      setFeedback({ type: 'success', text: 'Asistente añadido.' });
    }
    setFormState(EMPTY_FORM);
  };

  const handleEdit = (assistant: Assistant) => {
    setFormState({
      id: assistant.id,
      name: assistant.name,
      notes: assistant.notes ?? '',
      active: assistant.active
    });
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Asistentes</h1>
            <p className="text-white/60">
              Mantén una lista base de alumnado para registrar asistencia rápidamente durante cada sesión.
            </p>
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <section className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">{formState.id ? 'Editar asistente' : 'Nuevo asistente'}</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Nombre</label>
              <input
                type="text"
                className="input-field"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nombre y apellidos"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Notas</label>
              <textarea
                className="input-field min-h-[120px]"
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Observaciones, nivel, lesiones, etc."
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="assistant-active"
                type="checkbox"
                className="h-5 w-5 rounded border border-white/20 bg-white/10 text-sky-400"
                checked={formState.active}
                onChange={(event) => setFormState((prev) => ({ ...prev, active: event.target.checked }))}
              />
              <label htmlFor="assistant-active" className="text-sm text-white/70">
                Activo (aparecerá en los listados de asistencia)
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {formState.id ? 'Guardar asistente' : 'Añadir asistente'}
              </button>
              {formState.id && (
                <button type="button" className="btn-secondary" onClick={() => setFormState(EMPTY_FORM)}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {assistants.length === 0 ? (
            <div className="glass-panel p-10 text-center text-white/50">
              Todavía no tienes asistentes guardados. Crea uno desde el formulario para empezar a marcar asistencia en
              sesiones.
            </div>
          ) : (
            assistants.map((assistant) => (
              <div key={assistant.id} className="glass-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{assistant.name}</p>
                  {assistant.notes ? <p className="text-sm text-white/60">{assistant.notes}</p> : null}
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <span
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-semibold',
                      assistant.active
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                        : 'border-white/20 bg-white/5 text-white/60'
                    )}
                  >
                    {assistant.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => handleEdit(assistant)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300"
                      onClick={() => deleteAssistant(assistant.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
