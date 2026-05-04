import yaml from 'js-yaml';

import {
  canonicalActionSequence,
  extractTechniqueRefs,
  formatActionSequence,
  parseActionSequence,
  parseNotation,
  stripTechniqueRefs
} from '@/lib/notationParser';
import type {
  Action,
  Actor,
  Cue,
  Drill,
  DrillPathStep,
  Duration,
  KfgDocument,
  ResponseOption,
  ResponsePhase,
  SourceRef,
  TechniqueRef
} from '@/types';

const ensureRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`YAML invalido: ${label}.`);
  }
  return value as Record<string, unknown>;
};

const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value.trim() : fallback);
const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : undefined;

const asDuration = (value: unknown): Duration => {
  const numeric = Number(value);
  return numeric === 0.5 || numeric === 1 || numeric === 1.5 || numeric === 2 ? numeric : 1;
};

const asOptionalDuration = (value: unknown): Duration | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  return numeric === 0.5 || numeric === 1 || numeric === 1.5 || numeric === 2 ? numeric : undefined;
};

const asPhase = (value: unknown): ResponsePhase => {
  const phases: ResponsePhase[] = ['defensa', 'contra', 'continuacion', 'captura', 'recontra', 'reset'];
  return phases.includes(value as ResponsePhase) ? (value as ResponsePhase) : 'defensa';
};

const asActor = (value: unknown): Actor => (value === 'B' ? 'B' : 'A');

const parseSource = (value: unknown): SourceRef | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const source = ensureRecord(value, 'source');
  const note = asString(source.note);
  return note
    ? {
        note,
        line: Number.isFinite(Number(source.line)) ? Number(source.line) : undefined,
        macro: asString(source.macro) || undefined
      }
    : undefined;
};

const parseTechniqueRefs = (value: unknown, line: string, label = ''): TechniqueRef[] | undefined => {
  const explicit = Array.isArray(value)
    ? value.flatMap((entry) => {
        if (typeof entry === 'string') return [{ note: entry }];
        const record = ensureRecord(entry, 'techniqueRef');
        const note = asString(record.note);
        const role = asString(record.role) as TechniqueRef['role'];
        return note ? [{ note, role: role || undefined }] : [];
      })
    : undefined;

  if (explicit) return explicit;
  const inferred = [...new Set([...parseNotation(line).techniqueRefs, ...extractTechniqueRefs(label)])].map((note) => ({ note: `[[${note}]]` }));
  return inferred.length > 0 ? inferred : undefined;
};

const parseActions = (value: unknown, line: string): Action[] => {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (typeof entry === 'string') return parseActionSequence(entry).actions;
      const item = ensureRecord(entry, 'action');
      const verb = asString(item.verb);
      return verb
        ? [
            {
              verb,
              tool: (asString(item.tool) as Action['tool']) || undefined,
              target: asString(item.target) || undefined
            }
          ]
        : [];
    });
  }
  return parseActionSequence(line).actions;
};

const deriveActionTags = (actions: Action[], extra: string[] = []) => {
  const tags = new Set<string>();
  actions.forEach((action) => {
    if (action.verb) tags.add(action.verb);
    if (action.target) tags.add(action.target);
  });
  extra.filter(Boolean).forEach((tag) => tags.add(tag));
  return [...tags];
};

export const inferDuration = (actions: Action[]): Duration => {
  const duration = actions.length * 0.5;
  if (duration === 0.5 || duration === 1 || duration === 1.5 || duration === 2) return duration;
  return 1;
};

const inferYield = (response: ResponseOption, cueIdByLine: Map<string, string>) => {
  if (response.yields) return response.yields;

  for (let index = 0; index < response.actions.length; index += 1) {
    const line = formatActionSequence(response.actions.slice(index));
    const cueId = cueIdByLine.get(line);
    if (cueId) return cueId;
  }

  return undefined;
};

export const deriveKfgDocument = (document: KfgDocument): KfgDocument => {
  const cueIdByLine = new Map(document.cues.map((cue) => [canonicalActionSequence(cue.line), cue.id]));

  return {
    ...document,
    cues: document.cues.map((cue) => {
      const line = canonicalActionSequence(cue.line);
      const actions = cue.actions.length > 0 ? cue.actions : parseActionSequence(line).actions;
      return {
        ...cue,
        line,
        actions,
        tags: cue.tags && cue.tags.length > 0 ? cue.tags : deriveActionTags(actions),
        responses: cue.responses.map((response) => {
        const actions = response.actions.length > 0 ? response.actions : parseActionSequence(response.line).actions;
        const derivedResponse = {
          ...response,
          line: canonicalActionSequence(response.line),
          actions,
          duration: response.duration ?? inferDuration(actions)
        };
        const yields = inferYield(derivedResponse, cueIdByLine);
        const phase = response.phase === 'defensa' && yields ? 'contra' : response.phase;
        return {
          ...derivedResponse,
          yields,
          phase,
          tags: response.tags && response.tags.length > 0
            ? response.tags
            : deriveActionTags(actions, [phase, yields === cue.id ? 'ciclo' : ''])
        };
      })
      };
    })
  };
};

const parseResponse = (value: unknown): ResponseOption => {
  const item = ensureRecord(value, 'response');
  const rawId = asString(item.id);
  const explicitLine = asString(item.line);
  const line = canonicalActionSequence(explicitLine || rawId);
  const id = explicitLine ? rawId || line : line;
  if (!id || !line) throw new Error('YAML invalido: cada response necesita id.');
  const label = stripTechniqueRefs(asString(item.label, id)) || id;
  const actions = parseActions(item.actions, line);

  return {
    id,
    label,
    line,
    actions,
    duration: asOptionalDuration(item.duration) ?? inferDuration(actions),
    phase: asPhase(item.phase),
    yields: asString(item.yields) || undefined,
    techniqueRefs: parseTechniqueRefs(item.techniqueRefs, line, asString(item.label)),
    tags: asStringArray(item.tags),
    notes: asString(item.notes) || undefined,
    source: parseSource(item.source)
  };
};

const parseCue = (value: unknown): Cue => {
  const item = ensureRecord(value, 'cue');
  const rawId = asString(item.id);
  const explicitLine = asString(item.cue ?? item.line);
  const line = canonicalActionSequence(explicitLine || rawId);
  const id = explicitLine ? rawId || line : line;
  if (!id || !line) throw new Error('YAML invalido: cada cue necesita id.');
  const label = stripTechniqueRefs(asString(item.label, id)) || id;

  return {
    id,
    label,
    line,
    actions: parseActions(item.actions, line),
    tags: asStringArray(item.tags),
    notes: asString(item.notes) || undefined,
    source: parseSource(item.source),
    responses: Array.isArray(item.responses) ? item.responses.map(parseResponse) : []
  };
};

const parsePathStep = (value: unknown): DrillPathStep => {
  if (typeof value === 'string') {
    const [cue, response] = value.split(':').map((part) => part.trim());
    if (!cue || !response) throw new Error(`YAML invalido: paso de drill mal formado: ${value}`);
    return { cue, response };
  }
  const item = ensureRecord(value, 'drill path step');
  const cue = asString(item.cue);
  const response = asString(item.response);
  if (!cue || !response) throw new Error('YAML invalido: cada paso de drill necesita cue y response.');
  return { cue, response };
};

const parseDrill = (value: unknown): Drill => {
  const item = ensureRecord(value, 'drill');
  const id = asString(item.id);
  const name = asString(item.name);
  const start = asString(item.start);
  if (!id || !name || !start) throw new Error('YAML invalido: cada drill necesita id, name y start.');

  return {
    id,
    name,
    start,
    starter: asActor(item.starter),
    path: Array.isArray(item.path) ? item.path.map(parsePathStep) : [],
    macro: asString(item.macro) || undefined,
    notes: asString(item.notes) || undefined,
    source: parseSource(item.source),
    tags: asStringArray(item.tags)
  };
};

const assertUnique = (ids: string[], label: string) => {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (seen.has(id)) throw new Error(`YAML invalido: id duplicado en ${label}: ${id}.`);
    seen.add(id);
  });
};

export const parseKfgYaml = (contents: string): KfgDocument => {
  const root = ensureRecord(yaml.load(contents), 'raiz');
  const graph = ensureRecord(root.graph, 'graph');
  const id = asString(graph.id);
  const title = asString(graph.title);
  if (!id || !title) throw new Error('YAML invalido: graph.id y graph.title son obligatorios.');

  const document: KfgDocument = deriveKfgDocument({
    version: 2,
    source: 'kungfu-response-tree',
    graph: {
      id,
      title,
      style: asString(graph.style, 'Kung Fu'),
      description: asString(graph.description) || undefined
    },
    cues: Array.isArray(root.cues) ? root.cues.map(parseCue) : [],
    drills: Array.isArray(root.drills) ? root.drills.map(parseDrill) : []
  });

  assertUnique(document.cues.map((cue) => cue.id), 'cues');
  assertUnique(document.drills.map((drill) => drill.id), 'drills');
  document.cues.forEach((cue) => assertUnique(cue.responses.map((response) => response.id), `responses de ${cue.id}`));

  const cueIds = new Set(document.cues.map((cue) => cue.id));
  document.cues.forEach((cue) => {
    cue.responses.forEach((response) => {
      if (response.yields && !cueIds.has(response.yields)) {
        throw new Error(`YAML invalido: ${cue.id}:${response.id} apunta a un cue inexistente: ${response.yields}.`);
      }
    });
  });
  document.drills.forEach((drill) => {
    if (!cueIds.has(drill.start)) throw new Error(`YAML invalido: ${drill.id} empieza en un cue inexistente.`);
    drill.path.forEach((step) => {
      const cue = document.cues.find((item) => item.id === step.cue);
      if (!cue) throw new Error(`YAML invalido: ${drill.id} usa cue inexistente ${step.cue}.`);
      if (!cue.responses.some((response) => response.id === step.response)) {
        throw new Error(`YAML invalido: ${drill.id} usa response inexistente ${step.cue}:${step.response}.`);
      }
    });
  });

  return document;
};

const cleanRecord = (record: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );

export const serializeKfgYaml = (document: KfgDocument) => {
  const derived = deriveKfgDocument(document);
  const cueIdMap = new Map(derived.cues.map((cue) => [cue.id, canonicalActionSequence(cue.line)]));
  const responseIdMap = new Map(
    derived.cues.flatMap((cue) =>
      cue.responses.map((response) => [`${cue.id}:${response.id}`, canonicalActionSequence(response.line)] as const)
    )
  );
  const labelWithRefs = (label: string, refs?: TechniqueRef[]) => {
    const existing = new Set(extractTechniqueRefs(label).map((ref) => `[[${ref}]]`));
    const suffix = (refs ?? []).map((ref) => ref.note).filter((note) => note && !existing.has(note));
    return [label, ...suffix].join(' ').trim();
  };

  const compactDocument = {
    version: 2,
    source: 'kungfu-response-tree',
    graph: cleanRecord({
      id: document.graph.id,
      title: document.graph.title,
      style: document.graph.style,
      description: document.graph.description
    }),
    cues: derived.cues.map((cue) =>
      cleanRecord({
        id: canonicalActionSequence(cue.line),
        label: cue.label,
        notes: cue.notes,
        responses: cue.responses.map((response) =>
          cleanRecord({
            id: canonicalActionSequence(response.line),
            label: labelWithRefs(response.label, response.techniqueRefs),
            duration: response.duration === inferDuration(response.actions) ? undefined : response.duration,
            phase: response.phase,
            notes: response.notes
          })
        )
      })
    ),
    drills: derived.drills.map((drill) =>
      cleanRecord({
        id: drill.id,
        name: drill.name,
        start: cueIdMap.get(drill.start) ?? drill.start,
        starter: drill.starter,
        path: drill.path.map((step) => {
          const cueId = cueIdMap.get(step.cue) ?? step.cue;
          const responseId = responseIdMap.get(`${step.cue}:${step.response}`) ?? step.response;
          return `${cueId}:${responseId}`;
        }),
        notes: drill.notes
      })
    )
  };

  return yaml.dump(compactDocument, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"'
  });
};
