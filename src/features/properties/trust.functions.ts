import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";
const supabaseAdmin = rawSupabaseAdmin as any;
import { recordAuditEvent, auditMetadataFromRequest } from "@/core/audit/audit.server";
import { resolveRequestId } from "@/core/observability/request-id";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import { requirePermission, hasPermission, type AppRole } from "@/core/auth/roles";
import {
  SubmitVerificationSchema,
  ReviewVerificationSchema,
  RevokeVerificationSchema,
  SubmitClaimSchema,
  ResolveClaimSchema,
  SubmitReportSchema,
  ResolveReportSchema,
  SubmitAppealSchema,
  ResolveAppealSchema,
} from "./trust.types";

// =============================================================
// Helper: Resolve context details
// =============================================================
function getContextMeta() {
  const request = getRequest();
  const requestId = resolveRequestId(request?.headers);
  const meta = auditMetadataFromRequest(request);
  return { requestId, meta };
}

// =============================================================
// VERIFICATION OPERATIONS
// =============================================================

const fnSubmitVerificationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SubmitVerificationSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // Check for existing active/pending verification of the same type/subject
    const { data: active } = await supabaseAdmin
      .from("verifications")
      .select("id, status")
      .eq("subject_id", data.subjectId)
      .eq("verification_type", data.verificationType)
      .in("status", ["PENDING", "UNDER_REVIEW", "VERIFIED"])
      .maybeSingle();

    if (active) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `An active or pending verification of type '${data.verificationType}' already exists for this subject.`,
      );
    }

    // Insert verification request
    const { data: verification, error: verErr } = await supabaseAdmin
      .from("verifications")
      .insert({
        subject_type: data.subjectType,
        subject_id: data.subjectId,
        verification_type: data.verificationType,
        status: "PENDING",
      })
      .select()
      .single();

    if (verErr || !verification) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        verErr?.message || "Failed to create verification request.",
      );
    }

    // Insert evidence documents
    const evidenceRows = data.evidence.map((doc) => ({
      verification_id: verification.id,
      evidence_type: doc.evidenceType,
      storage_reference: doc.storageReference,
      submitted_by: userId,
    }));

    const { error: evErr } = await supabaseAdmin
      .from("verification_evidence")
      .insert(evidenceRows);

    if (evErr) {
      // Cleanup to prevent orphaned verification record
      await supabaseAdmin.from("verifications").delete().eq("id", verification.id);
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Failed to save verification evidence documents.",
      );
    }

    // Write verification history
    await supabaseAdmin.from("verification_history").insert({
      verification_id: verification.id,
      status: "PENDING",
      changed_by: userId,
      notes: "Verification request submitted by user.",
    });

    // Auditing
    await recordAuditEvent({
      actorId: userId,
      action: "VERIFICATION_SUBMITTED",
      resourceType: "verification",
      resourceId: verification.id,
      afterData: { subjectType: data.subjectType, verificationType: data.verificationType },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, verificationId: verification.id };
  });

export const submitVerificationRequest = (data: z.infer<typeof SubmitVerificationSchema>) =>
  fnSubmitVerificationRequest({ data });

const fnListVerificationRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "VERIFICATION_VIEW");

    const { data, error } = await supabaseAdmin
      .from("verifications")
      .select("*, verification_evidence(*)")
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve verification requests.");
    }

    return data;
  });

export const listVerificationRequests = () => fnListVerificationRequests();

const fnReviewVerificationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ReviewVerificationSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    if (data.status === "VERIFIED") {
      requirePermission(roles, "VERIFICATION_APPROVE");
    } else {
      requirePermission(roles, "VERIFICATION_REVIEW");
    }

    // Fetch verification request details
    const { data: ver, error: findErr } = await supabaseAdmin
      .from("verifications")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !ver) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Verification request not found.");
    }

    // Transactionally update verification status and apply target updates
    const now = new Date().toISOString();
    const expiresAt =
      data.status === "VERIFIED"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
        : null;

    const { error: updateErr } = await supabaseAdmin
      .from("verifications")
      .update({
        status: data.status,
        reviewed_at: now,
        reviewed_by: userId,
        rejection_reason: data.rejectionReason || null,
        expires_at: expiresAt,
        updated_at: now,
      })
      .eq("id", data.id);

    if (updateErr) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update verification status.");
    }

    // Insert history
    await supabaseAdmin.from("verification_history").insert({
      verification_id: ver.id,
      status: data.status,
      changed_by: userId,
      notes: data.rejectionReason || "Verification reviewed by moderator.",
    });

    // Update target entities based on status
    if (data.status === "VERIFIED") {
      if (ver.subject_type === "USER") {
        if (ver.verification_type === "IDENTITY") {
          await supabaseAdmin
            .from("profiles")
            .update({ identity_verified: true })
            .eq("id", ver.subject_id);
        } else if (ver.verification_type === "AGENT") {
          await supabaseAdmin
            .from("profiles")
            .update({ agent_verified: true })
            .eq("id", ver.subject_id);
        }
      } else if (ver.subject_type === "PROPERTY") {
        await supabaseAdmin
          .from("properties")
          .update({ verification_status: "VERIFIED" })
          .eq("id", ver.subject_id);
      } else if (ver.subject_type === "LISTING") {
        await supabaseAdmin
          .from("listings")
          .update({ verification_status: "VERIFIED", last_verified_at: now })
          .eq("id", ver.subject_id);
      }
    } else if (data.status === "REJECTED") {
      if (ver.subject_type === "USER") {
        if (ver.verification_type === "IDENTITY") {
          await supabaseAdmin
            .from("profiles")
            .update({ identity_verified: false })
            .eq("id", ver.subject_id);
        } else if (ver.verification_type === "AGENT") {
          await supabaseAdmin
            .from("profiles")
            .update({ agent_verified: false })
            .eq("id", ver.subject_id);
        }
      } else if (ver.subject_type === "PROPERTY") {
        await supabaseAdmin
          .from("properties")
          .update({ verification_status: "REJECTED" })
          .eq("id", ver.subject_id);
      } else if (ver.subject_type === "LISTING") {
        await supabaseAdmin
          .from("listings")
          .update({ verification_status: "REJECTED" })
          .eq("id", ver.subject_id);
      }
    }

    // Update evidence documents status
    const evidenceStatus = data.status === "VERIFIED" ? "APPROVED" : "REJECTED";
    await supabaseAdmin
      .from("verification_evidence")
      .update({ status: evidenceStatus, review_notes: data.rejectionReason || null })
      .eq("verification_id", ver.id);

    // Audit logs
    await recordAuditEvent({
      actorId: userId,
      action: data.status === "VERIFIED" ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
      resourceType: "verification",
      resourceId: ver.id,
      afterData: { status: data.status },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const reviewVerificationRequest = (data: z.infer<typeof ReviewVerificationSchema>) =>
  fnReviewVerificationRequest({ data });

const fnRevokeVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RevokeVerificationSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "VERIFICATION_REJECT");
    const { requestId, meta } = getContextMeta();

    const { data: ver, error: findErr } = await supabaseAdmin
      .from("verifications")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !ver) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Verification record not found.");
    }

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("verifications")
      .update({
        status: "REVOKED",
        revocation_reason: data.revocationReason,
        updated_at: now,
      })
      .eq("id", data.id);

    await supabaseAdmin.from("verification_history").insert({
      verification_id: ver.id,
      status: "REVOKED",
      changed_by: userId,
      notes: data.revocationReason,
    });

    // Reset target entity statuses
    if (ver.subject_type === "USER") {
      if (ver.verification_type === "IDENTITY") {
        await supabaseAdmin
          .from("profiles")
          .update({ identity_verified: false })
          .eq("id", ver.subject_id);
      } else if (ver.verification_type === "AGENT") {
        await supabaseAdmin
          .from("profiles")
          .update({ agent_verified: false })
          .eq("id", ver.subject_id);
      }
    } else if (ver.subject_type === "PROPERTY") {
      await supabaseAdmin
        .from("properties")
        .update({ verification_status: "REVOKED" })
        .eq("id", ver.subject_id);
    } else if (ver.subject_type === "LISTING") {
      await supabaseAdmin
        .from("listings")
        .update({ verification_status: "REVOKED" })
        .eq("id", ver.subject_id);
    }

    await recordAuditEvent({
      actorId: userId,
      action: "VERIFICATION_REVOKED",
      resourceType: "verification",
      resourceId: ver.id,
      afterData: { revocationReason: data.revocationReason },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const revokeVerification = (data: z.infer<typeof RevokeVerificationSchema>) =>
  fnRevokeVerification({ data });

// =============================================================
// PROPERTY CLAIMS
// =============================================================

const fnSubmitPropertyClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SubmitClaimSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // Check conflict: is there already an active approved/pending claim for this property?
    const { data: conflicting } = await supabaseAdmin
      .from("property_claims")
      .select("id, status, user_id")
      .eq("property_id", data.propertyId)
      .in("status", ["PENDING", "APPROVED"])
      .maybeSingle();

    if (conflicting) {
      if (conflicting.status === "APPROVED") {
        // If someone else already owns the property, flag conflict for admin review
        await supabaseAdmin.from("risk_flags").insert({
          subject_type: "PROPERTY",
          subject_id: data.propertyId,
          risk_type: "CONFLICTING_CLAIM",
          severity: "HIGH",
          status: "OPEN",
        });
      }
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "A property claim has already been submitted for this asset. Conflict has been flagged for admin review.",
      );
    }

    // In a transaction, create claim + property ownership verification request
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from("property_claims")
      .insert({
        property_id: data.propertyId,
        user_id: userId,
        status: "PENDING",
      })
      .select()
      .single();

    if (claimErr || !claim) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        claimErr?.message || "Failed to create property claim.",
      );
    }

    const { data: ver, error: verErr } = await supabaseAdmin
      .from("verifications")
      .insert({
        subject_type: "PROPERTY",
        subject_id: data.propertyId,
        verification_type: "PROPERTY_OWNERSHIP",
        status: "PENDING",
      })
      .select()
      .single();

    if (verErr || !ver) {
      // Rollback claim record
      await supabaseAdmin.from("property_claims").delete().eq("id", claim.id);
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to create ownership verification request.");
    }

    // Insert evidence documents
    const evidenceRows = data.evidence.map((doc) => ({
      verification_id: ver.id,
      evidence_type: doc.evidenceType,
      storage_reference: doc.storageReference,
      submitted_by: userId,
    }));

    await supabaseAdmin.from("verification_evidence").insert(evidenceRows);
    await supabaseAdmin.from("verification_history").insert({
      verification_id: ver.id,
      status: "PENDING",
      changed_by: userId,
      notes: "Property ownership claim submitted with evidence documents.",
    });

    await recordAuditEvent({
      actorId: userId,
      action: "PROPERTY_CLAIMED",
      resourceType: "property_claim",
      resourceId: claim.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, claimId: claim.id };
  });

export const submitPropertyClaim = (data: z.infer<typeof SubmitClaimSchema>) =>
  fnSubmitPropertyClaim({ data });

const fnListPropertyClaims = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "CLAIMS_VIEW");

    const { data, error } = await supabaseAdmin
      .from("property_claims")
      .select("*, properties(name), profiles(full_name, phone_number)")
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to list property claims.");
    }

    return data;
  });

export const listPropertyClaims = () => fnListPropertyClaims();

const fnResolvePropertyClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ResolveClaimSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "CLAIMS_RESOLVE");
    const { requestId, meta } = getContextMeta();

    const { data: claim, error: findErr } = await supabaseAdmin
      .from("property_claims")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !claim) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Claim record not found.");
    }

    const now = new Date().toISOString();
    const claimStatus = data.action === "APPROVE" ? "APPROVED" : "REJECTED";

    // In a transaction, update claim + corresponding verification
    const { error: updateErr } = await supabaseAdmin
      .from("property_claims")
      .update({
        status: claimStatus,
        rejection_reason: data.rejectionReason || null,
        resolved_at: now,
        resolved_by: userId,
        updated_at: now,
      })
      .eq("id", claim.id);

    if (updateErr) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to resolve property claim.");
    }

    // Resolve corresponding PROPERTY_OWNERSHIP verification for this property
    const { data: ver } = await supabaseAdmin
      .from("verifications")
      .select("id")
      .eq("subject_id", claim.property_id)
      .eq("verification_type", "PROPERTY_OWNERSHIP")
      .eq("status", "PENDING")
      .maybeSingle();

    if (ver) {
      const verStatus = data.action === "APPROVE" ? "VERIFIED" : "REJECTED";
      await supabaseAdmin
        .from("verifications")
        .update({
          status: verStatus,
          reviewed_at: now,
          reviewed_by: userId,
          rejection_reason: data.rejectionReason || null,
          expires_at: data.action === "APPROVE" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
          updated_at: now,
        })
        .eq("id", ver.id);

      await supabaseAdmin.from("verification_history").insert({
        verification_id: ver.id,
        status: verStatus,
        changed_by: userId,
        notes: data.rejectionReason || "Ownership claim verified by admin.",
      });

      // Update parent property verification status as well
      await supabaseAdmin
        .from("properties")
        .update({ verification_status: verStatus })
        .eq("id", claim.property_id);
    }

    // If approved, add user to property_parties as OWNER (active) or update existing relationship
    if (data.action === "APPROVE") {
      await supabaseAdmin.from("property_parties").insert({
        property_id: claim.property_id,
        user_id: claim.user_id,
        relationship_type: "OWNER",
        status: "ACTIVE",
      }).onConflict("(property_id, user_id, relationship_type)").doUpdate({
        set: { status: "ACTIVE", updated_at: now }
      });
    }

    await recordAuditEvent({
      actorId: userId,
      action: data.action === "APPROVE" ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
      resourceType: "property_claim",
      resourceId: claim.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const resolvePropertyClaim = (data: z.infer<typeof ResolveClaimSchema>) =>
  fnResolvePropertyClaim({ data });

// =============================================================
// LISTING REPORTS
// =============================================================

const fnReportListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SubmitReportSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // Check rate limit: user cannot submit more than 5 reports per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("listing_reports")
      .select("id", { count: "exact", head: true })
      .eq("reporter_id", userId)
      .gte("created_at", oneHourAgo);

    if (count && count >= 5) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Rate limit exceeded: You have submitted too many reports recently. Please try again later.",
      );
    }

    // Insert Report
    const { data: report, error } = await supabaseAdmin
      .from("listing_reports")
      .insert({
        reporter_id: userId,
        listing_id: data.listingId,
        reason: data.reason,
        description: data.description || null,
        status: "OPEN",
      })
      .select()
      .single();

    if (error || !report) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to submit listing report.");
    }

    // Automated Risk Detection:
    // If this listing has received 3 or more open reports, automatically flag it for review.
    const { count: reportCount } = await supabaseAdmin
      .from("listing_reports")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", data.listingId)
      .eq("status", "OPEN");

    if (reportCount && reportCount >= 3) {
      // Flag listing internally with MEDIUM risk
      await supabaseAdmin.from("risk_flags").insert({
        subject_type: "LISTING",
        subject_id: data.listingId,
        risk_type: "REPEATED_REPORTS",
        severity: "MEDIUM",
        status: "OPEN",
      });
    }

    await recordAuditEvent({
      actorId: userId,
      action: "REPORT_SUBMITTED",
      resourceType: "listing_report",
      resourceId: report.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, reportId: report.id };
  });

export const reportListing = (data: z.infer<typeof SubmitReportSchema>) =>
  fnReportListing({ data });

const fnListListingReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "REPORTS_VIEW");

    const { data, error } = await supabaseAdmin
      .from("listing_reports")
      .select("*, listings(title)")
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve listing reports.");
    }

    return data;
  });

export const listListingReports = () => fnListListingReports();

const fnResolveListingReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ResolveReportSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "REPORTS_RESOLVE");
    const { requestId, meta } = getContextMeta();

    const { data: report, error: findErr } = await supabaseAdmin
      .from("listing_reports")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !report) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing report not found.");
    }

    const now = new Date().toISOString();
    const reportStatus = data.action === "RESOLVE" ? "RESOLVED" : data.action === "ESCALATE" ? "ESCALATED" : "DISMISSED";

    await supabaseAdmin
      .from("listing_reports")
      .update({
        status: reportStatus,
        resolution: data.resolution || null,
        resolved_at: now,
        resolved_by: userId,
        updated_at: now,
      })
      .eq("id", report.id);

    // If report is resolved and price/fake issues are valid, the moderator can pause the listing
    if (data.action === "RESOLVE") {
      await supabaseAdmin
        .from("listings")
        .update({ status: "PAUSED", updated_at: now })
        .eq("id", report.listing_id);
    }

    await recordAuditEvent({
      actorId: userId,
      action: "REPORT_RESOLVED",
      resourceType: "listing_report",
      resourceId: report.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const resolveListingReport = (data: z.infer<typeof ResolveReportSchema>) =>
  fnResolveListingReport({ data });

// =============================================================
// LISTING FRESHNESS & REVALIDATION
// =============================================================

const fnConfirmListingFreshness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: listingId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    // Check relationship validation: must be listing creator, property owner, or admin
    const { data: listing, error: findErr } = await supabaseAdmin
      .from("listings")
      .select("*, properties(owner_user_id)")
      .eq("id", listingId)
      .single();

    if (findErr || !listing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }

    const prop = listing.properties as unknown as { owner_user_id: string } | null;
    const isAuthorized =
      hasPermission(roles, "LISTING_UPDATE") ||
      listing.created_by_user_id === userId ||
      prop?.owner_user_id === userId;

    if (!isAuthorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You do not have permission to revalidate this listing.",
      );
    }

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("listings")
      .update({
        freshness_status: "CURRENT",
        last_verified_at: now,
        price_confirmed_at: now,
        availability_confirmed_at: now,
        updated_at: now,
      })
      .eq("id", listingId);

    await recordAuditEvent({
      actorId: userId,
      action: "LISTING_REVALIDATED",
      resourceType: "listing",
      resourceId: listingId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const confirmListingFreshness = (listingId: string) =>
  fnConfirmListingFreshness({ data: listingId });

// =============================================================
// MODERATION APPEALS
// =============================================================

const fnSubmitModerationAppeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SubmitAppealSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: appeal, error } = await supabaseAdmin
      .from("moderation_appeals")
      .insert({
        user_id: userId,
        target_type: data.targetType,
        target_id: data.targetId,
        reason: data.reason,
        status: "APPEAL_SUBMITTED",
      })
      .select()
      .single();

    if (error || !appeal) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to submit appeal.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "APPEAL_SUBMITTED",
      resourceType: "moderation_appeal",
      resourceId: appeal.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, appealId: appeal.id };
  });

export const submitModerationAppeal = (data: z.infer<typeof SubmitAppealSchema>) =>
  fnSubmitModerationAppeal({ data });

const fnListModerationAppeals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "APPEALS_VIEW");

    const { data, error } = await supabaseAdmin
      .from("moderation_appeals")
      .select("*, profiles(full_name, phone_number)")
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve appeals.");
    }

    return data;
  });

export const listModerationAppeals = () => fnListModerationAppeals();

const fnResolveModerationAppeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ResolveAppealSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "APPEALS_RESOLVE");
    const { requestId, meta } = getContextMeta();

    const { data: appeal, error: findErr } = await supabaseAdmin
      .from("moderation_appeals")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !appeal) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Appeal not found.");
    }

    const now = new Date().toISOString();
    const appealStatus = data.action === "UPHELD" ? "UPHELD" : "REVERSED";

    await supabaseAdmin
      .from("moderation_appeals")
      .update({
        status: appealStatus,
        notes: data.notes || null,
        resolved_at: now,
        resolved_by: userId,
        updated_at: now,
      })
      .eq("id", appeal.id);

    // If appeal is REVERSED, restore target action
    if (data.action === "REVERSED") {
      if (appeal.target_type === "VERIFICATION") {
        await supabaseAdmin
          .from("verifications")
          .update({ status: "VERIFIED", updated_at: now })
          .eq("id", appeal.target_id);

        const { data: ver } = await supabaseAdmin
          .from("verifications")
          .select("*")
          .eq("id", appeal.target_id)
          .single();

        if (ver) {
          if (ver.subject_type === "USER") {
            await supabaseAdmin.from("profiles").update({ identity_verified: true }).eq("id", ver.subject_id);
          } else if (ver.subject_type === "PROPERTY") {
            await supabaseAdmin.from("properties").update({ verification_status: "VERIFIED" }).eq("id", ver.subject_id);
          } else if (ver.subject_type === "LISTING") {
            await supabaseAdmin.from("listings").update({ verification_status: "VERIFIED" }).eq("id", ver.subject_id);
          }
        }
      } else if (appeal.target_type === "LISTING_SUSPENSION") {
        await supabaseAdmin
          .from("listings")
          .update({ status: "PUBLISHED", updated_at: now })
          .eq("id", appeal.target_id);
      } else if (appeal.target_type === "PROPERTY_CLAIM") {
        await supabaseAdmin
          .from("property_claims")
          .update({ status: "APPROVED", updated_at: now })
          .eq("id", appeal.target_id);

        const { data: claim } = await supabaseAdmin
          .from("property_claims")
          .select("*")
          .eq("id", appeal.target_id)
          .single();

        if (claim) {
          await supabaseAdmin.from("property_parties").insert({
            property_id: claim.property_id,
            user_id: claim.user_id,
            relationship_type: "OWNER",
            status: "ACTIVE",
          });
        }
      }
    }

    await recordAuditEvent({
      actorId: userId,
      action: "APPEAL_RESOLVED",
      resourceType: "moderation_appeal",
      resourceId: appeal.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const resolveModerationAppeal = (data: z.infer<typeof ResolveAppealSchema>) =>
  fnResolveModerationAppeal({ data });

// =============================================================
// INTERNAL RISK FLAGS
// =============================================================

const fnListRiskFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "RISK_VIEW");

    const { data, error } = await supabaseAdmin
      .from("risk_flags")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve risk flags.");
    }

    return data;
  });

export const listRiskFlags = () => fnListRiskFlags();

const fnResolveRiskFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["RESOLVED", "DISMISSED"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "RISK_RESOLVE");
    const { requestId, meta } = getContextMeta();

    const { data: flag, error: findErr } = await supabaseAdmin
      .from("risk_flags")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !flag) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Risk flag not found.");
    }

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("risk_flags")
      .update({
        status: data.status,
        resolved_at: now,
        resolved_by: userId,
      })
      .eq("id", flag.id);

    await recordAuditEvent({
      actorId: userId,
      action: "RISK_FLAG_RESOLVED",
      resourceType: "risk_flag",
      resourceId: flag.id,
      afterData: { status: data.status },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const resolveRiskFlag = (id: string, status: "RESOLVED" | "DISMISSED") =>
  fnResolveRiskFlag({ data: { id, status } });

// =============================================================
// SECURE STORAGE UPLOAD / DOWNLOAD
// =============================================================

const fnGetSecureEvidenceUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string())
  .handler(async ({ data: storageReference, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    // Ensure authorized reviewer or the owner of the document
    const folderOwner = storageReference.split("/")[0];
    const isOwner = folderOwner === userId;
    const isReviewer =
      public_is_reviewer(roles) || isPlatformAdmin(roles);

    if (!isOwner && !isReviewer) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to view this document.",
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from("verification_evidence")
      .createSignedUrl(storageReference, 900); // 15 minutes validity

    if (error || !data) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to sign document URL.");
    }

    return { signedUrl: data.signedUrl };
  });

export const getSecureEvidenceUrl = (storageReference: string) =>
  fnGetSecureEvidenceUrl({ data: storageReference });

// Helper functions for checking verifier roles
function public_is_reviewer(roles: readonly AppRole[]): boolean {
  return roles.includes("verifier") || roles.includes("admin") || roles.includes("super_admin");
}

function isPlatformAdmin(roles: readonly AppRole[]): boolean {
  return roles.includes("admin") || roles.includes("super_admin");
}
