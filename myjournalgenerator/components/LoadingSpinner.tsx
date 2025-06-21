
import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      <p className="mt-4 text-sky-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
    