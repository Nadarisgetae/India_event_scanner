import { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info' | 'default';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const typeConfig = {
    success: { icon: CheckCircle, bg: 'bg-bucket-positive-bg border-bucket-positive-border', text: 'text-bucket-positive', iconColor: 'text-bucket-positive' },
    error: { icon: AlertCircle, bg: 'bg-bucket-danger-bg border-bucket-danger-border', text: 'text-bucket-danger', iconColor: 'text-bucket-danger' },
    info: { icon: Info, bg: 'bg-brand-light border-brand/20', text: 'text-brand', iconColor: 'text-brand' },
    default: { icon: Info, bg: 'bg-surface border-border', text: 'text-text', iconColor: 'text-text-muted' },
  };

  const config = typeConfig[toast.type];

  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[280px] max-w-md animate-slide-in-right',
        config.bg,
        config.text
      )}
      role="alert"
    >
      <config.icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{toast.title}</p>
        {toast.message && <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// Add keyframes via a style injection (or use CSS file)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
  `;
  document.head.appendChild(style);
}