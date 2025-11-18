import { useEffect, useMemo, useRef, useState } from 'react';
import party from 'party-js';
import gruposData from './data/grupos.json';
import { PDFExamGenerator } from './components/PDFExamGenerator';

type LocalizedText = {
  en: string;
  es: string;
};

type Palabra = {
  en: string;
  es: string;
};

type Tema = {
  id: string;
  nombre: LocalizedText;
  palabras: Palabra[];
};

type GrupoTematico = {
  id: string;
  tipo: 'vocabulario' | 'frases';
  nombre: LocalizedText;
  descripcion: LocalizedText;
  nivel: {
    orden: number;
    titulo: LocalizedText;
    descripcion: LocalizedText;
    clases: {
      fondo: string;
      borde: string;
      titulo: string;
      insignia: string;
    };
  };
  temas: Tema[];
};

type Fase = 'inicio' | 'modo' | 'aprender' | 'practicar' | 'examenPrep' | 'examen' | 'resultado';

type Language = 'en' | 'es';

type Copy = {
  homeTitle: string;
  homeIntro: string;
  vocabRouteTitle: string;
  vocabRouteDescription: string;
  phrasesRouteTitle: string;
  phrasesRouteDescription: string;
  wordsLabel: string;
  sentencesLabel: string;
  modeIntro: string;
  personalBest: string;
  learnButton: string;
  practiceButton: string;
  backButton: string;
  nextButton: string;
  mainMenuButton: string;
  translatePrompt: string;
  pointsLabel: string;
  pointsWord: string;
  recordLabel: string;
  learnModeComplete: string;
  repeatTopicButton: string;
  backToHomeButton: string;
  youScored: string;
  outOf: string;
  newRecordSuffix: string;
  resultTitle: string;
  groupProgressLabel: string;
  groupProgressSuffix: string;
  practiceGoalHint: string;
  practiceGoalLabel: string;
  listCompletedLabel: string;
  listIncompleteLabel: string;
  practiceCompletedTag: string;
  practicePendingTag: string;
  examButtonLabel: string;
  startExamButton: string;
  examIntro: string;
  examLockedMessage: string;
  blockLockedMessage: string;
  examBest: string;
  examPassMessage: string;
  examFailMessage: string;
  examNeededScore: string;
  questionsLabel: string;
  examLockedTag: string;
  examUnlockedTag: string;
};

const LANGUAGE_STORAGE_KEY = 'vocabulario-language';

const translations: Record<Language, Copy> = {
  en: {
    homeTitle: '📚 Learn Spanish',
    homeIntro: 'Practice essential Spanish vocabulary starting from English. Pick a topic to begin.',
    vocabRouteTitle: 'Vocabulary quest',
    vocabRouteDescription: 'Explore themed word packs and level up your everyday Spanish.',
    phrasesRouteTitle: 'Conversation quest',
    phrasesRouteDescription: 'Unlock ready-to-use phrases for real-life situations.',
    wordsLabel: 'Words',
    sentencesLabel: 'Phrases',
    modeIntro: 'Choose your study mode:',
    personalBest: '🏆 Personal best',
    learnButton: 'Learn',
    practiceButton: 'Practice',
    backButton: 'Back',
    nextButton: 'Next ➡️',
    mainMenuButton: 'Main menu',
    translatePrompt: 'Translate:',
    pointsLabel: 'Points',
    pointsWord: 'points',
    recordLabel: '🏆 Record',
    learnModeComplete: 'You have unlocked every card in Learn mode.',
    repeatTopicButton: 'Repeat topic',
    backToHomeButton: 'Back to home',
    youScored: 'You scored',
    outOf: 'out of',
    newRecordSuffix: ' · New record!',
    resultTitle: '🎉 Final result!',
    groupProgressLabel: 'Block progress',
    groupProgressSuffix: 'lists completed',
    practiceGoalHint: 'Reach at least 70% correct answers in Practice mode to complete the list.',
    practiceGoalLabel: 'Goal (70%)',
    listCompletedLabel: '✅ List completed (70% reached).',
    listIncompleteLabel: 'You need {count} more correct answers to reach 70%.',
    practiceCompletedTag: 'Completed',
    practicePendingTag: '70% needed',
    examButtonLabel: '📝 Final exam',
    startExamButton: 'Start exam',
    examIntro: '30-question challenge covering this block.',
    examLockedMessage: 'Complete every list with 70% or more to unlock the final exam.',
    blockLockedMessage: 'Pass the previous level exam to unlock this block.',
    examBest: 'Best exam score',
    examPassMessage: 'You passed the final exam for this block!',
    examFailMessage: 'Keep practicing and try again.',
    examNeededScore: 'You need at least {count} points to pass.',
    questionsLabel: 'Questions',
    examLockedTag: 'Locked',
    examUnlockedTag: 'Ready'
  },
  es: {
    homeTitle: '📚 Aprende Español',
    homeIntro: 'Practica vocabulario esencial desde el inglés y sigue tu progreso.',
    vocabRouteTitle: 'Ruta de vocabulario',
    vocabRouteDescription: 'Explora paquetes temáticos de palabras y sube de nivel en tu día a día.',
    phrasesRouteTitle: 'Ruta de frases',
    phrasesRouteDescription: 'Desbloquea frases listas para usar en situaciones reales.',
    wordsLabel: 'Palabras',
    sentencesLabel: 'Frases',
    modeIntro: 'Selecciona tu modo de estudio:',
    personalBest: '🏆 Récord personal',
    learnButton: 'Aprender',
    practiceButton: 'Practicar',
    backButton: 'Volver',
    nextButton: 'Siguiente ➡️',
    mainMenuButton: 'Menú principal',
    translatePrompt: 'Traduce:',
    pointsLabel: 'Puntos',
    pointsWord: 'puntos',
    recordLabel: '🏆 Récord',
    learnModeComplete: 'Has desbloqueado todas las tarjetas del modo Aprender.',
    repeatTopicButton: 'Repetir tema',
    backToHomeButton: 'Volver al inicio',
    youScored: 'Has conseguido',
    outOf: 'de',
    newRecordSuffix: ' · ¡Nuevo récord!',
    resultTitle: '🎉 ¡Resultado final!',
    groupProgressLabel: 'Progreso del bloque',
    groupProgressSuffix: 'listas conseguidas',
    practiceGoalHint: 'Logra al menos un 70% de aciertos en el modo Práctica para completar la lista.',
    practiceGoalLabel: 'Objetivo (70%)',
    listCompletedLabel: '✅ Lista conseguida (70% superado).',
    listIncompleteLabel: 'Necesitas {count} aciertos más para alcanzar el 70%.',
    practiceCompletedTag: 'Conseguida',
    practicePendingTag: 'Falta 70%',
    examButtonLabel: '📝 Examen final',
    startExamButton: 'Comenzar examen',
    examIntro: 'Reto de 30 preguntas sobre todo el bloque.',
    examLockedMessage: 'Completa todas las listas con un 70% o más para desbloquear el examen final.',
    blockLockedMessage: 'Supera el examen del nivel anterior para desbloquear este bloque.',
    examBest: 'Mejor resultado',
    examPassMessage: '¡Has superado el examen final de este bloque!',
    examFailMessage: 'Sigue practicando y vuelve a intentarlo.',
    examNeededScore: 'Necesitas al menos {count} puntos para aprobar.',
    questionsLabel: 'Preguntas',
    examLockedTag: 'Bloqueado',
    examUnlockedTag: 'Listo'
  }
};

const HIGH_SCORES_STORAGE_KEY = 'vocabulario-high-scores';

const gruposTematicos = gruposData as GrupoTematico[];

const PRACTICE_PASS_RATE = 0.7;
const EXAM_PASS_RATE = 0.7;
const EXAM_QUESTION_COUNT = 30;
const EXAM_SCORES_STORAGE_KEY = 'vocabulario-exam-scores';

const getPracticeThreshold = (tema: Tema) => Math.ceil(tema.palabras.length * PRACTICE_PASS_RATE);

const isTemaCompleted = (tema: Tema, scores: Record<string, number>) => {
  const record = scores[tema.id] ?? 0;
  return record >= getPracticeThreshold(tema);
};

const computeGroupProgress = (grupo: GrupoTematico, scores: Record<string, number>) => {
  const total = grupo.temas.length;
  if (total === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }
  const completed = grupo.temas.filter((tema) => isTemaCompleted(tema, scores)).length;
  const percent = Math.round((completed / total) * 100);
  return { completed, total, percent };
};

const gatherGroupWords = (grupo: GrupoTematico): Palabra[] =>
  grupo.temas.flatMap((tema) => tema.palabras);

const getExamThreshold = (totalQuestions: number) => Math.ceil(totalQuestions * EXAM_PASS_RATE);

const buildExamDeck = (grupo: GrupoTematico): Palabra[] => {
  const allWords = gatherGroupWords(grupo);
  if (allWords.length === 0) {
    return [];
  }

  const deck: Palabra[] = [];
  let pool = [...allWords];

  while (deck.length < EXAM_QUESTION_COUNT) {
    if (pool.length === 0) {
      pool = [...allWords];
    }
    const index = Math.floor(Math.random() * pool.length);
    deck.push(pool.splice(index, 1)[0]);
  }

  return deck;
};


const ProgressBar = ({
  current,
  total,
  accentClass = 'bg-blue-500',
  labelClass = 'text-slate-700'
}: {
  current: number;
  total: number;
  accentClass?: string;
  labelClass?: string;
}) => {
  const percent = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full">
      <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-white/50">
        <div className={`h-3 rounded-full transition-all duration-300 ${accentClass}`} style={{ width: `${percent}%` }} />
      </div>
      <p className={`text-center text-sm font-medium ${labelClass}`}>{percent}% completado</p>
    </div>
  );
};

const BlockProgressBar = ({
  percent,
  label,
  accentClass = 'bg-blue-500',
  labelClass = 'text-slate-700'
}: {
  percent: number;
  label: string;
  accentClass?: string;
  labelClass?: string;
}) => {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/40">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${accentClass}`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
      <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${labelClass}`}>{label}</p>
    </div>
  );
};

const App = () => {
  const [fase, setFase] = useState<Fase>('inicio');
  const [temaActual, setTemaActual] = useState<Tema | null>(null);
  const [grupoActual, setGrupoActual] = useState<GrupoTematico | null>(null);
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [modo, setModo] = useState<'aprender' | 'practicar' | 'examen' | null>(null);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'es' || stored === 'en' ? (stored as Language) : 'en';
  });
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const almacenado = window.localStorage.getItem(HIGH_SCORES_STORAGE_KEY);
      return almacenado ? (JSON.parse(almacenado) as Record<string, number>) : {};
    } catch (error) {
      console.error('No se pudo leer el high score desde localStorage', error);
      return {};
    }
  });
  const [examScores, setExamScores] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const almacenado = window.localStorage.getItem(EXAM_SCORES_STORAGE_KEY);
      return almacenado ? (JSON.parse(almacenado) as Record<string, number>) : {};
    } catch (error) {
      console.error('No se pudo leer el examen desde localStorage', error);
      return {};
    }
  });
  const confettiTargetRef = useRef<HTMLDivElement | null>(null);
  const recordInicioRef = useRef(0);
  const hasCelebratedRecordRef = useRef(false);
  const [showExamModal, setShowExamModal] = useState(false);

  const gruposVocabulario = useMemo(
    () =>
      gruposTematicos
        .filter((grupo) => grupo.tipo === 'vocabulario')
        .sort((a, b) => a.nivel.orden - b.nivel.orden),
    []
  );

  const gruposFrases = useMemo(
    () =>
      gruposTematicos
        .filter((grupo) => grupo.tipo === 'frases')
        .sort((a, b) => a.nivel.orden - b.nivel.orden),
    []
  );

  const palabra = temaActual?.palabras[indice];
  const recordActualTema = temaActual && modo !== 'examen' ? highScores[temaActual.id] ?? 0 : 0;
  const recordActualExamen = grupoActual ? examScores[grupoActual.id] ?? 0 : 0;
  const esPracticar = modo === 'practicar';
  const esExamen = modo === 'examen';
  const esNuevoRecord = fase === 'resultado' && (esPracticar || esExamen) && puntos > recordInicioRef.current;
  const practicaUmbral = temaActual && modo !== 'examen' ? getPracticeThreshold(temaActual) : 0;
  const practicaSesionSuperada = esPracticar && temaActual ? puntos >= getPracticeThreshold(temaActual) : false;
  const examPassMark = getExamThreshold(EXAM_QUESTION_COUNT);
  const temaActualThreshold = temaActual && !esExamen ? getPracticeThreshold(temaActual) : 0;
  const temaActualCompletada = temaActual && !esExamen ? isTemaCompleted(temaActual, highScores) : false;
  const progresoGrupoActual = grupoActual ? computeGroupProgress(grupoActual, highScores) : null;
  const examenAprobadoActual = recordActualExamen >= examPassMark;
  const t = translations[language];
  const theme = useMemo(() => {
    const defaultTheme = {
      panelOuter: 'bg-white',
      panelInner: 'bg-white',
      heading: 'text-blue-800',
      badge: 'bg-blue-600 text-white shadow',
      primaryButton:
        'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      secondaryButton:
        'border border-blue-300 text-blue-600 bg-white hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      accentBar: 'bg-blue-500'
    };
    if (!grupoActual) return defaultTheme;
    const { clases } = grupoActual.nivel;
    const badgeBgClass =
      clases.insignia
        .split(' ')
        .find((cls) => cls.startsWith('bg-')) ?? 'bg-blue-500';
    return {
      panelOuter: `bg-gradient-to-br ${clases.fondo} ${clases.borde}`,
      panelInner: 'bg-white/90 border border-white/40 backdrop-blur',
      heading: clases.titulo,
      badge: `${clases.insignia} shadow`,
      primaryButton: `${clases.insignia} shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white`,
      secondaryButton: `border ${clases.borde} ${clases.titulo} bg-white/85 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white`,
      accentBar: badgeBgClass
    };
  }, [grupoActual]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(HIGH_SCORES_STORAGE_KEY, JSON.stringify(highScores));
  }, [highScores]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(EXAM_SCORES_STORAGE_KEY, JSON.stringify(examScores));
  }, [examScores]);

  useEffect(() => {
    if (fase !== 'resultado' || !temaActual || modo !== 'practicar') return;

    setHighScores((prev) => {
      const registroActual = prev[temaActual.id] ?? 0;
      if (puntos > registroActual) {
        return { ...prev, [temaActual.id]: puntos };
      }
      return prev;
    });
  }, [fase, modo, puntos, temaActual]);

  useEffect(() => {
    if (fase !== 'resultado' || modo !== 'examen' || !grupoActual) return;

    setExamScores((prev) => {
      const registroActual = prev[grupoActual.id] ?? 0;
      if (puntos > registroActual) {
        return { ...prev, [grupoActual.id]: puntos };
      }
      return prev;
    });
  }, [fase, modo, puntos, grupoActual]);

  const totalPreguntasExamen = esExamen && temaActual ? temaActual.palabras.length : EXAM_QUESTION_COUNT;
  const examenUmbral = esExamen ? getExamThreshold(totalPreguntasExamen) : 0;
  const examenSuperado = esExamen && puntos >= examenUmbral;

  useEffect(() => {
    const shouldCelebrate =
      fase === 'resultado' && ((esPracticar && esNuevoRecord) || (esExamen && examenSuperado));

    if (shouldCelebrate) {
      if (!hasCelebratedRecordRef.current) {
        hasCelebratedRecordRef.current = true;
        const target = confettiTargetRef.current ?? document.body;
        party.confetti(target, {
          count: party.variation.range(220, 280),
          spread: 95,
          size: party.variation.range(1, 1.5),
          speed: party.variation.range(700, 1000)
        });
        party.sparkles(target, {
          count: party.variation.range(45, 65),
          size: 1.6,
          lifetime: party.variation.range(1.2, 1.8)
        });
      }
    } else if (fase !== 'resultado') {
      hasCelebratedRecordRef.current = false;
    }
  }, [esNuevoRecord, esPracticar, esExamen, examenSuperado, fase]);

  const seleccionarTema = (tema: Tema, grupo: GrupoTematico) => {
    setTemaActual(tema);
    setGrupoActual(grupo);
    setIndice(0);
    setPuntos(0);
    setModo(null);
    setRespuestaSeleccionada(null);
    setBloqueado(false);
    setFase('modo');
  };

  const iniciarModo = (nuevoModo: 'aprender' | 'practicar') => {
    if (nuevoModo === 'practicar' && temaActual) {
      recordInicioRef.current = highScores[temaActual.id] ?? 0;
    }
    hasCelebratedRecordRef.current = false;
    setModo(nuevoModo);
    setIndice(0);
    setPuntos(0);
    setRespuestaSeleccionada(null);
    setBloqueado(false);
    setFase(nuevoModo);
  };

  const prepararExamen = (grupo: GrupoTematico) => {
    setGrupoActual(grupo);
    setTemaActual(null);
    setIndice(0);
    setPuntos(0);
    setModo(null);
    setRespuestaSeleccionada(null);
    setBloqueado(false);
    setFase('examenPrep');
  };

  const iniciarExamen = () => {
    if (!grupoActual) return;

    const preguntas = buildExamDeck(grupoActual);
    if (preguntas.length === 0) return;

    recordInicioRef.current = examScores[grupoActual.id] ?? 0;
    hasCelebratedRecordRef.current = false;

    const examTema: Tema = {
      id: `${grupoActual.id}-exam`,
      nombre: {
        es: `${grupoActual.nombre.es} · Examen final`,
        en: `${grupoActual.nombre.en} · Final exam`
      },
      palabras: preguntas
    };

    setTemaActual(examTema);
    setModo('examen');
    setIndice(0);
    setPuntos(0);
    setRespuestaSeleccionada(null);
    setBloqueado(false);
    setFase('examen');
  };

  const siguiente = () => {
    if (!temaActual) return;

    if (indice + 1 < temaActual.palabras.length) {
      setIndice((prev) => prev + 1);
      setRespuestaSeleccionada(null);
      setBloqueado(false);
    } else {
      setFase('resultado');
      setBloqueado(false);
      setRespuestaSeleccionada(null);
    }
  };

  const buildOptions = (correcta: Palabra, lista: Palabra[]) => {
    const opciones = lista.filter((pal) => pal.es !== correcta.es);
    const aleatorias = opciones.sort(() => Math.random() - 0.5).slice(0, 3);
    aleatorias.push(correcta);
    return aleatorias.sort(() => Math.random() - 0.5);
  };

  const opciones = useMemo(() => {
    if (!temaActual) return [];
    const actual = temaActual.palabras[indice];
    if (!actual) return [];
    const listaOpciones = esExamen && grupoActual ? gatherGroupWords(grupoActual) : temaActual.palabras;
    return buildOptions(actual, listaOpciones);
  }, [temaActual, indice, esExamen, grupoActual]);

  const responder = (respuesta: string) => {
    if (!palabra || bloqueado) return;

    setRespuestaSeleccionada(respuesta);
    setBloqueado(true);

    if (respuesta === palabra.es) {
      setPuntos((prev) => prev + 1);
      const target = confettiTargetRef.current ?? document.body;
      party.confetti(target, {
        count: party.variation.range(120, 180),
        spread: 75,
        size: party.variation.range(0.9, 1.3),
        speed: party.variation.range(600, 900)
      });
    }

    window.setTimeout(() => {
      siguiente();
    }, 1200);
  };

  const reiniciar = () => {
    setFase('inicio');
    setTemaActual(null);
    setGrupoActual(null);
    setIndice(0);
    setPuntos(0);
    setModo(null);
    setRespuestaSeleccionada(null);
    setBloqueado(false);
    recordInicioRef.current = 0;
    hasCelebratedRecordRef.current = false;
  };

  const getOptionClasses = (opcion: string) => {
    const defaultOption = grupoActual
      ? `border ${grupoActual.nivel.clases.borde} ${grupoActual.nivel.clases.titulo} bg-white/85 hover:bg-white`
      : 'bg-blue-100 text-blue-900 hover:bg-blue-200';
    if (!palabra) return defaultOption;
    if (!respuestaSeleccionada) {
      return defaultOption;
    }
    if (opcion === palabra.es) {
      return 'bg-green-500 text-white';
    }
    if (opcion === respuestaSeleccionada && opcion !== palabra.es) {
      return 'bg-red-500 text-white';
    }
    return 'bg-blue-100 text-blue-900 opacity-60';
  };

  return (
    <div
      ref={confettiTargetRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 p-4 font-sans text-slate-900"
    >
      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 p-1 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          aria-pressed={language === 'en'}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-100'
            }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('es')}
          aria-pressed={language === 'es'}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${language === 'es' ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-100'
            }`}
        >
          Español
        </button>
      </div>

      <PDFExamGenerator
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        grupos={gruposTematicos}
      />

      {fase === 'inicio' && (
        <div className="w-full max-w-3xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-fade-in">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowExamModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition"
            >
              <span>📄</span>
              {language === 'en' ? 'Create PDF Exam' : 'Crear Examen PDF'}
            </button>
          </div>
          <h1 className="mb-6 text-4xl font-extrabold text-blue-700 drop-shadow-sm md:text-5xl">{t.homeTitle}</h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-blue-900">{t.homeIntro}</p>
          <div className="flex flex-col gap-10 text-left">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-700">{t.vocabRouteTitle}</h2>
              <p className="mt-1 text-base text-slate-600">{t.vocabRouteDescription}</p>
              <div className="mt-6 flex flex-col gap-6">
                {gruposVocabulario.map((grupo, index) => {
                  const progress = computeGroupProgress(grupo, highScores);
                  const examScore = examScores[grupo.id] ?? 0;
                  const examPassed = examScore >= examPassMark;
                  const examUnlocked = progress.total > 0 && progress.completed === progress.total;
                  const previousGrupo = index === 0 ? null : gruposVocabulario[index - 1];
                  const previousExamPassed =
                    !previousGrupo || (examScores[previousGrupo.id] ?? 0) >= examPassMark;
                  const bloqueBloqueado = !previousExamPassed;
                  const accentClass =
                    grupo.nivel.clases.insignia
                      .split(' ')
                      .find((cls) => cls.startsWith('bg-')) ?? 'bg-blue-600';
                  const progressLabel = `${t.groupProgressLabel}: ${progress.percent}% · ${progress.completed}/${progress.total} ${t.groupProgressSuffix}`;

                  return (
                    <article
                      key={grupo.id}
                      className={`rounded-3xl border bg-gradient-to-br p-6 shadow-lg transition ${bloqueBloqueado ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-2xl'
                        } ${grupo.nivel.clases.fondo} ${grupo.nivel.clases.borde}`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${grupo.nivel.clases.insignia}`}
                        >
                          {grupo.nivel.titulo[language]}
                        </span>
                        <span className="text-xs font-medium text-slate-600 sm:text-sm">
                          {grupo.nivel.descripcion[language]}
                        </span>
                      </div>
                      <h3 className={`mt-4 text-2xl font-bold ${grupo.nivel.clases.titulo}`}>{grupo.nombre[language]}</h3>
                      <p className="mt-2 text-sm text-slate-700 sm:text-base">{grupo.descripcion[language]}</p>
                      <div className="mt-4">
                        <BlockProgressBar
                          percent={progress.percent}
                          label={progressLabel}
                          accentClass={accentClass}
                          labelClass={grupo.nivel.clases.titulo}
                        />
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-600">{t.practiceGoalHint}</p>
                      {bloqueBloqueado && (
                        <p className="mt-3 rounded-2xl bg-white/70 px-4 py-2 text-xs font-semibold text-blue-700 shadow">
                          {t.blockLockedMessage}
                        </p>
                      )}
                      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {grupo.temas.map((tema) => {
                          const record = highScores[tema.id] ?? 0;
                          const threshold = getPracticeThreshold(tema);
                          const temaCompletado = isTemaCompleted(tema, highScores);
                          const stateTag = temaCompletado ? t.practiceCompletedTag : t.practicePendingTag;
                          return (
                            <button
                              key={tema.id}
                              type="button"
                              onClick={() => seleccionarTema(tema, grupo)}
                              disabled={bloqueBloqueado}
                              className="group rounded-2xl bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-blue-600"
                            >
                              <span className="block text-base font-bold">{tema.nombre[language]}</span>
                              <div className="mt-2 flex items-center justify-between text-xs font-medium text-blue-100">
                                <span>
                                  {t.wordsLabel}: {tema.palabras.length}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${temaCompletado ? 'bg-green-500 text-white' : 'bg-blue-900/40 text-blue-50'
                                    }`}
                                >
                                  {stateTag}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[11px] text-blue-100">
                                <span>🏆 {record}</span>
                                <span>🎯 {threshold}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => prepararExamen(grupo)}
                          disabled={!examUnlocked || bloqueBloqueado}
                          className="rounded-2xl bg-white/90 px-4 py-3 text-left text-sm font-semibold text-blue-900 shadow-md transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                        >
                          <div className="flex items-center justify-between">
                            <span>{t.examButtonLabel}</span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${examPassed
                                  ? 'bg-green-500 text-white'
                                  : examUnlocked
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-300 text-slate-600'
                                }`}
                            >
                              {examPassed
                                ? t.practiceCompletedTag
                                : examUnlocked
                                  ? t.examUnlockedTag
                                  : t.examLockedTag}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs font-medium text-slate-600">
                            <span>
                              {t.questionsLabel}: {EXAM_QUESTION_COUNT}
                            </span>
                            <span>
                              🏆 {t.examBest}: {examScore}
                            </span>
                          </div>
                        </button>
                        {!examUnlocked && !bloqueBloqueado && (
                          <p className="rounded-2xl bg-white/70 px-4 py-2 text-xs font-semibold text-blue-700 shadow">
                            {t.examLockedMessage}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-700">{t.phrasesRouteTitle}</h2>
              <p className="mt-1 text-base text-slate-600">{t.phrasesRouteDescription}</p>
              <div className="mt-6 flex flex-col gap-6">
                {gruposFrases.map((grupo, index) => {
                  const progress = computeGroupProgress(grupo, highScores);
                  const examScore = examScores[grupo.id] ?? 0;
                  const examPassed = examScore >= examPassMark;
                  const examUnlocked = progress.total > 0 && progress.completed === progress.total;
                  const previousGrupo = index === 0 ? null : gruposFrases[index - 1];
                  const previousExamPassed =
                    !previousGrupo || (examScores[previousGrupo.id] ?? 0) >= examPassMark;
                  const bloqueBloqueado = !previousExamPassed;
                  const accentClass =
                    grupo.nivel.clases.insignia
                      .split(' ')
                      .find((cls) => cls.startsWith('bg-')) ?? 'bg-purple-600';
                  const progressLabel = `${t.groupProgressLabel}: ${progress.percent}% · ${progress.completed}/${progress.total} ${t.groupProgressSuffix}`;

                  return (
                    <article
                      key={grupo.id}
                      className={`rounded-3xl border bg-gradient-to-br p-6 shadow-lg transition ${bloqueBloqueado ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-2xl'
                        } ${grupo.nivel.clases.fondo} ${grupo.nivel.clases.borde}`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${grupo.nivel.clases.insignia}`}
                        >
                          {grupo.nivel.titulo[language]}
                        </span>
                        <span className="text-xs font-medium text-slate-600 sm:text-sm">
                          {grupo.nivel.descripcion[language]}
                        </span>
                      </div>
                      <h3 className={`mt-4 text-2xl font-bold ${grupo.nivel.clases.titulo}`}>{grupo.nombre[language]}</h3>
                      <p className="mt-2 text-sm text-slate-700 sm:text-base">{grupo.descripcion[language]}</p>
                      <div className="mt-4">
                        <BlockProgressBar
                          percent={progress.percent}
                          label={progressLabel}
                          accentClass={accentClass}
                          labelClass={grupo.nivel.clases.titulo}
                        />
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-600">{t.practiceGoalHint}</p>
                      {bloqueBloqueado && (
                        <p className="mt-3 rounded-2xl bg-white/70 px-4 py-2 text-xs font-semibold text-purple-700 shadow">
                          {t.blockLockedMessage}
                        </p>
                      )}
                      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {grupo.temas.map((tema) => {
                          const record = highScores[tema.id] ?? 0;
                          const threshold = getPracticeThreshold(tema);
                          const temaCompletado = isTemaCompleted(tema, highScores);
                          const stateTag = temaCompletado ? t.practiceCompletedTag : t.practicePendingTag;
                          return (
                            <button
                              key={tema.id}
                              type="button"
                              onClick={() => seleccionarTema(tema, grupo)}
                              disabled={bloqueBloqueado}
                              className="group rounded-2xl bg-purple-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-purple-600"
                            >
                              <span className="block text-base font-bold">{tema.nombre[language]}</span>
                              <div className="mt-2 flex items-center justify-between text-xs font-medium text-purple-100">
                                <span>
                                  {t.sentencesLabel}: {tema.palabras.length}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${temaCompletado ? 'bg-green-500 text-white' : 'bg-purple-900/40 text-purple-50'
                                    }`}
                                >
                                  {stateTag}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[11px] text-purple-100">
                                <span>🏆 {record}</span>
                                <span>🎯 {threshold}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => prepararExamen(grupo)}
                          disabled={!examUnlocked || bloqueBloqueado}
                          className="rounded-2xl bg-white/90 px-4 py-3 text-left text-sm font-semibold text-purple-900 shadow-md transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                        >
                          <div className="flex items-center justify-between">
                            <span>{t.examButtonLabel}</span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${examPassed
                                  ? 'bg-green-500 text-white'
                                  : examUnlocked
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-slate-300 text-slate-600'
                                }`}
                            >
                              {examPassed
                                ? t.practiceCompletedTag
                                : examUnlocked
                                  ? t.examUnlockedTag
                                  : t.examLockedTag}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs font-medium text-slate-600">
                            <span>
                              {t.questionsLabel}: {EXAM_QUESTION_COUNT}
                            </span>
                            <span>
                              🏆 {t.examBest}: {examScore}
                            </span>
                          </div>
                        </button>
                        {!examUnlocked && !bloqueBloqueado && (
                          <p className="rounded-2xl bg-white/70 px-4 py-2 text-xs font-semibold text-purple-700 shadow">
                            {t.examLockedMessage}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {fase === 'modo' && temaActual && (
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-slide-up">
          <h2 className="mb-4 text-3xl font-bold text-blue-700">{temaActual.nombre[language]}</h2>
          <p className="mb-3 text-base text-slate-600">{t.modeIntro}</p>
          <div className="mb-4 space-y-2 text-sm">
            <p className="font-medium text-blue-600">
              {t.personalBest}: {highScores[temaActual.id] ?? 0} / {temaActual.palabras.length}
            </p>
            <p className="font-semibold text-blue-600">
              {t.practiceGoalLabel}: {temaActualThreshold} {t.pointsWord}
            </p>
            <p className="text-xs font-medium text-slate-600">{t.practiceGoalHint}</p>
          </div>
          {temaActualCompletada && (
            <span className="mb-4 inline-flex items-center justify-center rounded-full bg-green-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {t.practiceCompletedTag}
            </span>
          )}
          <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => iniciarModo('aprender')}
              className="w-full rounded-xl bg-green-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              {t.learnButton}
            </button>
            <button
              type="button"
              onClick={() => iniciarModo('practicar')}
              className="w-full rounded-xl bg-amber-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              {t.practiceButton}
            </button>
          </div>
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-xl border border-blue-300 px-6 py-2 text-base font-semibold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white"
          >
            ⬅️ {t.backButton}
          </button>
        </div>
      )}

      {fase === 'examenPrep' && grupoActual && (
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-slide-up">
          <h2 className="mb-4 text-3xl font-bold text-blue-700">{grupoActual.nombre[language]}</h2>
          <p className="mb-4 text-base text-slate-600">{t.examIntro}</p>
          {progresoGrupoActual && (
            <div className="mb-4">
              <BlockProgressBar
                percent={progresoGrupoActual.percent}
                label={`${t.groupProgressLabel}: ${progresoGrupoActual.percent}% · ${progresoGrupoActual.completed}/${progresoGrupoActual.total} ${t.groupProgressSuffix}`}
                accentClass={
                  grupoActual.nivel.clases.insignia
                    .split(' ')
                    .find((cls) => cls.startsWith('bg-')) ?? 'bg-blue-600'
                }
                labelClass={grupoActual.nivel.clases.titulo}
              />
            </div>
          )}
          <div className="mb-6 space-y-2 text-sm font-medium text-slate-600">
            <p>
              {t.questionsLabel}: {EXAM_QUESTION_COUNT}
            </p>
            <p>
              {t.examBest}: {recordActualExamen} / {EXAM_QUESTION_COUNT}
            </p>
            <p className="text-xs font-medium text-slate-600">
              {t.examNeededScore.replace('{count}', examPassMark.toString())}
            </p>
            {examenAprobadoActual && (
              <span className="mt-2 inline-flex items-center justify-center rounded-full bg-green-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {t.practiceCompletedTag}
              </span>
            )}
          </div>
          <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={iniciarExamen}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              {t.startExamButton}
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className="w-full rounded-xl border border-blue-300 px-6 py-3 text-lg font-semibold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              ⬅️ {t.mainMenuButton}
            </button>
          </div>
        </div>
      )}

      {fase === 'aprender' && palabra && temaActual && (
        <div
          className={`w-full max-w-xl rounded-3xl shadow-2xl animate-slide-up ${grupoActual ? `${theme.panelOuter} p-[3px]` : 'bg-white'
            }`}
        >
          <div
            className={`rounded-3xl p-10 text-center ${grupoActual ? theme.panelInner : 'bg-white'
              }`}
          >
            {grupoActual && (
              <div className="flex flex-col items-center gap-3">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider ${theme.badge}`}
                >
                  {grupoActual.nivel.titulo[language]}
                </span>
                <h3 className={`text-lg font-semibold ${theme.heading}`}>{grupoActual.nombre[language]}</h3>
                <p className="text-sm font-medium text-slate-600">{temaActual.nombre[language]}</p>
              </div>
            )}
            <ProgressBar
              current={indice}
              total={temaActual.palabras.length}
              accentClass={theme.accentBar}
              labelClass={theme.heading}
            />
            <p className="mt-4 text-xs font-medium text-slate-600">
              {language === 'es'
                ? `Pregunta ${indice + 1} de ${temaActual.palabras.length}`
                : `Question ${indice + 1} of ${temaActual.palabras.length}`}
            </p>
            <h2 className="mt-8 text-2xl font-semibold text-slate-800">{palabra.en}</h2>
            <p className="my-6 text-4xl font-bold text-green-600">{palabra.es}</p>
            <p className={`text-sm font-semibold ${theme.heading}`}>
              {t.personalBest}: {recordActualTema} / {temaActual.palabras.length}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-600">
              {t.practiceGoalLabel}: {temaActualThreshold} {t.pointsWord}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={siguiente}
                className={`rounded-xl px-8 py-3 text-lg font-semibold transition ${theme.primaryButton}`}
              >
                {t.nextButton}
              </button>
              <button
                type="button"
                onClick={reiniciar}
                className={`rounded-xl px-8 py-3 text-lg font-semibold transition ${theme.secondaryButton}`}
              >
                ⬅️ {t.mainMenuButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {(fase === 'practicar' || fase === 'examen') && palabra && temaActual && (
        <div
          className={`w-full max-w-xl rounded-3xl shadow-2xl animate-slide-up ${grupoActual ? `${theme.panelOuter} p-[3px]` : 'bg-white'
            }`}
        >
          <div
            className={`rounded-3xl p-10 text-center ${grupoActual ? theme.panelInner : 'bg-white'
              }`}
          >
            {grupoActual && (
              <div className="flex flex-col items-center gap-3">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider ${theme.badge}`}
                >
                  {grupoActual.nivel.titulo[language]}
                </span>
                <h3 className={`text-lg font-semibold ${theme.heading}`}>{grupoActual.nombre[language]}</h3>
                <p className="text-sm font-medium text-slate-600">{temaActual.nombre[language]}</p>
              </div>
            )}
            <ProgressBar
              current={indice}
              total={temaActual.palabras.length}
              accentClass={theme.accentBar}
              labelClass={theme.heading}
            />
            <h2 className={`mt-8 text-2xl font-semibold ${theme.heading}`}>
              {t.translatePrompt} <span className="font-bold">{palabra.en}</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {opciones.map((opcion) => (
                <button
                  key={opcion.es}
                  type="button"
                  disabled={bloqueado}
                  onClick={() => responder(opcion.es)}
                  className={`rounded-xl px-4 py-3 text-lg font-semibold shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${bloqueado ? 'cursor-not-allowed' : 'hover:-translate-y-0.5'
                    } ${getOptionClasses(opcion.es)}`}
                >
                  {opcion.es}
                </button>
              ))}
            </div>
            <p className={`mt-6 text-base font-medium ${theme.heading}`}>
              {t.pointsLabel}: <span className="font-bold">{puntos}</span>
            </p>
            <p className={`mt-2 text-sm font-semibold ${theme.heading}`}>
              {(esExamen ? t.examBest : t.recordLabel)}: {Math.max(esExamen ? recordActualExamen : recordActualTema, puntos)} / {temaActual.palabras.length}
            </p>
            {!esExamen && practicaUmbral > 0 && (
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {t.practiceGoalLabel}: {practicaUmbral} {t.pointsWord}
              </p>
            )}
            {esExamen && (
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {t.examNeededScore.replace('{count}', examenUmbral.toString())}
              </p>
            )}
            <button
              type="button"
              onClick={reiniciar}
              className={`mt-6 w-full rounded-xl px-6 py-3 text-lg font-semibold transition sm:w-auto ${theme.secondaryButton}`}
            >
              ⬅️ {t.mainMenuButton}
            </button>
          </div>
        </div>
      )}

      {fase === 'resultado' && temaActual && (
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-bounce-in">
          <h2 className="mb-4 text-3xl font-bold text-green-700">{t.resultTitle}</h2>
          <p className="mb-6 text-lg text-slate-700">
            {esPracticar ? (
              <>
                {t.youScored}{' '}
                <span className="font-bold text-blue-700">{puntos}</span> {t.pointsWord} {t.outOf}{' '}
                <span className="font-bold text-blue-700">{temaActual.palabras.length}</span>.
              </>
            ) : esExamen ? (
              <>
                {t.youScored}{' '}
                <span className="font-bold text-blue-700">{puntos}</span> {t.pointsWord} {t.outOf}{' '}
                <span className="font-bold text-blue-700">{temaActual.palabras.length}</span>.
              </>
            ) : (
              <>{t.learnModeComplete}</>
            )}
          </p>
          {esPracticar && practicaUmbral > 0 && (
            <p className={`mb-4 text-sm font-semibold ${practicaSesionSuperada ? 'text-green-600' : 'text-blue-600'}`}>
              {practicaSesionSuperada
                ? t.listCompletedLabel
                : t.listIncompleteLabel.replace('{count}', Math.max(0, practicaUmbral - puntos).toString())}
            </p>
          )}
          {esExamen && (
            <p className={`mb-4 text-sm font-semibold ${examenSuperado ? 'text-green-600' : 'text-red-600'}`}>
              {examenSuperado
                ? t.examPassMessage
                : `${t.examFailMessage} ${t.examNeededScore.replace('{count}', examenUmbral.toString())}`}
            </p>
          )}
          <p className={`mb-6 text-sm font-semibold ${esNuevoRecord ? 'text-green-600' : 'text-blue-600'}`}>
            {(esExamen ? t.examBest : t.personalBest)}: {Math.max(esExamen ? recordActualExamen : recordActualTema, puntos)} / {temaActual.palabras.length}
            {esNuevoRecord ? t.newRecordSuffix : ''}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={esExamen ? iniciarExamen : () => iniciarModo(modo ?? 'practicar')}
              className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              {esExamen ? t.startExamButton : t.repeatTopicButton}
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-xl border border-blue-300 px-6 py-3 text-lg font-semibold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              ⬅️ {t.backToHomeButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
