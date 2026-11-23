import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Skeleton } from '@/components';
import { ArrowLeft, RefreshCw, Database, HardDrive, Globe, FileText, AlertTriangle, CheckCircle, WifiOff, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import { useState } from 'react';

export function DataStatus() {
  const navigate = useNavigate();
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await mockApi.getDataStatus();
      setDataStatus(data);
    } catch (e) {
      console.error('Failed to load data status', e);
    }
  };

  if (!dataStatus) loadData();

  const handleRefresh = async (sourceName: string) => {
    setRefreshing(sourceName);
    try {
      await mockApi.refreshDataSource(sourceName);
      await loadData();
    } finally {
      setRefreshing(null);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-bucket-positive" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-bucket-negative" />;
      case 'down': return <WifiOff className="h-4 w-4 text-bucket-danger" />;
      default: return <Server className="h-4 w-4 text-text-muted" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ok': return <Badge variant="subtle" className="bg-bucket-positive-bg text-bucket-positive">Healthy</Badge>;
      case 'degraded': return <Badge variant="subtle" className="bg-bucket-negative-bg text-bucket-negative">Degraded</Badge>;
      case 'down': return <Badge variant="subtle" className="bg-bucket-danger-bg text-bucket-danger">Down</Badge>;
      default: return <Badge variant="subtle">Unknown</Badge>;
    }
  };

  const dataCategories = [
    { key: 'prices', label: 'Prices', icon: Database, desc: 'NSE/BSE bhavcopy, intraday, adjusted' },
    { key: 'fundamentals', label: 'Fundamentals', icon: HardDrive, desc: 'Financial statements, ratios, estimates' },
    { key: 'news', label: 'News', icon: Globe, desc: 'RSS feeds, sentiment, materiality' },
    { key: 'macro', label: 'Macro', icon: FileText, desc: 'RBI, MoSPI, World Bank, FRED' },
    { key: 'filings', label: 'Filings', icon: FileText, desc: 'Corporate announcements, disclosures' },
    { key: 'knowledge_base', label: 'Knowledge Base', icon: Database, desc: 'Sector matrix, company profiles' },
  ];

  if (!dataStatus) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-display text-2xl font-bold text-text">Data Status</h1><p className="text-text-muted">Freshness, coverage, and source health</p></div>
        </div>
        <Card variant="default" padding="lg"><Skeleton variant="card" /></Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-display text-2xl font-bold text-text">Data Status</h1><p className="text-text-muted">Freshness, coverage, and source health</p></div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={!!refreshing}><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh All</Button>
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dataCategories.map((cat) => {
          const data = dataStatus[cat.key];
          return (
            <Card key={cat.key} variant="default" padding="lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <cat.icon className="h-6 w-6 text-brand" />
                  <div>
                    <h3 className="font-medium text-text">{cat.label}</h3>
                    <p className="text-sm text-text-muted">{cat.desc}</p>
                  </div>
                </div>
                {statusBadge(data?.stale_warning ? 'degraded' : 'ok')}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div><p className="text-text-muted">Last Refresh</p><p className="font-mono text-nums">{data?.last_refresh ? new Date(data.last_refresh).toLocaleString() : '—'}</p></div>
                <div><p className="text-text-muted">Coverage</p><p className="font-mono text-nums">{data?.coverage_pct?.toFixed(1) || '—'}%</p></div>
                {data?.stale_warning && (
                  <div className="sm:col-span-2 p-2 bg-bucket-negative-bg border border-bucket-negative-border rounded text-bucket-negative text-xs">
                    <AlertTriangle className="h-3 w-3 inline mr-1" /> Stale data warning
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => handleRefresh(cat.key)} disabled={refreshing === cat.key}>
                {refreshing === cat.key ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />} Refresh
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Source Health Table */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Source Health Details</CardTitle>
          <CardDescription>Per-source status and last successful fetch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Last Success</th>
                  <th className="px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {dataStatus.source_health?.map((source: any) => (
                  <tr key={source.name} className="border-b border-border">
                    <td className="px-4 py-3 font-medium">{source.name}</td>
                    <td className="px-4 py-3"><Badge variant="subtle" size="sm">{source.type}</Badge></td>
                    <td className="px-4 py-3">{statusBadge(source.status)}</td>
                    <td className="px-4 py-3 text-text-muted">{source.last_success ? new Date(source.last_success).toLocaleString() : 'Never'}</td>
                    <td className="px-4 py-3 text-text-muted text-sm max-w-xs truncate">{source.error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}