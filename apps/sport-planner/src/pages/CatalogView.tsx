import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { Link, useLocation } from 'react-router-dom';

import { useAppStore } from '@/store/appStore';
import type { Objective, Work, WorkScheduleKind, WorkVisibility } from '@/types';
import type { WorkUpdateInput } from '@/services/workService';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ObjectiveChip } from '@/components/ObjectiveChip';
import { YouTubePreview } from '@/components/YouTubePreview';
import { MultiSelectChips } from '@/components/MultiSelectChips';
import { Menu } from '@headlessui/react';
import { useAuth } from '@/contexts/useAuth';

interface WorkFormState {
  id?: string;
  name: string;
  subtitle: string;
  objectiveId: string;
  parentWorkId: string;
  nodeType: string;
  scheduleKind: string;
  scheduleNumber: number;
  tags: string[];
  orderHint: number;
  nextWorkId: string;
  variantOfWorkId: string;
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
  nodeType: '',
  scheduleKind: '',
  scheduleNumber: 1,
  tags: [],
  orderHint: 0,
  nextWorkId: '',
  variantOfWorkId: '',
  descriptionMarkdown: '',
  estimatedMinutes: 10,
  notes: '',
  videoUrls: [''],
  visibility: 'private',
  collaborators: ['']
};

const normalizeTagsSelection = (tags: string[]): string[] =>
  Array.from(new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean)));

const isWorkScheduleKind = (value: unknown): value is WorkScheduleKind =>
  value === 'day_of_year' || value === 'day_of_month' || value === 'day_of_week';

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
const PERSONAL_EXCLUDE_TAG = 'personal-exclude';

interface WorkViewCardProps {
  work: Work;
  childCount: number;
  depth: number;
  expanded: boolean;
  isTreeCollapsed: boolean;
  isPersonalExcluded: boolean;
  canTogglePersonal: boolean;
  personalToggleBusy: boolean;
  nextLabel?: string;
  variantLabel?: string;
  onToggle: () => void;
  onToggleTree: () => void;
  onTogglePersonal: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onCreateChild: () => void;
  onDelete: () => void;
}

function WorkViewCard({
  work,
  childCount,
  depth,
  expanded,
  isTreeCollapsed,
  isPersonalExcluded,
  canTogglePersonal,
  personalToggleBusy,
  nextLabel,
  variantLabel,
  onToggle,
  onToggleTree,
  onTogglePersonal,
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
  const nodeType = (work.nodeType ?? '').trim();
  const tags = (work.tags ?? []).filter((tag) => tag !== PERSONAL_EXCLUDE_TAG);
  const normalizedNodeType = (nodeType || 'work').trim().toLowerCase();
  const taxonomyLabel = useAppStore((state) => state.workTaxonomy.nodeTypes.find((nt) => nt.key === normalizedNodeType)?.label);

  const nodeTypeBadge = (() => {
    const labelMap: Record<string, string> = {
      form: 'Forma',
      segment: 'Segmento',
      application: 'Aplicación',
      technique: 'Técnica',
      drill: 'Drill',
      reading: 'Lectura',
      style: 'Estilo',
      link: 'Link',
      work: 'Trabajo'
    };

    const styleMap: Record<string, string> = {
      form: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-100',
      segment: 'border-sky-500/40 bg-sky-500/15 text-sky-100',
      application: 'border-amber-500/40 bg-amber-500/15 text-amber-100',
      technique: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100',
      drill: 'border-purple-500/40 bg-purple-500/15 text-purple-100',
      reading: 'border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-100',
      style: 'border-white/20 bg-white/10 text-white/70',
      link: 'border-white/20 bg-white/10 text-white/70',
      work: 'border-white/20 bg-white/10 text-white/70'
    };

    const label = taxonomyLabel ?? labelMap[normalizedNodeType] ?? (nodeType || 'Trabajo');
    const styles = styleMap[normalizedNodeType] ?? styleMap.work;

    return (
      <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', styles)}>
        {label}
      </span>
    );
  })();

  const nodeTypeAccent = (() => {
    const borderMap: Record<string, string> = {
      form: 'border-indigo-500/25',
      segment: 'border-sky-500/25',
      application: 'border-amber-500/25',
      technique: 'border-emerald-500/25',
      drill: 'border-purple-500/25',
      reading: 'border-fuchsia-500/25',
      work: 'border-white/10'
    };

    const glowMap: Record<string, string> = {
      form: 'bg-indigo-500',
      segment: 'bg-sky-500',
      application: 'bg-amber-500',
      technique: 'bg-emerald-500',
      drill: 'bg-purple-500',
      reading: 'bg-fuchsia-500',
      work: ''
    };

    const barMap: Record<string, string> = {
      form: 'bg-indigo-400/60',
      segment: 'bg-sky-400/60',
      application: 'bg-amber-400/60',
      technique: 'bg-emerald-400/60',
      drill: 'bg-purple-400/60',
      reading: 'bg-fuchsia-400/60',
      work: 'bg-white/10'
    };

    const borderClassName = borderMap[normalizedNodeType] ?? borderMap.work;
    const glowClassName = glowMap[normalizedNodeType] ?? glowMap.work;
    const barClassName = barMap[normalizedNodeType] ?? barMap.work;

    return { borderClassName, glowClassName, barClassName };
  })();

  return (
    <article
      id={`work-${work.id}`}
      className={clsx(
        'group relative space-y-4 rounded-xl border bg-white/5 p-4 pb-5 shadow shadow-black/30',
        nodeTypeAccent.borderClassName
      )}
      style={indentStyle}
    >
      <div className={clsx('absolute inset-y-0 left-0 w-1 rounded-r-full', nodeTypeAccent.barClassName)} aria-hidden />
      {nodeTypeAccent.glowClassName ? (
        <div className={clsx('absolute inset-0 -z-[1] rounded-xl opacity-10 blur-3xl', nodeTypeAccent.glowClassName)} />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div
          role={hasDetails ? 'button' : undefined}
          tabIndex={hasDetails ? 0 : undefined}
          onClick={() => {
            if (hasDetails) onToggle();
          }}
          onKeyDown={(event) => {
            if (!hasDetails) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onToggle();
            }
          }}
          className={clsx(
            'flex flex-1 items-start gap-3 border border-transparent px-2 py-2 text-left transition',
            hasDetails
              ? 'cursor-pointer hover:border-white/10 hover:bg-white/5 focus-visible:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40'
              : 'cursor-default'
          )}
          aria-expanded={hasDetails ? expanded : undefined}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleTree();
              }}
              className={clsx(
                'mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white'
              )}
              aria-label={isTreeCollapsed ? 'Mostrar trabajos hijos' : 'Ocultar trabajos hijos'}
              title={isTreeCollapsed ? 'Mostrar hijos' : 'Ocultar hijos'}
            >
              {isTreeCollapsed ? '▸' : '▾'}
            </button>
          ) : null}
          {hasDetails ? (
            <span
              className={clsx(
                'mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/70 transition',
                expanded ? 'rotate-90 border-white/30 text-white' : ''
              )}
              aria-hidden
            >
              ▶
            </span>
          ) : null}
          <div>
            <h3 className="text-lg font-semibold text-white">{work.name}</h3>
            {hasSubtitle ? <p className="text-sm text-white/70">{trimmedSubtitle}</p> : null}
            <p className="text-sm text-white/60">{work.estimatedMinutes} minutos</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-white/40">
              <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                {visibilityLabel}
              </span>
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/60"
                >
                  {tag}
                </span>
              ))}
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
              {variantLabel ? <span className="text-white/50">Variante de: {variantLabel}</span> : null}
              {nextLabel ? <span className="text-white/50">Siguiente: {nextLabel}</span> : null}
              {!canEdit ? <span className="text-amber-300/80">Solo lectura</span> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {nodeTypeBadge}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTogglePersonal();
            }}
            disabled={!canTogglePersonal || personalToggleBusy}
            className={clsx(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-50',
              isPersonalExcluded
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:border-rose-400'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400'
            )}
            title={isPersonalExcluded ? 'Incluir en el plan personal' : 'Excluir del plan personal'}
          >
            {personalToggleBusy ? '...' : isPersonalExcluded ? 'Fuera' : 'En plan'}
          </button>
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
              <div className="grid gap-4 lg:grid-cols-3">
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
  workOptions: Array<{ id: string; label: string }>;
  nodeTypeOptions: Array<{ value: string; label: string }>;
  tagOptions: Array<{ value: string; label: string }>;
  onCreateNodeType: (raw: string) => string | null;
  onCreateTag: (raw: string) => string | null;
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
  workOptions,
  nodeTypeOptions,
  tagOptions,
  onCreateNodeType,
  onCreateTag,
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
  const currentNext = workOptions.find((option) => option.id === form.nextWorkId);
  const currentVariant = workOptions.find((option) => option.id === form.variantOfWorkId);
  const indentStyle = depth > 0 ? { marginLeft: `${depth * 1.5}rem` } : undefined;
  const nameInputId = form.id ? `work-name-${form.id}` : undefined;
  const subtitleInputId = form.id ? `work-subtitle-${form.id}` : undefined;
  const normalizedNodeType = (form.nodeType ?? '').trim().toLowerCase();
  const showSchedule = normalizedNodeType === 'reading' || form.scheduleKind.trim().length > 0;

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Node type (opcional)</label>
          <MultiSelectChips
            options={nodeTypeOptions}
            value={form.nodeType ? [form.nodeType] : []}
            maxSelected={1}
            onChange={(next) => onFieldChange({ nodeType: next[0] ?? '' })}
            placeholder="Search node types…"
            disabled={!canEditContent}
            allowCreate
            onCreate={(raw) => {
              const created = onCreateNodeType(raw);
              return created ? { createdValue: created, createdLabel: raw.trim() } : null;
            }}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Tags</label>
          <MultiSelectChips
            options={tagOptions}
            value={form.tags ?? []}
            onChange={(next) => onFieldChange({ tags: next })}
            placeholder="Search tags…"
            disabled={!canEditContent}
            allowCreate
            onCreate={(raw) => {
              const created = onCreateTag(raw);
              return created ? { createdValue: created, createdLabel: created } : null;
            }}
          />
        </div>
        {showSchedule ? (
          <>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Schedule (para lecturas)</label>
              <select
                className="input-field disabled:opacity-60"
                value={form.scheduleKind}
                onChange={(event) => onFieldChange({ scheduleKind: event.target.value })}
                disabled={!canEditContent}
              >
                <option value="">Sin schedule</option>
                <option value="day_of_year">Día del año (1-365)</option>
                <option value="day_of_month">Día del mes (1-31)</option>
                <option value="day_of_week">Día de la semana (0-6)</option>
              </select>
              <p className="text-xs text-white/40">
                Para `nodeType=reading`, el planificador solo propone esta lectura cuando el día coincide.
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-white/40">Número</label>
              <input
                type="number"
                min={0}
                className="input-field disabled:opacity-60"
                value={form.scheduleNumber}
                onChange={(event) => onFieldChange({ scheduleNumber: Number(event.target.value) })}
                disabled={!canEditContent || !form.scheduleKind}
              />
            </div>
          </>
        ) : null}
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Order hint (opcional)</label>
          <input
            type="number"
            min={0}
            className="input-field disabled:opacity-60"
            value={form.orderHint}
            onChange={(event) => onFieldChange({ orderHint: Number(event.target.value) })}
            disabled={!canEditContent}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Siguiente (next)</label>
          <select
            className="input-field disabled:opacity-60"
            value={form.nextWorkId}
            onChange={(event) => onFieldChange({ nextWorkId: event.target.value })}
            disabled={!canEditContent}
          >
            <option value="">Sin siguiente</option>
            {workOptions
              .filter((option) => option.id !== form.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
          </select>
          {form.nextWorkId && currentNext ? (
            <p className="text-xs text-white/40">Siguiente: {currentNext.label}</p>
          ) : null}
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <label className="text-xs uppercase tracking-wide text-white/40">Variante de (variant_of)</label>
          <select
            className="input-field disabled:opacity-60"
            value={form.variantOfWorkId}
            onChange={(event) => onFieldChange({ variantOfWorkId: event.target.value })}
            disabled={!canEditContent}
          >
            <option value="">Sin base</option>
            {workOptions
              .filter((option) => option.id !== form.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
          </select>
          {form.variantOfWorkId && currentVariant ? (
            <p className="text-xs text-white/40">Variante de: {currentVariant.label}</p>
          ) : null}
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
  const workTaxonomy = useAppStore((state) => state.workTaxonomy);
  const addWork = useAppStore((state) => state.addWork);
  const updateWork = useAppStore((state) => state.updateWork);
  const deleteWork = useAppStore((state) => state.deleteWork);
  const upsertNodeType = useAppStore((state) => state.upsertNodeType);
  const upsertTag = useAppStore((state) => state.upsertTag);
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
  const [collapsedWorkTrees, setCollapsedWorkTrees] = useState<Set<string>>(new Set());
  const [collapsedObjectiveGroups, setCollapsedObjectiveGroups] = useState<Set<string>>(new Set());
  const [editingEntries, setEditingEntries] = useState<Record<string, EditingEntry>>({});
  const [savingWorkId, setSavingWorkId] = useState<string | null>(null);
  const [togglingPersonalWorkId, setTogglingPersonalWorkId] = useState<string | null>(null);

  const objectiveMap = useMemo(() => new Map(objectives.map((objective) => [objective.id, objective])), [objectives]);
  const sortedObjectives = useMemo(
    () => [...objectives].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es')),
    [objectives]
  );
  const nodeTypeOptions = useMemo(
    () =>
      (workTaxonomy.nodeTypes ?? [])
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }))
        .map((nt) => ({ value: nt.key, label: nt.label })),
    [workTaxonomy.nodeTypes]
  );
  const tagOptions = useMemo(
    () =>
      (workTaxonomy.tags ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
        .map((tag) => ({ value: tag.name, label: tag.name })),
    [workTaxonomy.tags]
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

  const workOptions = useMemo(
    () =>
      works
        .map((work) => {
          const basePath = workPathById.get(work.id) ?? work.name;
          const objectiveName = objectiveMap.get(work.objectiveId)?.name;
          const label = objectiveName ? `${objectiveName} · ${basePath}` : basePath;
          return { id: work.id, label };
        })
        .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })),
    [works, workPathById, objectiveMap]
  );

  const allEntries: WorkEntry[] = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch = (workData: {
      id?: string;
      name: string;
      subtitle?: string;
      descriptionMarkdown: string;
      objectiveId: string;
      parentWorkId?: string;
      nodeType?: string;
      tags?: string[] | string;
    }) => {
      if (!searchTerm) return true;
      const objectiveName = objectiveMap.get(workData.objectiveId)?.name ?? '';
      const parentPath = workData.parentWorkId ? workPathById.get(workData.parentWorkId) ?? '' : '';
      const selfPath = workData.id ? workPathById.get(workData.id) ?? '' : '';
      const nodeType = (workData.nodeType ?? '').toLowerCase();
      const tagText = Array.isArray(workData.tags) ? workData.tags.join(' ') : workData.tags ?? '';
      return (
        workData.name.toLowerCase().includes(searchTerm) ||
        (workData.subtitle ?? '').toLowerCase().includes(searchTerm) ||
        workData.descriptionMarkdown.toLowerCase().includes(searchTerm) ||
        objectiveName.toLowerCase().includes(searchTerm) ||
        parentPath.toLowerCase().includes(searchTerm) ||
        selfPath.toLowerCase().includes(searchTerm) ||
        nodeType.includes(searchTerm) ||
        tagText.toLowerCase().includes(searchTerm)
      );
    };

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
        nodeType: work.nodeType ?? '',
        tags: work.tags ?? [],
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
  }, [works, worksById, editingEntries, objectiveMap, workPathById, search]);

  const isEntryHiddenByCollapsedTree = useCallback(
    (entry: WorkEntry) => {
      const startingParent =
        (entry.isEditing && entry.form ? entry.form.parentWorkId : entry.parentWorkId) ?? '';
      if (!startingParent) return false;
      let current = startingParent;
      const visited = new Set<string>();
      while (current && !visited.has(current)) {
        visited.add(current);
        if (collapsedWorkTrees.has(current)) return true;
        const next = worksById.get(current)?.parentWorkId ?? '';
        current = next || '';
      }
      return false;
    },
    [collapsedWorkTrees, worksById]
  );

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
            nodeType: work.nodeType ?? '',
            scheduleKind: work.schedule?.kind ?? '',
            scheduleNumber: work.schedule?.number ?? 1,
            tags: work.tags ?? [],
            orderHint: work.orderHint ?? 0,
            nextWorkId: work.nextWorkId ?? '',
            variantOfWorkId: work.variantOfWorkId ?? '',
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
          nodeType: work.nodeType ?? '',
          scheduleKind: work.schedule?.kind ?? '',
          scheduleNumber: work.schedule?.number ?? 1,
          tags: work.tags ?? [],
          orderHint: work.orderHint ?? 0,
          nextWorkId: '',
          variantOfWorkId: '',
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
    const nodeTypeValue = entry.data.nodeType.trim();
    const nodeType = nodeTypeValue.length > 0 ? nodeTypeValue : undefined;
    const scheduleKindRaw = (entry.data.scheduleKind ?? '').trim();
    const scheduleKindCandidate = scheduleKindRaw.length > 0 ? scheduleKindRaw : undefined;
    const scheduleKind = isWorkScheduleKind(scheduleKindCandidate) ? scheduleKindCandidate : undefined;
    const scheduleNumberRaw = Number(entry.data.scheduleNumber);
    const scheduleNumber = Number.isFinite(scheduleNumberRaw) ? Math.trunc(scheduleNumberRaw) : undefined;
    const effectiveScheduleKind = (nodeType ?? '').trim().toLowerCase() === 'reading' ? scheduleKind : undefined;
    const effectiveScheduleNumber = effectiveScheduleKind ? scheduleNumber : undefined;
    const tags = normalizeTagsSelection(entry.data.tags ?? []);
    const orderHint = Number(entry.data.orderHint) > 0 ? Number(entry.data.orderHint) : undefined;
    const nextValue = (entry.data.nextWorkId ?? '').trim();
    const nextWorkId = nextValue.length > 0 ? nextValue : undefined;
    const variantValue = (entry.data.variantOfWorkId ?? '').trim();
    const variantOfWorkId = variantValue.length > 0 ? variantValue : undefined;

    const payload = {
      name: entry.data.name.trim(),
      subtitle: entry.data.subtitle.trim() || undefined,
      objectiveId: entry.data.objectiveId,
      nodeType,
      scheduleKind: effectiveScheduleKind,
      scheduleNumber: effectiveScheduleNumber,
      tags,
      orderHint,
      nextWorkId,
      variantOfWorkId,
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

    if (entry.originalId && payload.nextWorkId === entry.originalId) {
      setFeedback({ type: 'error', text: 'Un trabajo no puede tenerse como siguiente.' });
      return;
    }

    if (entry.originalId && payload.variantOfWorkId === entry.originalId) {
      setFeedback({ type: 'error', text: 'Un trabajo no puede ser variante de sí mismo.' });
      return;
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
            nodeType: payload.nodeType,
            scheduleKind: payload.scheduleKind,
            scheduleNumber: payload.scheduleNumber,
            tags: payload.tags,
            orderHint: payload.orderHint,
            nextWorkId: payload.nextWorkId,
            variantOfWorkId: payload.variantOfWorkId,
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
          nodeType: payload.nodeType ?? null,
          scheduleKind: payload.scheduleKind ?? null,
          scheduleNumber: payload.scheduleKind ? payload.scheduleNumber ?? null : null,
          tags: payload.tags,
          orderHint: payload.orderHint ?? null,
          nextWorkId: payload.nextWorkId ?? null,
          variantOfWorkId: payload.variantOfWorkId ?? null,
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

  const togglePersonalPlanExcluded = async (work: Work) => {
    if (!actorContext) {
      setFeedback({ type: 'error', text: 'Inicia sesión para editar trabajos.' });
      return;
    }
    if (!(work.canEdit ?? false)) return;
    if ((work.nodeType ?? '').trim().toLowerCase() === 'style') return;

    const existing = (work.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    const isExcluded = existing.includes(PERSONAL_EXCLUDE_TAG);
    const nextTags = isExcluded ? existing.filter((tag) => tag !== PERSONAL_EXCLUDE_TAG) : Array.from(new Set([...existing, PERSONAL_EXCLUDE_TAG]));

    setTogglingPersonalWorkId(work.id);
    try {
      await updateWork(work.id, { tags: nextTags }, actorContext);
      setFeedback({
        type: 'success',
        text: isExcluded ? 'Incluido en el plan personal.' : 'Excluido del plan personal.'
      });
      window.setTimeout(() => setFeedback(null), 1800);
    } catch (error) {
      console.error('No se pudo actualizar el trabajo', error);
      setFeedback({
        type: 'error',
        text: 'No se han podido guardar los cambios. Comprueba tus permisos e inténtalo de nuevo.'
      });
    } finally {
      setTogglingPersonalWorkId(null);
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
            <Link to="/catalog/taxonomy" className="btn-secondary">
              Taxonomy
            </Link>
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
            const groupKey = objective?.id ?? NO_OBJECTIVE_KEY;
            const isGroupCollapsed = collapsedObjectiveGroups.has(groupKey);
            return (
              <div key={objective?.id ?? 'sin-objetivo'} className="glass-panel space-y-4 p-6">
                <header className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCollapsedObjectiveGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(groupKey)) {
                            next.delete(groupKey);
                          } else {
                            next.add(groupKey);
                          }
                          return next;
                        })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                      aria-label={isGroupCollapsed ? 'Expandir grupo' : 'Colapsar grupo'}
                      title={isGroupCollapsed ? 'Expandir' : 'Colapsar'}
                    >
                      {isGroupCollapsed ? '▸' : '▾'}
                    </button>
                    <h3 className="text-lg font-semibold text-white">{groupTitle}</h3>
                    <ObjectiveChip objective={objective} size="sm" />
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    {items.length} trabajo{items.length === 1 ? '' : 's'}
                  </span>
                </header>
                {isGroupCollapsed ? null : (
                  <div className="space-y-4">
                    {items
                      .filter((entry) => !isEntryHiddenByCollapsedTree(entry))
                      .map((entry) => {
                    const isExpanded = expandedWorks.has(entry.id);
                    const currentParentId =
                      (entry.isEditing && entry.form ? entry.form.parentWorkId : entry.parentWorkId) ?? '';
                    const parentOptions = entry.isEditing
                      ? buildParentOptions(entry.work?.id, currentParentId)
                      : [];
                    const childWorks = entry.work ? childrenByWorkId.get(entry.work.id) ?? [] : [];
                    const childCount = childWorks.length;
                    const isTreeCollapsed = collapsedWorkTrees.has(entry.id);
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
                          workOptions={workOptions}
                          nodeTypeOptions={nodeTypeOptions}
                          tagOptions={tagOptions}
                          onCreateNodeType={upsertNodeType}
                          onCreateTag={upsertTag}
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

                    const nextLabel = entry.work.nextWorkId
                      ? workPathById.get(entry.work.nextWorkId) ?? worksById.get(entry.work.nextWorkId)?.name
                      : undefined;
                    const variantLabel = entry.work.variantOfWorkId
                      ? workPathById.get(entry.work.variantOfWorkId) ?? worksById.get(entry.work.variantOfWorkId)?.name
                      : undefined;

                    return (
                      <WorkViewCard
                        key={entry.id}
                        work={entry.work}
                        childCount={childCount}
                        depth={entry.depth}
                        expanded={isExpanded}
                        isTreeCollapsed={isTreeCollapsed}
                        isPersonalExcluded={(entry.work.tags ?? []).map((tag) => tag.trim().toLowerCase()).includes(PERSONAL_EXCLUDE_TAG)}
                        canTogglePersonal={(entry.work.canEdit ?? false) && ((entry.work.nodeType ?? '').trim().toLowerCase() !== 'style')}
                        personalToggleBusy={togglingPersonalWorkId === entry.id}
                        nextLabel={nextLabel}
                        variantLabel={variantLabel}
                        onToggle={() => toggleExpanded(entry.id)}
                        onToggleTree={() =>
                          setCollapsedWorkTrees((prev) => {
                            const next = new Set(prev);
                            if (next.has(entry.id)) {
                              next.delete(entry.id);
                            } else {
                              next.add(entry.id);
                            }
                            return next;
                          })
                        }
                        onTogglePersonal={() => {
                          if (entry.work) {
                            void togglePersonalPlanExcluded(entry.work);
                          }
                        }}
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
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
