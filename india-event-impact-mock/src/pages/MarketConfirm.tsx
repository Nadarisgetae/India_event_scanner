import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Chip, ChannelChip } from '@/components';
import { ArrowLeft, Loader2, Edit, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockApi } from '@/api/mockApi';
import type { MarketReport, ChannelImpact } from '@/types';

export function MarketConfirm() {
  const navigate = useNavigate();
  const eventText = sessionStorage.getItem('mockEvent') || 'Crude oil spikes to $110 after OPEC+ announces supply cuts';
  const depth = sessionStorage.getItem('mockDepth') || 'standard';
  const initialScenarioId = sessionStorage.getItem('mockScenario') || 'MA-1';

  const [scenarioId, setScenarioId] = useState(initialScenarioId);
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [headline, setHeadline] = useState('');
  const [eventType, setEventType] = useState('commodity_shock');
  const [magnitude, setMagnitude] = useState('high');
  const [duration, setDuration] = useState('medium');
  const [certainty, setCertainty] = useState('high');
  const [direction, setDirection] = useState('negative');

  useEffect(() => {
    let active = true;
    const loadScenario = async () => {
      let id = initialScenarioId;
      if (!id || id === 'undefined') {
        id = await mockApi.matchMarketScenario(eventText);
        setScenarioId(id);
        sessionStorage.setItem('mockScenario', id);
      }
      const data = await mockApi.getMarketScenario(id);
      if (active && data) {
        setReport(data);
        setHeadline(data.event.headline);
        setEventType(data.event.event_type);
        setMagnitude(data.event.magnitude);
        setDuration(data.event.duration);
        setCertainty(data.event.certainty);
        setDirection(data.event.direction_for_india);
      }
      if (active) setLoading(false);
    };
    loadScenario();
    return () => { active = false; };
  }, [eventText, initialScenarioId]);

  const depthInfo = {
    quick: { calls: 6, time: '2 min', companies: '15' },
    standard: { calls: 14, time: '6 min', companies: '50' },
    deep: { calls: 28, time: '12 min', companies: '100+' },
  };

  const info = depthInfo[depth as keyof typeof depthInfo] || depthInfo.standard;

  const handleRun = () => {
    sessionStorage.setItem('mockScenario', scenarioId);
    sessionStorage.setItem('mockEventHeadline', headline);
    navigate('/market/run');
  };

  if (loading || !report) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-text-muted">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-brand" />
        <p>Analyzing event structure...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Confirm Parsed Event</h1>
          <p className="text-text-muted">Review and edit before running simulated pipeline</p>
        </div>
      </div>

      {scenarioId === 'MA-G' && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>Demo Note: Your custom input was mapped to the nearest pre-written scenario (Generic Fallback).</span>
        </div>
      )}

      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Understood Event</CardTitle>
          <CardDescription>Edit any field if the parsing missed specific nuance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Headline</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="commodity_shock">Commodity Shock</option>
                <option value="policy_change">Policy Change</option>
                <option value="geopolitical">Geopolitical</option>
                <option value="monetary_policy">Monetary Policy</option>
                <option value="trade_action">Trade Action</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Geographies</label>
              <div className="flex flex-wrap gap-2">
                {report.event.geographies.map((g) => (
                  <Chip key={g} variant="outline">{g}</Chip>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Magnitude</label>
              <select
                value={magnitude}
                onChange={(e) => setMagnitude(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="short">{'Short-term (<3 months)'}</option>
                <option value="medium">{'Medium-term (3-12 months)'}</option>
                <option value="long">{'Long-term (>12 months)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Certainty</label>
              <select
                value={certainty}
                onChange={(e) => setCertainty(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Direction for India</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-muted mb-2">Key Facts</label>
            <div className="flex flex-wrap gap-2">
              {report.event.key_facts.map((fact, i) => (
                <Chip key={i} variant="outline">{fact}</Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Unknowns</label>
            <div className="flex flex-wrap gap-2">
              {report.event.unknowns.map((u, i) => (
                <Chip key={i} variant="outline" className="bg-bucket-neutral-bg border-bucket-neutral-border text-bucket-neutral">
                  {u}
                </Chip>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Active Transmission Channels</CardTitle>
          <CardDescription>Strength dots indicate channel intensity (1–5)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {report.channels.map((ch: ChannelImpact, i: number) => (
              <ChannelChip
                key={i}
                channel={ch.channel}
                strength={ch.strength as 1 | 2 | 3 | 4 | 5}
                direction={ch.direction === 'mixed' ? 'neutral' : ch.direction}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined" padding="md" className="bg-brand-light/30 border-brand/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text">Estimated Run (Depth: {depth.charAt(0).toUpperCase() + depth.slice(1)})</p>
            <p className="text-sm text-text-muted">
              ~{info.calls} LLM calls · ~{info.time} (simulated) · {info.companies} companies
            </p>
          </div>
          <Button size="lg" onClick={handleRun}>
            Looks Right — Run Analysis
            <Loader2 className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/market')}>
          <Edit className="h-4 w-4" /> Edit Text
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
}