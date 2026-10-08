import React from 'react';
import {
  Boxes,
  Calendar,
  Clock,
  Compass,
  LineChart,
  Percent,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { PlotlyChart } from '../components/PlotlyChart';

interface DemandIntelligenceProps {
  demand: any;
  spaces3D: any;
  isDark: boolean;
}

export const DemandIntelligence: React.FC<DemandIntelligenceProps> = ({
  demand,
  spaces3D,
  isDark,
}) => {
  const dow = demand?.dow_distribution || [];
  const hours = demand?.hour_distribution || [];
  const heatmap = demand?.heatmap || [];
  const forecasting = demand?.forecasting || {};
  const forecastModels = forecasting?.models || [];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Heatmap Matrix Data (7 days x 24 hours)
  const zMatrix: number[][] = Array(7)
    .fill(0)
    .map(() => Array(24).fill(0));

  heatmap.forEach((cell: any) => {
    if (cell.order_dow >= 0 && cell.order_dow < 7 && cell.order_hour >= 0 && cell.order_hour < 24) {
      zMatrix[cell.order_dow][cell.order_hour] = cell.order_count;
    }
  });

  // Forecasting Chart Data
  const actualSeries = forecasting.test_actual || [];
  const hwSeries = forecasting.forecast_hw || [];
  const maSeries = forecasting.forecast_ma || [];
  const testIndices = actualSeries.map((_: any, i: number) => `T+${i + 1}`);

  // 3D Demand Surface Data
  const demand3DPoints = spaces3D?.demand_surface_3d?.points || heatmap;
  const plot3DData = [
    {
      x: demand3DPoints.map((p: any) => p.order_dow),
      y: demand3DPoints.map((p: any) => p.order_hour),
      z: demand3DPoints.map((p: any) => p.order_count),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 4,
        color: demand3DPoints.map((p: any) => p.order_count),
        colorscale: 'Plasma',
        opacity: 0.85,
        colorbar: { title: 'Orders', len: 0.6 },
      },
      text: demand3DPoints.map(
        (p: any) =>
          `Day: ${days[p.order_dow]} (DOW ${p.order_dow})<br>Hour: ${p.order_hour}:00<br>Orders: ${p.order_count?.toLocaleString()}`
      ),
      hoverinfo: 'text',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <LineChart className="w-7 h-7 text-indigo-400" />
            Demand Intelligence &amp; Forecasting Observatory
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Temporal demand seasonality, intra-day heatmaps, and statistical time-series forecasting comparisons.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          Forecasting Model: Holt Damped Exponential Smoothing
        </div>
      </div>

      {/* Intra-Day Heatmap (Day of Week x Hour of Day) */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Intra-Day Order Velocity Heatmap (Day of Week &times; Hour of Day)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Peak transaction load concentrates between 10:00 AM and 3:00 PM on Sunday (DOW 0) and Monday (DOW 1).
        </p>

        <div className="h-72">
          <PlotlyChart
            isDark={isDark}
            data={[
              {
                z: zMatrix,
                x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                y: days,
                type: 'heatmap',
                colorscale: 'Teal',
                hoverongaps: false,
              },
            ]}
            layout={{
              margin: { l: 45, r: 20, t: 10, b: 35 },
              xaxis: { title: 'Hour of Day (00:00 - 23:00)' },
              yaxis: { title: 'Day of Week' },
            }}
          />
        </div>
      </div>

      {/* Time-Series Forecasting Evaluation */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Order Progression Forecasting (Actual vs. Predicted)
            </h3>
            <p className="text-xs text-slate-400">
              Comparing Holt Damped Exponential Smoothing, Moving Average, and Naive Baseline.
            </p>
          </div>
        </div>

        <div className="h-72 mb-6">
          <PlotlyChart
            isDark={isDark}
            data={[
              {
                x: testIndices,
                y: actualSeries,
                name: 'Actual Orders',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#f8fafc', width: 2.5 },
                marker: { size: 6, color: '#f8fafc' },
              },
              {
                x: testIndices,
                y: hwSeries,
                name: 'Holt Damped Smoothing',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#06b6d4', width: 2, dash: 'dot' },
                marker: { size: 5, color: '#06b6d4' },
              },
              {
                x: testIndices,
                y: maSeries,
                name: 'Moving Average (w=5)',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#a855f7', width: 2, dash: 'dash' },
              },
            ]}
            layout={{
              margin: { l: 50, r: 20, t: 15, b: 40 },
              xaxis: { title: 'Forecast Horizon Time Steps' },
              yaxis: { title: 'Order Volume' },
              legend: { orientation: 'h', y: 1.15 },
            }}
          />
        </div>

        {/* Model Accuracy Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Forecasting Model</th>
                <th className="py-3 px-4">MAE (Mean Abs Error) &darr;</th>
                <th className="py-3 px-4">RMSE &darr;</th>
                <th className="py-3 px-4">sMAPE (%) &darr;</th>
                <th className="py-3 px-4">R&sup2; Score &uarr;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {forecastModels.map((m: any, idx: number) => {
                const isChampion = m.name.includes('Holt');
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isChampion ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                      {isChampion && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                      {m.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">
                      {m.metrics?.mae?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono">{m.metrics?.rmse?.toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold">
                      {m.metrics?.smape}%
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-200">
                      {m.metrics?.r2}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3D Demand Surface Plot */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-400" />
          3D Temporal Demand Manifold Surface
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          X = Day of Week, Y = Hour of Day, Z = Total Order Demand. Rotatable 3D manifold.
        </p>

        <div className="h-[440px]">
          <PlotlyChart
            isDark={isDark}
            data={plot3DData}
            layout={{
              scene: {
                xaxis: { title: 'Day of Week' },
                yaxis: { title: 'Hour of Day' },
                zaxis: { title: 'Order Demand' },
                camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
              },
              margin: { l: 0, r: 0, t: 0, b: 0 },
            }}
          />
        </div>
      </div>
    </div>
  );
};
