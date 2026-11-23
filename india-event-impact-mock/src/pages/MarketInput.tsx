import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Chip } from '@/components';
import { Search, Loader2, ArrowLeft, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_EVENTS = [
  'Crude oil spikes to $110 after OPEC+ announces supply cuts',
  'US imposes 25% tariff on Indian textiles, auto parts, and gems',
  'RBI cuts repo rate by 25 bps to 6.25% citing cooling inflation',
];

import { mockApi } from '@/api/mockApi';

export function MarketInput() {
  const navigate = useNavigate();
  const [eventText, setEventText] = useState(() => {
    return sessionStorage.getItem('mockEvent') || '';
  });
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [url, setUrl] = useState('');

  const handleAnalyse = async () => {
    const text = eventText.trim() || url.trim();
    if (!text) return;
    const scenarioId = await mockApi.matchMarketScenario(text);
    sessionStorage.setItem('mockEvent', text);
    sessionStorage.setItem('mockDepth', depth);
    sessionStorage.setItem('mockScenario', scenarioId);
    navigate('/market/confirm');
  };

  const loadSample = (sample: string) => {
    setEventText(sample);
  };

  const depthInfo = {
    quick: { calls: '~6', time: '~2 min', companies: 'Top 15' },
    standard: { calls: '~14', time: '~6 min', companies: 'Top 50' },
    deep: { calls: '~28', time: '~12 min', companies: 'All 100+' },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Market Impact Analysis</h1>
          <p className="text-text-muted">What does this event do to the Indian market?</p>
        </div>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Describe the Event</CardTitle>
          <CardDescription>Paste a headline, article text, or describe in your own words</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label htmlFor="event-text" className="block text-sm font-medium text-text mb-2">
              Event Text
            </label>
            <textarea
              id="event-text"
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors resize-y"
              placeholder="e.g., Crude oil spikes to $110 after OPEC+ announces supply cuts. Or enter in Hindi (e.g. कच्चे तेल की कीमतों में 20% की बढ़ोतरी)..."
              aria-describedby="event-hint"
            />
            {/[\u0900-\u097F]/.test(eventText) && (
              <div className="flex items-center gap-1.5 text-xs text-brand font-medium mt-1.5 animate-fadeIn">
                <span className="px-1.5 py-0.5 rounded bg-brand/10 font-bold">हिंदी</span>
                <span>Devanagari detected — will auto-translate to English and preserve all tickers and figures.</span>
              </div>
            )}
            <p id="event-hint" className="text-sm text-text-muted mt-1">
              {eventText.length} characters · Minimum 50 characters for analysis
            </p>
          </div>

          <div>
            <label htmlFor="event-url" className="block text-sm font-medium text-text mb-2">
              Or paste a URL (mock fetch)
            </label>
            <div className="relative">
              <input
                id="event-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent pr-10"
                placeholder="https://example.com/news-article"
              />
              {url && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-bucket-positive">
                  <span className="animate-pulse">✓</span> URL fetched (mock)
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Depth Mode</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Analysis depth">
              {(['quick', 'standard', 'deep'] as const).map((d) => (
                <label
                  key={d}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    depth === d
                      ? 'border-brand bg-brand-light text-brand'
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
                    aria-label={d}
                  />
                  <span className="font-medium capitalize">{d}</span>
                  <span className="text-xs text-text-muted px-2 py-0.5 rounded bg-surface">
                    {depthInfo[d].calls} calls · {depthInfo[d].time} · {depthInfo[d].companies}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex flex-wrap gap-2 mb-3">
              {SAMPLE_EVENTS.map((sample, i) => (
                <Chip key={i} variant="outline" onClick={() => loadSample(sample)} className="cursor-pointer hover:bg-brand-light/50">
                  <Zap className="h-3.5 w-3.5" />
                  {sample.slice(0, 30)}...
                </Chip>
              ))}
            </div>
            <div className="flex gap-3">
              <Button size="lg" fullWidth onClick={handleAnalyse} disabled={!eventText.trim() && !url.trim()}>
                Analyse Event
                <Loader2 className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Panel */}
      <Card variant="outlined" padding="md">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Tips for Good Input
        </CardTitle>
        <div className="grid gap-3 md:grid-cols-2 mt-4 text-sm">
          <div className="p-3 bg-bucket-positive-bg border border-bucket-positive-border rounded-lg">
            <p className="font-medium text-bucket-positive mb-1">✓ Good</p>
            <p className="text-text-muted">"Crude oil spikes to $110 after OPEC+ announces 2M bpd supply cuts. Brent futures jump 15% in a week. India imports 85% of oil."</p>
          </div>
          <div className="p-3 bg-bucket-danger-bg border border-bucket-danger-border rounded-lg">
            <p className="font-medium text-bucket-danger mb-1">✗ Avoid</p>
            <p className="text-text-muted">"Oil prices up" — too vague, no magnitude, no context</p>
          </div>
          <div className="p-3 bg-bucket-positive-bg border border-bucket-positive-border rounded-lg">
            <p className="font-medium text-bucket-positive mb-1">✓ Good</p>
            <p className="text-text-muted">"US imposes 25% tariff on Indian textiles, auto parts, gems & jewellery. Effective immediately. India exports $12B/yr in these categories."</p>
          </div>
          <div className="p-3 bg-bucket-danger-bg border border-bucket-danger-border rounded-lg">
            <p className="font-medium text-bucket-danger mb-1">✗ Avoid</p>
            <p className="text-text-muted">"Trade war getting worse" — no specifics, no numbers, no actionable details</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Simple Input component for the textarea
function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}