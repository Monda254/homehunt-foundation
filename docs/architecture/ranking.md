# Housing Matching Engine — Scoring & Ranking Algorithm

This document defines the formulas, weights, and scoring criteria used to compute the 0-100 compatibility rating for housing recommendations.

---

## 1. Weight Priorities

Scoring is normalized according to the user's priority weights:

- `CRITICAL`: 40 points
- `HIGH`: 25 points
- `MEDIUM`: 15 points
- `LOW`: 10 points

---

## 2. Dimension Calculations

### Budget Score (0.0 to 1.0)

- If `price <= target_budget`: score = 1.0.
- If `price > target_budget` and `price <= max_budget`:
  $$\text{score} = 1.0 - \frac{\text{price} - \text{target\_budget}}{\text{max\_budget} - \text{target\_budget}}$$
- If `price > max_budget`: score = 0.0.

### Location Score (0.0 to 1.0)

- Exact estate match: score = 1.0.
- Neighborhood match: score = 0.9.
- Town match: score = 0.6.
- County match: score = 0.2.
- Otherwise: score = 0.0.

### Bedroom Fit (0.0 to 1.0)

- Exact count match: score = 1.0.
- Rule MIN and count is higher: score = 0.8.
- Otherwise: score = 0.0.

### Amenities Score (0.0 to 1.0)

- All MUST-HAVE amenities must be satisfied.
- Score is computed as a fraction of preferred/optional amenities present:
  $$\text{score} = 0.7 + 0.3 \times \frac{\text{satisfied\_preferred\_amenities}}{\text{total\_preferred\_amenities}}$$

---

## 3. Trust & Freshness Bonuses

A maximum of 5 bonus points are added after base scoring:

- **Verified (Property or Listing)**: +3 points.
- **Freshness (CURRENT)**: +2 points.
- Total final score is capped at 100.
