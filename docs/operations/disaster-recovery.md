# HomeHunt — Disaster Recovery & Backup Plan

## 1. Objectives & Recovery Targets

- **Recovery Point Objective (RPO)**: `< 1 Hour` (Maximum acceptable data loss window).
- **Recovery Time Objective (RTO)**: `< 2 Hours` (Maximum acceptable downtime).

---

## 2. Backup Strategy

1. **Database Backups**: Automated Point-in-Time Recovery (PITR) managed via Supabase Cloud infrastructure with daily physical backups retained for 30 days.
2. **Storage Backups**: Storage objects (`verification_evidence`, `property_media`, `leases`) backed up across multi-region bucket mirrors.
3. **Configuration & Environment**: Production environment variables stored in encrypted secret manager (Vercel Secrets + Supabase Vault).

---

## 3. Disaster Scenarios & Recovery Procedures

### Scenario A: Database Outage or Data Corruption
1. Navigate to Supabase Project Dashboard -> Database -> Backups.
2. Select target Point-In-Time timestamp prior to incident.
3. Trigger Point-In-Time Restore (PITR) to restore database instance.
4. Run `checkSystemIntegrity()` diagnostic check to verify table relations and tenancy invariants.

### Scenario B: Third-Party Service Failure (Payment Gateway / Email / SMS)
1. **SMS / Email Provider Down**: System automatically falls back to in-app transactional notifications (`notifications` table). Core viewing/application transactions continue unimpeded.
2. **Payment Gateway Down**: Payments remain safely in `PENDING` state with retry timers enabled. No tenancy state is activated without confirmed payment receipt.
