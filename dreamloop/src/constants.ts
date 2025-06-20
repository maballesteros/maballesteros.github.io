
import type { World, Question } from './types';

export const WORLDS: World[] = [
  { id: 'fantasy_urban', name: 'Fantasía urbana' },
  { id: 'space_opera_punk', name: 'Space-opera punk' },
  { id: 'mystery_historical', name: 'Misterio histórico' },
  { id: 'high_school_secrets', name: 'Instituto: Pasillos y Secretos' },
  { id: 'digital_maze', name: 'Laberinto Digital (Redes y Realidad)' },
  { id: 'finding_my_voice', name: 'Encontrando Mi Voz (Desafíos Personales)' },
  { id: 'custom', name: 'Crea tu propio mundo...', isCustom: true },
];

export const GEMINI_TEXT_MODEL = 'gemini-2.5-pro';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

/*
// Static onboarding questions are being replaced by AI-generated questions.
// This data is kept here for reference or potential fallback.
export const ONBOARDING_QUESTIONS_DATA: Question[] = [
  {
    id: 'q1',
    text: 'Un antiguo mapa cae en manos del héroe. ¿Qué es lo primero que hace?',
    answers: [
      { text: 'Reúne a sus amigos más leales para descifrarlo juntos.', value: 'q1a1_collaboration' },
      { text: 'Analiza cada símbolo y referencia histórica antes de dar un paso.', value: 'q1a2_strategy' },
      { text: '¡Se lanza a la aventura de inmediato, el peligro es su segundo nombre!', value: 'q1a3_action' },
    ],
  },
  {
    id: 'q2',
    text: 'En su camino, el héroe encuentra a alguien en apuros, pero ayudarle podría desviarle de su misión principal. ¿Qué hace?',
    answers: [
      { text: 'Ayuda sin dudarlo. Ninguna misión es más importante que una vida.', value: 'q2a1_compassion' },
      { text: 'Busca una forma rápida de ayudar que no comprometa demasiado su objetivo.', value: 'q2a2_pragmatism' },
      { text: 'Evalúa si puede delegar la ayuda o si su misión es demasiado crítica para detenerse.', value: 'q2a3_focus' },
    ],
  },
  {
    id: 'q3',
    text: 'Elige el lema que mejor representaría al héroe:',
    answers: [
      { text: 'Saber es poder.', value: 'q3a1_knowledge', descriptor: 'la búsqueda del conocimiento' },
      { text: 'La unión hace la fuerza.', value: 'q3a2_unity', descriptor: 'la fuerza de la unidad' },
      { text: 'Vive cada día como si fuera el último.', value: 'q3a3_vivir', descriptor: 'la intensidad de vivir el momento' },
    ],
  },
];
*/