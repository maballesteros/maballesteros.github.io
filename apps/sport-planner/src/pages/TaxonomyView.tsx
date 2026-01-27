import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/store/appStore';

type Feedback = { type: 'success' | 'error'; text: string } | null;

function countBy<T extends string>(items: T[]): Record<T, number> {
  return items.reduce(
    (acc, item) => {
      acc[item] = (acc[item] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>
  );
}

export default function TaxonomyView() {
  const { works, workTaxonomy, upsertNodeType, removeNodeType, upsertTag, removeTag } = useAppStore((state) => ({
    works: state.works,
    workTaxonomy: state.workTaxonomy,
    upsertNodeType: state.upsertNodeType,
    removeNodeType: state.removeNodeType,
    upsertTag: state.upsertTag,
    removeTag: state.removeTag
  }));

  const [nodeTypeDraft, setNodeTypeDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const nodeTypeCounts = useMemo(() => {
    const list = works
      .map((work) => (work.nodeType ?? '').trim().toLowerCase())
      .filter(Boolean) as string[];
    return countBy(list);
  }, [works]);

  const tagCounts = useMemo(() => {
    const list = works.flatMap((work) => (work.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean));
    return countBy(list);
  }, [works]);

  const nodeTypes = workTaxonomy.nodeTypes.slice().sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
  const tags = workTaxonomy.tags.slice().sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
        <div>
          <p className="font-display text-2xl font-semibold">Taxonomy</p>
          <p className="mt-1 text-sm text-white/60">Node types and tags used across the catalog and personal planning.</p>
          <p className="mt-2 text-sm">
            <Link to="/catalog" className="text-sky-300 hover:text-sky-200">
              ← Back to Catalog
            </Link>
          </p>
        </div>
      </header>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Node types</h2>
              <p className="mt-1 text-sm text-white/60">Used by works and group rules. Keys are stored in works.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/50">New node type</label>
              <input
                className="input-field mt-2"
                value={nodeTypeDraft}
                onChange={(event) => setNodeTypeDraft(event.target.value)}
                placeholder="e.g. Dance figures"
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const created = upsertNodeType(nodeTypeDraft);
                if (!created) {
                  setFeedback({ type: 'error', text: 'Please enter a valid node type.' });
                  return;
                }
                setNodeTypeDraft('');
                setFeedback({ type: 'success', text: `Node type created: ${created}` });
              }}
            >
              Add
            </button>
          </div>

          <div className="mt-6 space-y-2">
            {nodeTypes.map((nt) => {
              const inUse = (nodeTypeCounts[nt.key] ?? 0) > 0;
              return (
                <div
                  key={nt.key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{nt.label}</p>
                    <p className="text-xs text-white/50">
                      key: <span className="font-mono">{nt.key}</span> · used by {nodeTypeCounts[nt.key] ?? 0} works
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={inUse}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-50"
                    title={inUse ? 'Cannot delete: in use' : 'Delete'}
                    onClick={() => {
                      const ok = removeNodeType(nt.key);
                      setFeedback(ok ? { type: 'success', text: `Node type removed: ${nt.key}` } : { type: 'error', text: 'Cannot remove node type (it may be in use).' });
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
            {nodeTypes.length === 0 ? <p className="text-sm text-white/60">No node types yet.</p> : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Tags</h2>
              <p className="mt-1 text-sm text-white/60">Lowercase slugs (spaces become hyphens). Deleting is blocked if used.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/50">New tag</label>
              <input
                className="input-field mt-2"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                placeholder="e.g. bei-shaolin"
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const created = upsertTag(tagDraft);
                if (!created) {
                  setFeedback({ type: 'error', text: 'Please enter a valid tag.' });
                  return;
                }
                setTagDraft('');
                setFeedback({ type: 'success', text: `Tag created: ${created}` });
              }}
            >
              Add
            </button>
          </div>

          <div className="mt-6 space-y-2">
            {tags.map((tag) => {
              const inUse = (tagCounts[tag.name] ?? 0) > 0;
              return (
                <div
                  key={tag.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{tag.name}</p>
                    <p className="text-xs text-white/50">used by {tagCounts[tag.name] ?? 0} works</p>
                  </div>
                  <button
                    type="button"
                    disabled={inUse}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-50"
                    title={inUse ? 'Cannot delete: in use' : 'Delete'}
                    onClick={() => {
                      const ok = removeTag(tag.name);
                      setFeedback(ok ? { type: 'success', text: `Tag removed: ${tag.name}` } : { type: 'error', text: 'Cannot remove tag (it may be in use).' });
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
            {tags.length === 0 ? <p className="text-sm text-white/60">No tags yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

