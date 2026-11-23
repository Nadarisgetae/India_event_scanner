import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, RefreshCw, Home, WifiOff, Server, ShieldAlert } from 'lucide-react';

interface ErrorStateProps {
  type?: 'generic' | 'network' | 'server' | 'permission' | 'notfound';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

const errorConfigs = {
  generic: {
    icon: AlertTriangle,
    defaultTitle: 'Something went wrong',
    defaultMessage: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: WifiOff,
    defaultTitle: 'Connection lost',
    defaultMessage: 'Unable to connect to the server. Check your internet connection.',
  },
  server: {
    icon: Server,
    defaultTitle: 'Server error',
    defaultMessage: 'The server encountered an error. Our team has been notified.',
  },
  permission: {
    icon: ShieldAlert,
    defaultTitle: 'Access denied',
    defaultMessage: 'You don\'t have permission to access this resource.',
  },
  notfound: {
    icon: Home,
    defaultTitle: 'Page not found',
    defaultMessage: 'The page you\'re looking for doesn\'t exist or has been moved.',
  },
};

export function ErrorState({ type = 'generic', title, message, onRetry, onGoHome, className }: ErrorStateProps) {
  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <div className={clsx('flex flex-col items-center text-center px-4 py-12', className)}>
      <Icon className="h-16 w-16 text-text-muted/50 mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-text mb-2">{title || config.defaultTitle}</h2>
      <p className="text-text-muted max-w-md mb-6">{message || config.defaultMessage}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 text-sm font-medium rounded-md bg-brand text-white hover:bg-brand-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Try Again
          </button>
        )}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-5 py-2.5 text-sm font-medium rounded-md border border-border bg-surface-2 text-text hover:bg-surface transition-colors"
          >
            <Home className="h-4 w-4 mr-1" /> Go Home
          </button>
        )}
      </div>
    </div>
  );
}