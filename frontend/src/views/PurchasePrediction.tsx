import React, { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Layers,
  Send,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

interface PurchasePredictionProps {
  isDark: boolean;
}

export const PurchasePrediction: React.FC<PurchasePredictionProps> = ({ isDark }) => {
  // Input features state
  const [inputs, setInputs] = useState({
    user_total_orders: 16,
    user_avg_days_between: 12.0,
    user_avg_basket_size: 9.5,
    user_reorder_rate: 0.62,
    prod_total_purchases: 4500,
    prod_reorder_rate: 0.65,
    prod_avg_cart_position: 4.0,
    up_orders_count: 7,
    up_order_ratio: 0.44,
    up_orders_since_last: 1,
    up_avg_cart_pos: 3.2,
  });

  const [threshold, setThreshold] = useState<number>(0.5);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: string, val: number) => {
    setInputs((prev) => {
      const updated = { ...prev, [field]: val };
      // auto compute ratio if orders change
      if (field === 'up_orders_count' || field === 'user_total_orders') {
        const uOrders = field === 'user_total_orders' ? val : prev.user_total_orders;
        const upCount = field === 'up_orders_count' ? val : prev.up_orders_count;
        updated.up_order_ratio = parseFloat((upCount / Math.max(1, uOrders)).toFixed(2));
      }
      return updated;
    });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.predict(inputs, threshold);
      setResult(res);
    } catch (err: any) {
      setError('Prediction API request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Zap className="w-7 h-7 text-cyan-400" />
            Next-Order Purchase Prediction Studio
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time inference using the champion XGBoost classifier with dynamic TreeSHAP feature explanations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          Live Model Serving via FastAPI
        </div>
      </div>

      {/* Interactive Feature Input Form & Prediction Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Controls (2 Cols) */}
        <form
          onSubmit={handlePredict}
          className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10 space-y-6"
        >
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Adjust Customer &amp; Product Interaction Features
            </h3>
            <p className="text-xs text-slate-400">
              Configure behavioral inputs to simulate different shopping profiles:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Features */}
            <div className="space-y-3.5 p-4 rounded-xl bg-white/5 border border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                1. Customer Profile Signals
              </h4>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Customer Total Orders:</span>
                  <span className="font-mono text-cyan-300 font-bold">{inputs.user_total_orders}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={inputs.user_total_orders}
                  onChange={(e) => handleInputChange('user_total_orders', parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Avg Days Between Orders:</span>
                  <span className="font-mono text-cyan-300 font-bold">{inputs.user_avg_days_between}d</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={inputs.user_avg_days_between}
                  onChange={(e) => handleInputChange('user_avg_days_between', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Avg Basket Size:</span>
                  <span className="font-mono text-cyan-300 font-bold">{inputs.user_avg_basket_size}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={inputs.user_avg_basket_size}
                  onChange={(e) => handleInputChange('user_avg_basket_size', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Customer Reorder Rate:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {(inputs.user_reorder_rate * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={inputs.user_reorder_rate}
                  onChange={(e) => handleInputChange('user_reorder_rate', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Product & Interaction Features */}
            <div className="space-y-3.5 p-4 rounded-xl bg-white/5 border border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                2. Product &amp; Affinity Signals
              </h4>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Product Reorder Rate:</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {(inputs.prod_reorder_rate * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.85"
                  step="0.05"
                  value={inputs.prod_reorder_rate}
                  onChange={(e) => handleInputChange('prod_reorder_rate', parseFloat(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>User Purchased This SKU (Times):</span>
                  <span className="font-mono text-indigo-300 font-bold">{inputs.up_orders_count}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={inputs.up_orders_count}
                  onChange={(e) => handleInputChange('up_orders_count', parseInt(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Orders Since Last Bought:</span>
                  <span className="font-mono text-indigo-300 font-bold">{inputs.up_orders_since_last} orders</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={inputs.up_orders_since_last}
                  onChange={(e) => handleInputChange('up_orders_since_last', parseInt(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Decision Threshold:</span>
                  <span className="font-mono text-indigo-300 font-bold">{threshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-cyan-glow hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Running Inference...' : 'Predict Next-Order Outcome'}
            </button>
          </div>
        </form>

        {/* Prediction Results Panel (1 Col) */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Live Inference Output
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Model score evaluated against the active threshold:
            </p>

            {result ? (
              <div className="space-y-5 animate-fadeIn">
                <div
                  className={`p-5 rounded-2xl border ${
                    result.predicted_reorder === 1
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="text-xs uppercase font-bold tracking-wider">
                    Model Verdict
                  </div>
                  <div className="text-2xl font-black mt-1">
                    {result.decision === 'REORDER_PREDICTED'
                      ? 'YES &bull; REORDER PREDICTED'
                      : 'NO &bull; WILL NOT REORDER'}
                  </div>
                  <div className="text-xs mt-2 text-slate-300 font-mono">
                    Predicted Probability:{' '}
                    <strong className="text-white text-sm">
                      {(result.predicted_probability * 100).toFixed(1)}%
                    </strong>{' '}
                    (Cutoff: {(threshold * 100).toFixed(0)}%)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Primary Driver (SHAP Attribution)
                  </span>
                  <div className="text-xs font-semibold text-cyan-300 mt-1 leading-relaxed">
                    {result.primary_driver}
                  </div>
                </div>

                {/* Top 3 SHAP Pushes */}
                {result.feature_contributions && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Top Influential Features
                    </h5>
                    <div className="space-y-1.5">
                      {result.feature_contributions.slice(0, 3).map((c: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/30 border border-white/5"
                        >
                          <span className="text-slate-300 truncate max-w-[140px]">
                            {c.feature.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              c.shap_value > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {c.shap_value > 0 ? `+${c.shap_value}` : c.shap_value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-white/5 border border-white/5 text-center text-slate-400 text-xs">
                Click "Predict Next-Order Outcome" to execute live inference against the trained XGBoost model.
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Latency: ~12ms</span>
            <span className="text-emerald-400">&bull; Live Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
