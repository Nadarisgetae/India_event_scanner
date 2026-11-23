import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect } from 'react';

// Mock macro data - in reality this would come from mockApi
const macroItems = [
  { label: 'Nifty 50', value: '24,850', change: '+0.8%', trend: 'up' as const },
  { label: 'Sensex', value: '81,200', change: '+0.7%', trend: 'up' as const },
  { label: 'India VIX', value: '14.2', change: '-0.3', trend: 'down' as const },
  { label: 'USD/INR', value: '83.12', change: '+0.05', trend: 'up' as const },
  { label: 'Brent Crude', value: '$87.50', change: '+1.2%', trend: 'up' as const },
  { label: 'Gold (MCX)', value: '₹72,400', change: '+0.4%', trend: 'up' as const },
  { label: 'US 10Y', value: '4.28%', change: '+3 bps', trend: 'up' as const },
  { label: 'Repo Rate', value: '6.50%', change: '0 bps', trend: 'flat' as const },
];

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3.5 w-3.5 text-bucket-positive" aria-hidden="true" />;
    case 'down':
      return <TrendingDown className="h-3.5 w-3.5 text-bucket-danger" aria-hidden="true" />;
    default:
      return <Minus className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />;
  }
}

export function MacroTicker() {
  useEffect(() => {
    // Inject keyframes once
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ticker {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-ticker {
        display: flex;
        animation: ticker 30s linear infinite;
        width: max-content;
      }
      .animate-ticker:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="no-print bg-surface border-b border-border overflow-hidden" aria-label="Macro indicators ticker">
      <div className="flex animate-ticker">
        {macroItems.flatMap((item, idx) => [
          <div key={`${item.label}-${idx}`} className="flex items-center gap-2 px-6 py-2 whitespace-nowrap shrink-0">
            <span className="font-medium text-text">{item.label}</span>
            <span className="text-mono text-nums font-medium text-text">{item.value}</span>
            <span className={`flex items-center gap-1 text-sm font-medium ${item.trend === 'up' ? 'text-bucket-positive' : item.trend === 'down' ? 'text-bucket-danger' : 'text-text-muted'}`}>
              <TrendIcon trend={item.trend} />
              <span>{item.change}</span>
            </span>
            <div className="w-px h-6 bg-border mx-4" aria-hidden="true" />
          </div>
        ])}
        {/* Duplicate for seamless loop */}
        {macroItems.flatMap((item, idx) => [
          <div key={`${item.label}-dup-${idx}`} className="flex items-center gap-2 px-6 py-2 whitespace-nowrap shrink-0">
            <span className="font-medium text-text">{item.label}</span>
            <span className="text-mono text-nums font-medium text-text">{item.value}</span>
            <span className={`flex items-center gap-1 text-sm font-medium ${item.trend === 'up' ? 'text-bucket-positive' : item.trend === 'down' ? 'text-bucket-danger' : 'text-text-muted'}`}>
              <TrendIcon trend={item.trend} />
              <span>{item.change}</span>
            </span>
            <div className="w-px h-6 bg-border mx-4" aria-hidden="true" />
          </div>
        ])}
      </div>
    </div>
  );
}