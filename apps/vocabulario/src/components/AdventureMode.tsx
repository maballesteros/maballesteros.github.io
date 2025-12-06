import { useState, useEffect, useMemo } from 'react';
import party from 'party-js';
import { gruposData } from '../data';

type LocalizedText = {
    en: string;
    es: string;
};

type AdventureScene = {
    id: string;
    text: LocalizedText;
    challenge: {
        type: 'fill-blank';
        question: LocalizedText;
        targetWordEn: string;
        options: (string | { en: string; es: string })[];
    };
};

type Adventure = {
    id: string;
    levelId: number;
    title: LocalizedText;
    description: LocalizedText;
    scenes: AdventureScene[];
};

// Import the adventure data directly for now
import level1Stories from '../data/adventures/level1-stories.json';
import level2Stories from '../data/adventures/level2-stories.json';
import level3Stories from '../data/adventures/level3-stories.json';
import level4Stories from '../data/adventures/level4-stories.json';
import level5Stories from '../data/adventures/level5-stories.json';
import level6Stories from '../data/adventures/level6-stories.json';
import level7Stories from '../data/adventures/level7-stories.json';
import level8Stories from '../data/adventures/level8-stories.json';
import level9Stories from '../data/adventures/level9-stories.json';
import level10Stories from '../data/adventures/level10-stories.json';

// Combine all adventures
const adventures: Adventure[] = [
    ...level1Stories,
    ...level2Stories,
    ...level3Stories,
    ...level4Stories,
    ...level5Stories,
    ...level6Stories,
    ...level7Stories,
    ...level8Stories,
    ...level9Stories,
    ...level10Stories,
] as Adventure[];

type AdventureModeProps = {
    language: 'en' | 'es';
    onBack: () => void;
    levelId?: number;
};

export const AdventureMode = ({ language, onBack, levelId }: AdventureModeProps) => {
    const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const filteredAdventures = useMemo(() => {
        if (!levelId) return adventures;
        return adventures.filter(adv => adv.levelId === levelId);
    }, [levelId]);

    const currentAdventure = selectedAdventure;
    const currentScene = currentAdventure?.scenes[currentSceneIndex];

    const handleSelectAdventure = (adv: Adventure) => {
        setSelectedAdventure(adv);
        setCurrentSceneIndex(0);
        setCompleted(false);
        setFeedback(null);
    };

    const getSpanishWord = (wordEn: string) => {
        // Find the word in the global data to get the Spanish translation
        for (const group of gruposData) {
            for (const tema of group.temas) {
                const found = tema.palabras.find(p => p.en.toLowerCase() === wordEn.toLowerCase());
                if (found) return found.es; // Always return Spanish
            }
        }
        return wordEn; // Fallback
    };

    const getOptionEn = (option: string | { en: string; es: string }) => {
        return typeof option === 'string' ? option : option.en;
    };

    const getOptionEs = (option: string | { en: string; es: string }) => {
        if (typeof option !== 'string') return option.es;
        return getSpanishWord(option);
    };

    const handleOptionClick = (option: string | { en: string; es: string }) => {
        if (!currentScene) return;

        const optionEn = getOptionEn(option);

        if (optionEn === currentScene.challenge.targetWordEn) {
            setFeedback('correct');
            party.confetti(document.body, {
                count: party.variation.range(40, 60),
            });

            setTimeout(() => {
                if (currentSceneIndex + 1 < (currentAdventure?.scenes.length || 0)) {
                    setCurrentSceneIndex(prev => prev + 1);
                    setFeedback(null);
                } else {
                    setCompleted(true);
                    party.sparkles(document.body);
                }
            }, 1500);
        } else {
            setFeedback('incorrect');
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    if (!selectedAdventure) {
        return (
            <div className="w-full max-w-3xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-fade-in">
                <h2 className="mb-6 text-3xl font-bold text-indigo-700">
                    {language === 'en' ? 'Choose an Adventure' : 'Elige una Aventura'}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                    {filteredAdventures.map(adv => (
                        <button
                            key={adv.id}
                            onClick={() => handleSelectAdventure(adv)}
                            className="rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-6 text-left transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-indigo-900">{adv.title[language]}</h3>
                            <p className="mt-2 text-sm text-indigo-700">{adv.description[language]}</p>
                            <span className="mt-4 inline-block rounded-full bg-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-800">
                                {language === 'en' ? `Level ${adv.levelId} ` : `Nivel ${adv.levelId} `}
                            </span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onBack}
                    className="mt-8 rounded-xl border border-slate-300 px-6 py-2 text-slate-600 transition hover:bg-slate-50"
                >
                    {language === 'en' ? 'Back' : 'Volver'}
                </button>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl animate-bounce-in">
                <h2 className="mb-4 text-4xl font-bold text-indigo-600">
                    {language === 'en' ? 'Adventure Complete!' : '¡Aventura Completada!'}
                </h2>
                <p className="mb-8 text-lg text-slate-600">
                    {language === 'en'
                        ? `You finished "${currentAdventure?.title.en}"`
                        : `Has terminado "${currentAdventure?.title.es}"`}
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setSelectedAdventure(null)}
                        className="rounded-xl bg-indigo-600 px-6 py-3 text-white shadow-md transition hover:bg-indigo-700"
                    >
                        {language === 'en' ? 'More Adventures' : 'Más Aventuras'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-indigo-100">{currentAdventure?.title[language]}</h3>
                    <span className="text-xs bg-indigo-800 px-2 py-1 rounded-full">
                        {currentSceneIndex + 1} / {currentAdventure?.scenes.length}
                    </span>
                </div>
            </div>

            {/* Story Content */}
            <div className="p-8 md:p-12">
                <div className="mb-8 text-xl leading-relaxed text-slate-800 font-serif">
                    {currentScene?.text[language].split('[_____]').map((part, i, arr) => (
                        <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span className="inline-block min-w-[80px] border-b-2 border-indigo-400 text-center font-bold text-indigo-600 mx-1">
                                    {feedback === 'correct' ? getSpanishWord(currentScene.challenge.targetWordEn) : '?'}
                                </span>
                            )}
                        </span>
                    ))}
                </div>

                {/* Challenge Area */}
                <div className="rounded-2xl bg-indigo-50 p-6">
                    <p className="mb-4 text-center font-medium text-indigo-900">
                        {currentScene?.challenge.question[language]}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {currentScene?.challenge.options.map((option, idx) => {
                            const optionEn = getOptionEn(option);
                            const optionEs = getOptionEs(option);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(option)}
                                    disabled={feedback === 'correct'}
                                    className={`rounded-xl px-4 py-3 font-semibold transition shadow-sm
                  ${feedback === 'incorrect' && optionEn !== currentScene.challenge.targetWordEn ? 'opacity-50' : ''}
                  ${feedback === 'correct' && optionEn === currentScene.challenge.targetWordEn
                                            ? 'bg-green-500 text-white scale-105'
                                            : 'bg-white text-indigo-700 hover:bg-indigo-100 hover:shadow-md'
                                        }
`}
                                >
                                    {optionEs}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-100">
                <button
                    onClick={() => setSelectedAdventure(null)}
                    className="text-sm text-slate-500 hover:text-slate-800"
                >
                    {language === 'en' ? 'Quit Adventure' : 'Salir de la aventura'}
                </button>
            </div>
        </div>
    );
};
