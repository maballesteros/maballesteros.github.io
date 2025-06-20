import React from 'react';
import type { Story } from '../types';
import StoryCard from './StoryCard';
import './HomeScreen.css'; // Import the new CSS file

interface HomeScreenProps {
  stories: Story[];
  onCreateNew: () => void;
  onSelectStory: (storyId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ stories, onCreateNew, onSelectStory }) => (
  <section className="home-screen" aria-labelledby="home-heading">
    <h2 id="home-heading">Mis Sueños</h2>
    {stories.length === 0 ? (
      <div className="no-stories-message">
        <p>Aún no has tejido ningún sueño para tus héroes.</p>
        <p>¡Es hora de empezar una nueva aventura!</p>
      </div>
    ) : (
      <p>Explora las aventuras que has iniciado y los mundos que esperan a tus héroes ({stories.length} en total).</p>
    )}
    <div className="story-gallery">
      <button onClick={onCreateNew} className="create-new-story-card" aria-label="Crear nuevo sueño o historia">
        <div className="plus-icon">+</div>
        <p>Crear Nuevo Sueño</p>
      </button>
      {stories.map(story => (
        <StoryCard key={story.id} story={story} onSelect={onSelectStory} />
      ))}
    </div>
  </section>
);

export default HomeScreen;