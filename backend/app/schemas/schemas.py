from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Overview & System Schemas
# ---------------------------------------------------------------------------
class KPIMetrics(BaseModel):
    unique_customers: int
    total_orders: int
    total_products: int
    total_aisles: int
    total_departments: int
    total_line_items: int
    avg_basket_size: float
    platform_reorder_rate: float
    data_quality_score: float
    champion_model_roc_auc: float


class OverviewResponse(BaseModel):
    kpis: KPIMetrics
    dataset_summary: Dict[str, Any]
    quick_insights: List[Dict[str, str]]


class SystemHealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    duckdb_status: str
    parquet_tables_loaded: int
    cache_files_ready: int
    memory_info: Dict[str, Any]


# ---------------------------------------------------------------------------
# Data Quality Schemas
# ---------------------------------------------------------------------------
class DimensionScore(BaseModel):
    score: float
    details: str


class DataQualityResponse(BaseModel):
    overall_score: float
    dimensions: Dict[str, DimensionScore]
    checks: Dict[str, Any]
    data_lineage: List[Dict[str, Any]]
    generated_at: str


# ---------------------------------------------------------------------------
# Customer Intelligence & Segmentation Schemas
# ---------------------------------------------------------------------------
class CustomerProfile(BaseModel):
    user_id: int
    total_orders: int
    total_items: int
    unique_products: int
    avg_basket_size: float
    reorder_rate: float
    avg_days_between_orders: float
    recency_days: float
    avg_order_hour: float
    preferred_order_dow: int
    preferred_department: str
    rfp_score: Optional[str] = None
    rfp_segment: Optional[str] = None
    cluster: Optional[int] = None


class CustomerIntelligenceResponse(BaseModel):
    total_analyzed_customers: int
    segment_distribution: Dict[str, int]
    rfp_summary: Dict[str, float]
    cluster_evaluation: List[Dict[str, Any]]
    cluster_profiles: List[Dict[str, Any]]
    sample_customers: List[Dict[str, Any]]


# ---------------------------------------------------------------------------
# Product Intelligence Schemas
# ---------------------------------------------------------------------------
class ProductItem(BaseModel):
    product_id: int
    product_name: str
    aisle: Optional[str] = None
    department: Optional[str] = None
    total_purchases: int
    total_reorders: int
    reorder_rate: float
    popularity_rank: Optional[int] = None
    avg_add_to_cart_order: Optional[float] = None
    unique_customers_count: Optional[int] = None


class ProductIntelligenceResponse(BaseModel):
    top_products: List[ProductItem]
    department_leaderboard: List[Dict[str, Any]]
    aisle_leaderboard: List[Dict[str, Any]]


# ---------------------------------------------------------------------------
# Market Basket Schemas
# ---------------------------------------------------------------------------
class AssociationRule(BaseModel):
    antecedent: str
    consequent: str
    support: float
    confidence: float
    lift: float
    pair_count: int


class MarketBasketResponse(BaseModel):
    total_rules_extracted: int
    rules: List[AssociationRule]
    department_co_occurrence: List[Dict[str, Any]]
    min_support_used: float
    max_lift_observed: float


# ---------------------------------------------------------------------------
# Demand & Forecasting Schemas
# ---------------------------------------------------------------------------
class ForecastModelMetrics(BaseModel):
    mae: float
    rmse: float
    smape: float
    r2: float


class ForecastModel(BaseModel):
    name: str
    metrics: ForecastModelMetrics


class DemandResponse(BaseModel):
    dow_distribution: List[Dict[str, Any]]
    hour_distribution: List[Dict[str, Any]]
    heatmap: List[Dict[str, Any]]
    timeline_series: List[Dict[str, Any]]
    forecasting: Dict[str, Any]


# ---------------------------------------------------------------------------
# Model Laboratory & Explainable AI Schemas
# ---------------------------------------------------------------------------
class ModelComparisonItem(BaseModel):
    name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    pr_auc: float
    log_loss: float
    training_time_sec: float
    confusion_matrix: List[List[int]]
    is_best: bool


class ModelLaboratoryResponse(BaseModel):
    timestamp: str
    champion_model: str
    dataset_metadata: Dict[str, Any]
    model_comparison: List[ModelComparisonItem]
    curves: Dict[str, Any]
    threshold_analysis: List[Dict[str, Any]]
    cross_validation: Dict[str, Any]
    feature_importance: List[Dict[str, Any]]
    shap_analysis: Optional[Dict[str, Any]] = None
    leakage_audit: Dict[str, str]


class PredictRequest(BaseModel):
    user_total_orders: float = Field(..., ge=1, le=150, example=15)
    user_avg_days_between: float = Field(..., ge=0, le=30, example=12.5)
    user_avg_basket_size: float = Field(..., ge=1, le=80, example=9.4)
    user_reorder_rate: float = Field(..., ge=0, le=1.0, example=0.62)
    prod_total_purchases: float = Field(..., ge=1, example=5200)
    prod_reorder_rate: float = Field(..., ge=0, le=1.0, example=0.68)
    prod_avg_cart_position: float = Field(..., ge=1, le=50, example=4.2)
    up_orders_count: float = Field(..., ge=1, le=100, example=8)
    up_order_ratio: float = Field(..., ge=0, le=1.0, example=0.53)
    up_orders_since_last: float = Field(..., ge=0, le=50, example=1)
    up_avg_cart_pos: float = Field(..., ge=1, le=50, example=3.5)


class FeatureContribution(BaseModel):
    feature: str
    value: float
    shap_value: float
    effect: str


class PredictResponse(BaseModel):
    predicted_probability: float
    predicted_reorder: int
    decision: str
    classification_threshold: float
    feature_contributions: List[FeatureContribution]
    primary_driver: str


# ---------------------------------------------------------------------------
# Recommendation Schemas
# ---------------------------------------------------------------------------
class RecommendationItem(BaseModel):
    product_id: int
    product_name: str
    department: str
    aisle: str
    recommendation_score: float
    strategy: str  # popularity, collaborative, association_cross_sell, hybrid
    reason: str
    supporting_metrics: Dict[str, Any]


class RecommendationResponse(BaseModel):
    customer_id: int
    customer_segment: str
    total_recommendations: int
    recommendations: List[RecommendationItem]


# ---------------------------------------------------------------------------
# Business Simulator & Decision Engine Schemas
# ---------------------------------------------------------------------------
class SimulationRequest(BaseModel):
    recommendation_threshold: float = Field(0.5, ge=0.1, le=0.9)
    target_segment: str = Field("All", example="All")
    product_popularity_threshold: int = Field(500, ge=10, le=10000)
    reorder_probability_threshold: float = Field(0.4, ge=0.1, le=0.9)
    demand_growth_pct: float = Field(5.0, ge=-50.0, le=100.0)
    customer_activity_threshold: int = Field(5, ge=1, le=30)


class SimulationResult(BaseModel):
    scenario_type: str = "Model-based scenario estimate"
    target_customers_reached: int
    target_customers_pct: float
    eligible_products_count: int
    expected_purchase_conversions: int
    potential_at_risk_customers: int
    projected_weekly_orders: int
    demand_impact_summary: str
    category_shifts: List[Dict[str, Any]]


class DecisionItem(BaseModel):
    domain: str  # CUSTOMER, PRODUCT, RECOMMENDATION, DEMAND
    headline: str
    signal_detected: str
    evidence: str
    confidence_score: float
    urgency: str  # HIGH, MEDIUM, LOW
    recommended_action: str


class DecisionEngineResponse(BaseModel):
    total_decisions: int
    high_urgency_count: int
    decisions: List[DecisionItem]
    generated_at: str
