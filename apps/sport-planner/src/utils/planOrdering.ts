import type { Plan } from '@/types';

const PLAN_NAME_COLLATOR = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

type ParsedPrefix = { order: number | null; rest: string };

function parseLeadingOrderPrefix(name: string): ParsedPrefix {
  const trimmed = (name ?? '').trim();
  const match = trimmed.match(/^(\d+)\s*[\.)-]?\s*(.*)$/);
  if (!match) return { order: null, rest: trimmed };
  const order = Number(match[1]);
  if (!Number.isFinite(order)) return { order: null, rest: trimmed };
  return { order: Math.trunc(order), rest: (match[2] ?? '').trim() };
}

function hasNumericPrefix(plan: Plan): boolean {
  return parseLeadingOrderPrefix(plan.name).order !== null;
}

export function sortPlansForUi(plans: Plan[]): Plan[] {
  const next = [...plans];
  const anyHasPrefix = next.some(hasNumericPrefix);

  next.sort((a, b) => {
    if (anyHasPrefix) {
      const aParsed = parseLeadingOrderPrefix(a.name);
      const bParsed = parseLeadingOrderPrefix(b.name);
      const aOrder = aParsed.order ?? Number.POSITIVE_INFINITY;
      const bOrder = bParsed.order ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const byName = PLAN_NAME_COLLATOR.compare(aParsed.rest || a.name, bParsed.rest || b.name);
      if (byName !== 0) return byName;
      return PLAN_NAME_COLLATOR.compare(a.id, b.id);
    }

    const kindOrder = a.kind === b.kind ? 0 : a.kind === 'class' ? -1 : 1;
    if (kindOrder !== 0) return kindOrder;
    const byName = PLAN_NAME_COLLATOR.compare(a.name, b.name);
    if (byName !== 0) return byName;
    return PLAN_NAME_COLLATOR.compare(a.id, b.id);
  });

  return next;
}

