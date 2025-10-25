import { nanoid } from 'nanoid';

import { supabase } from '@/lib/supabaseClient';
import type { Work, WorkCollaborator, WorkVisibility } from '@/types';

interface WorkRow {
  id: string;
  name: string;
  subtitle?: string | null;
  objective_id: string;
  parent_work_id?: string | null;
  description_markdown: string;
  estimated_minutes: number | null;
  notes?: string | null;
  video_urls?: unknown;
  visibility: WorkVisibility;
  owner_id: string;
  owner_email: string;
  created_at: string;
  updated_at: string;
  work_collaborators?: Array<{
    id: string;
    email: string;
    role: 'editor';
    user_id?: string | null;
    created_at: string;
  }>;
}

export interface WorkCreateInput {
  id?: string;
  name: string;
  subtitle?: string;
  objectiveId: string;
  parentWorkId?: string | null;
  descriptionMarkdown: string;
  estimatedMinutes: number;
  notes?: string;
  videoUrls: string[];
  visibility: WorkVisibility;
  collaboratorEmails: string[];
}

export interface WorkUpdateInput {
  name?: string;
  subtitle?: string | null;
  objectiveId?: string;
  parentWorkId?: string | null;
  descriptionMarkdown?: string;
  estimatedMinutes?: number;
  notes?: string | null;
  videoUrls?: string[];
  visibility?: WorkVisibility;
  collaboratorEmails?: string[];
}

export interface WorkActionContext {
  actorId: string;
  actorEmail: string;
}

const WORK_SELECT = `
  id,
  name,
  subtitle,
  objective_id,
  parent_work_id,
  description_markdown,
  estimated_minutes,
  notes,
  video_urls,
  visibility,
  owner_id,
  owner_email,
  created_at,
  updated_at,
  work_collaborators (
    id,
    email,
    role,
    user_id,
    created_at
  )
`;

const normalizeEmails = (emails: string[]) =>
  Array.from(
    new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter((value) => value.length > 0)
    )
  );

const parseVideoUrls = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }
  return [];
};

const mapCollaborators = (rows: WorkRow['work_collaborators']): WorkCollaborator[] =>
  (rows ?? []).map((collaborator) => ({
    id: `${collaborator.id}`,
    email: collaborator.email.toLowerCase(),
    role: collaborator.role,
    userId: collaborator.user_id ?? undefined,
    createdAt: collaborator.created_at
  }));

const mapWorkRow = (
  row: WorkRow,
  context: WorkActionContext | null
): Work => {
  const collaborators = mapCollaborators(row.work_collaborators);
  const collaboratorEmails = collaborators.map((collaborator) => collaborator.email);
  const actorEmail = context?.actorEmail?.toLowerCase() ?? '';
  const isOwner = context ? row.owner_id === context.actorId : false;
  const canEdit = isOwner || collaboratorEmails.includes(actorEmail);

  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? undefined,
    objectiveId: row.objective_id,
    parentWorkId: row.parent_work_id ?? null,
    descriptionMarkdown: row.description_markdown ?? '',
    estimatedMinutes: row.estimated_minutes ?? 0,
    notes: row.notes ?? undefined,
    videoUrls: parseVideoUrls(row.video_urls),
    visibility: row.visibility ?? 'private',
    ownerId: row.owner_id,
    ownerEmail: row.owner_email?.toLowerCase() ?? '',
    collaborators,
    collaboratorEmails,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    canEdit,
    isOwner
  };
};

export async function fetchAccessibleWorks(
  context: WorkActionContext
): Promise<Work[]> {
  const { data, error } = await supabase.from('works').select(WORK_SELECT).order('name');
  if (error) {
    console.error('No se pudieron cargar los trabajos compartidos', error);
    throw error;
  }

  return (data as WorkRow[]).map((row) => mapWorkRow(row, context));
}

export async function createWork(
  input: WorkCreateInput,
  context: WorkActionContext
): Promise<Work> {
  const id = input.id ?? nanoid();
  const collaboratorEmails = normalizeEmails(input.collaboratorEmails);
  const ownerEmail = context.actorEmail.trim().toLowerCase();

  const { data, error } = await supabase
    .from('works')
    .insert({
      id,
      name: input.name,
      subtitle: input.subtitle ?? null,
      objective_id: input.objectiveId,
      parent_work_id: input.parentWorkId ?? null,
      description_markdown: input.descriptionMarkdown,
      estimated_minutes: input.estimatedMinutes,
      notes: input.notes ?? null,
      video_urls: input.videoUrls,
      visibility: input.visibility,
      owner_id: context.actorId,
      owner_email: ownerEmail,
      updated_at: new Date().toISOString()
    })
    .select(WORK_SELECT)
    .maybeSingle();

  if (error || !data) {
    console.error('No se pudo crear el trabajo', error);
    throw error ?? new Error('Falta respuesta al crear trabajo');
  }

  if (collaboratorEmails.length > 0) {
    const insertPayload = collaboratorEmails.map((email) => ({
      work_id: data.id,
      email
    }));
    const { error: collaboratorsError } = await supabase
      .from('work_collaborators')
      .insert(insertPayload);
    if (collaboratorsError) {
      console.error('No se pudieron guardar los colaboradores', collaboratorsError);
      throw collaboratorsError;
    }
  }

  const { data: refreshedRow, error: refreshError } = await supabase
    .from('works')
    .select(WORK_SELECT)
    .eq('id', data.id)
    .maybeSingle();

  if (refreshError || !refreshedRow) {
    console.error('No se pudo refrescar el trabajo creado', refreshError);
    throw refreshError ?? new Error('No se pudo cargar el trabajo creado');
  }

  return mapWorkRow(refreshedRow as WorkRow, context);
}

export async function updateWork(
  id: string,
  patch: WorkUpdateInput,
  context: WorkActionContext
): Promise<Work> {
  const updatePayload: Record<string, unknown> = {};

  if (patch.name !== undefined) updatePayload.name = patch.name;
  if (patch.subtitle !== undefined) updatePayload.subtitle = patch.subtitle;
  if (patch.objectiveId !== undefined) updatePayload.objective_id = patch.objectiveId;
  if (patch.parentWorkId !== undefined) updatePayload.parent_work_id = patch.parentWorkId;
  if (patch.descriptionMarkdown !== undefined) {
    updatePayload.description_markdown = patch.descriptionMarkdown;
  }
  if (patch.estimatedMinutes !== undefined) {
    updatePayload.estimated_minutes = patch.estimatedMinutes;
  }
  if (patch.notes !== undefined) updatePayload.notes = patch.notes;
  if (patch.videoUrls !== undefined) updatePayload.video_urls = patch.videoUrls;
  if (patch.visibility !== undefined) updatePayload.visibility = patch.visibility;
  updatePayload.updated_at = new Date().toISOString();

  let updatedRow: WorkRow | null = null;

  if (Object.keys(updatePayload).length > 0) {
    const { data, error } = await supabase
      .from('works')
      .update(updatePayload)
      .eq('id', id)
      .select(WORK_SELECT)
      .maybeSingle();

    if (error || !data) {
      console.error('No se pudo actualizar el trabajo', error);
      throw error ?? new Error('Falta respuesta al actualizar trabajo');
    }

    updatedRow = data as WorkRow;
  } else {
    const { data, error } = await supabase
      .from('works')
      .select(WORK_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) {
      throw error ?? new Error('Trabajo no encontrado');
    }
    updatedRow = data as WorkRow;
  }

  if (patch.collaboratorEmails) {
    const desiredEmails = normalizeEmails(patch.collaboratorEmails);
    const existingCollaborators = mapCollaborators(updatedRow.work_collaborators);
    const existingEmails = existingCollaborators.map((collab) => collab.email);

    const toAdd = desiredEmails.filter((email) => !existingEmails.includes(email));
    const toRemove = existingCollaborators.filter(
      (collab) => !desiredEmails.includes(collab.email)
    );

    if (toAdd.length > 0) {
      const payload = toAdd.map((email) => ({
        work_id: id,
        email
      }));
      const { error: addError } = await supabase
        .from('work_collaborators')
        .insert(payload);
      if (addError) {
        console.error('No se pudieron añadir los colaboradores', addError);
        throw addError;
      }
    }

    if (toRemove.length > 0) {
      const emailsToRemove = toRemove.map((collab) => collab.email);
      const { error: deleteError } = await supabase
        .from('work_collaborators')
        .delete()
        .eq('work_id', id)
        .in('email', emailsToRemove);
      if (deleteError) {
        console.error('No se pudieron eliminar colaboradores', deleteError);
        throw deleteError;
      }
    }

    const { data: refreshedRow, error: refreshError } = await supabase
      .from('works')
      .select(WORK_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (refreshError || !refreshedRow) {
      throw refreshError ?? new Error('Error al refrescar colaboradores');
    }
    updatedRow = refreshedRow as WorkRow;
  }

  return mapWorkRow(updatedRow, context);
}

export async function deleteWork(
  id: string
): Promise<void> {
  const { error } = await supabase.from('works').delete().eq('id', id);
  if (error) {
    console.error('No se pudo eliminar el trabajo', error);
    throw error;
  }
}
