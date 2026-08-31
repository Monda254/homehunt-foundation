# Tenancy & Lease Lifecycle Management

The Tenancy module manages the transition from an approved rental application into an active occupancy. It coordinates lease drafting, digital sign-off, key handovers, and move-in inspection checkers.

## Core Features

1. **Handoff from Approved Application**: Initializes a pending tenancy draft directly from an approved application, preserving all pricing and period snapshot parameters.
2. **Double-Booking Protection**: Enforces occupancy bounds. A unit or single-occupancy property cannot have more than one active/occupied tenancy at the same time.
3. **Lease Versioning**: Landlords can draft multiple versions of a lease agreement.
4. **Digital signature**: Tenants can digitally accept or request corrections (which reverts status back to draft). Landlords then countersign to execute.
5. **Move-in Inspections**: Structured checkers (keys, access, walkthrough condition notes, evidence photograph uploads) completed before marking the tenancy as `OCCUPIED`.
6. **Listing Sync**: Once a tenancy becomes active or occupied, the unit status automatically transitions to `OCCUPIED` and the public discovery listing is paused/archived.
7. **Graceful End/Termination**: Support for ending tenancies mutually, expiring on lease terms, or force terminating, which releases unit occupancy.

## Tenancy Status Lifecycle

- **PENDING**: Tenant initialized from approved application.
- **LEASE_PREPARATION**: Landlord is drafting/editing terms.
- **AWAITING_ACCEPTANCE**: Lease draft sent to tenant for review.
- **ACTIVE**: Lease executed (digitally signed by both parties).
- **MOVE_IN_PENDING**: Inspection scheduled and walkthrough checklist active.
- **OCCUPIED**: Seeker checked off walkthrough list and moved in.
- **NOTICE_GIVEN**: Termination notice active.
- **ENDED**: Graceful exit / Term completed.
- **TERMINATED**: Early/forced termination.
- **CANCELLED**: Cancelled draft.

## Leases Status Lifecycle

- **DRAFT**: Created lease version draft.
- **READY_FOR_REVIEW**: Flagged ready.
- **SENT_TO_TENANT**: Sent for digital acceptance.
- **TENANT_ACCEPTED**: Signed by seeker.
- **PROVIDER_ACCEPTED**: Countersigned by landlord.
- **EXECUTED**: Contract active.
- **EXPIRED** / **TERMINATED**: De-activated.
