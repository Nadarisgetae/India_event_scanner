import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Skeleton, Badge } from '@/components';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDemoSettings } from '@/utils/demoSettings';
import { apiClient } from '@/api/client';

const PIPELINE_STEPS_B = [
  { id: 'understand', label: 'Event Understanding', logs: ['Parsing event text', 'Classifying event type', 'Extracting key facts'] },
  { id: 'channels', label: 'Company Channel Intersection', logs: ['Filtering channels to company exposure', 'Scoring relevance'] },
  { id: 'dimensions', label: 'Impact by Dimension', logs: ['Revenue impact', 'Pricing power', 'Input costs', 'Margins', 'Working capital', 'Debt & interest', 'Forex', 'Supply chain', 'Demand', 'Regulatory', 'Reputation', 'Capex', 'Governance'] },
  { id: 'resilience', label: 'Financial Resilience', logs: ['Ratio analysis', 'Runway estimation', 'Stress testing'] },
  { id: 'market', label: 'Market View', logs: ['Technical bias (1D/1W/1M)', 'News sentiment (10 headlines)', 'Priced-in check'] },
  { id: 'peers', label: 'Peer Comparison', logs: ['Relative positioning', 'Bucket comparison'] },
  { id: 'plan', label: 'Strategic Plan Generation', logs: ['Defend actions (0-30d, 1-6m, 6-24m)', 'Capitalize actions (0-30d, 1-6m, 6-24m)', 'KPIs & triggers'] },
  { id: 'scenarios', label: 'Plan Scenarios', logs: ['Best case', 'Base case', 'Worst case'] },
  { id: 'report', label: 'Report Assembly', logs: ['Generating executive summary', 'Building tables & charts', 'Finalising PDF layout'] },
];

export function CompanyRun() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<Record<string, 'pending' | 'running' | 'done' | 'warning'>>({});
  const [gatewayLogs, setGatewayLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);
  const [exhaustedResolved, setExhaustedResolved] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [liveReportId, setLiveReportId] = useState<string | null>(null);

  const scenarioId = useMemo(() => sessionStorage.getItem('mockCompanyScenario') || 'MB-1', []);
  const companySymbol = useMemo(() => sessionStorage.getItem('mockCompany') || 'ASIANPAINT', []);
  const eventText = useMemo(() => sessionStorage.getItem('mockCompanyEvent') || 'Crude Oil Spike', []);
  const demoSettings = useMemo(() => getDemoSettings(), []);
  const runTriggered = useRef(false);

  useEffect(() => {
    if (runTriggered.current) return;
    runTriggered.current = true;
    apiClient.runCompanyAnalysis({
      symbol: companySymbol,
      event_text: eventText,
      category: 'macro',
      synchronous: true
    }).then(res => {
      const repId = res.report_id || (res.report && res.report.id);
      if (repId) {
        setLiveReportId(repId);
        setGatewayLogs(prev => [...prev, `[FastAPI Engine] Generated executive company report: ${repId}`]);
      }
    }).catch(err => {
      console.warn("Backend company run notice:", err);
    });
  }, [companySymbol, eventText]);

  useEffect(() => {
    if (completed || isPaused || isExhausted || stepError) return;
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, [completed, isPaused, isExhausted, stepError]);

  useEffect(() => {
    if (completed || isPaused || isExhausted || stepError) return;

    if (currentStep >= PIPELINE_STEPS_B.length) {
      setCompleted(true);
      const delay = demoSettings.simSpeed === 'instant' ? 100 : 800;
      setTimeout(() => navigate(`/company/report/${liveReportId || scenarioId}`), delay);
      return;
    }

    const step = PIPELINE_STEPS_B[currentStep];

    // Simulate All Keys Exhausted Edge Case
    if (demoSettings.simulateAllKeysExhausted && currentStep === 3 && !exhaustedResolved) {
      setIsExhausted(true);
      setStepStatus(prev => ({ ...prev, [step.id]: 'warning' }));
      setGatewayLogs(prev => [
        ...prev,
        '[Gateway] Key 1: 429 Rate limited (Daily quota exhausted)',
        '[Gateway] Key 2: 429 Rate limited (Daily quota exhausted)',
        '[Gateway] Key 3: 429 Rate limited (Daily quota exhausted)',
        '[Gateway] CRITICAL: All API keys exhausted. Pipeline paused.',
      ]);
      return;
    }

    // Simulate Step Error Edge Case
    if (demoSettings.simulateErrorAtStep && currentStep === 2 && !stepError) {
      setStepError(step.label);
      setStepStatus(prev => ({ ...prev, [step.id]: 'warning' }));
      setGatewayLogs(prev => [
        ...prev,
        `[Gateway] Model timeout at step "${step.label}". Partial batch uncommitted.`,
      ]);
      return;
    }

    setStepStatus(prev => ({ ...prev, [step.id]: 'running' }));

    const speedMult = demoSettings.simSpeed === 'instant' ? 0.05 :
                      demoSettings.simSpeed === '5x' ? 0.2 :
                      demoSettings.simSpeed === '2x' ? 0.5 : 1.0;

    const stepDuration = Math.max(100, (1800 + Math.random() * 1000) * speedMult);
    const logInterval = Math.max(30, stepDuration / (step.logs.length + 1));

    let logIndex = 0;
    const logTimer = setInterval(() => {
      if (logIndex < step.logs.length) {
        setGatewayLogs(prev => [...prev, `[${step.label}] ${step.logs[logIndex]}`]);
        logIndex++;
      } else {
        clearInterval(logTimer);
      }
    }, logInterval);

    const completionTimer = setTimeout(() => {
      clearInterval(logTimer);
      setStepStatus(prev => ({ ...prev, [step.id]: 'done' }));
      setCurrentStep(prev => prev + 1);
    }, stepDuration);

    return () => {
      clearInterval(logTimer);
      clearTimeout(completionTimer);
    };
  }, [currentStep, navigate, completed, scenarioId, demoSettings, isPaused, isExhausted, exhaustedResolved, stepError]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" disabled={!completed} onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Simulating Company Analysis</h1>
          <p className="text-text-muted">Mode B · Company: {companySymbol} · Scenario: {scenarioId}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-mono text-nums text-text-muted">Elapsed: {formatTime(elapsed)}</p>
          <p className="text-xs text-text-muted">Speed: {demoSettings.simSpeed}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Pipeline Progress</CardTitle>
              <CardDescription>Mode B: Company-specific pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PIPELINE_STEPS_B.map((step, idx) => {
                const status = stepStatus[step.id] || 'pending';
                const isCurrent = idx === currentStep && !completed;
                const isDone = status === 'done';

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${isCurrent ? 'bg-brand-light/30' : ''}`}
                  >
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDone ? 'bg-bucket-positive text-white' : isCurrent ? 'bg-brand text-white animate-pulse' : 'bg-surface-2 text-text-muted'}`}>
                        {isDone ? <CheckCircle className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                      </div>
                      {idx < PIPELINE_STEPS_B.length - 1 && <div className={`w-0.5 h-16 mt-1 ${isDone ? 'bg-bucket-positive' : 'bg-border'}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`${isDone ? 'text-text' : isCurrent ? 'text-brand' : 'text-text-muted'} font-medium`}>{step.label}</p>
                      {isCurrent && <p className="text-sm text-text-muted mt-1">{step.logs[0]}</p>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {isDone && <Badge variant="subtle" size="sm" className="bg-bucket-positive-bg text-bucket-positive">Done</Badge>}
                      {isCurrent && <Badge variant="subtle" size="sm" className="bg-brand-light text-brand">Running</Badge>}
                      {status === 'pending' && <Badge variant="subtle" size="sm">Pending</Badge>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card variant="outlined" padding="md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text">Overall Progress</span>
              <span className="text-sm font-mono text-nums text-text-muted">{Math.round((currentStep / PIPELINE_STEPS_B.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${(currentStep / PIPELINE_STEPS_B.length) * 100}%` }} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card variant="default" padding="lg" className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                LLM Gateway Feed
              </CardTitle>
              <CardDescription>Live call log</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto space-y-2 font-mono text-xs" role="log">
                {gatewayLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 px-2 py-1 rounded text-text-muted hover:bg-surface-2">
                    <span className="text-brand/60">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                {gatewayLogs.length === 0 && <p className="text-text-muted text-center py-8">Waiting...</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edge Case: All Keys Exhausted */}
      {isExhausted && (
        <Card variant="default" padding="lg" className="bg-bucket-danger-bg/40 border-bucket-danger-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-bucket-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-text text-base">All API Keys Exhausted (Quota Depleted)</p>
              <p className="text-sm text-text-muted">
                All 3 keys in the rotation pool have encountered 429 rate limits. Analysis is suspended with state checkpointed.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="primary" onClick={() => {
                  setGatewayLogs(prev => [...prev, '[Gateway] Auxiliary emergency key (Key 4) provisioned → 2.1s ✓', '[Gateway] Resuming company analysis...']);
                  setIsExhausted(false);
                  setExhaustedResolved(true);
                }}>
                  Add Mock Key & Resume
                </Button>
                <Button variant="outline" onClick={() => navigate('/reports')}>
                  Resume Later (Go to History)
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Edge Case: Step Error Simulation */}
      {stepError && (
        <Card variant="default" padding="lg" className="bg-bucket-negative-bg/40 border-bucket-negative-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-bucket-negative flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-text text-base">Pipeline Error Simulated at {stepError}</p>
              <p className="text-sm text-text-muted">
                A transient model socket interruption occurred as configured in Demo Controls.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="primary" onClick={() => {
                  setGatewayLogs(prev => [...prev, `[Gateway] Retrying step "${stepError}"...`, `[Gateway] Success via fallback model ✓`]);
                  setStepError(null);
                }}>
                  Retry Step
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Abort
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!completed && !isExhausted && !stepError && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsPaused(p => !p)}>
            {isPaused ? 'Resume Pipeline' : 'Pause'}
          </Button>
          <Button variant="danger" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      )}

      {completed && (
        <Card variant="default" padding="lg" className="bg-bucket-positive-bg border-bucket-positive-border">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-bucket-positive" />
            <div>
              <p className="font-medium text-text">Analysis Complete</p>
              <p className="text-sm text-text-muted">Redirecting to report...</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}