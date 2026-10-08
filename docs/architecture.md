# Architecture & System Design

## 1. High-Level Architecture Overview

The **E-Commerce Decision Intelligence Platform** is built on a high-throughput, low-latency, vectorized architecture specifically engineered to handle the large-scale **Instacart Market Basket Analysis dataset (33.8M+ rows, 206K+ customers, 49.6K+ products)** on consumer hardware (e.g., AMD Ryzen 5 CPU, 16 GB RAM) without requiring NVIDIA GPUs or exceeding memory limits.

```
                           +-------------------------------------+
                           | Raw Dataset (Instacart CSVs)        |
                           | 33.8M+ Rows (~800 MB on disk)       |
                           +------------------+------------------+
                                              |
                                              v  [Streaming & ZSTD Conversion]
                           +-------------------------------------+
                           | DuckDB Vectorized Ingestion Engine  |
                           | Chunked Parquet Marts (~135 MB)     |
                           +------------------+------------------+
                                              |
              +-------------------------------+-------------------------------+
              |                               |                               |
              v                               v                               v
+---------------------------+   +---------------------------+   +---------------------------+
| Feature Engineering Marts |   | Automated Data Quality    |   | Mined Association Rules   |
| - customer_features.pq    |   | - 5 Quality Dimensions    |   | - FP-Growth / Pairwise    |
| - product_features.pq     |   | - Referential Integrity   |   | - Lift, Support, Conf     |
+-------------+-------------+   +-------------+-------------+   +-------------+-------------+
              |                               |                               |
              +-------------------------------+-------------------------------+
                                              |
                                              v
                           +-------------------------------------+
                           | Machine Learning & Analytics Engine |
                           | - MiniBatchKMeans (k=4 Clustering)  |
                           | - XGBoost Champion Next-Order Model |
                           | - TreeSHAP Feature Attribution      |
                           | - Holt Exponential Smoothing Demand|
                           +------------------+------------------+
                                              |
                                              v
                           +-------------------------------------+
                           | FastAPI High-Performance Backend    |
                           | - Python 3.13 Runtime               |
                           | - Zero-Copy DuckDB Query Execution  |
                           | - Real-Time SHAP Inference API      |
                           +------------------+------------------+
                                              |
                                              v  [JSON REST & WebSockets]
                           +-------------------------------------+
                           | React 19 + Vite 6 + TypeScript      |
                           | - Tailwind CSS Design System        |
                           | - Plotly.js / WebGL 3D Manifolds    |
                           | - What-If Scenario Simulator        |
                           | - Prescriptive Decision Engine      |
                           +-------------------------------------+
```

---

## 2. Ingestion & Storage Architecture

### Vectorized Parquet Storage
- Rather than loading the entire 33.8M+ row CSV files into Pandas DataFrame memory (which would consume over 12 GB RAM), DuckDB executes a zero-copy, streaming pipeline:
  ```sql
  COPY (SELECT * FROM read_csv_auto('orders.csv'))
  TO 'data/parquet/orders.parquet' (FORMAT PARQUET, COMPRESSION 'ZSTD')
  ```
- **Storage Footprint Reduction**:
  - `orders.csv`: 108.9 MB &rarr; `orders.parquet`: 19.5 MB (**5.6x compression**)
  - `order_products__prior.csv`: 577.5 MB &rarr; `order_products__prior.parquet`: 111.0 MB (**5.2x compression**)
  - Catalog entities: Compressed with ZSTD dictionary encoding.

### In-Memory Analytical Data Marts
- Aggregate marts are precomputed and cached in `data/processed/` using deterministic JSON caches.
- Dynamic analytical queries utilize DuckDB in-memory engine configured with:
  - `memory_limit = '8GB'`
  - `threads = 6`
  - SIMD vector execution (1024-row chunk vectors).

---

## 3. Machine Learning & Inference Pipeline

1. **Temporal Separation (Zero Data Leakage)**:
   - Historical features derived exclusively from prior orders (`eval_set = 'prior'`).
   - Ground truth labels derived from next order (`eval_set = 'train'`).
2. **Model Training**:
   - Logistic Regression Baseline (Balanced weights)
   - Random Forest (100 estimators, depth=12)
   - XGBoost Classifier (Champion, 150 trees, max depth=6, learning rate=0.08)
3. **Cross-Validation**:
   - 5-Fold Stratified Cross-Validation on user cohorts.
4. **Explainability**:
   - TreeSHAP explainer computes exact Shapley values for global impact and real-time local sample predictions.

---

## 4. Frontend Architecture

- **Framework**: React 19, TypeScript, Vite 6.
- **Styling**: Tailwind CSS with custom glassmorphism design tokens, CSS variables, and dark/light mode persistence.
- **Data Visualization**: `Plotly.js` with hardware-accelerated WebGL 3D scatter manifolds.
- **Micro-Interactions**: Framer Motion transitions, responsive layouts, and accessible semantic controls.
