import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, AlertTriangle, ExternalLink, ArrowRight, Filter, 
  Search, ShieldAlert, CheckCircle2, Clock, RefreshCw, FileText 
} from 'lucide-react';
import { apiClient } from '@/api/client';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

export function ExchangeFilings() {
  const navigate = useNavigate();
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'NSE' | 'BSE'>('ALL');
  const [highImpactOnly, setHighImpactOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFilings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.fetchFilings(
        exchangeFilter === 'ALL' ? undefined : exchangeFilter,
        highImpactOnly
      );
      setFilings(data.announcements || []);
    } catch (e) {
      console.error('Failed to load exchange filings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilings();
  }, [exchangeFilter, highImpactOnly]);

  const handleScanFiling = (filing: any) => {
    // Navigate to CompanyInput pre-filled with this corporate filing
    navigate('/company', {
      state: {
        symbol: filing.symbol,
        eventText: `${filing.headline}: ${filing.summary}`,
      }
    });
  };

  const filteredFilings = filings.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.symbol.toLowerCase().includes(q) ||
      f.company_name.toLowerCase().includes(q) ||
      f.headline.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });

  const getScoreBadge = (score: number) => {
    if (score >= 8) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/30 font-mono">{score}/10 High</span>;
    }
    if (score >= 6) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/30 font-mono">{score}/10 Med</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-alt text-muted-foreground border border-border font-mono">{score}/10 Info</span>;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand/10 text-brand">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Exchange Filings Watcher
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time monitoring of corporate circulars, USFDA inspections, and regulatory disclosures from BSE & NSE.
            </p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadFilings} 
          disabled={loading}
          className="self-start sm:self-center gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Exchange:
            </span>
            {(['ALL', 'NSE', 'BSE'] as const).map((ex) => (
              <button
                key={ex}
                onClick={() => setExchangeFilter(ex)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                  exchangeFilter === ex
                    ? 'bg-brand text-brand-foreground shadow-sm'
                    : 'bg-surface-alt hover:bg-surface border border-border text-muted-foreground'
                }`}
              >
                {ex}
              </button>
            ))}

            <div className="h-4 w-px bg-border mx-2 hidden sm:block" />

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground select-none">
              <input
                type="checkbox"
                checked={highImpactOnly}
                onChange={(e) => setHighImpactOnly(e.target.checked)}
                className="rounded border-border text-brand focus:ring-brand/40"
              />
              High Materiality Only (≥7/10)
            </label>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by symbol, topic, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
        </div>
      </Card>

      {/* Filings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand" />
            <p className="text-xs font-medium">Scanning exchange announcement gateways...</p>
          </div>
        ) : filteredFilings.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No corporate announcements match your criteria</p>
            <p className="text-xs mt-1">Try toggling off the High Materiality filter or resetting your search term.</p>
          </Card>
        ) : (
          filteredFilings.map((filing) => (
            <Card key={filing.id} className="p-5 hover:border-brand/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{filing.symbol}</span>
                  <span className="text-xs text-muted-foreground">• {filing.company_name}</span>
                  <Badge variant="subtle" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                    {filing.exchange}
                  </Badge>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-alt border border-border text-foreground font-medium">
                    {filing.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">Materiality:</span>
                  {getScoreBadge(filing.materiality_score)}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug">
                {filing.headline}
              </h3>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {filing.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/80">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Today
                  </span>
                  {filing.attachment_url && (
                    <a
                      href={filing.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Exchange PDF
                    </a>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleScanFiling(filing)}
                  className="gap-1.5 text-xs"
                >
                  Analyze with Mode B
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
export default ExchangeFilings;
