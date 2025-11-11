import { useEffect, useMemo, useRef, useState } from 'react';
import party from 'party-js';
import gruposData from './data/grupos.json';

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

type Fase = 'inicio' | 'modo' | 'aprender' | 'practicar' | 'resultado';

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
    resultTitle: '🎉 Final result!'
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
    resultTitle: '🎉 ¡Resultado final!'
  }
};

const HIGH_SCORES_STORAGE_KEY = 'vocabulario-high-scores';

const gruposTematicos = gruposData as GrupoTematico[];


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

const App = () => {
  const [fase, setFase] = useState<Fase>('inicio');
  const [temaActual, setTemaActual] = useState<Tema | null>(null);
  const [grupoActual, setGrupoActual] = useState<GrupoTematico | null>(null);
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [modo, setModo] = useState<'aprender' | 'practicar' | null>(null);
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
  const confettiTargetRef = useRef<HTMLDivElement | null>(null);
  const recordInicioRef = useRef(0);
  const hasCelebratedRecordRef = useRef(false);

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
  const recordActualTema = temaActual ? highScores[temaActual.id] ?? 0 : 0;
  const esPracticar = modo === 'practicar';
  const esNuevoRecord = fase === 'resultado' && esPracticar && puntos > recordInicioRef.current;
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
    if (fase === 'resultado' && esPracticar && esNuevoRecord) {
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
  }, [esNuevoRecord, esPracticar, fase]);

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
    return buildOptions(actual, temaActual.palabras);
  }, [temaActual, indice]);

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
          className={`rounded-full px-3 py-1 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
            language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-100'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('es')}
          aria-pressed={language === 'es'}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
            language === 'es' ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-100'
          }`}
        >
          Español
        </button>
      </div>

      {fase === 'inicio' && (
        <div className="w-full max-w-3xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-fade-in">
          <h1 className="mb-6 text-4xl font-extrabold text-blue-700 drop-shadow-sm md:text-5xl">{t.homeTitle}</h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-blue-900">{t.homeIntro}</p>
          <div className="flex flex-col gap-10 text-left">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-700">{t.vocabRouteTitle}</h2>
              <p className="mt-1 text-base text-slate-600">{t.vocabRouteDescription}</p>
              <div className="mt-6 flex flex-col gap-6">
                {gruposVocabulario.map((grupo) => (
                  <article
                    key={grupo.id}
                    className={`rounded-3xl border bg-gradient-to-br p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ${grupo.nivel.clases.fondo} ${grupo.nivel.clases.borde}`}
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
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {grupo.temas.map((tema) => {
                        const record = highScores[tema.id] ?? 0;
                        return (
                          <button
                            key={tema.id}
                            type="button"
                            onClick={() => seleccionarTema(tema, grupo)}
                            className="group rounded-2xl bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white"
                          >
                            <span className="block text-base font-bold">{tema.nombre[language]}</span>
                          <span className="mt-2 flex items-center justify-between text-xs font-medium text-blue-100">
                            <span>
                              {t.wordsLabel}: {tema.palabras.length}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-700/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                              🏆 {record}
                            </span>
                          </span>
                        </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-700">{t.phrasesRouteTitle}</h2>
              <p className="mt-1 text-base text-slate-600">{t.phrasesRouteDescription}</p>
              <div className="mt-6 flex flex-col gap-6">
                {gruposFrases.map((grupo) => (
                  <article
                    key={grupo.id}
                    className={`rounded-3xl border bg-gradient-to-br p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ${grupo.nivel.clases.fondo} ${grupo.nivel.clases.borde}`}
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
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {grupo.temas.map((tema) => {
                        const record = highScores[tema.id] ?? 0;
                        return (
                          <button
                            key={tema.id}
                            type="button"
                            onClick={() => seleccionarTema(tema, grupo)}
                            className="group rounded-2xl bg-purple-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-white"
                          >
                            <span className="block text-base font-bold">{tema.nombre[language]}</span>
                          <span className="mt-2 flex items-center justify-between text-xs font-medium text-purple-100">
                            <span>
                              {t.sentencesLabel}: {tema.palabras.length}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-700/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                              🏆 {record}
                            </span>
                          </span>
                        </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {fase === 'modo' && temaActual && (
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-slide-up">
          <h2 className="mb-4 text-3xl font-bold text-blue-700">{temaActual.nombre[language]}</h2>
          <p className="mb-8 text-base text-slate-600">{t.modeIntro}</p>
          <p className="mb-6 text-sm font-medium text-blue-600">
            {t.personalBest}: {highScores[temaActual.id] ?? 0} / {temaActual.palabras.length}
          </p>
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

      {fase === 'aprender' && palabra && temaActual && (
        <div
          className={`w-full max-w-xl rounded-3xl shadow-2xl animate-slide-up ${
            grupoActual ? `${theme.panelOuter} p-[3px]` : 'bg-white'
          }`}
        >
          <div
            className={`rounded-3xl p-10 text-center ${
              grupoActual ? theme.panelInner : 'bg-white'
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
            <h2 className="mt-8 text-2xl font-semibold text-slate-800">{palabra.en}</h2>
            <p className="my-6 text-4xl font-bold text-green-600">{palabra.es}</p>
            <p className={`text-sm font-semibold ${theme.heading}`}>
              {t.personalBest}: {recordActualTema} / {temaActual.palabras.length}
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

      {fase === 'practicar' && palabra && temaActual && (
        <div
          className={`w-full max-w-xl rounded-3xl shadow-2xl animate-slide-up ${
            grupoActual ? `${theme.panelOuter} p-[3px]` : 'bg-white'
          }`}
        >
          <div
            className={`rounded-3xl p-10 text-center ${
              grupoActual ? theme.panelInner : 'bg-white'
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
                  className={`rounded-xl px-4 py-3 text-lg font-semibold shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${
                    bloqueado ? 'cursor-not-allowed' : 'hover:-translate-y-0.5'
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
              {t.recordLabel}: {Math.max(recordActualTema, puntos)} / {temaActual.palabras.length}
            </p>
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
            ) : (
              <>{t.learnModeComplete}</>
            )}
          </p>
          <p className={`mb-6 text-sm font-semibold ${esNuevoRecord ? 'text-green-600' : 'text-blue-600'}`}>
            {t.personalBest}: {recordActualTema} / {temaActual.palabras.length}
            {esPracticar && esNuevoRecord ? t.newRecordSuffix : ''}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => iniciarModo(modo ?? 'practicar')}
              className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              {t.repeatTopicButton}
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
