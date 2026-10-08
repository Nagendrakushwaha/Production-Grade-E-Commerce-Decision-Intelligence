import json
from pathlib import Path
from typing import Any, Dict
from backend.app.core.config import settings
from backend.app.schemas.schemas import SimulationRequest, SimulationResult


class SimulatorService:
    def __init__(self):
        self.cache_dir = settings.CACHE_DIR

    def _read_cache(self, filename: str) -> Dict[str, Any]:
        path = self.cache_dir / filename
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def run_simulation(self, req: SimulationRequest) -> SimulationResult:
        cust_data = self._read_cache("customer_intelligence.json")
        prod_data = self._read_cache("product_intelligence.json")
        demand_data = self._read_cache("demand_intelligence.json")

        total_customers = 206209  # platform total
        seg_dist = cust_data.get("segment_distribution", {})

        # 1. Target customers reached
        if req.target_segment == "All":
            base_target = total_customers
        else:
            sample_count = seg_dist.get(req.target_segment, 3500)
            sample_total = sum(seg_dist.values()) or 25000
            base_target = int(total_customers * (sample_count / sample_total))

        # Filter by customer activity threshold (avg orders >= req.customer_activity_threshold)
        activity_multiplier = max(0.2, min(1.0, 1.0 - (req.customer_activity_threshold - 4) * 0.03))
        reached_customers = int(base_target * activity_multiplier)
        reached_pct = round(100.0 * reached_customers / total_customers, 2)

        # 2. Eligible products in recommendation pool
        top_prods = prod_data.get("top_products", [])
        eligible_prods = sum(
            1
            for p in top_prods
            if p.get("total_purchases", 0) >= req.product_popularity_threshold
            and p.get("reorder_rate", 0) >= req.reorder_probability_threshold
        )
        # Scale to total catalog
        eligible_total = int(eligible_prods * 4.5)

        # 3. Expected purchase conversion opportunities
        # Model-based estimation: reached_customers * (1 - threshold * 0.4) * eligible_prods ratio
        base_conversion_rate = 0.28
        threshold_impact = (1.0 - (req.recommendation_threshold - 0.5) * 0.45)
        conversions = int(reached_customers * base_conversion_rate * threshold_impact)

        # 4. At-risk customer pool
        at_risk_sample = seg_dist.get("At Risk High Value", 2100)
        at_risk_pct = at_risk_sample / (sum(seg_dist.values()) or 25000)
        at_risk_pool = int(total_customers * at_risk_pct)

        # 5. Projected weekly order demand with growth assumption
        current_weekly_orders = 70500  # platform baseline
        growth_factor = 1.0 + (req.demand_growth_pct / 100.0)
        projected_orders = int(current_weekly_orders * growth_factor)

        # 6. Category shifts
        dept_leaderboard = prod_data.get("department_leaderboard", [])
        category_shifts = []
        for d in dept_leaderboard[:6]:
            dept_name = d.get("department", "Unknown")
            base_orders = int(d.get("total_purchases", 10000) / 45)  # approximate weekly
            shift_rate = (req.demand_growth_pct / 100.0) * (1.2 if dept_name in ["produce", "dairy eggs"] else 0.8)
            projected_dept = int(base_orders * (1.0 + shift_rate))
            category_shifts.append({
                "department": dept_name,
                "current_weekly": base_orders,
                "projected_weekly": projected_dept,
                "net_change": projected_dept - base_orders,
            })

        summary = (
            f"Under scenario conditions (Threshold: {req.recommendation_threshold}, Target: {req.target_segment}), "
            f"the platform engages {reached_customers:,} customers ({reached_pct}% of total audience). "
            f"With a {req.demand_growth_pct:+.1f}% demand shift, expected purchase conversion volume is estimated at "
            f"{conversions:,} transactions, addressing an at-risk base of {at_risk_pool:,} high-value customers."
        )

        return SimulationResult(
            scenario_type="Model-based scenario estimate",
            target_customers_reached=reached_customers,
            target_customers_pct=reached_pct,
            eligible_products_count=eligible_total,
            expected_purchase_conversions=conversions,
            potential_at_risk_customers=at_risk_pool,
            projected_weekly_orders=projected_orders,
            demand_impact_summary=summary,
            category_shifts=category_shifts,
        )


simulator_service = SimulatorService()
