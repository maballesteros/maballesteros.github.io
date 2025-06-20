import React from 'react';
import Spinner from './Spinner';
import './LoadingScreens.css'; // Import shared loading screen styles

interface ChapterGenerationLoadingScreenProps {
  storyTitle: string;
  chapterNumber: number;
}
const ChapterGenerationLoadingScreen: React.FC<ChapterGenerationLoadingScreenProps> = ({ storyTitle, chapterNumber }) => (
  <section className="loading-screen chapter-loading" aria-labelledby="loading-heading-chapter">
    <h2 id="loading-heading-chapter">Tejiendo el Capítulo {chapterNumber}...</h2>
    <p>Las hebras del destino se entrelazan para "{storyTitle}". El héroe aguarda tu influencia para su próximo despertar.</p>
    <Spinner ariaLabel={`Generando capítulo ${chapterNumber}...`} />
    <p><em>Un nuevo fragmento del sueño está tomando forma...</em></p>
  </section>
);

export default ChapterGenerationLoadingScreen;