import type { Cue, Drill, DrillPathStep, KfgDocument, ResponseOption } from '@/types';

export const getCueById = (document: KfgDocument) => new Map(document.cues.map((cue) => [cue.id, cue]));

export const responseKey = (cueId: string, responseId: string) => `${cueId}:${responseId}`;

export const findResponse = (document: KfgDocument, step: DrillPathStep): { cue: Cue; response: ResponseOption } | null => {
  const cue = document.cues.find((item) => item.id === step.cue);
  const response = cue?.responses.find((item) => item.id === step.response);
  return cue && response ? { cue, response } : null;
};

export const nextCueId = (cues: Cue[]) => {
  const max = cues.reduce((current, cue) => {
    const match = cue.id.match(/^cue_(\d+)$/i);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `cue_${String(max + 1).padStart(3, '0')}`;
};

export const nextResponseId = (responses: ResponseOption[]) => {
  const max = responses.reduce((current, response) => {
    const match = response.id.match(/^r(\d+)$/i);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `r${String(max + 1).padStart(2, '0')}`;
};

export const nextDrillId = (drills: Drill[]) => {
  const max = drills.reduce((current, drill) => {
    const match = drill.id.match(/^D(\d+)$/i);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `D${String(max + 1).padStart(3, '0')}`;
};
