import React from 'react';
import type { Story, ChapterEntry } from '../types';
import { formatChapterTitleForDisplay } from '../utils'; // Import helper
import './StoryDetailScreen.css'; // Import the new CSS file

interface StoryDetailScreenProps {
  story: Story;
  onNavigateHome: () => void;
  onContinueChapter: (storyId: string) => void;
  onViewChapter: (storyId: string, chapterIndex: number) => void;
}

const StoryDetailScreen: React.FC<StoryDetailScreenProps> = ({ story, onNavigateHome, onContinueChapter, onViewChapter }) => {
  if (!story) { 
    return (
      <section className="story-detail-screen" aria-labelledby="story-detail-error-heading">
        <h2 id="story-detail-error-heading">Sueño Perdido</h2>
        <p>No se pudo encontrar la historia seleccionada. Puede que haya sido un espejismo.</p>
        <button onClick={onNavigateHome} className="cta-button">Volver a Mis Sueños</button>
      </section>
    );
  }
  
  const chapterToProcessIndex = story.completedChaptersCount;
  let buttonText = "";
  let buttonAriaLabel = "";
  const nextChapterRomanNumeral = formatChapterTitleForDisplay("", chapterToProcessIndex + 1).split(":")[0]; // Gets "Capítulo X"

  if (chapterToProcessIndex >= 30) {
    buttonText = "Fin de la Aventura (Ver Epílogo Próximamente)";
    buttonAriaLabel = "Has completado todos los capítulos de esta saga. El epílogo estará disponible pronto.";
  } else if (chapterToProcessIndex < story.chapters.length) {
    buttonText = `Continuar con ${nextChapterRomanNumeral} (Reflexión Pendiente)`;
    buttonAriaLabel = `Abrir ${nextChapterRomanNumeral} para leer y añadir tu reflexión.`;
  } else { 
    buttonText = `Comenzar ${nextChapterRomanNumeral}`;
    buttonAriaLabel = `Generar y comenzar ${nextChapterRomanNumeral}.`;
  }
  if (story.chapters.length === 0 && chapterToProcessIndex === 0) {
      const firstChapterRomanNumeral = formatChapterTitleForDisplay("", 1).split(":")[0];
      buttonText = `Comenzar ${firstChapterRomanNumeral} para ${story.protagonistName || 'el Héroe'}`;
      buttonAriaLabel = `Generar y comenzar ${firstChapterRomanNumeral} para ${story.protagonistName || 'el Héroe'}.`;
  }


  const handleChapterClick = (chapter: ChapterEntry) => {
    onViewChapter(story.id, chapter.entryNumber - 1); // entryNumber is 1-indexed
  };

  return (
    <section className="story-detail-screen" aria-labelledby={`story-detail-title-${story.id}`}>
      <h2 id={`story-detail-title-${story.id}`}>{story.title}</h2>
      
      {story.protagonistName && (
        <p className="protagonist-info">
          Protagonista: <strong>{story.protagonistName}</strong> ({story.protagonistGender || 'Género no especificado'})
        </p>
      )}

      {story.dreamImageUrl && (
        <>
          {/* <h3 className="story-detail-section-title">Sueño Inicial del Héroe</h3> */}
          <figure className="story-detail-dream-figure">
            <img src={story.dreamImageUrl} alt={`Representación onírica para ${story.title}`} />
          </figure>
        </>
      )}

      {story.preambleText && (
        <>
          {/* <h3 className="story-detail-section-title">El Comienzo de la Aventura</h3> */}
          <div className="story-detail-preamble-text">
            {story.preambleText.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph.trim() || <>&nbsp;</>}</p> 
            ))}
          </div>
        </>
      )}
      
      {/* <h3 className="story-detail-section-title">Capítulos de la Historia</h3> */}
      {story.chapters.length > 0 ? (
        <ul className="story-detail-chapters-list" aria-label={`Lista de capítulos generados para ${story.title}`}>
          {story.chapters.sort((a,b) => a.entryNumber - b.entryNumber).map(chapter => {
            const chapterLabel = formatChapterTitleForDisplay(chapter.chapterTitle, chapter.entryNumber);
            const accessibleChapterName = `${chapterLabel}: ${chapter.chapterText.substring(0,70)}...`;
            const imageAltText = chapter.chapterContentImageUrl 
                                ? `Imagen representativa para ${chapterLabel}`
                                : `Placeholder para ${chapterLabel}`;

            return (
              <li 
                key={chapter.id} 
                className="story-detail-chapter-item"
                onClick={() => handleChapterClick(chapter)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleChapterClick(chapter);}}
                role="button"
                tabIndex={0}
                aria-label={`Ver ${accessibleChapterName}`}
              >
                {chapter.chapterContentImageUrl ? (
                  <img 
                    src={chapter.chapterContentImageUrl} 
                    alt={imageAltText}
                    className="story-detail-chapter-item-image" 
                  />
                ) : (
                  <div className="story-detail-chapter-item-image-placeholder">
                    <span>{chapter.entryNumber}</span>
                  </div>
                )}
                <div className="story-detail-chapter-item-content">
                  <strong>{chapterLabel}</strong>
                  <p className="chapter-text-preview">{chapter.chapterText.substring(0,250)}...</p>
                  <em>({chapter.playerReflectionForNextChapter && chapter.entryNumber <= story.completedChaptersCount ? "Reflexión guardada" : (chapter.entryNumber === story.completedChaptersCount + 1 && !chapter.playerReflectionForNextChapter ? "Reflexión pendiente" : "Reflexión guardada" )})</em>
                  <span className="chapter-date">({new Date(chapter.date).toLocaleDateString()})</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="no-chapters-message">La historia de {story.protagonistName || 'este héroe'} aún no ha comenzado a escribirse. ¡El primer capítulo aguarda ser soñado!</p>
      )}

      <div className="story-detail-actions">
        <button 
          onClick={() => onContinueChapter(story.id)} 
          className="cta-button"
          aria-label={buttonAriaLabel}
          disabled={chapterToProcessIndex >= 30}
        >
          {buttonText}
        </button>
        <button 
          onClick={onNavigateHome} 
          className="modal-button modal-button-cancel" /* Using modal's cancel style */
          aria-label="Volver a la pantalla de Mis Sueños"
        >
          Volver a Mis Sueños
        </button>
      </div>
    </section>
  );
};

export default StoryDetailScreen;