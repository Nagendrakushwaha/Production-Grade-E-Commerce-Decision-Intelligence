import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  Package,
  Repeat,
  Search,
  ShoppingCart,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { api } from '../services/api';

interface CustomerUniverseProps {
  customers: any;
  isDark: boolean;
}

export const CustomerUniverse: React.FC<CustomerUniverseProps> = ({ customers, isDark }) => {
  const rfp = customers?.rfp_summary || {};
  const segmentDist = customers?.segment_distribution || {};
  const sampleCusts = customers?.sample_customers || [];

  const [searchId, setSearchId] = useState<string>('1');
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [loadingCust, setLoadingCust] = useState<boolean>(false);
  const [custError, setCustError] = useState<string>('');

  const handleSearchCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId);
    if (isNaN(id) || id <= 0) return;

    setLoadingCust(true);
    setCustError('');
    try {
      const data = await api.getCustomerById(id);
      setSelectedCust(data);
    } catch (err: any) {
      setCustError(`Customer #${id} could not be found.`);
      setSelectedCust(null);
    } finally {
      setLoadingCust(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-400" />
            Customer Intelligence &amp; RFP Universe
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Individual behavioral profiles, reorder intervals, and verified RFP customer segmentation.
          </p>
        </div>

        {/* Note on RFP vs RFM */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs max-w-md">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>RFP Methodology:</strong> Instacart contains zero pricing/revenue data. We compute <strong>RFP</strong> (Recency, Frequency, Product Diversity) to avoid fabricating fake monetary metrics.
          </span>
        </div>
      </div>

      {/* RFP Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Mean Reorder Interval</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {rfp.r_mean || 15.2} Days
          </div>
          <span className="text-[11px] text-slate-500">Recency cadences</span>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Average Lifetime Orders</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {rfp.f_mean || 16.6} Orders
          </div>
          <span className="text-[11px] text-slate-500">Customer order frequency</span>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Mean Basket Size</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {rfp.basket_mean || 10.1} Items
          </div>
          <span className="text-[11px] text-slate-500">Products per cart</span>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Customer Reorder Rate</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {((rfp.reorder_mean || 0.589) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500">Repeat item ratio</span>
        </div>
      </div>

      {/* Customer Lookup Search Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Customer Profile Deep-Dive Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Query any verified customer ID (1 - 206,209) to reveal actual historical basket patterns.
            </p>
          </div>

          <form onSubmit={handleSearchCustomer} className="flex gap-2">
            <input
              type="number"
              min="1"
              max="206209"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter User ID (e.g. 1)"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 w-44"
            />
            <button
              type="submit"
              disabled={loadingCust}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm transition-all shadow-cyan-glow flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {loadingCust ? 'Searching...' : 'Inspect'}
            </button>
          </form>
        </div>

        {custError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {custError}
          </div>
        )}

        {selectedCust ? (
          <div className="mt-6 p-6 rounded-xl bg-white/5 border border-white/10 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase font-semibold text-cyan-400">
                  Customer #{selectedCust.user_id}
                </span>
                <h4 className="text-xl font-bold text-slate-100">
                  Behavioral Persona &amp; Basket Analysis
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Preferred Dept: {selectedCust.preferred_department?.toUpperCase()}
              </span>
            </div>

            {/* Profile Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-cyan-400" /> Total Orders
                </span>
                <div className="text-lg font-bold text-slate-100 mt-1">
                  {selectedCust.total_orders}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" /> Avg Basket Size
                </span>
                <div className="text-lg font-bold text-slate-100 mt-1">
                  {selectedCust.avg_basket_size} items
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-purple-400" /> Reorder Rate
                </span>
                <div className="text-lg font-bold text-slate-100 mt-1">
                  {(selectedCust.reorder_rate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Avg Interval
                </span>
                <div className="text-lg font-bold text-slate-100 mt-1">
                  {selectedCust.avg_days_between_orders} days
                </div>
              </div>
            </div>

            {/* Top Purchased Products for this Customer */}
            {selectedCust.top_purchased_products && (
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Top Purchased Products in Prior Orders
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedCust.top_purchased_products.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-slate-200 truncate max-w-[180px]">
                        {p.product_name}
                      </span>
                      <span className="text-[11px] text-cyan-400 font-mono">
                        {p.purchase_count}x ({p.reorder_count} reorders)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-8 rounded-xl bg-white/5 border border-white/5 text-center text-slate-400 text-xs">
            Enter any customer ID (e.g., 1, 2, 5, 25, 100) above and click "Inspect" to view individual behavioral history.
          </div>
        )}
      </div>

      {/* Sample Customer Universe Table */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          Representative Customer Universe Cohort (Sample)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Click any user ID below to automatically populate the inspector above.
        </p>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Avg Basket</th>
                <th className="py-3 px-4">Avg Interval</th>
                <th className="py-3 px-4">Reorder Rate</th>
                <th className="py-3 px-4">RFP Segment</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sampleCusts.slice(0, 15).map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">
                    #{c.user_id}
                  </td>
                  <td className="py-2.5 px-4">{c.total_orders}</td>
                  <td className="py-2.5 px-4">{c.avg_basket_size}</td>
                  <td className="py-2.5 px-4">{c.avg_days_between_orders}d</td>
                  <td className="py-2.5 px-4">{((c.reorder_rate || 0) * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {c.rfp_segment || 'Routine Shopper'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => {
                        setSearchId(String(c.user_id));
                        api.getCustomerById(c.user_id).then(setSelectedCust);
                      }}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      Inspect &rarr;
                    </button>
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
