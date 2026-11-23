import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';
    const variantStyles = {
      default: 'bg-surface-2 text-text border border-border',
      outline: 'bg-transparent text-text border border-border',
      subtle: 'bg-surface-2 text-text',
    };
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };

    return (
      <span
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// ============================================
// IMPACT BUCKET BADGES (fixed colours everywhere)
// ============================================

type BucketType = 'danger' | 'negative' | 'neutral' | 'positive' | 'gain';

const bucketConfig: Record<BucketType, { label: string; icon: string; bg: string; border: string; text: string; dot: string }> = {
  danger: {
    label: 'High Danger',
    icon: '⚠',
    bg: 'bg-bucket-danger-bg',
    border: 'border-bucket-danger-border',
    text: 'text-bucket-danger',
    dot: 'bg-bucket-danger',
  },
  negative: {
    label: 'Moderate Negative',
    icon: '▼',
    bg: 'bg-bucket-negative-bg',
    border: 'border-bucket-negative-border',
    text: 'text-bucket-negative',
    dot: 'bg-bucket-negative',
  },
  neutral: {
    label: 'Little / No Effect',
    icon: '●',
    bg: 'bg-bucket-neutral-bg',
    border: 'border-bucket-neutral-border',
    text: 'text-bucket-neutral',
    dot: 'bg-bucket-neutral',
  },
  positive: {
    label: 'Moderate Positive',
    icon: '▲',
    bg: 'bg-bucket-positive-bg',
    border: 'border-bucket-positive-border',
    text: 'text-bucket-positive',
    dot: 'bg-bucket-positive',
  },
  gain: {
    label: 'Massive Gain',
    icon: '★',
    bg: 'bg-bucket-gain-bg',
    border: 'border-bucket-gain-border',
    text: 'text-bucket-gain',
    dot: 'bg-bucket-gain',
  },
};

interface BucketBadgeProps {
  bucket: BucketType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function BucketBadge({ bucket, size = 'md', showIcon = true, showLabel = true, className }: BucketBadgeProps) {
  const config = bucketConfig[bucket];
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };
  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 font-medium rounded-full border', sizeStyles[size], config.bg, config.border, config.text, className)}>
      {showIcon && <span className={clsx(config.dot, 'rounded-full', dotSizes[size])} aria-hidden="true" />}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// Bucket dot only (for inline use in tables, rows, etc.)
export function BucketDot({ bucket, size = 'md' }: { bucket: BucketType; size?: 'sm' | 'md' | 'lg' }) {
  const config = bucketConfig[bucket];
  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };
  return <span className={clsx(config.dot, 'rounded-full', dotSizes[size])} aria-hidden="true" />;
}

// Confidence badge
type ConfidenceLevel = 'high' | 'medium' | 'low';

const confidenceConfig: Record<ConfidenceLevel, { label: string; bg: string; text: string; border: string }> = {
  high: { label: 'High', bg: 'bg-bucket-positive-bg', text: 'text-bucket-positive', border: 'border-bucket-positive-border' },
  medium: { label: 'Medium', bg: 'bg-bucket-negative-bg', text: 'text-bucket-negative', border: 'border-bucket-negative-border' },
  low: { label: 'Low', bg: 'bg-bucket-danger-bg', text: 'text-bucket-danger', border: 'border-bucket-danger-border' },
};

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export function ConfidenceBadge({ level, size = 'md', className }: ConfidenceBadgeProps) {
  const config = confidenceConfig[level];
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
  return (
    <span className={clsx('inline-flex items-center font-medium rounded-full border', sizeStyles[size], config.bg, config.border, config.text, className)}>
      {config.label}
    </span>
  );
}