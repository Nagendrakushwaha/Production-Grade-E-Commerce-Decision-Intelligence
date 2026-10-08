from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.schemas import (
    CustomerIntelligenceResponse,
    CustomerProfile,
    DataQualityResponse,
    DecisionEngineResponse,
    DemandResponse,
    MarketBasketResponse,
    ModelLaboratoryResponse,
    OverviewResponse,
    PredictRequest,
    PredictResponse,
    ProductIntelligenceResponse,
    RecommendationResponse,
    SimulationRequest,
    SimulationResult,
)
from backend.app.services.analytics.service import analytics_service
from backend.app.services.decision_engine.service import decision_engine_service
from backend.app.services.ml.service import ml_service
from backend.app.services.recommendations.service import recommendation_service
from backend.app.services.simulator.service import simulator_service

router = APIRouter()


@router.get("/overview", response_model=OverviewResponse)
def get_overview():
    """Retrieve platform executive KPIs, actual totals, and data highlights."""
    return analytics_service.get_overview()


@router.get("/data-quality", response_model=DataQualityResponse)
def get_data_quality():
    """Retrieve automated data quality evaluation, dimensions, and visual lineage."""
    data = analytics_service.get_data_quality()
    if not data:
        raise HTTPException(status_code=404, detail="Data quality metrics not found")
    return data


@router.get("/customers", response_model=CustomerIntelligenceResponse)
def get_customers():
    """Retrieve customer intelligence summary, RFP distributions, and clustering evaluations."""
    data = analytics_service.get_customer_intelligence()
    if not data:
        raise HTTPException(status_code=404, detail="Customer intelligence metrics not found")
    return {
        "total_analyzed_customers": data.get("total_analyzed_customers", 0),
        "segment_distribution": data.get("segment_distribution", {}),
        "rfp_summary": data.get("rfp_summary", {}),
        "cluster_evaluation": data.get("cluster_evaluation", []),
        "cluster_profiles": data.get("cluster_profiles", []),
        "sample_customers": data.get("sample_3d_points", [])[:50],
    }


@router.get("/customers/{user_id}")
def get_customer_profile(user_id: int):
    """Inspect individual customer behavior, RFP segment, and order history."""
    cust = analytics_service.get_customer_by_id(user_id)
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer #{user_id} not found in database")
    return cust


@router.get("/product-intelligence", response_model=ProductIntelligenceResponse)
def get_product_intelligence():
    """Retrieve product intelligence leaderboards, aisle and department rankings."""
    data = analytics_service.get_product_intelligence()
    if not data:
        raise HTTPException(status_code=404, detail="Product intelligence metrics not found")
    return data


@router.get("/products")
def list_products(
    department: Optional[str] = Query(None, description="Filter by department"),
    search: Optional[str] = Query(None, description="Search product by name"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Search and filter product catalog with popularity rankings and reorder metrics."""
    return analytics_service.get_products(department=department, search=search, limit=limit, offset=offset)


@router.get("/products/{product_id}")
def get_product_details(product_id: int):
    """Retrieve detailed analytics for a single product."""
    prod = analytics_service.get_product_by_id(product_id)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product #{product_id} not found in catalog")
    return prod


@router.get("/market-basket", response_model=MarketBasketResponse)
def get_market_basket(
    min_lift: float = Query(1.0, ge=0.1, le=10.0),
    min_confidence: float = Query(0.01, ge=0.001, le=1.0),
    min_support: float = Query(0.0001, ge=0.00001, le=0.5),
):
    """Query mined association rules with interactive support, confidence, and lift thresholds."""
    return analytics_service.get_market_basket(min_lift=min_lift, min_confidence=min_confidence, min_support=min_support)


@router.get("/recommendations/{customer_id}", response_model=RecommendationResponse)
def get_recommendations(customer_id: int, limit: int = Query(6, ge=1, le=20)):
    """Generate explainable product recommendations for a specific customer."""
    return recommendation_service.get_recommendations(customer_id=customer_id, limit=limit)


@router.post("/recommend", response_model=RecommendationResponse)
def generate_recommendations(payload: Dict[str, Any]):
    """Dynamic recommendations request."""
    customer_id = payload.get("customer_id", 1)
    limit = payload.get("limit", 6)
    return recommendation_service.get_recommendations(customer_id=customer_id, limit=limit)


@router.get("/demand", response_model=DemandResponse)
def get_demand():
    """Retrieve temporal purchase patterns, DOW/hour distributions, and demand forecasting comparisons."""
    data = analytics_service.get_demand_intelligence()
    if not data:
        raise HTTPException(status_code=404, detail="Demand intelligence data not found")
    return data


@router.get("/anomalies")
def get_anomalies(severity: Optional[str] = Query(None, description="Filter by CRITICAL, HIGH, MEDIUM")):
    """Inspect detected anomalies: abnormal basket sizes, churn spikes, and retention gaps."""
    return analytics_service.get_anomalies(severity=severity)


@router.get("/customer-journey")
def get_customer_journey():
    """Retrieve add-to-cart position drop-off curve and journey stages."""
    return analytics_service.get_customer_journey()


@router.get("/3d-spaces")
def get_3d_spaces():
    """Retrieve coordinates for 3D Customer Universe, 3D Product Space, 3D Associations, and Demand Surface."""
    return analytics_service.get_3d_spaces()


@router.get("/model-laboratory", response_model=ModelLaboratoryResponse)
def get_model_laboratory():
    """Inspect model evaluation metrics, ROC/PR curves, threshold analysis, CV, and SHAP explainability."""
    data = ml_service.get_model_laboratory()
    if not data:
        raise HTTPException(status_code=404, detail="Model evaluation data not found")
    return data


@router.post("/predict", response_model=PredictResponse)
def predict_reorder(payload: PredictRequest, threshold: float = Query(0.5, ge=0.05, le=0.95)):
    """Predict next-order purchase probability with real-time SHAP feature contributions."""
    return ml_service.predict(payload, threshold=threshold)


@router.post("/train")
def retrain_model(payload: Dict[str, Any]):
    """Controlled model retraining trigger (max epoch limit = 100)."""
    epochs = payload.get("epochs", 50)
    learning_rate = payload.get("learning_rate", 0.08)
    return ml_service.retrain_model(epochs=epochs, learning_rate=learning_rate)


@router.post("/simulate", response_model=SimulationResult)
def simulate_scenario(payload: SimulationRequest):
    """Run interactive what-if business simulation on customer segments and demand assumptions."""
    return simulator_service.run_simulation(payload)


@router.get("/decision-engine", response_model=DecisionEngineResponse)
def get_decision_engine():
    """Generate prescriptive business actions across Customer, Product, Recommendation, and Demand domains."""
    return decision_engine_service.get_decisions()


@router.get("/system-performance")
def get_system_performance():
    """Inspect memory usage, cache status, and query engine telemetry."""
    import psutil
    import os

    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()

    cache_files = [
        "dataset_summary.json",
        "data_quality.json",
        "product_intelligence.json",
        "customer_intelligence.json",
        "market_basket_rules.json",
        "demand_intelligence.json",
        "anomalies.json",
        "customer_journey.json",
        "model_evaluation.json",
    ]
    cache_status = {}
    for cf in cache_files:
        p = analytics_service.cache_dir / cf
        cache_status[cf] = {
            "exists": p.exists(),
            "size_kb": round(p.stat().st_size / 1024, 2) if p.exists() else 0,
        }

    return {
        "status": "HEALTHY",
        "process_ram_mb": round(mem_info.rss / (1024 * 1024), 2),
        "total_system_ram_gb": round(psutil.virtual_memory().total / (1024**3), 2),
        "available_system_ram_gb": round(psutil.virtual_memory().available / (1024**3), 2),
        "cpu_usage_pct": psutil.cpu_percent(),
        "duckdb_threads": 6,
        "duckdb_memory_limit": "8GB",
        "cache_files": cache_status,
        "all_caches_ready": all(v["exists"] for v in cache_status.values()),
    }
