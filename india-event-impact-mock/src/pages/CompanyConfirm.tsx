import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, ChannelChip, Skeleton } from '@/components';
import { ArrowLeft, Loader2, Edit, CheckCircle, AlertTriangle, Building2, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import type { UniverseCompany, ExposureProfile } from '@/types';

export function CompanyConfirm() {
  const navigate = useNavigate();
  const symbol = sessionStorage.getItem('mockCompany') || 'ASIANPAINT';
  const eventText = sessionStorage.getItem('mockCompanyEvent') || 'Crude oil spikes to $110/bbl on Middle East supply disruption';
  const depth = (sessionStorage.getItem('mockDepth') as 'quick' | 'standard' | 'deep') || 'standard';

  const [company, setCompany] = useState<UniverseCompany | null>(null);
  const [profile, setProfile] = useState<ExposureProfile | null>(null);
  const [scenarioId, setScenarioId] = useState<string>('MB-1');
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [compData, profData, matchedId] = await Promise.all([
        mockApi.getCompany(symbol),
        mockApi.getExposureProfile(symbol),
        mockApi.matchCompanyScenario(symbol, eventText),
      ]);

      setCompany(compData);
      setProfile(profData);
      setScenarioId(matchedId);
      setIsFallback(!['MB-1', 'MB-2', 'MB-3', 'MB-4'].includes(matchedId));
      setLoading(false);
    };
    init();
  }, [symbol, eventText]);

  const handleRun = () => {
    sessionStorage.setItem('mockCompanyScenario', scenarioId);
    sessionStorage.setItem('mockCompany', symbol);
    sessionStorage.setItem('mockCompanyEvent', eventText);
    sessionStorage.setItem('mockDepth', depth);
    navigate('/company/run');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  // Active channels inferred from profile tags and scenario
  const channels = [
    { name: 'Input Costs (Raw Materials)', strength: 5 as const, direction: 'negative' as const },
    { name: 'Pricing Power & Margins', strength: 4 as const, direction: 'positive' as const },
    { name: 'Currency / INR Fluctuation', strength: 3 as const, direction: 'negative' as const },
    { name: 'Consumer Demand & Elasticity', strength: 2 as const, direction: 'negative' as const },
  ];

  const untouchedChannels = [
    { name: 'Direct Regulatory Mandates', strength: 1 as const, direction: 'neutral' as const },
    { name: 'Trade / Tariffs Barrier', strength: 1 as const, direction: 'neutral' as const },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/company')} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Confirm Company Analysis</h1>
          <p className="text-text-muted">Review company exposure intersection and analysis settings</p>
        </div>
      </div>

      {isFallback && (
        <Card variant="outlined" padding="md" className="bg-bucket-neutral-bg border-bucket-neutral-border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-bucket-neutral flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text text-sm">Dynamic Scenario Synthesis (Template Mode)</p>
              <p className="text-xs text-text-muted mt-0.5">
                No pre-computed static scenario matched "{eventText}". The system will generate a contextual 15-section Company Deep Dive plan calibrated for <strong>{company?.name || symbol}</strong>.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Company Snapshot */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand" />
                {company?.name || symbol} ({symbol})
              </CardTitle>
              <CardDescription>{company?.sector} · Market Cap: {company?.market_cap_bucket.toUpperCase()}</CardDescription>
            </div>
            <Badge variant="subtle" size="md" className="bg-brand-light text-brand font-mono">
              {scenarioId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="text-text-muted font-medium mb-1">Revenue Breakdown</p>
              {profile?.revenue_mix ? (
                <div className="space-y-1">
                  {Object.entries(profile.revenue_mix).map(([seg, pct]) => (
                    <div key={seg} className="flex justify-between text-xs">
                      <span className="text-text-muted truncate max-w-[120px]">{seg}:</span>
                      <span className="font-mono font-semibold">{pct}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">Core operations: 80% · Ancillary: 20%</p>
              )}
            </div>

            <div>
              <p className="text-text-muted font-medium mb-1">Exposure Profile</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(profile?.exposure_tags || company?.tags || ['Input Cost Sensitive', 'Domestic Focused']).slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="subtle" size="sm" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-text-muted font-medium mb-1">Resilience Band</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4 text-bucket-positive" />
                <span className="font-bold text-bucket-positive capitalize">
                  {company?.resilience_band || 'High'} Resilience
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event + Transmission Channels */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand" />
            Event Transmission & Exposure Intersection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-3.5 bg-surface-2 rounded-lg border border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Event Prompt</p>
            <p className="text-text font-medium text-sm leading-relaxed">{eventText}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
              Active Transmission Channels Touching This Company
            </label>
            <div className="flex flex-wrap gap-2.5">
              {channels.map((ch, i) => (
                <ChannelChip key={i} channel={ch.name} strength={ch.strength} direction={ch.direction} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
              Channels Without Material Direct Impact
            </label>
            <div className="flex flex-wrap gap-2.5">
              {untouchedChannels.map((ch, i) => (
                <ChannelChip key={i} channel={ch.name} strength={ch.strength} direction={ch.direction} active={false} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation & Run CTA */}
      <Card variant="outlined" padding="md" className="bg-brand-light/30 border-brand/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-text">Ready to run Company Deep Dive</p>
            <p className="text-xs text-text-muted mt-0.5">
              Depth: <span className="capitalize font-medium text-text">{depth}</span> · Pipeline: 9 steps · Generates Defend & Capitalize Action Items
            </p>
          </div>
          <Button size="lg" onClick={handleRun} className="font-semibold">
            Looks Right — Run Deep Dive
            <CheckCircle className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/company')}>
          <Edit className="h-4 w-4" /> Edit Inputs
        </Button>
      </div>
    </div>
  );
}