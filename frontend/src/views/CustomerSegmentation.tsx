import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle,
  HelpCircle,
  PieChart,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';

interface CustomerSegmentationProps {
  customers: any;
  spaces3D: any;
  isDark: boolean;
}

export const CustomerSegmentation: React.FC<CustomerSegmentationProps> = ({
  customers,
  spaces3D,
  isDark,
}) => {
  const clusterProfiles = customers?.cluster_profiles || [];
  const clusterEval = customers?.cluster_evaluation || [];
  const segmentDist = customers?.segment_distribution || {};

  const customerPoints = spaces3D?.customer_universe_3d?.points || [];

  // Filter 3D points by selected cluster
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('ALL');

  const filteredPoints =
    selectedClusterFilter === 'ALL'
      ? customerPoints
      : customerPoints.filter((p: any) => String(p.cluster) === selectedClusterFilter);

  // 3D Plotly Data
  const clusterColors: Record<number, string> = {
    0: '#06b6d4', // Cyan
    1: '#818cf8', // Indigo
    2: '#f59e0b', // Amber
    3: '#10b981', // Emerald
  };

  const plot3DData = [
    {
      x: filteredPoints.map((p: any) => p.total_orders),
      y: filteredPoints.map((p: any) => p.avg_days_between_orders),
      z: filteredPoints.map((p: any) => p.avg_basket_size),
      text: filteredPoints.map(
        (p: any) =>
          `User #${p.user_id}<br>Cluster: ${p.cluster}<br>Orders: ${p.total_orders}<br>Interval: ${p.avg_days_between_orders}d<br>Basket: ${p.avg_basket_size}`
      ),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 4,
        color: filteredPoints.map((p: any) => clusterColors[p.cluster] || '#6366f1'),
        opacity: 0.85,
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
            <Target className="w-7 h-7 text-cyan-400" />
            Customer Behavioral Segmentation &amp; 3D Universe
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Unsupervised MiniBatchKMeans cluster discovery evaluated across Silhouette, Davies-Bouldin, and Calinski-Harabasz metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Optimal Model: k = 4 Clusters
        </div>
      </div>

      {/* Cluster Evaluation Benchmarking (k=3..6) */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-400" />
          Cluster Count Validation Ledger (k = 3, 4, 5, 6)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Rigorous mathematical cluster quality metrics calculated on standardized user behavioral vectors:
        </p>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Cluster Count (k)</th>
                <th className="py-3 px-4">Silhouette Score &uarr;</th>
                <th className="py-3 px-4">Davies-Bouldin Index &darr;</th>
                <th className="py-3 px-4">Calinski-Harabasz Score &uarr;</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clusterEval.map((row: any, idx: number) => {
                const isSelected = row.k === 4;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold font-mono text-cyan-300">
                      k = {row.k}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium">
                      {row.silhouette_score}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium">
                      {row.davies_bouldin_index}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium">
                      {row.calinski_harabasz_score?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Champion Architecture
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cluster Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusterProfiles.map((p: any, idx: number) => {
          const color = clusterColors[p.cluster_id] || '#6366f1';
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${color}20`, color: color }}
                  >
                    Cluster #{p.cluster_id}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{p.pct_of_total}% share</span>
                </div>
                <h4 className="text-base font-bold text-slate-100">{p.name}</h4>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Avg Orders:</span>
                  <span className="text-slate-200 font-medium">{p.avg_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Basket Size:</span>
                  <span className="text-slate-200 font-medium">{p.avg_basket_size} items</span>
                </div>
                <div className="flex justify-between">
                  <span>Reorder Rate:</span>
                  <span className="text-slate-200 font-medium">
                    {(p.avg_reorder_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cadence Interval:</span>
                  <span className="text-slate-200 font-medium">{p.avg_interval_days} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3D Customer Universe Interactive Visualization */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              Interactive 3D Customer Behavioral Universe
            </h3>
            <p className="text-xs text-slate-400">
              Axes represent Frequency (X: Orders), Recency (Y: Days Between), and Basket Size (Z: Items). Rotatable, zoomable, hoverable.
            </p>
          </div>

          {/* Cluster Filter Buttons */}
          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-black/30 border border-white/10">
            {['ALL', '0', '1', '2', '3'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClusterFilter(c)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedClusterFilter === c
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {c === 'ALL' ? 'All Clusters' : `Cluster ${c}`}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[480px]">
          <PlotlyChart
            isDark={isDark}
            data={plot3DData}
            layout={{
              scene: {
                xaxis: { title: 'Order Frequency (Total Orders)' },
                yaxis: { title: 'Recency Gap (Days Between)' },
                zaxis: { title: 'Basket Size (Items)' },
                camera: {
                  eye: { x: 1.6, y: 1.6, z: 1.2 },
                },
              },
              margin: { l: 0, r: 0, t: 0, b: 0 },
            }}
          />
        </div>
      </div>
    </div>
  );
};
