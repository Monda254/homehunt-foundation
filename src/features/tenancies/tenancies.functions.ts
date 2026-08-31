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
  CreateTenancySchema,
  PrepareLeaseSchema,
  AcceptLeaseSchema,
  DeclineLeaseSchema,
  ScheduleMoveInSchema,
  CompleteMoveInSchema,
  EndTenancySchema,
  type TenancyStatus,
  type LeaseStatus,
} from "./tenancies.types";

function getContextMeta() {
  const request = getRequest();
  const requestId = resolveRequestId(request?.headers);
  const meta = auditMetadataFromRequest(request);
  return { requestId, meta };
}

// -------------------------------------------------------------
// Tenancy & Lease State Machine
// -------------------------------------------------------------
const VALID_TENANCY_TRANSITIONS: Record<TenancyStatus, TenancyStatus[]> = {
  PENDING: ["LEASE_PREPARATION", "CANCELLED"],
  LEASE_PREPARATION: ["AWAITING_ACCEPTANCE", "CANCELLED"],
  AWAITING_ACCEPTANCE: ["LEASE_PREPARATION", "ACTIVE", "MOVE_IN_PENDING", "CANCELLED"],
  MOVE_IN_PENDING: ["OCCUPIED", "CANCELLED"],
  ACTIVE: ["MOVE_IN_PENDING", "OCCUPIED", "NOTICE_GIVEN", "ENDED", "TERMINATED"],
  OCCUPIED: ["NOTICE_GIVEN", "ENDED", "TERMINATED"],
  NOTICE_GIVEN: ["ENDED", "TERMINATED"],
  ENDED: [],
  TERMINATED: [],
  CANCELLED: [],
};

function validateTenancyTransition(current: TenancyStatus, next: TenancyStatus) {
  const allowed = VALID_TENANCY_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new AppError(
      ERROR_CODES.BAD_REQUEST,
      `Invalid tenancy status transition from '${current}' to '${next}'.`,
    );
  }
}

const VALID_LEASE_TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
  DRAFT: ["READY_FOR_REVIEW", "SENT_TO_TENANT", "TERMINATED"],
  READY_FOR_REVIEW: ["SENT_TO_TENANT", "DRAFT", "TERMINATED"],
  SENT_TO_TENANT: ["TENANT_ACCEPTED", "DRAFT", "TERMINATED"],
  TENANT_ACCEPTED: ["PROVIDER_ACCEPTED", "EXECUTED", "ACTIVE", "TERMINATED"],
  PROVIDER_ACCEPTED: ["EXECUTED", "ACTIVE", "TERMINATED"],
  EXECUTED: ["ACTIVE", "TERMINATED"],
  ACTIVE: ["EXPIRED", "TERMINATED"],
  EXPIRED: [],
  TERMINATED: [],
};

function validateLeaseTransition(current: LeaseStatus, next: LeaseStatus) {
  const allowed = VALID_LEASE_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new AppError(
      ERROR_CODES.BAD_REQUEST,
      `Invalid lease status transition from '${current}' to '${next}'.`,
    );
  }
}

// Helper: status logs
async function recordTenancyStatusHistory(
  tenancyId: string,
  previousStatus: TenancyStatus | null,
  newStatus: TenancyStatus,
  changedBy: string,
  notes?: string,
) {
  await supabaseAdmin.from("tenancy_status_history").insert({
    tenancy_id: tenancyId,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: changedBy,
    notes: notes || null,
  });
}

// -------------------------------------------------------------
// Tenancy Creation (Approved Application handoff)
// -------------------------------------------------------------
export const fnCreateTenancy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CreateTenancySchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    // 1. Fetch application details & verify approval
    const { data: app, error: appErr } = await supabaseAdmin
      .from("rental_applications")
      .select("*, listings(*)")
      .eq("id", data.applicationId)
      .maybeSingle();

    if (appErr || !app) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Rental application reference not found.");
    }

    if (app.status !== "APPROVED") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `Only approved applications can be converted to tenancies. Current status: ${app.status}`,
      );
    }

    // 2. Access control: only the provider (landlord/agent) of the application or platform admin
    const isProvider = app.provider_id === userId;
    const isApplicant = app.applicant_id === userId;
    const isAdmin = hasPermission(roles, "TENANCIES_MANAGE");

    if (!isProvider && !isApplicant && !isAdmin) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to create a tenancy for this application.",
      );
    }

    // 3. Double-booking check: verify that this unit/property is not already rented in an active tenancy
    if (app.unit_id) {
      const { data: activeUnitTenancy } = await supabaseAdmin
        .from("tenancies")
        .select("id, tenancy_reference, status")
        .eq("unit_id", app.unit_id)
        .in("status", ["ACTIVE", "OCCUPIED", "MOVE_IN_PENDING", "AWAITING_ACCEPTANCE"])
        .maybeSingle();

      if (activeUnitTenancy) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          `This unit is already booked or occupied in an active tenancy (${activeUnitTenancy.tenancy_reference}).`,
        );
      }
    } else {
      const { data: activePropTenancy } = await supabaseAdmin
        .from("tenancies")
        .select("id, tenancy_reference, status")
        .eq("property_id", app.property_id)
        .is("unit_id", null)
        .in("status", ["ACTIVE", "OCCUPIED", "MOVE_IN_PENDING", "AWAITING_ACCEPTANCE"])
        .maybeSingle();

      if (activePropTenancy) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          `This property is already booked or occupied in an active tenancy (${activePropTenancy.tenancy_reference}).`,
        );
      }
    }

    // 4. Duplicate tenancy check for this specific application
    const { data: existingAppTenancy } = await supabaseAdmin
      .from("tenancies")
      .select("id")
      .eq("application_id", data.applicationId)
      .maybeSingle();

    if (existingAppTenancy) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "A tenancy has already been initialized for this approved application.",
      );
    }

    // 5. Create tenancy record in 'PENDING'
    const { data: tenancy, error: tenancyErr } = await supabaseAdmin
      .from("tenancies")
      .insert({
        property_id: app.property_id,
        unit_id: app.unit_id || null,
        listing_id: app.listing_id,
        application_id: app.id,
        tenant_id: app.applicant_id,
        provider_id: app.provider_id,
        status: "PENDING",
        rent_snapshot: app.rent_snapshot,
        currency_snapshot: app.currency_snapshot,
        billing_period_snapshot: app.billing_period_snapshot,
        deposit_snapshot: app.deposit_snapshot,
      })
      .select()
      .single();

    if (tenancyErr || !tenancy) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        tenancyErr?.message || "Failed to create tenancy record.",
      );
    }

    await recordTenancyStatusHistory(
      tenancy.id,
      null,
      "PENDING",
      userId,
      "Tenancy initialized from application approval.",
    );

    // Inject chat message
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", app.listing_id)
      .eq("seeker_id", app.applicant_id)
      .eq("provider_id", app.provider_id)
      .maybeSingle();

    if (conv) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conv.id,
        sender_id: userId,
        message_type: "TENANCY_CREATED",
        content: `Tenancy has been initialized. Reference: ${tenancy.tenancy_reference}. Lease preparation is in progress.`,
        status: "SENT",
      });
    }

    // Notify Seeker/Tenant
    await NotificationService.send({
      userId: app.applicant_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Tenancy Initialized",
      content: `A tenancy reference (${tenancy.tenancy_reference}) has been set up for your approved application.`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "TENANCY_CREATED",
      resourceType: "tenancy",
      resourceId: tenancy.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, tenancyId: tenancy.id };
  });

// -------------------------------------------------------------
// Lease Preparation (Draft terms)
// -------------------------------------------------------------
export const fnPrepareLease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(PrepareLeaseSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: tenancy, error: tenErr } = await supabaseAdmin
      .from("tenancies")
      .select("id, provider_id, status")
      .eq("id", data.tenancyId)
      .single();

    if (tenErr || !tenancy) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
    }

    // Access control: only the provider/landlord can manage terms
    if (tenancy.provider_id !== userId && !hasPermission(roles, "TENANCIES_MANAGE")) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to manage this lease.",
      );
    }

    if (
      tenancy.status !== "PENDING" &&
      tenancy.status !== "LEASE_PREPARATION" &&
      tenancy.status !== "AWAITING_ACCEPTANCE"
    ) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Lease terms cannot be prepared in the current tenancy state.",
      );
    }

    // 1. Fetch current max lease version for version increments
    const { data: currentLeases } = await supabaseAdmin
      .from("leases")
      .select("version")
      .eq("tenancy_id", data.tenancyId)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion =
      currentLeases && currentLeases.length > 0 ? currentLeases[0].version + 1 : 1;

    // 2. Insert new lease draft
    const { data: lease, error: leaseErr } = await supabaseAdmin
      .from("leases")
      .insert({
        tenancy_id: data.tenancyId,
        version: nextVersion,
        status: "DRAFT",
        rent_amount: data.rentAmount,
        deposit_amount: data.depositAmount,
        start_date: data.startDate,
        end_date: data.endDate,
        terms: data.terms,
      })
      .select()
      .single();

    if (leaseErr || !lease) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        leaseErr?.message || "Failed to create lease version.",
      );
    }

    // 3. Move tenancy to 'LEASE_PREPARATION' if pending
    if (tenancy.status === "PENDING") {
      validateTenancyTransition("PENDING", "LEASE_PREPARATION");
      await supabaseAdmin
        .from("tenancies")
        .update({ status: "LEASE_PREPARATION", start_date: data.startDate, end_date: data.endDate })
        .eq("id", data.tenancyId);

      await recordTenancyStatusHistory(
        data.tenancyId,
        "PENDING",
        "LEASE_PREPARATION",
        userId,
        "Draft lease prepared.",
      );
    }

    await recordAuditEvent({
      actorId: userId,
      action: "LEASE_CREATED",
      resourceType: "lease",
      resourceId: lease.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, leaseId: lease.id };
  });

// -------------------------------------------------------------
// Send Lease to Tenant for acceptance
// -------------------------------------------------------------
export const fnSendLease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: leaseId, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: lease, error: lErr } = await supabaseAdmin
      .from("leases")
      .select("*, tenancy:tenancies(*)")
      .eq("id", leaseId)
      .single();

    if (lErr || !lease) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Lease record not found.");
    }

    const tenancy = lease.tenancy as any;
    if (tenancy.provider_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    validateLeaseTransition(lease.status as LeaseStatus, "SENT_TO_TENANT");
    validateTenancyTransition(tenancy.status as TenancyStatus, "AWAITING_ACCEPTANCE");

    // Update status
    await supabaseAdmin.from("leases").update({ status: "SENT_TO_TENANT" }).eq("id", leaseId);
    await supabaseAdmin
      .from("tenancies")
      .update({ status: "AWAITING_ACCEPTANCE" })
      .eq("id", tenancy.id);

    await recordTenancyStatusHistory(
      tenancy.id,
      tenancy.status,
      "AWAITING_ACCEPTANCE",
      userId,
      "Lease draft sent to tenant for review.",
    );

    // Notify Tenant
    await NotificationService.send({
      userId: tenancy.tenant_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Lease Ready for Review",
      content: `Your landlord has sent the lease terms for agreement ${tenancy.tenancy_reference}. Please review and sign.`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "LEASE_SENT",
      resourceType: "lease",
      resourceId: leaseId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// -------------------------------------------------------------
// Seeker (Tenant) Lease Acceptance / Correction Request
// -------------------------------------------------------------
export const fnAcceptLease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AcceptLeaseSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: lease, error: lErr } = await supabaseAdmin
      .from("leases")
      .select("*, tenancy:tenancies(*)")
      .eq("id", data.leaseId)
      .single();

    if (lErr || !lease) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Lease agreement version not found.");
    }

    const tenancy = lease.tenancy as any;
    if (tenancy.tenant_id !== userId) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to sign this lease.",
      );
    }

    if (lease.status !== "SENT_TO_TENANT") {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Lease agreement is not in a signable state.");
    }

    validateLeaseTransition("SENT_TO_TENANT", "TENANT_ACCEPTED");

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("leases")
      .update({
        status: "TENANT_ACCEPTED",
        tenant_accepted_at: now,
        tenant_accepted_ip: meta.ipAddress,
        tenant_accepted_user_agent: meta.userAgent,
      })
      .eq("id", data.leaseId);

    // Notify Provider
    await NotificationService.send({
      userId: tenancy.provider_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Lease Signed by Tenant",
      content: `The tenant has accepted the lease terms for ${tenancy.tenancy_reference}. Please countersign to execute.`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "LEASE_ACCEPTED",
      resourceType: "lease",
      resourceId: data.leaseId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const fnDeclineLease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(DeclineLeaseSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: lease, error: lErr } = await supabaseAdmin
      .from("leases")
      .select("*, tenancy:tenancies(*)")
      .eq("id", data.leaseId)
      .single();

    if (lErr || !lease) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Lease agreement version not found.");
    }

    const tenancy = lease.tenancy as any;
    if (tenancy.tenant_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    if (lease.status !== "SENT_TO_TENANT") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Lease cannot be declined in the current status.",
      );
    }

    validateLeaseTransition("SENT_TO_TENANT", "DRAFT");
    validateTenancyTransition(tenancy.status as TenancyStatus, "LEASE_PREPARATION");

    // Revert status to drafts
    await supabaseAdmin.from("leases").update({ status: "DRAFT" }).eq("id", data.leaseId);
    await supabaseAdmin
      .from("tenancies")
      .update({ status: "LEASE_PREPARATION" })
      .eq("id", tenancy.id);

    await recordTenancyStatusHistory(
      tenancy.id,
      tenancy.status,
      "LEASE_PREPARATION",
      userId,
      `Correction requested by tenant: "${data.notes}"`,
    );

    // Notify Provider
    await NotificationService.send({
      userId: tenancy.provider_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Lease Correction Requested",
      content: `The tenant has requested updates for ${tenancy.tenancy_reference}: "${data.notes}"`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "LEASE_DECLINED",
      resourceType: "lease",
      resourceId: data.leaseId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// -------------------------------------------------------------
// Lease Execution / Tenancy Activation (Landlord countersigns)
// -------------------------------------------------------------
export const fnExecuteLease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: leaseId, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: lease, error: lErr } = await supabaseAdmin
      .from("leases")
      .select("*, tenancy:tenancies(*)")
      .eq("id", leaseId)
      .single();

    if (lErr || !lease) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Lease version not found.");
    }

    const tenancy = lease.tenancy as any;
    if (tenancy.provider_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    if (lease.status !== "TENANT_ACCEPTED") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Tenant has not accepted this lease version yet.",
      );
    }

    validateLeaseTransition("TENANT_ACCEPTED", "EXECUTED");
    validateTenancyTransition(tenancy.status as TenancyStatus, "ACTIVE");

    const now = new Date().toISOString();

    // 1. Update lease status to EXECUTED
    await supabaseAdmin
      .from("leases")
      .update({
        status: "EXECUTED",
        provider_accepted_at: now,
        provider_accepted_ip: meta.ipAddress,
        provider_accepted_user_agent: meta.userAgent,
      })
      .eq("id", leaseId);

    // 2. Set any previous active leases to TERMINATED or EXPIRED
    await supabaseAdmin
      .from("leases")
      .update({ status: "TERMINATED" })
      .eq("tenancy_id", tenancy.id)
      .neq("id", leaseId)
      .eq("status", "EXECUTED");

    // 3. Update tenancy status to ACTIVE and save execution dates
    await supabaseAdmin
      .from("tenancies")
      .update({
        status: "ACTIVE",
        activated_at: now,
        start_date: lease.start_date,
        end_date: lease.end_date,
        rent_snapshot: lease.rent_amount,
        deposit_snapshot: lease.deposit_amount,
      })
      .eq("id", tenancy.id);

    await recordTenancyStatusHistory(
      tenancy.id,
      tenancy.status,
      "ACTIVE",
      userId,
      "Lease fully executed. Tenancy is now Active.",
    );

    // 4. Update the units table status to OCCUPIED / RESERVED
    if (tenancy.unit_id) {
      await supabaseAdmin.from("units").update({ status: "RESERVED" }).eq("id", tenancy.unit_id);
    }

    // 5. Update listings availability/status to PAUSED/ARCHIVED so it doesn't show in discovery
    await supabaseAdmin.from("listings").update({ status: "PAUSED" }).eq("id", tenancy.listing_id);

    // Inject chat message
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", tenancy.listing_id)
      .eq("seeker_id", tenancy.tenant_id)
      .eq("provider_id", tenancy.provider_id)
      .maybeSingle();

    if (conv) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conv.id,
        sender_id: userId,
        message_type: "LEASE_EXECUTED",
        content: `The lease agreement has been countersigned and executed! You can schedule move-in details.`,
        status: "SENT",
      });
    }

    // Notify Seeker
    await NotificationService.send({
      userId: tenancy.tenant_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Lease Executed! 🎉",
      content: `The lease for ${tenancy.tenancy_reference} has been fully executed. Your tenancy is now active.`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "LEASE_EXECUTED",
      resourceType: "lease",
      resourceId: leaseId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// -------------------------------------------------------------
// Move-in Workflow (Inspection, Checklist & Completion)
// -------------------------------------------------------------
export const fnScheduleMoveIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ScheduleMoveInSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: tenancy, error: tenErr } = await supabaseAdmin
      .from("tenancies")
      .select("id, provider_id, status, tenancy_reference, tenant_id")
      .eq("id", data.tenancyId)
      .single();

    if (tenErr || !tenancy) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
    }

    if (tenancy.provider_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    // Transition tenancy status to MOVE_IN_PENDING if currently ACTIVE
    if (tenancy.status === "ACTIVE") {
      validateTenancyTransition("ACTIVE", "MOVE_IN_PENDING");
      await supabaseAdmin
        .from("tenancies")
        .update({ status: "MOVE_IN_PENDING" })
        .eq("id", data.tenancyId);
      await recordTenancyStatusHistory(
        data.tenancyId,
        "ACTIVE",
        "MOVE_IN_PENDING",
        userId,
        "Move-in schedule created.",
      );
    }

    // Insert or update move-in record
    await supabaseAdmin.from("move_in_records").upsert(
      {
        tenancy_id: data.tenancyId,
        scheduled_date: data.scheduledDate,
        status: "SCHEDULED",
      },
      { onConflict: "tenancy_id" },
    );

    // Notify Tenant
    await NotificationService.send({
      userId: tenancy.tenant_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Move-In Scheduled",
      content: `Your move-in inspection has been scheduled for ${new Date(data.scheduledDate).toLocaleString()}.`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "MOVE_IN_SCHEDULED",
      resourceType: "tenancy",
      resourceId: data.tenancyId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const fnCompleteMoveIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CompleteMoveInSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: tenancy, error: tenErr } = await supabaseAdmin
      .from("tenancies")
      .select("*, move_in:move_in_records(*)")
      .eq("id", data.tenancyId)
      .single();

    if (tenErr || !tenancy) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
    }

    // Move-in validation: Provider completes checklist, Seeker/Admin can confirm
    if (tenancy.provider_id !== userId && tenancy.tenant_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    if (tenancy.status !== "MOVE_IN_PENDING" && tenancy.status !== "ACTIVE") {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Tenancy is not in move-in stage.");
    }

    validateTenancyTransition(tenancy.status as TenancyStatus, "OCCUPIED");

    const now = new Date().toISOString();

    // 1. Update move-in details
    await supabaseAdmin
      .from("move_in_records")
      .update({
        status: "COMPLETED",
        actual_date: data.actualDate,
        checklist: data.checklist,
        condition_notes: data.conditionNotes || null,
        condition_media: data.conditionMedia,
      })
      .eq("tenancy_id", data.tenancyId);

    // 2. Set tenancy status to OCCUPIED
    await supabaseAdmin.from("tenancies").update({ status: "OCCUPIED" }).eq("id", data.tenancyId);

    await recordTenancyStatusHistory(
      data.tenancyId,
      tenancy.status as TenancyStatus,
      "OCCUPIED",
      userId,
      "Move-in checklist completed. Unit occupied.",
    );

    // 3. Mark unit status to OCCUPIED
    if (tenancy.unit_id) {
      await supabaseAdmin.from("units").update({ status: "OCCUPIED" }).eq("id", tenancy.unit_id);
    }

    // 4. Pauses listing
    await supabaseAdmin
      .from("listings")
      .update({ status: "ARCHIVED" })
      .eq("id", tenancy.listing_id);

    // Notify Seeker / Provider
    const notificationRecipient =
      userId === tenancy.tenant_id ? tenancy.provider_id : tenancy.tenant_id;
    await NotificationService.send({
      userId: notificationRecipient,
      type: "TENANCY_STATUS_CHANGED",
      title: "Move-In Confirmed",
      content: `The move-in checklist was signed off. Unit is officially occupied.`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "MOVE_IN_COMPLETED",
      resourceType: "tenancy",
      resourceId: data.tenancyId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// -------------------------------------------------------------
// Termination / Move-out Graceful Ends
// -------------------------------------------------------------
export const fnEndTenancy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(EndTenancySchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: tenancy, error: tenErr } = await supabaseAdmin
      .from("tenancies")
      .select("id, provider_id, tenant_id, status, unit_id, listing_id")
      .eq("id", data.tenancyId)
      .single();

    if (tenErr || !tenancy) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
    }

    // Authorization check
    if (tenancy.provider_id !== userId && !hasPermission(roles, "TENANCIES_MANAGE")) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    const nextStatus =
      data.reason === "LEASE_EXPIRED" || data.reason === "MUTUAL_END" ? "ENDED" : "TERMINATED";
    validateTenancyTransition(tenancy.status as TenancyStatus, nextStatus as TenancyStatus);

    const now = new Date().toISOString();

    // 1. Update status
    await supabaseAdmin
      .from("tenancies")
      .update({
        status: nextStatus,
        ended_at: now,
        termination_reason: data.reason,
        termination_notes: data.notes || null,
      })
      .eq("id", data.tenancyId);

    // 2. Mark active leases to TERMINATED
    await supabaseAdmin
      .from("leases")
      .update({ status: "TERMINATED" })
      .eq("tenancy_id", data.tenancyId)
      .eq("status", "EXECUTED");

    await recordTenancyStatusHistory(
      data.tenancyId,
      tenancy.status as TenancyStatus,
      nextStatus as TenancyStatus,
      userId,
      `Tenancy ended. Reason: ${data.reason}. ${data.notes || ""}`,
    );

    // 3. Make unit status AVAILABLE again
    if (tenancy.unit_id) {
      await supabaseAdmin.from("units").update({ status: "AVAILABLE" }).eq("id", tenancy.unit_id);
    }

    // 4. Notify Tenant
    await NotificationService.send({
      userId: tenancy.tenant_id,
      type: "TENANCY_STATUS_CHANGED",
      title: "Tenancy Ended",
      content: `Your tenancy has been marked as ${nextStatus.toLowerCase()}.`,
      payload: { tenancyId: tenancy.id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: nextStatus === "ENDED" ? "TENANCY_ENDED" : "TENANCY_TERMINATED",
      resourceType: "tenancy",
      resourceId: data.tenancyId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// -------------------------------------------------------------
// Tenancy Read Queries
// -------------------------------------------------------------
export const fnGetTenancyDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: tenancyId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    const { data: tenancy, error } = await supabaseAdmin
      .from("tenancies")
      .select(
        `
        *,
        listings(title, price, currency, availability_date),
        properties(id, name, county, town, address, verification_status),
        unit:units(unit_number, bedrooms, bathrooms, floor),
        tenant:profiles!tenant_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified)
      `,
      )
      .eq("id", tenancyId)
      .maybeSingle();

    if (error || !tenancy) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
    }

    const isTenant = tenancy.tenant_id === userId;
    const isProvider = tenancy.provider_id === userId;
    const isAdmin = hasPermission(roles, "TENANCIES_MANAGE");

    if (!isTenant && !isProvider && !isAdmin) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
    }

    // Fetch lease records
    const { data: leases } = await supabaseAdmin
      .from("leases")
      .select("*")
      .eq("tenancy_id", tenancyId)
      .order("version", { ascending: false });

    // Fetch move-in inspection logs
    const { data: moveIn } = await supabaseAdmin
      .from("move_in_records")
      .select("*")
      .eq("tenancy_id", tenancyId)
      .maybeSingle();

    // Fetch status change history (Timeline logs)
    const { data: history } = await supabaseAdmin
      .from("tenancy_status_history")
      .select("*")
      .eq("tenancy_id", tenancyId)
      .order("created_at", { ascending: true });

    return {
      tenancy,
      leases: leases || [],
      moveIn: moveIn || null,
      history: history || [],
    };
  });

export const fnListTenantTenancies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await supabaseAdmin
      .from("tenancies")
      .select(
        `
        *,
        listings(title, price, currency),
        properties(name, county, town, address),
        unit:units(unit_number)
      `,
      )
      .eq("tenant_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve tenancies.");
    }

    return data;
  });

export const fnProviderListTenancies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z
      .object({
        status: z.string().optional(),
        propertyId: z.string().uuid().optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    requirePermission(roles, "TENANCIES_MANAGE");

    let query = supabaseAdmin
      .from("tenancies")
      .select(
        `
        *,
        listings(title, price, currency),
        properties(name, county, town, address),
        unit:units(unit_number),
        tenant:profiles!tenant_id(full_name, phone_number, identity_verified)
      `,
      )
      .eq("provider_id", userId)
      .order("created_at", { ascending: false });

    if (data?.status) {
      query = query.eq("status", data.status);
    }
    if (data?.propertyId) {
      query = query.eq("property_id", data.propertyId);
    }

    const { data: list, error } = await query;
    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve provider tenancies.");
    }

    return list;
  });

export const fnGetSecureTenancyDocUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string())
  .handler(async ({ data: filePath, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    const { data: leases, error: lErr } = await supabaseAdmin
      .from("leases")
      .select("*, tenancy:tenancies(*)")
      .eq("file_path", filePath)
      .limit(1);

    if (lErr || !leases || leases.length === 0) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Lease document record not found.");
    }

    const tenancy = leases[0].tenancy as any;
    const isTenant = tenancy.tenant_id === userId;
    const isProvider = tenancy.provider_id === userId;
    const isAuthorized = isTenant || isProvider || hasPermission(roles, "TENANCIES_MANAGE");

    if (!isAuthorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to view this document.",
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from("tenancy_documents")
      .createSignedUrl(filePath, 900); // 15 mins validity

    if (error || !data) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to generate download URL.");
    }

    return { url: data.signedUrl };
  });

// -------------------------------------------------------------
// Client Call Wrappers
// -------------------------------------------------------------
export const createTenancy = (data: z.infer<typeof CreateTenancySchema>) =>
  fnCreateTenancy({ data });
export const prepareLease = (data: z.input<typeof PrepareLeaseSchema>) => fnPrepareLease({ data });
export const sendLease = (leaseId: string) => fnSendLease({ data: leaseId });
export const acceptLease = (data: z.infer<typeof AcceptLeaseSchema>) => fnAcceptLease({ data });
export const declineLease = (data: z.infer<typeof DeclineLeaseSchema>) => fnDeclineLease({ data });
export const executeLease = (leaseId: string) => fnExecuteLease({ data: leaseId });
export const scheduleMoveIn = (data: z.infer<typeof ScheduleMoveInSchema>) =>
  fnScheduleMoveIn({ data });
export const completeMoveIn = (data: z.input<typeof CompleteMoveInSchema>) =>
  fnCompleteMoveIn({ data });
export const endTenancy = (data: z.infer<typeof EndTenancySchema>) => fnEndTenancy({ data });
export const getTenancyDetails = (tenancyId: string) => fnGetTenancyDetails({ data: tenancyId });
export const listTenantTenancies = () => fnListTenantTenancies();
export const providerListTenancies = (data?: { status?: string; propertyId?: string }) =>
  fnProviderListTenancies({ data });
export const getSecureTenancyDocUrl = (filePath: string) =>
  fnGetSecureTenancyDocUrl({ data: filePath });
