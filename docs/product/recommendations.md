# Housing Recommendations — User Guide

This page describes the user experience for the Recommendations Dashboard at `/recommendations`.

---

## 1. Onboarding Flow

When a new user visits `/recommendations` without existing preferences, they are guided through a 4-step wizard:

1. **Location**: Preferred county and town.
2. **Budget**: Target rent and absolute budget limits.
3. **Bedrooms**: Bedrooms and property types.
4. **Priorities**: Budget and location weights.

---

## 2. Match Score Breakdown

Every recommended card displays a percentage match score (e.g. `94% Match`). Clicking the score opens the **Score Breakdown Dialog** showing:

- Satisfied constraints (e.g., target budget, preferred location).
- Violated constraints or missing amenities.
- Verification trust indicators.

---

## 3. Explicit Feedback Controls

Users can interact directly with recommended cards:

- **Save**: Adds the listing to the saved listings collection.
- **Hide (EyeOff)**: Filters the listing out of the active recommendations query instantly.
