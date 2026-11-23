import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

interface MonteCarloBin {
  bin_label: string;
  bin_center: number;
  count: number;
  probability_pct: number;
}

interface MonteCarloSimulation {
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
  distribution_bins: MonteCarloBin[];
  summary_interpretation: string;
}

interface MonteCarloChartProps {
  simulation?: MonteCarloSimulation;
  symbol: string;
}

export function MonteCarloChart({ simulation, symbol }: MonteCarloChartProps) {
  if (!simulation || !simulation.distribution_bins || simulation.distribution_bins.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mb-8 border border-border bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand/10 text-brand">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Parametric Monte Carlo Earnings & Margin Simulation
            </h3>
            <p className="text-xs text-muted-foreground">
              10,000 stochastic shock iterations modeling commodity inflation, FX drift, and price pass-through
            </p>
          </div>
        </div>
        <Badge variant="subtle" className="self-start sm:self-center">
          10,000 Paths Vectorized
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-5">
        <div className="p-3.5 rounded-lg bg-surface-alt border border-border">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5 text-warning" />
            Expected Margin Shift
          </span>
          <div className="text-lg font-bold mt-1 text-foreground">
            {simulation.expected_margin_pct}%
            <span className="text-xs font-normal text-muted-foreground ml-1.5">
              (from {simulation.base_margin_pct}%)
            </span>
          </div>
          <span className="text-[11px] text-danger font-medium mt-0.5 block">
            -{simulation.margin_contraction_bps} bps contraction
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-alt border border-border">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-danger" />
            Value at Risk (95% VaR)
          </span>
          <div className="text-lg font-bold mt-1 text-danger">
            -{simulation.var_95_drawdown_pct}%
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Max expected EBITDA loss ₹{Math.round(simulation.base_ebitda_cr - simulation.ebitda_drawdown_p5_cr)} Cr
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-alt border border-border">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Covenant Breach Risk
          </span>
          <div className={`text-lg font-bold mt-1 ${
            simulation.prob_covenant_breach_pct > 10 ? 'text-danger' : 'text-success'
          }`}>
            {simulation.prob_covenant_breach_pct}%
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            P(Interest Coverage &lt; 1.5x)
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-alt border border-border">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-success" />
            Stressed Cash Buffer
          </span>
          <div className="text-lg font-bold mt-1 text-foreground">
            {simulation.cash_runway_months_p5} mo
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Runway at 95th %ile burn
          </span>
        </div>
      </div>

      {/* Histogram of Margin Outcomes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Stressed Operating Margin Distribution (Probability Density)</span>
          <span>Baseline Margin: {simulation.base_margin_pct}%</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simulation.distribution_bins} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis 
                dataKey="bin_label" 
                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} 
                interval={1}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                unit="%" 
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as MonteCarloBin;
                    return (
                      <div className="bg-popover border border-border p-2 rounded shadow text-xs">
                        <p className="font-semibold text-foreground">{data.bin_label}</p>
                        <p className="text-brand">Probability: {data.probability_pct}%</p>
                        <p className="text-muted-foreground">{data.count.toLocaleString()} paths</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="probability_pct" radius={[3, 3, 0, 0]}>
                {simulation.distribution_bins.map((entry, index) => {
                  const isLow = entry.bin_center < simulation.base_margin_pct * 0.7;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isLow ? '#ef4444' : '#3b82f6'} 
                      opacity={0.85} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interpretation footer */}
      {simulation.summary_interpretation && (
        <div className="mt-4 p-3.5 rounded-lg bg-surface-alt border border-border/80 text-xs text-foreground/90 leading-relaxed">
          <span className="font-semibold text-brand mr-1.5">Simulation Interpretation:</span>
          {simulation.summary_interpretation}
        </div>
      )}
    </Card>
  );
}
