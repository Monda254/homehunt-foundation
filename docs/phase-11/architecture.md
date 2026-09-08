# HomeHunt Phase 11 — Intelligence, Analytics & AI Architecture

## Overview

Phase 11 establishes the **Intelligence, Marketplace Optimization, AI & Continuous Product Evolution Layer** for **HomeHunt**.

Phase 11 does not alter or destabilize database-authoritative financial, legal, authentication, or Row Level Security (RLS) rules established in Phases 0–10. Instead, it operates on top of the platform as a decoupled telemetry, recommendation, AI assistance, and operational intelligence layer.

---

## Key Subsystems

### 1. Product Analytics & Telemetry Engine (`analytics.service.ts`)

- **Database Tables:** `analytics_events`, `analytics_listing_metrics`
- **Telemetry Taxonomy:** Tracks 30+ lifecycle events across Discovery, Trust, Viewing, Application, Lease, Payment, and Messaging.
- **Privacy Redaction:** Automatically strips passwords, tokens, M-Pesa PINs, card CVVs, and sensitive credentials from event metadata payloads.

### 2. Marketplace Health & Listing Freshness Engine (`health.service.ts`)

- **Database Table:** `listing_health_scores`
- **Health Score (0-100):** Multi-factor calculation evaluating Freshness (20pts), Photo completeness (15pts), Description completeness (15pts), Location data (10pts), Amenities (10pts), Verification (15pts), Report history (10pts), and Engagement (5pts).
- **Freshness Lifecycle:** `FRESH` (<=7d), `AGING` (<=21d), `STALE` (<=45d), `REQUIRES_RECONFIRMATION` (>45d), `UNAVAILABLE`, `ARCHIVED`.

### 3. Explainable Recommendation Engine (`recommendations.service.ts`)

- **Database Table:** `recommendation_feedback`
- **Explainable Match Tags:** `BUDGET_MATCH`, `LOCATION_MATCH`, `VERIFIED_LANDLORD`, `SIMILAR_TO_SAVED`, `HIGH_HEALTH_SCORE`, `FRESH_LISTING`.
- **User Feedback Loop:** Support for `NOT_INTERESTED`, `TOO_EXPENSIVE`, `WRONG_LOCATION`, `SHOW_MORE_LIKE_THIS`.

### 4. Decoupled AI Subsystem & Safety Guardrails (`ai.service.ts`)

- **Database Table:** `ai_usage`
- **Vendor Abstraction:** Support for Google Gemini / OpenAI with automatic fallback to `DeterministicFallbackProvider` when LLM keys are absent or network calls fail.
- **Prompt Injection Guardrails:** Untrusted user input (listing titles, descriptions, message text) is sanitized (`sanitizeUntrustedText`) and isolated inside JSON data boundaries away from system directives.
- **Prompt Versioning:** `property_summary_v1`, `tenant_assistant_v1`, `risk_analysis_v1`.
- **Cost Tracking:** Logs input/output token counts and estimated USD costs per feature call.

### 5. Anomaly & Risk Signal Detection (`risk.service.ts`)

- **Database Table:** `risk_signals`
- **Automated Detections:**
  - `PRICE_ANOMALY`: Rent 50%+ below town median for multi-bedroom listings.
  - `REPORT_SPIKE`: 2+ community reports received within 7 days.
  - `INCOMPLETE_VERIFICATION`: Rent >= KSh 100,000 published without completed owner verification.

### 6. Centralized Feature Flags (`feature-flags.service.ts`)

- **Database Table:** `feature_flags`
- **Managed Flags:** `AI_PROPERTY_SUMMARY`, `AI_RISK_ASSISTANT`, `RECOMMENDATION_ENGINE_V2`, `MARKET_INSIGHTS`, `LISTING_HEALTH_SCORES`.

### 7. User & Admin Frontend Surfaces

- `/recommendations`: User preference editor, onboarding wizard, explainable match cards, and feedback controls.
- `/admin/intelligence`: Admin marketplace KPIs, housing journey conversion funnel, AI usage cost tracking, risk signal queue, and feature flag toggles.
