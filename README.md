# HomeHunt — Kenyan Housing Platform

HomeHunt is a production-grade housing platform engineered to bring trust, security, and efficiency to the Kenyan rental market.

---

## 1. Project Overview

### The Problem Statement
Searching for rental houses in Kenya is currently a highly fragmented and risk-prone experience. Tenants face several major issues:
- **Deposit Scams & Fake Listings:** Fraudsters posting non-existent properties to steal deposits.
- **Upfront Viewing Fees:** Middlemen charging registration or viewing fees for houses that are poor quality or already occupied.
- **Fragmented Communication:** Disconnected messaging channels leading to communication gaps.
- **Unresolved Disputes:** A lack of structured mechanisms for resolving deposit refunds, maintenance issues, or tenancy conflicts.

### The Solution
HomeHunt provides a secure, verified, relational marketplace that connects seekers directly with validated landlords and agents:
- **Scam-Free Rental Guarantee:** Physical agents verify every property and listing existence, and landlords undergo KYC validation.
- **Direct Viewing Bookings:** Schedule viewings directly in-app with calendar collision checking, eliminating upfront middleman fees.
- **Interactive Geospatial Search:** Viewport fuzzed geospatial coordinates mapped via Leaflet and filtered dynamically.
- **Intelligent Property Matching:** Rank properties using compatibility scoring based on user budgets, layout constraints, locations, and priorities.
- **Tenancy & Dispute Support:** Secure messaging channels, viewing trackers, and structured claims logging to resolve issues.

---

## 2. Technology Stack

HomeHunt is built as a unified, single-repository full-stack TypeScript application utilizing the following technologies:

### Core Framework & Routing
- **TanStack Start:** Full-stack React framework leveraging Vite for compilation and Nitro server engine for serverless/edge SSR API handlers.
- **TanStack Router:** File-system based router ensuring strong type safety and query validation.
- **TanStack Query:** Server state synchronizer for handling data mutations and cache invalidation.

### Database & Backend Services
- **Supabase:** Core data and authentication layer:
  - **PostgreSQL:** Relational database with Row Level Security (RLS) policies.
  - **PostGIS Extensions:** Geographic coordinates and bounding box queries.
  - **Supabase Auth:** JWT token-based identity authentication and role mapping (RBAC).
  - **Supabase Storage:** Private buckets for verification documents (ID, Title deeds).

### Design & Styling
- **Tailwind CSS:** Modern visual layout utility styling.
- **Radix UI Primitives & Lucide Icons:** Accessible frontend components and visual icons.
- **Leaflet:** Interactive map rendering.

### Testing & Telemetry
- **Vitest:** Unit and server function test runner.
- **Observability Middleware:** Structured JSON logging and request correlation IDs (`X-Request-ID`).
