# Provider Application Workflow

This document outlines the applicant management features and review workspaces built for landlords, agents, and property managers on HomeHunt.

## Management Dashboard

The provider dashboard (`/dashboard/applications`) serves as the command center for incoming applications:
- Displays submitted applications (excluding drafts).
- Filters applications by listing property/unit, submission date, and current workflow status.
- Highlights action items (e.g. applications with status `RESUBMITTED` or `SUBMITTED`).

## Review Workspace

Selecting an application opens the detailed review workspace:
- **Applicant Demographics & Verification**: Summarizes contact info, employment details, and income ranges.
- **Evidence Verification Panel**: Secure viewer to decrypt and review submitted documents. Files are stored privately and loaded via short-expiry signed URLs.
- **Direct Messaging Thread**: A link to initiate or continue conversation threads contextually linked to the target application.

## Review Actions

### Internal Notes & Recommendation Workspace
- Providers can log notes and recommendations (`APPROVE`, `REJECT`, `SHORTLIST`, `HOLD`).
- These review logs are strictly internal to the provider team and are never exposed to the seeker.

### Shortlisting
- Promotes applicants to `SHORTLISTED` status. This notifies the applicant and updates their timeline.

### Additional Information Requests
- If documents are missing or invalid, the provider can specify the requirement name and instructions.
- This transitions the application to `ADDITIONAL_INFORMATION_REQUIRED` and inserts a request.
- The applicant is notified and can upload the requested file directly. Resubmitting moves the application back to `RESUBMITTED`, alerting the landlord.

### Final Decisions (Approve / Reject)
- **Approve**: Moves the applicant to `APPROVED`. This notifies the applicant and indicates they have passed review. It does not automatically execute a lease or take payments.
- **Reject**: Moves the applicant to `REJECTED`. The provider must select a safe reason classification (e.g. `REQUIREMENTS_NOT_MET`, `DOCUMENTATION_INCOMPLETE`, `PROPERTY_NO_LONGER_AVAILABLE`, `OTHER`).
- Rejections hide detailed internal notes from the applicant.
