import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { FileText, Search, Inbox, BarChart2, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'documents' | 'search' | 'inbox' | 'charts' | 'error' | 'warning';
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const icons = {
  documents: FileText,
  search: Search,
  inbox: Inbox,
  charts: BarChart2,
  error: AlertCircle,
  warning: AlertCircle,
};

export function EmptyState({ icon = 'inbox', title, description, action, className, size = 'md' }: EmptyStateProps) {
  const Icon = icons[icon];
  const sizeStyles = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-16',
  };
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };
  const descSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={clsx('flex flex-col items-center text-center px-4', sizeStyles[size], className)}>
      <Icon className={clsx(iconSizes[size], 'text-text-muted/50 mb-4')} aria-hidden="true" />
      <h3 className={clsx('font-medium text-text', titleSizes[size])}>{title}</h3>
      {description && (
        <p className={clsx('text-text-muted mt-2 max-w-md', descSizes[size])}>{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// Pre-built empty states for common scenarios
export const EmptyStates = {
  noReports: () => (
    <EmptyState
      icon="documents"
      title="No reports yet"
      description="Run your first analysis to see reports appear here."
      action={
        <a href="/market" className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors">
          Run Market Analysis
        </a>
      }
    />
  ),

  noSearchResults: (query: string) => (
    <EmptyState
      icon="search"
      title="No results found"
      description={`No matches for "${query}". Try a different search term.`}
    />
  ),

  noHistory: () => (
    <EmptyState
      icon="inbox"
      title="No analysis history"
      description="Your completed analyses will appear here for quick access."
    />
  ),

  noData: (context: string) => (
    <EmptyState
      icon="charts"
      title="No data available"
      description={`Unable to load ${context}. Please try again later.`}
      action={
        <button className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-surface-2 hover:bg-surface transition-colors">
          <RefreshCw className="h-4 w-4 mr-1" /> Retry
        </button>
      }
    />
  ),

  error: (message: string, onRetry?: () => void) => (
    <EmptyState
      icon="error"
      title="Something went wrong"
      description={message}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium rounded-md bg-brand text-white hover:bg-brand-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Try Again
          </button>
        )
      }
    />
  ),
};