import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Database,
  Download,
  Filter,
  Flame,
  Globe,
  HardDrive,
  Layers,
  Lightbulb,
  LineChart,
  Moon,
  Package,
  Radar,
  RotateCw,
  Search,
  Server,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Sun,
  Target,
  Terminal,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { api } from './services/api';
import { AnomalyRadar } from './views/AnomalyRadar';
import { BusinessSimulator } from './views/BusinessSimulator';
import { CommandCenter } from './views/CommandCenter';
import { CustomerSegmentation } from './views/CustomerSegmentation';
import { CustomerUniverse } from './views/CustomerUniverse';
import { DataObservatory } from './views/DataObservatory';
import { DataQualityView } from './views/DataQualityView';
import { DecisionEngine } from './views/DecisionEngine';
import { DemandIntelligence } from './views/DemandIntelligence';
import { ExplainableAI } from './views/ExplainableAI';
import { MarketBasketLab } from './views/MarketBasketLab';
import { ModelLaboratory } from './views/ModelLaboratory';
import { ProductIntelligence } from './views/ProductIntelligence';
import { PurchaseBehavior } from './views/PurchaseBehavior';
import { PurchasePrediction } from './views/PurchasePrediction';
import { RecommendationEngine } from './views/RecommendationEngine';
import { SystemPerformance } from './views/SystemPerformance';
import { VisualizationLab3D } from './views/VisualizationLab3D';

interface NavItem {
  id: string;
  name: string;
  category: string;
  icon: any;
}

const NAV_ITEMS: NavItem[] = [
  // 1. Command & Core
  { id: 'command-center', name: 'Command Center', category: 'Executive & Data Core', icon: Sparkles },
  { id: 'data-observatory', name: 'Data Observatory', category: 'Executive & Data Core', icon: Database },
  { id: 'data-quality', name: 'Data Quality Engine', category: 'Executive & Data Core', icon: ShieldCheck },

  // 2. Customer & Product Intelligence
  { id: 'customer-universe', name: 'Customer Universe', category: 'Customer & Product', icon: Users },
  { id: 'customer-segmentation', name: 'Customer Segmentation', category: 'Customer & Product', icon: Target },
  { id: 'product-intelligence', name: 'Product Intelligence', category: 'Customer & Product', icon: Package },
  { id: 'purchase-behavior', name: 'Purchase Behavior & Cart', category: 'Customer & Product', icon: ShoppingCart },

  // 3. Commerce & Demand
  { id: 'market-basket', name: 'Market Basket Lab', category: 'Commerce & Demand', icon: Share2 },
  { id: 'recommendations', name: 'Recommendation Engine', category: 'Commerce & Demand', icon: Zap },
  { id: 'demand-intelligence', name: 'Demand Intelligence', category: 'Commerce & Demand', icon: LineChart },
  { id: 'anomaly-radar', name: 'Anomaly Radar', category: 'Commerce & Demand', icon: Radar },

  // 4. ML & Explainable AI
  { id: 'model-lab', name: 'Model Laboratory', category: 'Machine Learning & AI', icon: Activity },
  { id: 'explainable-ai', name: 'Explainable AI (SHAP)', category: 'Machine Learning & AI', icon: Brain },
  { id: 'purchase-prediction', name: 'Purchase Prediction', category: 'Machine Learning & AI', icon: Cpu },

  // 5. Strategy & 3D
  { id: 'business-simulator', name: 'Business Simulator', category: 'Strategy & Simulation', icon: Calculator },
  { id: 'decision-engine', name: 'Decision Engine', category: 'Strategy & Simulation', icon: Lightbulb },
  { id: '3d-lab', name: '3D Visualization Lab', category: 'Strategy & Simulation', icon: Boxes },
  { id: 'system-performance', name: 'System Performance', category: 'Strategy & Simulation', icon: Server },
];

export function App() {
  const [activeSection, setActiveSection] = useState<string>('command-center');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Global App Data State
  const [overview, setOverview] = useState<any>(null);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [customers, setCustomers] = useState<any>(null);
  const [productIntelligence, setProductIntelligence] = useState<any>(null);
  const [marketBasket, setMarketBasket] = useState<any>(null);
  const [demand, setDemand] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [journey, setJourney] = useState<any>(null);
  const [spaces3D, setSpaces3D] = useState<any>(null);
  const [modelLab, setModelLab] = useState<any>(null);
  const [decisionData, setDecisionData] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [
          ov,
          dq,
          cust,
          prod,
          mb,
          dem,
          anom,
          jrny,
          sp3d,
          ml,
          dec,
        ] = await Promise.all([
          api.getOverview(),
          api.getDataQuality(),
          api.getCustomers(),
          api.getProductIntelligence(),
          api.getMarketBasket(),
          api.getDemand(),
          api.getAnomalies(),
          api.getCustomerJourney(),
          api.get3DSpaces(),
          api.getModelLaboratory(),
          api.getDecisionEngine(),
        ]);

        setOverview(ov);
        setDataQuality(dq);
        setCustomers(cust);
        setProductIntelligence(prod);
        setMarketBasket(mb);
        setDemand(dem);
        setAnomalies(anom);
        setJourney(jrny);
        setSpaces3D(sp3d);
        setModelLab(ml);
        setDecisionData(dec);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to connect to backend analytical engine');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleExportData = () => {
    const exportPayload = {
      section: activeSection,
      timestamp: new Date().toISOString(),
      dataset: 'Instacart Market Basket Analysis',
      overview_kpis: overview?.kpis,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-intelligence-${activeSection}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Categories for Sidebar
  const categories = Array.from(new Set(NAV_ITEMS.map((item) => item.category)));

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#060b13]' : 'light bg-slate-50'} text-slate-100 flex flex-col font-sans transition-colors duration-200`}>
      {/* Top OS Command Header */}
      <header className="sticky top-0 z-50 glass-header px-6 py-3.5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveSection('command-center')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-cyan-glow text-white font-black text-lg">
              IQ
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-slate-100 flex items-center gap-2">
                InstaIQ &bull; Decision Intelligence
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Enterprise E-Commerce Observatory &bull; Python 3.13 &bull; DuckDB
              </div>
            </div>
          </div>
        </div>

        {/* Global Live Telemetry & Control Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              33.8M Transactions
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-mono font-bold">100% Quality Score</span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-400 font-mono">ROC-AUC: 0.813</span>
          </div>

          <button
            onClick={handleExportData}
            title="Export analytical view"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            title="Toggle theme"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 shrink-0 glass-panel border-r border-white/10 p-4 overflow-y-auto hidden md:block">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">
                  {category}
                </div>
                {NAV_ITEMS.filter((item) => item.category === category).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-white shadow-cyan-glow'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow-2xl focus:outline-none"
          >
            {NAV_ITEMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Canvas Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-grid-pattern">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="text-sm font-semibold text-slate-300">
                Initializing Vectorized Analytical Engines &bull; DuckDB Query Marts...
              </div>
            </div>
          ) : error ? (
            <div className="max-w-xl mx-auto p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center space-y-3 my-12">
              <AlertTriangle className="w-8 h-8 mx-auto text-rose-400" />
              <h3 className="font-bold text-base">Backend Connection Notice</h3>
              <p className="text-xs leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {activeSection === 'command-center' && (
                <CommandCenter
                  overview={overview}
                  demand={demand}
                  isDark={isDark}
                  onNavigate={setActiveSection}
                />
              )}

              {activeSection === 'data-observatory' && (
                <DataObservatory
                  overview={overview}
                  dataQuality={dataQuality}
                  isDark={isDark}
                />
              )}

              {activeSection === 'data-quality' && (
                <DataQualityView dataQuality={dataQuality} />
              )}

              {activeSection === 'customer-universe' && (
                <CustomerUniverse customers={customers} isDark={isDark} />
              )}

              {activeSection === 'customer-segmentation' && (
                <CustomerSegmentation
                  customers={customers}
                  spaces3D={spaces3D}
                  isDark={isDark}
                />
              )}

              {activeSection === 'product-intelligence' && (
                <ProductIntelligence
                  productIntelligence={productIntelligence}
                  spaces3D={spaces3D}
                  isDark={isDark}
                />
              )}

              {activeSection === 'purchase-behavior' && (
                <PurchaseBehavior journey={journey} isDark={isDark} />
              )}

              {activeSection === 'market-basket' && (
                <MarketBasketLab
                  marketBasket={marketBasket}
                  spaces3D={spaces3D}
                  isDark={isDark}
                />
              )}

              {activeSection === 'recommendations' && (
                <RecommendationEngine isDark={isDark} />
              )}

              {activeSection === 'demand-intelligence' && (
                <DemandIntelligence
                  demand={demand}
                  spaces3D={spaces3D}
                  isDark={isDark}
                />
              )}

              {activeSection === 'anomaly-radar' && (
                <AnomalyRadar anomaliesData={anomalies} />
              )}

              {activeSection === 'model-lab' && (
                <ModelLaboratory modelLab={modelLab} isDark={isDark} />
              )}

              {activeSection === 'explainable-ai' && (
                <ExplainableAI modelLab={modelLab} isDark={isDark} />
              )}

              {activeSection === 'purchase-prediction' && (
                <PurchasePrediction isDark={isDark} />
              )}

              {activeSection === 'business-simulator' && (
                <BusinessSimulator isDark={isDark} />
              )}

              {activeSection === 'decision-engine' && (
                <DecisionEngine decisionData={decisionData} />
              )}

              {activeSection === '3d-lab' && (
                <VisualizationLab3D spaces3D={spaces3D} isDark={isDark} />
              )}

              {activeSection === 'system-performance' && (
                <SystemPerformance isDark={isDark} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Persistent OS Bottom Telemetry Bar */}
      <footer className="glass-header px-6 py-2.5 border-t border-white/10 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            DuckDB SIMD Engine: ACTIVE
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline">Storage: Parquet ZSTD Columnar</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-cyan-300">Model: XGBoost Champion</span>
        </div>

        <div className="flex items-center gap-3">
          <span>AMD Ryzen Optimized &bull; Python 3.13</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-sans">InstaIQ Decision Platform</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
