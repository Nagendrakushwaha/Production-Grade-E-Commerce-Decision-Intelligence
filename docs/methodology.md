# Analytical & Mathematical Methodology

## 1. Zero-Fabrication Principle

In enterprise decision intelligence, fabricating synthetic metrics (such as inventing dollar revenues, profit margins, or fake conversion rates) undermines stakeholder trust. The Instacart dataset provides transactional sequence metadata, product taxonomy, and reorder signals, but **contains no product prices or monetary revenue**.

Rather than inventing fake dollar values:
1. We compute **RFP Analysis** (Recency, Frequency, Product Diversity proxy).
2. All machine learning evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC, Log Loss) are calculated from actual model execution on actual held-out test splits.
3. Every metric displayed on the dashboard has an audited computational trace.

---

## 2. Customer RFP Segmentation

### Why RFP instead of RFM?
Standard RFM requires **Monetary** value. Because monetary value does not exist in the raw dataset, we substitute **Product Diversity & Basket Intensity (P)** as a proxy for customer engagement depth:
- **Recency ($R$)**: Mean interval (in days) between consecutive orders. Lower interval corresponds to higher recency ($R \in [1, 5]$).
- **Frequency ($F$)**: Total verified order count across platform history ($F \in [1, 5]$).
- **Product Diversity / Basket Intensity ($P$)**: Unique products purchased and average basket size ($P \in [1, 5]$).

### Quantile Scoring Formulation
Customer features are partitioned into quintiles ($Q_1 \dots Q_5$):
$$\text{R\_Score} = \text{qcut}(\text{avg\_days\_between\_orders}, 5, \text{labels}=[5, 4, 3, 2, 1])$$
$$\text{F\_Score} = \text{qcut}(\text{total\_orders}, 5, \text{labels}=[1, 2, 3, 4, 5])$$
$$\text{P\_Score} = \text{qcut}(\text{unique\_products}, 5, \text{labels}=[1, 2, 3, 4, 5])$$

### MiniBatchKMeans Clustering
To scale across 206,209 customers with bounded latency:
1. Scaled vector: $\mathbf{x} = [\text{total\_orders}, \text{avg\_basket\_size}, \text{reorder\_rate}, \text{avg\_days\_between\_orders}, \text{unique\_products}]^T$
2. MiniBatchKMeans optimizes:
   $$\min_{\mathbf{C}} \sum_{i=1}^N \min_{\mathbf{c}_j \in \mathbf{C}} \|\mathbf{x}_i - \mathbf{c}_j\|^2$$
3. Evaluated across $k \in \{3, 4, 5, 6\}$ using Silhouette Score, Davies-Bouldin Index, and Calinski-Harabasz Index. $k=4$ selected as champion architecture.

---

## 3. Market Basket Analysis & Association Rules

Association rules discover item co-occurrences across 32.4M prior order baskets:

### Support
$$\text{Support}(A \implies B) = \frac{|\{o \in \mathcal{O} : A \in o \land B \in o\}|}{|\mathcal{O}|}$$

### Confidence
$$\text{Confidence}(A \implies B) = P(B \mid A) = \frac{\text{Support}(A \implies B)}{\text{Support}(A)}$$

### Lift Multiplier
$$\text{Lift}(A \implies B) = \frac{\text{Confidence}(A \implies B)}{\text{Support}(B)} = \frac{P(A \land B)}{P(A) \cdot P(B)}$$
- $\text{Lift} > 1$: Items occur together significantly more often than expected by random chance (synergistic cross-sell opportunity).

---

## 4. Next-Order Purchase Prediction Formulation

### Prediction Objective
For a user $u$ who has previously ordered product $p$ in prior orders, predict the probability $P(y_{u,p} = 1)$ that $p$ appears in $u$'s subsequent order.

### Feature Engineering
1. **User Features**:
   - `user_total_orders`: Total order progression count.
   - `user_avg_days_between`: Mean inter-order purchase interval.
   - `user_avg_basket_size`: Mean items per cart.
   - `user_reorder_rate`: Global customer reorder fraction.
2. **Product Features**:
   - `prod_total_purchases`: Historical platform purchase volume.
   - `prod_reorder_rate`: Platform-wide repeat purchase probability.
   - `prod_avg_cart_position`: Mean cart addition position.
3. **User-Product Interaction Features**:
   - `up_orders_count`: Count of times $u$ previously purchased $p$.
   - `up_order_ratio`: $\frac{\text{up\_orders\_count}}{\text{user\_total\_orders}}$.
   - `up_orders_since_last`: Difference between user's current order and last order containing $p$.
   - `up_avg_cart_pos`: Mean cart position where user adds this SKU.

### Zero-Leakage Split Strategy
- Features computed exclusively from `eval_set = 'prior'`.
- Target labels extracted from `eval_set = 'train'`.
- Stratified customer split: 70% Train, 15% Validation, 15% Test.

---

## 5. Demand Seasonality & Time-Series Forecasting

### Evaluated Models
1. **Naive Baseline**:
   $$\hat{y}_{t+h} = y_t$$
2. **Moving Average ($w=5$)**:
   $$\hat{y}_{t+h} = \frac{1}{w} \sum_{i=0}^{w-1} y_{t-i}$$
3. **Holt Damped Exponential Smoothing**:
   $$\ell_t = \alpha y_t + (1 - \alpha)(\ell_{t-1} + \phi b_{t-1})$$
   $$b_t = \beta (\ell_t - \ell_{t-1}) + (1 - \beta)\phi b_{t-1}$$
   $$\hat{y}_{t+h} = \ell_t + \sum_{i=1}^h \phi^i b_t$$
   Where $\phi \in (0, 1)$ dampens trend volatility.

### Evaluation Metrics
- $\text{MAE} = \frac{1}{n} \sum |y_i - \hat{y}_i|$
- $\text{RMSE} = \sqrt{\frac{1}{n} \sum (y_i - \hat{y}_i)^2}$
- $\text{sMAPE} = \frac{100\%}{n} \sum \frac{2 |y_i - \hat{y}_i|}{|y_i| + |\hat{y}_i|}$
- $R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$
