import React from 'react';
import type { ModalState } from '../types';
import './ModalComponent.css'; // Import the new CSS file

interface ModalComponentProps extends ModalState {
  onClose: () => void;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  isOpen,
  title,
  message,
  type,
  confirmText = "Confirmar",
  onConfirm,
  cancelText = "Cancelar",
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Cerrar modal">&times;</button>
        </header>
        <div className="modal-body">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <footer className="modal-actions">
          {type === 'confirm' && onCancel && (
            <button onClick={handleCancel} className="modal-button modal-button-cancel">
              {cancelText}
            </button>
          )}
          {(type === 'alert' || (type === 'confirm' && onConfirm)) && (
             <button onClick={handleConfirm} className="modal-button modal-button-confirm">
              {type === 'alert' ? (confirmText || 'OK') : confirmText}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ModalComponent;