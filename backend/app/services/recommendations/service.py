import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from backend.app.core.config import settings
from backend.app.core.db import db_manager
from backend.app.schemas.schemas import RecommendationItem, RecommendationResponse


class RecommendationService:
    def __init__(self):
        self.cache_dir = settings.CACHE_DIR
        self._rules = None
        self._top_products = None

    def _get_rules(self) -> List[Dict[str, Any]]:
        if self._rules is None:
            path = self.cache_dir / "market_basket_rules.json"
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._rules = data.get("rules", [])
            else:
                self._rules = []
        return self._rules

    def _get_top_products(self) -> List[Dict[str, Any]]:
        if self._top_products is None:
            path = self.cache_dir / "product_intelligence.json"
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._top_products = data.get("top_products", [])
            else:
                self._top_products = []
        return self._top_products

    def get_recommendations(self, customer_id: int, limit: int = 8) -> RecommendationResponse:
        # Check if customer exists in parquet
        cust_pq = (settings.ROOT_DIR / "data" / "features" / "customer_features.parquet").as_posix()
        prior_pq = (settings.PARQUET_DIR / "order_products__prior.parquet").as_posix()
        orders_pq = (settings.PARQUET_DIR / "orders.parquet").as_posix()
        prod_pq = (settings.PARQUET_DIR / "products.parquet").as_posix()

        cust_sql = f"""
            SELECT user_id, preferred_department, avg_basket_size, total_orders
            FROM read_parquet('{cust_pq}')
            WHERE user_id = ?
        """
        cust_res = db_manager.query(cust_sql, [customer_id])

        segment_name = "Steady Routine Customer"
        pref_dept = "produce"
        if cust_res:
            pref_dept = cust_res[0].get("preferred_department", "produce")
            orders_cnt = cust_res[0].get("total_orders", 10)
            if orders_cnt >= 40:
                segment_name = "Champions / Power Shoppers"
            elif orders_cnt >= 20:
                segment_name = "Loyal Routine Buyer"
            else:
                segment_name = "Occasional Buyer"

        # Customer's purchased products
        past_items_sql = f"""
            SELECT DISTINCT p.product_id, p.product_name, p.department_id, p.aisle_id
            FROM read_parquet('{prior_pq}') opp
            JOIN read_parquet('{orders_pq}') o ON opp.order_id = o.order_id
            JOIN read_parquet('{prod_pq}') p ON opp.product_id = p.product_id
            WHERE o.user_id = ?
            LIMIT 25
        """
        past_items = db_manager.query(past_items_sql, [customer_id])
        past_names = set([p["product_name"] for p in past_items])

        recommendations: List[RecommendationItem] = []
        rules = self._get_rules()
        top_prods = self._get_top_products()

        # 1. Association-based Cross-Sell: Find consequents from customer's purchased items
        for p in past_items:
            p_name = p["product_name"]
            for r in rules:
                if r["antecedent"].lower() == p_name.lower() and r["consequent"] not in past_names:
                    # Look up product info
                    rec = RecommendationItem(
                        product_id=p["product_id"] + 100,  # surrogate ID if exact unknown
                        product_name=r["consequent"],
                        department=pref_dept.title(),
                        aisle="Fresh Groceries",
                        recommendation_score=round(min(0.98, 0.5 + (r["lift"] / 10.0)), 2),
                        strategy="association_cross_sell",
                        reason=f"Strong market basket synergy: frequently bought with your favorite '{p_name}' (Lift: {r['lift']:.2f}x, Confidence: {r['confidence']*100:.1f}%).",
                        supporting_metrics={"lift": r["lift"], "confidence": r["confidence"], "support": r["support"]},
                    )
                    recommendations.append(rec)
                    past_names.add(r["consequent"])
                    if len(recommendations) >= 4:
                        break
            if len(recommendations) >= 4:
                break

        # 2. Collaborative / Department Preference Strategy
        dept_candidates = [
            tp for tp in top_prods
            if tp.get("department", "").lower() == pref_dept.lower()
            and tp.get("product_name") not in past_names
        ]
        for c in dept_candidates[:3]:
            rec = RecommendationItem(
                product_id=c["product_id"],
                product_name=c["product_name"],
                department=c.get("department", "Produce"),
                aisle=c.get("aisle", "General"),
                recommendation_score=round(c.get("reorder_rate", 0.65), 2),
                strategy="collaborative_category",
                reason=f"Top-reordered powerhouse in your most frequented department '{pref_dept.title()}' ({c.get('total_purchases', 0):,} platform purchases).",
                supporting_metrics={"reorder_rate": c.get("reorder_rate"), "popularity_rank": c.get("popularity_rank")},
            )
            recommendations.append(rec)
            past_names.add(c["product_name"])

        # 3. Global Reorder Anchor Strategy (Fill remaining slots)
        for tp in top_prods:
            if len(recommendations) >= limit:
                break
            if tp.get("product_name") not in past_names:
                rec = RecommendationItem(
                    product_id=tp["product_id"],
                    product_name=tp["product_name"],
                    department=tp.get("department", "Produce"),
                    aisle=tp.get("aisle", "General"),
                    recommendation_score=round(tp.get("reorder_rate", 0.70), 2),
                    strategy="platform_anchor",
                    reason=f"Platform essential with exceptional repeat purchase rate ({tp.get('reorder_rate', 0)*100:.1f}% reorder rate).",
                    supporting_metrics={"total_purchases": tp.get("total_purchases"), "rank": tp.get("popularity_rank")},
                )
                recommendations.append(rec)
                past_names.add(tp["product_name"])

        return RecommendationResponse(
            customer_id=customer_id,
            customer_segment=segment_name,
            total_recommendations=len(recommendations[:limit]),
            recommendations=recommendations[:limit],
        )


recommendation_service = RecommendationService()
