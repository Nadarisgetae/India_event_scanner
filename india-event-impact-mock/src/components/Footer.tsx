import { ExternalLink, Info, AlertTriangle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="no-print border-t border-border bg-surface/50 mt-auto" role="contentinfo">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-text-muted">
          <div className="flex items-center gap-3 flex-wrap">
            <span>India Event-Impact Mock UI v0.1.0</span>
            <span className="text-border mx-1" aria-hidden="true">|</span>
            <a
              href="/help"
              className="hover:text-text transition-colors flex items-center gap-1"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              Help & Disclaimer
            </a>
            <span className="text-border mx-1" aria-hidden="true">|</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Source
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-demo-banner" aria-hidden="true" />
            <span>DEMO — All data is fictional/sample. Not for investment decisions.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}