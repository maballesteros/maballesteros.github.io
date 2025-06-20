import React from 'react';
import './ErrorMessage.css'; // Import the new CSS file

interface ErrorMessageProps {
  title: string;
  message: React.ReactNode; // Can be string or JSX for more complex messages
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title, message }) => {
  return (
    <div className="error-message" role="alert">
      <h3>{title}</h3>
      {typeof message === 'string' ? <p>{message}</p> : message}
    </div>
  );
};

export default ErrorMessage;