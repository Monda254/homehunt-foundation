# Rollback Runbook & Rapid Recovery Guide

## Conditions Triggering Rollback
- Failed production deployment or build corruption.
- Persistent SEV-1 outage after new deployment.
- High rate of financial transaction errors (> 2% failure rate).

## Step-by-Step Rollback Execution

### 1. Application Deployment Rollback
If hosting on Vercel / Netlify / Cloudflare Pages / Node.js container:
```bash
# Revert main branch to last known green commit tag
git checkout main
git reset --hard HEAD~1
git push origin main --force-with-lease
```
*(Note: Refer to repository rules regarding force pushes. Prefer creating a revert commit via `git revert` for published main history)*:
```bash
git revert HEAD -m 1
git push origin main
```

### 2. Database Migration Rollback
If a schema migration broke compatibility:
1. Apply down migration script using Supabase CLI:
   ```bash
   npx supabase db rollback
   ```
2. Re-verify readiness via `/api/v1/readiness`.
