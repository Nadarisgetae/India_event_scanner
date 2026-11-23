import { Fragment, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'right' | 'left';
  showClose?: boolean;
}

export function Drawer({ isOpen, onClose, title, description, children, size = 'lg', position = 'right', showClose = true }: DrawerProps) {
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
    sm: 'w-72',
    md: 'w-96',
    lg: 'w-[480px]',
    xl: 'w-[640px]',
    full: 'w-[90vw] max-w-[720px]',
  };

  const positionStyles = {
    right: 'right-0',
    left: 'left-0',
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby={title ? 'drawer-title' : undefined} aria-describedby={description ? 'drawer-description' : undefined}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={clsx(
          'fixed top-0 bottom-0 bg-surface border-l border-border shadow-xl animate-slide-in',
          sizeStyles[size],
          positionStyles[position]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-border sticky top-0 bg-surface/95 backdrop-blur-sm z-10">
            <div>
              {title && <h2 id="drawer-title" className="text-lg font-semibold text-text">{title}</h2>}
              {description && <p id="drawer-description" className="text-sm text-text-muted mt-1">{description}</p>}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}