const API_BASE = '/api';

export const api = {
  getOverview: async () => {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error('Failed to fetch platform overview');
    return res.json();
  },

  getDataQuality: async () => {
    const res = await fetch(`${API_BASE}/data-quality`);
    if (!res.ok) throw new Error('Failed to fetch data quality metrics');
    return res.json();
  },

  getCustomers: async () => {
    const res = await fetch(`${API_BASE}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customer intelligence');
    return res.json();
  },

  getCustomerById: async (userId: number) => {
    const res = await fetch(`${API_BASE}/customers/${userId}`);
    if (!res.ok) throw new Error(`Customer #${userId} not found`);
    return res.json();
  },

  getProductIntelligence: async () => {
    const res = await fetch(`${API_BASE}/product-intelligence`);
    if (!res.ok) throw new Error('Failed to fetch product intelligence');
    return res.json();
  },

  getProducts: async (params?: { department?: string; search?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'All') query.append('department', params.department);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  getMarketBasket: async (params?: { min_lift?: number; min_confidence?: number; min_support?: number }) => {
    const query = new URLSearchParams();
    if (params?.min_lift) query.append('min_lift', String(params.min_lift));
    if (params?.min_confidence) query.append('min_confidence', String(params.min_confidence));
    if (params?.min_support) query.append('min_support', String(params.min_support));
    const res = await fetch(`${API_BASE}/market-basket?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch market basket rules');
    return res.json();
  },

  getRecommendations: async (customerId: number, limit: number = 6) => {
    const res = await fetch(`${API_BASE}/recommendations/${customerId}?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch recommendations for customer #${customerId}`);
    return res.json();
  },

  getDemand: async () => {
    const res = await fetch(`${API_BASE}/demand`);
    if (!res.ok) throw new Error('Failed to fetch demand intelligence');
    return res.json();
  },

  getAnomalies: async (severity?: string) => {
    const query = severity && severity !== 'ALL' ? `?severity=${severity}` : '';
    const res = await fetch(`${API_BASE}/anomalies${query}`);
    if (!res.ok) throw new Error('Failed to fetch anomalies');
    return res.json();
  },

  getCustomerJourney: async () => {
    const res = await fetch(`${API_BASE}/customer-journey`);
    if (!res.ok) throw new Error('Failed to fetch customer journey');
    return res.json();
  },

  get3DSpaces: async () => {
    const res = await fetch(`${API_BASE}/3d-spaces`);
    if (!res.ok) throw new Error('Failed to fetch 3D space datasets');
    return res.json();
  },

  getModelLaboratory: async () => {
    const res = await fetch(`${API_BASE}/model-laboratory`);
    if (!res.ok) throw new Error('Failed to fetch model evaluation laboratory');
    return res.json();
  },

  predict: async (features: Record<string, number>, threshold: number = 0.5) => {
    const res = await fetch(`${API_BASE}/predict?threshold=${threshold}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });
    if (!res.ok) throw new Error('Prediction API call failed');
    return res.json();
  },

  simulate: async (scenario: Record<string, any>) => {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    });
    if (!res.ok) throw new Error('Simulation API call failed');
    return res.json();
  },

  getDecisionEngine: async () => {
    const res = await fetch(`${API_BASE}/decision-engine`);
    if (!res.ok) throw new Error('Failed to fetch decision engine recommendations');
    return res.json();
  },

  getSystemPerformance: async () => {
    const res = await fetch(`${API_BASE}/system-performance`);
    if (!res.ok) throw new Error('Failed to fetch system performance metrics');
    return res.json();
  },
};
