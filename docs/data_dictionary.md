# Enterprise Data Dictionary

## 1. Raw Dataset Entities

### Table: `orders` (3,421,083 rows)
| Column Name | Data Type | Description | Example | Relationships | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order_id` | BIGINT | Unique primary key for each customer order | `2539329` | PK | Primary order identifier |
| `user_id` | BIGINT | Customer account identifier | `1` | FK &rarr; Customer | Aggregating customer order frequency |
| `eval_set` | VARCHAR | Split indicator (`prior`, `train`, `test`) | `'prior'` | Partition key | Enforcing temporal leakage prevention |
| `order_number` | BIGINT | Sequential progression of order for this user | `1` | Sequence | Determining lifetime order progression |
| `order_dow` | BIGINT | Day of week order was placed (0 = Sun, 6 = Sat) | `2` | Domain [0, 6] | Intra-week demand seasonality |
| `order_hour_of_day`| BIGINT | Hour of day order was placed (0 to 23) | `8` | Domain [0, 23]| Intra-day peak fulfillment patterns |
| `days_since_prior_order` | DOUBLE | Days elapsed since customer's previous order | `15.0` | Offset | Customer recency & purchase intervals (Null for order #1) |

---

### Table: `order_products__prior` (32,434,489 rows)
| Column Name | Data Type | Description | Example | Relationships | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order_id` | BIGINT | Order identifier | `2` | FK &rarr; `orders.order_id` | Associating line item with order |
| `product_id` | BIGINT | Catalog item identifier | `33120` | FK &rarr; `products.product_id`| Associating line item with SKU |
| `add_to_cart_order` | BIGINT | Sequential order in which SKU was added to cart | `1` | Domain &ge; 1 | Cart position priority & funnel decay |
| `reordered` | BIGINT | Boolean binary flag: 1 if user previously bought SKU | `1` | Domain {0, 1} | Ground truth customer reorder affinity |

---

### Table: `order_products__train` (1,384,617 rows)
| Column Name | Data Type | Description | Example | Relationships | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order_id` | BIGINT | Order identifier for evaluation split | `1` | FK &rarr; `orders.order_id` | Ground truth test target order |
| `product_id` | BIGINT | Catalog item identifier | `49302` | FK &rarr; `products.product_id`| Ground truth next-order item |
| `add_to_cart_order` | BIGINT | Cart addition sequence in train order | `1` | Domain &ge; 1 | Test evaluation sequence |
| `reordered` | BIGINT | Target label: 1 if reordered in this train order | `1` | Domain {0, 1} | Supervised ML classification target |

---

### Table: `products` (49,688 rows)
| Column Name | Data Type | Description | Example | Relationships | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `product_id` | BIGINT | Unique primary key for SKU | `1` | PK | Master product identifier |
| `product_name` | VARCHAR | Descriptive trade name of product | `'Chocolate Sandwich Cookies'`| Text | Search and recommendation display |
| `aisle_id` | BIGINT | Category sub-hierarchy foreign key | `61` | FK &rarr; `aisles.aisle_id` | Aisle-level grouping |
| `department_id` | BIGINT | Category primary department foreign key | `19` | FK &rarr; `departments.department_id`| Department-level grouping |

---

### Table: `aisles` (134 rows)
| Column Name | Data Type | Description | Example | Relationships | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `aisle_id` | BIGINT | Primary key for product aisle | `1` | PK | Aisle identifier |
| `aisle` | VARCHAR | Category descriptor | `'prepared soups salads'` | Text | Catalog hierarchy navigation |

---

### Table: `departments` (21 rows)
| Column Name | Data Type | Description | Example | Relationships | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `department_id` | BIGINT | Primary key for major department | `1` | PK | Department identifier |
| `department` | VARCHAR | Major department name | `'produce'` | Text | Executive category leaderboards |

---

## 2. Derived Feature Marts

### `data/features/customer_features.parquet` (206,209 rows)
- `user_id`: Customer primary key
- `total_orders`: Total verified historical orders
- `total_items`: Total historical line items purchased
- `unique_products`: Unique SKUs explored
- `avg_basket_size`: Mean items per basket
- `reorder_rate`: User-level repeat purchase ratio
- `avg_days_between_orders`: Mean cadence gap
- `recency_days`: Last observed gap before subsequent order
- `preferred_department`: Department accounting for highest item share
- `rfp_segment`: Assigned behavioral segment (Champions, Power Shoppers, etc.)
- `cluster`: MiniBatchKMeans cluster index (0, 1, 2, 3)

### `data/features/product_features.parquet` (49,688 rows)
- `product_id`: Product primary key
- `product_name`: SKU name
- `aisle`: Aisle name
- `department`: Department name
- `total_purchases`: Platform-wide purchase volume
- `total_reorders`: Platform-wide reorder count
- `reorder_rate`: Product repeat purchase stickiness
- `popularity_rank`: Global volume ranking (Dense Rank 1 to 49,688)
- `avg_add_to_cart_order`: Mean cart insertion priority
- `unique_customers_count`: Breadth of unique customer reach
