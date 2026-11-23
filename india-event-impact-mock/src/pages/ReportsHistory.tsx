import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, EmptyState, EmptyStates, BucketDot } from '@/components';
import { ArrowLeft, Search, Filter, Download, Trash2, ExternalLink, Plus, Building2, TrendingUp, Layers } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredReports, deleteStoredReport } from '@/utils/storage';
import type { SavedReport } from '@/types';

export function ReportsHistory() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'market' | 'company'>('all');
  const [depthFilter, setDepthFilter] = useState<string>('all');

  useEffect(() => {
    setReports(getStoredReports());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete report ${id} from your saved history?`)) {
      const updated = deleteStoredReport(id);
      setReports(updated);
    }
  };

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `india-event-reports-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch =
        !search.trim() ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        (r.company && r.company.toLowerCase().includes(search.toLowerCase()));

      const matchesType = typeFilter === 'all' || r.type.toLowerCase() === typeFilter;
      const matchesDepth = depthFilter === 'all' || r.depth.toLowerCase() === depthFilter;

      return matchesSearch && matchesType && matchesDepth;
    });
  }, [reports, search, typeFilter, depthFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-display text-2xl font-bold text-text">Reports History</h1>
            <p className="text-text-muted">Browse, inspect, and export your simulated and generated event impact reports</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/market')} className="text-xs">
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> New Market Analysis
          </Button>
          <Button variant="outline" onClick={() => navigate('/company')} className="text-xs">
            <Building2 className="h-3.5 w-3.5 mr-1" /> New Company Analysis
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="outlined" padding="md">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by title, ticker, or ID (e.g. MA-1, Asian Paints, Tariffs)..."
              className="w-full px-3.5 py-2 pl-9 text-sm rounded-md border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Filter by report type"
            >
              <option value="all">All Types</option>
              <option value="market">Market Reports (Mode A)</option>
              <option value="company">Company Reports (Mode B)</option>
            </select>

            <select
              value={depthFilter}
              onChange={(e) => setDepthFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Filter by depth"
            >
              <option value="all">All Depths</option>
              <option value="quick">Quick</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>

            <Button variant="outline" size="sm" onClick={handleExportAll} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" /> Export JSON
            </Button>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-12">
          <p className="text-text-muted text-sm">No saved reports matched your filters.</p>
          {(search || typeFilter !== 'all' || depthFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
                setDepthFilter('all');
              }}
              className="mt-2 text-brand text-xs"
            >
              Reset search & filters
            </Button>
          )}
        </Card>
      ) : (
        <Card variant="default" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Company / Focus</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Depth</th>
                  <th className="px-4 py-3">Bucket Distribution</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const isMarket = report.type.toLowerCase() === 'market';
                  const reportUrl = isMarket ? `/market/report/${report.id}` : `/company/report/${report.id}`;

                  return (
                    <tr
                      key={report.id}
                      onClick={() => navigate(reportUrl)}
                      className="border-b border-border hover:bg-surface-2 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text hover:text-brand transition-colors">{report.title}</div>
                        <div className="text-xs font-mono text-text-muted mt-0.5">{report.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={isMarket ? 'outline' : 'subtle'} size="sm" className={isMarket ? 'border-brand text-brand' : 'bg-surface-2 text-text'}>
                          {isMarket ? 'Market' : 'Company'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {report.company ? (
                          <span className="font-medium text-text">{report.company}</span>
                        ) : (
                          <span className="italic text-text-muted">Nifty 50 Universe</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">{report.date}</td>
                      <td className="px-4 py-3">
                        <Badge variant="subtle" size="sm" className="capitalize text-xs">
                          {report.depth}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5" title="Danger / Negative / Neutral / Positive / Gain">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-bucket-danger" />
                          <span className="text-xs text-text-muted font-mono">{report.bucket_counts?.danger || 0}</span>
                          <span className="text-text-muted/40">·</span>
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-bucket-positive" />
                          <span className="text-xs text-text-muted font-mono">{report.bucket_counts?.positive || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(reportUrl)}
                            aria-label={`Open report ${report.id}`}
                            className="h-8 w-8 text-text-muted hover:text-brand"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDelete(report.id, e)}
                            aria-label={`Delete report ${report.id}`}
                            className="h-8 w-8 text-text-muted hover:text-bucket-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}