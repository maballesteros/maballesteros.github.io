import React, { useState } from 'react';
import { WORLDS } from '../constants';
import type { World } from '../types';
import './WorldSelectionScreen.css'; // Import the new CSS file

interface WorldSelectionScreenProps {
  onSelectWorld: (world: World) => void;
  onCustomWorldSubmit: (customName: string) => void;
  selectedWorldId?: string | null;
}

const WorldSelectionScreen: React.FC<WorldSelectionScreenProps> = ({ 
  onSelectWorld, 
  onCustomWorldSubmit,
  selectedWorldId
}) => {
  const [customWorldName, setCustomWorldName] = useState('');

  const handleWorldButtonClick = (world: World) => {
    onSelectWorld(world);
    if (!world.isCustom) {
      // For predefined worlds, clear any custom input state
      setCustomWorldName('');
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWorldName.trim()) {
      onCustomWorldSubmit(customWorldName.trim());
    }
  };

  const isCustomSelected = WORLDS.find(w => w.id === selectedWorldId)?.isCustom;

  return (
    <section className="world-selection-screen" aria-labelledby="world-select-heading">
      <h2 id="world-select-heading">Elige el Mundo para el Héroe</h2>
      <p>Tu elección inicial definirá el lienzo de su historia. Puedes elegir un mundo predefinido o crear el tuyo.</p>
      <div className="world-options">
        {WORLDS.map((world) => (
          <button
            key={world.id}
            onClick={() => handleWorldButtonClick(world)}
            className={`world-button ${selectedWorldId === world.id ? 'selected' : ''} ${world.isCustom ? 'custom-world-button' : ''}`}
            aria-pressed={selectedWorldId === world.id}
            aria-label={`Seleccionar el mundo: ${world.name}`}
          >
            {world.name}
          </button>
        ))}
      </div>

      {isCustomSelected && (
        <form onSubmit={handleCustomSubmit} className="custom-world-form">
          <label htmlFor="custom-world-name-input" className="custom-world-label">
            Describe tu mundo personalizado:
          </label>
          <input
            type="text"
            id="custom-world-name-input"
            value={customWorldName}
            onChange={(e) => setCustomWorldName(e.target.value)}
            placeholder="Ej: Una ciudad flotante post-apocalíptica..."
            className="custom-world-input"
            required
            maxLength={100}
          />
          <button type="submit" className="cta-button" disabled={!customWorldName.trim()}>
            Continuar con este Mundo
          </button>
        </form>
      )}
    </section>
  );
};

export default WorldSelectionScreen;