import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, type CollectionsState, type AppState } from '@/store/appStore';

interface PlannerStatePayload extends CollectionsState {
  version?: number;
}

interface PlannerStateRow {
  data: PlannerStatePayload | null;
  updated_at: string;
}

const VERSION = 1;

const selectCollections = (state: AppState): CollectionsState => ({
  objectives: state.objectives,
  works: state.works,
  sessions: state.sessions,
  assistants: state.assistants
});

const normalizeCollections = (payload: Partial<PlannerStatePayload>): CollectionsState => ({
  objectives: payload.objectives ?? [],
  works: payload.works ?? [],
  sessions: (payload.sessions ?? []).map((session) => ({
    ...session,
    workItems: session.workItems ?? [],
    attendance: session.attendance ?? []
  })),
  assistants: payload.assistants ?? []
});

const collectionsChanged = (a: CollectionsState, b: CollectionsState) =>
  a.objectives !== b.objectives ||
  a.works !== b.works ||
  a.sessions !== b.sessions ||
  a.assistants !== b.assistants;

export function useSupabaseSync() {
  const { user } = useAuth();
  const setCollections = useAppStore((state) => state.setCollections);
  const reset = useAppStore((state) => state.reset);
  const ready = useAppStore((state) => state.ready);

  const skipNextSyncRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);
  const pendingPayloadRef = useRef<CollectionsState | null>(null);
  const lastRemoteUpdatedAtRef = useRef<string | null>(null);
  const prevPayloadRef = useRef<CollectionsState>(selectCollections(useAppStore.getState()));

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!user) {
      reset();
      lastRemoteUpdatedAtRef.current = null;
      pendingPayloadRef.current = null;
      skipNextSyncRef.current = false;
      prevPayloadRef.current = selectCollections(useAppStore.getState());
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    }
  }, [user, reset]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const loadRemoteState = async () => {
      const { data: remoteRow, error } = await supabase
        .from('planner_states')
        .select('data, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error && error.code !== 'PGRST116') {
        console.error('No se pudo cargar el estado remoto', error);
        return;
      }

      const row = remoteRow as PlannerStateRow | null;

      if (row?.data) {
        const payload = normalizeCollections(row.data ?? {});
        skipNextSyncRef.current = true;
        lastRemoteUpdatedAtRef.current = row.updated_at;
        prevPayloadRef.current = payload;
        setCollections(payload);
      } else if (ready) {
        const localState = selectCollections(useAppStore.getState());
        pendingPayloadRef.current = null;
        const { error: upsertError, data: upsertedRow } = await supabase
          .from('planner_states')
          .upsert(
            {
              user_id: user.id,
              data: {
                version: VERSION,
                ...localState
              }
            },
            { onConflict: 'user_id' }
          )
          .select('updated_at')
          .maybeSingle();
        const updatedRow = upsertedRow as { updated_at: string } | null;
        if (upsertError) {
          console.error('No se pudo inicializar el estado remoto', upsertError);
        } else if (updatedRow) {
          lastRemoteUpdatedAtRef.current = updatedRow.updated_at;
        }
      }
    };

    void loadRemoteState();

    const unsubscribe = useAppStore.subscribe((state) => {
      if (!isMounted) return;
      const next = selectCollections(state);
      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        prevPayloadRef.current = next;
        pendingPayloadRef.current = null;
        return;
      }
      const previous = prevPayloadRef.current;
      if (!collectionsChanged(next, previous)) {
        return;
      }
      prevPayloadRef.current = next;
      pendingPayloadRef.current = next;
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = window.setTimeout(() => {
        if (!pendingPayloadRef.current) return;
        const payload = pendingPayloadRef.current;
        pendingPayloadRef.current = null;
        void (async () => {
          const { error: upsertError, data: upsertedRow } = await supabase
            .from('planner_states')
            .upsert(
              {
                user_id: user.id,
                data: {
                  version: VERSION,
                  ...payload
                }
              },
              { onConflict: 'user_id' }
            )
            .select('updated_at')
            .maybeSingle();
          const updatedRow = upsertedRow as { updated_at: string } | null;
          if (upsertError) {
            console.error('No se pudo guardar el estado remoto', upsertError);
          } else if (updatedRow) {
            lastRemoteUpdatedAtRef.current = updatedRow.updated_at;
          }
        })();
      }, 600);
    });

    return () => {
      isMounted = false;
      unsubscribe();
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [user, ready, setCollections]);
}
