import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"


def test_overview():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert data["kpis"]["unique_customers"] == 206209
    assert data["kpis"]["total_products"] > 40000


def test_data_quality():
    res = client.get("/api/data-quality")
    assert res.status_code == 200
    data = res.json()
    assert "overall_score" in data
    assert data["overall_score"] >= 90.0
    assert "dimensions" in data
    assert "completeness" in data["dimensions"]


def test_customers():
    res = client.get("/api/customers")
    assert res.status_code == 200
    data = res.json()
    assert "segment_distribution" in data
    assert "rfp_summary" in data


def test_product_intelligence():
    res = client.get("/api/product-intelligence")
    assert res.status_code == 200
    data = res.json()
    assert "top_products" in data
    assert len(data["top_products"]) > 0


def test_market_basket():
    res = client.get("/api/market-basket?min_lift=1.5")
    assert res.status_code == 200
    data = res.json()
    assert "rules" in data
    assert len(data["rules"]) > 0


def test_demand():
    res = client.get("/api/demand")
    assert res.status_code == 200
    data = res.json()
    assert "dow_distribution" in data
    assert "forecasting" in data


def test_anomalies():
    res = client.get("/api/anomalies")
    assert res.status_code == 200
    data = res.json()
    assert "anomalies" in data
    assert len(data["anomalies"]) > 0


def test_customer_journey():
    res = client.get("/api/customer-journey")
    assert res.status_code == 200
    data = res.json()
    assert "cart_positions" in data


def test_3d_spaces():
    res = client.get("/api/3d-spaces")
    assert res.status_code == 200
    data = res.json()
    assert "customer_universe_3d" in data
    assert "product_intelligence_3d" in data
    assert "association_landscape_3d" in data
    assert "demand_surface_3d" in data


def test_model_laboratory():
    res = client.get("/api/model-laboratory")
    assert res.status_code == 200
    data = res.json()
    assert "model_comparison" in data
    assert "curves" in data
    assert "threshold_analysis" in data
    assert "shap_analysis" in data
    assert len(data["model_comparison"]) >= 3


def test_predict_endpoint():
    payload = {
        "user_total_orders": 15,
        "user_avg_days_between": 12.5,
        "user_avg_basket_size": 9.4,
        "user_reorder_rate": 0.62,
        "prod_total_purchases": 5200,
        "prod_reorder_rate": 0.68,
        "prod_avg_cart_position": 4.2,
        "up_orders_count": 8,
        "up_order_ratio": 0.53,
        "up_orders_since_last": 1,
        "up_avg_cart_pos": 3.5,
    }
    res = client.post("/api/predict?threshold=0.5", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "predicted_probability" in data
    assert 0.0 <= data["predicted_probability"] <= 1.0
    assert "feature_contributions" in data


def test_simulate_endpoint():
    payload = {
        "recommendation_threshold": 0.5,
        "target_segment": "All",
        "product_popularity_threshold": 500,
        "reorder_probability_threshold": 0.4,
        "demand_growth_pct": 10.0,
        "customer_activity_threshold": 5,
    }
    res = client.post("/api/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "target_customers_reached" in data
    assert data["target_customers_reached"] > 0


def test_decision_engine():
    res = client.get("/api/decision-engine")
    assert res.status_code == 200
    data = res.json()
    assert "decisions" in data
    assert len(data["decisions"]) >= 4


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    tests = [
        ("Healthcheck", test_health),
        ("Executive Overview", test_overview),
        ("Data Quality & Lineage", test_data_quality),
        ("Customer Intelligence", test_customers),
        ("Product Intelligence", test_product_intelligence),
        ("Market Basket Analysis", test_market_basket),
        ("Demand & Forecasting", test_demand),
        ("Anomaly Radar", test_anomalies),
        ("Customer Journey", test_customer_journey),
        ("3D Spaces", test_3d_spaces),
        ("Model Laboratory", test_model_laboratory),
        ("Predict Endpoint", test_predict_endpoint),
        ("Business Simulator", test_simulate_endpoint),
        ("Decision Engine", test_decision_engine),
    ]
    print("=" * 65)
    print("RUNNING API & ANALYTICS INTEGRATION TEST SUITE")
    print("=" * 65)
    passed = 0
    for name, test_fn in tests:
        try:
            test_fn()
            print(f"  [PASS] {name:<30} OK")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name:<30} ERROR: {e}")
    print("=" * 65)
    print(f"RESULTS: {passed}/{len(tests)} tests passed successfully!")
    print("=" * 65)

