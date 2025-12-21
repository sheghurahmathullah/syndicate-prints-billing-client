import "./ConfirmModal.css";
import { createPortal } from "react-dom";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "btn-primary"
}) => {
  if (!isOpen) return null;

  return typeof document !== "undefined" && createPortal(
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">
            <i className="bi bi-question-circle-fill"></i>
          </div>
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="confirm-modal-footer">
          <button 
            className="btn btn-secondary confirm-modal-btn-cancel" 
            onClick={onClose}
          >
            <i className="bi bi-x-circle"></i> {cancelText}
          </button>
          <button 
            className={`btn ${confirmButtonClass} confirm-modal-btn-confirm`}
            onClick={onConfirm}
          >
            <i className="bi bi-check-circle"></i> {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;

