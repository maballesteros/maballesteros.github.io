import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { useLocation } from 'react-router-dom';

import { useAppStore } from '@/store/appStore';
import type { Objective, Work, WorkVisibility } from '@/types';
import type { WorkUpdateInput } from '@/services/workService';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ObjectiveChip } from '@/components/ObjectiveChip';
import { YouTubePreview } from '@/components/YouTubePreview';
import { Menu } from '@headlessui/react';
import { useAuth } from '@/contexts/AuthContext';

interface WorkFormState {
  id?: string;
  name: string;
  subtitle: string;
  objectiveId: string;
  parentWorkId: string;
  descriptionMarkdown: string;
  estimatedMinutes: number;
  notes: string;
  videoUrls: string[];
  visibility: WorkVisibility;
  collaborators: string[];
}

interface EditingEntry {
  data: WorkFormState;
  isNew: boolean;
  originalId?: string;
}

const EMPTY_FORM: WorkFormState = {
  name: '',
  subtitle: '',
  objectiveId: '',
  parentWorkId: '',
  descriptionMarkdown: '',
  estimatedMinutes: 10,
  notes: '',
  videoUrls: [''],
  visibility: 'private',
  collaborators: ['']
};

interface FeedbackMessage {
  type: 'success' | 'error';
  text: string;
}

interface WorkEntry {
  id: string;
  objectiveId: string;
  parentWorkId: string;
  depth: number;
  work?: Work;
  isNew: boolean;
  isEditing: boolean;
  form?: WorkFormState;
}

const NO_OBJECTIVE_KEY = '__no_objective__';

const VISIBILITY_LABELS: Record<WorkVisibility, string> = {
  private: 'Privado',
  shared: 'Compartido',
  public: 'Público'
};

const VISIBILITY_DESCRIPTIONS: Record<WorkVisibility, string> = {
  private: 'Solo tú puedes ver y editar este trabajo.',
  shared: 'Solo las personas que añadas pueden editarlo contigo.',
  public: 'Cualquier persona con acceso al catálogo puede verlo. Solo tus editores pueden cambiarlo.'
};

const MAX_COLLABORATORS = 5;

interface WorkViewCardProps {
  work: Work;
  objective?: Objective;
  childCount: number;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onCreateChild: () => void;
  onDelete: () => void;
}

function WorkViewCard({
  work,
  objective,
  childCount,
  depth,
  expanded,
  onToggle,
  onEdit,
  onDuplicate,
  onCreateChild,
  onDelete
}: WorkViewCardProps) {
  const trimmedDescription = (work.descriptionMarkdown ?? '').trim();
  const trimmedSubtitle = (work.subtitle ?? '').trim();
  const trimmedNotes = (work.notes ?? '').trim();
  const videoUrls = work.videoUrls.filter((url) => url.trim().length > 0);
  const hasDescription = trimmedDescription.length > 0;
  const hasSubtitle = trimmedSubtitle.length > 0;
  const hasNotes = trimmedNotes.length > 0;
  const hasVideos = videoUrls.length > 0;
  const hasDetails = hasDescription || hasNotes || hasVideos;
  const hasChildren = childCount > 0;
  const indentStyle = depth > 0 ? { marginLeft: `${depth * 1.5}rem` } : undefined;
  const visibility = work.visibility ?? 'private';
  const visibilityLabel = VISIBILITY_LABELS[visibility];
  const collaboratorCount = work.collaboratorEmails?.length ?? 0;
  const canEdit = work.canEdit ?? false;
  const isOwner = work.isOwner ?? false;
  const ownerEmail = (work.ownerEmail ?? '').trim();

  return (
    <article
      id={`work-${work.id}`}
      className="group relative space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 pb-10 shadow shadow-black/30"
      style={indentStyle}
    >
      {objective ? (
        <div
          className="absolute inset-0 -z-[1] rounded-3xl opacity-20 blur-3xl"
          style={{ backgroundColor: objective.colorHex }}
        />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => {
            if (hasDetails) {
              onToggle();
            }
          }}
          className={clsx(
            'flex flex-1 items-start gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition',
            hasDetails
              ? 'hover:border-white/10 hover:bg-white/5 focus-visible:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40'
              : 'cursor-default'
          )}
          aria-expanded={hasDetails ? expanded : undefined}
          disabled={!hasDetails}
        >
          {hasDetails ? (
            <span
              className={clsx(
                'mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs text-white/70 transition',
                expanded ? 'rotate-90 border-white/40 text-white' : ''
              )}
              aria-hidden
            >
              ▶
            </span>
          ) : null}
          <span>
            <h3 className="text-xl font-semibold text-white">{work.name}</h3>
            {hasSubtitle ? <p className="text-sm text-white/70">{trimmedSubtitle}</p> : null}
            <p className="text-sm text-white/60">{work.estimatedMinutes} minutos</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-white/40">
              <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                {visibilityLabel}
              </span>
              {isOwner ? (
                <span>Propietario</span>
              ) : ownerEmail ? (
                <span>{ownerEmail}</span>
              ) : null}
              {collaboratorCount > 0 ? (
                <span>
                  +{collaboratorCount} colaborador{collaboratorCount === 1 ? '' : 'es'}
                </span>
              ) : null}
              {!canEdit ? <span className="text-amber-300/80">Solo lectura</span> : null}
            </div>
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <ObjectiveChip objective={objective} size="sm" />
          <Menu as="div" className="relative inline-flex">
            <Menu.Button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40">
              <span className="sr-only">Abrir acciones</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 p-1 text-sm text-white shadow-lg shadow-black/40 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={canEdit ? onEdit : undefined}
                    disabled={!canEdit}
                    className={clsx(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left disabled:opacity-40',
                      active && canEdit ? 'bg-white/10 text-white' : 'text-white/70'
                    )}
                  >
                    Editar
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={canEdit ? onDuplicate : undefined}
                    disabled={!canEdit}
                    className={clsx(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left disabled:opacity-40',
                      active && canEdit ? 'bg-white/10 text-white' : 'text-white/70'
                    )}
                  >
                    Duplicar
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={canEdit ? onCreateChild : undefined}
                    disabled={!canEdit}
                    className={clsx(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left disabled:opacity-40',
                      active && canEdit ? 'bg-white/10 text-white' : 'text-white/70'
                    )}
                  >
                    Nuevo hijo
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={isOwner ? onDelete : undefined}
                    disabled={!isOwner}
                    className={clsx(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left disabled:opacity-40',
                      active && isOwner ? 'bg-rose-500/20 text-rose-100' : 'text-rose-300'
                    )}
                  >
                    Eliminar
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
      {hasDetails && expanded && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          {hasDescription ? (
            <MarkdownContent content={work.descriptionMarkdown} enableWorkLinks />
          ) : null}
          {hasNotes ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-3 text-sm text-white/70">
              {work.notes}
            </div>
          ) : null}
          {hasVideos ? (
            <div className="space-y-3">
              {videoUrls.map((url, index) => (
                <div key={`${work.id}-video-${index}`} className="space-y-2">
                  <YouTubePreview url={url} title={`${work.name} vídeo ${index + 1}`} />
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                  >
                    Abrir en YouTube
                  </a>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
      <button
        type="button"
        onClick={canEdit ? onCreateChild : undefined}
        disabled={!canEdit}
        className={clsx(
          'absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-dashed border-white/20 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white/80 opacity-0 transition hover:border-white/40 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-visible:pointer-events-auto',
          !canEdit && 'opacity-30'
        )}
        title={
          canEdit
            ? hasChildren
              ? 'Añadir trabajo hijo'
              : 'Crear primer trabajo hijo'
            : 'No tienes permisos para crear trabajos hijos'
        }
        aria-label="Crear trabajo hijo"
      >
        +
      </button>
    </article>
  );
}

interface WorkEditCardProps {
  form: WorkFormState;
  objectiveOptions: Objective[];
  parentOptions: Array<{ id: string; label: string }>;
  depth: number;
  onFieldChange: (patch: Partial<WorkFormState>) => void;
  onVideoChange: (index: number, value: string) => void;
  onAddVideo: () => void;
  onRemoveVideo: (index: number) => void;
  onCollaboratorChange: (index: number, value: string) => void;
  onAddCollaborator: () => void;
  onRemoveCollaborator: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
  canEditContent: boolean;
  canManageSharing: boolean;
  isSaving: boolean;
  isOwner: boolean;
  ownerEmail?: string;
}

function WorkEditCard({
  form,
  objectiveOptions,
  parentOptions,
  depth,
  onFieldChange,
  onVideoChange,
  onAddVideo,
  onRemoveVideo,
  onCollaboratorChange,
  onAddCollaborator,
  onRemoveCollaborator,
  onSave,
  onCancel,
  isNew,
  canEditContent,
  canManageSharing,
  isSaving,
  isOwner,
  ownerEmail
}: WorkEditCardProps) {
  const currentObjective = objectiveOptions.find((objective) => objective.id === form.objectiveId);
  const currentParent = parentOptions.find((option) => option.id === form.parentWorkId);
  const indentStyle = depth > 0 ? { marginLeft: `${depth * 1.5}rem` } : undefined;
  const nameInputId = form.id ? `work-name-${form.id}` : undefined;
  const subtitleInputId = form.id ? `work-subtitle-${form.id}` : undefined;

  return (
    <article
      className="space-y-5 rounded-3xl border border-sky-500/40 bg-slate-950/70 p-5 shadow-lg shadow-sky-500/15"
      style={indentStyle}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              {isNew ? 'Nuevo trabajo' : 'Editando trabajo'}
            </p>
            <label className="text-xs uppercase tracking-wide text-white/40" htmlFor={nameInputId}>
              Nombre
            </label>
            <input
              id={nameInputId}
              type="text"
              className="input-field w-full text-base font-semibold disabled:opacity-60"
              placeholder="Nombre descriptivo"
              value={form.name}
              onChange={(event) => onFieldChange({ name: event.target.value })}
              disabled={!canEditContent}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-white/40" htmlFor={subtitleInputId}>
              Subtítulo (opcional)
            </label>
            <input
              id={subtitleInputId}
              type="text"
              className="input-field w-full disabled:opacity-60"
              placeholder="Añade un subtítulo breve"
              value={form.subtitle}
              onChange={(event) => onFieldChange({ subtitle: event.target.value })}
              disabled={!canEditContent}
            />
          </div>
        </div>
        <ObjectiveChip objective={currentObjective} size="sm" />
      </header>

      {!canEditContent ? (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          No tienes permisos para editar el contenido de este trabajo. Puedes revisar la información
          y sugerir cambios al propietario.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Objetivo</label>
          <select
            className="input-field disabled:opacity-60"
            value={form.objectiveId}
            onChange={(event) => onFieldChange({ objectiveId: event.target.value })}
            disabled={!canEditContent}
          >
            <option value="">Selecciona un objetivo</option>
            {objectiveOptions.map((objective) => (
              <option key={objective.id} value={objective.id}>
                {objective.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Trabajo padre (opcional)</label>
          <select
            className="input-field disabled:opacity-60"
            value={form.parentWorkId}
            onChange={(event) => onFieldChange({ parentWorkId: event.target.value })}
            disabled={!canEditContent}
          >
            <option value="">Sin trabajo padre</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {form.parentWorkId && currentParent ? (
            <p className="text-xs text-white/40">Deriva de: {currentParent.label}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Duración estimada (min)</label>
          <input
            type="number"
            min={0}
            className="input-field disabled:opacity-60"
            value={form.estimatedMinutes}
            onChange={(event) => onFieldChange({ estimatedMinutes: Number(event.target.value) })}
            disabled={!canEditContent}
          />
        </div>
      </div>

      <section className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">Visibilidad</p>
            <p className="text-sm text-white/60">
              {isOwner ? 'Eres el propietario de este trabajo.' : ownerEmail ? `Propietario: ${ownerEmail}` : ''}
            </p>
          </div>
          {!canManageSharing ? (
            <p className="text-xs text-amber-300/80">
              Solo el propietario puede cambiar la visibilidad o los colaboradores.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {(['private', 'shared', 'public'] as WorkVisibility[]).map((option) => (
            <label
              key={option}
              className={clsx(
                'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition',
                form.visibility === option
                  ? 'border-sky-400/80 bg-sky-400/10 text-white'
                  : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white',
                !canManageSharing && 'opacity-50'
              )}
            >
              <input
                type="radio"
                className="accent-sky-400"
                checked={form.visibility === option}
                onChange={() => onFieldChange({ visibility: option })}
                disabled={!canManageSharing}
              />
              {VISIBILITY_LABELS[option]}
            </label>
          ))}
        </div>
        <p className="text-xs text-white/50">{VISIBILITY_DESCRIPTIONS[form.visibility]}</p>
        {form.visibility === 'private' ? null : (
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wide text-white/40">Colaboradores (edición)</p>
            <p className="text-xs text-white/50">
              Añade hasta 5 direcciones de correo. Tendrán permisos de edición completos.
            </p>
            <div className="space-y-2">
              {form.collaborators.map((email, index) => (
                <div key={`collaborator-${index}`} className="flex items-center gap-2">
                  <input
                    type="email"
                    className="input-field flex-1 disabled:opacity-60"
                    placeholder="colega@ejemplo.com"
                    value={email}
                    onChange={(event) => onCollaboratorChange(index, event.target.value)}
                    disabled={!canManageSharing}
                  />
                  {form.collaborators.length > 1 ? (
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/40 text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:opacity-40"
                      onClick={() => onRemoveCollaborator(index)}
                      aria-label="Eliminar colaborador"
                      disabled={!canManageSharing}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-40"
              onClick={onAddCollaborator}
              disabled={!canManageSharing || form.collaborators.length >= MAX_COLLABORATORS}
            >
              + Añadir colaborador
            </button>
          </div>
        )}
      </section>

      <div className="grid gap-2">
        <label className="text-xs uppercase tracking-wide text-white/40">Descripción (Markdown)</label>
        <textarea
          className="input-field min-h-[140px] disabled:opacity-60"
          value={form.descriptionMarkdown}
          onChange={(event) => onFieldChange({ descriptionMarkdown: event.target.value })}
          placeholder="Usa formato markdown para resaltar puntos importantes."
          disabled={!canEditContent}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs uppercase tracking-wide text-white/40">Notas opcionales</label>
        <textarea
          className="input-field min-h-[100px] disabled:opacity-60"
          value={form.notes}
          onChange={(event) => onFieldChange({ notes: event.target.value })}
          disabled={!canEditContent}
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wide text-white/40">Vídeos de YouTube</label>
        <div className="space-y-3">
          {form.videoUrls.map((url, index) => (
            <div key={`video-field-${index}`} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  className="input-field flex-1 disabled:opacity-60"
                  value={url}
                  onChange={(event) => onVideoChange(index, event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={!canEditContent}
                />
                {form.videoUrls.length > 1 ? (
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/40 text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
                    onClick={() => onRemoveVideo(index)}
                    aria-label="Eliminar enlace de vídeo"
                    disabled={!canEditContent}
                  >
                    ✕
                  </button>
                ) : null}
              </div>
              <YouTubePreview url={url} title={`Vista previa vídeo ${index + 1}`} />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn-secondary px-3 py-1 text-xs disabled:opacity-50"
          onClick={onAddVideo}
          disabled={!canEditContent}
        >
          + Añadir vídeo
        </button>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onSave}
          className="btn-primary disabled:opacity-60"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          className="btn-secondary disabled:opacity-50"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </button>
      </div>
    </article>
  );
}

export default function CatalogView() {
  const works = useAppStore((state) => state.works);
  const objectives = useAppStore((state) => state.objectives);
  const addWork = useAppStore((state) => state.addWork);
  const updateWork = useAppStore((state) => state.updateWork);
  const deleteWork = useAppStore((state) => state.deleteWork);
  const worksLoading = useAppStore((state) => state.worksLoading);
  const location = useLocation();
  const { user } = useAuth();

  const actorContext = useMemo(
    () =>
      user
        ? {
            actorId: user.id,
            actorEmail: user.email ?? ''
          }
        : null,
    [user]
  );

  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [expandedWorks, setExpandedWorks] = useState<Set<string>>(new Set());
  const [editingEntries, setEditingEntries] = useState<Record<string, EditingEntry>>({});
  const [savingWorkId, setSavingWorkId] = useState<string | null>(null);

  const objectiveMap = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);
  const sortedObjectives = useMemo(
    () => [...objectives].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es')),
    [objectives]
  );
  const worksById = useMemo(() => new Map(works.map((work) => [work.id, work])), [works]);
  const childrenByWorkId = useMemo(() => {
    const map = new Map<string, Work[]>();
    works.forEach((work) => {
      const parentId = work.parentWorkId;
      if (!parentId) return;
      const list = map.get(parentId) ?? [];
      list.push(work);
      map.set(parentId, list);
    });
    map.forEach((list) => {
      list.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    });
    return map;
  }, [works]);
  const workPathById = useMemo(() => {
    const cache = new Map<string, string>();
    const visit = (workId: string, stack: Set<string>): string => {
      if (cache.has(workId)) return cache.get(workId)!;
      const work = worksById.get(workId);
      if (!work) return '';
      if (!work.parentWorkId) {
        cache.set(workId, work.name);
        return work.name;
      }
      if (stack.has(workId)) {
        cache.set(workId, work.name);
        return work.name;
      }
      stack.add(workId);
      const parentPath = visit(work.parentWorkId, stack);
      stack.delete(workId);
      const path = parentPath ? `${parentPath} · ${work.name}` : work.name;
      cache.set(workId, path);
      return path;
    };
    works.forEach((work) => {
      visit(work.id, new Set<string>());
    });
    return cache;
  }, [works, worksById]);

  useEffect(() => {
    const hash = location.hash;
    const prefix = '#work-';
    let workId: string | null = null;

    if (hash.startsWith(prefix)) {
      workId = hash.slice(prefix.length);
    }

    if (!workId) {
      const searchParams = new URLSearchParams(location.search);
      workId = searchParams.get('workId') ?? searchParams.get('work');
    }

    if (!workId) return;

    setExpandedWorks((prev) => {
      if (prev.has(workId)) return prev;
      const next = new Set(prev);
      next.add(workId);
      return next;
    });

    const element = document.getElementById(`work-${workId}`);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    element.classList.add('ring-2', 'ring-sky-500/60');
    const timeout = window.setTimeout(() => {
      element.classList.remove('ring-2', 'ring-sky-500/60');
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
      element.classList.remove('ring-2', 'ring-sky-500/60');
    };
  }, [location.hash, location.search, works]);
  const descendantIdsByWorkId = useMemo(() => {
    const cache = new Map<string, Set<string>>();
    const visit = (workId: string): Set<string> => {
      if (cache.has(workId)) return cache.get(workId)!;
      const set = new Set<string>();
      const children = childrenByWorkId.get(workId) ?? [];
      children.forEach((child) => {
        set.add(child.id);
        visit(child.id).forEach((descendantId) => set.add(descendantId));
      });
      cache.set(workId, set);
      return set;
    };
    works.forEach((work) => visit(work.id));
    return cache;
  }, [works, childrenByWorkId]);
  const buildParentOptions = useCallback(
    (currentWorkId?: string, currentParentId?: string) => {
      const excluded = new Set<string>();
      if (currentWorkId) {
        excluded.add(currentWorkId);
        descendantIdsByWorkId.get(currentWorkId)?.forEach((descendantId) => excluded.add(descendantId));
      }
      const options = works
        .filter((work) => !excluded.has(work.id))
        .map((work) => ({
          id: work.id,
          label: (() => {
            const basePath = workPathById.get(work.id) ?? work.name;
            const objectiveName = objectiveMap.get(work.objectiveId)?.name;
            return objectiveName ? `${objectiveName} · ${basePath}` : basePath;
          })()
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

      if (currentParentId && currentParentId.length > 0 && !options.some((option) => option.id === currentParentId)) {
        const fallbackWork = worksById.get(currentParentId);
        const fallbackBase =
          workPathById.get(currentParentId) ?? fallbackWork?.name ?? 'Trabajo no disponible';
        const fallbackObjectiveName = fallbackWork ? objectiveMap.get(fallbackWork.objectiveId)?.name : undefined;
        const fallbackLabel = fallbackObjectiveName ? `${fallbackObjectiveName} · ${fallbackBase}` : fallbackBase;
        options.unshift({ id: currentParentId, label: fallbackLabel });
      }

      return options;
    },
    [works, workPathById, descendantIdsByWorkId, worksById, objectiveMap]
  );

  const searchTerm = search.trim().toLowerCase();

  const matchesSearch = (workData: {
    id?: string;
    name: string;
    subtitle?: string;
    descriptionMarkdown: string;
    objectiveId: string;
    parentWorkId?: string;
  }) => {
    if (!searchTerm) return true;
    const objectiveName = objectiveMap.get(workData.objectiveId)?.name ?? '';
    const parentPath = workData.parentWorkId ? workPathById.get(workData.parentWorkId) ?? '' : '';
    const selfPath = workData.id ? workPathById.get(workData.id) ?? '' : '';
    return (
      workData.name.toLowerCase().includes(searchTerm) ||
      (workData.subtitle ?? '').toLowerCase().includes(searchTerm) ||
      workData.descriptionMarkdown.toLowerCase().includes(searchTerm) ||
      objectiveName.toLowerCase().includes(searchTerm) ||
      parentPath.toLowerCase().includes(searchTerm) ||
      selfPath.toLowerCase().includes(searchTerm)
    );
  };

  const allEntries: WorkEntry[] = useMemo(() => {
    const entries: WorkEntry[] = [];
    const computeDepth = (parentId?: string) => {
      if (!parentId) return 0;
      let depth = 1;
      let current = worksById.get(parentId);
      const visited = new Set<string>(parentId ? [parentId] : []);
      while (current && current.parentWorkId) {
        const nextParent = current.parentWorkId;
        if (!nextParent || visited.has(nextParent)) break;
        depth += 1;
        visited.add(nextParent);
        current = worksById.get(nextParent);
      }
      return depth;
    };

    works.forEach((work) => {
      const draft = editingEntries[work.id];
      const effectiveData = draft?.data ?? {
        id: work.id,
        name: work.name,
        subtitle: work.subtitle ?? '',
        descriptionMarkdown: work.descriptionMarkdown,
        objectiveId: work.objectiveId,
        parentWorkId: work.parentWorkId ?? ''
      };

      if (!draft && !matchesSearch(effectiveData)) {
        return;
      }

      entries.push({
        id: work.id,
        objectiveId: effectiveData.objectiveId,
        parentWorkId: effectiveData.parentWorkId ?? '',
        depth: computeDepth(effectiveData.parentWorkId),
        work,
        isNew: false,
        isEditing: Boolean(draft),
        form: draft?.data
      });
    });

    Object.entries(editingEntries)
      .filter(([, entry]) => entry.isNew)
      .forEach(([id, entry]) => {
        if (!matchesSearch(entry.data)) {
          return;
        }
        entries.push({
          id,
          objectiveId: entry.data.objectiveId,
          parentWorkId: entry.data.parentWorkId,
          depth: computeDepth(entry.data.parentWorkId || undefined),
          work: undefined,
          isNew: true,
          isEditing: true,
          form: entry.data
        });
    });

    return entries;
  }, [works, worksById, editingEntries, matchesSearch]);

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, WorkEntry[]>();

    allEntries.forEach((entry) => {
      const key = objectiveMap.has(entry.objectiveId) ? entry.objectiveId : NO_OBJECTIVE_KEY;
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    });

    const buildSortKey = (entry: WorkEntry) => {
      if (entry.isEditing && entry.form) {
        const baseName = entry.form.name.trim() || (entry.work?.name ?? '');
        const parentLabel =
          entry.form.parentWorkId && entry.form.parentWorkId.length > 0
            ? workPathById.get(entry.form.parentWorkId) ?? worksById.get(entry.form.parentWorkId)?.name ?? ''
            : '';
        return parentLabel ? `${parentLabel} · ${baseName}` : baseName;
      }
      if (entry.work) {
        return workPathById.get(entry.work.id) ?? entry.work.name;
      }
      return entry.id;
    };

    const sortByHierarchy = (a: WorkEntry, b: WorkEntry) => {
      const keyA = buildSortKey(a);
      const keyB = buildSortKey(b);
      return keyA.localeCompare(keyB, 'es', { sensitivity: 'base' });
    };

    const orderedGroups: Array<{ objective?: Objective; items: WorkEntry[] }> = [];

    sortedObjectives.forEach((objective) => {
      const items = groups.get(objective.id);
      if (items && items.length) {
        orderedGroups.push({
          objective,
          items: items.slice().sort(sortByHierarchy)
        });
      }
    });

    const withoutObjective = groups.get(NO_OBJECTIVE_KEY);
    if (withoutObjective && withoutObjective.length) {
      orderedGroups.push({
        objective: undefined,
        items: withoutObjective.slice().sort(sortByHierarchy)
      });
    }

    return orderedGroups;
  }, [allEntries, objectiveMap, sortedObjectives, workPathById, worksById]);

  const defaultObjectiveId = sortedObjectives[0]?.id ?? '';

  const updateEditingEntry = (id: string, updater: (prev: EditingEntry) => EditingEntry) => {
    setEditingEntries((prev) => {
      const entry = prev[id];
      if (!entry) return prev;
      return {
        ...prev,
        [id]: updater(entry)
      };
    });
  };

  const ensureVideoField = (videoUrls: string[]) => (videoUrls.length > 0 ? videoUrls : ['']);
  const ensureCollaboratorField = (collaborators: string[]) =>
    collaborators.length > 0 ? collaborators : [''];

  const startEditingWork = (work: Work) => {
    setEditingEntries((prev) => {
      if (prev[work.id]) return prev;
      return {
        ...prev,
        [work.id]: {
          data: {
            id: work.id,
            name: work.name,
            subtitle: work.subtitle ?? '',
            objectiveId: work.objectiveId,
            parentWorkId: work.parentWorkId ?? '',
            descriptionMarkdown: work.descriptionMarkdown,
            estimatedMinutes: work.estimatedMinutes,
            notes: work.notes ?? '',
            videoUrls: ensureVideoField(work.videoUrls.slice()),
            visibility: work.visibility ?? 'private',
            collaborators: ensureCollaboratorField(work.collaboratorEmails ?? [])
          },
          isNew: false,
          originalId: work.id
        }
      };
    });
    setExpandedWorks((prev) => {
      const next = new Set(prev);
      next.add(work.id);
      return next;
    });
  };

  const startNewWork = () => {
    const draftId = `draft-${nanoid()}`;
    setEditingEntries((prev) => ({
      ...prev,
      [draftId]: {
        data: {
          ...EMPTY_FORM,
          id: draftId,
          subtitle: '',
          objectiveId: defaultObjectiveId
        },
        isNew: true
      }
    }));
    setExpandedWorks((prev) => {
      const next = new Set(prev);
      next.add(draftId);
      return next;
    });
  };

  const duplicateWork = (work: Work) => {
    const draftId = `draft-${nanoid()}`;
    setEditingEntries((prev) => ({
      ...prev,
      [draftId]: {
        data: {
          id: draftId,
          name: `${work.name} (copia)`,
          subtitle: work.subtitle ?? '',
          objectiveId: work.objectiveId,
          parentWorkId: work.parentWorkId ?? '',
          descriptionMarkdown: work.descriptionMarkdown,
          estimatedMinutes: work.estimatedMinutes,
          notes: work.notes ?? '',
          videoUrls: ensureVideoField(work.videoUrls.slice()),
          visibility: 'private',
          collaborators: ['']
        },
        isNew: true
      }
    }));
    setExpandedWorks((prev) => {
      const next = new Set(prev);
      next.add(draftId);
      return next;
    });
    setFeedback({ type: 'success', text: 'Duplicación creada. Ajusta y guarda para confirmarla.' });
  };

  const createChildWork = (parent: Work) => {
    const draftId = `draft-${nanoid()}`;
    setEditingEntries((prev) => ({
      ...prev,
      [draftId]: {
        data: {
          ...EMPTY_FORM,
          id: draftId,
          subtitle: '',
          objectiveId: parent.objectiveId,
          parentWorkId: parent.id,
          estimatedMinutes: parent.estimatedMinutes,
          visibility: parent.visibility ?? 'private',
          collaborators: ['']
        },
        isNew: true
      }
    }));
    setExpandedWorks((prev) => {
      const next = new Set(prev);
      next.add(draftId);
      return next;
    });
    setFeedback({
      type: 'success',
      text: `Creando un trabajo hijo para «${parent.name}». Ajusta y guarda para confirmarlo.`
    });
  };

  const toggleExpanded = (id: string) => {
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

  const handleCancel = (id: string) => {
    setEditingEntries((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (id.startsWith('draft-')) {
      setExpandedWorks((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSave = async (id: string) => {
    const entry = editingEntries[id];
    if (!entry) return;
    if (savingWorkId) return;

    if (!actorContext) {
      setFeedback({ type: 'error', text: 'Inicia sesión para guardar este trabajo.' });
      return;
    }

    const parentValue = (entry.data.parentWorkId ?? '').trim();
    const parentWorkId = parentValue.length > 0 ? parentValue : undefined;

    const payload = {
      name: entry.data.name.trim(),
      subtitle: entry.data.subtitle.trim() || undefined,
      objectiveId: entry.data.objectiveId,
      descriptionMarkdown: entry.data.descriptionMarkdown,
      estimatedMinutes: Number(entry.data.estimatedMinutes) || 0,
      notes: entry.data.notes.trim() || undefined,
      videoUrls: entry.data.videoUrls.map((url) => url.trim()).filter(Boolean),
      parentWorkId,
      visibility: entry.data.visibility,
      collaboratorEmails: Array.from(
        new Set(
          entry.data.collaborators
            .map((email) => email.trim().toLowerCase())
            .filter((email) => email.length > 0)
        )
      )
    };

    if (!payload.name) {
      setFeedback({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }

    if (!payload.objectiveId) {
      setFeedback({ type: 'error', text: 'Selecciona un objetivo para el trabajo.' });
      return;
    }

    if (payload.parentWorkId && entry.originalId) {
      if (payload.parentWorkId === entry.originalId) {
        setFeedback({ type: 'error', text: 'Un trabajo no puede ser su propio padre.' });
        return;
      }
      const descendants = descendantIdsByWorkId.get(entry.originalId);
      if (descendants && descendants.has(payload.parentWorkId)) {
        setFeedback({ type: 'error', text: 'Selecciona un trabajo padre que no sea un descendiente.' });
        return;
      }
    }

    const currentWork = entry.originalId ? worksById.get(entry.originalId) : undefined;
    const canManageSharing = entry.isNew || (currentWork?.isOwner ?? false);

    setSavingWorkId(id);
    try {
      if (entry.isNew) {
        const createdWork = await addWork(
          {
            name: payload.name,
            subtitle: payload.subtitle,
            objectiveId: payload.objectiveId,
            parentWorkId: payload.parentWorkId,
            descriptionMarkdown: payload.descriptionMarkdown,
            estimatedMinutes: payload.estimatedMinutes,
            notes: payload.notes,
            videoUrls: payload.videoUrls,
            visibility: payload.visibility,
            collaboratorEmails: payload.collaboratorEmails
          },
          actorContext
        );
        setFeedback({ type: 'success', text: 'Trabajo creado correctamente.' });
        setExpandedWorks((prev) => {
          const next = new Set(prev);
          next.delete(id);
          next.add(createdWork.id);
          return next;
        });
      } else if (entry.originalId) {
        const patch: WorkUpdateInput = {
          name: payload.name,
          subtitle: payload.subtitle ?? null,
          objectiveId: payload.objectiveId,
          parentWorkId: payload.parentWorkId ?? null,
          descriptionMarkdown: payload.descriptionMarkdown,
          estimatedMinutes: payload.estimatedMinutes,
          notes: payload.notes ?? null,
          videoUrls: payload.videoUrls
        };
        if (canManageSharing) {
          patch.visibility = payload.visibility;
          patch.collaboratorEmails = payload.collaboratorEmails;
        }
        await updateWork(entry.originalId, patch, actorContext);
        setFeedback({ type: 'success', text: 'Trabajo actualizado.' });
      }

      setEditingEntries((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (error) {
      console.error('No se pudo guardar el trabajo', error);
      setFeedback({
        type: 'error',
        text: 'No se han podido guardar los cambios. Comprueba tus permisos e inténtalo de nuevo.'
      });
    } finally {
      setSavingWorkId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!actorContext) {
      setFeedback({ type: 'error', text: 'Inicia sesión para eliminar trabajos.' });
      return;
    }
    const hasDescendants = (descendantIdsByWorkId.get(id)?.size ?? 0) > 0;
    try {
      const ok = await deleteWork(id, actorContext);
      if (!ok) {
        setFeedback({
          type: 'error',
          text: hasDescendants
            ? 'No se puede eliminar porque tiene trabajos hijos.'
            : 'No se puede eliminar porque está siendo usado en alguna sesión.'
        });
        return;
      }
      setFeedback({ type: 'success', text: 'Trabajo eliminado.' });
      setEditingEntries((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setExpandedWorks((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('No se pudo eliminar el trabajo', error);
      setFeedback({
        type: 'error',
        text: 'No tienes permisos para eliminar este trabajo o se ha producido un error.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel space-y-4 p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trabajos</h1>
            <p className="max-w-2xl text-white/60">
              Gestiona los ejercicios reutilizables por objetivo. Duplica, edita y ajusta los detalles sin salir del listado.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <input
              type="search"
              className="input-field w-full sm:w-72"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, descripción u objetivo"
            />
            <button type="button" className="btn-primary" onClick={startNewWork}>
              Nuevo trabajo
            </button>
            {worksLoading ? (
              <span className="text-xs text-white/60 sm:ml-3">Sincronizando trabajos…</span>
            ) : null}
          </div>
        </div>
        {feedback && (
          <div
            className={clsx(
              'rounded-2xl border px-4 py-3 text-sm',
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            )}
          >
            {feedback.text}
          </div>
        )}
      </header>

      <section className="space-y-6">
        {groupedEntries.length === 0 ? (
          worksLoading ? (
            <div className="glass-panel p-10 text-center text-white/60">Sincronizando trabajos…</div>
          ) : (
            <div className="glass-panel p-10 text-center text-white/50">
              Aún no hay trabajos guardados. Empieza creando uno con el botón «Nuevo trabajo».
            </div>
          )
        ) : (
          groupedEntries.map(({ objective, items }) => {
            const groupTitle = objective ? objective.name : 'Sin objetivo asignado';
            return (
              <div key={objective?.id ?? 'sin-objetivo'} className="glass-panel space-y-4 p-6">
                <header className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{groupTitle}</h3>
                    <ObjectiveChip objective={objective} size="sm" />
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    {items.length} trabajo{items.length === 1 ? '' : 's'}
                  </span>
                </header>
                <div className="space-y-4">
                  {items.map((entry) => {
                    const isExpanded = expandedWorks.has(entry.id);
                    const currentParentId =
                      (entry.isEditing && entry.form ? entry.form.parentWorkId : entry.parentWorkId) ?? '';
                    const parentOptions = entry.isEditing
                      ? buildParentOptions(entry.work?.id, currentParentId)
                      : [];
                    const childWorks = entry.work ? childrenByWorkId.get(entry.work.id) ?? [] : [];
                    const childCount = childWorks.length;
                    if (entry.isEditing && entry.form) {
                      const canEditContent = entry.isNew || (entry.work?.canEdit ?? false);
                      const canManageSharing = entry.isNew || (entry.work?.isOwner ?? false);
                      const isOwner = entry.isNew || (entry.work?.isOwner ?? false);
                      return (
                        <WorkEditCard
                          key={entry.id}
                          form={entry.form}
                          objectiveOptions={sortedObjectives}
                          parentOptions={parentOptions}
                          depth={entry.depth}
                          onFieldChange={(patch) =>
                            updateEditingEntry(entry.id, (prev) => {
                              const nextData = {
                                ...prev.data,
                                ...patch
                              };
                              if (patch.parentWorkId !== undefined && patch.parentWorkId.length > 0) {
                                const parent = worksById.get(patch.parentWorkId);
                                if (parent) {
                                  nextData.objectiveId = parent.objectiveId;
                                }
                              }
                              if (patch.visibility === 'private') {
                                nextData.collaborators = [''];
                              }
                              return {
                                ...prev,
                                data: nextData
                              };
                            })
                          }
                          onVideoChange={(index, value) =>
                            updateEditingEntry(entry.id, (prev) => {
                              const videoUrls = prev.data.videoUrls.slice();
                              videoUrls[index] = value;
                              return {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  videoUrls
                                }
                              };
                            })
                          }
                          onAddVideo={() =>
                            updateEditingEntry(entry.id, (prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                videoUrls: [...prev.data.videoUrls, '']
                              }
                            }))
                          }
                          onRemoveVideo={(index) =>
                            updateEditingEntry(entry.id, (prev) => {
                              const videoUrls = prev.data.videoUrls.slice();
                              videoUrls.splice(index, 1);
                              return {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  videoUrls: videoUrls.length ? videoUrls : ['']
                                }
                              };
                            })
                          }
                          onCollaboratorChange={(index, value) =>
                            updateEditingEntry(entry.id, (prev) => {
                              const collaborators = prev.data.collaborators.slice();
                              collaborators[index] = value;
                              return {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  collaborators
                                }
                              };
                            })
                          }
                          onAddCollaborator={() =>
                            updateEditingEntry(entry.id, (prev) => {
                              if (prev.data.collaborators.length >= MAX_COLLABORATORS) {
                                return prev;
                              }
                              return {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  collaborators: [...prev.data.collaborators, '']
                                }
                              };
                            })
                          }
                          onRemoveCollaborator={(index) =>
                            updateEditingEntry(entry.id, (prev) => {
                              const collaborators = prev.data.collaborators.slice();
                              collaborators.splice(index, 1);
                              if (!collaborators.length) {
                                collaborators.push('');
                              }
                              return {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  collaborators
                                }
                              };
                            })
                          }
                          onSave={() => void handleSave(entry.id)}
                          onCancel={() => handleCancel(entry.id)}
                          isNew={entry.isNew}
                          canEditContent={canEditContent}
                          canManageSharing={canManageSharing}
                          isSaving={savingWorkId === entry.id}
                          isOwner={isOwner}
                          ownerEmail={entry.work?.ownerEmail}
                        />
                      );
                    }

                    if (!entry.work) {
                      return null;
                    }

                    return (
                      <WorkViewCard
                        key={entry.id}
                        work={entry.work}
                        objective={objectiveMap.get(entry.work.objectiveId)}
                        childCount={childCount}
                        depth={entry.depth}
                        expanded={isExpanded}
                        onToggle={() => toggleExpanded(entry.id)}
                        onEdit={() => {
                          const target = entry.work;
                          if (target && (target.canEdit ?? false)) {
                            startEditingWork(target);
                          }
                        }}
                        onDuplicate={() => {
                          const target = entry.work;
                          if (target && (target.canEdit ?? false)) {
                            duplicateWork(target);
                          }
                        }}
                        onCreateChild={() => {
                          const target = entry.work;
                          if (target && (target.canEdit ?? false)) {
                            createChildWork(target);
                          }
                        }}
                        onDelete={() => {
                          const target = entry.work;
                          if (target && (target.isOwner ?? false)) {
                            void handleDelete(target.id);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
