import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  FileCheck2,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface DecisionEngineProps {
  decisionData: any;
}

export const DecisionEngine: React.FC<DecisionEngineProps> = ({ decisionData }) => {
  const decisions = decisionData?.decisions || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-amber-400" />
            Prescriptive Decision Intelligence Engine
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Rule + ML-driven strategic interventions derived from computed data signals, evidence, and confidence bounds.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          {decisionData?.high_urgency_count || 4} High-Urgency Strategic Interventions
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-5">
        {decisions.map((d: any, idx: number) => {
          const domainColors: Record<string, { badge: string; border: string }> = {
            CUSTOMER: {
              badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
              border: 'border-indigo-500/30',
            },
            PRODUCT: {
              badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
              border: 'border-emerald-500/30',
            },
            RECOMMENDATION: {
              badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
              border: 'border-cyan-500/30',
            },
            DEMAND: {
              badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
              border: 'border-amber-500/30',
            },
          };

          const styling = domainColors[d.domain] || domainColors.CUSTOMER;

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl glass-panel glass-panel-hover border ${styling.border} space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styling.badge}`}
                  >
                    {d.domain}
                  </span>
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {d.urgency} URGENCY
                  </span>
                </div>

                <div className="text-xs font-mono text-cyan-400 font-bold">
                  Statistical Confidence: {(d.confidence_score * 100).toFixed(0)}%
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {d.headline}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Detected Signal
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {d.signal_detected}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Empirical Evidence
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {d.evidence}
                  </p>
                </div>
              </div>

              {/* Recommended Action Callout */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Recommended Business Action:
                  </span>
                  <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">
                    {d.recommended_action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
