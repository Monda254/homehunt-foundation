# Application State Machine

This document details the lifecycle states and transition rules enforced server-side for all rental applications on HomeHunt.

## Lifecycle States

An application progresses through the following states:

- **`DRAFT`**: Initial state. Applicant is editing parameters and uploading checklist documents. Hidden from providers.
- **`SUBMITTED`**: Seeker has finalized the application. Provider is notified.
- **`UNDER_REVIEW`**: Provider team has accessed the application and initialized review workspace.
- **`ADDITIONAL_INFORMATION_REQUIRED`**: Landlord has requested missing references or replacement files.
- **`RESUBMITTED`**: Seeker has answered the information request and uploaded files. Landlord is notified.
- **`SHORTLISTED`**: Candidate has passed preliminary checks and is shortlisted.
- **`APPROVED`**: Final positive decision. Entry point to Phase 8 Tenancy/Lease creation.
- **`REJECTED`**: Final negative decision. Rejection category logged.
- **`WITHDRAWN`**: Seeker has cancelled the application.
- **`EXPIRED`**: The listing has closed or listing duration has elapsed.

## State Transition Rules

The server validates every status change against the following transition matrix. Unregistered transitions are blocked:

```mermaid
stateDiagram-v2
    [*] --> DRAFT : createDraft
    DRAFT --> SUBMITTED : submit
    DRAFT --> WITHDRAWN : withdraw
    SUBMITTED --> UNDER_REVIEW : startReview
    SUBMITTED --> WITHDRAWN : withdraw
    UNDER_REVIEW --> ADDITIONAL_INFORMATION_REQUIRED : requestInfo
    UNDER_REVIEW --> SHORTLISTED : shortlist
    UNDER_REVIEW --> APPROVED : approve
    UNDER_REVIEW --> REJECTED : reject
    UNDER_REVIEW --> WITHDRAWN : withdraw
    ADDITIONAL_INFORMATION_REQUIRED --> RESUBMITTED : provideInfo
    ADDITIONAL_INFORMATION_REQUIRED --> WITHDRAWN : withdraw
    RESUBMITTED --> UNDER_REVIEW : resumeReview
    RESUBMITTED --> WITHDRAWN : withdraw
    SHORTLISTED --> APPROVED : approve
    SHORTLISTED --> REJECTED : reject
    SHORTLISTED --> WITHDRAWN : withdraw
    APPROVED --> WITHDRAWN : withdraw
```

## Validation Logic

- **Client Requests**: Any action modifying status checks authorization (applicant vs provider vs admin) and executes `validateStatusTransition(current, next)`.
- **Eligibility Checking**: Submit action verifies that the listing is currently `PUBLISHED`, the unit is `AVAILABLE`, the applicant does not already have an active application, and viewing requirements are fully satisfied.
