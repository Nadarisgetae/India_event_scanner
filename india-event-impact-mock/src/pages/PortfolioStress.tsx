import React, { useState } from 'react';
import { 
  ShieldAlert, Upload, Play, AlertCircle, ArrowUpRight, ArrowDownRight, 
  Layers, CheckCircle, RefreshCw, BarChart3, HelpCircle 
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';
import { apiClient } from '@/api/client';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge, BucketBadge } from '@/components/Badge';

const SAMPLE_CSV = `symbol,quantity,buy_price
RELIANCE,25,2850
HDFCBANK,50,1620
TCS,15,3950
TATAMOTORS,60,940
MARUTI,5,12400
ASIANPAINT,20,2900
INFY,40,1820
SUNPHARMA,30,1780
INDIGO,15,4300
HINDUNILVR,25,2450`;

const SAMPLE_EVENTS = [
  "Brent crude spikes 22% following major geopolitical escalation in Strait of Hormuz",
  "RBI unexpectedly hikes repo rate by 50 bps to contain imported food inflation",
  "US imposes 15% reciprocal tariff on imported Indian software services and pharmaceuticals",
  "Rupee plunges past 86 per USD amid strong capital outflows and widening CAD",
];

export function PortfolioStress() {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [eventText, setEventText] = useState(SAMPLE_EVENTS[0]);
  const [portfolioName, setPortfolioName] = useState('Growth & Bluechip Portfolio');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setCsvText(content);
    };
    reader.readAsText(file);
  };

  const runSimulation = async () => {
    if (!csvText.trim()) {
      setError('Please provide portfolio holdings in CSV format.');
      return;
    }
    if (!eventText.trim()) {
      setError('Please provide a macro event or shock headline.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Parse CSV
      const holdings = await apiClient.parsePortfolioCSV(csvText);
      if (!holdings || holdings.length === 0) {
        throw new Error('No valid holdings could be parsed from the provided CSV.');
      }

      // 2. Run stress test
      const res = await apiClient.analyzePortfolio({
        holdings,
        event_text: eventText,
        portfolio_name: portfolioName,
      });
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete portfolio stress simulation.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare radar chart data from channel exposure
  const radarData = result?.channel_exposure_breakdown
    ? Object.entries(result.channel_exposure_breakdown).map(([ch, val]: [string, any]) => ({
        channel: ch.replace('_', ' '),
        sensitivity: Math.round(val * 100),
      }))
    : [];

  const mapBucketToType = (bucket: string): 'danger' | 'negative' | 'neutral' | 'positive' | 'gain' => {
    switch (bucket) {
      case 'massive_gain': return 'gain';
      case 'moderately_positive': return 'positive';
      case 'little_or_no_effect': return 'neutral';
      case 'moderately_negative': return 'negative';
      case 'high_danger': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-brand/10 text-brand">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Portfolio Stress-Testing
            </h1>
            <p className="text-sm text-muted-foreground">
              Simulate how macro shocks, commodity spikes, and regulatory actions propagate across your holdings.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: CSV Holdings */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-brand" />
                  Portfolio Holdings (CSV)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs font-medium text-brand hover:underline flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5" />
                    Upload CSV
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button 
                    onClick={() => setCsvText(SAMPLE_CSV)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset Sample
                  </button>
                </div>
              </div>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="symbol,quantity,buy_price&#10;RELIANCE,25,2850&#10;HDFCBANK,50,1620"
                className="w-full h-44 font-mono text-xs p-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supports Zerodha Kite, Groww, Upstox, or standard <code>symbol,quantity,buy_price</code> formats.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Portfolio Name:</span>
              <input
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                className="text-xs font-medium px-2.5 py-1 rounded border border-border bg-background w-48 text-right"
              />
            </div>
          </Card>
        </div>

        {/* Right: Shock Scenario */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 h-full flex flex-col justify-between">
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-brand" />
                Select or Enter Macro Shock Scenario
              </label>

              <textarea
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
                placeholder="Describe the economic event, commodity shock, or policy move..."
                className="w-full h-24 text-sm p-3 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none mb-3"
              />

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Pre-set Scenarios:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {SAMPLE_EVENTS.map((ev, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEventText(ev)}
                      className={`text-left text-xs p-2 rounded border transition-colors truncate ${
                        eventText === ev 
                          ? 'border-brand bg-brand/5 text-brand font-medium' 
                          : 'border-border/60 hover:border-border hover:bg-surface-alt text-muted-foreground'
                      }`}
                    >
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <Button
                onClick={runSimulation}
                disabled={loading}
                className="w-full justify-center gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Simulating 12-Channel Shock Wave...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Simulate Portfolio Impact
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Aggregate Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-l-4 border-l-brand">
              <span className="text-xs text-muted-foreground font-medium">Total Portfolio Value</span>
              <div className="text-2xl font-bold mt-1 text-foreground">
                ₹{result.total_portfolio_value_inr.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {result.total_holdings_count} Assets Monitored
              </span>
            </Card>

            <Card className={`p-4 border-l-4 ${
              result.net_portfolio_impact_pct >= 0 ? 'border-l-success' : 'border-l-danger'
            }`}>
              <span className="text-xs text-muted-foreground font-medium">Net Predicted Impact</span>
              <div className={`text-2xl font-bold mt-1 flex items-center gap-1 ${
                result.net_portfolio_impact_pct >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {result.net_portfolio_impact_pct >= 0 ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
                {result.net_portfolio_impact_pct > 0 ? '+' : ''}{result.net_portfolio_impact_pct}%
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Expected Abnormal Return
              </span>
            </Card>

            <Card className={`p-4 border-l-4 ${
              result.net_portfolio_pnl_inr >= 0 ? 'border-l-success' : 'border-l-danger'
            }`}>
              <span className="text-xs text-muted-foreground font-medium">Estimated Value at Risk (PnL)</span>
              <div className={`text-2xl font-bold mt-1 ${
                result.net_portfolio_pnl_inr >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {result.net_portfolio_pnl_inr > 0 ? '+' : ''}₹{Math.abs(result.net_portfolio_pnl_inr).toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Event-driven valuation shift
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-warning">
              <span className="text-xs text-muted-foreground font-medium">High Risk Concentrations</span>
              <div className="text-2xl font-bold mt-1 text-foreground">
                {result.bucket_distribution?.high_danger || 0}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Holdings in High Danger bucket
              </span>
            </Card>
          </div>

          {/* Visuals: Radar Exposure & Detractors */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 12-Channel Sensitivity Radar */}
            <div className="lg:col-span-6">
              <Card className="p-5 h-full">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Net Portfolio Channel Exposure
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Aggregated vulnerability across all 12 macro transmission channels
                </p>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="channel" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[-50, 50]} stroke="var(--border)" />
                      <Radar name="Portfolio" dataKey="sensitivity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Top Detractors vs Beneficiaries */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-danger flex items-center gap-2 mb-3">
                  <ArrowDownRight className="h-4 w-4" />
                  Top Vulnerabilities (Greatest Drawdown)
                </h3>
                <div className="space-y-2">
                  {result.top_detractors.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No high-danger detractors identified.</p>
                  ) : (
                    result.top_detractors.map((h: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-surface-alt border border-border text-xs">
                        <div>
                          <span className="font-semibold text-foreground">{h.symbol}</span>
                          <span className="text-muted-foreground ml-2">({h.sector})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-danger block">{h.predicted_abnormal_return_pct}%</span>
                          <span className="text-muted-foreground text-[11px]">-₹{Math.abs(h.estimated_pnl_inr).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-success flex items-center gap-2 mb-3">
                  <ArrowUpRight className="h-4 w-4" />
                  Top Beneficiaries (Hedge / Growth)
                </h3>
                <div className="space-y-2">
                  {result.top_beneficiaries.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No significant beneficiaries identified.</p>
                  ) : (
                    result.top_beneficiaries.map((h: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-surface-alt border border-border text-xs">
                        <div>
                          <span className="font-semibold text-foreground">{h.symbol}</span>
                          <span className="text-muted-foreground ml-2">({h.sector})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-success block">+{h.predicted_abnormal_return_pct}%</span>
                          <span className="text-muted-foreground text-[11px]">+₹{Math.abs(h.estimated_pnl_inr).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Full Holdings Breakdown Table */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Individual Holding Impact Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-alt text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Current Value</th>
                    <th className="py-2.5 px-3">Impact Bucket</th>
                    <th className="py-2.5 px-3">Expected Return</th>
                    <th className="py-2.5 px-3">Est. PnL</th>
                    <th className="py-2.5 px-3">Primary Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.holdings_impact.map((h: any, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-foreground">{h.symbol}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{h.sector}</td>
                      <td className="py-2.5 px-3">{h.weight_pct}%</td>
                      <td className="py-2.5 px-3">₹{h.current_value.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3">
                        <BucketBadge bucket={mapBucketToType(h.bucket)} />
                      </td>
                      <td className={`py-2.5 px-3 font-medium ${
                        h.predicted_abnormal_return_pct >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {h.predicted_abnormal_return_pct > 0 ? '+' : ''}{h.predicted_abnormal_return_pct}%
                      </td>
                      <td className={`py-2.5 px-3 font-semibold ${
                        h.estimated_pnl_inr >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {h.estimated_pnl_inr > 0 ? '+' : ''}₹{h.estimated_pnl_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{h.primary_channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Tactical Rebalancing Levers */}
          {result.hedging_recommendations && result.hedging_recommendations.length > 0 && (
            <Card className="p-5 border-l-4 border-l-brand">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand" />
                Recommended Portfolio Defense Levers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.hedging_recommendations.map((action: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-surface-alt border border-border text-xs space-y-1.5">
                    <span className="font-semibold text-foreground block">{action.lever_name}</span>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{action.expected_impact}</p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
                      <span>Horizon: {action.time_horizon}</span>
                      <span className="font-medium text-brand">{action.cost_or_difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
export default PortfolioStress;
