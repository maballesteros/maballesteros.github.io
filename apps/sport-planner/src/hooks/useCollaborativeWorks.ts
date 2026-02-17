import { useEffect } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/useAuth';
import { useAppStore } from '@/store/appStore';

export function useCollaborativeWorks() {
  const { user } = useAuth();
  const loadWorks = useAppStore((state) => state.loadWorks);
  const setWorks = useAppStore((state) => state.setWorks);
  const userId = user?.id ?? null;
  const userEmail = (user?.email ?? '').trim().toLowerCase();

  useEffect(() => {
    if (!userId) {
      setWorks([]);
      return;
    }

    const context = {
      actorId: userId,
      actorEmail: userEmail
    };

    const fetchWorks = async () => {
      try {
        await loadWorks(context);
      } catch (error) {
        console.error('No se pudieron sincronizar los trabajos colaborativos', error);
      }
    };

    void fetchWorks();

    const channel = supabase
      .channel('works-collaboration')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'works' },
        () => {
          void fetchWorks();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_collaborators' },
        () => {
          void fetchWorks();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, userEmail, loadWorks, setWorks]);
}
