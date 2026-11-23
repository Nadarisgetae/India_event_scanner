import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, BucketBadge, BucketDot, Chip, ChannelChip, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, TableSkeleton, Drawer } from '@/components';
import { ArrowLeft, Download, RefreshCw, Share2, ChevronRight, BarChart2, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Clock, Eye, FileText, Building2, Filter, X, ExternalLink } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import { saveStoredReport } from '@/utils/storage';
import type { MarketReport, SectorImpact, CompanyImpact, ChannelImpact, Scenario, MacroImpactField } from '@/types';

export function MarketReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyImpact | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (id) {
        const data = await mockApi.getMarketScenario(id);
        setReport(data);
        if (data) {
          const counts = { danger: 0, negative: 0, neutral: 0, positive: 0, gain: 0 };
          [...data.companies, ...data.uncertain].forEach(c => {
            if (counts[c.bucket] !== undefined) {
              counts[c.bucket]++;
            }
          });
          saveStoredReport({
            id: data.id,
            type: 'market',
            title: data.event.headline,
            date: data.appendix.generated_at.split('T')[0] || new Date().toISOString().split('T')[0],
            depth: data.appendix.depth,
            bucket_counts: counts,
          });
        }
      }
      setLoading(false);
    };
    fetchReport();
  }, [id]);

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
          <Button variant="primary" className="mt-4" onClick={() => navigate('/market')}>Back to Market Input</Button>
        </Card>
      </div>
    );
  }

  const trendIcon = (direction: MacroImpactField['direction']) => {
    switch (direction) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-bucket-positive" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-bucket-danger" />;
      case 'mixed': return <Minus className="h-4 w-4 text-text-muted" />;
      default: return <Minus className="h-4 w-4 text-text-muted" />;
    }
  };

  const directionColor = (direction: MacroImpactField['direction']) => {
    switch (direction) {
      case 'positive': return 'text-bucket-positive';
      case 'negative': return 'text-bucket-danger';
      case 'mixed': return 'text-bucket-negative';
      default: return 'text-text-muted';
    }
  };

  const bucketCounts = report.companies.reduce((acc, c) => {
    acc[c.bucket] = (acc[c.bucket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bucketCountsWithUncertain = { ...bucketCounts };
  report.uncertain.forEach(c => {
    bucketCountsWithUncertain[c.bucket] = (bucketCountsWithUncertain[c.bucket] || 0) + 1;
  });

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
              <Badge variant="outline" size="sm">Market Impact</Badge>
              <Badge variant="subtle" className="bg-brand-light text-brand">Depth: {report.appendix.depth.charAt(0).toUpperCase() + report.appendix.depth.slice(1)}</Badge>
              <span className="text-xs text-text-muted">{report.id} · {new Date(report.appendix.generated_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-display text-2xl font-bold text-text">{report.event.headline} — Market Impact Report</h1>
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
          <Button variant="outline" onClick={() => navigate('/market/confirm')}><RefreshCw className="h-4 w-4" /> Re-run</Button>
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

      {/* Executive Summary + Verdict */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {/* Executive Summary */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="prose text-text-muted">
              <p>A sustained crude oil spike to $110+ (Brent) transmits primarily through <strong>input cost inflation</strong>, <strong>currency depreciation</strong>, and <strong>fiscal subsidy pressure</strong>. The net impact on Indian equities is <strong>negative</strong>, with 12 of 25 sectors scoring negatively.</p>
              <p>Sectors with high energy intensity (OMCs, Aviation, Paints, Tyres, Cement) face margin compression. Upstream Oil & Gas benefits. Rupee depreciation provides a partial offset for IT, Pharma, and export-oriented manufacturing.</p>
              <p><strong>Confidence: Medium-High.</strong> Channel mechanics are well-understood; magnitude depends on OPEC+ duration and global demand response.</p>
            </CardContent>
          </Card>

          {/* Verdict Box */}
          <Card variant="default" padding="lg" className="bg-bucket-negative-bg border-bucket-negative-border">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-bucket-negative">▼</p>
                <p className="text-sm text-text-muted">Market Tone</p>
                <p className="font-medium text-text">Moderate Negative</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-text">{report.companies.length + report.uncertain.length}</p>
                <p className="text-sm text-text-muted">Companies Scored</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-text">{bucketCountsWithUncertain.danger || 0}</p>
                <p className="text-sm text-text-muted">High Danger</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-text">{bucketCountsWithUncertain.gain || 0}</p>
                <p className="text-sm text-text-muted">Massive Gain</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <BucketBadge bucket="danger" size="sm" />
              <BucketBadge bucket="negative" size="sm" />
              <BucketBadge bucket="neutral" size="sm" />
              <BucketBadge bucket="positive" size="sm" />
              <BucketBadge bucket="gain" size="sm" />
            </div>
          </Card>

          {/* Event Details */}
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
                  <label className="block text-sm font-medium text-text-muted mb-1">Geographies</label>
                  <div className="flex flex-wrap gap-2">
                    {report.event.geographies.map((g, i) => (
                      <Chip key={i} variant="outline">{g}</Chip>
                    ))}
                  </div>
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

          {/* Transmission Channels */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Active Transmission Channels
              </CardTitle>
              <CardDescription>Strength dots indicate channel intensity (1–5)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {report.channels.map((ch, i) => (
                  <ChannelChip key={i} channel={ch.channel} strength={ch.strength as 1 | 2 | 3 | 4 | 5} direction={ch.direction === 'mixed' ? 'neutral' : ch.direction} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Macro Impact Table */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Macro Impact
              </CardTitle>
              <CardDescription>Direction, magnitude band, confidence, and horizon for each macro variable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="px-4 py-3 font-medium">Variable</th>
                      <th className="px-4 py-3 font-medium">Direction</th>
                      <th className="px-4 py-3 font-medium">Magnitude</th>
                      <th className="px-4 py-3 font-medium">Confidence</th>
                      <th className="px-4 py-3 font-medium">Horizon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(report.macro) as [string, MacroImpactField][]).map(([key, value]) => (
                      <tr key={key} className="border-b border-border hover:bg-surface-2">
                        <td className="px-4 py-3 font-medium text-text">{key.toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 font-medium ${directionColor(value.direction)}`}>
                            {trendIcon(value.direction)}
                            <span className="capitalize">{value.direction}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted">{value.magnitude_band}</td>
                        <td className="px-4 py-3">
                          <Badge variant="subtle" size="sm" className={
                            value.confidence === 'high' ? 'bg-bucket-positive-bg text-bucket-positive' :
                            value.confidence === 'medium' ? 'bg-bucket-negative-bg text-bucket-negative' :
                            'bg-bucket-danger-bg text-bucket-danger'
                          }>
                            {value.confidence}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-text-muted">{value.horizon}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Macro Backdrop */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Macro Backdrop (as of {new Date(report.macro_backdrop.timestamp).toLocaleString()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Nifty 50', value: report.macro_backdrop.nifty.toLocaleString(), icon: TrendingUp },
                  { label: 'Sensex', value: report.macro_backdrop.sensex.toLocaleString(), icon: TrendingUp },
                  { label: 'India VIX', value: report.macro_backdrop.vix.toFixed(1), icon: BarChart2 },
                  { label: 'USD/INR', value: report.macro_backdrop.usd_inr.toFixed(2), icon: TrendingUp },
                  { label: 'Brent Crude', value: `$${report.macro_backdrop.brent.toFixed(2)}`, icon: TrendingUp },
                  { label: 'Gold (MCX)', value: `₹${report.macro_backdrop.gold.toLocaleString()}`, icon: TrendingUp },
                  { label: 'US 10Y', value: `${report.macro_backdrop.us10y.toFixed(2)}%`, icon: TrendingUp },
                  { label: 'Repo Rate', value: `${report.macro_backdrop.repo_rate.toFixed(2)}%`, icon: Minus },
                ].map((item, i) => (
                  <Card key={i} variant="outlined" padding="md" className="text-center">
                    <p className="text-sm text-text-muted">{item.label}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <item.icon className="h-4 w-4 text-brand" />
                      <span className="text-xl font-bold text-text">{item.value}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sector Heatmap */}
          <Card variant="default" padding="lg" id="sector-heatmap">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Sector Heatmap
                  </CardTitle>
                  <CardDescription>
                    Scores range from -5 (High Danger) to +5 (Massive Gain). Click any sector row to filter company buckets below.
                  </CardDescription>
                </div>
                {selectedSector && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedSector(null)} className="flex items-center gap-1.5 text-xs">
                    <X className="h-3.5 w-3.5" /> Clear Sector Filter ({selectedSector})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="px-4 py-3 font-medium">Sector</th>
                      <th className="px-4 py-3 font-medium text-center">Score</th>
                      <th className="px-4 py-3 font-medium text-center">Confidence</th>
                      <th className="px-4 py-3 font-medium">Key Channels</th>
                      <th className="px-4 py-3 font-medium">Reasoning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.sectors.map((sector: SectorImpact, i) => {
                      const isSelected = selectedSector === sector.sector;
                      return (
                        <tr
                          key={i}
                          onClick={() => setSelectedSector(prev => prev === sector.sector ? null : sector.sector)}
                          className={`border-b border-border cursor-pointer transition-colors ${
                            isSelected ? 'bg-brand/10 border-l-4 border-l-brand' : 'hover:bg-surface-2'
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-text flex items-center gap-2">
                            {sector.sector}
                            {isSelected && <Badge variant="subtle" size="sm" className="bg-brand-light text-brand text-[10px]">Active Filter</Badge>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                              sector.score <= -3.5 ? 'bg-bucket-danger-bg text-bucket-danger' :
                              sector.score <= -1.5 ? 'bg-bucket-negative-bg text-bucket-negative' :
                              sector.score <= 1.5 ? 'bg-bucket-neutral-bg text-bucket-neutral' :
                              sector.score <= 3.5 ? 'bg-bucket-positive-bg text-bucket-positive' :
                              'bg-bucket-gain-bg text-bucket-gain'
                            }`}>
                              {sector.score > 0 ? '+' : ''}{sector.score}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="subtle" size="sm" className={
                              sector.confidence === 'high' ? 'bg-bucket-positive-bg text-bucket-positive' :
                              sector.confidence === 'medium' ? 'bg-bucket-negative-bg text-bucket-negative' :
                              'bg-bucket-danger-bg text-bucket-danger'
                            }>
                              {sector.confidence}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {sector.key_channels.map((ch, ci) => (
                                <Chip key={ci} variant="outline" size="sm">{ch}</Chip>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-muted max-w-xs truncate">{sector.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Company Buckets - 5 tabs */}
          <Card variant="default" padding="lg" id="company-buckets">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Company Buckets
                  </CardTitle>
                  <CardDescription>
                    Companies grouped by impact bucket. Click any row to open the Company Detail Drawer & run Mode B.
                  </CardDescription>
                </div>
                {selectedSector && (
                  <Badge variant="subtle" className="bg-brand-light text-brand flex items-center gap-1.5 py-1 px-2.5">
                    <Filter className="h-3.5 w-3.5" />
                    Sector: {selectedSector}
                    <button onClick={() => setSelectedSector(null)} className="ml-1 hover:text-text font-bold" aria-label="Clear filter">×</button>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="danger" variant="pills" className="mb-6">
                <TabsList aria-label="Impact buckets">
                  {(['danger', 'negative', 'neutral', 'positive', 'gain'] as const).map((b) => {
                    const count = [...report.companies, ...report.uncertain].filter(
                      c => c.bucket === b && (!selectedSector || c.sector === selectedSector)
                    ).length;
                    const labels: Record<string, string> = {
                      danger: 'High Danger',
                      negative: 'Moderate Negative',
                      neutral: 'Little/No Effect',
                      positive: 'Moderate Positive',
                      gain: 'Massive Gain',
                    };
                    return (
                      <TabsTrigger key={b} value={b}>
                        <BucketDot bucket={b} size="sm" />
                        {labels[b]}
                        <Badge variant="subtle" size="sm" className={`ml-1 ${
                          b === 'danger' ? 'bg-bucket-danger-bg text-bucket-danger' :
                          b === 'negative' ? 'bg-bucket-negative-bg text-bucket-negative' :
                          b === 'neutral' ? 'bg-bucket-neutral-bg text-bucket-neutral' :
                          b === 'positive' ? 'bg-bucket-positive-bg text-bucket-positive' :
                          'bg-bucket-gain-bg text-bucket-gain'
                        }`}>
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {(['danger', 'negative', 'neutral', 'positive', 'gain'] as const).map((bucket) => {
                  const bucketCompanies = [
                    ...report.companies.filter(c => c.bucket === bucket),
                    ...report.uncertain.filter(c => c.bucket === bucket)
                  ].filter(c => !selectedSector || c.sector === selectedSector);

                  return (
                    <TabsContent key={bucket} value={bucket}>
                      {bucketCompanies.length === 0 ? (
                        <div className="py-8 text-center text-text-muted">
                          <p>No companies found in this bucket{selectedSector ? ` for sector "${selectedSector}"` : ''}.</p>
                          {selectedSector && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedSector(null)} className="mt-2 text-brand">
                              Clear sector filter
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border text-left text-text-muted">
                                <th className="px-4 py-2">Company</th>
                                <th className="px-4 py-2">Sector</th>
                                <th className="px-4 py-2 text-center">Score</th>
                                <th className="px-4 py-2">Channels</th>
                                <th className="px-4 py-2">Confidence</th>
                                <th className="px-4 py-2">Reasoning</th>
                                <th className="px-4 py-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bucketCompanies.map((company: CompanyImpact, i) => (
                                <tr
                                  key={i}
                                  onClick={() => setSelectedCompany(company)}
                                  className="border-b border-border hover:bg-surface-2 cursor-pointer transition-colors"
                                >
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-text">{company.name}</div>
                                    <div className="text-xs text-text-muted">{company.symbol}</div>
                                  </td>
                                  <td className="px-4 py-3 text-text-muted">{company.sector}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                                      company.impact_score <= -3.5 ? 'bg-bucket-danger-bg text-bucket-danger' :
                                      company.impact_score <= -1.5 ? 'bg-bucket-negative-bg text-bucket-negative' :
                                      company.impact_score <= 1.5 ? 'bg-bucket-neutral-bg text-bucket-neutral' :
                                      company.impact_score <= 3.5 ? 'bg-bucket-positive-bg text-bucket-positive' :
                                      'bg-bucket-gain-bg text-bucket-gain'
                                    }`}>
                                      {company.impact_score > 0 ? '+' : ''}{company.impact_score.toFixed(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {company.primary_channels.slice(0, 3).map((ch, ci) => (
                                        <Chip key={ci} variant="outline" size="sm">{ch}</Chip>
                                      ))}
                                      {company.primary_channels.length > 3 && (
                                        <Chip variant="outline" size="sm">+{company.primary_channels.length - 3}</Chip>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge variant="subtle" size="sm" className={
                                      company.confidence === 'high' ? 'bg-bucket-positive-bg text-bucket-positive' :
                                      company.confidence === 'medium' ? 'bg-bucket-negative-bg text-bucket-negative' :
                                      'bg-bucket-danger-bg text-bucket-danger'
                                    }>
                                      {company.confidence}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-text-muted max-w-xs truncate">{company.reasoning}</td>
                                  <td className="px-4 py-3 text-right">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-brand hover:text-brand-dark">
                                      Inspect <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Uncertain / Low Confidence */}
          {report.uncertain.length > 0 && (
            <Card variant="default" padding="lg" className="bg-bucket-negative-bg border-bucket-negative-border" id="uncertain-list">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Uncertain / Low Confidence
                </CardTitle>
                <CardDescription>Companies where data gaps or model uncertainty prevent reliable bucket assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="px-4 py-2">Company</th>
                        <th className="px-4 py-2">Sector</th>
                        <th className="px-4 py-2">Score</th>
                        <th className="px-4 py-2">Data Gaps</th>
                        <th className="px-4 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.uncertain.map((company: CompanyImpact, i) => (
                        <tr
                          key={i}
                          onClick={() => setSelectedCompany(company)}
                          className="border-b border-border hover:bg-surface-2 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-text">{company.name} <span className="text-xs text-text-muted">({company.symbol})</span></td>
                          <td className="px-4 py-3 text-text-muted">{company.sector}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-mono text-nums">{company.impact_score > 0 ? '+' : ''}{company.impact_score.toFixed(1)}</span>
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            <ul className="list-disc list-inside space-y-1">
                              {company.data_gaps.map((gap, gi) => <li key={gi}>{gap}</li>)}
                            </ul>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-brand hover:text-brand-dark">
                              Inspect <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenarios */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Scenarios
              </CardTitle>
              <CardDescription>Best / Base / Worst case narratives with trigger events and bucket shifts</CardDescription>
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
                      <div>
                        {scenario.triggers.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-text mb-1">Triggers:</p>
                            <div className="flex flex-wrap gap-1">
                              {scenario.triggers.map((t, ti) => (
                                <Chip key={ti} variant="outline" size="sm">{t}</Chip>
                              ))}
                            </div>
                          </div>
                        )}
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
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.timeline.map((item, i) => (
                <Card key={i} variant="outlined" padding="md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-32 font-medium text-text">{item.period}</div>
                    <div className="flex-1">
                      <ul className="list-disc list-inside space-y-1 text-text-muted">
                        {item.events.map((e, ei) => <li key={ei}>{e}</li>)}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Watch-list & Triggers */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Watch-list & Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="px-4 py-3">Trigger</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.watchlist.map((item, i) => (
                      <tr key={i} className="border-b border-border hover:bg-surface-2">
                        <td className="px-4 py-3 text-text">{item.trigger}</td>
                        <td className="px-4 py-3 text-text-muted">{item.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          {/* Assumptions & Limitations */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Assumptions & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium text-text mb-2">Key Assumptions</p>
                  <ul className="list-disc list-inside space-y-1 text-text-muted">
                    {report.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-text mb-2">Limitations</p>
                  <ul className="list-disc list-inside space-y-1 text-text-muted">
                    <li>All data is sample/demo content — not real analysis</li>
                    <li>Model outputs simulated; no real LLM calls made</li>
                    <li>Company universe limited to ~50 large-cap names</li>
                    <li>Historical analogues illustrative only</li>
                  </ul>
                </div>
              </div>
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
                'Executive Summary',
                'Verdict Box',
                'Event Details',
                'Transmission Channels',
                'Macro Impact',
                'Macro Backdrop',
                'Sector Heatmap',
                'Company Buckets',
                'Uncertain List',
                'Scenarios',
                'Timeline',
                'Watch-list',
                'Historical Analogues',
                'Assumptions',
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

      {/* Company Detail Drawer (Journey J5) */}
      <Drawer
        isOpen={selectedCompany !== null}
        onClose={() => setSelectedCompany(null)}
        title={selectedCompany?.name || 'Company Impact Breakdown'}
        description={selectedCompany ? `${selectedCompany.symbol} · ${selectedCompany.sector}` : ''}
        size="lg"
      >
        {selectedCompany && (
          <div className="space-y-6">
            {/* Score & Bucket Hero */}
            <Card variant="outlined" padding="md" className="bg-surface-2/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Impact Assessment</p>
                  <div className="flex items-center gap-2 mt-1">
                    <BucketBadge bucket={selectedCompany.bucket} size="md" />
                    <Badge variant="subtle" size="sm" className={
                      selectedCompany.confidence === 'high' ? 'bg-bucket-positive-bg text-bucket-positive' :
                      selectedCompany.confidence === 'medium' ? 'bg-bucket-negative-bg text-bucket-negative' :
                      'bg-bucket-danger-bg text-bucket-danger'
                    }>
                      {selectedCompany.confidence.toUpperCase()} CONFIDENCE
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Net Score</p>
                  <span className={`text-2xl font-bold font-mono text-nums ${
                    selectedCompany.impact_score > 0 ? 'text-bucket-positive' :
                    selectedCompany.impact_score < 0 ? 'text-bucket-danger' :
                    'text-text'
                  }`}>
                    {selectedCompany.impact_score > 0 ? '+' : ''}{selectedCompany.impact_score.toFixed(1)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Transmission Channels */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-2">Transmission Channels</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.primary_channels.map((ch, idx) => (
                  <Chip key={idx} variant="outline" size="sm" className="bg-surface font-medium">
                    {ch}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Detailed Reasoning */}
            <div>
              <h4 className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-2">Analyst Reasoning</h4>
              <div className="p-3.5 rounded-lg bg-surface border border-border text-sm text-text leading-relaxed">
                {selectedCompany.reasoning}
              </div>
            </div>

            {/* Data Gaps (if present) */}
            {selectedCompany.data_gaps && selectedCompany.data_gaps.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-semibold text-bucket-danger tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Identified Data Gaps
                </h4>
                <div className="p-3.5 rounded-lg bg-bucket-danger-bg/40 border border-bucket-danger-border text-xs text-text-muted space-y-1">
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCompany.data_gaps.map((gap, gi) => (
                      <li key={gi}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-border space-y-3">
              <Button
                variant="primary"
                className="w-full justify-center gap-2 py-2.5"
                onClick={() => {
                  sessionStorage.setItem('mockCompany', selectedCompany.symbol);
                  sessionStorage.setItem('mockHeadline', report.event.headline);
                  sessionStorage.setItem('mockEventText', report.event.headline);
                  navigate('/company/confirm');
                }}
              >
                <Building2 className="h-4 w-4" />
                Run Mode B Deep-Dive for {selectedCompany.symbol}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={() => {
                  navigate(`/knowledge/companies/${selectedCompany.symbol}`);
                }}
              >
                <ExternalLink className="h-4 w-4" />
                View Exposure Profile
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}