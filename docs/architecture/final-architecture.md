# HomeHunt — Final System Architecture & Data Flow

## 1. Overview

**HomeHunt** is a full-stack housing infrastructure platform engineered for Kenya. Built on **TanStack Start** (React 19, Vite, Nitro server engine) and **Supabase** (PostgreSQL + PostGIS, Auth, Storage), it eliminates rental fraud, deposit scams, and middleman viewing fees through cryptographically verified workflows and relational data integrity.

---

## 2. Platform Architecture Stack

```
                                  +---------------------------------------+
                                  |            CLIENT LAYER               |
                                  |  TanStack Router / React 19 / Vite    |
                                  |  Leaflet Maps / Framer Motion System  |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |          SERVER & API LAYER           |
                                  |  TanStack Start Server Functions      |
                                  |  Nitro Server Engine (/api/v1/)       |
                                  |  Structured Logger & Audit Engine     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |          DATA & STORAGE LAYER         |
                                  |  Supabase Postgres (22+ Tables + RLS) |
                                  |  Supabase Auth & Storage Buckets      |
                                  |  PostGIS Spatial Search Engine        |
                                  +---------------------------------------+
```

---

## 3. End-to-End Rental Journey Data Flow

```
+---------------+      +-------------------+      +-------------------+      +-------------------+
|  REGISTRATION | ---> | DISCOVERY & MAPS  | ---> | VIEWING BOOKING   | ---> | RENTAL APPLICATION|
|  Identity KYC |      | Privacy Fuzzing   |      | Collision Checks  |      | Verification Sync |
+---------------+      +-------------------+      +-------------------+      +-------------------+
                                                                                       |
                                                                                       v
+---------------+      +-------------------+      +-------------------+      +-------------------+
| ONGOING RENT  | <--- | TENANCY ACTIVATED | <--- | RENT OBLIGATION   | <--- | LEASE AGREEMENT   |
| Maintenance   |      | Unique Tenant Lock|      | Server-Calculated |      | Signed Doc Storage|
+---------------+      +-------------------+      +-------------------+      +-------------------+
```

---

## 4. Key Subsystem Specifications

1. **Authentication & RBAC**: Supabase Auth integrated with custom DB triggers (`on_auth_user_created`) mapping users to roles (`tenant`, `landlord`, `agent`, `property_manager`, `verifier`, `admin`).
2. **Discovery & Privacy Search**: Dual-coordinate system (exact coordinates stored securely; public display coordinates fuzzed by ~300m for tenant privacy prior to viewing confirmation).
3. **Rental Applications**: Multi-stage state machine (`DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED` / `REJECTED` / `WITHDRAWN`) requiring completed viewings when mandated by listings.
4. **Tenancy & Payments**: Immutable lease tracking, automated rent obligation generation, and idempotent payment record processing.
5. **Observability & Diagnostics**: JSON structured logging with automated token redaction and `checkSystemIntegrity` database diagnostic suite.
