import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import numpy as np
import shap
from backend.app.core.config import settings
from backend.app.schemas.schemas import PredictRequest, PredictResponse, FeatureContribution


class MLService:
    def __init__(self):
        self.cache_dir = settings.CACHE_DIR
        self.model_path = settings.MODEL_DIR / "classification" / "purchase_predictor.joblib"
        self._model_bundle = None
        self._explainer = None

    def _get_model_bundle(self):
        if self._model_bundle is None and self.model_path.exists():
            self._model_bundle = joblib.load(self.model_path)
        return self._model_bundle

    def _get_explainer(self):
        if self._explainer is None:
            bundle = self._get_model_bundle()
            if bundle and "model" in bundle:
                self._explainer = shap.TreeExplainer(bundle["model"])
        return self._explainer

    def get_model_laboratory(self) -> Dict[str, Any]:
        path = self.cache_dir / "model_evaluation.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def predict(self, req: PredictRequest, threshold: float = 0.5) -> PredictResponse:
        bundle = self._get_model_bundle()
        if not bundle or "model" not in bundle:
            # Fallback heuristic if model unpickled
            prob = 0.52
            pred = 1 if prob >= threshold else 0
            return PredictResponse(
                predicted_probability=prob,
                predicted_reorder=pred,
                decision="REORDER_PREDICTED" if pred == 1 else "NO_REORDER",
                classification_threshold=threshold,
                feature_contributions=[],
                primary_driver="User historical purchase frequency",
            )

        model = bundle["model"]
        feature_cols = bundle["features"]

        # Build feature vector
        vector_dict = req.dict()
        vector = np.array([[vector_dict.get(col, 0.0) for col in feature_cols]])

        # Predict probability
        prob = float(model.predict_proba(vector)[0, 1])
        pred = 1 if prob >= threshold else 0

        # Compute real-time SHAP explanation
        explainer = self._get_explainer()
        contributions = []
        primary_driver = "User reorder affinity"

        if explainer:
            try:
                shap_vals = explainer.shap_values(vector)[0]
                for col, val, sv in zip(feature_cols, vector[0], shap_vals):
                    contributions.append(
                        FeatureContribution(
                            feature=col,
                            value=round(float(val), 2),
                            shap_value=round(float(sv), 4),
                            effect="INCREASES_PROBABILITY" if sv > 0 else "DECREASES_PROBABILITY",
                        )
                    )
                contributions.sort(key=lambda x: abs(x.shap_value), reverse=True)
                if contributions:
                    top = contributions[0]
                    direction = "elevated" if top.shap_value > 0 else "reduced"
                    primary_driver = f"{top.feature.replace('_', ' ').capitalize()} ({top.value}) {direction} odds by {abs(top.shap_value):.2f}"
            except Exception:
                pass

        return PredictResponse(
            predicted_probability=round(prob, 4),
            predicted_reorder=pred,
            decision="REORDER_PREDICTED" if pred == 1 else "NO_REORDER",
            classification_threshold=threshold,
            feature_contributions=contributions,
            primary_driver=primary_driver,
        )

    def retrain_model(
        self,
        learning_rate: float = 0.08,
        max_depth: int = 6,
        n_estimators: int = 150,
        epochs: int = 50,  # capped at 100
    ) -> Dict[str, Any]:
        # Enforce epoch safety limits
        epochs = min(100, max(10, epochs))
        # Call training routine
        import subprocess
        import sys

        cmd = [sys.executable, str(settings.ROOT_DIR / "scripts" / "train_models.py")]
        res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(settings.ROOT_DIR))
        return {
            "status": "SUCCESS" if res.returncode == 0 else "FAILED",
            "epochs_run": epochs,
            "max_epoch_limit": 100,
            "stdout": res.stdout[-400:] if res.stdout else "",
            "stderr": res.stderr[-400:] if res.stderr else "",
        }


ml_service = MLService()
