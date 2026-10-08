# Model Cards

---

## 1. Model Card: Next-Order Purchase Predictor (XGBoost Champion)

### Model Details
- **Architecture**: Gradient Boosted Decision Trees (XGBoost Classifier)
- **Model Version**: 1.0.0
- **Primary Purpose**: Predict whether a customer will reorder a previously purchased product in their upcoming order.
- **Maintainers**: E-Commerce Decision Intelligence ML Engineering Team

### Intended Use
- Power real-time "Buy Again" dynamic order recommendations.
- Personalize home screen search default rankings.
- Identify churn risk for high-frequency consumable items.

### Training & Validation Data
- **Source**: Instacart Market Basket Analysis (prior orders vs train orders).
- **Features Used**:
  - `user_total_orders`
  - `user_avg_days_between`
  - `user_avg_basket_size`
  - `user_reorder_rate`
  - `prod_total_purchases`
  - `prod_reorder_rate`
  - `prod_avg_cart_position`
  - `up_orders_count`
  - `up_order_ratio`
  - `up_orders_since_last`
  - `up_avg_cart_pos`
- **Target**: `target` (Binary: 1 if reordered in next order, 0 otherwise).
- **Split Protocol**: 70% Train, 15% Validation, 15% Test (User-stratified).

### Empirical Performance Metrics (Held-Out Test Set)
- **ROC-AUC**: 0.8133
- **PR-AUC**: 0.4520
- **F1 Score (@ 0.50 Threshold)**: 0.4287
- **Precision**: 0.3863
- **Recall**: 0.4816
- **Log Loss**: 0.2854
- **5-Fold Cross-Validation Mean ROC-AUC**: 0.8302 (&plusmn;0.0142)

### Explainability
- Explanations calculated using TreeSHAP (`shap.TreeExplainer`).
- Primary global drivers: `up_orders_count`, `up_orders_since_last`, `user_reorder_rate`.

### Limitations & Assumptions
- Assumes historical interaction exists; cold-start products with 0 prior user purchases are delegated to popularity/collaborative recommendation heuristics.
- Does not observe price elasticity (dataset lacks price features).

---

## 2. Model Card: Baseline Classifiers (Logistic Regression & Random Forest)

### Logistic Regression
- **Purpose**: Linear baseline to measure non-linear tree gains.
- **Metrics**: ROC-AUC: 0.8208, F1: 0.3626, Precision: 0.2447, Recall: 0.7000.
- **Key Insight**: Achieves high recall but suffers from low precision due to linear boundary constraints on non-linear interaction ratios.

### Random Forest
- **Purpose**: Bagged ensemble benchmark (100 estimators, max depth 12).
- **Metrics**: ROC-AUC: 0.8173, F1: 0.2151, Precision: 0.5038, Recall: 0.1367.
- **Key Insight**: Conservative decision boundary leads to higher precision on confident predictions but misses minority class positives at standard 0.5 threshold.

---

## 3. Model Card: MiniBatchKMeans Customer Segmentation

### Model Details
- **Architecture**: MiniBatchKMeans ($k=4$, batch size 2048, $n\_init=5$).
- **Features**: Total orders, average basket size, customer reorder rate, inter-order interval, unique products.
- **Validation Metrics**:
  - $k=3$: Silhouette: 0.2110, Davies-Bouldin: 1.4820, Calinski-Harabasz: 8,421
  - $k=4$: Silhouette: 0.2384, Davies-Bouldin: 1.3410, Calinski-Harabasz: 9,842 (Champion)
  - $k=5$: Silhouette: 0.2052, Davies-Bouldin: 1.4120, Calinski-Harabasz: 8,914
  - $k=6$: Silhouette: 0.1895, Davies-Bouldin: 1.5201, Calinski-Harabasz: 8,110

### Identified Segments
- **Cluster 0**: High-Frequency Bulk Reorderers (18.4% of total)
- **Cluster 1**: Diverse Variety Explorers (26.2% of total)
- **Cluster 2**: Low-Frequency Occasional Buyers (34.1% of total)
- **Cluster 3**: High-Volume Routine Champions (21.3% of total)

---

## 4. Model Card: Holt Damped Exponential Smoothing Demand Forecaster

### Model Details
- **Architecture**: Damped Additive Trend Holt-Winters Model.
- **Evaluation**: Order timeline progression series ($n=70$ cycle steps, 75% train / 25% test).
- **Performance**:
  - **MAE**: 18.4 orders
  - **RMSE**: 22.8 orders
  - **sMAPE**: 3.8%
  - **$R^2$**: 0.9412
- **Comparison**: Outperforms 5-step Moving Average ($R^2 = 0.8142$) and Naive Baseline ($R^2 = 0.6210$).
