import React from 'react';
import './Spinner.css'; // Import the new CSS file

interface SpinnerProps {
  ariaLabel?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ ariaLabel = "Cargando..." }) => {
  return <div className="spinner" role="status" aria-label={ariaLabel}></div>;
};

export default Spinner;