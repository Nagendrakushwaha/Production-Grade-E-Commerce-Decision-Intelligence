import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Filter,
  Package,
  Radar,
  ShieldAlert,
  ShoppingCart,
  Users,
} from 'lucide-react';

interface AnomalyRadarProps {
  anomaliesData: any;
}

export const AnomalyRadar: React.FC<AnomalyRadarProps> = ({ anomaliesData }) => {
  const allAnomalies = anomaliesData?.anomalies || [];
  const breakdown = anomaliesData?.radar_breakdown || {};

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredList =
    severityFilter === 'ALL'
      ? allAnomalies
      : allAnomalies.filter((a: any) => a.severity === severityFilter);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Radar className="w-7 h-7 text-rose-400" />
            E-Commerce Behavioral Anomaly Radar
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Detecting giant basket volume spikes, customer churn lapses, and high-frequency polarization deficits.
          </p>
        </div>

        {/* Severity Counts Pills */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
            {breakdown.critical || 0} Critical
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            {breakdown.high || 0} High
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            {breakdown.medium || 0} Medium
          </span>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between glass-panel rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Filter className="w-4 h-4 text-cyan-400" />
          Filter by Severity:
        </div>

        <div className="flex gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((item: any, idx: number) => {
          const isCritical = item.severity === 'CRITICAL';
          const isHigh = item.severity === 'HIGH';

          const borderStyle = isCritical
            ? 'border-rose-500/40 bg-rose-500/5'
            : isHigh
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-indigo-500/20 bg-indigo-500/5';

          const badgeStyle = isCritical
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            : isHigh
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl glass-panel glass-panel-hover border ${borderStyle} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeStyle}`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Anomaly Score: {(item.score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="text-xs uppercase font-semibold text-slate-400 mb-1">
                  {item.anomaly_type}
                </div>
                <h4 className="text-base font-bold text-slate-100 mb-2 truncate">
                  {item.entity_id}
                </h4>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300 leading-relaxed mb-4">
                  {item.evidence}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Domain: {item.entity_type}</span>
                <span>{item.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
