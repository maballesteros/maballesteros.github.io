import { useEffect } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/appStore';

export function useCollaborativeWorks() {
  const { user } = useAuth();
  const loadWorks = useAppStore((state) => state.loadWorks);
  const setWorks = useAppStore((state) => state.setWorks);

  useEffect(() => {
    if (!user) {
      setWorks([]);
      return;
    }

    const context = {
      actorId: user.id,
      actorEmail: user.email ?? ''
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
  }, [user, loadWorks, setWorks]);
}
