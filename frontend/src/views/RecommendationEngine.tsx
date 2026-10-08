import React, { useEffect, useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  HelpCircle,
  Package,
  Repeat,
  Search,
  ShoppingCart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

interface RecommendationEngineProps {
  isDark: boolean;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ isDark }) => {
  const [customerId, setCustomerId] = useState<number>(1);
  const [inputVal, setInputVal] = useState<string>('1');
  const [recData, setRecData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadRecommendations = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getRecommendations(id, 6);
      setRecData(data);
    } catch (err: any) {
      setError(`Failed to generate recommendations for customer #${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations(customerId);
  }, [customerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(inputVal);
    if (!isNaN(id) && id > 0) {
      setCustomerId(id);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-cyan-400" />
            Personalized Hybrid Recommendation Engine
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Combining Market Basket lift synergies, collaborative segment affinities, and platform reorder anchors.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          Zero-Hallucination Explanations
        </div>
      </div>

      {/* Customer Input & Context Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interactive Customer Persona Sandbox
            </span>
            <h3 className="text-lg font-bold text-slate-100">
              Evaluating Target Customer #{customerId} ({recData?.customer_segment || 'Routine Buyer'})
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="number"
              min="1"
              max="206209"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Customer ID..."
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 w-44"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm transition-all shadow-cyan-glow flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {loading ? 'Evaluating...' : 'Recommend'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recData?.recommendations?.map((item: any, idx: number) => {
          const strategyBadges: Record<string, { label: string; color: string; border: string }> = {
            association_cross_sell: {
              label: 'Market Basket Lift Synergy',
              color: 'bg-cyan-500/10 text-cyan-300',
              border: 'border-cyan-500/30',
            },
            collaborative_category: {
              label: 'Collaborative Dept Preference',
              color: 'bg-indigo-500/10 text-indigo-300',
              border: 'border-indigo-500/30',
            },
            platform_anchor: {
              label: 'Platform Reorder Anchor',
              color: 'bg-emerald-500/10 text-emerald-300',
              border: 'border-emerald-500/30',
            },
          };

          const badge =
            strategyBadges[item.strategy] || strategyBadges.platform_anchor;

          return (
            <div
              key={idx}
              className="p-6 rounded-2xl glass-panel glass-panel-hover border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    Score: {Math.round(item.recommendation_score * 100)}%
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-100 mb-1">
                  {item.product_name}
                </h4>
                <div className="text-xs text-slate-400 mb-4">
                  {item.department} &bull; {item.aisle}
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed">
                  <strong>Why Recommended:</strong> {item.reason}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Purchase Probability
                </span>
                <span className="font-mono">#{idx + 1} Candidate</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
