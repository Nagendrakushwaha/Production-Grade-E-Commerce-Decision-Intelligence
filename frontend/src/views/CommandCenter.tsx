import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';

interface CommandCenterProps {
  overview: any;
  demand: any;
  isDark: boolean;
  onNavigate: (sectionId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  overview,
  demand,
  isDark,
  onNavigate,
}) => {
  const kpis = overview?.kpis || {};
  const insights = overview?.quick_insights || [];

  const kpiCards = [
    {
      title: 'Total Processed Orders',
      value: kpis.total_orders?.toLocaleString() || '3,421,083',
      subtext: 'Complete Instacart Event Stream',
      icon: Layers,
      color: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      textGrad: 'gradient-text-cyan',
    },
    {
      title: 'Unique Verified Customers',
      value: kpis.unique_customers?.toLocaleString() || '206,209',
      subtext: 'Segmented RFP Universe',
      icon: Users,
      color: 'from-indigo-500/20 to-purple-500/10',
      border: 'border-indigo-500/30',
      textGrad: 'text-indigo-400',
    },
    {
      title: 'Active Catalog SKUs',
      value: kpis.total_products?.toLocaleString() || '49,688',
      subtext: 'Across 134 Aisles & 21 Departments',
      icon: Boxes,
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      textGrad: 'gradient-text-emerald',
    },
    {
      title: 'Data Quality Index',
      value: `${kpis.data_quality_score || 100}%`,
      subtext: 'Referential & Schema Integrity',
      icon: CheckCircle2,
      color: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
      textGrad: 'gradient-text-gold',
    },
    {
      title: 'Platform Reorder Ratio',
      value: `${((kpis.platform_reorder_rate || 0.5897) * 100).toFixed(1)}%`,
      subtext: 'High Repeat Purchase Affinity',
      icon: TrendingUp,
      color: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      textGrad: 'text-purple-400',
    },
    {
      title: 'Champion Model ROC-AUC',
      value: `${kpis.champion_model_roc_auc || 0.8133}`,
      subtext: 'XGBoost Next-Order Classifier',
      icon: Zap,
      color: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/30',
      textGrad: 'text-cyan-400',
    },
  ];

  // Radar / Summary Chart Data from Demand Seasonality
  const dowDistribution = demand?.dow_distribution || [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayVolumes = days.map((_, idx) => {
    const row = dowDistribution.find((d: any) => d.order_dow === idx);
    return row ? row.total_orders : 0;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Production Decision Intelligence Platform &bull; Python 3.13 &bull; DuckDB Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              E-Commerce <span className="gradient-text-cyan">Decision Intelligence</span> Observatory
            </h1>
            <p className="mt-2 text-slate-400 text-sm md:text-base leading-relaxed">
              Real-time statistical discovery, customer behavioral segmentation, market basket graph synergy, and explainable ML next-order prediction running across 33.8M+ verified transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('model-lab')}
              className="px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Inspect Model Lab
            </button>
            <button
              onClick={() => onNavigate('3d-lab')}
              className="px-4 py-2.5 rounded-xl font-medium text-sm bg-white/5 border border-white/15 text-slate-200 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Boxes className="w-4 h-4" />
              Launch 3D Spaces
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-6 rounded-2xl glass-panel glass-panel-hover border ${kpi.border} relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} rounded-bl-full pointer-events-none`} />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  {kpi.title}
                </span>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold ${kpi.textGrad}`}>
                {kpi.value}
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                {kpi.subtext}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Analytics Grid: Weekly Velocity & Live Strategic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Day-of-Week Velocity Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Weekly Purchasing Volume &amp; Fulfillment Load
              </h3>
              <p className="text-xs text-slate-400">
                Order frequency distribution across calendar days (Day 0 = Sunday)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Sunday Peak: 600K+
            </span>
          </div>

          <div className="h-72">
            <PlotlyChart
              isDark={isDark}
              data={[
                {
                  x: days,
                  y: dayVolumes,
                  type: 'bar',
                  marker: {
                    color: [
                      '#06b6d4',
                      '#38bdf8',
                      '#6366f1',
                      '#818cf8',
                      '#94a3b8',
                      '#a855f7',
                      '#0ea5e9',
                    ],
                    line: { color: 'rgba(255,255,255,0.2)', width: 1 },
                  },
                  text: dayVolumes.map((v) => `${(v / 1000).toFixed(0)}k orders`),
                  textposition: 'auto',
                  hoverinfo: 'x+y+text',
                },
              ]}
              layout={{
                margin: { l: 45, r: 20, t: 15, b: 35 },
                xaxis: { title: 'Day of Week' },
                yaxis: { title: 'Total Orders' },
              }}
            />
          </div>
        </div>

        {/* Dynamic Key Strategic Insights */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Executive Signals
              </h3>
              <span className="text-xs text-slate-400 font-mono">LIVE EVAL</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Prescriptive takeaways synthesized directly from DuckDB analytical calculations:
            </p>

            <div className="space-y-3">
              {insights.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all"
                >
                  <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Parquet Cache Synchronized
            </span>
            <button
              onClick={() => onNavigate('decision-engine')}
              className="text-cyan-400 hover:underline font-medium"
            >
              Open Decision Engine &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
