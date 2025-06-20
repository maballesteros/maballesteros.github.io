import React from 'react';
import Spinner from './Spinner';
import './LoadingScreens.css'; // Import shared loading screen styles

interface OnboardingQuestionsLoadingScreenProps {
  worldName: string;
}

const OnboardingQuestionsLoadingScreen: React.FC<OnboardingQuestionsLoadingScreenProps> = ({ worldName }) => (
  <section className="loading-screen" aria-labelledby="loading-heading-onboarding-q">
    <h2 id="loading-heading-onboarding-q">Descubriendo las Preguntas Clave...</h2>
    <p>Estamos consultando a los oráculos de la narrativa para forjar las preguntas que definirán el inicio de tu aventura en {worldName}.</p>
    <Spinner ariaLabel="Generando preguntas de onboarding..." />
    <p><em>Un camino único se está revelando... Esto puede tardar un momento.</em></p>
  </section>
);

export default OnboardingQuestionsLoadingScreen;