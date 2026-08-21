# HomeHunt Database Conventions

This document outlines the conventions, migration strategies, and database extensions configured for the HomeHunt project.

## Conventions

- **Identifiers:** Primary keys are generated using random `UUID` values.
- **Timestamps:** Timestamps must use the type `TIMESTAMPTZ` (timestamp with time zone) and store dates in UTC.
- **Auditing Columns:**
  - `created_at`: Set automatically via `DEFAULT now()`.
  - `updated_at`: Updated via triggers calling `public.set_updated_at()`.
- **Naming Conventions:** Snake case is used for all table and column names (e.g. `user_roles`, `actor_id`).

## UUID Strategy

We use RFC 4122 version 4 UUIDs to generate globally unique identifiers.

- In migrations, primary key columns are configured with `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
- Reference keys enforce data integrity with `ON DELETE CASCADE` or `ON DELETE SET NULL` constraints.

## Timestamp Strategy

All date-time tracking is done with UTC offsets at the database level:

- In SQL: `TIMESTAMPTZ NOT NULL DEFAULT now()`.
- Converting to user-local timezone is handled entirely on the client side to simplify query logs.

## Migration Strategy

Database migrations are managed using **Supabase Migrations**:

- SQL migration files are located under `supabase/migrations/`.
- Local tests run against these migrations to guarantee schema parity before deployments.
- Avoid modifying tables outside migrations to maintain versioning history.

## PostGIS Strategy

The PostGIS extension is enabled via migrations in the database setup:

```sql
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
```

PostGIS allows the system to store geography data types, calculate proximity distance, and resolve coordinate boundaries. In future phases:

- Properties will carry a location coordinate (`geography(Point, 4326)`).
- Spatial indexes (`USING GIST`) will be added to location columns to speed up neighborhood search queries.
