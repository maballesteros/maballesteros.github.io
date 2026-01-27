import { useMemo, useState } from 'react';
import clsx from 'clsx';

export type MultiSelectOption = {
  value: string;
  label?: string;
};

type CreateResult = { createdValue: string; createdLabel?: string } | null;

interface MultiSelectChipsProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  allowCreate?: boolean;
  onCreate?: (raw: string) => CreateResult;
  maxSelected?: number;
}

function uniq(list: string[]): string[] {
  return Array.from(new Set(list));
}

export function MultiSelectChips({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Search…',
  allowCreate = false,
  onCreate,
  maxSelected
}: MultiSelectChipsProps) {
  const [query, setQuery] = useState('');

  const normalizedValue = useMemo(() => uniq(value.map((v) => v.trim()).filter(Boolean)), [value]);
  const selectedSet = useMemo(() => new Set(normalizedValue), [normalizedValue]);
  const optionMap = useMemo(() => new Map(options.map((opt) => [opt.value, opt])), [options]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const label = (opt.label ?? opt.value).toLowerCase();
      return label.includes(q) || opt.value.toLowerCase().includes(q);
    });
  }, [options, query]);

  const canSelectMore = typeof maxSelected === 'number' ? normalizedValue.length < maxSelected : true;

  const rawCreate = query.trim();
  const createVisible =
    allowCreate &&
    Boolean(rawCreate) &&
    typeof onCreate === 'function' &&
    !options.some((opt) => opt.value.toLowerCase() === rawCreate.toLowerCase()) &&
    !options.some((opt) => (opt.label ?? '').toLowerCase() === rawCreate.toLowerCase());

  return (
    <div className={clsx('space-y-2', disabled && 'opacity-60')}>
      {normalizedValue.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {normalizedValue.map((v) => {
            const label = optionMap.get(v)?.label ?? v;
            return (
              <button
                key={v}
                type="button"
                disabled={disabled}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100 transition hover:border-sky-400/50"
                onClick={() => onChange(normalizedValue.filter((item) => item !== v))}
                title="Remove"
              >
                {label}
                <span className="text-sky-200/80">×</span>
              </button>
            );
          })}
          <button
            type="button"
            disabled={disabled}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        </div>
      ) : null}

      <input
        type="text"
        className="input-field"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="max-h-48 overflow-auto rounded-2xl border border-white/10 bg-white/5 p-2">
        <div className="flex flex-wrap gap-2">
          {createVisible ? (
            <button
              type="button"
              disabled={disabled || !canSelectMore}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-400/50 disabled:opacity-50"
              onClick={() => {
                const created = onCreate?.(rawCreate) ?? null;
                if (!created) return;
                const next = uniq([...normalizedValue, created.createdValue]);
                onChange(next);
                setQuery('');
              }}
              title="Create"
            >
              + Create “{rawCreate}”
            </button>
          ) : null}

          {filteredOptions.map((opt) => {
            const label = opt.label ?? opt.value;
            const active = selectedSet.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled || (!active && !canSelectMore)}
                className={clsx(
                  'rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-50',
                  active
                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                    : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                )}
                onClick={() => {
                  const next = active
                    ? normalizedValue.filter((v) => v !== opt.value)
                    : uniq([...normalizedValue, opt.value]);
                  onChange(next);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

