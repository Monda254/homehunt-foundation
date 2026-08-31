# Application Security & Privacy

HomeHunt enforces strict access control policies on all rental applications, candidate profiles, and uploaded evidence files.

## Row-Level Security (RLS) Policies

Every database table has RLS enabled with granular token/session policies:

- **`rental_applications`**:
  - `SELECT`: Allowed if applicant is `auth.uid()`, provider is `auth.uid()`, or user is platform admin.
  - `INSERT`: Allowed if `applicant_id = auth.uid()` (prevents impersonating applicants).
  - `UPDATE`: Allowed if applicant is `auth.uid()`, provider is `auth.uid()`, or user is platform admin.
- **`application_documents`**:
  - `SELECT`: Allowed if platform admin, verifier, or if applicant/provider owns the parent application.
  - `INSERT`: Allowed if seeker is the applicant of the target application.
  - `DELETE`: Allowed if seeker is the applicant and application is in `DRAFT` or `ADDITIONAL_INFORMATION_REQUIRED` state.
- **`application_reviews`**:
  - `SELECT` & `INSERT`: Hidden from applicant; allowed only for the provider (`provider_id = auth.uid()`) or platform admin.

## Insecure Direct Object Reference (IDOR) Protection

The backend server functions validate permissions explicitly:
- Dynamic detail page `/applications/:id` and `/dashboard/applications/:id` authorize access control server-side. Knowing the application UUID does not bypass security.
- Document downloads request a short-expiry (15 min) signed URL. The server verifies that the requesting `userId` is the applicant, the provider of the target listing, or an authorized admin/verifier.

## Role-Based Access Control (RBAC)

The following role permissions are mapped in the lookup tables:
- **`tenant`**: Permissions `APPLICATIONS_CREATE`, `APPLICATIONS_VIEW_SELF`, `APPLICATIONS_WITHDRAW`. Can modify and submit own drafts.
- **`landlord` / `agent` / `property_manager`**: Permission `APPLICATIONS_MANAGE`. Can view, shortlist, request info, and decide on listings they own.
- **`verifier`**: Permission `VERIFICATION_VIEW` to audit KYC documents.
- **`admin` / `super_admin`**: Full operational oversight.

## Storage Bucket Security

- Documents are stored in the private bucket `application_documents`.
- Storage policies restrict file insertions to folders scoped under `/auth.uid()`.
- File reads are validated through standard bucket access checking or signed URL generation wrappers.
