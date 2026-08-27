# Intelligent Housing Matching — Product Specifications

## Overview

Unlike manual search filters, the Intelligent Housing Matching Engine evaluates listings against the user's overall housing needs, balancing constraints like budget, location, bedroom limits, and amenities.

---

## 1. Required vs Preferred (MUST-HAVE)

Users can tag preferences to indicate importance:

- **MUST-HAVE**: Hard constraints. If a candidate violates a MUST-HAVE requirement, it is excluded from exact match results and segmented into **Close Matches** or **Relaxed Matches**.
- **PREFERRED**: Soft preferences. These do not affect eligibility but contribute to the overall score.
- **OPTIONAL**: Extra descriptors that influence sorting among high-scoring matches.

---

## 2. Housing Preferences Profile

Profiles record criteria in categories:

- **Budget**: Min budget, max budget, target budget.
- **Location**: Counties, towns, neighborhoods, and estates.
- **Property Type**: Apartments, bedsitters, houses, villas, townhouses.
- **Bedrooms**: Room count with rules (MIN, EXACT, MAX).
- **Bathrooms**: Bath count with rules.
- **Amenities**: Checkboxes (parking, security, water) mapped with priority.
- **Furnishing**: Semi-furnished, unfurnished, fully furnished.
