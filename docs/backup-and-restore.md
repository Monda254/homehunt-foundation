# Backup, Disaster Recovery & Restore Runbook

## Automated Database Backup Strategy
- **Continuous Point-In-Time Recovery (PITR)**: Supabase PostgreSQL provides automated WAL archiving with up to 30-day point-in-time recovery.
- **Daily Physical Backups**: Automated daily snapshots executed at 01:00 UTC.

## Manual Database Export Procedure
To trigger a manual database backup prior to major migration runs:
```bash
npx supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql --linked
```

## Restore Protocol
1. Put web services into Maintenance Mode.
2. In the Supabase Dashboard, select **Database** -> **Backups** -> **Restore**.
3. Choose the desired timestamp or point-in-time recovery target.
4. Verify schema integrity and execute sanity tests on `GET /api/v1/readiness`.
5. Remove Maintenance Mode.
