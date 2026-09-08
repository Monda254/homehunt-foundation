# HomeHunt Disaster Recovery & Backup Plan

## 1. Objectives & Key Metrics

- **Recovery Time Objective (RTO)**: Target < 30 minutes for core API availability.
- **Recovery Point Objective (RPO)**: Target < 5 minutes for transaction ledger data loss using Point-in-Time Recovery (PITR).

---

## 2. PostgreSQL & Supabase Database Backups

1. **Point-In-Time Recovery (PITR)**: Supabase PITR is enabled on production databases, recording write-ahead logs (WAL) continuously for up to 30 days.
2. **Automated Nightly Backups**: Standard automated logical dumps are executed every 24 hours at 00:00 UTC and stored in isolated multi-region encrypted S3 storage.
3. **Manual Backup Procedure**:
   ```bash
   # Dump production database schema and data
   supabase db dump --linked --data-only -f backup_$(date +%Y%m%d_%H%M%S).sql
   ```

---

## 3. Database Restoration Procedure

In the event of database corruption or primary region failure:

1. **In-Place Point-in-Time Recovery**:
   Navigate to Supabase Dashboard -> Database -> Backups -> Restore to point in time. Select timestamp prior to incident.
2. **Secondary Instance Failover**:
   ```bash
   # Restore schema and data to secondary standby instance
   psql -h <standby-db-host> -U postgres -d postgres -f backup_20260908_120000.sql
   ```

---

## 4. Storage Bucket Failover & Recovery

Private storage buckets (`verification-documents`, `lease-documents`) utilize cloud storage object versioning and cross-region replication (CRR).

- **Restoring Deleted Documents**:
  ```bash
  # Restore object from version history via Supabase Storage API
  supabase storage restore --bucket verification-documents --path <file_path> --version <version_id>
  ```

---

## 5. Deployment Rollback Strategy

If a faulty deployment causes production issues:

1. **Immediate Traffic Reversion**:
   Vercel / Nitro edge deployment rollback to previous green deployment hash:
   ```bash
   npx wrangler rollback --version <previous_stable_version_id>
   ```
2. **Database Schema Rollback**:
   Apply down migration if schema modification was expand-stage compatible.
