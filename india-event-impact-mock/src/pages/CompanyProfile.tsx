import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Chip,
  Skeleton,
  EmptyState,
} from '@/components';
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
} from 'lucide-react';
import { mockApi } from '@/api/mockApi';
import type { ExposureProfile, UniverseCompany } from '@/types';

export function CompanyProfile() {
  const { symbol = 'ASIANPAINT' } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ExposureProfile | null>(null);
  const [company, setCompany] = useState<UniverseCompany | null>(null);
  const [peerCompanies, setPeerCompanies] = useState<UniverseCompany[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const cleanSymbol = (symbol || 'ASIANPAINT').toUpperCase();
        const [prof, comp, universe] = await Promise.all([
          mockApi.getExposureProfile(cleanSymbol),
          mockApi.getCompany(cleanSymbol),
          mockApi.getUniverse(),
        ]);

        if (mounted) {
          setProfile(prof);
          setCompany(comp);
          if (comp || prof) {
            const currentSector = comp?.sector || prof?.sector;
            const peers = universe
              .filter((c) => c.sector === currentSector && c.symbol !== cleanSymbol)
              .slice(0, 4);
            setPeerCompanies(peers);
          }
        }
      } catch (err) {
        console.error('Failed to load profile for', symbol, err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [symbol]);

  const handleRunModeB = () => {
    const targetSymbol = profile?.symbol || company?.symbol || symbol;
    sessionStorage.setItem('mockCompany', targetSymbol);
    navigate('/company');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-2">
            <Skeleton variant="text" className="w-48 h-6" />
            <Skeleton variant="text" className="w-72 h-8" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!profile && !company) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <EmptyState
          icon="search"
          title={`Company "${symbol}" Not Found`}
          description="We couldn't locate an exposure profile or universe entry for this symbol."
          action={
            <Button variant="primary" onClick={() => navigate('/knowledge/companies')}>
              Browse Universe Companies
            </Button>
          }
        />
      </div>
    );
  }

  const displayName = profile?.name || company?.name || symbol;
  const displaySymbol = profile?.symbol || company?.symbol || symbol;
  const displaySector = profile?.sector || company?.sector || 'Diversified';
  const isHumanVerified = profile?.verification === 'human-verified';

  // Exposure tags from profile or company tags
  const tags = profile?.exposure_tags || company?.tags || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Breadcrumbs / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge
                variant={isHumanVerified ? 'outline' : 'subtle'}
                size="sm"
                className={isHumanVerified ? 'border-brand text-brand font-medium' : ''}
              >
                {isHumanVerified ? (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Human Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> LLM Draft Profile
                  </span>
                )}
              </Badge>
              <Badge variant="subtle" size="sm">
                Confidence: {profile?.confidence || 'Medium'}
              </Badge>
              {profile?.last_verified && (
                <span className="text-xs text-text-muted">
                  Updated: {profile.last_verified}
                </span>
              )}
            </div>
            <h1 className="text-display text-2xl sm:text-3xl font-bold text-text flex items-center gap-2 flex-wrap">
              {displayName}
              <span className="text-text-muted font-normal text-lg sm:text-xl font-mono">
                ({displaySymbol})
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-1.5" /> Share
          </Button>
          <Button variant="primary" size="sm" onClick={handleRunModeB}>
            <TrendingUp className="h-4 w-4 mr-1.5" /> Run Mode B
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Summary */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand" />
                <CardTitle>Business Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-text text-sm sm:text-base leading-relaxed">
                {profile?.business_summary ||
                  `${displayName} is a prominent player in the ${displaySector} sector in India with significant market reach and operations.`}
              </p>
            </CardContent>
          </Card>

          {/* Revenue Mix */}
          {profile?.revenue_mix && Object.keys(profile.revenue_mix).length > 0 && (
            <Card variant="default" padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand" />
                    <CardTitle>Revenue Segment Breakdown</CardTitle>
                  </div>
                  <span className="text-xs text-text-muted">Reported FY24/25</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(profile.revenue_mix).map(([segment, pct]) => (
                    <div key={segment} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-text">{segment}</span>
                        <span className="font-mono text-nums text-text-muted">{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exposure Tags */}
          {tags.length > 0 && (
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Exposure & Sensitivity Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <Chip key={i} variant="outline" className="text-xs capitalize">
                      {tag.replace(/_/g, ' ')}
                    </Chip>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Resilience */}
          {profile?.resilience && (
            <Card variant="default" padding="lg">
              <CardHeader>
                <CardTitle>Financial Resilience & Balance Sheet Strength</CardTitle>
                <CardDescription>
                  Evaluated capacity to withstand exogenous commodity and currency shocks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-surface-2 rounded-lg border border-border">
                  <div className="text-center sm:text-left min-w-[100px]">
                    <div className="text-4xl font-bold font-mono text-brand">
                      {profile.resilience.score}
                    </div>
                    <Badge
                      variant="subtle"
                      size="sm"
                      className={`mt-1 font-semibold uppercase ${
                        profile.resilience.band === 'high'
                          ? 'bg-bucket-positive-bg text-bucket-positive'
                          : profile.resilience.band === 'medium'
                          ? 'bg-surface text-text'
                          : 'bg-bucket-danger-bg text-bucket-danger'
                      }`}
                    >
                      {profile.resilience.band} Resilience
                    </Badge>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    {profile.resilience.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-bucket-positive" /> Key Strengths
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.resilience.strengths.map((s, i) => (
                            <Badge
                              key={i}
                              variant="subtle"
                              size="sm"
                              className="bg-bucket-positive-bg text-bucket-positive border border-bucket-positive-border text-xs"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.resilience.weaknesses?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-bucket-danger" /> Vulnerabilities
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.resilience.weaknesses.map((w, i) => (
                            <Badge
                              key={i}
                              variant="subtle"
                              size="sm"
                              className="bg-bucket-danger-bg text-bucket-danger border border-bucket-danger-border text-xs"
                            >
                              {w}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Ratios Grid */}
                {profile.ratios && Object.keys(profile.ratios).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Key Balance Sheet & Performance Ratios
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(profile.ratios).map(([key, val]) => (
                        <div key={key} className="p-3 bg-surface-2 rounded border border-border/50">
                          <p className="text-xs text-text-muted">{key}</p>
                          <p className="font-mono text-sm font-semibold text-text mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Research Sources */}
          {profile?.sources && profile.sources.length > 0 && (
            <Card variant="default" padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-text-muted" />
                  <CardTitle className="text-base">Research Evidence & Sources</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs text-text-muted">
                  {profile.sources.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (Sidebar & Actions) */}
        <div className="space-y-6">
          {/* Quick Snapshot Card */}
          <Card variant="default" padding="lg">
            <div className="text-center pb-4 border-b border-border">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-text">{displayName}</h3>
              <p className="text-sm text-text-muted">{displaySector}</p>

              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                <Badge variant="subtle" size="sm" className="capitalize">
                  {company?.market_cap_bucket || 'Large'} Cap
                </Badge>
                <Badge variant="subtle" size="sm" className="bg-brand/10 text-brand">
                  NSE/BSE Listed
                </Badge>
              </div>
            </div>

            <div className="py-4 space-y-2 text-sm border-b border-border">
              <div className="flex justify-between">
                <span className="text-text-muted">Resilience Band:</span>
                <span className="capitalize font-medium text-text">
                  {company?.resilience_band || profile?.resilience?.band || 'Medium'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sector:</span>
                <span className="font-medium text-text">{displaySector}</span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button className="w-full" variant="primary" onClick={handleRunModeB}>
                <TrendingUp className="h-4 w-4 mr-1.5" /> Run Mode B Analysis
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => navigate('/knowledge/companies')}
              >
                Browse All Companies
              </Button>
            </div>
          </Card>

          {/* Sector Peers */}
          {peerCompanies.length > 0 && (
            <Card variant="default" padding="md">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Sector Peers ({displaySector})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {peerCompanies.map((peer) => (
                  <Link
                    key={peer.symbol}
                    to={`/knowledge/companies/${peer.symbol}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-surface-2 transition-colors text-xs"
                  >
                    <div>
                      <p className="font-semibold text-text">{peer.name}</p>
                      <p className="text-text-muted font-mono">{peer.symbol}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Info Box */}
          <Card variant="outlined" padding="md">
            <p className="text-xs text-text-muted leading-relaxed">
              <strong>DEMO NOTE:</strong> Profiles combine structural annual filings, supply chain
              disclosures, and AI-synthesized transmission priors. In production, verified profiles
              are vetted quarterly by sector analysts.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}