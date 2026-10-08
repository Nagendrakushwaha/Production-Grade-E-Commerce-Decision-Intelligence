import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface PlotlyChartProps {
  data: any[];
  layout: Record<string, any>;
  config?: Record<string, any>;
  style?: React.CSSProperties;
  className?: string;
  isDark?: boolean;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout,
  config,
  style,
  className = '',
  isDark = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const defaultThemeLayout = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, system-ui, sans-serif',
        color: isDark ? '#94a3b8' : '#475569',
        size: 11,
      },
      margin: { l: 45, r: 25, t: 40, b: 40 },
      ...layout,
    };

    // Ensure 3D scene background is transparent
    if (defaultThemeLayout.scene) {
      defaultThemeLayout.scene = {
        ...defaultThemeLayout.scene,
        bgcolor: 'transparent',
        xaxis: {
          ...defaultThemeLayout.scene.xaxis,
          gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        },
        yaxis: {
          ...defaultThemeLayout.scene.yaxis,
          gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        },
        zaxis: {
          ...defaultThemeLayout.scene.zaxis,
          gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        },
      };
    }

    const mergedConfig = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
      ...config,
    };

    Plotly.react(containerRef.current, data, defaultThemeLayout, mergedConfig);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, layout, config, isDark]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '340px', ...style }}
      className={`relative w-full ${className}`}
    />
  );
};
