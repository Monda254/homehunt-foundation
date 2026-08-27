# Verification & Trust Layer — Product Specifications

## Objective
The HomeHunt Verification & Trust Layer helps renters distinguish verified and authentic properties/agents from unverified or suspicious listings in the Kenyan real estate context. It establishes structured evidence verification, revalidation schedules, user reporting, and a clear legal boundary regarding disclaimers.

---

## 1. Trust & Verification Models

### Identity Verification
* **Meaning**: A user has submitted matching official government credentials (e.g. ID card/Passport) verified by HomeHunt moderators.
* **Badges**: Displays `✓ Contact Verified` on listing details and search results cards when the listing owner is identity-verified.

### Property Verification
* **Meaning**: A property asset's existence and ownership (e.g. title deeds, local utilities check, coordinates match) has been confirmed by a platform verifier.
* **Badges**: Displays `✓ Property Verified` next to listings matching that property asset.

### Listing Verification
* **Meaning**: A specific listing unit's details (pricing, period, layout specifications) match physical assets or landlord ledgers.
* **Badges**: Displays `✓ Listing Verified`.

---

## 2. Listing Freshness & Revalidation
* Listings are marked **CURRENT** when created or revalidated.
* Property owners, agents, or managers must regularly reconfirm that listings are still available and pricing has not changed.
* Revalidated listings show: `"Availability confirmed recently"` along with the date of the last verification.
* Inactive or unconfirmed listings transition to **STALE** or **REQUIRES_REVALIDATION** status after 14 days, signaling to renters to verify with caution.

---

## 3. Disclaimers & Safety Guidance
HomeHunt verifies submitted documents but does **NOT** offer financial guarantees or safety insurance. Renters must follow strict safety protocols:
1. **No Advance Deposits**: Never send security deposits or "booking fees" via MPesa before visiting and physically inspecting the property.
2. **Beware WhatsApp Redirections**: Be cautious of landlords requesting payments off-platform or redirecting to WhatsApp.
3. **Physical Inspection**: Verify caretaker status and neighborhood context prior to entering leasing agreements.
