# Personalization & Privacy Guidelines

The HomeHunt Matching Engine respects user privacy, limiting saved criteria to housing preferences only.

---

## 1. What We Store

- Explicit housing preference configurations (budget range, preferred locations, target amenities, priority weights).
- Saved searches metadata.
- Explicit user feedback (saved, hidden, or disliked status).

---

## 2. Protected Attributes Exclusion

HomeHunt explicitly **excludes** from matching and storage any protected or sensitive personal attributes:

- Race/Ethnicity
- Religion
- Political affiliation
- Gender
- Disability status
- Sexual orientation

---

## 3. Personalization Reset

Users have full control to clear their behavioral history and preferences:

- The `/recommendations` dashboard features a **Reset Personalization** button.
- Clicking it calls `saveUserPreferences` with blank parameters and deletes active recommendation history profiles.
