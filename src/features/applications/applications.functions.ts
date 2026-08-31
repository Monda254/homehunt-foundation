/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { NotificationService } from "@/features/communication/notifications.server";
import {
  CreateApplicationSchema,
  UpdateDraftSchema,
  SubmitApplicationSchema,
  RespondToRequestSchema,
  RequestAdditionalInfoSchema,
  RecordReviewSchema,
  RecordDecisionSchema,
  type ApplicationStatus,
} from "./applications.types";

function getContextMeta() {
  const request = getRequest();
  const requestId = resolveRequestId(request?.headers);
  const meta = auditMetadataFromRequest(request);
  return { requestId, meta };
}

// -------------------------------------------------------------
// State Machine Transitions
// -------------------------------------------------------------
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["SUBMITTED", "WITHDRAWN"],
  SUBMITTED: ["UNDER_REVIEW", "WITHDRAWN"],
  UNDER_REVIEW: [
    "ADDITIONAL_INFORMATION_REQUIRED",
    "SHORTLISTED",
    "APPROVED",
    "REJECTED",
    "WITHDRAWN",
  ],
  ADDITIONAL_INFORMATION_REQUIRED: ["RESUBMITTED", "WITHDRAWN"],
  RESUBMITTED: ["UNDER_REVIEW", "WITHDRAWN"],
  SHORTLISTED: ["APPROVED", "REJECTED", "WITHDRAWN"],
  APPROVED: ["WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
  EXPIRED: [],
};

function validateStatusTransition(current: ApplicationStatus, next: ApplicationStatus) {
  const allowed = VALID_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new AppError(
      ERROR_CODES.BAD_REQUEST,
      `Invalid application status transition from '${current}' to '${next}'.`,
    );
  }
}

// Write transition log in status history table
async function recordStatusHistory(
  applicationId: string,
  previousStatus: ApplicationStatus | null,
  newStatus: ApplicationStatus,
  changedBy: string,
  notes?: string,
) {
  await supabaseAdmin.from("application_status_history").insert({
    application_id: applicationId,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: changedBy,
    notes: notes || null,
  });
}

// Helper: check if listing is active and user is eligible to apply
async function checkEligibilityAndFetchListing(listingId: string, userId: string): Promise<any> {
  const { data: listing, error: listingErr } = await supabaseAdmin
    .from("listings")
    .select("*, properties(id, owner_user_id, status, verification_status)")
    .eq("id", listingId)
    .maybeSingle();

  if (listingErr || !listing) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Listing reference not found.");
  }

  if (listing.status !== "PUBLISHED") {
    throw new AppError(
      ERROR_CODES.BAD_REQUEST,
      "This listing is currently not active or accepting applications.",
    );
  }

  const prop = listing.properties as any;
  if (!prop) {
    throw new AppError(
      ERROR_CODES.BAD_REQUEST,
      "Property reference associated with listing not found.",
    );
  }

  if (prop.owner_user_id === userId) {
    throw new AppError(
      ERROR_CODES.BAD_REQUEST,
      "You cannot apply for your own properties or listings.",
    );
  }

  return listing;
}

// -------------------------------------------------------------
// Seeker Server Functions
// -------------------------------------------------------------

export const fnCreateApplicationDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CreateApplicationSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const listing = await checkEligibilityAndFetchListing(data.listingId, userId);
    const prop = listing.properties as any;

    // Validate that seeker doesn't already have an active application for this listing
    const { data: activeApp } = await supabaseAdmin
      .from("rental_applications")
      .select("id, status")
      .eq("listing_id", data.listingId)
      .eq("applicant_id", userId)
      .in("status", [
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "ADDITIONAL_INFORMATION_REQUIRED",
        "RESUBMITTED",
        "SHORTLISTED",
        "APPROVED",
      ])
      .maybeSingle();

    if (activeApp) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `You already have an active application (${activeApp.status}) for this listing.`,
      );
    }

    // Insert new application draft with snapshot values
    const { data: app, error: appErr } = await supabaseAdmin
      .from("rental_applications")
      .insert({
        listing_id: data.listingId,
        property_id: prop.id,
        unit_id: data.unitId || null,
        applicant_id: userId,
        provider_id: prop.owner_user_id,
        status: "DRAFT",
        rent_snapshot: listing.price,
        currency_snapshot: listing.currency,
        billing_period_snapshot: listing.billing_period || "MONTHLY",
        deposit_snapshot: listing.deposit_amount || listing.price,
      })
      .select()
      .single();

    if (appErr || !app) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        appErr?.message || "Failed to initialize application draft.",
      );
    }

    await recordStatusHistory(app.id, null, "DRAFT", userId, "Draft created.");

    await recordAuditEvent({
      actorId: userId,
      action: "APPLICATION_DRAFT_CREATED",
      resourceType: "rental_application",
      resourceId: app.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, applicationId: app.id };
  });

export const fnUpdateApplicationDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UpdateDraftSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: app, error: findErr } = await supabaseAdmin
      .from("rental_applications")
      .select("id, applicant_id, status")
      .eq("id", data.id)
      .single();

    if (findErr || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Application draft not found.");
    }

    if (app.applicant_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You do not own this application.");
    }

    if (app.status !== "DRAFT") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Only applications in DRAFT status can be modified.",
      );
    }

    const { error: updateErr } = await supabaseAdmin
      .from("rental_applications")
      .update({
        preferred_move_in_date: data.preferredMoveInDate,
        preferred_lease_months: data.preferredLeaseMonths,
        personal_info: data.personalInfo,
        employment_info: data.employmentInfo,
        household_info: data.householdInfo,
      })
      .eq("id", data.id);

    if (updateErr) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update draft values.");
    }

    return { success: true };
  });

export const fnSubmitApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SubmitApplicationSchema)
  .handler(async ({ data: applicationId, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: app, error: findErr } = await supabaseAdmin
      .from("rental_applications")
      .select("*, listings(title, status)")
      .eq("id", applicationId)
      .single();

    if (findErr || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Application draft not found.");
    }

    if (app.applicant_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You do not own this application.");
    }

    if (app.status !== "DRAFT") {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "This application has already been submitted.");
    }

    // 1. Validate completeness
    const info = app.personal_info as any;
    const emp = app.employment_info as any;
    const house = app.household_info as any;

    if (!info.fullName || !info.phoneNumber || !info.email) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Personal contact information is incomplete.");
    }
    if (!emp.status || !emp.incomeRange) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Employment and income profile details are incomplete.",
      );
    }
    if (!house.adults) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Household occupancy detail is incomplete.");
    }

    // 2. Validate viewing requirements
    // Check if landlord configured a viewing requirement
    // In our listing / property schema, if viewing is required, verify completed viewing status
    const { data: listingInfo } = await supabaseAdmin
      .from("listings")
      .select("viewing_required")
      .eq("id", app.listing_id)
      .maybeSingle();

    if (listingInfo?.viewing_required) {
      // Find viewing for seeker on listing with status = 'COMPLETED'
      const { data: viewings } = await supabaseAdmin
        .from("viewings")
        .select("id")
        .eq("listing_id", app.listing_id)
        .eq("seeker_id", userId)
        .eq("status", "COMPLETED");

      if (!viewings || viewings.length === 0) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          "A completed viewing is required before submitting this application.",
        );
      }
    }

    // 3. Validate checklist documents
    const { data: reqs } = await supabaseAdmin
      .from("application_requirements")
      .select("id")
      .eq("property_id", app.property_id)
      .eq("is_required", true)
      .eq("is_active", true);

    if (reqs && reqs.length > 0) {
      const { data: docs } = await supabaseAdmin
        .from("application_documents")
        .select("requirement_id")
        .eq("application_id", applicationId);

      const uploadedReqIds = new Set((docs || []).map((d: any) => d.requirement_id));
      const missing = reqs.filter((r: any) => !uploadedReqIds.has(r.id));

      if (missing.length > 0) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          "All required verification documents must be uploaded before submission.",
        );
      }
    }

    const now = new Date().toISOString();

    // 4. Update status and submit
    validateStatusTransition("DRAFT", "SUBMITTED");
    const { error: updateErr } = await supabaseAdmin
      .from("rental_applications")
      .update({
        status: "SUBMITTED",
        submitted_at: now,
        updated_at: now,
      })
      .eq("id", applicationId);

    if (updateErr) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to submit rental application.");
    }

    await recordStatusHistory(
      applicationId,
      "DRAFT",
      "SUBMITTED",
      userId,
      "Application submitted.",
    );

    // 5. Setup / Retrieve Conversation Context for messages integration
    let { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", app.listing_id)
      .eq("seeker_id", userId)
      .eq("provider_id", app.provider_id)
      .maybeSingle();

    if (!conv) {
      const { data: newConv } = await supabaseAdmin
        .from("conversations")
        .insert({
          property_id: app.property_id,
          listing_id: app.listing_id,
          unit_id: app.unit_id || null,
          seeker_id: userId,
          provider_id: app.provider_id,
          status: "ACTIVE",
        })
        .select()
        .single();
      conv = newConv;
    }

    if (conv) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conv.id,
        sender_id: userId,
        message_type: "APPLICATION_SUBMITTED",
        content: `I have submitted my rental application: Reference number is ${app.application_number || "HH-APP-" + applicationId}.`,
        status: "SENT",
      });
      await supabaseAdmin.from("conversations").update({ updated_at: now }).eq("id", conv.id);
    }

    // 6. Send Notification
    await NotificationService.send({
      userId: app.provider_id,
      type: "APPLICATION_SUBMITTED",
      title: "New Application Received",
      content: `You received a new application for ${app.listings?.title || "Property"}. Reference: ${app.application_number || "HH-APP-" + applicationId}`,
      payload: { applicationId, conversationId: conv?.id },
    });

    // 7. Audit
    await recordAuditEvent({
      actorId: userId,
      action: "APPLICATION_SUBMITTED",
      resourceType: "rental_application",
      resourceId: applicationId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const fnWithdrawApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: applicationId, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: app, error: findErr } = await supabaseAdmin
      .from("rental_applications")
      .select("id, applicant_id, provider_id, status, application_number")
      .eq("id", applicationId)
      .single();

    if (findErr || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Application record not found.");
    }

    if (app.applicant_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You do not own this application.");
    }

    validateStatusTransition(app.status as ApplicationStatus, "WITHDRAWN");

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("rental_applications")
      .update({
        status: "WITHDRAWN",
        updated_at: now,
      })
      .eq("id", applicationId);

    await recordStatusHistory(
      applicationId,
      app.status as ApplicationStatus,
      "WITHDRAWN",
      userId,
      "Application withdrawn by seeker.",
    );

    // Notify Provider
    await NotificationService.send({
      userId: app.provider_id,
      type: "APPLICATION_STATUS_CHANGED",
      title: "Application Withdrawn",
      content: `The applicant has withdrawn application ${app.application_number}.`,
      payload: { applicationId },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "APPLICATION_WITHDRAWN",
      resourceType: "rental_application",
      resourceId: applicationId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// -------------------------------------------------------------
// Provider Server Functions
// -------------------------------------------------------------

export const fnProviderReviewApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RecordReviewSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "APPLICATIONS_MANAGE");
    const { requestId, meta } = getContextMeta();

    const { data: app, error: findErr } = await supabaseAdmin
      .from("rental_applications")
      .select("id, status, provider_id, applicant_id")
      .eq("id", data.applicationId)
      .single();

    if (findErr || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Application not found.");
    }

    if (app.provider_id !== userId && !hasPermission(roles, "ADMIN_VIEW_USERS")) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to review this application.",
      );
    }

    // Change status from SUBMITTED or RESUBMITTED to UNDER_REVIEW
    if (app.status === "SUBMITTED" || app.status === "RESUBMITTED") {
      validateStatusTransition(app.status as ApplicationStatus, "UNDER_REVIEW");
      await supabaseAdmin
        .from("rental_applications")
        .update({ status: "UNDER_REVIEW", updated_at: new Date().toISOString() })
        .eq("id", data.applicationId);

      await recordStatusHistory(
        data.applicationId,
        app.status as ApplicationStatus,
        "UNDER_REVIEW",
        userId,
        "Review started.",
      );
    }

    // Save review note (Internal reviews log)
    await supabaseAdmin.from("application_reviews").insert({
      application_id: data.applicationId,
      reviewer_id: userId,
      recommendation: data.recommendation,
      notes: data.notes || null,
    });

    // If review recommends SHORTLIST, we transition the application
    if (data.recommendation === "SHORTLIST" && app.status !== "SHORTLISTED") {
      validateStatusTransition("UNDER_REVIEW", "SHORTLISTED");
      await supabaseAdmin
        .from("rental_applications")
        .update({ status: "SHORTLISTED", updated_at: new Date().toISOString() })
        .eq("id", data.applicationId);

      await recordStatusHistory(
        data.applicationId,
        "UNDER_REVIEW",
        "SHORTLISTED",
        userId,
        "Applicant shortlisted.",
      );

      await NotificationService.send({
        userId: app.applicant_id,
        type: "APPLICATION_STATUS_CHANGED",
        title: "Application Shortlisted!",
        content: `Your rental application has been shortlisted. The provider is reviewing details.`,
        payload: { applicationId: app.id },
      });
    }

    await recordAuditEvent({
      actorId: userId,
      action: "APPLICATION_REVIEWED",
      resourceType: "rental_application",
      resourceId: data.applicationId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const fnProviderRequestInformation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RequestAdditionalInfoSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "APPLICATIONS_MANAGE");
    const { requestId, meta } = getContextMeta();

    const { data: app, error: findErr } = await supabaseAdmin
      .from("rental_applications")
      .select("id, status, provider_id, applicant_id, application_number")
      .eq("id", data.applicationId)
      .single();

    if (findErr || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Application not found.");
    }

    if (app.provider_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    // Enforce transition to ADDITIONAL_INFORMATION_REQUIRED
    validateStatusTransition(app.status as ApplicationStatus, "ADDITIONAL_INFORMATION_REQUIRED");

    const now = new Date().toISOString();

    // Create the requirement description first
    const { data: req } = await supabaseAdmin
      .from("application_requirements")
      .insert({
        property_id: app.property_id,
        listing_id: app.listing_id,
        name: data.requirementName,
        description: data.message,
        type: "DOCUMENT",
        is_required: true,
        is_active: true,
      })
      .select()
      .single();

    // Insert request
    await supabaseAdmin.from("application_requests").insert({
      application_id: data.applicationId,
      requester_id: userId,
      recipient_id: app.applicant_id,
      requirement_id: req?.id || null,
      message: data.message,
      status: "OPEN",
      due_date: data.dueDate || null,
    });

    // Update status
    await supabaseAdmin
      .from("rental_applications")
      .update({
        status: "ADDITIONAL_INFORMATION_REQUIRED",
        updated_at: now,
      })
      .eq("id", data.applicationId);

    await recordStatusHistory(
      data.applicationId,
      app.status as ApplicationStatus,
      "ADDITIONAL_INFORMATION_REQUIRED",
      userId,
      `Info request: ${data.message}`,
    );

    // Notify Applicant
    await NotificationService.send({
      userId: app.applicant_id,
      type: "APPLICATION_INFO_REQUEST",
      title: "Information Required",
      content: `The provider has requested additional details: "${data.message}"`,
      payload: { applicationId: app.id },
    });

    // Message integration: inject warning message
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", app.listing_id)
      .eq("seeker_id", app.applicant_id)
      .eq("provider_id", userId)
      .maybeSingle();

    if (conv) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conv.id,
        sender_id: userId,
        message_type: "APPLICATION_INFO_REQUEST",
        content: `I have requested additional information for your application: "${data.message}"`,
        status: "SENT",
      });
    }

    await recordAuditEvent({
      actorId: userId,
      action: "APPLICATION_INFO_REQUESTED",
      resourceType: "rental_application",
      resourceId: data.applicationId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const fnRespondToInformationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RespondToRequestSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: request, error: reqErr } = await supabaseAdmin
      .from("application_requests")
      .select("*, rental_applications(status, provider_id, property_id, listing_id)")
      .eq("id", data.requestId)
      .single();

    if (reqErr || !request) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Information request not found.");
    }

    if (request.recipient_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not the recipient.");
    }

    const app = request.rental_applications as any;
    if (app.status !== "ADDITIONAL_INFORMATION_REQUIRED") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "The application is not in the required information state.",
      );
    }

    const now = new Date().toISOString();

    // Insert uploaded documents
    if (data.documents && data.documents.length > 0) {
      const docRows = data.documents.map((d) => ({
        application_id: request.application_id,
        requirement_id: d.requirementId || request.requirement_id,
        name: d.name,
        file_path: d.filePath,
        file_size: d.fileSize,
        mime_type: d.mimeType,
        status: "UPLOADED",
      }));
      await supabaseAdmin.from("application_documents").insert(docRows);
    }

    // Update request status to RESPONDED
    await supabaseAdmin
      .from("application_requests")
      .update({ status: "RESPONDED", updated_at: now })
      .eq("id", data.requestId);

    // Transition application status to RESUBMITTED
    validateStatusTransition("ADDITIONAL_INFORMATION_REQUIRED", "RESUBMITTED");
    await supabaseAdmin
      .from("rental_applications")
      .update({ status: "RESUBMITTED", updated_at: now })
      .eq("id", request.application_id);

    await recordStatusHistory(
      request.application_id,
      "ADDITIONAL_INFORMATION_REQUIRED",
      "RESUBMITTED",
      userId,
      `Responded: ${data.message}`,
    );

    // Notify Provider
    await NotificationService.send({
      userId: app.provider_id,
      type: "APPLICATION_STATUS_CHANGED",
      title: "Information Response Received",
      content: `The applicant has submitted the requested information: "${data.message}"`,
      payload: { applicationId: request.application_id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "APPLICATION_INFO_PROVIDED",
      resourceType: "rental_application",
      resourceId: request.application_id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const fnProviderRecordDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RecordDecisionSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "APPLICATIONS_MANAGE");
    const { requestId, meta } = getContextMeta();

    const { data: app, error: findErr } = await supabaseAdmin
      .from("rental_applications")
      .select("id, status, provider_id, applicant_id, application_number")
      .eq("id", data.applicationId)
      .single();

    if (findErr || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Application not found.");
    }

    if (app.provider_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    const nextStatusMap: Record<"APPROVE" | "REJECT" | "SHORTLIST", ApplicationStatus> = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      SHORTLIST: "SHORTLISTED",
    };
    const nextStatus = nextStatusMap[data.action];
    validateStatusTransition(app.status as ApplicationStatus, nextStatus);

    const now = new Date().toISOString();

    const updateFields: any = {
      status: nextStatus,
      decided_at: now,
      decided_by: userId,
      updated_at: now,
    };

    if (nextStatus === "REJECTED") {
      updateFields.rejection_reason = data.rejectionReason || "OTHER";
      updateFields.rejection_notes = data.rejectionNotes || null;
    }

    await supabaseAdmin
      .from("rental_applications")
      .update(updateFields)
      .eq("id", data.applicationId);

    await recordStatusHistory(
      data.applicationId,
      app.status as ApplicationStatus,
      nextStatus as ApplicationStatus,
      userId,
      nextStatus === "REJECTED" ? `Rejected. Reason: ${data.rejectionReason}` : "Approved.",
    );

    // Notify Seeker
    const decisionTitle =
      nextStatus === "APPROVED" ? "Application Approved! 🎉" : "Application Decision Update";
    const decisionContent =
      nextStatus === "APPROVED"
        ? `Your application ${app.application_number} has been approved. The provider will contact you shortly to coordinate lease details.`
        : `We regret to inform you that your application ${app.application_number} was not selected. Reason: ${data.rejectionReason || "Requirements not met"}`;

    await NotificationService.send({
      userId: app.applicant_id,
      type: "APPLICATION_STATUS_CHANGED",
      title: decisionTitle,
      content: decisionContent,
      payload: { applicationId: app.id },
    });

    // Injects decision update message into chat
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", app.listing_id)
      .eq("seeker_id", app.applicant_id)
      .eq("provider_id", userId)
      .maybeSingle();

    if (conv) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conv.id,
        sender_id: userId,
        message_type: "APPLICATION_STATUS_CHANGED",
        content: `Application decision has been posted: ${nextStatus}. Notes: ${data.rejectionNotes || "None."}`,
        status: "SENT",
      });
    }

    await recordAuditEvent({
      actorId: userId,
      action: nextStatus === "APPROVED" ? "APPLICATION_APPROVED" : "APPLICATION_REJECTED",
      resourceType: "rental_application",
      resourceId: data.applicationId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// -------------------------------------------------------------
// Read Operations (Queries)
// -------------------------------------------------------------

export const fnGetApplicationDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: applicationId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    const { data: app, error } = await supabaseAdmin
      .from("rental_applications")
      .select(
        `
        *,
        listings(title, price, currency, availability_date),
        properties(name, county, town, address, verification_status),
        applicant:profiles!applicant_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified)
      `,
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Application record not found.");
    }

    // Access control: seeker, provider, or admin
    const isApplicant = app.applicant_id === userId;
    const isProvider = app.provider_id === userId;
    const isAdmin =
      hasPermission(roles, "ADMIN_VIEW_USERS") || hasPermission(roles, "VERIFICATION_VIEW");

    if (!isApplicant && !isProvider && !isAdmin) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to view this application.",
      );
    }

    // Fetch documents
    const { data: documents } = await supabaseAdmin
      .from("application_documents")
      .select("*, requirement:application_requirements(*)")
      .eq("application_id", applicationId);

    // Fetch information requests
    const { data: requests } = await supabaseAdmin
      .from("application_requests")
      .select("*, requirement:application_requirements(*)")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    // Fetch status transition history
    const { data: history } = await supabaseAdmin
      .from("application_status_history")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    // Fetch internal reviews (hidden from applicant)
    let reviews: any[] = [];
    if (isProvider || isAdmin) {
      const { data: revList } = await supabaseAdmin
        .from("application_reviews")
        .select("*, reviewer:profiles!reviewer_id(full_name)")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });
      reviews = revList || [];
    }

    return {
      application: app,
      documents: documents || [],
      requests: requests || [],
      history: history || [],
      reviews,
    };
  });

export const fnListApplicantApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await supabaseAdmin
      .from("rental_applications")
      .select(
        `
        *,
        listings(title, price, currency),
        properties(name, county, town, address)
      `,
      )
      .eq("applicant_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve applications.");
    }

    return data;
  });

export const fnProviderListApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z
      .object({
        status: z.string().optional(),
        listingId: z.string().uuid().optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "APPLICATIONS_MANAGE");

    let query = supabaseAdmin
      .from("rental_applications")
      .select(
        `
        *,
        listings(title, price, currency),
        properties(name, county, town, address),
        applicant:profiles!applicant_id(full_name, phone_number, identity_verified)
      `,
      )
      .eq("provider_id", userId)
      .order("created_at", { ascending: false });

    if (data?.status) {
      query = query.eq("status", data.status);
    }
    if (data?.listingId) {
      query = query.eq("listing_id", data.listingId);
    }

    const { data: list, error } = await query;
    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve provider applications.");
    }

    return list;
  });

// Wrap exports for type safety client-side calls
export const createApplicationDraft = (data: z.infer<typeof CreateApplicationSchema>) =>
  fnCreateApplicationDraft({ data });

export const updateApplicationDraft = (data: z.infer<typeof UpdateDraftSchema>) =>
  fnUpdateApplicationDraft({ data });

export const submitApplication = (applicationId: string) =>
  fnSubmitApplication({ data: applicationId });

export const withdrawApplication = (applicationId: string) =>
  fnWithdrawApplication({ data: applicationId });

export const providerReviewApplication = (data: z.infer<typeof RecordReviewSchema>) =>
  fnProviderReviewApplication({ data });

export const providerRequestInformation = (data: z.infer<typeof RequestAdditionalInfoSchema>) =>
  fnProviderRequestInformation({ data });

export const respondToInformationRequest = (data: z.infer<typeof RespondToRequestSchema>) =>
  fnRespondToInformationRequest({ data });

export const providerRecordDecision = (data: z.infer<typeof RecordDecisionSchema>) =>
  fnProviderRecordDecision({ data });

export const getApplicationDetails = (applicationId: string) =>
  fnGetApplicationDetails({ data: applicationId });

export const listApplicantApplications = () => fnListApplicantApplications();

export const providerListApplications = (data?: { status?: string; listingId?: string }) =>
  fnProviderListApplications({ data });

export const fnGetSecureApplicationDocUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string())
  .handler(async ({ data: filePath, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    const { data: doc, error: findErr } = await supabaseAdmin
      .from("application_documents")
      .select("*, rental_applications(applicant_id, provider_id)")
      .eq("file_path", filePath)
      .maybeSingle();

    if (findErr || !doc) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Document record not found.");
    }

    const app = doc.rental_applications as any;
    const isApplicant = app.applicant_id === userId;
    const isProvider = app.provider_id === userId;
    const isAuthorized =
      isApplicant ||
      isProvider ||
      hasPermission(roles, "ADMIN_VIEW_USERS") ||
      hasPermission(roles, "VERIFICATION_VIEW");

    if (!isAuthorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to view this document.",
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from("application_documents")
      .createSignedUrl(filePath, 900); // 15 mins validity

    if (error || !data) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to generate download URL.");
    }

    return { url: data.signedUrl };
  });

export const getSecureApplicationDocUrl = (filePath: string) =>
  fnGetSecureApplicationDocUrl({ data: filePath });
