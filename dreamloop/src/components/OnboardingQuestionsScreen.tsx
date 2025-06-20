import React, { useState, useEffect } from 'react';
import type { Question } from '../types'; // Question type from types.ts
import ErrorMessage from './ErrorMessage';
import './OnboardingQuestionsScreen.css'; // Import the new CSS file

interface OnboardingQuestionsScreenProps {
  worldName: string;
  questions: Question[]; // Now receives AI-generated questions
  onSubmit: (answers: Record<string, string>) => void;
  error: string | null; // To display errors if question generation failed
  onRetry?: () => void; // Optional: To allow retrying question generation
}

const OnboardingQuestionsScreen: React.FC<OnboardingQuestionsScreenProps> = ({ 
  worldName, 
  questions, 
  onSubmit,
  error,
  onRetry
}) => {
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset answers if questions change (e.g., on retry or new world)
    setCurrentAnswers({});
  }, [questions]);

  const handleAnswerSelect = (questionId: string, answerValue: string) => {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: answerValue }));
  };

  const allQuestionsAnswered = questions.length > 0 && Object.keys(currentAnswers).length === questions.length;

  const handleSubmit = () => {
    if (allQuestionsAnswered) {
      onSubmit(currentAnswers);
    }
  };

  if (error) {
    return (
      <section className="onboarding-questions-screen" aria-live="assertive">
        <h2 id="onboarding-q-heading">Problemas al Definir la Aventura en {worldName}</h2>
        <ErrorMessage 
          title="No pudimos generar las preguntas iniciales"
          message={<>
            <p>{error}</p>
            {onRetry && <p>Puedes intentar generar las preguntas de nuevo.</p>}
          </>}
        />
        {onRetry && (
          <button onClick={onRetry} className="cta-button">
            Reintentar Generación
          </button>
        )}
      </section>
    );
  }
  
  if (!questions || questions.length === 0) {
     return (
      <section className="onboarding-questions-screen">
        <h2 id="onboarding-q-heading">Preparando Preguntas para {worldName}...</h2>
        <p>Un momento mientras se cargan las preguntas...</p>
         {/* Could show a mini-spinner here if desired */}
      </section>
    );
  }

  return (
    <section className="onboarding-questions-screen" aria-labelledby="onboarding-q-heading">
      <h2 id="onboarding-q-heading">Define los Cimientos de la Aventura en {worldName}</h2>
      <p>Tus respuestas ayudarán a dar forma al protagonista y al inicio de su viaje.</p>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {questions.map(q => (
          <fieldset key={q.id} className="question-block">
            <legend className="question-text">{q.text}</legend>
            <div className="answer-options">
              {q.answers.map(a => (
                <button
                  type="button"
                  key={a.value}
                  onClick={() => handleAnswerSelect(q.id, a.value)}
                  className={`answer-button ${currentAnswers[q.id] === a.value ? 'selected' : ''}`}
                  aria-pressed={currentAnswers[q.id] === a.value}
                  aria-label={`Respuesta: ${a.text}`}
                >
                  {a.text}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <button type="submit" className="cta-button" disabled={!allQuestionsAnswered} aria-label="Finalizar configuración y generar la aventura del héroe">
          Finalizar y Configurar Aventura
        </button>
      </form>
    </section>
  );
};

export default OnboardingQuestionsScreen;