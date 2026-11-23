import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'filled';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant = 'default', size = 'md', removable, onRemove, icon, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-surface-2 text-text border border-border',
      outline: 'bg-transparent text-text border border-border',
      filled: 'bg-brand text-white',
    };
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={clsx('inline-flex items-center font-medium rounded-full', variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={clsx('flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 hover:bg-white/10 transition-colors', size === 'sm' && 'h-4 w-4', 'h-5 w-5')}
            aria-label="Remove"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </span>
    );
  }
);

Chip.displayName = 'Chip';

// Channel chip with strength dots
interface ChannelChipProps {
  channel: string;
  strength: 1 | 2 | 3 | 4 | 5;
  active?: boolean;
  direction?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export function ChannelChip({ channel, strength, active = true, direction = 'neutral', className }: ChannelChipProps) {
  const directionColors = {
    positive: 'text-bucket-positive',
    negative: 'text-bucket-danger',
    neutral: 'text-text-muted',
  };
  const bgColors = {
    positive: 'bg-bucket-positive-bg border-bucket-positive-border',
    negative: 'bg-bucket-danger-bg border-bucket-danger-border',
    neutral: 'bg-surface-2 border-border',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium rounded-full border', bgColors[direction], directionColors[direction], className)}>
      <span className="truncate max-w-[140px]">{channel}</span>
      <span className="flex items-center gap-0.5" aria-label={`Strength: ${strength} out of 5`}>
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            className={clsx(
              'h-1.5 w-1.5 rounded transition-colors',
              level <= strength ? directionColors[direction] : 'bg-border'
            )}
            aria-hidden="true"
          />
        ))}
      </span>
      {!active && <span className="text-[10px] opacity-60">inactive</span>}
    </span>
  );
}