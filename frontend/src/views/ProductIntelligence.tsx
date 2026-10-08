import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Layers,
  Package,
  Repeat,
  Search,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';
import { api } from '../services/api';

interface ProductIntelligenceProps {
  productIntelligence: any;
  spaces3D: any;
  isDark: boolean;
}

export const ProductIntelligence: React.FC<ProductIntelligenceProps> = ({
  productIntelligence,
  spaces3D,
  isDark,
}) => {
  const topProducts = productIntelligence?.top_products || [];
  const deptLeaderboard = productIntelligence?.department_leaderboard || [];
  const aisleLeaderboard = productIntelligence?.aisle_leaderboard || [];

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [productList, setProductList] = useState<any[]>(topProducts.slice(0, 30));
  const [loading, setLoading] = useState<boolean>(false);

  // Departments for dropdown
  const departments = ['All', ...deptLeaderboard.map((d: any) => d.department)];

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts({
          department: selectedDept,
          search: searchQuery,
          limit: 30,
        });
        setProductList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFiltered, 250);
    return () => clearTimeout(timer);
  }, [selectedDept, searchQuery]);

  // 3D Product Space Data
  const prod3DPoints = spaces3D?.product_intelligence_3d?.points || [];
  const plot3DData = [
    {
      x: prod3DPoints.map((p: any) => p.log_purchases || Math.log(p.total_purchases + 1)),
      y: prod3DPoints.map((p: any) => p.reorder_rate),
      z: prod3DPoints.map((p: any) => p.unique_customers_count),
      text: prod3DPoints.map(
        (p: any) =>
          `<b>${p.product_name}</b><br>Dept: ${p.department}<br>Purchases: ${p.total_purchases?.toLocaleString()}<br>Reorder Rate: ${(p.reorder_rate * 100).toFixed(1)}%<br>Unique Customers: ${p.unique_customers_count?.toLocaleString()}`
      ),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 4,
        color: prod3DPoints.map((p: any) => p.reorder_rate),
        colorscale: 'Viridis',
        opacity: 0.85,
        colorbar: { title: 'Reorder Rate', len: 0.6 },
      },
      hoverinfo: 'text',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Package className="w-7 h-7 text-emerald-400" />
            Product Intelligence &amp; Category Hierarchy
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            SKU repeat-purchase stickiness, department affinity leaderboards, and 3D product space coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Repeat className="w-3.5 h-3.5" />
          Catalog Breadth: 49,688 Ingested SKUs
        </div>
      </div>

      {/* Department Leaderboard Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Top 12 Departments by Purchase Volume &amp; Reorder Rate
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Produce and Dairy Eggs lead platform purchasing volume with over 65%+ reorder retention.
        </p>

        <div className="h-72">
          <PlotlyChart
            isDark={isDark}
            data={[
              {
                x: deptLeaderboard.slice(0, 12).map((d: any) => d.department),
                y: deptLeaderboard.slice(0, 12).map((d: any) => d.total_purchases),
                type: 'bar',
                name: 'Total Purchases',
                marker: { color: 'rgba(6, 182, 212, 0.85)' },
              },
            ]}
            layout={{
              margin: { l: 50, r: 20, t: 15, b: 65 },
              xaxis: { tickangle: -25 },
              yaxis: { title: 'Purchases' },
            }}
          />
        </div>
      </div>

      {/* 3D Product Intelligence Plot */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              3D Product Intelligence Space (Volume × Reorder × Reach)
            </h3>
            <p className="text-xs text-slate-400">
              Interactive 3D scatter: X = Log Purchase Volume, Y = Reorder Rate, Z = Unique Customer Reach.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
            Top 400 Core SKUs
          </span>
        </div>

        <div className="h-[460px]">
          <PlotlyChart
            isDark={isDark}
            data={plot3DData}
            layout={{
              scene: {
                xaxis: { title: 'Log Purchases' },
                yaxis: { title: 'Reorder Rate' },
                zaxis: { title: 'Unique Customer Reach' },
                camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
              },
              margin: { l: 0, r: 0, t: 0, b: 0 },
            }}
          />
        </div>
      </div>

      {/* Filterable Product Catalog Explorer */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Filterable Product Catalog &amp; SKU Metrics
            </h3>
            <p className="text-xs text-slate-400">
              Search by SKU name or drill down by department hierarchy.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 w-48"
              />
            </div>

            {/* Department Select */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            >
              {departments.map((d: string) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-100">
                  {d === 'All' ? 'All Departments' : d.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Aisle</th>
                <th className="py-3 px-4">Total Purchases</th>
                <th className="py-3 px-4">Reorder Rate</th>
                <th className="py-3 px-4">Avg Cart Pos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading catalog data...
                  </td>
                </tr>
              ) : productList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No products matched current filters.
                  </td>
                </tr>
              ) : (
                productList.map((p: any) => (
                  <tr key={p.product_id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">
                      #{p.popularity_rank || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-100">
                      {p.product_name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-semibold">
                        {p.department}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{p.aisle}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-200">
                      {p.total_purchases?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold">
                      {((p.reorder_rate || 0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">
                      {p.avg_add_to_cart_order || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
