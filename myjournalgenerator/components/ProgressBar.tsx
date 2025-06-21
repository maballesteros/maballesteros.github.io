
import React from 'react';

interface ProgressBarProps {
  progress: number; // Percentage from 0 to 100
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full max-w-md">
      {label && <p className="text-sm text-slate-600 mb-1 text-center">{label}</p>}
      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className="bg-sky-600 h-4 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${safeProgress}%` }}
          role="progressbar"
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      <p className="text-sm text-sky-700 mt-1 text-center font-semibold">{`${Math.round(safeProgress)}%`}</p>
    </div>
  );
};

export default ProgressBar;
