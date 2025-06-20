import React, { useState } from 'react';
import type { Story, ChapterEntry, ChapterViewScreenProps as Props } from '../types'; // Use imported Props
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import { formatChapterTitleForDisplay } from '../utils'; // Import helper
import './ChapterViewScreen.css'; // Import the new CSS file

const ChapterViewScreen: React.FC<Props> = ({
  story, chapter, chapterIndex, imageCaption, onSaveReflection, onNavigateBack, isLoading, error, onRegenerateChapterContentImage
}) => {
  const [reflectionText, setReflectionText] = useState(chapter.playerReflectionForNextChapter || "");
  
  const isChapterCompleted = chapterIndex < story.completedChaptersCount;
  const isCurrentChapterForReflection = chapterIndex === story.completedChaptersCount;
  const disableReflectionForm = isChapterCompleted;

  const handleSubmitReflection = () => {
    if (reflectionText.trim() && !disableReflectionForm) {
      onSaveReflection(story.id, chapterIndex, reflectionText.trim());
    } else if (!reflectionText.trim() && !disableReflectionForm) {
        alert("Por favor, escribe una reflexión para el héroe antes de continuar.");
    }
  };

  const displayChapterTitle = formatChapterTitleForDisplay(chapter.chapterTitle, chapter.entryNumber);

  let reflectionNotice = null;
  if (isChapterCompleted) {
    reflectionNotice = <p className="reflection-notice">Esta reflexión ya fue guardada y forma parte de la historia.</p>;
  } else if (isCurrentChapterForReflection && chapter.playerReflectionForNextChapter) {
    if (chapter.playerReflectionForNextChapter !== reflectionText) {
        // Text has changed
    } else {
        reflectionNotice = <p className="reflection-notice">Ya has guardado una reflexión para este capítulo. Puedes modificarla y guardarla de nuevo.</p>;
    }
  }

  const showRegenerateImageButton = onRegenerateChapterContentImage && 
                                   chapter.imageDescription && 
                                   (!chapter.chapterContentImageUrl || 
                                    (error && (error.toLowerCase().includes("imagen") || error.toLowerCase().includes("image"))));

  return (
    <section className="chapter-view-screen" aria-labelledby="chapter-main-title">
      <h2 id="chapter-main-title">{displayChapterTitle}</h2>
      <p className="story-context-title"><em>Para la historia: {story.title}</em></p>

      {error && (
        <ErrorMessage 
            title="Error al Cargar el Capítulo"
            message={error}
        />
      )}

      {isLoading && (
         <div className="loading-screen minimal-loading" aria-live="polite">
          <Spinner ariaLabel="Cargando detalles del capítulo..." />
          <p>Cargando...</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {chapter.chapterContentImageUrl ? (
            <figure className="chapter-image-figure">
              <img 
                src={chapter.chapterContentImageUrl} 
                alt={`Imagen del contenido del ${displayChapterTitle}`} 
              />
              {imageCaption && <figcaption className="image-caption">{imageCaption}</figcaption>}
            </figure>
          ) : (
            <div className="chapter-no-dream-message" aria-label="Sin imagen de contenido para este capítulo">
              <p>La imagen para representar el contenido de este capítulo no pudo ser generada o no está disponible.</p>
              {imageCaption && <p className="image-caption fallback-caption"><em>La descripción para la imagen era: {imageCaption}</em></p>}
            </div>
          )}

          {showRegenerateImageButton && onRegenerateChapterContentImage && chapter.imageDescription && !isLoading && (
            <div className="regenerate-action-container">
              <button
                onClick={() => onRegenerateChapterContentImage(story.id, chapterIndex, chapter.imageDescription as string)}
                className="secondary-action-button regenerate-button"
                disabled={isLoading}
                aria-label={`Intentar generar de nuevo la imagen de contenido para ${displayChapterTitle}`}
              >
                Regenerar Imagen del Capítulo
              </button>
            </div>
          )}
          
          <div className="chapter-text-content" tabIndex={0} aria-label={`Texto del ${displayChapterTitle}`}>
            {chapter.chapterText.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph || <>&nbsp;</>}</p>
            ))}
          </div>

          <div className="reflection-section">
            <h4>Susurra tu Próximo Sueño al Héroe:</h4>
            {reflectionNotice}
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder={disableReflectionForm ? "Reflexión guardada." : "Escribe aquí tus pensamientos, consejos o visiones para el héroe... (max 280 caracteres)"}
              maxLength={280}
              rows={5}
              className="reflection-textarea"
              aria-label="Mensaje para el próximo sueño del héroe"
              disabled={isLoading || disableReflectionForm}
              readOnly={disableReflectionForm} 
            />
            <button 
                onClick={handleSubmitReflection} 
                className="cta-button"
                disabled={isLoading || !reflectionText.trim() || disableReflectionForm}
                aria-label={disableReflectionForm ? "Reflexión guardada" : (chapter.playerReflectionForNextChapter && isCurrentChapterForReflection ? "Actualizar Reflexión" : "Guardar Reflexión y Concluir Capítulo")}
            >
              {disableReflectionForm ? "Reflexión Guardada" : (chapter.playerReflectionForNextChapter && isCurrentChapterForReflection ? "Actualizar Reflexión" : "Guardar Reflexión y Concluir Capítulo")}
            </button>
          </div>
        </>
      )}

      <button onClick={onNavigateBack} className="modal-button modal-button-cancel">
        Volver al Detalle de la Historia
      </button>
    </section>
  );
};

export default ChapterViewScreen;