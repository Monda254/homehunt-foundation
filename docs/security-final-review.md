# Security Final Audit & Controls Matrix

## Controls & Safeguards Summary

1. **Row Level Security (RLS)**: Enforced across all Supabase PostgreSQL tables. Tenant and provider data access is strictly bounded by `auth.uid()`.
2. **Role-Based Access Control (RBAC)**: Defined in `src/core/auth/roles.ts`. Administrative routes require permissions verified against claims.
3. **Signed Storage URLs**: Private documents (tenancy leases, identity verification docs) use Supabase Storage signed URLs restricted to a maximum 15-minute expiration (900 seconds).
4. **File Upload Verification**: `src/core/security/upload-security.ts` inspects binary magic numbers (JPEG, PNG, WEBP, PDF) and enforces size thresholds to block extension spoofing and executable uploads.
5. **Session Security**: Session tokens are encrypted and handled strictly with HTTP-only cookies and CSRF protection headers.
