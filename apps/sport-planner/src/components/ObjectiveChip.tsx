import type { Objective } from '@/types';

interface ObjectiveChipProps {
  objective?: Objective;
  size?: 'sm' | 'md';
}

export function ObjectiveChip({ objective, size = 'md' }: ObjectiveChipProps) {
  if (!objective) {
    return null;
  }
  const base = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium text-slate-950 shadow shadow-black/30 ${base}`}
      style={{ backgroundColor: objective.colorHex }}
    >
      <span className="h-2.5 w-2.5 rounded-full border border-black/20 bg-white/70" />
      {objective.name}
    </span>
  );
}
