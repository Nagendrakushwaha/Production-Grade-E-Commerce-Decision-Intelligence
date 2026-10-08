import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';

interface ExplainableAIProps {
  modelLab: any;
  isDark: boolean;
}

export const ExplainableAI: React.FC<ExplainableAIProps> = ({ modelLab, isDark }) => {
  const shapData = modelLab?.shap_analysis || {};
  const globalImpact = shapData.global_feature_impact || [];
  const localExplanations = shapData.local_explanations || [];
  const featureImportances = modelLab?.feature_importance || [];

  const [selectedSampleIdx, setSelectedSampleIdx] = useState<number>(0);

  const activeSample = localExplanations[selectedSampleIdx] || localExplanations[0] || {};
  const contributions = activeSample.feature_contributions || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-400" />
            Explainable AI &amp; SHAP Feature Attribution
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Interpreting model predictions using Game-Theoretic Shapley Additive Explanations (TreeSHAP).
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Verified TreeSHAP Explainer
        </div>
      </div>

      {/* Global SHAP Feature Importance */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Global Feature Impact: Mean Absolute SHAP Value |&Phi;|
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Quantifies how much each historical feature shifts the model's reorder probability output on average:
        </p>

        <div className="h-72">
          <PlotlyChart
            isDark={isDark}
            data={[
              {
                y: globalImpact.map((f: any) => f.feature.replace(/_/g, ' ').toUpperCase()).reverse(),
                x: globalImpact.map((f: any) => f.mean_abs_shap).reverse(),
                type: 'bar',
                orientation: 'h',
                marker: {
                  color: 'rgba(6, 182, 212, 0.85)',
                  line: { color: 'rgba(255,255,255,0.2)', width: 1 },
                },
              },
            ]}
            layout={{
              margin: { l: 180, r: 25, t: 15, b: 40 },
              xaxis: { title: 'Mean |SHAP Value| (Impact on Model Output)' },
              yaxis: { dtick: 1 },
            }}
          />
        </div>
      </div>

      {/* Local Prediction Inspector ("Why did the model predict this?") */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Individual Prediction Deep-Dive Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Select a real test sample to inspect the exact feature pushes driving the prediction.
            </p>
          </div>

          {/* Sample Selector Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10">
            {localExplanations.map((s: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedSampleIdx(idx)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  selectedSampleIdx === idx
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                Sample #{idx + 1} ({s.actual_reordered === 1 ? 'Reordered' : 'Not Reordered'})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Sample Context Header */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-semibold text-purple-300">
              User #{activeSample.user_id} &bull; Product: {activeSample.product_name}
            </div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">
              Predicted Probability:{' '}
              <span className="text-cyan-400 font-mono text-base">
                {((activeSample.predicted_probability || 0) * 100).toFixed(1)}%
              </span>{' '}
              ({activeSample.model_decision})
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-slate-300">
              Actual Outcome: <strong>{activeSample.actual_reordered === 1 ? 'Purchased (1)' : 'Not Purchased (0)'}</strong>
            </span>
          </div>
        </div>

        {/* Natural Language Reason Summary */}
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs mb-6 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>AI Explanation Summary:</strong> {activeSample.reason_summary}
          </div>
        </div>

        {/* Feature Contribution Waterfall / Breakdown */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Individual Feature Push Attribution
          </h4>

          {contributions.map((c: any, idx: number) => {
            const isPositive = c.shap_value > 0;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {c.feature.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Observed Value: <strong>{c.value}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? `+${c.shap_value.toFixed(4)}` : c.shap_value.toFixed(4)}
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {isPositive ? 'Increases Probability' : 'Decreases Probability'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
