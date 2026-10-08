import React, { useState } from 'react';
import {
  Boxes,
  Compass,
  Layers,
  LineChart,
  Package,
  RotateCw,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';

interface VisualizationLab3DProps {
  spaces3D: any;
  isDark: boolean;
}

export const VisualizationLab3D: React.FC<VisualizationLab3DProps> = ({ spaces3D, isDark }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'product' | 'association' | 'demand'>('customer');

  const custSpace = spaces3D?.customer_universe_3d || {};
  const prodSpace = spaces3D?.product_intelligence_3d || {};
  const assocSpace = spaces3D?.association_landscape_3d || {};
  const demandSpace = spaces3D?.demand_surface_3d || {};

  // Tab 1: 3D Customer Universe
  const custPoints = custSpace.points || [];
  const cust3DData = [
    {
      x: custPoints.map((p: any) => p.total_orders),
      y: custPoints.map((p: any) => p.avg_days_between_orders),
      z: custPoints.map((p: any) => p.avg_basket_size),
      text: custPoints.map(
        (p: any) =>
          `<b>Customer #${p.user_id}</b><br>Segment: ${p.rfp_segment}<br>Orders: ${p.total_orders}<br>Interval: ${p.avg_days_between_orders}d<br>Basket: ${p.avg_basket_size}`
      ),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 4,
        color: custPoints.map((p: any) => p.cluster),
        colorscale: 'Turbo',
        opacity: 0.85,
      },
      hoverinfo: 'text',
    },
  ];

  // Tab 2: 3D Product Space
  const prodPoints = prodSpace.points || [];
  const prod3DData = [
    {
      x: prodPoints.map((p: any) => p.log_purchases || Math.log(p.total_purchases + 1)),
      y: prodPoints.map((p: any) => p.reorder_rate),
      z: prodPoints.map((p: any) => p.unique_customers_count),
      text: prodPoints.map(
        (p: any) =>
          `<b>${p.product_name}</b><br>Purchases: ${p.total_purchases?.toLocaleString()}<br>Reorder: ${(p.reorder_rate * 100).toFixed(1)}%<br>Unique Reach: ${p.unique_customers_count?.toLocaleString()}`
      ),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 4,
        color: prodPoints.map((p: any) => p.reorder_rate),
        colorscale: 'Viridis',
        opacity: 0.85,
        colorbar: { title: 'Reorder Rate' },
      },
      hoverinfo: 'text',
    },
  ];

  // Tab 3: 3D Association Landscape
  const assocPoints = assocSpace.points || [];
  const assoc3DData = [
    {
      x: assocPoints.map((p: any) => p.support),
      y: assocPoints.map((p: any) => p.confidence),
      z: assocPoints.map((p: any) => p.lift),
      text: assocPoints.map(
        (p: any) =>
          `<b>${p.antecedent} &rarr; ${p.consequent}</b><br>Support: ${(p.support * 100).toFixed(3)}%<br>Confidence: ${(p.confidence * 100).toFixed(1)}%<br>Lift: ${p.lift?.toFixed(2)}x`
      ),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 5,
        color: assocPoints.map((p: any) => p.lift),
        colorscale: 'Portland',
        opacity: 0.9,
        colorbar: { title: 'Lift Score' },
      },
      hoverinfo: 'text',
    },
  ];

  // Tab 4: 3D Demand Surface
  const demandPoints = demandSpace.points || [];
  const demand3DData = [
    {
      x: demandPoints.map((p: any) => p.order_dow),
      y: demandPoints.map((p: any) => p.order_hour),
      z: demandPoints.map((p: any) => p.order_count),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 4,
        color: demandPoints.map((p: any) => p.order_count),
        colorscale: 'Plasma',
        opacity: 0.85,
        colorbar: { title: 'Orders' },
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
            <Boxes className="w-7 h-7 text-cyan-400" />
            3D Analytical Visualization Laboratory
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Immersive 3D coordinate manifolds across Customer, Product, Association, and Demand surfaces.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <RotateCw className="w-3.5 h-3.5" />
          Interactive 3D WebGL Rendering
        </div>
      </div>

      {/* 3D Tab Switcher Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 max-w-2xl">
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl font-bold transition-all ${
            activeTab === 'customer'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          3D Customer Universe
        </button>
        <button
          onClick={() => setActiveTab('product')}
          className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl font-bold transition-all ${
            activeTab === 'product'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          3D Product Space
        </button>
        <button
          onClick={() => setActiveTab('association')}
          className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl font-bold transition-all ${
            activeTab === 'association'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          3D Association Landscape
        </button>
        <button
          onClick={() => setActiveTab('demand')}
          className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl font-bold transition-all ${
            activeTab === 'demand'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          3D Demand Surface
        </button>
      </div>

      {/* 3D Canvas Box */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-100">
            {activeTab === 'customer' && custSpace.title}
            {activeTab === 'product' && prodSpace.title}
            {activeTab === 'association' && assocSpace.title}
            {activeTab === 'demand' && demandSpace.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hold left-click and drag to rotate, scroll to zoom, hover on any data point for verified metadata.
          </p>
        </div>

        <div className="h-[520px]">
          {activeTab === 'customer' && (
            <PlotlyChart
              isDark={isDark}
              data={cust3DData}
              layout={{
                scene: {
                  xaxis: { title: custSpace.x_label || 'Order Frequency' },
                  yaxis: { title: custSpace.y_label || 'Recency Gap' },
                  zaxis: { title: custSpace.z_label || 'Basket Size' },
                  camera: { eye: { x: 1.6, y: 1.6, z: 1.2 } },
                },
                margin: { l: 0, r: 0, t: 0, b: 0 },
              }}
            />
          )}

          {activeTab === 'product' && (
            <PlotlyChart
              isDark={isDark}
              data={prod3DData}
              layout={{
                scene: {
                  xaxis: { title: prodSpace.x_label || 'Log Purchases' },
                  yaxis: { title: prodSpace.y_label || 'Reorder Rate' },
                  zaxis: { title: prodSpace.z_label || 'Unique Reach' },
                  camera: { eye: { x: 1.6, y: 1.6, z: 1.2 } },
                },
                margin: { l: 0, r: 0, t: 0, b: 0 },
              }}
            />
          )}

          {activeTab === 'association' && (
            <PlotlyChart
              isDark={isDark}
              data={assoc3DData}
              layout={{
                scene: {
                  xaxis: { title: assocSpace.x_label || 'Support' },
                  yaxis: { title: assocSpace.y_label || 'Confidence' },
                  zaxis: { title: assocSpace.z_label || 'Lift' },
                  camera: { eye: { x: 1.6, y: 1.6, z: 1.2 } },
                },
                margin: { l: 0, r: 0, t: 0, b: 0 },
              }}
            />
          )}

          {activeTab === 'demand' && (
            <PlotlyChart
              isDark={isDark}
              data={demand3DData}
              layout={{
                scene: {
                  xaxis: { title: demandSpace.x_label || 'Day of Week' },
                  yaxis: { title: demandSpace.y_label || 'Hour of Day' },
                  zaxis: { title: demandSpace.z_label || 'Demand' },
                  camera: { eye: { x: 1.6, y: 1.6, z: 1.2 } },
                },
                margin: { l: 0, r: 0, t: 0, b: 0 },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
