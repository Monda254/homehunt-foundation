# Seeker Application Journey

This document details the mobile-first step-by-step wizard experience for property seekers applying for a rental unit on HomeHunt.

## Step-by-Step Application Wizard

To lower friction and improve completion rates, long forms are broken down into five distinct steps:

### Step 1: Personal Information
- Inputs: Full Name, Phone Number, Email Address.
- Autofilled from user profile settings. These details are shared with the landlord to contact the seeker.

### Step 2: Household & Occupancy
- Inputs: Intended Move-in Date, Lease Duration (months), number of Adults, number of Children, Pets checkbox, and optional details on other occupants.

### Step 3: Employment & Income
- Inputs: Employment Status (Employed, Self-Employed, Student, Unemployed), Employer Name, Occupation title, Income Range selection, and duration.

### Step 4: Verification Documents Checklist
- Private, encrypted file upload slots mapping directly to listing-specific or property-wide application checklist templates.
- Common requirements: National ID / Passport, Proof of Income (3 months bank statements/payslips).
- Supports mobile camera uploads and PDFs under 10MB.

### Step 5: Review & Submit
- Displays a structured, summarized preview of all entered details and uploaded files.
- Displays a transparent submission agreement detailing that submitting sends information directly to the landlord and does not execute a lease or request payment.

## Key Product Behaviors

- **Draft Auto-Saving**: Every step change triggers an autosave server call. Drafts can be resumed later from the applicant dashboard.
- **Viewing Enforcement**: If the landlord configures a viewing requirement, the submit button is blocked until a physical viewing with status `COMPLETED` is verified on the server.
- **Duplication Prevention**: A seeker can only have one active application per listing. Re-applying is allowed after withdrawal or rejection.
- **Application Timelines**: The detail page displays an immutable history timeline detailing the status of the review (e.g. Under Review, Info Requested, Shortlisted, etc.).
