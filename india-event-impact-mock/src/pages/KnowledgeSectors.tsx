import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Drawer,
  Skeleton,
} from '@/components';
import { ArrowLeft, Search, Info, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import type { SectorMatrixCell } from '@/types';

export function KnowledgeSectors() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<string[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [matrixCells, setMatrixCells] = useState<SectorMatrixCell[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<{
    sector: string;
    channel: string;
    sensitivity: number;
    reasoning: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [secs, chs, cells] = await Promise.all([
          mockApi.getSectors(),
          mockApi.getChannels(),
          mockApi.getSectorMatrix(),
        ]);
        if (mounted) {
          setSectors(secs || []);
          setChannels(chs || []);
          setMatrixCells(cells || []);
        }
      } catch (err) {
        console.error('Failed to load sector matrix data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Normalize channel names for lookup
  const channelNames = useMemo(() => {
    if (channels.length > 0) {
      return channels.map((c) => (typeof c === 'string' ? c : c.name || c.id));
    }
    return [
      'Currency / INR',
      'Input Costs',
      'Consumer Demand',
      'Export Competitiveness',
      'Fiscal / Subsidy',
      'Rates / Monetary Policy',
      'Trade Policy / Tariffs',
      'Regulatory',
      'Commodity Prices',
      'Global Demand',
      'Supply Chain',
      'Substitution',
    ];
  }, [channels]);

  // Lookup map: `${sector}__${channel}` -> SectorMatrixCell
  const cellMap = useMemo(() => {
    const map = new Map<string, SectorMatrixCell>();
    matrixCells.forEach((c) => {
      map.set(`${c.sector.toLowerCase()}__${c.channel.toLowerCase()}`, c);
    });
    return map;
  }, [matrixCells]);

  // Helper to find cell with flexible channel substring matching
  const findCell = (sector: string, channel: string): SectorMatrixCell | null => {
    const directKey = `${sector.toLowerCase()}__${channel.toLowerCase()}`;
    if (cellMap.has(directKey)) return cellMap.get(directKey)!;

    // Fuzzy channel matching (e.g. "Fiscal / Subsidy" matches "Fiscal / Subsidy Burden")
    const chLower = channel.toLowerCase().split('/')[0].trim();
    for (const [key, cell] of cellMap.entries()) {
      if (key.startsWith(`${sector.toLowerCase()}__`) && key.includes(chLower)) {
        return cell;
      }
    }
    return null;
  };

  const filteredSectors = useMemo(() => {
    if (!searchQuery.trim()) return sectors;
    const q = searchQuery.toLowerCase().trim();
    return sectors.filter((s) => s.toLowerCase().includes(q));
  }, [sectors, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-display text-2xl font-bold text-text">Sector Sensitivity Matrix</h1>
            <p className="text-sm text-text-muted">
              Transmission prior sensitivities (−5 to +5) across Indian industry sectors
            </p>
          </div>
        </div>

        <div className="w-full sm:w-72 relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter sectors..."
            className="pl-9"
          />
          <Search className="h-4 w-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Main Table Card */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Sector × Transmission Channel Priors</CardTitle>
              <CardDescription>
                Click any score cell to inspect the analytical transmission reasoning.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-bucket-positive-bg border border-bucket-positive-border" />{' '}
                Beneficiary (+1 to +5)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-surface-2 border border-border" /> Neutral (0)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-bucket-danger-bg border border-bucket-danger-border" />{' '}
                Vulnerable (−1 to −5)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3 py-6">
              <Skeleton variant="card" className="h-12 w-full" />
              <Skeleton variant="card" className="h-48 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border sticky top-0 bg-surface z-10">
                    <th className="px-3 py-3 text-left font-semibold text-text min-w-[180px] sticky left-0 bg-surface shadow-sm">
                      Sector
                    </th>
                    {channelNames.map((ch) => (
                      <th
                        key={ch}
                        className="px-2 py-3 text-center font-medium text-text-muted min-w-[90px]"
                        title={ch}
                      >
                        <div className="truncate max-w-[90px]">{ch}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSectors.map((sector) => (
                    <tr
                      key={sector}
                      className="border-b border-border hover:bg-surface-2/60 transition-colors"
                    >
                      <td className="px-3 py-2.5 font-medium text-text sticky left-0 bg-surface hover:bg-surface-2 shadow-sm">
                        {sector}
                      </td>
                      {channelNames.map((ch) => {
                        const cell = findCell(sector, ch);
                        const sens = cell ? cell.sensitivity : 0;
                        const reasoning =
                          cell?.reasoning ||
                          (sens !== 0
                            ? `Historical elasticities reflect ${sens > 0 ? 'positive' : 'negative'} transmission via ${ch}.`
                            : 'No significant direct transmission channel identified.');

                        const colorClasses =
                          sens > 0
                            ? 'bg-bucket-positive-bg text-bucket-positive border border-bucket-positive-border hover:brightness-95'
                            : sens < 0
                            ? 'bg-bucket-danger-bg text-bucket-danger border border-bucket-danger-border hover:brightness-95'
                            : 'bg-surface-2 text-text-muted/70 border border-border/40 hover:text-text';

                        return (
                          <td key={ch} className="px-1.5 py-1.5 text-center">
                            <button
                              onClick={() =>
                                setSelectedCell({
                                  sector,
                                  channel: ch,
                                  sensitivity: sens,
                                  reasoning,
                                })
                              }
                              className={`inline-flex items-center justify-center w-8 h-8 rounded font-mono font-medium text-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer ${colorClasses}`}
                              title={`${sector} × ${ch}: ${sens > 0 ? `+${sens}` : sens}\nClick for rationale`}
                            >
                              {sens === 0 ? '—' : sens > 0 ? `+${sens}` : sens}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSectors.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  No sectors match "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanatory Callout */}
      <Card variant="outlined" padding="md">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text">
              How the Multi-Agent Engine uses this Knowledge Matrix:
            </p>
            <p>
              Each cell represents an analytical starting prior (−5 to +5) derived from Indian corporate
              disclosures, input-output tables, and import dependencies. During Mode A or Mode B runs,
              the Transmission Agent conditions these base priors against the specific magnitude,
              duration, and macro backdrop of the event to calculate final net company impact.
            </p>
          </div>
        </div>
      </Card>

      {/* Reasoning Drawer */}
      <Drawer
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        title={selectedCell ? `${selectedCell.sector} × ${selectedCell.channel}` : ''}
        size="md"
      >
        {selectedCell && (
          <div className="space-y-6">
            <div className="p-4 bg-surface-2 rounded-lg border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Sector</p>
                <p className="text-base font-bold text-text mt-0.5">{selectedCell.sector}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-3">Channel</p>
                <p className="text-base font-semibold text-text mt-0.5">{selectedCell.channel}</p>
              </div>
              <div className="text-center pl-4 border-l border-border">
                <span className="text-xs text-text-muted uppercase block">Prior</span>
                <span
                  className={`text-3xl font-mono font-bold ${
                    selectedCell.sensitivity > 0
                      ? 'text-bucket-positive'
                      : selectedCell.sensitivity < 0
                      ? 'text-bucket-danger'
                      : 'text-text-muted'
                  }`}
                >
                  {selectedCell.sensitivity > 0
                    ? `+${selectedCell.sensitivity}`
                    : selectedCell.sensitivity}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-brand" /> Transmission Rationale
              </h4>
              <Card variant="default" padding="md">
                <p className="text-sm text-text leading-relaxed">
                  {selectedCell.reasoning}
                </p>
              </Card>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Event Conditioning Rules
              </h4>
              <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4">
                <li>Scaled linearly by event shock magnitude (e.g., crude +$10 vs +$25/bbl).</li>
                <li>Damped by company balance sheet resilience score (High/Medium/Low).</li>
                <li>Adjusted for company pricing power and inventory hedge duration.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedCell(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}