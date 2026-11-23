// ============================================
// RUN SIMULATOR — Simulates the analysis pipeline
// ============================================

import type { PipelineStep, GatewayEvent } from '@/types';

export type RunMode = 'market' | 'company';

export interface SimulatorOptions {
  speed?: number | 'instant'; // 1x, 2x, 5x, instant
  forceErrorAtStep?: string;
  forceAllKeysExhausted?: boolean;
  forceSlowRun?: boolean;
}

export interface SimulatorEvent {
  type: 'step_started' | 'step_log' | 'gateway_event' | 'step_done' | 'step_warning' | 'step_error' | 'completed' | 'paused' | 'resumed';
  stepId?: string;
  stepIndex?: number;
  log?: string;
  gatewayEvent?: GatewayEvent;
  progress?: number;
  elapsedMs?: number;
  estimatedRemainingMs?: number;
  partialResults?: any;
  error?: string;
}

const MARKET_PIPELINE_STEPS: Omit<PipelineStep, 'status' | 'started_at' | 'completed_at'>[] = [
  { id: 'understand', label: 'Event Understanding', logs: ['Parsing event text', 'Classifying event type', 'Extracting key facts', 'Identifying unknowns'] },
  { id: 'channels', label: 'Channel Mapping', logs: ['Mapping to transmission channels', 'Scoring channel strength (1-5)', 'Determining direction per channel'] },
  { id: 'macro', label: 'Macro Impact', logs: ['Estimating GDP impact', 'CPI/inflation pass-through', 'CAD & INR projection', 'RBI stance inference', 'FII flow estimation'] },
  { id: 'sectors', label: 'Sector Ranking', logs: ['Scoring 25 sectors against priors', 'Adjusting for current macro backdrop', 'Applying event-specific overrides'] },
  { id: 'shortlist', label: 'Candidate Shortlist', logs: ['Filtering universe by liquidity', 'Selecting top 50 companies', 'Fetching fundamentals & prices'] },
  { id: 'scoring', label: 'Company Scoring', logs: ['Batch 1/6 — 8 companies', 'Batch 2/6 — 8 companies', 'Batch 3/6 — 8 companies', 'Batch 4/6 — 8 companies', 'Batch 5/6 — 9 companies', 'Batch 6/6 — 9 companies'] },
  { id: 'calibration', label: 'Calibration & Bucketing', logs: ['Normalising scores across sectors', 'Assigning impact buckets', 'Cross-checking outliers', 'Flagging uncertain companies'] },
  { id: 'scenarios', label: 'Scenario Generation', logs: ['Best case: OPEC+ reverses', 'Base case: cuts hold', 'Worst case: deeper cuts', 'Bucket shift predictions'] },
  { id: 'report', label: 'Report Assembly', logs: ['Generating executive summary', 'Building tables & charts', 'Finalising PDF layout', 'Adding appendix & disclaimer'] },
];

const COMPANY_PIPELINE_STEPS: Omit<PipelineStep, 'status' | 'started_at' | 'completed_at'>[] = [
  { id: 'understand', label: 'Event Understanding', logs: ['Parsing event text', 'Classifying event type', 'Extracting key facts', 'Identifying unknowns'] },
  { id: 'channels', label: 'Company Channel Intersection', logs: ['Filtering channels to company exposure', 'Scoring relevance per channel', 'Identifying untouched channels'] },
  { id: 'dimensions', label: 'Impact by Dimension', logs: ['Revenue impact', 'Pricing power', 'Input costs', 'Margins', 'Working capital', 'Debt & interest', 'Forex', 'Supply chain', 'Demand', 'Regulatory', 'Reputation', 'Capex', 'Governance'] },
  { id: 'resilience', label: 'Financial Resilience', logs: ['Ratio analysis (Debt/Equity, Current, Coverage)', 'Runway estimation', 'Stress testing scenarios'] },
  { id: 'market', label: 'Market View', logs: ['Technical bias (1D/1W/1M)', 'News sentiment (10 headlines)', 'Priced-in check'] },
  { id: 'peers', label: 'Peer Comparison', logs: ['Relative positioning vs 4-5 peers', 'Bucket comparison', 'Valuation context'] },
  { id: 'plan', label: 'Strategic Plan Generation', logs: ['Defend actions (0-30d, 1-6m, 6-24m)', 'Capitalize actions (0-30d, 1-6m, 6-24m)', 'KPIs & trigger points'] },
  { id: 'scenarios', label: 'Plan Scenarios', logs: ['Best case', 'Base case', 'Worst case', 'Plan performance under each'] },
  { id: 'report', label: 'Report Assembly', logs: ['Generating executive summary', 'Building tables & charts', 'Finalising PDF layout', 'Adding appendix & disclaimer'] },
];

const GATEWAY_EVENTS_MARKET: GatewayEvent[] = [
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Event understanding → 1.2s ✓', type: 'success', duration_ms: 1200 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Channel mapping → 0.9s ✓', type: 'success', duration_ms: 900 },
  { timestamp: '', key: 'Key 2 (Pro)', model: 'gemini-1.5-pro', event: 'Macro impact → 2.1s ✓', type: 'success', duration_ms: 2100 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Sector ranking → 1.8s ✓', type: 'success', duration_ms: 1800 },
  { timestamp: '', key: 'Key 3 (Flash-8B)', model: 'gemini-1.5-flash-8b', event: 'Batch 1/6 scoring → 3.2s ✓', type: 'success', duration_ms: 3200 },
  { timestamp: '', key: 'Key 3 (Flash-8B)', model: 'gemini-1.5-flash-8b', event: 'Rate limited (429) → cooldown 60s', type: 'warning', duration_ms: 60000 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Switched to Key 1 → Batch 2/6 → 2.8s ✓', type: 'success', duration_ms: 2800 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Cache hit ✓ Batch 3/6', type: 'info', duration_ms: 100 },
  { timestamp: '', key: 'Key 2 (Pro)', model: 'gemini-1.5-pro', event: 'Batch 4/6 scoring → 4.1s ✓', type: 'success', duration_ms: 4100 },
  { timestamp: '', key: 'Key 2 (Pro)', model: 'gemini-1.5-pro', event: 'Model unavailable → fallback to flash', type: 'warning', duration_ms: 500 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Batch 5/6 scoring → 3.5s ✓', type: 'success', duration_ms: 3500 },
  { timestamp: '', key: 'Key 3 (Flash-8B)', model: 'gemini-1.5-flash-8b', event: 'Batch 6/6 scoring → 3.1s ✓', type: 'success', duration_ms: 3100 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Calibration → 1.5s ✓', type: 'success', duration_ms: 1500 },
  { timestamp: '', key: 'Key 2 (Pro)', model: 'gemini-1.5-pro', event: 'Scenarios → 2.8s ✓', type: 'success', duration_ms: 2800 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Report assembly → 2.2s ✓', type: 'success', duration_ms: 2200 },
];

const GATEWAY_EVENTS_COMPANY: GatewayEvent[] = [
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Event understanding → 1.1s ✓', type: 'success', duration_ms: 1100 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Channel intersection → 0.8s ✓', type: 'success', duration_ms: 800 },
  { timestamp: '', key: 'Key 2 (Pro)', model: 'gemini-1.5-pro', event: 'Dimension scoring (13) → 3.5s ✓', type: 'success', duration_ms: 3500 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Resilience analysis → 1.8s ✓', type: 'success', duration_ms: 1800 },
  { timestamp: '', key: 'Key 3 (Flash-8B)', model: 'gemini-1.5-flash-8b', event: 'Market view (technicals+news) → 2.2s ✓', type: 'success', duration_ms: 2200 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Peer comparison → 1.2s ✓', type: 'success', duration_ms: 1200 },
  { timestamp: '', key: 'Key 2 (Pro)', model: 'gemini-1.5-pro', event: 'Plan generation (Defend/Capitalize) → 4.2s ✓', type: 'success', duration_ms: 4200 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Scenarios → 1.9s ✓', type: 'success', duration_ms: 1900 },
  { timestamp: '', key: 'Key 1 (Primary)', model: 'gemini-1.5-flash', event: 'Report assembly → 2.0s ✓', type: 'success', duration_ms: 2000 },
];

function getPipelineSteps(mode: RunMode) {
  return mode === 'market' ? MARKET_PIPELINE_STEPS : COMPANY_PIPELINE_STEPS;
}

function getGatewayEvents(mode: RunMode) {
  return mode === 'market' ? GATEWAY_EVENTS_MARKET : GATEWAY_EVENTS_COMPANY;
}

function getBaseStepDuration(stepId: string): number {
  const durations: Record<string, number> = {
    understand: 2000,
    channels: 1500,
    macro: 3000,
    sectors: 2500,
    shortlist: 1500,
    scoring: 8000,
    calibration: 2000,
    scenarios: 3000,
    report: 2500,
    resilience: 2000,
    market: 2500,
    peers: 1500,
    plan: 4000,
  };
  return durations[stepId] || 2000;
}

export async function* runSimulator(
  mode: RunMode,
  scenarioId: string,
  options: SimulatorOptions = {}
): AsyncGenerator<SimulatorEvent> {
  const { speed = 1, forceErrorAtStep, forceAllKeysExhausted, forceSlowRun } = options;
  const steps = getPipelineSteps(mode);
  const gatewayEvents = getGatewayEvents(mode);
  const speedMultiplier = speed === 'instant' ? 0 : 1 / speed;

  let elapsedMs = 0;
  let gatewayIndex = 0;

  // Initialize step statuses
  const stepStatuses: Record<string, PipelineStep['status']> = {};
  steps.forEach(s => { stepStatuses[s.id] = 'pending'; });

  // Helper to emit gateway events for current step
  const emitGatewayEventsForStep = (stepId: string) => {
    const stepEvents = gatewayEvents.filter(e => {
      // Simple mapping: check if event mentions step keywords
      const eventLower = e.event.toLowerCase();
      if (stepId === 'scoring') return eventLower.includes('batch') || eventLower.includes('cache') || eventLower.includes('rate limited') || eventLower.includes('switched') || eventLower.includes('model unavailable') || eventLower.includes('fallback');
      if (stepId === 'macro') return eventLower.includes('macro');
      if (stepId === 'sectors') return eventLower.includes('sector');
      if (stepId === 'calibration') return eventLower.includes('calibration');
      if (stepId === 'scenarios') return eventLower.includes('scenario');
      if (stepId === 'report') return eventLower.includes('assembly') || eventLower.includes('report');
      if (stepId === 'understand') return eventLower.includes('understanding') || eventLower.includes('event');
      if (stepId === 'channels') return eventLower.includes('channel') || eventLower.includes('mapping');
      if (stepId === 'dimensions') return eventLower.includes('dimension');
      if (stepId === 'resilience') return eventLower.includes('resilience');
      if (stepId === 'market') return eventLower.includes('market') || eventLower.includes('technical') || eventLower.includes('news');
      if (stepId === 'peers') return eventLower.includes('peer');
      if (stepId === 'plan') return eventLower.includes('plan');
      return false;
    });
    return stepEvents;
  };

  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const step = steps[stepIndex];
    const stepId = step.id;

    // Check for forced error
    if (forceErrorAtStep === stepId) {
      yield { type: 'step_error', stepId, stepIndex, error: `Simulated error at ${step.label}`, elapsedMs };
      return;
    }

    // Check for forced all keys exhausted
    if (forceAllKeysExhausted && stepIndex === 4) { // At scoring step
      yield { type: 'step_warning', stepId, stepIndex, log: 'ALL KEYS EXHAUSTED — Run paused. Partial results saved.', elapsedMs };
      yield { type: 'completed', stepId, stepIndex, partialResults: { scenarioId, completedSteps: stepIndex }, elapsedMs };
      return;
    }

    // Step started
    stepStatuses[stepId] = 'running';
    const startedAt = new Date().toISOString();
    yield { type: 'step_started', stepId, stepIndex, progress: stepIndex / steps.length, elapsedMs, estimatedRemainingMs: (steps.length - stepIndex) * 3000 * speedMultiplier };

    // Emit step logs
    for (const log of step.logs) {
      await new Promise(r => setTimeout(r, (300 + Math.random() * 200) * speedMultiplier));
      elapsedMs += (300 + Math.random() * 200) * speedMultiplier;
      yield { type: 'step_log', stepId, stepIndex, log, elapsedMs };
    }

    // Emit gateway events for this step
    const stepGatewayEvents = emitGatewayEventsForStep(stepId);
    for (const gw of stepGatewayEvents) {
      await new Promise(r => setTimeout(r, (100 + Math.random() * 200) * speedMultiplier));
      elapsedMs += (100 + Math.random() * 200) * speedMultiplier;
      yield { type: 'gateway_event', stepId, stepIndex, gatewayEvent: { ...gw, timestamp: new Date(Date.now() - (gatewayEvents.length - gatewayIndex) * 1000).toISOString() }, elapsedMs };
      gatewayIndex++;
    }

    // Step done
    stepStatuses[stepId] = 'done';
    const completedAt = new Date().toISOString();
    yield { type: 'step_done', stepId, stepIndex, progress: (stepIndex + 1) / steps.length, elapsedMs };
  }

  // All done
  yield { type: 'completed', progress: 1, elapsedMs, estimatedRemainingMs: 0 };
}

// Resume simulator from saved state
export async function* resumeSimulator(
  mode: RunMode,
  scenarioId: string,
  completedStepCount: number,
  options: SimulatorOptions = {}
): AsyncGenerator<SimulatorEvent> {
  const steps = getPipelineSteps(mode);
  const remainingSteps = steps.slice(completedStepCount);

  yield { type: 'resumed', progress: completedStepCount / steps.length, elapsedMs: 0 };

  for (let i = 0; i < remainingSteps.length; i++) {
    const step = remainingSteps[i];
    const stepIndex = completedStepCount + i;

    // Simplified - just run through remaining steps quickly
    yield { type: 'step_started', stepId: step.id, stepIndex, progress: stepIndex / steps.length, elapsedMs: 0 };
    for (const log of step.logs) {
      yield { type: 'step_log', stepId: step.id, stepIndex, log, elapsedMs: 0 };
    }
    yield { type: 'step_done', stepId: step.id, stepIndex, progress: (stepIndex + 1) / steps.length, elapsedMs: 0 };
  }

  yield { type: 'completed', progress: 1, elapsedMs: 0 };
}