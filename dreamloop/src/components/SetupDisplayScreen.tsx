import React from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import './SetupDisplayScreen.css'; // Import the new CSS file

interface SetupDisplayScreenProps {
  storyTitle: string | null;
  worldName: string;
  imageUrl: string | null;
  initialDreamImageCaption: string | null; // New: Caption for the initial dream image
  protagonistName: string | null;
  archetype: string | null;
  theme: string | null;
  preambleText: string | null;
  error: string | null;
  onContinue: () => void;
  onRegenerateInitialDreamImage?: () => void; // Renamed for clarity
  isGenerating: boolean;
  canSave: boolean; 
}

const SetupDisplayScreen: React.FC<SetupDisplayScreenProps> = ({
  storyTitle, worldName, imageUrl, initialDreamImageCaption, protagonistName, archetype, theme, preambleText, error, onContinue, onRegenerateInitialDreamImage, isGenerating, canSave
}) => {
  const hasContent = !!imageUrl || !!protagonistName || !!archetype || !!theme || !!preambleText || !!storyTitle || !!initialDreamImageCaption;

  const showRegenerateButton = onRegenerateInitialDreamImage && (!imageUrl || (error && (error.toLowerCase().includes("imagen") || error.toLowerCase().includes("image"))));
  const imageAltText = initialDreamImageCaption || `Representación onírica para ${storyTitle || worldName}`;

  return (
    <section className="setup-display-screen" aria-labelledby="setup-heading">
      <h2 id="setup-heading">{storyTitle || `Configuración para ${worldName}`}</h2>
      
      {isGenerating && (
        <div className="loading-screen minimal-loading" aria-live="polite">
          <Spinner ariaLabel="Generando detalles de la aventura..." />
          <p>Ajustando los últimos detalles...</p>
          {error && error.toLowerCase().startsWith("regenerando imagen") && <p>{error}</p>}
        </div>
      )}

      {error && !isGenerating && ( // Only show full error if not actively regenerating
        <ErrorMessage 
          title="¡Vaya! Contratiempos en el Reino de los Sueños"
          message={
            <>
              <p>{error}</p>
              {hasContent && <p>A pesar del contratiempo, algunos elementos pudieron ser revelados. Puedes intentar guardar o regenerar la imagen si es el problema.</p>}
            </>
          }
        />
      )}

      {!isGenerating && !hasContent && !error && (
          <p>No se han podido mostrar los detalles de la configuración en este momento. Intenta recargar o verifica la consola.</p>
      )}

      {!isGenerating && hasContent && (
        <>
          {storyTitle && <h3 className="story-title-display">Título: {storyTitle}</h3>}
          {imageUrl ? (
            <div className="dream-image-section">
              <h4>El Primer Sueño Inspirador del Héroe:</h4>
              <div className="dream-image-container">
                <img src={imageUrl} alt={imageAltText} />
              </div>
              {initialDreamImageCaption && <p className="image-caption">{initialDreamImageCaption}</p>}
            </div>
          ) : (
            <div className="dream-image-section">
              <h4>El Primer Sueño Inspirador del Héroe:</h4>
              <p>La imagen del sueño no pudo ser generada o no está disponible.</p>
              {initialDreamImageCaption && <p className="image-caption fallback-caption">Concepto del sueño: {initialDreamImageCaption}</p>}
            </div>
          )}

          {(protagonistName || archetype || theme) && (
            <div className="profile-details-section">
              <h4>Perfil del Héroe:</h4>
              <div className="profile-details">
                {protagonistName && ( <><h5>Nombre:</h5><p className="profile-name">{protagonistName}</p></> )}
                {archetype && ( <><h5>Arquetipo:</h5><p className="profile-archetype">{archetype}</p></> )}
                {theme && ( <><h5>Tema Central:</h5><p className="profile-theme">{theme}</p></> )}
              </div>
            </div>
          )}

          {preambleText && (
            <div className="preamble-section">
              <h4>El Inicio de su Viaje (narrado por {protagonistName || 'el héroe'}):</h4>
              <div className="preamble-text">
                  {preambleText.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph.trim() || <>&nbsp;</>}</p> 
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {showRegenerateButton && !isGenerating && (
        <div className="regenerate-action-container">
          <button
            onClick={onRegenerateInitialDreamImage}
            className="secondary-action-button regenerate-button"
            disabled={isGenerating}
            aria-label="Intentar generar la imagen del sueño inicial de nuevo"
          >
            Regenerar Imagen del Sueño
          </button>
        </div>
      )}
      
      <button
        onClick={onContinue}
        className="cta-button main-cta-button"
        aria-label="Guardar sueño y volver al inicio"
        disabled={isGenerating || !canSave }
      >
        Guardar Sueño y Volver al Inicio
      </button>
    </section>
  );
};

export default SetupDisplayScreen;