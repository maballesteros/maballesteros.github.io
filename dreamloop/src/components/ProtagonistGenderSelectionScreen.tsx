import React, { useState } from 'react';
import './ProtagonistGenderSelectionScreen.css'; // Import the new CSS file

interface ProtagonistGenderSelectionScreenProps {
  worldName: string;
  onSubmit: (gender: string) => void;
}

const GENDER_OPTIONS = [
  { label: 'Masculino', value: 'Masculino' },
  { label: 'Femenino', value: 'Femenino' },
  { label: 'Otro', value: 'Otro' },
];

const ProtagonistGenderSelectionScreen: React.FC<ProtagonistGenderSelectionScreenProps> = ({ worldName, onSubmit }) => {
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [customGender, setCustomGender] = useState<string>('');

  const handleGenderSelect = (genderValue: string) => {
    setSelectedGender(genderValue);
    if (genderValue !== 'Otro') {
      setCustomGender(''); // Clear custom input if a predefined option is chosen
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGender === 'Otro') {
      if (customGender.trim()) {
        onSubmit(customGender.trim());
      } else {
        // Optionally show an error or prompt to enter custom gender
        alert("Por favor, especifica el género personalizado.");
      }
    } else if (selectedGender) {
      onSubmit(selectedGender);
    }
  };

  const canSubmit = selectedGender && (selectedGender !== 'Otro' || (selectedGender === 'Otro' && customGender.trim() !== ''));

  return (
    <section className="gender-selection-screen" aria-labelledby="gender-select-heading">
      <h2 id="gender-select-heading">Define el Género del Protagonista</h2>
      <p>Esta elección ayudará a dar forma a la identidad de tu héroe en el mundo de {worldName}.</p>
      <form onSubmit={handleSubmit}>
        <div className="gender-options" role="radiogroup" aria-labelledby="gender-select-heading">
          {GENDER_OPTIONS.map(opt => (
            <button
              type="button"
              key={opt.value}
              onClick={() => handleGenderSelect(opt.value)}
              className={`gender-button ${selectedGender === opt.value ? 'selected' : ''}`}
              aria-pressed={selectedGender === opt.value}
              role="radio"
              aria-checked={selectedGender === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectedGender === 'Otro' && (
          <div className="gender-custom-input-container">
            <label htmlFor="custom-gender-input" className="custom-world-label" style={{marginBottom: '5px'}}>
              Por favor, especifica:
            </label>
            <input
              type="text"
              id="custom-gender-input"
              value={customGender}
              onChange={(e) => setCustomGender(e.target.value)}
              placeholder="Ej: No binario, Agénero..."
              className="gender-custom-input"
              maxLength={50}
            />
          </div>
        )}

        <button type="submit" className="cta-button" disabled={!canSubmit} aria-label="Confirmar género y continuar">
          Confirmar Género y Continuar
        </button>
      </form>
    </section>
  );
};

export default ProtagonistGenderSelectionScreen;