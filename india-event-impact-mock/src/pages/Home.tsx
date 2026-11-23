import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, EmptyState, EmptyStates, Badge, BucketDot } from '@/components';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, Building2, FileText, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  const sampleEvents = [
    { label: 'Crude oil spikes to $110', description: 'Crude oil spikes to $110 after OPEC+ announces supply cuts. Brent futures surge 15%.' },
    { label: 'US imposes higher tariffs on Indian goods', description: 'US announces 25% reciprocal tariff on Indian textiles, auto parts, and gems & jewellery.' },
    { label: 'RBI cuts repo rate by 25 bps', description: 'RBI MPC cuts repo rate by 25 bps in surprise monetary policy easing to support growth.' },
  ];

  const handleSelectSample = (text: string) => {
    sessionStorage.setItem('mockEvent', text);
    navigate('/market');
  };

  const recentReports = [
    { id: 'MA-1', type: 'Market', title: 'Crude Oil Spike to $110', date: '2026-10-20', buckets: { danger: 3, negative: 5, neutral: 8, positive: 4, gain: 2 } },
    { id: 'MB-1', type: 'Company', title: 'Asian Paints + Crude $110', date: '2026-10-19', buckets: { danger: 0, negative: 1, neutral: 0, positive: 0, gain: 0 } },
    { id: 'MA-3', type: 'Market', title: 'RBI Rate Cut 25 bps', date: '2026-10-18', buckets: { danger: 0, negative: 2, neutral: 6, positive: 7, gain: 3 } },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-12 md:py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-light text-brand text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          <span>DEMO — Sample data only</span>
        </div>
        <h1 className="text-display text-4xl md:text-5xl font-bold text-text mb-4">
          Event → Market Impact → Company Action Plan
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto mb-8">
          Paste a news event. See which sectors win and lose. Drill into any company for a Defend / Capitalize plan.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/market">
            <Button size="lg" className="gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Market Impact Analysis</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/company">
            <Button size="lg" variant="secondary" className="gap-2">
              <Building2 className="h-5 w-5" />
              <span>Company Impact + Plan</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Sample Event Chips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-display text-xl font-semibold">Try a sample event</h2>
          <Link to="/market" className="text-sm text-brand hover:underline">View all →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sampleEvents.map((event, i) => (
            <button
              key={i}
              onClick={() => handleSelectSample(event.description)}
              className="text-left group p-4 rounded-lg border border-border bg-surface hover:border-brand/50 hover:bg-brand-light/50 transition-all cursor-pointer"
            >
              <h3 className="font-medium text-text group-hover:text-brand">{event.label}</h3>
              <p className="text-sm text-text-muted mt-1">{event.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-display text-xl font-semibold mb-6">How it works</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: Zap, title: '1. Event Input', desc: 'Paste headline, article, or describe an event' },
            { icon: TrendingUp, title: '2. Channel Mapping', desc: 'Engine maps event to transmission channels' },
            { icon: Building2, title: '3. Sector & Company Scoring', desc: 'Each company scored across 5 impact buckets' },
            { icon: FileText, title: '4. Report & Plan', desc: 'Market report + company Defend/Capitalize plan' },
          ].map((step, i) => (
            <Card key={i} variant="default" padding="lg" className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-light text-brand mb-4">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-text mb-1">{step.title}</h3>
              <p className="text-sm text-text-muted">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Reports */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-display text-xl font-semibold">Recent Reports</h2>
          <Link to="/reports" className="text-sm text-brand hover:underline">View all →</Link>
        </div>
        {recentReports.length > 0 ? (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Link
                key={report.id}
                to={report.type === 'Market' ? `/market/report/${report.id}` : `/company/report/${report.id}`}
                className="block"
              >
                <Card variant="outlined" padding="md" className="hover:bg-surface-2 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" size="sm">{report.type}</Badge>
                        <span className="text-sm text-text-muted">{report.date}</span>
                      </div>
                      <h3 className="font-medium text-text truncate">{report.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <BucketDot bucket="danger" size="sm" />
                        <span className="text-text-muted">{report.buckets.danger}</span>
                        <BucketDot bucket="negative" size="sm" />
                        <span className="text-text-muted">{report.buckets.negative}</span>
                        <BucketDot bucket="neutral" size="sm" />
                        <span className="text-text-muted">{report.buckets.neutral}</span>
                        <BucketDot bucket="positive" size="sm" />
                        <span className="text-text-muted">{report.buckets.positive}</span>
                        <BucketDot bucket="gain" size="sm" />
                        <span className="text-text-muted">{report.buckets.gain}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-text-muted flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          EmptyStates.noReports()
        )}
      </section>

      {/* Macro Snapshot */}
      <section>
        <h2 className="text-display text-xl font-semibold mb-4">Macro Snapshot</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Nifty 50', value: '24,850', change: '+0.8%', trend: 'up' },
            { label: 'USD/INR', value: '83.12', change: '+0.05', trend: 'up' },
            { label: 'Brent Crude', value: '$87.50', change: '+1.2%', trend: 'up' },
            { label: 'Repo Rate', value: '6.50%', change: '0 bps', trend: 'flat' },
          ].map((item, i) => (
            <Card key={i} variant="default" padding="md" className="text-center">
              <p className="text-sm text-text-muted">{item.label}</p>
              <p className="text-2xl font-bold text-text mt-1">{item.value}</p>
              <p className={`text-sm font-medium ${item.trend === 'up' ? 'text-bucket-positive' : item.trend === 'down' ? 'text-bucket-danger' : 'text-text-muted'}`}>
                {item.change}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}