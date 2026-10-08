import React, { useState } from 'react';
import {
  BarChart3,
  Calculator,
  Compass,
  HelpCircle,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '../services/api';

interface BusinessSimulatorProps {
  isDark: boolean;
}

export const BusinessSimulator: React.FC<BusinessSimulatorProps> = ({ isDark }) => {
  const [params, setParams] = useState({
    recommendation_threshold: 0.5,
    target_segment: 'All',
    product_popularity_threshold: 500,
    reorder_probability_threshold: 0.4,
    demand_growth_pct: 10.0,
    customer_activity_threshold: 5,
  });

  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const segments = [
    'All',
    'Champions',
    'Loyal Power Shoppers',
    'Active Frequent Buyers',
    'At Risk High Value',
    'Steady Routine Customers',
    'Hibernating / Lapsed',
  ];

  const runSimulation = async (p = params) => {
    setLoading(true);
    try {
      const res = await api.simulate(p);
      setSimulation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Calculator className="w-7 h-7 text-amber-400" />
            Interactive What-If Business Scenario Simulator
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Simulate revenue proxies, audience reach, and inventory allocation shifts under variable campaign criteria.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          Model-Based Scenario Estimates Only
        </div>
      </div>

      {/* Simulator Inputs & Key Projections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Scenario Control Levers
            </h3>
            <button
              onClick={() => {
                const reset = {
                  recommendation_threshold: 0.5,
                  target_segment: 'All',
                  product_popularity_threshold: 500,
                  reorder_probability_threshold: 0.4,
                  demand_growth_pct: 10.0,
                  customer_activity_threshold: 5,
                };
                setParams(reset);
                runSimulation(reset);
              }}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* Target Segment */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Target Customer Segment
              </label>
              <select
                value={params.target_segment}
                onChange={(e) => {
                  const updated = { ...params, target_segment: e.target.value };
                  setParams(updated);
                  runSimulation(updated);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
              >
                {segments.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-slate-100">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Recommendation Threshold */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Recommendation Confidence Cutoff</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {params.recommendation_threshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.85"
                step="0.05"
                value={params.recommendation_threshold}
                onChange={(e) => {
                  const updated = {
                    ...params,
                    recommendation_threshold: parseFloat(e.target.value),
                  };
                  setParams(updated);
                  runSimulation(updated);
                }}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Demand Growth Assumption */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Projected Demand Growth (%)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {params.demand_growth_pct > 0 ? `+${params.demand_growth_pct}` : params.demand_growth_pct}%
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={params.demand_growth_pct}
                onChange={(e) => {
                  const updated = {
                    ...params,
                    demand_growth_pct: parseFloat(e.target.value),
                  };
                  setParams(updated);
                  runSimulation(updated);
                }}
                className="w-full accent-emerald-400"
              />
            </div>

            {/* Activity Threshold */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Customer Minimum Orders Floor</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {params.customer_activity_threshold} orders
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={params.customer_activity_threshold}
                onChange={(e) => {
                  const updated = {
                    ...params,
                    customer_activity_threshold: parseInt(e.target.value),
                  };
                  setParams(updated);
                  runSimulation(updated);
                }}
                className="w-full accent-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Projections Output (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Impact Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-white/10">
              <span className="text-[11px] uppercase font-semibold text-slate-400">
                Audience Reached
              </span>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {simulation?.target_customers_reached?.toLocaleString() || '-'}
              </div>
              <span className="text-[11px] text-slate-500">
                {simulation?.target_customers_pct}% of customer base
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/10">
              <span className="text-[11px] uppercase font-semibold text-slate-400">
                Expected Conversions
              </span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {simulation?.expected_purchase_conversions?.toLocaleString() || '-'}
              </div>
              <span className="text-[11px] text-slate-500">Estimated order actions</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/10">
              <span className="text-[11px] uppercase font-semibold text-slate-400">
                At-Risk Customer Pool
              </span>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {simulation?.potential_at_risk_customers?.toLocaleString() || '-'}
              </div>
              <span className="text-[11px] text-slate-500">Target for retention</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/10">
              <span className="text-[11px] uppercase font-semibold text-slate-400">
                Projected Weekly Orders
              </span>
              <div className="text-xl font-bold text-purple-400 mt-1">
                {simulation?.projected_weekly_orders?.toLocaleString() || '-'}
              </div>
              <span className="text-[11px] text-slate-500">Adjusted fulfillment load</span>
            </div>
          </div>

          {/* Scenario Synthesis Summary */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Model Scenario Narrative
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">
              {simulation?.demand_impact_summary}
            </p>
          </div>

          {/* Department Demand Shifts Table */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Category Demand Allocation Shifts
            </h4>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Current Weekly Orders</th>
                    <th className="py-2.5 px-3">Projected Weekly Orders</th>
                    <th className="py-2.5 px-3">Net Volume Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {simulation?.category_shifts?.map((row: any, idx: number) => {
                    const isPositive = row.net_change >= 0;
                    return (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="py-2 px-3 font-sans font-bold text-slate-200 uppercase">
                          {row.department}
                        </td>
                        <td className="py-2 px-3">{row.current_weekly?.toLocaleString()}</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">
                          {row.projected_weekly?.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? `+${row.net_change?.toLocaleString()}` : row.net_change?.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
