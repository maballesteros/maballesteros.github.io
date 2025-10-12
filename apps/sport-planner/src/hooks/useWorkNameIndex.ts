import { useMemo } from 'react';

import { useAppStore } from '@/store/appStore';
import type { Work } from '@/types';

interface WorkNameIndexEntry {
  name: string;
  work: Work;
}

interface WorkNameIndex {
  uniqueByName: Map<string, Work>;
  duplicates: Map<string, Work[]>;
  entries: WorkNameIndexEntry[];
}

const isTruthy = <T,>(value: T | null | undefined): value is T => value !== null && value !== undefined;

export function useWorkNameIndex(): WorkNameIndex {
  const works = useAppStore((state) => state.works);

  return useMemo(() => {
    const groups = new Map<string, Work[]>();
    works.forEach((work) => {
      const key = work.name?.trim();
      if (!key) return;
      const bucket = groups.get(key) ?? [];
      bucket.push(work);
      groups.set(key, bucket);
    });

    const uniqueByName = new Map<string, Work>();
    const duplicates = new Map<string, Work[]>();

    groups.forEach((list, name) => {
      if (list.length === 1) {
        uniqueByName.set(name, list[0]!);
      } else if (list.length > 1) {
        duplicates.set(name, list.filter(isTruthy));
      }
    });

    const entries: WorkNameIndexEntry[] = Array.from(uniqueByName.entries()).map(([name, work]) => ({
      name,
      work
    }));

    entries.sort((a, b) => b.name.length - a.name.length || a.name.localeCompare(b.name, 'es'));

    return {
      uniqueByName,
      duplicates,
      entries
    };
  }, [works]);
}
