
import React, { useState, useEffect } from 'react';
import './SettingsScreen.css';

interface SettingsScreenProps {
  currentApiKey: string | null;
  onApiKeySubmit: (apiKey: string) => void;
  onApiKeyClear: () => void;
  onExport: () => void;
  onImportTrigger: () => void;
  onNavigateHome: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentApiKey,
  onApiKeySubmit,
  onApiKeyClear,
  onExport,
  onImportTrigger,
  onNavigateHome,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');

  useEffect(() => {
    setApiKeyInput(currentApiKey || '');
  }, [currentApiKey]);

  const handleSubmitApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    onApiKeySubmit(apiKeyInput.trim());
  };

  const handleClearApiKey = () => {
    onApiKeyClear();
    setApiKeyInput(''); // Clear input field as well
  };
  
  const apiKeyStatus = currentApiKey && currentApiKey.trim() !== "" ? "loaded" : "missing";
  const apiKeyStatusText = apiKeyStatus === "loaded" 
    ? "Clave API cargada y activa." 
    : "Clave API no configurada o no válida.";

  return (
    <section className="settings-screen" aria-labelledby="settings-heading">
      <h2 id="settings-heading">Configuración de DreamLoop</h2>

      <div className="settings-section">
        <h3>Gestión de API Key de Gemini</h3>
        <form onSubmit={handleSubmitApiKey} className="api-key-form">
          <label htmlFor="api-key-input">Tu API Key de Google Gemini:</label>
          <input
            type="password" // Use password type to obscure key
            id="api-key-input"
            className="api-key-input"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Introduce tu API Key aquí"
            aria-describedby="api-key-status-message"
          />
          <div 
            id="api-key-status-message" 
            className={`api-key-status ${apiKeyStatus}`}
            role="status"
          >
            {apiKeyStatusText}
          </div>
          <div className="api-key-actions">
            <button type="submit" className="cta-button" disabled={apiKeyInput.trim() === (currentApiKey || '')}>
              {currentApiKey && currentApiKey.trim() !== "" && apiKeyInput.trim() === currentApiKey.trim() ? 'Clave Guardada' : 'Guardar Clave API'}
            </button>
            {currentApiKey && currentApiKey.trim() !== "" && (
              <button 
                type="button" 
                onClick={handleClearApiKey} 
                className="modal-button modal-button-cancel" // Using cancel style for destructive action
              >
                Limpiar Clave Guardada
              </button>
            )}
          </div>
        </form>
        <p style={{fontSize: '0.9em', color: '#b0a0d0', marginTop: '15px'}}>
          La API Key se guarda localmente en tu navegador. Si no proporcionas una aquí, la aplicación intentará usar una configurada globalmente (vía <code>env.js</code>, si existe).
          Puedes obtener una API Key desde <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color: '#c0b0ff'}}>Google AI Studio</a>.
        </p>
      </div>

      <div className="settings-section">
        <h3>Gestión de Datos de Historias</h3>
        <div className="data-actions">
          <button onClick={onImportTrigger} className="header-action-button" aria-label="Importar historias desde un archivo JSON">
            Importar Historias (.json)
          </button>
          <button onClick={onExport} className="header-action-button" aria-label="Exportar todas las historias a un archivo JSON">
            Exportar Historias (.json)
          </button>
        </div>
        <p style={{fontSize: '0.9em', color: '#b0a0d0', marginTop: '15px'}}>
          Guarda tus aventuras o transfiérelas a otro navegador.
        </p>
      </div>

      <button 
        onClick={onNavigateHome} 
        className="modal-button modal-button-cancel" 
        style={{marginTop: '30px', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
        aria-label="Volver a la pantalla de Mis Sueños"
      >
        Volver a Mis Sueños
      </button>
    </section>
  );
};

export default SettingsScreen;
