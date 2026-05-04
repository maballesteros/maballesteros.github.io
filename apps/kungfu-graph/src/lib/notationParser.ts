import type { Action, Actor, ParsedAction, ParsedExchange, ParsedNotation, SideToken } from '@/types';

const ACTOR_PATTERN = /^(A|B)\s*:\s*/i;
const WIKILINK_PATTERN = /\[\[([^\]]+)]]/g;
const SIDE_VALUES = new Set<SideToken>(['lead', 'rear', 'same', 'opposite', 'any']);

const normalizeActor = (value: string): Actor => (value.toUpperCase() === 'B' ? 'B' : 'A');

const normalizeVerb = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

export const extractTechniqueRefs = (source: string) =>
  [...source.matchAll(WIKILINK_PATTERN)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));

export const stripTechniqueRefs = (source: string) => source.replace(WIKILINK_PATTERN, '').trim();

const parseSideAndTarget = (value: string): { tool?: SideToken; target?: string; warnings: string[] } => {
  const warnings: string[] = [];
  const trimmed = value.trim();
  if (!trimmed) return { warnings };

  const [sideRaw, targetRaw] = trimmed.split('@');
  const side = sideRaw.trim();
  const target = targetRaw?.trim();

  if (!side && target) return { target, warnings };
  if (SIDE_VALUES.has(side as SideToken)) return { tool: side as SideToken, target, warnings };

  warnings.push(`Lado no reconocido: "${side}".`);
  return { target, warnings };
};

const parseAction = (source: string, fallbackActor: Actor): { action: ParsedAction | null; warnings: string[] } => {
  const warnings: string[] = [];
  let raw = source.trim();
  if (!raw) return { action: null, warnings };

  let actor = fallbackActor;
  const actorMatch = raw.match(ACTOR_PATTERN);
  if (actorMatch) {
    actor = normalizeActor(actorMatch[1]);
    raw = raw.slice(actorMatch[0].length).trim();
  }

  let bracket = '';
  raw = raw.replace(/\[([^\]]+)]/, (_match, content: string) => {
    bracket = content;
    return '';
  });

  let outsideTarget = '';
  raw = raw.replace(/@([^\s/+)]+)/, (_match, content: string) => {
    outsideTarget = content;
    return '';
  });

  const verb = normalizeVerb(raw);
  if (!verb) {
    warnings.push(`Acción sin verbo: "${source}".`);
    return { action: null, warnings };
  }

  const bracketParsed = parseSideAndTarget(bracket);
  warnings.push(...bracketParsed.warnings);

  return {
    action: {
      actor,
      verb,
      tool: bracketParsed.tool,
      target: bracketParsed.target ?? (outsideTarget.trim() || undefined),
      raw: source.trim()
    },
    warnings
  };
};

const parseActionGroup = (source: string, fallbackActor: Actor) => {
  const warnings: string[] = [];
  const actions = source
    .split('+')
    .map((part) => parseAction(part, fallbackActor))
    .flatMap((result) => {
      warnings.push(...result.warnings);
      return result.action ? [result.action] : [];
    });

  return { actions, warnings };
};

export const parseActionSequence = (source: string): { actions: Action[]; warnings: string[] } => {
  const parsed = parseActionGroup(source, 'A');
  return {
    actions: parsed.actions.map((action) => ({
      verb: action.verb,
      tool: action.tool,
      target: action.target,
      raw: action.raw
    })),
    warnings: parsed.warnings
  };
};

export const formatActionSequence = (actions: Action[]) =>
  actions
    .map((action) => {
      const side = action.tool ? `[${action.tool}${action.target ? `@${action.target}` : ''}]` : action.target ? `[@${action.target}]` : '';
      return `${action.verb}${side}`;
    })
    .join(' + ');

export const canonicalActionSequence = (source: string) => {
  const trimmed = stripTechniqueRefs(source).trim();
  if (!trimmed) return '';
  const parsed = parseActionSequence(trimmed);
  return parsed.actions.length > 0 ? formatActionSequence(parsed.actions) : trimmed;
};

const parseExchange = (source: string): { exchange: ParsedExchange | null; warnings: string[] } => {
  const warnings: string[] = [];
  const raw = source.trim();
  if (!raw) return { exchange: null, warnings };

  const [leftRaw, ...rightParts] = raw.split('->');
  if (rightParts.length === 0) {
    const left = parseActionGroup(leftRaw, 'A');
    warnings.push(...left.warnings, `Intercambio sin "->": "${raw}".`);
    return {
      exchange: {
        raw,
        left: left.actions,
        right: []
      },
      warnings
    };
  }

  const rightRaw = rightParts.join('->');
  const left = parseActionGroup(leftRaw, 'A');
  const right = parseActionGroup(rightRaw, 'B');
  warnings.push(...left.warnings, ...right.warnings);

  return {
    exchange: {
      raw,
      left: left.actions,
      right: right.actions
    },
    warnings
  };
};

export const parseNotation = (source: string): ParsedNotation => {
  const warnings: string[] = [];
  const techniqueRefs = extractTechniqueRefs(source);
  const body = stripTechniqueRefs(source);
  const exchanges = body
    .split('/')
    .map(parseExchange)
    .flatMap((result) => {
      warnings.push(...result.warnings);
      return result.exchange ? [result.exchange] : [];
    });

  if (exchanges.length === 0 && source.trim()) {
    warnings.push('No se detectaron intercambios.');
  }

  return {
    source,
    exchanges,
    techniqueRefs,
    warnings
  };
};

export const formatParsedAction = (action: ParsedAction) => {
  const side = action.tool ? `[${action.tool}${action.target ? `@${action.target}` : ''}]` : action.target ? `[@${action.target}]` : '';
  return `${action.actor}:${action.verb}${side}`;
};
