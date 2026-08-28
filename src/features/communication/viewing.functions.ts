/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { recordAuditEvent, auditMetadataFromRequest } from "@/core/audit/audit.server";
import { resolveRequestId } from "@/core/observability/request-id";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import { checkRateLimit } from "@/core/auth/rate-limit.server";
import { NotificationService } from "./notifications.server";
import {
  RequestViewingSchema,
  DeclineViewingSchema,
  RescheduleViewingSchema,
  CancelViewingSchema,
  SubmitViewingFeedbackSchema,
  UpdateAvailabilitySchema,
  VIEWING_STATUSES,
} from "./communication.types";

function getContextMeta() {
  const request = getRequest();
  const requestId = resolveRequestId(request?.headers);
  const meta = auditMetadataFromRequest(request);
  return { requestId, meta };
}

// Convert ISO string to day of week (0-6) and HH:MM format for local checks
function getLocalTimeComponents(dateStr: string) {
  // Kenya uses East Africa Time (EAT, UTC+3)
  const d = new Date(dateStr);
  const offsetMs = 3 * 60 * 60 * 1000; // 3 hours
  const localD = new Date(d.getTime() + offsetMs);
  const dayOfWeek = localD.getUTCDay();
  const hours = String(localD.getUTCHours()).padStart(2, "0");
  const minutes = String(localD.getUTCMinutes()).padStart(2, "0");
  return { dayOfWeek, timeStr: `${hours}:${minutes}` };
}

async function verifyNoViewingConflicts(
  seekerId: string,
  startStr: string,
  endStr: string,
  excludeViewingId?: string,
): Promise<void> {
  let query = supabaseAdmin
    .from("viewings")
    .select("id")
    .eq("seeker_id", seekerId)
    .in("status", ["CONFIRMED", "REQUESTED", "PENDING"])
    .or(`requested_start.lt.${endStr},requested_end.gt.${startStr}`);

  if (excludeViewingId) {
    query = query.neq("id", excludeViewingId);
  }

  const { data } = await query;
  if (data && data.length > 0) {
    throw new AppError(
      ERROR_CODES.BAD_REQUEST,
      "Double booking conflict: You already have a viewing requested or confirmed during this time slot.",
    );
  }
}

// Verify provider availability for a given start/end time
async function verifyProviderAvailability(providerId: string, startStr: string): Promise<void> {
  const { dayOfWeek, timeStr } = getLocalTimeComponents(startStr);

  // Fetch provider's availabilities for this day of the week
  const { data: slots } = await supabaseAdmin
    .from("viewing_availabilities")
    .select("*")
    .eq("provider_id", providerId)
    .eq("day_of_week", dayOfWeek);

  // If the landlord has defined slots, check if the request matches one
  if (slots && slots.length > 0) {
    const isAvailable = slots.some((slot) => {
      return timeStr >= slot.start_time && timeStr <= slot.end_time;
    });

    if (!isAvailable) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "The selected time slot falls outside the provider's defined viewing availability.",
      );
    }
  }
}

// =============================================================
// VIEWING OPERATIONS
// =============================================================

const fnRequestViewing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RequestViewingSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // 1. Rate Limit: 5 requests per day
    checkRateLimit(`viewing_request:${userId}`, 5, 86400);

    const start = new Date(data.requestedStart);
    if (start.getTime() <= Date.now()) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "The requested viewing start time must be in the future.",
      );
    }

    // Default duration is 1 hour
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // 2. Fetch Listing and associated Property details
    const { data: listing, error: listingErr } = await supabaseAdmin
      .from("listings")
      .select("*, properties(id, owner_user_id, status)")
      .eq("id", data.listingId)
      .maybeSingle();

    if (listingErr || !listing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }

    const prop = listing.properties as any;
    if (!prop) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Property reference not found.");
    }

    const providerId = prop.owner_user_id;
    if (userId === providerId) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "You cannot request a viewing on your own listing.",
      );
    }

    // 3. Availability and Conflict checks
    await verifyProviderAvailability(providerId, startIso);
    await verifyNoViewingConflicts(userId, startIso, endIso);

    // 4. Retrieve or Create Conversation context
    let { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", data.listingId)
      .eq("seeker_id", userId)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (!conv) {
      const { data: newConv, error: newConvErr } = await supabaseAdmin
        .from("conversations")
        .insert({
          property_id: prop.id,
          listing_id: data.listingId,
          unit_id: data.unitId || null,
          seeker_id: userId,
          provider_id: providerId,
          status: "ACTIVE",
        })
        .select()
        .single();

      if (newConvErr || !newConv) {
        throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to initialize communication context.");
      }
      conv = newConv;
    }

    // 5. Create Viewing
    const { data: viewing, error: viewErr } = await supabaseAdmin
      .from("viewings")
      .insert({
        listing_id: data.listingId,
        property_id: prop.id,
        unit_id: data.unitId || null,
        seeker_id: userId,
        provider_id: providerId,
        conversation_id: conv.id,
        requested_start: startIso,
        requested_end: endIso,
        status: "REQUESTED",
        notes: data.notes || null,
      })
      .select()
      .single();

    if (viewErr || !viewing) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        viewErr?.message || "Failed to submit viewing request.",
      );
    }

    // 6. Insert System Action Message in conversation
    const localTimeFormatted = new Date(startIso).toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
    });
    await supabaseAdmin.from("messages").insert({
      conversation_id: conv.id,
      sender_id: userId,
      message_type: "VIEWING_REQUEST",
      content: `I would like to request a physical viewing on ${localTimeFormatted}. Notes: ${data.notes || "None."}`,
      status: "SENT",
    });

    // 7. Touch conversation updated_at
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conv.id);

    // 8. Trigger Notifications
    await NotificationService.send({
      userId: providerId,
      type: "VIEWING_REQUEST",
      title: "Viewing Requested",
      content: `A tenant has requested a viewing for ${listing.title} on ${localTimeFormatted}.`,
      payload: { viewingId: viewing.id, conversationId: conv.id },
    });

    // 9. Audit
    await recordAuditEvent({
      actorId: userId,
      action: "VIEWING_REQUESTED",
      resourceType: "viewing",
      resourceId: viewing.id,
      afterData: { startIso, endIso },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, viewingId: viewing.id };
  });

export const requestViewing = (data: z.infer<typeof RequestViewingSchema>) =>
  fnRequestViewing({ data });

const fnConfirmViewing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: viewingId, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // 1. Fetch viewing details
    const { data: viewing, error } = await supabaseAdmin
      .from("viewings")
      .select("*, listings(title)")
      .eq("id", viewingId)
      .maybeSingle();

    if (error || !viewing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing request not found.");
    }

    // 2. Validate Caller Authority: must be listing provider
    if (viewing.provider_id !== userId) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Only the property provider can confirm this viewing.",
      );
    }

    if (viewing.status !== "REQUESTED" && viewing.status !== "RESCHEDULE_REQUESTED") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `Viewing cannot be confirmed because it is in '${viewing.status}' status.`,
      );
    }

    // 3. Double-Booking checks (Server side transaction safety)
    const { data: duplicateConfirmed } = await supabaseAdmin
      .from("viewings")
      .select("id")
      .eq("listing_id", viewing.listing_id)
      .eq("status", "CONFIRMED")
      .or(`confirmed_start.lt.${viewing.requested_end},confirmed_end.gt.${viewing.requested_start}`)
      .maybeSingle();

    if (duplicateConfirmed) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Double booking conflict: Another viewing has already been confirmed for this listing at this time slot.",
      );
    }

    const now = new Date().toISOString();

    // 4. Confirm viewing
    const { error: updateErr } = await supabaseAdmin
      .from("viewings")
      .update({
        status: "CONFIRMED",
        confirmed_start: viewing.requested_start,
        confirmed_end: viewing.requested_end,
        updated_at: now,
      })
      .eq("id", viewingId);

    if (updateErr) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to confirm viewing.");
    }

    // 5. Insert system confirmation message in chat
    if (viewing.conversation_id) {
      const localTimeFormatted = new Date(viewing.requested_start).toLocaleString("en-KE", {
        timeZone: "Africa/Nairobi",
      });
      await supabaseAdmin.from("messages").insert({
        conversation_id: viewing.conversation_id,
        sender_id: userId,
        message_type: "VIEWING_CONFIRMATION",
        content: `Viewing appointment has been CONFIRMED for ${localTimeFormatted}.`,
        status: "SENT",
      });

      await supabaseAdmin
        .from("conversations")
        .update({ updated_at: now })
        .eq("id", viewing.conversation_id);
    }

    // 6. Notify Seeker
    const localTimeFormatted = new Date(viewing.requested_start).toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
    });
    await NotificationService.send({
      userId: viewing.seeker_id,
      type: "VIEWING_CONFIRMED",
      title: "Viewing Confirmed",
      content: `Your viewing request for ${viewing.listings?.title || "Property"} on ${localTimeFormatted} is confirmed!`,
      payload: { viewingId: viewing.id, conversationId: viewing.conversation_id },
    });

    // 7. Audit
    await recordAuditEvent({
      actorId: userId,
      action: "VIEWING_CONFIRMED",
      resourceType: "viewing",
      resourceId: viewing.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const confirmViewing = (viewingId: string) => fnConfirmViewing({ data: viewingId });

const fnDeclineViewing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(DeclineViewingSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: viewing } = await supabaseAdmin
      .from("viewings")
      .select("*")
      .eq("id", data.viewingId)
      .maybeSingle();

    if (!viewing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing record not found.");
    }

    if (viewing.provider_id !== userId) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Only the property provider can decline this viewing.",
      );
    }

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("viewings")
      .update({
        status: "DECLINED",
        notes: data.notes || null,
        updated_at: now,
      })
      .eq("id", data.viewingId);

    // Insert system notification in chat
    if (viewing.conversation_id) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: viewing.conversation_id,
        sender_id: userId,
        message_type: "SYSTEM",
        content: `Viewing request has been DECLINED by provider. Reason/Notes: ${data.notes || "None."}`,
        status: "SENT",
      });

      await supabaseAdmin
        .from("conversations")
        .update({ updated_at: now })
        .eq("id", viewing.conversation_id);
    }

    // Notify Seeker
    await NotificationService.send({
      userId: viewing.seeker_id,
      type: "VIEWING_CANCELLED",
      title: "Viewing Declined",
      content: `Your viewing request has been declined. Notes: ${data.notes || "None."}`,
      payload: { viewingId: viewing.id, conversationId: viewing.conversation_id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "VIEWING_DECLINED",
      resourceType: "viewing",
      resourceId: viewing.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const declineViewing = (data: z.infer<typeof DeclineViewingSchema>) =>
  fnDeclineViewing({ data });

const fnRescheduleViewing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RescheduleViewingSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: viewing } = await supabaseAdmin
      .from("viewings")
      .select("*, listings(title)")
      .eq("id", data.viewingId)
      .maybeSingle();

    if (!viewing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing request not found.");
    }

    // Either participant can request to reschedule
    const isSeeker = viewing.seeker_id === userId;
    const isProvider = viewing.provider_id === userId;

    if (!isSeeker && !isProvider) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Only viewing participants can reschedule.");
    }

    const start = new Date(data.newStart);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // Check conflict
    await verifyNoViewingConflicts(viewing.seeker_id, startIso, endIso, viewing.id);

    const now = new Date().toISOString();
    const recipientId = isSeeker ? viewing.provider_id : viewing.seeker_id;

    // Rescheduling requires confirmation from other side, status shifts to RESCHEDULE_REQUESTED
    await supabaseAdmin
      .from("viewings")
      .update({
        status: "RESCHEDULE_REQUESTED",
        requested_start: startIso,
        requested_end: endIso,
        updated_at: now,
      })
      .eq("id", data.viewingId);

    const localTimeFormatted = new Date(startIso).toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
    });

    // Send system message
    if (viewing.conversation_id) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: viewing.conversation_id,
        sender_id: userId,
        message_type: "VIEWING_RESCHEDULE",
        content: `I would like to reschedule the viewing to ${localTimeFormatted}.`,
        status: "SENT",
      });

      await supabaseAdmin
        .from("conversations")
        .update({ updated_at: now })
        .eq("id", viewing.conversation_id);
    }

    // Trigger Notification
    await NotificationService.send({
      userId: recipientId,
      type: "VIEWING_RESCHEDULED",
      title: "Viewing Reschedule Requested",
      content: `A request was made to reschedule viewing of ${viewing.listings?.title || "Property"} to ${localTimeFormatted}.`,
      payload: { viewingId: viewing.id, conversationId: viewing.conversation_id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "VIEWING_RESCHEDULE_REQUESTED",
      resourceType: "viewing",
      resourceId: viewing.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const rescheduleViewing = (data: z.infer<typeof RescheduleViewingSchema>) =>
  fnRescheduleViewing({ data });

const fnCancelViewing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CancelViewingSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: viewing, error } = await supabaseAdmin
      .from("viewings")
      .select("*, listings(title)")
      .eq("id", data.viewingId)
      .maybeSingle();

    if (error || !viewing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing appointment not found.");
    }

    const isSeeker = viewing.seeker_id === userId;
    const isProvider = viewing.provider_id === userId;

    if (!isSeeker && !isProvider) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Only participants can cancel this viewing.");
    }

    if (viewing.status === "CANCELLED") {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "This viewing has already been cancelled.");
    }

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("viewings")
      .update({
        status: "CANCELLED",
        notes: data.reason,
        updated_at: now,
      })
      .eq("id", data.viewingId);

    // Insert system cancellation in chat
    if (viewing.conversation_id) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: viewing.conversation_id,
        sender_id: userId,
        message_type: "VIEWING_CANCELLATION",
        content: `Viewing has been CANCELLED. Reason: ${data.reason}`,
        status: "SENT",
      });

      await supabaseAdmin
        .from("conversations")
        .update({ updated_at: now })
        .eq("id", viewing.conversation_id);
    }

    // Notify other participant
    const recipientId = isSeeker ? viewing.provider_id : viewing.seeker_id;
    await NotificationService.send({
      userId: recipientId,
      type: "VIEWING_CANCELLED",
      title: "Viewing Cancelled",
      content: `The viewing appointment for ${viewing.listings?.title || "Property"} has been cancelled. Reason: ${data.reason}`,
      payload: { viewingId: viewing.id, conversationId: viewing.conversation_id },
    });

    await recordAuditEvent({
      actorId: userId,
      action: "VIEWING_CANCELLED",
      resourceType: "viewing",
      resourceId: viewing.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const cancelViewing = (data: z.infer<typeof CancelViewingSchema>) =>
  fnCancelViewing({ data });

const fnSubmitViewingFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SubmitViewingFeedbackSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: viewing } = await supabaseAdmin
      .from("viewings")
      .select("*")
      .eq("id", data.viewingId)
      .maybeSingle();

    if (!viewing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing record not found.");
    }

    if (viewing.seeker_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Only the viewing seeker can submit feedback.");
    }

    // Complete viewing status
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("viewings")
      .update({
        status: "COMPLETED",
        notes: data.notes || null,
        updated_at: now,
      })
      .eq("id", data.viewingId);

    // Integrate with Phase 5 Intelligent Matching:
    // We log recommendation feedback based on their viewing outcome
    let feedbackType = "LIKE";
    if (data.feedbackType === "NOT_INTERESTED" || data.feedbackType === "NOT_AS_DESCRIBED") {
      feedbackType = "DISLIKE";
    } else if (data.feedbackType === "PROPERTY_UNAVAILABLE") {
      feedbackType = "NOT_RELEVANT";
    }

    // Upsert recommendation feedback
    await supabaseAdmin.from("recommendation_feedback").upsert(
      {
        user_id: userId,
        listing_id: viewing.listing_id,
        feedback_type: feedbackType,
        created_at: now,
      },
      {
        onConflict: "user_id,listing_id,feedback_type",
      },
    );

    // If "not_as_described" or "property_unavailable", flag conflict internally for moderation review (Phase 4 integration)
    if (data.feedbackType === "NOT_AS_DESCRIBED" || data.feedbackType === "PROPERTY_UNAVAILABLE") {
      await supabaseAdmin.from("listing_reports").insert({
        reporter_id: userId,
        listing_id: viewing.listing_id,
        reason:
          data.feedbackType === "NOT_AS_DESCRIBED" ? "MISLEADING_PHOTOS" : "PROPERTY_UNAVAILABLE",
        description: `Feedback from completed viewing: ${data.notes || "None."}`,
        status: "OPEN",
      });
    }

    await recordAuditEvent({
      actorId: userId,
      action: "VIEWING_FEEDBACK_SUBMITTED",
      resourceType: "viewing",
      resourceId: viewing.id,
      afterData: { feedbackType: data.feedbackType },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const submitViewingFeedback = (data: z.infer<typeof SubmitViewingFeedbackSchema>) =>
  fnSubmitViewingFeedback({ data });

const fnGetViewings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z
      .object({
        status: z.enum(VIEWING_STATUSES).optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const status = data?.status;

    let query = supabaseAdmin
      .from("viewings")
      .select(
        `
        *,
        listings(title, price, currency),
        properties(name, county, town, address, verification_status),
        seeker:profiles!seeker_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified)
      `,
      )
      .or(`seeker_id.eq.${userId},provider_id.eq.${userId}`)
      .order("requested_start", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: list, error } = await query;
    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve viewings.");
    }

    return list;
  });

export const getViewings = (data?: any) => fnGetViewings({ data });

const fnUpdateAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UpdateAvailabilitySchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Delete existing availabilities
    const { error: delErr } = await supabaseAdmin
      .from("viewing_availabilities")
      .delete()
      .eq("provider_id", userId);

    if (delErr) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to reset current availabilities.");
    }

    // Insert new slots
    if (data.availabilities.length > 0) {
      const rows = data.availabilities.map((slot) => ({
        provider_id: userId,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }));

      const { error: insErr } = await supabaseAdmin.from("viewing_availabilities").insert(rows);

      if (insErr) {
        throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to insert new availability schedules.");
      }
    }

    return { success: true };
  });

export const updateAvailability = (data: z.infer<typeof UpdateAvailabilitySchema>) =>
  fnUpdateAvailability({ data });
