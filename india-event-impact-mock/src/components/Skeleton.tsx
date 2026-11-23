import { clsx } from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ className, variant = 'text', width, height, lines = 1, ...props }: SkeletonProps) {
  if (variant === 'circular') {
    return <div className={clsx('animate-pulse rounded-full bg-surface-2', className)} style={{ width, height }} {...props} />;
  }

  if (variant === 'rectangular') {
    return <div className={clsx('animate-pulse rounded-md bg-surface-2', className)} style={{ width, height }} {...props} />;
  }

  if (variant === 'card') {
    return (
      <div className={clsx('animate-pulse bg-surface border border-border rounded-lg', className)} {...props}>
        <div className="h-8 bg-surface-2 rounded mb-3" style={{ width: '60%' }} />
        <div className="h-4 bg-surface-2 rounded mb-2" style={{ width: '40%' }} />
        <div className="h-4 bg-surface-2 rounded mb-2" style={{ width: '80%' }} />
        <div className="h-4 bg-surface-2 rounded" style={{ width: '50%' }} />
      </div>
    );
  }

  // Text lines variant
  return (
    <div className={clsx('animate-pulse space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-2 rounded"
          style={{
            width: i === lines - 1 && lines > 1 ? '70%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-surface-2 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

// Table skeleton with multiple rows
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 bg-surface-2 rounded w-3/4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRowSkeleton key={rowIdx} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}