export type Actor = 'A' | 'B';
export type SideToken = 'lead' | 'rear' | 'same' | 'opposite' | 'any';
export type Duration = 0.5 | 1 | 1.5 | 2;
export type ResponsePhase = 'defensa' | 'contra' | 'continuacion' | 'captura' | 'recontra' | 'reset';

export interface Action {
  verb: string;
  tool?: SideToken;
  target?: string;
  raw?: string;
}

export interface TechniqueRef {
  note: string;
  role?: 'canonical' | 'similar' | 'application' | 'drill';
}

export interface SourceRef {
  note: string;
  line?: number;
  macro?: string;
}

export interface ResponseOption {
  id: string;
  label: string;
  line: string;
  actions: Action[];
  duration: Duration;
  phase: ResponsePhase;
  yields?: string;
  techniqueRefs?: TechniqueRef[];
  tags?: string[];
  notes?: string;
  source?: SourceRef;
}

export interface Cue {
  id: string;
  label: string;
  line: string;
  actions: Action[];
  tags?: string[];
  notes?: string;
  source?: SourceRef;
  responses: ResponseOption[];
}

export interface DrillPathStep {
  cue: string;
  response: string;
}

export interface Drill {
  id: string;
  name: string;
  start: string;
  starter: Actor;
  path: DrillPathStep[];
  macro?: string;
  notes?: string;
  source?: SourceRef;
  tags?: string[];
}

export interface KfgInfo {
  id: string;
  title: string;
  style: string;
  description?: string;
}

export interface KfgDocument {
  version: 2;
  source: 'kungfu-response-tree';
  graph: KfgInfo;
  cues: Cue[];
  drills: Drill[];
}

export interface ParsedAction {
  actor: Actor;
  verb: string;
  tool?: SideToken;
  target?: string;
  raw: string;
}

export interface ParsedExchange {
  raw: string;
  left: ParsedAction[];
  right: ParsedAction[];
}

export interface ParsedNotation {
  source: string;
  exchanges: ParsedExchange[];
  techniqueRefs: string[];
  warnings: string[];
}

export interface NativeFilePayload {
  path: string;
  contents: string;
}
