import { useState, useEffect } from 'react';
import { X, CheckCircle2, Cpu } from 'lucide-react';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem('demoBannerDismissed');
    if (sessionDismissed === 'true') {
      setDismissed(true);
    }

    // Health check against Python backend
    fetch('http://localhost:8000/api/v1/health')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.status === 'healthy') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('demoBannerDismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div
      className="no-print sticky top-0 z-30 bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 text-emerald-200"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30"
            aria-hidden="true"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {backendStatus === 'connected' ? 'LIVE BACKEND ACTIVE' : 'FASTAPI BACKEND READY'}
          </span>
          <span className="text-emerald-100/90 text-xs sm:text-sm flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            Connected to Python Engine v2.4 (OpenRouter Zero-Price Free Models & Indian Market Feeds)
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-emerald-500/20 transition-colors text-emerald-300 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
