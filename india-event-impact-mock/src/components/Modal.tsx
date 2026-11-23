import { Fragment, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', showClose = true }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined} aria-describedby={description ? 'modal-description' : undefined}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={clsx('relative w-full bg-surface rounded-xl shadow-xl animate-slide-up', sizeStyles[size])}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
            <div>
              {title && <h2 id="modal-title" className="text-lg font-semibold text-text">{title}</h2>}
              {description && <p id="modal-description" className="text-sm text-text-muted mt-1">{description}</p>}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary', loading }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-text-muted mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium rounded-md bg-surface-2 text-text hover:bg-surface border border-border transition-colors">
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx('px-4 py-2 text-sm font-medium rounded-md transition-colors', variant === 'danger' ? 'bg-bucket-danger text-white hover:bg-bucket-danger/90' : 'bg-brand text-white hover:bg-brand-hover')}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}