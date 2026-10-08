import React from 'react';
import {
  ArrowDown,
  CheckCircle2,
  Filter,
  Layers,
  Percent,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';

interface PurchaseBehaviorProps {
  journey: any;
  isDark: boolean;
}

export const PurchaseBehavior: React.FC<PurchaseBehaviorProps> = ({ journey, isDark }) => {
  const positions = journey?.cart_positions || [];
  const stages = journey?.journey_stages || [];

  const posIndices = positions.map((p: any) => p.cart_position);
  const reorderRates = positions.map((p: any) => (p.position_reorder_rate * 100).toFixed(1));
  const counts = positions.map((p: any) => p.item_count);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-indigo-400" />
            Purchase Journey &amp; Cart Position Economics
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Analyzing customer add-to-cart sequential priority and conversion drop-off across the fulfillment funnel.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Percent className="w-3.5 h-3.5" />
          Position 1 Reorder Rate: 68.9%
        </div>
      </div>

      {/* Cart Position Retention Decay Curve */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-rose-400" />
          Add-to-Cart Sequence Decay Curve (Positions 1 to 20)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Items placed into the cart in early positions (1–3) have dramatically higher repeat-purchase probability than later additions.
        </p>

        <div className="h-72">
          <PlotlyChart
            isDark={isDark}
            data={[
              {
                x: posIndices,
                y: reorderRates,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Reorder Rate (%)',
                line: { color: '#06b6d4', width: 3 },
                marker: { size: 6, color: '#38bdf8' },
                yaxis: 'y1',
              },
              {
                x: posIndices,
                y: counts,
                type: 'bar',
                name: 'Item Volume Added',
                marker: { color: 'rgba(99, 102, 241, 0.3)' },
                yaxis: 'y2',
              },
            ]}
            layout={{
              margin: { l: 45, r: 45, t: 15, b: 40 },
              xaxis: { title: 'Add-to-Cart Order Sequence' },
              yaxis: { title: 'Reorder Probability (%)', range: [20, 80] },
              yaxis2: {
                title: 'Total Line Items',
                overlaying: 'y',
                side: 'right',
                showgrid: false,
              },
              legend: { orientation: 'h', y: 1.15 },
            }}
          />
        </div>
      </div>

      {/* Funnel Conversion Stages */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Filter className="w-5 h-5 text-cyan-400" />
          End-to-End E-Commerce Conversion Funnel Stages
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Tracking conversion progression from catalog browsing to final order fulfillment.
        </p>

        <div className="space-y-4 max-w-3xl mx-auto">
          {stages.map((stage: any, idx: number) => (
            <div key={idx} className="relative">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-400">{stage.stage}</span>
                  <div className="text-lg font-extrabold text-slate-100 mt-0.5">
                    {stage.count?.toLocaleString()} instances
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400">
                    {stage.conversion_pct}%
                  </span>
                  <div className="text-[10px] text-slate-400">Conversion</div>
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div className="flex justify-center my-1 text-slate-600">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
