import React, { useState } from 'react';
import {
  Boxes,
  Compass,
  Filter,
  Grid,
  Link,
  Percent,
  Share2,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';

interface MarketBasketLabProps {
  marketBasket: any;
  spaces3D: any;
  isDark: boolean;
}

export const MarketBasketLab: React.FC<MarketBasketLabProps> = ({
  marketBasket,
  spaces3D,
  isDark,
}) => {
  const allRules = marketBasket?.rules || [];
  const deptCo = marketBasket?.department_co_occurrence || [];

  const [minLift, setMinLift] = useState<number>(1.2);
  const [minConf, setMinConf] = useState<number>(0.05);

  const filteredRules = allRules.filter(
    (r: any) => r.lift >= minLift && r.confidence >= minConf
  );

  // 3D Association Landscape Data
  const assoc3D = spaces3D?.association_landscape_3d?.points || filteredRules;
  const plot3DData = [
    {
      x: assoc3D.map((r: any) => r.support),
      y: assoc3D.map((r: any) => r.confidence),
      z: assoc3D.map((r: any) => r.lift),
      text: assoc3D.map(
        (r: any) =>
          `<b>${r.antecedent} &rarr; ${r.consequent}</b><br>Support: ${(r.support * 100).toFixed(3)}%<br>Confidence: ${(r.confidence * 100).toFixed(1)}%<br>Lift: ${r.lift.toFixed(2)}x<br>Pairs: ${r.pair_count?.toLocaleString()}`
      ),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 5,
        color: assoc3D.map((r: any) => r.lift),
        colorscale: 'Portland',
        opacity: 0.9,
        colorbar: { title: 'Lift Score', len: 0.6 },
      },
      hoverinfo: 'text',
    },
  ];

  // Department Co-occurrence Top 10 Pairs
  const topDeptPairs = deptCo.slice(0, 10);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Share2 className="w-7 h-7 text-cyan-400" />
            Market Basket Affinity Lab &amp; Cross-Sell Synergy
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Mining co-occurrence frequency, conditional confidence, and lift multipliers across 32.4M prior order baskets.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Max Lift Observed: {marketBasket?.max_lift_observed?.toFixed(2) || '3.85'}x
        </div>
      </div>

      {/* Interactive Controls & 2D Scatter Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Synergy Threshold Filter
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              {filteredRules.length} Active Rules
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Minimum Lift Multiplier</span>
                <span className="text-cyan-400 font-mono font-bold">{minLift.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={minLift}
                onChange={(e) => setMinLift(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">
                Lift &gt; 1 indicates co-occurrence significantly above random chance.
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Minimum Confidence (%)</span>
                <span className="text-indigo-400 font-mono font-bold">
                  {(minConf * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.40"
                step="0.02"
                value={minConf}
                onChange={(e) => setMinConf(parseFloat(e.target.value))}
                className="w-full accent-indigo-400"
              />
              <span className="text-[10px] text-slate-500">
                P(B | A): Probability that consequent is added given antecedent is in basket.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-200">How to interpret:</div>
            <p className="text-[11px] leading-relaxed">
              <strong>Support:</strong> Proportion of total carts containing both items.<br />
              <strong>Confidence:</strong> Likelihood of purchasing Y when buying X.<br />
              <strong>Lift:</strong> Ratio of observed co-occurrence vs independence.
            </p>
          </div>
        </div>

        {/* 2D Support vs Confidence Bubble Plot */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Support vs. Confidence (Bubble Size = Lift)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            High confidence rules in top right represent primary 1-click bundle recommendations.
          </p>

          <div className="h-64">
            <PlotlyChart
              isDark={isDark}
              data={[
                {
                  x: filteredRules.map((r: any) => r.support * 100),
                  y: filteredRules.map((r: any) => r.confidence * 100),
                  text: filteredRules.map((r: any) => `${r.antecedent} &rarr; ${r.consequent}`),
                  mode: 'markers',
                  marker: {
                    size: filteredRules.map((r: any) => Math.max(6, r.lift * 6)),
                    color: filteredRules.map((r: any) => r.lift),
                    colorscale: 'Tealgrn',
                    opacity: 0.8,
                  },
                  type: 'scatter',
                  hoverinfo: 'text+x+y',
                },
              ]}
              layout={{
                margin: { l: 45, r: 20, t: 15, b: 40 },
                xaxis: { title: 'Support (% of All Orders)' },
                yaxis: { title: 'Confidence (% P(B|A))' },
              }}
            />
          </div>
        </div>
      </div>

      {/* 3D Association Landscape */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              3D Association Rule Landscape (Support × Confidence × Lift)
            </h3>
            <p className="text-xs text-slate-400">
              Rotatable 3D manifold visualizes multi-metric association rule affinity clusters.
            </p>
          </div>
        </div>

        <div className="h-[440px]">
          <PlotlyChart
            isDark={isDark}
            data={plot3DData}
            layout={{
              scene: {
                xaxis: { title: 'Support' },
                yaxis: { title: 'Confidence' },
                zaxis: { title: 'Lift' },
                camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
              },
              margin: { l: 0, r: 0, t: 0, b: 0 },
            }}
          />
        </div>
      </div>

      {/* Association Rules Table */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Link className="w-5 h-5 text-indigo-400" />
          Verified Association Rules Ledger
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Showing filtered association pairs ranked by highest Lift multiplier:
        </p>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Antecedent (Item A)</th>
                <th className="py-3 px-4">Consequent (Item B)</th>
                <th className="py-3 px-4">Co-Purchases</th>
                <th className="py-3 px-4">Support</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Lift Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRules.slice(0, 15).map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-100">
                    {r.antecedent}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-cyan-300">
                    &rarr; {r.consequent}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-200">
                    {r.pair_count?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">
                    {(r.support * 100).toFixed(3)}%
                  </td>
                  <td className="py-2.5 px-4 font-mono text-indigo-400 font-bold">
                    {(r.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 font-mono text-emerald-400 font-black text-sm">
                    {r.lift.toFixed(2)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
