import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Chip } from '@/components';
import { ArrowLeft, Search, Building2, ChevronRight, Filter } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import type { UniverseCompany } from '@/types';

export function KnowledgeCompanies() {
  const navigate = useNavigate();
  const [universe, setUniverse] = useState<UniverseCompany[]>([]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await mockApi.getUniverse();
      setUniverse(data);
      setLoading(false);
    };
    load();
  }, []);

  const sectors = useMemo(() => {
    const set = new Set(universe.map(c => c.sector));
    return Array.from(set).sort();
  }, [universe]);

  const filteredCompanies = useMemo(() => {
    return universe.filter(c => {
      const matchesSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

      const matchesSector = sectorFilter === 'all' || c.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [universe, search, sectorFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Company Exposure Profiles</h1>
          <p className="text-text-muted">Browse foundational grounding profiles across the tracked Indian universe</p>
        </div>
      </div>

      {/* Search & Sector Bar */}
      <Card variant="outlined" padding="md">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name, ticker, or exposure tag..."
              className="w-full px-4 py-2 pl-9 text-sm rounded-md border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Filter by sector"
            >
              <option value="all">All Sectors ({sectors.length})</option>
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-text-muted whitespace-nowrap">
              Showing {filteredCompanies.length} of {universe.length}
            </span>
          </div>
        </div>
      </Card>

      {/* Grid of Companies */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCompanies.map((company) => {
          const isVerified = ['ASIANPAINT', 'TCS', 'HDFCBANK', 'RELIANCE', 'HINDUNILVR'].includes(company.symbol);

          return (
            <Card
              key={company.symbol}
              variant="outlined"
              padding="md"
              className="hover:border-brand/60 hover:bg-surface-2 transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => navigate(`/knowledge/companies/${company.symbol}`)}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text truncate text-sm">{company.name}</h3>
                    <p className="text-xs font-mono text-text-muted">{company.symbol}</p>
                  </div>
                  <Building2 className="h-6 w-6 text-brand/40 flex-shrink-0" />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="subtle" size="sm" className="text-[10px]">{company.sector}</Badge>
                  <Badge
                    variant={isVerified ? 'outline' : 'subtle'}
                    size="sm"
                    className={`text-[10px] ${isVerified ? 'border-bucket-positive text-bucket-positive' : 'bg-surface-2 text-text-muted'}`}
                  >
                    {isVerified ? '✓ Verified' : 'AI Grounded'}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {company.tags.slice(0, 2).map((tag, idx) => (
                    <Chip key={idx} variant="outline" size="sm" className="text-[10px] py-0 px-1.5 bg-surface">
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span className="capitalize">Resilience: <strong className="text-text">{company.resilience_band}</strong></span>
                <ChevronRight className="h-4 w-4 text-brand" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}