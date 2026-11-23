import { ReactNode, useState, useContext, createContext } from 'react';
import { clsx } from 'clsx';

interface TabsProps {
  defaultValue: string;
  value?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

type SetStateAction<T> = T | ((prev: T) => T);

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
  variant: 'default' | 'pills' | 'underline';
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
  variant: 'default' | 'pills' | 'underline';
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within Tabs');
  return context;
}

export function Tabs({ defaultValue, value, onChange, children, className, variant = 'default' }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;

  const handleChange = (newValue: string) => {
    if (!controlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange, variant }}>
      <div className={clsx('', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className, 'aria-label': ariaLabel }: TabsListProps) {
  const { variant } = useTabsContext();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx('flex gap-1', variant === 'pills' && 'bg-surface-2 p-1 rounded-md', className)}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, disabled, className }: TabsTriggerProps) {
  const { value: currentValue, onChange, variant } = useTabsContext();
  const isActive = currentValue === value;

  const baseStyles = 'flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantStyles = {
    default: isActive
      ? 'bg-brand text-white shadow-sm'
      : 'text-text-muted hover:text-text hover:bg-surface-2',
    pills: isActive
      ? 'bg-white text-brand shadow-sm'
      : 'text-text-muted hover:text-text',
    underline: isActive
      ? 'text-brand border-b-2 border-brand -mb-px'
      : 'text-text-muted hover:text-text border-b-2 border-transparent',
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      className={clsx(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: currentValue } = useTabsContext();
  const isActive = currentValue === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={clsx('mt-4 animate-fade-in', className)}
    >
      {children}
    </div>
  );
}