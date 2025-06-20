
import React from 'react';
import './Header.css'; // Import the new CSS file

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateSettings: () => void; // New prop for settings
  // onExport and onImportTrigger are removed as they move to settings screen
}

// Simple SVG Icon for Settings (Gear-like)
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em', display: 'block' }}>
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateSettings }) => {
  return (
    <header className="app-global-header">
      <button onClick={onNavigateHome} className="header-title-button" aria-label="Volver a la página de inicio">
        <h1>DreamLoop</h1>
      </button>
      <div className="header-actions">
        {/* Import and Export buttons are removed from here */}
        <button onClick={onNavigateSettings} className="header-action-button" aria-label="Abrir configuración de la aplicación">
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
