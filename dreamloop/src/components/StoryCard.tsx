import React from 'react';
import type { Story } from '../types';
import './StoryCard.css'; // Import the new CSS file

interface StoryCardProps {
  story: Story;
  onSelect: (storyId: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onSelect }) => (
  <article 
    className="story-card" 
    onClick={() => onSelect(story.id)} 
    role="button" 
    tabIndex={0} 
    aria-labelledby={`story-title-${story.id}`}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(story.id); }}
  >
    {story.dreamImageUrl ? (
      <img src={story.dreamImageUrl} alt={`Imagen del sueño inicial para ${story.title}`} className="story-card-image" />
    ) : (
      <div className="story-card-image-placeholder">
        <span>{story.worldName ? story.worldName.substring(0,1).toUpperCase() : "S"}</span>
      </div>
    )}
    <div className="story-card-content">
      <h3 id={`story-title-${story.id}`} className="story-card-title">{story.title}</h3>
      <p className="story-card-world">{story.worldName}</p>
      <p className="story-card-details">
        Capítulos Generados: {story.chapters.length} | Próximo/Actual: {story.completedChaptersCount + 1}
      </p>
      <p className="story-card-date">
        Creado: {new Date(story.creationDate).toLocaleDateString()}
      </p>
    </div>
  </article>
);

export default StoryCard;