// ============================================
// TYPE DEFINITIONS — Mirror real backend Pydantic schemas
// ============================================

// --- Core Enums ---
export type ImpactBucket = 'danger' | 'negative' | 'neutral' | 'positive' | 'gain';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type EventType = 'commodity_shock' | 'policy_change' | 'geopolitical' | 'monetary_policy' | 'trade_action' | 'other';
export type Direction = 'positive' | 'negative' | 'neutral' | 'mixed';
export type Magnitude = 'low' | 'medium' | 'high' | 'extreme';
export type Duration = 'short' | 'medium' | 'long';
export type Certainty = 'low' | 'medium' | 'high';
export type DepthMode = 'quick' | 'standard' | 'deep';
export type ReportType = 'market' | 'company';
export type PlanStance = 'defend' | 'capitalize' | 'both';
export type TimeHorizon = 'immediate' | 'short' | 'long';
export type VerificationStatus = 'human-verified' | 'llm-draft';

// --- Event Parsing ---
export interface ParsedEvent {
  headline: string;
  event_type: EventType;
  geographies: string[];
  magnitude: Magnitude;
  duration: Duration;
  certainty: Certainty;
  direction_for_india: Direction;
  key_facts: string[];
  unknowns: string[];
}

// --- Channel Impact ---
export interface ChannelImpact {
  channel: string;
  active: boolean;
  direction: Direction;
  strength: number; // 1-5
  reason: string;
}

// --- Macro Impact ---
export interface MacroImpactField {
  direction: Direction;
  magnitude_band: 'small' | 'medium' | 'large';
  confidence: ConfidenceLevel;
  horizon: Duration;
}

export interface MacroImpact {
  gdp: MacroImpactField;
  cpi: MacroImpactField;
  cad: MacroImpactField;
  inr: MacroImpactField;
  yield10y: MacroImpactField;
  rbi_stance: MacroImpactField;
  fii_flows: MacroImpactField;
  index_tone: MacroImpactField;
}

export interface MacroSnapshot {
  nifty: number;
  sensex: number;
  vix: number;
  usd_inr: number;
  brent: number;
  gold: number;
  us10y: number;
  repo_rate: number;
  timestamp: string;
}

// --- Sector Impact ---
export interface SectorImpact {
  sector: string;
  score: number; // -5 to +5
  confidence: ConfidenceLevel;
  reason: string;
  key_channels: string[];
}

// --- Company Impact (Market Report) ---
export interface CompanyImpact {
  symbol: string;
  name: string;
  sector: string;
  impact_score: number; // -5 to +5
  bucket: ImpactBucket;
  primary_channels: string[];
  reasoning: string;
  magnitude_estimate: string;
  horizon: Duration;
  confidence: ConfidenceLevel;
  mitigants: string[];
  data_gaps: string[];
}

// --- Scenarios ---
export interface Scenario {
  name: 'best' | 'base' | 'worst';
  narrative: string;
  triggers: string[];
  bucket_shifts: Array<{ symbol: string; from: ImpactBucket; to: ImpactBucket }>;
}

// --- Market Report ---
export interface MarketReport {
  id: string;
  type: 'market';
  event: ParsedEvent;
  channels: ChannelImpact[];
  macro: MacroImpact;
  macro_backdrop: MacroSnapshot;
  sectors: SectorImpact[];
  companies: CompanyImpact[];
  uncertain: CompanyImpact[];
  scenarios: Scenario[];
  timeline: Array<{ period: string; events: string[] }>;
  watchlist: Array<{ trigger: string; action: string }>;
  analogues: Array<{ event: string; date: string; outcome: string }>;
  assumptions: string[];
  appendix: {
    models_used: string[];
    prompt_versions: string[];
    call_count: number;
    generation_time_seconds: number;
    depth: DepthMode;
    generated_at: string;
  };
  monte_carlo?: {
    simulations_count: number;
    base_ebitda_cr: number;
    expected_ebitda_cr: number;
    base_margin_pct: number;
    expected_margin_pct: number;
    margin_contraction_bps: number;
    ebitda_drawdown_p5_cr: number;
    ebitda_drawdown_p1_cr: number;
    var_95_drawdown_pct: number;
    var_99_drawdown_pct: number;
    prob_negative_ebitda_pct: number;
    prob_covenant_breach_pct: number;
    interest_coverage_base: number;
    interest_coverage_p5: number;
    cash_runway_months_p5: number;
    distribution_bins: Array<{
      bin_label: string;
      bin_center: number;
      count: number;
      probability_pct: number;
    }>;
    summary_interpretation: string;
  };
}

// --- Company Dimension Impact (Company Report) ---
export interface CompanyDimensionImpact {
  dimension: string;
  impact: number; // -3 to +3
  explanation: string;
  evidence: string;
  magnitude_estimate: string;
  timing: TimeHorizon;
  confidence: ConfidenceLevel;
}

export interface ResilienceSnapshot {
  score: number; // 0-100
  band: 'high' | 'medium' | 'low';
  strengths: string[];
  weaknesses: string[];
  ratios: Record<string, string | number>;
}

export interface ActionItem {
  action: string;
  lever: string;
  why: string;
  owner: string;
  cost_effort: 'low' | 'medium' | 'high';
  expected_effect: string;
  risk: string;
}

export interface StrategyPlan {
  stance: PlanStance;
  immediate_0_30d: ActionItem[];
  short_term_1_6m: ActionItem[];
  long_term_6_24m: ActionItem[];
  kpis_to_track: Array<{ kpi: string; target: string; frequency: string }>;
  trigger_points: Array<{ condition: string; then_switch_to: string }>;
  plan_risks: string[];
  assumptions: string[];
}

export interface PeerComparison {
  symbol: string;
  name: string;
  impact_score: number;
  bucket: ImpactBucket;
  better_than_subject: boolean;
}

export interface TechnicalView {
  period: '1D' | '1W' | '1M';
  chart_data: Array<{ date: string; price: number }>;
  bias: 'bullish' | 'bearish' | 'neutral';
  key_levels: { support: number; resistance: number };
}

export interface NewsSentimentItem {
  headline: string;
  source: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  materiality: 'high' | 'medium' | 'low';
}

// --- Company Report ---
export interface CompanyReport {
  id: string;
  type: 'company';
  company: {
    symbol: string;
    name: string;
    sector: string;
    price: number;
    impact_score: number;
    business_summary?: string;
  };
  event: ParsedEvent;
  channels: ChannelImpact[];
  dimensions: CompanyDimensionImpact[];
  resilience: ResilienceSnapshot;
  market_view: {
    technicals: TechnicalView[];
    priced_in_note: string;
    news_sentiment: NewsSentimentItem[];
  };
  macro_backdrop: MacroSnapshot;
  peers: PeerComparison[];
  strategy: StrategyPlan;
  scenarios: Scenario[];
  analogues: Array<{ event: string; date: string; outcome: string }>;
  limitations: string[];
  appendix: {
    models_used: string[];
    prompt_versions: string[];
    call_count: number;
    generation_time_seconds: number;
    depth: DepthMode;
    generated_at: string;
  };
  monte_carlo?: {
    simulations_count: number;
    base_ebitda_cr: number;
    expected_ebitda_cr: number;
    base_margin_pct: number;
    expected_margin_pct: number;
    margin_contraction_bps: number;
    ebitda_drawdown_p5_cr: number;
    ebitda_drawdown_p1_cr: number;
    var_95_drawdown_pct: number;
    var_99_drawdown_pct: number;
    prob_negative_ebitda_pct: number;
    prob_covenant_breach_pct: number;
    interest_coverage_base: number;
    interest_coverage_p5: number;
    cash_runway_months_p5: number;
    distribution_bins: Array<{
      bin_label: string;
      bin_center: number;
      count: number;
      probability_pct: number;
    }>;
    summary_interpretation: string;
  };
}

// --- Exposure Profile (Knowledge Base) ---
export interface ExposureProfile {
  symbol: string;
  name: string;
  sector: string;
  verification: VerificationStatus;
  confidence: ConfidenceLevel;
  last_verified: string;
  business_summary: string;
  revenue_mix: Record<string, number>;
  exposure_tags: string[];
  resilience: ResilienceSnapshot;
  ratios: Record<string, string | number>;
  sources: string[];
}

// --- Sector Matrix ---
export interface SectorMatrixCell {
  sector: string;
  channel: string;
  sensitivity: number; // -5 to +5
  reasoning: string;
}

// --- Universe Company ---
export interface UniverseCompany {
  symbol: string;
  name: string;
  sector: string;
  market_cap_bucket: 'large' | 'mid' | 'small';
  price_series: number[]; // mini sparkline data
  resilience_band: 'high' | 'medium' | 'low';
  tags: string[];
}

// --- Keys & Models ---
export interface KeyStatus {
  alias: string;
  status: 'ok' | 'cooling_down' | 'exhausted' | 'dead';
  used_today: number;
  cap: number;
  cooldown_until?: string;
  last_error?: string;
}

export interface ModelStatus {
  name: string;
  provider: string;
  success_rate: number;
  ban_penalty: 'none' | 'soft' | 'hard';
  avg_latency_ms: number;
}

// --- Data Status ---
export interface DataSourceStatus {
  name: string;
  type: 'prices' | 'fundamentals' | 'news' | 'macro' | 'filings' | 'knowledge';
  last_refresh: string;
  coverage_pct: number;
  stale_warning: boolean;
  health: 'ok' | 'degraded' | 'down';
}

// --- Reports History ---
export interface SavedReport {
  id: string;
  type: ReportType;
  title: string;
  company?: string;
  date: string;
  depth: DepthMode;
  bucket_counts: Record<ImpactBucket, number>;
}

// --- Simulation / Gateway ---
export interface GatewayEvent {
  timestamp: string;
  key: string;
  model: string;
  event: string;
  type: 'success' | 'warning' | 'info' | 'error';
  duration_ms: number;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'warning' | 'error';
  logs: string[];
  started_at?: string;
  completed_at?: string;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  data: T;
  meta: { cached: boolean; latency_ms: number };
}

export type AnyReport = MarketReport | CompanyReport;