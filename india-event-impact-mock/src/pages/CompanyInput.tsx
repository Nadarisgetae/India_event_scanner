import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Chip, Badge } from '@/components';
import { ArrowLeft, Search, Zap, Building2, Shield, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import type { UniverseCompany } from '@/types';

const BENCHMARK_EVENTS: Record<string, string[]> = {
  ASIANPAINT: [
    'Crude oil spikes to $110/bbl on Middle East supply disruption',
    'Rupee depreciates past 85/USD increasing raw material import cost',
    'RBI cuts repo rate by 25 bps stimulating construction activity',
  ],
  TCS: [
    'US imposes 10% reciprocal tariffs on imported goods and cross-border tech services',
    'Rupee depreciates past 85/USD providing FX revenue tailwind',
    'US enters technical recession slowing enterprise software spend',
  ],
  INDIGO: [
    'Crude oil spikes to $110/bbl causing ATF aviation turbine fuel hike',
    'Rupee depreciation increases aircraft lease liabilities in USD',
    'Domestic travel demand surges 18% YoY ahead of festival season',
  ],
  HDFCBANK: [
    'RBI cuts repo rate by 25 bps easing liquidity and credit cycle',
    'RBI tightens unsecured personal loan risk weights by 25%',
    'Credit demand in commercial and retail sector surges 16% YoY',
  ],
  RELIANCE: [
    'Crude oil spikes to $110/bbl boosting upstream and refining GRMs',
    'Petchem margins compress due to global capacity additions in China',
    'Telecom tariff hike of 15-20% improves ARPU across Jio user base',
  ],
  INFY: [
    'US imposes cross-border tech services tariffs',
    'USD/INR moves past 85 boosting offshore margins',
    'Global generative AI enterprise contracts ramp up 40%',
  ],
  default: [
    'Crude oil spikes to $110/bbl on Middle East escalation',
    'US announces 10% tariffs on Indian engineering and textiles',
    'RBI announces surprise 25 bps repo rate cut to 6.25%',
    'Rupee depreciates past 85/USD against the greenback',
  ],
};

export function CompanyInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const [universe, setUniverse] = useState<UniverseCompany[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [eventText, setEventText] = useState('');
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [loadingUniverse, setLoadingUniverse] = useState(true);

  // Load universe
  useEffect(() => {
    const load = async () => {
      const data = await mockApi.getUniverse();
      setUniverse(data);
      setLoadingUniverse(false);

      const navState = location.state as { symbol?: string; eventText?: string } | null;
      if (navState?.symbol) {
        setSelectedSymbol(navState.symbol);
      } else {
        const storedComp = sessionStorage.getItem('mockCompany');
        if (storedComp) {
          setSelectedSymbol(storedComp);
        } else if (data.length > 0) {
          setSelectedSymbol('ASIANPAINT');
        }
      }

      if (navState?.eventText) {
        setEventText(navState.eventText);
      } else {
        const storedHeadline = sessionStorage.getItem('mockHeadline') || sessionStorage.getItem('mockEventText') || sessionStorage.getItem('mockEvent');
        if (storedHeadline) {
          setEventText(storedHeadline);
        }
      }
    };
    load();
  }, []);

  const selectedCompany = useMemo(() => {
    return universe.find(c => c.symbol === selectedSymbol) || null;
  }, [universe, selectedSymbol]);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return universe.slice(0, 16);
    const q = search.toLowerCase();
    return universe.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q)
    );
  }, [universe, search]);

  const sampleEvents = useMemo(() => {
    if (!selectedSymbol) return BENCHMARK_EVENTS.default;
    return BENCHMARK_EVENTS[selectedSymbol] || BENCHMARK_EVENTS.default;
  }, [selectedSymbol]);

  const handleAnalyse = () => {
    if (!selectedSymbol || !eventText.trim()) return;
    sessionStorage.setItem('mockCompany', selectedSymbol);
    sessionStorage.setItem('mockCompanyEvent', eventText);
    sessionStorage.setItem('mockHeadline', eventText);
    sessionStorage.setItem('mockDepth', depth);
    navigate('/company/confirm');
  };

  const depthInfo = {
    quick: { calls: '~8', time: '~3 min' },
    standard: { calls: '~18', time: '~8 min' },
    deep: { calls: '~35', time: '~15 min' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Company Impact + Strategic Plan</h1>
          <p className="text-text-muted">Pick any company from the universe, apply an event, and generate a Defend / Capitalize plan</p>
        </div>
      </div>

      {/* Company Search & Selection */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            1. Select Target Company
          </CardTitle>
          <CardDescription>Search across all {universe.length || '~50'} companies in the tracked universe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, ticker or sector (e.g., Asian Paints, TCS, RELIANCE, Banking)..."
              className="w-full px-4 py-3 pl-10 rounded-md border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 max-h-64 overflow-y-auto pr-1">
            {filteredCompanies.map((c) => {
              const isSelected = selectedSymbol === c.symbol;
              return (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => setSelectedSymbol(c.symbol)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-brand bg-brand-light/40 text-brand shadow-sm ring-1 ring-brand'
                      : 'border-border text-text hover:border-brand/40 hover:bg-surface-2'
                  }`}
                >
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="flex items-center justify-between text-xs text-text-muted mt-1.5">
                    <span className="font-mono font-medium">{c.symbol}</span>
                    <Badge variant="subtle" size="sm" className="text-[10px]">{c.sector}</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCompany && (
            <div className="p-4 bg-surface-2 rounded-lg border border-border/80 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  <span className="font-bold text-text">{selectedCompany.name}</span>
                  <span className="text-xs font-mono text-text-muted">({selectedCompany.symbol})</span>
                  <Badge variant="subtle" size="sm">{selectedCompany.sector}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>Cap: <strong className="capitalize text-text">{selectedCompany.market_cap_bucket}</strong></span>
                  <span>·</span>
                  <span>Resilience: <strong className="capitalize text-text">{selectedCompany.resilience_band}</strong></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedCompany.tags.slice(0, 3).map((tag, idx) => (
                  <Chip key={idx} variant="outline" size="sm" className="text-[11px] bg-surface">
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Input */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            2. Describe the Event
          </CardTitle>
          <CardDescription>Enter a news headline, macro shock, or pick a benchmark event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <textarea
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              rows={3}
              placeholder={selectedCompany ? `e.g. ${sampleEvents[0]}` : 'Select a company first...'}
              disabled={!selectedCompany}
              className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-y disabled:bg-surface-2 disabled:cursor-not-allowed text-sm"
            />
            {/[\u0900-\u097F]/.test(eventText) && (
              <div className="flex items-center gap-1.5 text-xs text-brand font-medium mt-1.5 animate-fadeIn">
                <span className="px-1.5 py-0.5 rounded bg-brand/10 font-bold">हिंदी</span>
                <span>Devanagari detected — will auto-translate to English while preserving tickers and numbers.</span>
              </div>
            )}
          </div>

          {selectedCompany && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Sample Scenarios for {selectedCompany.name}:
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleEvents.map((sample, i) => (
                  <Chip
                    key={i}
                    variant="outline"
                    onClick={() => setEventText(sample)}
                    className="cursor-pointer hover:border-brand hover:text-brand transition-colors text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1 text-brand" />
                    {sample}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-2">Analysis Depth</label>
            <div className="flex flex-wrap gap-3" role="radiogroup">
              {(['quick', 'standard', 'deep'] as const).map((d) => (
                <label
                  key={d}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                    depth === d
                      ? 'border-brand bg-brand-light text-brand ring-1 ring-brand'
                      : 'border-border text-text-muted hover:border-brand/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="depth"
                    value={d}
                    checked={depth === d}
                    onChange={() => setDepth(d)}
                    className="sr-only"
                  />
                  <span className="font-medium capitalize text-sm">{d}</span>
                  <span className="text-xs text-text-muted px-2 py-0.5 rounded bg-surface border border-border">
                    {depthInfo[d].calls} calls · {depthInfo[d].time}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              size="lg"
              fullWidth
              onClick={handleAnalyse}
              disabled={!selectedSymbol || !eventText.trim()}
              className="py-3 font-semibold text-base"
            >
              Continue to Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}