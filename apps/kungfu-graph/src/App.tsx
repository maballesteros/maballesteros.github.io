import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import {
  Compass,
  FileText,
  FolderOpen,
  GitBranch,
  ListFilter,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X
} from 'lucide-react';

import { seedDocument } from '@/data/seed';
import { nextDrillId, responseKey } from '@/lib/graph';
import { deriveKfgDocument, inferDuration, parseKfgYaml, serializeKfgYaml } from '@/lib/kfgYaml';
import { canonicalActionSequence, parseActionSequence } from '@/lib/notationParser';
import {
  downloadTextFile,
  isTauriRuntime,
  openDefaultNativeKfgFile,
  openNativeKfgFile,
  readBrowserFile,
  saveNativeKfgFile,
  saveNativeKfgFileAs
} from '@/services/localFile';
import type { Action, Actor, Cue, Drill, DrillPathStep, Duration, KfgDocument, ResponseOption, ResponsePhase } from '@/types';

type Tab = 'explore' | 'drills' | 'yaml';
type FilterMode = 'all' | 'any';
type EditMode = 'create' | 'edit';
type DialogState =
  | { kind: 'cue'; mode: EditMode; id?: string }
  | { kind: 'response'; mode: EditMode; cueId: string; id?: string }
  | { kind: 'drill'; mode: EditMode; id?: string };
type ConfirmDialogState =
  | { kind: 'cue'; cueId: string; title: string; body: string }
  | { kind: 'response'; cueId: string; responseId: string; title: string; body: string }
  | { kind: 'drill'; drillId: string; title: string; body: string };
type StepPickerState =
  | { afterIndex: number; phase: 'cue' }
  | { afterIndex: number; phase: 'response'; cueId: string }
  | null;

type DrillFormState = {
  id: string;
  name: string;
  starter: Actor;
  path: DrillPathStep[];
  macro: string;
  tags: string;
};

type ProjectedStep = {
  index: number;
  cue: Cue;
  response: ResponseOption;
  initiator: Actor;
  responder: Actor;
  cueWasYielded: boolean;
  expectedCue: string;
  flipsInitiative: boolean;
  loops: boolean;
};

type VisualDrillRow = {
  row: ProjectedStep;
  mergedNextRow: ProjectedStep | null;
  number: number;
};

type StepPickerContext = {
  phase: 'cue' | 'response';
  cueActor: Actor;
  responseActor: Actor;
  decisionActor: Actor;
  cueId?: string;
};

const seedFileLabel = 'src/data/eagle-claw-punos-directos.kfg.yaml';
const displayFilePath = (path: string | null) => (path?.endsWith(seedFileLabel) ? seedFileLabel : path ?? seedFileLabel);
const initialCueId = seedDocument.cues.find((cue) => cue.id === 'punch[lead@cara]')?.id ?? seedDocument.cues[0]?.id ?? null;
const initialDrillId = seedDocument.drills.find((drill) => drill.id === 'D002')?.id ?? seedDocument.drills[0]?.id ?? null;
const pinnedActionOrder = ['punch', 'kao', 'tui', 'tiao', 'uppercut', 'ya_da', 'gua', 'pi_quan', 'block', 'agarre', 'molesta'];

const emptyCueForm = { id: '', label: '', line: '', tags: '' };
const emptyResponseForm = {
  id: '',
  label: '',
  line: '',
  duration: '0.5' as `${Duration}`,
  phase: 'defensa' as ResponsePhase,
  yields: '',
  tags: ''
};
const emptyDrillForm: DrillFormState = { id: '', name: '', starter: 'A', path: [], macro: '', tags: '' };

const otherActor = (actor: Actor): Actor => (actor === 'A' ? 'B' : 'A');
const compact = (value: string, max = 42) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);
const normalizeToken = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
const formatToken = (value: string) => value.replace(/_/g, ' ');
const splitTags = (value: string) => value.split(',').map(normalizeToken).filter(Boolean);
const tagsToText = (tags?: string[]) => tags?.join(', ') ?? '';

const actionVerbLabels: Record<string, string> = {
  agarre: 'agarre',
  block: 'bloqueo',
  gua: 'gua',
  kao: 'kao',
  molesta: 'molesta',
  pi_quan: 'pi quan',
  punch: 'puño',
  tiao: 'tiao',
  tui: 'tui',
  uppercut: 'uppercut',
  xia_chan_zhou: 'xia chan zhou',
  ya_da: 'ya da'
};

const toolLabels: Partial<Record<NonNullable<Action['tool']>, string>> = {
  any: 'libre',
  lead: 'adelantado',
  opposite: 'contrario',
  rear: 'trasero',
  same: 'mismo'
};

const formatActionTitle = (action: Action) => {
  const verb = actionVerbLabels[action.verb] ?? formatToken(action.verb);
  const tool = action.tool ? toolLabels[action.tool] ?? action.tool : '';
  const target = action.target ? formatToken(action.target) : '';

  if (action.verb === 'punch') {
    return ['puño', tool, target === 'cara' ? `a ${target}` : target].filter(Boolean).join(' ');
  }
  if (action.verb === 'kao') return [verb, target || tool].filter(Boolean).join(' ');
  if (action.verb === 'tui') return [verb, action.tool === 'rear' ? 'trasera' : action.tool === 'lead' ? 'delantera' : tool, target].filter(Boolean).join(' ');
  return [verb, tool, target].filter(Boolean).join(' ');
};

const actionChips = (action: Action) => [action.verb, action.tool, action.target].filter((item): item is string => Boolean(item));
const actionSignature = (action: Action) => `${action.verb}[${action.tool ?? ''}@${action.target ?? ''}]`;
const visualActionTokens = new Set(['punch', 'kao', 'tui', 'tiao', 'uppercut', 'ya_da', 'gua', 'block']);
const actionVisualKey = (action: Action, actor?: Actor) => {
  if (!actor) return null;
  const actorToken = actor.toLowerCase();
  const verb = normalizeToken(action.verb);
  const tool = action.tool ? normalizeToken(action.tool) : 'any';
  const target = action.target ? normalizeToken(action.target) : 'any';
  return `${actorToken}-${verb}-${tool}-${target}`;
};
const actionVisualClass = (action: Action) => {
  const token = normalizeToken(action.verb);
  return visualActionTokens.has(token) ? `action-${token}` : 'action-default';
};
const actionVisualStyle = (action: Action, actor?: Actor): CSSProperties | undefined => {
  const variantKey = actionVisualKey(action, actor);
  return variantKey ? ({ '--movement-visual-url': `url("../visuals/raster/variants/${variantKey}.png")` } as CSSProperties) : undefined;
};

const collectActionTokens = (actions: Action[]) => {
  const tokens = new Set<string>();
  actions.forEach((action) => {
    if (action.verb) tokens.add(normalizeToken(action.verb));
  });
  return tokens;
};

const tokenSetMatches = (tokens: ReadonlySet<string>, selectedTokens: string[], mode: FilterMode) => {
  if (selectedTokens.length === 0) return true;
  return mode === 'all'
    ? selectedTokens.every((token) => tokens.has(token))
    : selectedTokens.some((token) => tokens.has(token));
};

const cueActionTokens = (cue: Cue) => {
  const tokens = collectActionTokens(cue.actions);
  cue.responses.forEach((response) => collectActionTokens(response.actions).forEach((token) => tokens.add(token)));
  return tokens;
};

const drillActionTokens = (drill: Drill, cueById: Map<string, Cue>) => {
  const tokens = new Set<string>();
  drill.path.forEach((step) => {
    const cue = cueById.get(step.cue);
    cue?.actions.forEach((action) => tokens.add(normalizeToken(action.verb)));
    cue?.responses.find((response) => response.id === step.response)?.actions.forEach((action) => tokens.add(normalizeToken(action.verb)));
  });
  return tokens;
};

const getFilename = (document: KfgDocument) => `${document.graph.title}.kfg.yaml`.replace(/[/:|]/g, '-');

const drillPathToText = (path: DrillPathStep[]) => path.map((step) => `${step.cue}:${step.response}`).join('\n');

function ActionPills({ actions }: { actions: Action[] }) {
  if (actions.length === 0) return <span className="empty-inline">Sin acciones parseadas</span>;
  return (
    <div className="action-pills">
      {actions.map((action, index) => (
        <span key={`${actionSignature(action)}-${index}`} className="action-pill">
          <strong>{formatActionTitle(action)}</strong>
          <small>{actionChips(action).map(formatToken).join(' · ')}</small>
        </span>
      ))}
    </div>
  );
}

function ParserPreview({ value }: { value: string }) {
  const parsed = parseActionSequence(value);
  return (
    <div className="parser-preview">
      <div className="mini-metrics">
        <span><strong>{parsed.actions.length}</strong> acciones</span>
        <span><strong>{parsed.warnings.length}</strong> avisos</span>
      </div>
      <ActionPills actions={parsed.actions} />
      {parsed.warnings.length > 0 ? (
        <div className="warning-list">
          {parsed.warnings.map((warning) => <span key={warning}>{warning}</span>)}
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const [document, setDocument] = useState<KfgDocument>(seedDocument);
  const [yamlText, setYamlText] = useState(() => serializeKfgYaml(seedDocument));
  const [filePath, setFilePath] = useState<string | null>(null);
  const [, setStatus] = useState('Fichero semilla leído al iniciar.');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [yamlEdited, setYamlEdited] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('explore');
  const [selectedCueId, setSelectedCueId] = useState<string | null>(initialCueId);
  const [selectedResponseKey, setSelectedResponseKey] = useState<string | null>(null);
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(initialDrillId);
  const [actionFilters, setActionFilters] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [stepPicker, setStepPicker] = useState<StepPickerState>(null);
  const [cueForm, setCueForm] = useState(emptyCueForm);
  const [responseForm, setResponseForm] = useState(emptyResponseForm);
  const [drillForm, setDrillForm] = useState(emptyDrillForm);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cueById = useMemo(() => new Map(document.cues.map((cue) => [cue.id, cue])), [document.cues]);
  const responseByKey = useMemo(() => {
    const map = new Map<string, { cue: Cue; response: ResponseOption }>();
    document.cues.forEach((cue) => cue.responses.forEach((response) => map.set(responseKey(cue.id, response.id), { cue, response })));
    return map;
  }, [document.cues]);
  const selectedCue = (selectedCueId ? cueById.get(selectedCueId) : null) ?? document.cues[0] ?? null;
  const selectedResponse = selectedResponseKey ? responseByKey.get(selectedResponseKey) ?? null : null;
  const selectedDrill = (selectedDrillId ? document.drills.find((drill) => drill.id === selectedDrillId) : null) ?? document.drills[0] ?? null;

  const actionOptions = useMemo(() => {
    const counts = new Map<string, number>();
    document.cues.forEach((cue) => {
      cueActionTokens(cue).forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));
    });
    return [...counts.entries()]
      .map(([id, count]) => ({ id, label: formatToken(id), count }))
      .sort((left, right) => {
        const leftPinned = pinnedActionOrder.indexOf(left.id);
        const rightPinned = pinnedActionOrder.indexOf(right.id);
        if (leftPinned !== -1 || rightPinned !== -1) {
          if (leftPinned === -1) return 1;
          if (rightPinned === -1) return -1;
          return leftPinned - rightPinned;
        }
        return right.count - left.count || left.label.localeCompare(right.label, 'es', { sensitivity: 'base' });
      });
  }, [document.cues]);

  const hasActiveFilters = actionFilters.length > 0;
  const visibleCues = useMemo(
    () => document.cues.filter((cue) => tokenSetMatches(cueActionTokens(cue), actionFilters, filterMode)),
    [actionFilters, document.cues, filterMode]
  );
  const visibleDrills = useMemo(
    () => document.drills.filter((drill) => tokenSetMatches(drillActionTokens(drill, cueById), actionFilters, filterMode)),
    [actionFilters, cueById, document.drills, filterMode]
  );

  const projectedDrill = useMemo<ProjectedStep[]>(() => {
    if (!selectedDrill) return [];
    let cueActor = selectedDrill.starter;
    let pendingYield: { cueId: string; actor: Actor } | null = null;
    const seenCues = new Set<string>();

    return selectedDrill.path.flatMap((step, index) => {
      const cue = cueById.get(step.cue);
      const response = cue?.responses.find((item) => item.id === step.response);
      if (!cue || !response) return [];
      const cueWasYielded = pendingYield?.cueId === cue.id;
      if (cueWasYielded && pendingYield) cueActor = pendingYield.actor;
      const responder = otherActor(cueActor);
      const flipsInitiative = Boolean(response.yields);
      const loops = seenCues.has(cue.id) || Boolean(response.yields && seenCues.has(response.yields));
      seenCues.add(cue.id);

      const row: ProjectedStep = {
        index,
        cue,
        response,
        initiator: cueActor,
        responder,
        cueWasYielded,
        expectedCue: step.cue,
        flipsInitiative,
        loops
      };

      if (response.yields) {
        pendingYield = { cueId: response.yields, actor: responder };
        cueActor = responder;
      } else {
        pendingYield = null;
      }
      return [row];
    });
  }, [cueById, selectedDrill]);

  const visualDrillRows = useMemo<VisualDrillRow[]>(() => {
    const rows: VisualDrillRow[] = [];

    projectedDrill.forEach((row, projectedIndex) => {
      const previousRow = projectedIndex > 0 ? projectedDrill[projectedIndex - 1] : null;
      const mergedIntoPrevious = row.cueWasYielded && row.responder === 'B' && previousRow?.responder === 'A';
      if (mergedIntoPrevious) return;

      const nextRow = projectedDrill[projectedIndex + 1] ?? null;
      const mergedNextRow = row.responder === 'A' && nextRow?.cueWasYielded && nextRow.responder === 'B' ? nextRow : null;
      rows.push({
        row,
        mergedNextRow,
        number: rows.length + 1
      });
    });

    return rows;
  }, [projectedDrill]);

  const commitDocument = (nextDocument: KfgDocument, message: string, dirty = true) => {
    const derivedDocument = deriveKfgDocument(nextDocument);
    setDocument(derivedDocument);
    setYamlText(serializeKfgYaml(derivedDocument));
    setYamlEdited(false);
    setHasUnsavedChanges(dirty);
    setStatus(message);
    if (!derivedDocument.cues.some((cue) => cue.id === selectedCueId)) setSelectedCueId(derivedDocument.cues[0]?.id ?? null);
    if (!derivedDocument.drills.some((drill) => drill.id === selectedDrillId)) setSelectedDrillId(derivedDocument.drills[0]?.id ?? null);
  };

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let cancelled = false;
    const loadDefaultNativeFile = async () => {
      try {
        const payload = await openDefaultNativeKfgFile();
        if (!payload || cancelled) return;
        const parsed = parseKfgYaml(payload.contents);
        const derivedDocument = deriveKfgDocument(parsed);
        setFilePath(payload.path);
        setDocument(derivedDocument);
        setYamlText(serializeKfgYaml(derivedDocument));
        setYamlEdited(false);
        setHasUnsavedChanges(false);
        setSelectedCueId(derivedDocument.cues.find((cue) => cue.id === initialCueId)?.id ?? derivedDocument.cues[0]?.id ?? null);
        setSelectedDrillId(derivedDocument.drills.find((drill) => drill.id === initialDrillId)?.id ?? derivedDocument.drills[0]?.id ?? null);
        setStatus(`Fichero local leído: ${displayFilePath(payload.path)}.`);
      } catch (error) {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : 'No se pudo leer el fichero local por defecto.');
        }
      }
    };

    void loadDefaultNativeFile();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleActionFilter = (token: string) => {
    setActionFilters((current) => (current.includes(token) ? current.filter((item) => item !== token) : [...current, token]));
  };

  const selectCue = (cueId: string) => {
    setSelectedCueId(cueId);
    setSelectedResponseKey(null);
  };

  const selectResponse = (cueId: string, responseId: string) => {
    setSelectedCueId(cueId);
    setSelectedResponseKey(responseKey(cueId, responseId));
  };

  const handleOpen = async () => {
    try {
      if (isTauriRuntime()) {
        const payload = await openNativeKfgFile();
        if (!payload) return;
        const parsed = parseKfgYaml(payload.contents);
        setFilePath(payload.path);
        setSelectedCueId(parsed.cues[0]?.id ?? null);
        setSelectedDrillId(parsed.drills[0]?.id ?? null);
        commitDocument(parsed, `Abierto ${payload.path}.`, false);
        return;
      }
      fileInputRef.current?.click();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo abrir el fichero.');
    }
  };

  const handleBrowserFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const payload = await readBrowserFile(file);
      const parsed = parseKfgYaml(payload.contents);
      setFilePath(payload.path);
      setSelectedCueId(parsed.cues[0]?.id ?? null);
      setSelectedDrillId(parsed.drills[0]?.id ?? null);
      commitDocument(parsed, `Abierto ${payload.path}.`, false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo cargar el YAML.');
    }
  };

  const handleSave = async () => {
    if (yamlEdited) {
      setStatus('Aplica el YAML antes de guardar.');
      return;
    }
    try {
      if (isTauriRuntime()) {
        const path = filePath
          ? await saveNativeKfgFile(filePath, yamlText)
          : await saveNativeKfgFileAs(yamlText, getFilename(document));
        if (path) {
          setFilePath(path);
          setHasUnsavedChanges(false);
          setStatus(`Guardado ${path}.`);
        }
        return;
      }
      downloadTextFile(getFilename(document), yamlText);
      setHasUnsavedChanges(false);
      setStatus('YAML descargado.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo guardar.');
    }
  };

  const applyYaml = () => {
    try {
      const parsed = parseKfgYaml(yamlText);
      setDocument(parsed);
      setYamlEdited(false);
      setHasUnsavedChanges(true);
      setSelectedCueId(parsed.cues[0]?.id ?? null);
      setSelectedDrillId(parsed.drills[0]?.id ?? null);
      setStatus('YAML aplicado a la vista.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'YAML invalido.');
    }
  };

  const openCueDialog = (mode: DialogState['mode'], cueId?: string) => {
    const cue = cueId ? cueById.get(cueId) : null;
    setCueForm(
      cue
        ? { id: cue.id, label: cue.label, line: cue.line, tags: tagsToText(cue.tags) }
        : { ...emptyCueForm, id: '' }
    );
    setDialog({ kind: 'cue', mode, id: cueId });
  };

  const openResponseDialog = (mode: DialogState['mode'], cueId: string, responseId?: string) => {
    const cue = cueById.get(cueId);
    const response = responseId ? cue?.responses.find((item) => item.id === responseId) : null;
    setResponseForm(
      response
        ? {
            id: response.id,
            label: response.label,
            line: response.line,
            duration: String(response.duration) as `${Duration}`,
            phase: response.phase,
            yields: response.yields ?? '',
            tags: tagsToText(response.tags)
          }
        : { ...emptyResponseForm, id: '' }
    );
    setDialog({ kind: 'response', mode, cueId, id: responseId });
  };

  const openDrillDialog = (mode: DialogState['mode'], drillId?: string) => {
    const drill = drillId ? document.drills.find((item) => item.id === drillId) : null;
    setDrillForm(
      drill
        ? {
            id: drill.id,
            name: drill.name,
            starter: drill.starter,
            path: drill.path,
            macro: drill.macro ?? '',
            tags: tagsToText(drill.tags)
          }
        : { ...emptyDrillForm, id: nextDrillId(document.drills), path: [] }
    );
    setStepPicker(null);
    setDialog({ kind: 'drill', mode, id: drillId });
  };

  const updateSelectedDrillPath = (path: DrillPathStep[], message: string) => {
    if (!selectedDrill) return;
    const start = path[0]?.cue ?? selectedDrill.start;
    const nextDrill = { ...selectedDrill, start, path };
    commitDocument(
      {
        ...document,
        drills: document.drills.map((drill) => (drill.id === selectedDrill.id ? nextDrill : drill))
      },
      message
    );
    setSelectedDrillId(selectedDrill.id);
  };

  const getStepPickerContext = (afterIndex: number, activePicker: StepPickerState = stepPicker): StepPickerContext | null => {
    if (!selectedDrill) return null;
    const previousRow = afterIndex >= 0 ? projectedDrill.find((row) => row.index === afterIndex) ?? null : null;

    if (!previousRow) {
      const cueActor = selectedDrill.starter;
      if (activePicker?.afterIndex === afterIndex && activePicker.phase === 'response') {
        const responseActor = otherActor(cueActor);
        return { phase: 'response', cueActor, responseActor, decisionActor: responseActor, cueId: activePicker.cueId };
      }
      return { phase: 'cue', cueActor, responseActor: otherActor(cueActor), decisionActor: cueActor };
    }

    if (previousRow.response.yields) {
      const cueActor = previousRow.responder;
      const responseActor = previousRow.initiator;
      return {
        phase: 'response',
        cueActor,
        responseActor,
        decisionActor: responseActor,
        cueId: previousRow.response.yields
      };
    }

    const cueActor = previousRow.initiator;
    if (activePicker?.afterIndex === afterIndex && activePicker.phase === 'response') {
      const responseActor = otherActor(cueActor);
      return { phase: 'response', cueActor, responseActor, decisionActor: responseActor, cueId: activePicker.cueId };
    }

    return { phase: 'cue', cueActor, responseActor: otherActor(cueActor), decisionActor: cueActor };
  };

  const openStepPicker = (afterIndex: number) => {
    if (!selectedDrill) return;
    const context = getStepPickerContext(afterIndex, null);
    if (!context) return;
    setStepPicker(
      context.phase === 'response' && context.cueId
        ? { afterIndex, phase: 'response', cueId: context.cueId }
        : { afterIndex, phase: 'cue' }
    );
  };

  const insertSelectedDrillStep = (responseId: string) => {
    if (!selectedDrill || !stepPicker) return;
    if (stepPicker.phase !== 'response') return;
    const cue = cueById.get(stepPicker.cueId);
    const response = cue?.responses.find((item) => item.id === responseId);
    if (!cue || !response) return;
    const path = [...selectedDrill.path];
    path.splice(stepPicker.afterIndex + 1, 0, { cue: cue.id, response: response.id });
    updateSelectedDrillPath(path, `Paso añadido a ${selectedDrill.id}.`);
    setStepPicker(null);
  };

  const removeSelectedDrillCue = (row: ProjectedStep) => {
    if (!selectedDrill) return;
    updateSelectedDrillPath(
      selectedDrill.path.filter((_step, stepIndex) => stepIndex !== row.index),
      `Estimulo ${row.index + 1} eliminado de ${selectedDrill.id}.`
    );
    setStepPicker({ afterIndex: row.index - 1, phase: 'cue' });
  };

  const removeSelectedDrillResponse = (row: ProjectedStep) => {
    if (!selectedDrill) return;
    updateSelectedDrillPath(
      selectedDrill.path.filter((_step, stepIndex) => stepIndex !== row.index),
      `Respuesta ${row.index + 1} eliminada de ${selectedDrill.id}.`
    );
    setStepPicker({ afterIndex: row.index - 1, phase: 'response', cueId: row.cue.id });
  };

  const saveCue = (event: FormEvent) => {
    event.preventDefault();
    if (!dialog || dialog.kind !== 'cue' || !cueForm.id.trim()) return;
    const cueId = canonicalActionSequence(cueForm.id);
    if (dialog.mode === 'create' && document.cues.some((cue) => cue.id === cueId)) {
      setStatus(`Ya existe un estimulo con id ${cueId}.`);
      return;
    }
    const actions = parseActionSequence(cueId).actions;
    const cue: Cue = {
      ...(dialog.id ? cueById.get(dialog.id) : undefined),
      id: cueId,
      label: cueForm.label.trim() || cueId,
      line: cueId,
      actions,
      tags: [],
      responses: dialog.id ? cueById.get(dialog.id)?.responses ?? [] : []
    };
    const nextCues = dialog.mode === 'edit'
      ? document.cues.map((item) => (item.id === dialog.id ? cue : item))
      : [...document.cues, cue];
    commitDocument({ ...document, cues: nextCues }, dialog.mode === 'edit' ? `Estimulo ${cue.id} actualizado.` : `Estimulo ${cue.id} creado.`);
    setSelectedCueId(cue.id);
    setDialog(null);
  };

  const saveResponse = (event: FormEvent) => {
    event.preventDefault();
    if (!dialog || dialog.kind !== 'response' || !responseForm.id.trim()) return;
    const cue = cueById.get(dialog.cueId);
    const responseId = canonicalActionSequence(responseForm.id);
    if (!cue) return;
    if (dialog.mode === 'create' && cue.responses.some((response) => response.id === responseId)) {
      setStatus(`Ya existe una respuesta ${dialog.cueId}:${responseId}.`);
      return;
    }
    const actions = parseActionSequence(responseId).actions;
    const response: ResponseOption = {
      id: responseId,
      label: responseForm.label.trim() || responseId,
      line: responseId,
      actions,
      duration: inferDuration(actions),
      phase: responseForm.phase,
      tags: []
    };
    const nextCues = document.cues.map((cue) => {
      if (cue.id !== dialog.cueId) return cue;
      const responses = dialog.mode === 'edit'
        ? cue.responses.map((item) => (item.id === dialog.id ? response : item))
        : [...cue.responses, response];
      return { ...cue, responses };
    });
    commitDocument({ ...document, cues: nextCues }, dialog.mode === 'edit' ? `Respuesta ${response.id} actualizada.` : `Respuesta ${response.id} creada.`);
    selectResponse(dialog.cueId, response.id);
    setDialog(null);
  };

  const saveDrill = (event: FormEvent) => {
    event.preventDefault();
    if (!dialog || dialog.kind !== 'drill' || !drillForm.id.trim() || !drillForm.name.trim()) return;
    const drillId = drillForm.id.trim();
    if (dialog.mode === 'create' && document.drills.some((drill) => drill.id === drillId)) {
      setStatus(`Ya existe un drill con id ${drillId}.`);
      return;
    }
    const path = drillForm.path;
    try {
      path.forEach((step) => {
        const cue = cueById.get(step.cue);
        if (!cue) throw new Error(`El paso usa un estimulo inexistente: ${step.cue}.`);
        if (!cue.responses.some((response) => response.id === step.response)) {
          throw new Error(`El paso usa una respuesta inexistente: ${step.cue}:${step.response}.`);
        }
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo leer la ruta del drill.');
      return;
    }
    const start = path[0]?.cue ?? selectedCue?.id ?? document.cues[0]?.id ?? '';
    if (!start) {
      setStatus('No hay estimulos para crear el drill.');
      return;
    }
    const drill: Drill = {
      id: drillId,
      name: drillForm.name.trim(),
      start,
      starter: drillForm.starter,
      path,
      macro: drillForm.macro.trim() || undefined,
      tags: splitTags(drillForm.tags)
    };
    const nextDrills = dialog.mode === 'edit'
      ? document.drills.map((item) => (item.id === dialog.id ? drill : item))
      : [...document.drills, drill];
    commitDocument({ ...document, drills: nextDrills }, dialog.mode === 'edit' ? `Drill ${drill.id} actualizado.` : `Drill ${drill.id} creado.`);
    setSelectedDrillId(drill.id);
    setStepPicker(dialog.mode === 'create' ? { afterIndex: -1, phase: 'cue' } : null);
    setDialog(null);
  };

  const deleteCue = (cueId: string) => {
    setConfirmDialog({
      kind: 'cue',
      cueId,
      title: 'Eliminar estímulo',
      body: `Se eliminará ${cueId}. También se quitarán de los drills los pasos que usen este estímulo.`
    });
  };

  const deleteResponse = (cueId: string, responseId: string) => {
    setConfirmDialog({
      kind: 'response',
      cueId,
      responseId,
      title: 'Eliminar respuesta',
      body: `Se eliminará ${cueId}:${responseId}. También se quitará de los drills.`
    });
  };

  const deleteDrill = (drillId: string) => {
    setConfirmDialog({
      kind: 'drill',
      drillId,
      title: 'Eliminar drill',
      body: `Se eliminará el drill ${drillId}.`
    });
  };

  const confirmDelete = () => {
    if (!confirmDialog) return;

    if (confirmDialog.kind === 'cue') {
      const { cueId } = confirmDialog;
      setConfirmDialog(null);
      setStepPicker(null);
      if (selectedResponseKey?.startsWith(`${cueId}:`)) setSelectedResponseKey(null);

      const nextCues = document.cues.filter((cue) => cue.id !== cueId);
      const nextDrills = document.drills.map((drill) => ({
        ...drill,
        path: drill.path.filter((step) => step.cue !== cueId),
        start: drill.start === cueId ? nextCues[0]?.id ?? '' : drill.start
      }));
      commitDocument({ ...document, cues: nextCues, drills: nextDrills }, `Estímulo ${cueId} eliminado.`);
      return;
    }

    if (confirmDialog.kind === 'response') {
      const { cueId, responseId } = confirmDialog;
      setConfirmDialog(null);
      setStepPicker(null);
      if (selectedResponseKey === responseKey(cueId, responseId)) setSelectedResponseKey(null);

      const nextCues = document.cues.map((cue) =>
        cue.id === cueId ? { ...cue, responses: cue.responses.filter((response) => response.id !== responseId) } : cue
      );
      const nextDrills = document.drills.map((drill) => ({
        ...drill,
        path: drill.path.filter((step) => step.cue !== cueId || step.response !== responseId)
      }));
      commitDocument({ ...document, cues: nextCues, drills: nextDrills }, `Respuesta ${cueId}:${responseId} eliminada.`);
      return;
    }

    const { drillId } = confirmDialog;
    setConfirmDialog(null);
    setStepPicker(null);
    const nextDrills = document.drills.filter((drill) => drill.id !== drillId);
    commitDocument({ ...document, drills: nextDrills }, `Drill ${drillId} eliminado.`);
  };

  const renderMovementStack = (actions: Action[], label: string, actor?: Actor) => (
    <div className={`movement-stack ${actor ? `actor-${actor.toLowerCase()}` : 'actor-neutral'}`}>
      <span className="movement-kicker">{actor ? `${actor} · ` : ''}{label}</span>
      {actions.map((action, index) => (
        <span
          key={`${actionSignature(action)}-${index}`}
          className={`${index === 0 ? 'movement-card' : 'movement-card linked'} ${actionVisualClass(action)}`}
        >
          {actor ? <span className="movement-actor-badge">{actor}</span> : null}
          <span className="movement-visual" aria-hidden="true" style={actionVisualStyle(action, actor)} />
          <span className="movement-copy">
            <strong>{formatActionTitle(action)}</strong>
            <span className="movement-meta">
              {actionChips(action).map((chip) => <small key={chip}>{formatToken(chip)}</small>)}
            </span>
          </span>
        </span>
      ))}
    </div>
  );

  const renderCueTurn = (row: ProjectedStep) => (
    <div className="turn-card cue-turn">
      <button type="button" className="turn-main" onClick={() => selectCue(row.cue.id)}>
        {renderMovementStack(row.cue.actions, 'estímulo', row.initiator)}
      </button>
      <button type="button" className="turn-remove" onClick={() => removeSelectedDrillCue(row)} aria-label="Quitar estímulo">
        <Trash2 size={14} />
      </button>
    </div>
  );

  const renderResponseTurn = (row: ProjectedStep) => {
    const yieldedCue = row.response.yields ? cueById.get(row.response.yields) : null;
    return (
      <div className="turn-card response-turn">
        <button type="button" className="turn-main" onClick={() => selectResponse(row.cue.id, row.response.id)}>
          {row.cueWasYielded ? (
            <span className="context-strip">
              Responde al estímulo generado: <b>{row.cue.label}</b>
            </span>
          ) : null}
          {renderMovementStack(row.response.actions, 'respuesta', row.responder)}
          {yieldedCue ? (
            <span className="yield-row">
              <RotateCcw size={15} /> genera estímulo: <b>{yieldedCue.label}</b>
            </span>
          ) : null}
        </button>
        <button type="button" className="turn-remove" onClick={() => removeSelectedDrillResponse(row)} aria-label="Quitar respuesta">
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  const renderStepPicker = (afterIndex: number) => {
    if (!selectedDrill || stepPicker?.afterIndex !== afterIndex) return null;
    const context = getStepPickerContext(afterIndex);
    if (!context) return null;
    const availableCues = document.cues.filter((item) => item.responses.length > 0);
    const cue = stepPicker.phase === 'response' ? cueById.get(stepPicker.cueId) : null;
    const compatibleResponses = cue?.responses ?? [];

    return (
      <div className="step-picker">
        <div className="step-picker-head">
          <div>
            <p className="eyebrow">
              {stepPicker.phase === 'cue' ? `${context.decisionActor} elige estímulo` : `${context.decisionActor} elige respuesta`}
            </p>
            <strong>{stepPicker.phase === 'cue' ? 'Selecciona una entrada' : cue?.label}</strong>
          </div>
          <button type="button" className="icon-button" onClick={() => setStepPicker(null)} aria-label="Cerrar selector">
            <X size={16} />
          </button>
        </div>

        {stepPicker.phase === 'cue' ? (
          <div className="cue-option-list">
            {availableCues.map((item) => (
              <button
                key={item.id}
                type="button"
                className="cue-option-button"
                onClick={() => setStepPicker({ afterIndex, phase: 'response', cueId: item.id })}
              >
                {renderMovementStack(item.actions, 'estímulo', context.decisionActor)}
                <span>{item.responses.length} respuestas disponibles</span>
              </button>
            ))}
          </div>
        ) : null}

        {stepPicker.phase === 'response' && cue ? (
          <div className="response-option-list">
            {compatibleResponses.map((response) => (
              <button
                key={response.id}
                type="button"
                className="response-option-button"
                onClick={() => insertSelectedDrillStep(response.id)}
              >
                <span className="response-title">
                  <strong>{response.label}</strong>
                  <small>{context.decisionActor} responde · {response.duration} tiempo</small>
                </span>
                {renderMovementStack(response.actions, 'respuesta', context.decisionActor)}
                {response.yields ? (
                  <span className="yield-row">
                    <RotateCcw size={15} /> genera estímulo: <b>{cueById.get(response.yields)?.label ?? response.yields}</b>
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const buildInsertCells = (afterIndex: number) => {
    const context = getStepPickerContext(afterIndex);
    if (!context) return null;
    const isActive = stepPicker?.afterIndex === afterIndex;
    const cueForResponse = context.phase === 'response' && context.cueId ? cueById.get(context.cueId) ?? null : null;
    const label = context.phase === 'cue'
      ? afterIndex < 0
        ? `Primer estímulo de ${context.decisionActor}`
        : `Estímulo de ${context.decisionActor}`
      : `Respuesta de ${context.decisionActor}`;

    const addCard = (
      <button type="button" className="turn-add-card" onClick={() => openStepPicker(afterIndex)}>
        <Plus size={18} />
        <span>
          {context.phase === 'response' && cueForResponse ? (
            <>Respuesta de {context.decisionActor} a <strong>{cueForResponse.label}</strong></>
          ) : (
            label
          )}
        </span>
      </button>
    );

    const activePicker = isActive ? renderStepPicker(afterIndex) : null;
    const contentForA = isActive
      ? context.decisionActor === 'A'
        ? activePicker
        : null
      : context.decisionActor === 'A'
        ? addCard
        : null;
    const contentForB = isActive
      ? context.decisionActor === 'B'
        ? activePicker
        : null
      : context.decisionActor === 'B'
        ? addCard
        : null;

    return { contentForA, contentForB, context };
  };

  const renderInsertSlot = (afterIndex: number, visualNumber: number) => {
    const cells = buildInsertCells(afterIndex);
    if (!cells) return null;

    return (
      <article className="exchange-row draft-row">
        <span className="score-index">{String(visualNumber).padStart(2, '0')}</span>
        <div className="exchange-cell">{cells.contentForA}</div>
        <div className="exchange-cell">{cells.contentForB}</div>
      </article>
    );
  };

  const tabItems = [
    { id: 'explore' as const, label: 'Explorar', Icon: Compass },
    { id: 'drills' as const, label: 'Drills', Icon: GitBranch },
    { id: 'yaml' as const, label: 'YAML', Icon: FileText }
  ];

  return (
    <main className="app-shell">
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml,.kfg.yaml"
        hidden
        onChange={(event) => void handleBrowserFile(event.currentTarget.files?.[0])}
      />

      <header className="topbar">
        <div>
          <p className="eyebrow">KungFu Response Tree</p>
          <h1>Eagle Claw</h1>
        </div>
        <div className="topbar-actions">
          <span>{document.cues.length} estímulos</span>
          <span>{document.cues.reduce((total, cue) => total + cue.responses.length, 0)} respuestas</span>
          <span>{document.drills.length} drills</span>
          <button type="button" className="icon-button" onClick={handleOpen} aria-label="Abrir YAML" title="Abrir YAML">
            <FolderOpen size={16} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => void handleSave()}
            disabled={!hasUnsavedChanges || yamlEdited}
            aria-label="Guardar YAML"
            title={yamlEdited ? 'Aplica el YAML antes de guardar' : hasUnsavedChanges ? 'Guardar YAML' : 'Sin cambios pendientes'}
          >
            <Save size={16} />
          </button>
        </div>
      </header>

      <section className="action-filter-strip">
        <div className="filter-heading">
          <ListFilter size={17} />
          <div>
            <p className="eyebrow">Actions</p>
            <span>{visibleCues.length} estímulos · {visibleDrills.length} drills</span>
          </div>
        </div>
        <div className="filter-mode" aria-label="Modo de filtro">
          <button type="button" className={filterMode === 'all' ? 'active' : ''} onClick={() => setFilterMode('all')}>Todos</button>
          <button type="button" className={filterMode === 'any' ? 'active' : ''} onClick={() => setFilterMode('any')}>Alguno</button>
        </div>
        <div className="filter-chip-list">
          {actionOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={actionFilters.includes(option.id) ? 'filter-chip active' : 'filter-chip'}
              onClick={() => toggleActionFilter(option.id)}
              aria-pressed={actionFilters.includes(option.id)}
            >
              <span>{option.label}</span>
              <small>{option.count}</small>
            </button>
          ))}
          {hasActiveFilters ? <button type="button" className="text-button" onClick={() => setActionFilters([])}>Limpiar</button> : null}
        </div>
      </section>

      <div className="app-body">
        <aside className="left-sidebar">
          <nav className="tabs" aria-label="Vistas">
            {tabItems.map(({ id, label, Icon }) => (
              <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
                <Icon size={20} /> {label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">v0.2.0 · local-first</div>
        </aside>

        {activeTab === 'explore' ? (
          <section className="workspace response-layout">
            <aside className="cue-list panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Estímulos</p>
                  <h2>{hasActiveFilters ? `${visibleCues.length}/${document.cues.length}` : document.cues.length}</h2>
                </div>
                <button type="button" className="ghost-button compact-action" onClick={() => openCueDialog('create')}>
                  <Plus size={16} /> Nuevo
                </button>
              </div>
              <div className="scroll-list">
                {visibleCues.map((cue) => (
                  <button key={cue.id} type="button" className={cue.id === selectedCue?.id ? 'list-row active' : 'list-row'} onClick={() => selectCue(cue.id)}>
                    <span
                      className={`action-thumb ${cue.actions[0] ? actionVisualClass(cue.actions[0]) : 'action-default'}`}
                      aria-hidden="true"
                      style={cue.actions[0] ? actionVisualStyle(cue.actions[0], 'A') : undefined}
                    />
                    <span className="list-row-copy">
                      <strong>{cue.label}</strong>
                      <span>{cue.responses.length} respuestas</span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="cue-workspace panel">
              {selectedCue ? (
                <>
                  <div className="cue-hero">
                    <div>
                      <p className="eyebrow">Si un lado lanza</p>
                      <h2>{selectedCue.label}</h2>
                      <code>{selectedCue.line}</code>
                    </div>
                    <div className="hero-actions">
                      <button type="button" className="ghost-button compact-action" onClick={() => openCueDialog('edit', selectedCue.id)}>
                        <Pencil size={16} /> Editar
                      </button>
                      <button type="button" className="danger-button compact-action" onClick={() => deleteCue(selectedCue.id)}>
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="cue-stimulus">
                    {renderMovementStack(selectedCue.actions, 'estímulo', 'A')}
                  </div>

                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">El otro lado puede responder</p>
                      <h2>{selectedCue.responses.length}</h2>
                    </div>
                    <button type="button" className="primary-button compact-action" onClick={() => openResponseDialog('create', selectedCue.id)}>
                      <Plus size={16} /> Respuesta
                    </button>
                  </div>

                  <div className="response-grid">
                    {selectedCue.responses.map((response) => {
                      const active = selectedResponse?.cue.id === selectedCue.id && selectedResponse.response.id === response.id;
                      const yieldedCue = response.yields ? cueById.get(response.yields) : null;
                      return (
                        <article key={response.id} className={active ? 'response-card active' : 'response-card'}>
                          <button type="button" className="response-main" onClick={() => selectResponse(selectedCue.id, response.id)}>
                            <span className="response-title">
                              <strong>{response.label}</strong>
                              <small>{response.duration} tiempo</small>
                            </span>
                            {renderMovementStack(response.actions, 'respuesta', 'B')}
                            {yieldedCue ? (
                              <span className="yield-row">
                                <RotateCcw size={15} /> genera nuevo estímulo: <b>{yieldedCue.label}</b>
                              </span>
                            ) : null}
                          </button>
                          <div className="card-actions">
                            <button type="button" className="icon-button" aria-label={`Editar ${response.id}`} onClick={() => openResponseDialog('edit', selectedCue.id, response.id)}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="icon-button danger" aria-label={`Eliminar ${response.id}`} onClick={() => deleteResponse(selectedCue.id, response.id)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state">No hay estímulos para el filtro activo.</div>
              )}
            </section>
          </section>
        ) : null}

        {activeTab === 'drills' ? (
          <section className="workspace drill-layout">
            <aside className="drill-list panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Drills</p>
                  <h2>{hasActiveFilters ? `${visibleDrills.length}/${document.drills.length}` : document.drills.length}</h2>
                </div>
                <button type="button" className="ghost-button compact-action" onClick={() => openDrillDialog('create')}>
                  <Plus size={16} /> Nuevo
                </button>
              </div>
              <div className="scroll-list">
                {visibleDrills.map((drill) => (
                  <button
                    key={drill.id}
                    type="button"
                    className={drill.id === selectedDrill?.id ? 'list-row drill-row active' : 'list-row drill-row'}
                    onClick={() => {
                      setSelectedDrillId(drill.id);
                      setStepPicker(null);
                    }}
                  >
                    <span className="list-row-copy">
                      <strong>{drill.id} · {drill.name}</strong>
                      <span>{drill.path.length} pasos</span>
                      {drill.tags?.length ? (
                        <span className="tag-row">
                          {drill.tags.slice(0, 5).map((tag) => <small key={tag}>{formatToken(tag)}</small>)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="drill-board panel">
              {selectedDrill ? (
                <>
                  <div className="cue-hero">
                    <div>
                      <p className="eyebrow">Drill proyectado</p>
                      <h2>{selectedDrill.name}</h2>
                      <code>{selectedDrill.macro ?? drillPathToText(selectedDrill.path)}</code>
                    </div>
                    <div className="hero-actions">
                      <button type="button" className="ghost-button compact-action" onClick={() => openDrillDialog('edit', selectedDrill.id)}>
                        <Pencil size={16} /> Editar
                      </button>
                      <button type="button" className="danger-button compact-action" onClick={() => deleteDrill(selectedDrill.id)}>
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="drill-score">
                    <div className="score-head">
                      <span />
                      <strong>A</strong>
                      <strong>B</strong>
                    </div>
                    {selectedDrill.path.length === 0 ? (
                      renderInsertSlot(-1, 1)
                    ) : null}
                    {visualDrillRows.map(({ row, mergedNextRow, number }, visualIndex) => {
                      const lastStepInVisualRow = mergedNextRow ?? row;
                      const isLastVisibleRow = visualIndex === visualDrillRows.length - 1;
                      const candidateInlineDraft = isLastVisibleRow ? buildInsertCells(lastStepInVisualRow.index) : null;
                      const inlineDraft = candidateInlineDraft?.context.decisionActor === 'B' ? candidateInlineDraft : null;
                      const needsSeparateDraft = isLastVisibleRow && !inlineDraft?.contentForA && !inlineDraft?.contentForB;

                      return (
                      <div key={`${row.cue.id}-${row.response.id}-${row.index}`} className="score-step">
                        <article className={row.cueWasYielded ? 'exchange-row yielded-context' : 'exchange-row'}>
                          <span className="score-index">{String(number).padStart(2, '0')}</span>
                          <div className="exchange-cell">
                            {!row.cueWasYielded && row.initiator === 'A' ? renderCueTurn(row) : null}
                            {row.responder === 'A' ? renderResponseTurn(row) : null}
                            {mergedNextRow?.responder === 'A' ? renderResponseTurn(mergedNextRow) : null}
                            {inlineDraft?.contentForA}
                          </div>
                          <div className="exchange-cell">
                            {!row.cueWasYielded && row.initiator === 'B' ? renderCueTurn(row) : null}
                            {row.responder === 'B' ? renderResponseTurn(row) : null}
                            {mergedNextRow?.responder === 'B' ? renderResponseTurn(mergedNextRow) : null}
                            {inlineDraft?.contentForB}
                          </div>
                          <div className="score-meta">
                            <span>{row.cueWasYielded ? `responde a ${row.cue.id}` : `${row.cue.id}:${row.response.id}`}</span>
                            <span>{row.response.duration} tiempo</span>
                            {row.response.yields ? <span><RotateCcw size={13} /> pasa a {row.response.yields}</span> : <span>termina</span>}
                            {row.loops ? <span className="loop">ciclo</span> : null}
                            {mergedNextRow ? <span>{mergedNextRow.response.duration} tiempo</span> : null}
                            {mergedNextRow?.response.yields ? <span><RotateCcw size={13} /> pasa a {mergedNextRow.response.yields}</span> : null}
                            {mergedNextRow?.loops ? <span className="loop">ciclo</span> : null}
                          </div>
                        </article>
                        {needsSeparateDraft || (stepPicker?.afterIndex === lastStepInVisualRow.index && !inlineDraft?.contentForA && !inlineDraft?.contentForB)
                          ? renderInsertSlot(lastStepInVisualRow.index, number + 1)
                          : null}
                      </div>
                    );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state">No hay drills para el filtro activo.</div>
              )}
            </section>
          </section>
        ) : null}

        {activeTab === 'yaml' ? (
          <section className="workspace yaml-layout panel">
            <div className="yaml-toolbar">
              <button type="button" className="ghost-button compact-action" onClick={applyYaml}>Aplicar YAML</button>
            </div>
            <textarea
              value={yamlText}
              onChange={(event) => {
                setYamlText(event.target.value);
                setYamlEdited(true);
              }}
              spellCheck={false}
            />
          </section>
        ) : null}
      </div>

      {dialog ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDialog(null)}>
          <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">{dialog.mode === 'edit' ? 'Editar' : 'Crear'}</p>
                <h2>{dialog.kind === 'cue' ? 'Estímulo' : dialog.kind === 'response' ? 'Respuesta' : 'Drill'}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setDialog(null)} aria-label="Cerrar"><X size={18} /></button>
            </div>

            {dialog.kind === 'cue' ? (
              <form className="modal-form" onSubmit={saveCue}>
                <input value={cueForm.id} onChange={(event) => setCueForm({ ...cueForm, id: event.target.value })} placeholder="punch[lead@cara]" disabled={dialog.mode === 'edit'} />
                <input value={cueForm.label} onChange={(event) => setCueForm({ ...cueForm, label: event.target.value })} placeholder="Etiqueta" autoFocus />
                <ParserPreview value={cueForm.id} />
                <button type="submit" className="primary-button">{dialog.mode === 'edit' ? 'Guardar estímulo' : 'Crear estímulo'}</button>
              </form>
            ) : null}

            {dialog.kind === 'response' ? (
              <form className="modal-form" onSubmit={saveResponse}>
                <input value={responseForm.id} onChange={(event) => setResponseForm({ ...responseForm, id: event.target.value })} placeholder="tui[rear] + punch[lead@cara]" disabled={dialog.mode === 'edit'} />
                <input value={responseForm.label} onChange={(event) => setResponseForm({ ...responseForm, label: event.target.value })} placeholder="Etiqueta" autoFocus />
                <ParserPreview value={responseForm.id} />
                <button type="submit" className="primary-button">{dialog.mode === 'edit' ? 'Guardar respuesta' : 'Crear respuesta'}</button>
              </form>
            ) : null}

            {dialog.kind === 'drill' ? (
              <form className="modal-form" onSubmit={saveDrill}>
                <input value={drillForm.id} onChange={(event) => setDrillForm({ ...drillForm, id: event.target.value })} placeholder="id" disabled={dialog.mode === 'edit'} />
                <input value={drillForm.name} onChange={(event) => setDrillForm({ ...drillForm, name: event.target.value })} placeholder="Nombre" autoFocus />
                <div className="inline-fields">
                  <select value={drillForm.starter} onChange={(event) => setDrillForm({ ...drillForm, starter: event.target.value as Actor })}>
                    <option value="A">A inicia</option>
                    <option value="B">B inicia</option>
                  </select>
                  <input value={drillForm.tags} onChange={(event) => setDrillForm({ ...drillForm, tags: event.target.value })} placeholder="tags separadas por coma" />
                </div>
                <input value={drillForm.macro} onChange={(event) => setDrillForm({ ...drillForm, macro: event.target.value })} placeholder="macro legible opcional" />
                <button type="submit" className="primary-button">{dialog.mode === 'edit' ? 'Guardar drill' : 'Crear drill'}</button>
              </form>
            ) : null}
          </section>
        </div>
      ) : null}

      {confirmDialog ? (
        <div className="modal-backdrop confirm-backdrop" role="presentation" onMouseDown={() => setConfirmDialog(null)}>
          <section
            className="modal confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">Confirmar</p>
                <h2 id="confirm-title">{confirmDialog.title}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setConfirmDialog(null)} aria-label="Cerrar"><X size={18} /></button>
            </div>
            <p className="confirm-body">{confirmDialog.body}</p>
            <div className="confirm-actions">
              <button type="button" className="ghost-button compact-action" onClick={() => setConfirmDialog(null)}>Cancelar</button>
              <button type="button" className="danger-button compact-action" onClick={confirmDelete}>Eliminar</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
