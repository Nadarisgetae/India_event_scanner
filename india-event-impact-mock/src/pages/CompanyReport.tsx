import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, BucketBadge, BucketDot, Chip, ChannelChip, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, TableSkeleton } from '@/components';
import { MonteCarloChart } from '@/components/MonteCarloChart';
import { ArrowLeft, Download, RefreshCw, Share2, Building2, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Clock, Eye, FileText, BarChart2, DollarSign, Shield, Target, Zap, ChevronRight, Menu, X, Loader2, CheckSquare, Square } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import { saveStoredReport, getConsideredActions, toggleConsideredAction } from '@/utils/storage';
import type { CompanyReport, CompanyDimensionImpact, ResilienceSnapshot, TechnicalView, NewsSentimentItem, PeerComparison, Scenario, ActionItem, MacroSnapshot } from '@/types';

export function CompanyReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePlanTab, setActivePlanTab] = useState<'all' | 'defend' | 'capitalize'>('all');
  const [consideredActions, setConsideredActions] = useState<Record<string, boolean>>({});

  const handlePlanTabChange = (value: string) => {
    setActivePlanTab(value as 'all' | 'defend' | 'capitalize');
  };

  useEffect(() => {
    const fetchReport = async () => {
      if (id) {
        const data = await mockApi.getCompanyScenario(id);
        setReport(data);
        if (data) {
          setConsideredActions(getConsideredActions(data.id));
          saveStoredReport({
            id: data.id,
            type: 'company',
            title: `${data.company.name} + ${data.event.headline}`,
            company: data.company.symbol,
            date: data.appendix.generated_at.split('T')[0] || new Date().toISOString().split('T')[0],
            depth: data.appendix.depth,
            bucket_counts: { danger: 0, negative: 0, neutral: 0, positive: 0, gain: 0 },
          });
        }
      }
      setLoading(false);
    };
    fetchReport();
  }, [id]);

  const handleToggleConsidered = (actionKey: string) => {
    if (!report) return;
    const updated = toggleConsideredAction(report.id, actionKey);
    setConsideredActions(updated);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <TableSkeleton rows={5} columns={6} />
        <TableSkeleton rows={5} columns={6} />
        <TableSkeleton rows={5} columns={6} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Card variant="default" padding="lg" className="text-center">
          <p className="text-text-muted">Report not found</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/company')}>Back to Company Input</Button>
        </Card>
      </div>
    );
  }

  const trendIcon = (direction: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    switch (direction) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-bucket-positive" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-bucket-danger" />;
      default: return <Minus className="h-4 w-4 text-text-muted" />;
    }
  };

  const impactColor = (impact: number) => {
    if (impact <= -3) return 'text-bucket-danger bg-bucket-danger-bg';
    if (impact < 0) return 'text-bucket-negative bg-bucket-negative-bg';
    if (impact === 0) return 'text-bucket-neutral bg-bucket-neutral-bg';
    if (impact <= 3) return 'text-bucket-positive bg-bucket-positive-bg';
    return 'text-bucket-gain bg-bucket-gain-bg';
  };

  const confidenceBadge = (level: 'high' | 'medium' | 'low') => {
    const config = {
      high: 'bg-bucket-positive-bg text-bucket-positive',
      medium: 'bg-bucket-negative-bg text-bucket-negative',
      low: 'bg-bucket-danger-bg text-bucket-danger',
    };
    return <Badge variant="subtle" size="sm" className={config[level]}>{level.charAt(0).toUpperCase() + level.slice(1)}</Badge>;
  };

  const stanceConfig = {
    defend: { label: 'Defend', icon: <Shield className="h-5 w-5" />, color: 'text-bucket-negative bg-bucket-negative-bg', bg: 'bg-bucket-negative-bg/30 border-bucket-negative-border' },
    capitalize: { label: 'Capitalize', icon: <Target className="h-5 w-5" />, color: 'text-bucket-positive bg-bucket-positive-bg', bg: 'bg-bucket-positive-bg/30 border-bucket-positive-border' },
    both: { label: 'Both', icon: <Zap className="h-5 w-5" />, color: 'text-brand bg-brand-light', bg: 'bg-brand-light/30 border-brand/20' },
  };

  const stance = stanceConfig[report.strategy.stance as keyof typeof stanceConfig] || stanceConfig.both;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" size="sm">Company Impact</Badge>
              <Badge variant="subtle" className="bg-brand-light text-brand">Depth: {report.appendix.depth.charAt(0).toUpperCase() + report.appendix.depth.slice(1)}</Badge>
              <span className="text-xs text-text-muted">{report.id} · {new Date(report.appendix.generated_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-display text-2xl font-bold text-text">{report.company.name} + {report.event.headline} — Impact & Plan</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            if (id) {
              const url = window.location.port === '5173'
                ? `http://localhost:8000/api/v1/reports/${encodeURIComponent(id)}/pdf`
                : `/api/v1/reports/${encodeURIComponent(id)}/pdf`;
              window.open(url, '_blank');
            } else {
              window.print();
            }
          }}><Download className="h-4 w-4" /> Export PDF / Print</Button>
          <Button variant="outline" onClick={() => navigate('/company/confirm')}><RefreshCw className="h-4 w-4" /> Re-run</Button>
          <Button variant="outline" onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Report link copied to clipboard!');
          }}><Share2 className="h-4 w-4" /> Share</Button>
        </div>
      </div>

      {/* Demo watermark */}
      <div className="fixed top-20 right-4 z-10 text-xs text-text-muted/50 rotate-[-15deg] pointer-events-none no-print">
        DEMO — SAMPLE DATA
      </div>

      {/* At a Glance */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                At a Glance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className={`text-center p-4 rounded-lg ${impactColor(report.resilience.score >= 80 ? 3 : report.resilience.score >= 60 ? 1 : -1)}`}>
                <p className="text-3xl font-bold">{report.company.impact_score > 0 ? '+' : ''}{report.company.impact_score.toFixed(1)}</p>
                <p className="text-sm text-text-muted">Net Impact Score</p>
              </div>
              <div className="text-center p-4 bg-surface-2 rounded-lg">
                <p className="text-3xl font-bold text-bucket-positive">{report.resilience.band.charAt(0).toUpperCase() + report.resilience.band.slice(1)}</p>
                <p className="text-sm text-text-muted">Resilience Band</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${stance.bg}`}>
                <p className="text-3xl font-bold">{stance.icon}</p>
                <p className="text-sm text-text-muted">Strategic Stance</p>
                <p className="font-medium capitalize">{report.strategy.stance}</p>
              </div>
              <div className="text-center p-4 bg-surface-2 rounded-lg">
                <p className="text-3xl font-bold text-bucket-positive">High</p>
                <p className="text-sm text-text-muted">Confidence</p>
              </div>
            </CardContent>
          </Card>

          {/* Event & Channels */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                The Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Headline</label>
                  <p className="font-medium text-text">{report.event.headline}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Event Type</label>
                  <p className="font-medium text-text capitalize">{report.event.event_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Magnitude</label>
                  <p className="font-medium text-text capitalize">{report.event.magnitude}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Duration</label>
                  <p className="font-medium text-text capitalize">{report.event.duration}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Certainty</label>
                  <p className="font-medium text-text capitalize">{report.event.certainty}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Direction for India</label>
                  <p className="font-medium text-text capitalize">{report.event.direction_for_india}</p>
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

          {/* Channels Touching Company */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Channels Touching This Company
              </CardTitle>
              <CardDescription>Only channels where the company has meaningful exposure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {report.channels.map((ch, i) => (
                  <ChannelChip key={i} channel={ch.channel} strength={ch.strength as 1 | 2 | 3 | 4 | 5} direction={ch.direction === 'mixed' ? 'neutral' : ch.direction} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Snapshot */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Business Summary</label>
                <p className="text-text-muted">{report.company.business_summary || 'India\'s largest paint company with ~50% market share in decorative paints. Strong distribution network (70k+ dealers), premium brand portfolio, and increasing industrial coatings presence.'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Revenue Mix</label>
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries({ Decorative: 75, Industrial: 25 }).map(([segment, pct]) => (
                    <div key={segment} className="p-3 bg-surface-2 rounded-lg">
                      <p className="text-sm text-text-muted">{segment}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-nums font-medium">{pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Exposure Tags</label>
                <div className="flex flex-wrap gap-2">
                  {['High Input Cost Sensitivity', 'Strong Pricing Power', 'Domestic Focused', 'Raw Material Intensive'].map((tag, i) => (
                    <Chip key={i} variant="outline">{tag}</Chip>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact by Dimension (13 rows) */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Impact by Dimension
              </CardTitle>
              <CardDescription>13 dimensions scored -3 to +3. Expand each row for explanation, evidence, magnitude, timing, confidence.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="px-4 py-3 font-medium">Dimension</th>
                      <th className="px-4 py-3 font-medium text-center">Impact</th>
                      <th className="px-4 py-3 font-medium text-center">Confidence</th>
                      <th className="px-4 py-3 font-medium">Timing</th>
                      <th className="px-4 py-3 font-medium">Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dimensions.map((dim: CompanyDimensionImpact, i) => (
                      <tr key={i} className="border-b border-border hover:bg-surface-2">
                        <td className="px-4 py-3 font-medium text-text">{dim.dimension}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${impactColor(dim.impact)}`}>
                            {dim.impact > 0 ? '+' : ''}{dim.impact}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{confidenceBadge(dim.confidence)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="subtle" size="sm" className="bg-brand-light text-brand">{dim.timing.charAt(0).toUpperCase() + dim.timing.slice(1)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-text-muted max-w-xs truncate" title={dim.explanation}>{dim.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-3">
                {report.dimensions.map((dim: CompanyDimensionImpact, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between p-3 bg-surface-2 rounded-lg cursor-pointer">
                      <span className="font-medium text-text">{dim.dimension}</span>
                      <ChevronRight className="h-5 w-5 text-text-muted group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="p-3 border-t border-border space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div><p className="text-sm text-text-muted">Evidence</p><p className="text-text-muted">{dim.evidence}</p></div>
                        <div><p className="text-sm text-text-muted">Magnitude Estimate</p><p className="font-mono text-text">{dim.magnitude_estimate}</p></div>
                        <div><p className="text-sm text-text-muted">Confidence</p>{confidenceBadge(dim.confidence)}</div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Resilience */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Financial Resilience
              </CardTitle>
              <CardDescription>Score 0-100, band, key ratios, and radar chart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 p-4 bg-surface-2 rounded-lg">
                <div className="text-center">
                  <p className="text-4xl font-bold text-bucket-positive">{report.resilience.score}</p>
                  <p className="text-sm text-text-muted">{report.resilience.band.charAt(0).toUpperCase() + report.resilience.band.slice(1)} Resilience</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text mb-2">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {report.resilience.strengths.map((s, i) => (
                      <Badge key={i} variant="subtle" size="sm" className="bg-bucket-positive-bg text-bucket-positive">{s}</Badge>
                    ))}
                  </div>
                  <p className="font-medium text-text mt-4">Weaknesses</p>
                  <div className="flex flex-wrap gap-1">
                    {report.resilience.weaknesses.map((w, i) => (
                      <Badge key={i} variant="subtle" size="sm" className="bg-bucket-danger-bg text-bucket-danger">{w}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-3">Key Ratios</label>
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                  {Object.entries(report.resilience.ratios).map(([key, val]) => (
                    <div key={key} className="p-3 bg-surface-2 rounded-lg">
                      <p className="text-sm text-text-muted">{key}</p>
                      <p className="font-mono font-medium text-text">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-3">Resilience Radar (Visual)</label>
                <div className="aspect-square bg-surface-2 rounded-lg flex items-center justify-center">
                  <p className="text-text-muted">[Radar Chart Placeholder - Recharts]</p>
                </div>
              </div>

              <div className="p-4 bg-brand-light/30 border border-brand/20 rounded-lg">
                <p className="font-medium text-brand mb-1">Runway View</p>
                <p className="text-text-muted">At current burn rate and FCF generation, the company has {' >'}24 months runway even under worst-case scenario assumptions.</p>
              </div>
            </CardContent>
          </Card>

          {/* Parametric Monte Carlo Simulation */}
          {report.monte_carlo && (
            <MonteCarloChart simulation={report.monte_carlo} symbol={report.company.symbol} />
          )}

          {/* Market View */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Market View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-3">Technical Bias (1D / 1W / 1M)</label>
                <Tabs defaultValue="1D" variant="pills" className="mb-4">
                  <TabsList>
                    {['1D', '1W', '1M'].map((period) => (
                      <TabsTrigger key={period} value={period}>{period}</TabsTrigger>
                    ))}
                  </TabsList>
                  {['1D', '1W', '1M'].map((period) => (
                    <TabsContent key={period} value={period}>
                      <div className="aspect-video bg-surface-2 rounded-lg flex items-center justify-center">
                        <p className="text-text-muted">[Price Chart Placeholder - Recharts {period}]</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="subtle" size="sm" className="bg-bucket-positive-bg text-bucket-positive">Support: ₹3,180</Badge>
                        <Badge variant="subtle" size="sm" className="bg-bucket-negative-bg text-bucket-negative">Resistance: ₹3,320</Badge>
                        <Badge variant="subtle" size="sm" className="bg-brand-light text-brand">Bias: Neutral</Badge>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="p-4 bg-brand-light/30 border border-brand/20 rounded-lg">
                <p className="font-medium text-brand mb-2">Priced-In Check</p>
                <p className="text-text-muted">Market has priced ~60% of crude impact; further downside if Brent sustains {'$115'}. Current valuation fair to slightly expensive vs historical.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-3">News Sentiment (Last 10 Headlines)</label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Headline</th>
                        <th className="px-4 py-2">Source</th>
                        <th className="px-4 py-2">Sentiment</th>
                        <th className="px-4 py-2">Materiality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { headline: 'Asian Paints Q2 FY27: PAT beats estimates; volume growth 8%', source: 'ET', date: '2026-10-20', sentiment: 'positive', materiality: 'high' },
                        { headline: 'Crude at $110: Paint cos stare at margin compression', source: 'BS', date: '2026-10-21', sentiment: 'negative', materiality: 'high' },
                        { headline: 'Asian Paints announces 4% price hike from Nov', source: 'CNBC', date: '2026-10-19', sentiment: 'positive', materiality: 'medium' },
                        { headline: 'Monsoon below normal: Rural demand concern for paints', source: 'Mint', date: '2026-10-18', sentiment: 'negative', materiality: 'medium' },
                        { headline: 'Berger Paints Q2: Margin misses; Asian Paints outperforms', source: 'ET', date: '2026-10-17', sentiment: 'positive', materiality: 'medium' },
                        { headline: 'TiO2 prices surge 15% on China supply constraints', source: 'Reuters', date: '2026-10-16', sentiment: 'negative', materiality: 'high' },
                        { headline: 'Asian Paints expands Tamil Nadu plant; capex ₹1200 cr', source: 'BS', date: '2026-10-15', sentiment: 'positive', materiality: 'low' },
                        { headline: 'Dealer survey: Paint demand steady; price hikes accepted', source: 'Local', date: '2026-10-14', sentiment: 'positive', materiality: 'medium' },
                        { headline: 'Crude oil outlook: Goldman sees $115 by Q1 2027', source: 'Bloomberg', date: '2026-10-13', sentiment: 'negative', materiality: 'high' },
                        { headline: 'Asian Paints declares interim dividend ₹4.5/share', source: 'NSE', date: '2026-10-12', sentiment: 'positive', materiality: 'low' },
                      ].map((item, i) => (
                        <tr key={i} className="border-b border-border hover:bg-surface-2">
                          <td className="px-4 py-3 text-text-muted">{item.date}</td>
                          <td className="px-4 py-3 text-text max-w-md truncate">{item.headline}</td>
                          <td className="px-4 py-3 text-text-muted">{item.source}</td>
                          <td className="px-4 py-3">
                            <Badge variant="subtle" size="sm" className={
                              item.sentiment === 'positive' ? 'bg-bucket-positive-bg text-bucket-positive' :
                              item.sentiment === 'negative' ? 'bg-bucket-danger-bg text-bucket-danger' :
                              'bg-bucket-neutral-bg text-bucket-neutral'
                            }>
                              {item.sentiment}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="subtle" size="sm" className={
                              item.materiality === 'high' ? 'bg-bucket-danger-bg text-bucket-danger' :
                              item.materiality === 'medium' ? 'bg-bucket-negative-bg text-bucket-negative' :
                              'bg-bucket-neutral-bg text-bucket-neutral'
                            }>
                              {item.materiality}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Macro Backdrop */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Macro Backdrop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Nifty 50', value: report.macro_backdrop.nifty.toLocaleString() },
                  { label: 'Sensex', value: report.macro_backdrop.sensex.toLocaleString() },
                  { label: 'India VIX', value: report.macro_backdrop.vix.toFixed(1) },
                  { label: 'USD/INR', value: report.macro_backdrop.usd_inr.toFixed(2) },
                  { label: 'Brent Crude', value: `$${report.macro_backdrop.brent.toFixed(2)}` },
                  { label: 'Gold (MCX)', value: `₹${report.macro_backdrop.gold.toLocaleString()}` },
                  { label: 'US 10Y', value: `${report.macro_backdrop.us10y.toFixed(2)}%` },
                  { label: 'Repo Rate', value: `${report.macro_backdrop.repo_rate.toFixed(2)}%` },
                ].map((item, i) => (
                  <Card key={i} variant="outlined" padding="md" className="text-center">
                    <p className="text-sm text-text-muted">{item.label}</p>
                    <p className="text-xl font-bold text-text">{item.value}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peer Comparison */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Peer Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="px-4 py-3">Peer</th>
                      <th className="px-4 py-3">Impact Score</th>
                      <th className="px-4 py-3">Bucket</th>
                      <th className="px-4 py-3">vs Asian Paints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { symbol: 'BERGEPAINT', name: 'Berger Paints', impact_score: -4.0, bucket: 'negative' as const },
                      { symbol: 'KANSAINER', name: 'Kansai Nerolac', impact_score: -3.5, bucket: 'negative' as const },
                      { symbol: 'AKZOINDIA', name: 'Akzo Nobel India', impact_score: -2.8, bucket: 'negative' as const },
                      { symbol: 'NIPPONPAINT', name: 'Nippon Paint', impact_score: -3.0, bucket: 'negative' as const },
                    ].map((peer, i) => (
                      <tr key={i} className="border-b border-border hover:bg-surface-2">
                        <td className="px-4 py-3">
                          <div className="font-medium text-text">{peer.name}</div>
                          <div className="text-xs text-text-muted">{peer.symbol}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono text-nums">{peer.impact_score > 0 ? '+' : ''}{peer.impact_score.toFixed(1)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <BucketBadge bucket={peer.bucket} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="subtle" size="sm" className="bg-bucket-negative-bg text-bucket-negative">Worse</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Plan — Defend / Capitalize with Interactive Consideration Tracker */}
          <Card variant="default" padding="lg" id="strategic-plan">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-brand" />
                    Strategic Action Plan & Decision Tracker
                  </CardTitle>
                  <CardDescription>
                    Actionable roadmap across horizons. Mark initiatives as considered to track strategic deliberation.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="subtle" className={
                    report.strategy.stance === 'defend' ? 'bg-bucket-negative-bg text-bucket-negative' :
                    report.strategy.stance === 'capitalize' ? 'bg-bucket-positive-bg text-bucket-positive' :
                    'bg-brand-light text-brand'
                  }>
                    Recommended Stance: {report.strategy.stance.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Progress Consideration Banner */}
              {(() => {
                const allList = [
                  ...report.strategy.immediate_0_30d.map(a => ({ ...a, period: 'immediate' })),
                  ...report.strategy.short_term_1_6m.map(a => ({ ...a, period: 'short_term' })),
                  ...report.strategy.long_term_6_24m.map(a => ({ ...a, period: 'long_term' })),
                ];
                const total = allList.length;
                const consideredCount = allList.filter(a => consideredActions[`${a.period}_${a.action}`]).length;
                const pct = total > 0 ? Math.round((consideredCount / total) * 100) : 0;

                return (
                  <div className="mt-4 p-3.5 bg-surface-2 rounded-lg border border-border">
                    <div className="flex items-center justify-between text-xs font-medium text-text mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-brand" />
                        Executive Decision Tracker: <strong>{consideredCount} of {total}</strong> actions evaluated
                      </span>
                      <span className="font-mono text-nums text-text-muted">{pct}%</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-brand transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="all" value={activePlanTab} onChange={handlePlanTabChange} variant="pills" className="mb-6">
                <TabsList aria-label="Plan category filters">
                  <TabsTrigger value="all">
                    <Zap className="h-4 w-4 mr-1.5" />
                    All Initiatives
                  </TabsTrigger>
                  <TabsTrigger value="defend">
                    <Shield className="h-4 w-4 mr-1.5 text-bucket-negative" />
                    Defend (Risk Mitigation)
                  </TabsTrigger>
                  <TabsTrigger value="capitalize">
                    <Target className="h-4 w-4 mr-1.5 text-bucket-positive" />
                    Capitalize (Upside Capture)
                  </TabsTrigger>
                </TabsList>

                {(['all', 'defend', 'capitalize'] as const).map((tabMode) => {
                  const isCapitalize = (a: ActionItem) => {
                    const str = `${a.action} ${a.lever} ${a.why}`.toLowerCase();
                    return str.includes('mix') || str.includes('premium') || str.includes('innovat') ||
                           str.includes('diversif') || str.includes('ramp') || str.includes('jv') ||
                           str.includes('expand') || str.includes('digital') || str.includes('acquir') ||
                           str.includes('share') || str.includes('international');
                  };

                  const filterByTab = (actions: ActionItem[]) => {
                    if (tabMode === 'all') return actions;
                    if (tabMode === 'capitalize') return actions.filter(isCapitalize);
                    return actions.filter(a => !isCapitalize(a));
                  };

                  const immediateFiltered = filterByTab(report.strategy.immediate_0_30d);
                  const shortTermFiltered = filterByTab(report.strategy.short_term_1_6m);
                  const longTermFiltered = filterByTab(report.strategy.long_term_6_24m);

                  const periods = [
                    { label: 'Immediate (0–30 Days)', periodKey: 'immediate', actions: immediateFiltered },
                    { label: 'Short-Term (1–6 Months)', periodKey: 'short_term', actions: shortTermFiltered },
                    { label: 'Long-Term (6–24 Months)', periodKey: 'long_term', actions: longTermFiltered },
                  ];

                  return (
                    <TabsContent key={tabMode} value={tabMode}>
                      <div className="grid gap-6 md:grid-cols-3">
                        {periods.map(({ label, periodKey, actions }) => (
                          <div key={periodKey} className="bg-surface-2/70 rounded-xl p-4 border border-border/80 flex flex-col">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                              <p className="font-semibold text-text text-sm">{label}</p>
                              <Badge variant="subtle" size="sm" className="font-mono text-[11px]">
                                {actions.length} {actions.length === 1 ? 'task' : 'tasks'}
                              </Badge>
                            </div>

                            {actions.length === 0 ? (
                              <p className="text-xs text-text-muted py-6 text-center italic">No {tabMode} actions in this timeframe.</p>
                            ) : (
                              <div className="space-y-3.5 flex-1">
                                {actions.map((action: ActionItem, i) => {
                                  const actionKey = `${periodKey}_${action.action}`;
                                  const isConsidered = !!consideredActions[actionKey];
                                  const capitalizeAction = isCapitalize(action);

                                  return (
                                    <Card
                                      key={i}
                                      variant="outlined"
                                      padding="md"
                                      className={`transition-all ${
                                        isConsidered
                                          ? 'border-bucket-positive-border bg-bucket-positive-bg/20 shadow-sm'
                                          : 'border-border bg-surface'
                                      }`}
                                    >
                                      <div className="space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                              <Badge variant="subtle" size="sm" className={
                                                capitalizeAction
                                                  ? 'bg-bucket-positive-bg text-bucket-positive text-[10px]'
                                                  : 'bg-brand-light text-brand text-[10px]'
                                              }>
                                                {capitalizeAction ? 'Capitalize' : 'Defend'} · {action.lever}
                                              </Badge>
                                            </div>
                                            <p className={`font-semibold text-sm leading-snug ${isConsidered ? 'text-bucket-positive' : 'text-text'}`}>
                                              {action.action}
                                            </p>
                                          </div>
                                        </div>

                                        <p className="text-xs text-text-muted leading-relaxed">{action.why}</p>

                                        <div className="flex flex-wrap gap-1.5 text-[11px] text-text-muted">
                                          <span className="px-2 py-0.5 bg-surface-2 rounded border border-border">
                                            Owner: <strong className="text-text">{action.owner}</strong>
                                          </span>
                                          <span className="px-2 py-0.5 bg-surface-2 rounded border border-border capitalize">
                                            Effort: <strong className="text-text">{action.cost_effort}</strong>
                                          </span>
                                        </div>

                                        <div className="pt-2 border-t border-border/80 text-xs space-y-1">
                                          <div>
                                            <span className="text-text-muted font-medium">Effect: </span>
                                            <span className="text-text">{action.expected_effect}</span>
                                          </div>
                                          <div>
                                            <span className="text-text-muted font-medium">Risk: </span>
                                            <span className="text-text">{action.risk}</span>
                                          </div>
                                        </div>

                                        <div className="pt-2">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleConsidered(actionKey)}
                                            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold transition-colors ${
                                              isConsidered
                                                ? 'bg-bucket-positive text-white'
                                                : 'bg-surface-2 text-text-muted hover:text-text hover:bg-surface border border-border'
                                            }`}
                                          >
                                            {isConsidered ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                                            {isConsidered ? 'Evaluated & Considered ✓' : 'Mark as Considered'}
                                          </button>
                                        </div>
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* KPIs & Trigger Points */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                KPIs & Trigger Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-3">KPIs to Track</label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="px-4 py-2">KPI</th>
                        <th className="px-4 py-2">Target</th>
                        <th className="px-4 py-2">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.strategy.kpis_to_track.map((kpi, i) => (
                        <tr key={i} className="border-b border-border hover:bg-surface-2">
                          <td className="px-4 py-3 font-medium text-text">{kpi.kpi}</td>
                          <td className="px-4 py-3 font-mono text-text">{kpi.target}</td>
                          <td className="px-4 py-3 text-text-muted">{kpi.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-3">Trigger Points (If X → Switch to Y)</label>
                <div className="space-y-2">
                  {report.strategy.trigger_points.map((trigger, i) => (
                    <Card key={i} variant="outlined" padding="md" className="bg-bucket-negative-bg/30 border-bucket-negative-border">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-bucket-negative" />
                        <div className="flex-1">
                          <p className="font-medium text-text">{trigger.condition}</p>
                          <p className="text-sm text-text-muted">→ Switch plan: {trigger.then_switch_to}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Risks & Assumptions */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Plan Risks & Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="font-medium text-text mb-2">Plan Risks</p>
                <ul className="list-disc list-inside space-y-1 text-text-muted">
                  {report.strategy.plan_risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-medium text-text mb-2">Key Assumptions</p>
                <ul className="list-disc list-inside space-y-1 text-text-muted">
                  {report.strategy.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Plan Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.scenarios.map((scenario: Scenario, i) => (
                <Card key={i} variant="outlined" padding="md" className={
                  scenario.name === 'best' ? 'border-bucket-positive-border bg-bucket-positive-bg/30' :
                  scenario.name === 'worst' ? 'border-bucket-danger-border bg-bucket-danger-bg/30' :
                  'border-border'
                }>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="subtle" size="sm" className={
                          scenario.name === 'best' ? 'bg-bucket-positive-bg text-bucket-positive' :
                          scenario.name === 'worst' ? 'bg-bucket-danger-bg text-bucket-danger' :
                          'bg-brand-light text-brand'
                        }>
                          {scenario.name.charAt(0).toUpperCase() + scenario.name.slice(1)} Case
                        </Badge>
                      </div>
                      <p className="text-text-muted">{scenario.narrative}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-text mb-1">Triggers:</p>
                        <div className="flex flex-wrap gap-1">
                          {scenario.triggers.map((t, ti) => (
                            <Chip key={ti} variant="outline" size="sm">{t}</Chip>
                          ))}
                        </div>
                      </div>
                      {scenario.bucket_shifts.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-text mb-1">Bucket Shifts:</p>
                          <div className="flex flex-wrap gap-1">
                            {scenario.bucket_shifts.map((shift, si) => (
                              <Chip key={si} variant="outline" size="sm">
                                {shift.symbol}: {shift.from} {'\u2192'} {shift.to}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Historical Analogues */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historical Analogues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.analogues.map((analogue, i) => (
                <Card key={i} variant="outlined" padding="md">
                  <p className="font-medium text-text">{analogue.event}</p>
                  <p className="text-sm text-text-muted">{analogue.date}</p>
                  <p className="text-text-muted mt-1">{analogue.outcome}</p>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card variant="default" padding="lg" className="bg-bucket-negative-bg border-bucket-negative-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-text-muted">
                {report.limitations.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </CardContent>
          </Card>

          {/* Appendix */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Appendix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium text-text mb-2">Models Used</p>
                  <ul className="list-disc list-inside space-y-1 text-text-muted text-sm">
                    {report.appendix.models_used.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-text mb-2">Prompt Versions</p>
                  <ul className="list-disc list-inside space-y-1 text-text-muted text-sm">
                    {report.appendix.prompt_versions.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-text mb-2">Generation Stats</p>
                  <ul className="list-disc list-inside space-y-1 text-text-muted text-sm">
                    <li>LLM Calls: {report.appendix.call_count}</li>
                    <li>Generation Time: {report.appendix.generation_time_seconds}s</li>
                    <li>Depth: {report.appendix.depth}</li>
                    <li>Generated: {new Date(report.appendix.generated_at).toLocaleString()}</li>
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t border-border p-4 bg-surface-2 rounded-lg text-sm text-text-muted">
                <strong>Disclaimer:</strong> This report contains simulated/sample data only. Not for investment decisions. See Help → Disclaimer.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky TOC */}
        <div className="hidden lg:block">
          <Card variant="default" padding="lg" className="sticky top-24 h-fit">
            <CardTitle className="text-sm">Table of Contents</CardTitle>
            <nav className="mt-4 space-y-2 text-sm">
              {[
                'At a Glance',
                'Event & Channels',
                'Company Snapshot',
                'Impact by Dimension',
                'Financial Resilience',
                'Market View',
                'Macro Backdrop',
                'Peer Comparison',
                'Defend Plan',
                'Capitalize Plan',
                'KPIs & Triggers',
                'Plan Risks',
                'Scenarios',
                'Analogues',
                'Limitations',
                'Appendix',
              ].map((item, i) => (
                <a key={i} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="block py-1 text-text-muted hover:text-brand transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </Card>
        </div>
      </div>
    </div>
  );
}