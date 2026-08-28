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
import { hasPermission, type AppRole } from "@/core/auth/roles";
import { NotificationService } from "./notifications.server";
import {
  CreateConversationSchema,
  SendMessageSchema,
  SubmitUserReportSchema,
  UpdateNotificationPreferencesSchema,
  CONVERSATION_STATUSES,
  MESSAGE_TYPES,
} from "./communication.types";

// =============================================================
// Helper: Resolve context details
// =============================================================
function getContextMeta() {
  const request = getRequest();
  const requestId = resolveRequestId(request?.headers);
  const meta = auditMetadataFromRequest(request);
  return { requestId, meta };
}

// Check blocker/blocked relationship
async function verifyNoBlocks(userA: string, userB: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`,
    )
    .maybeSingle();

  if (data) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      "Unable to communicate: This user has blocked you or you have blocked them.",
    );
  }
}

// Check if user is suspended/locked/deactivated
async function verifyProviderStatus(providerId: string): Promise<void> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("status")
    .eq("id", providerId)
    .maybeSingle();

  if (profile) {
    const status = profile.status;
    if (status === "SUSPENDED" || status === "LOCKED" || status === "DEACTIVATED") {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        `Unable to communicate: Property provider account is currently ${status}.`,
      );
    }
  }
}

// =============================================================
// CONVERSATION OPERATIONS
// =============================================================

const fnCreateConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CreateConversationSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // 1. Rate Limit: Limit to 5 new conversations per hour per user
    checkRateLimit(`conv_create:${userId}`, 5, 3600);

    // 2. Fetch Listing and associated Property details
    const { data: listing, error: listingErr } = await supabaseAdmin
      .from("listings")
      .select("*, properties(id, owner_user_id, status)")
      .eq("id", data.listingId)
      .maybeSingle();

    if (listingErr || !listing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "The listing could not be found.");
    }

    const prop = listing.properties as any;
    if (!prop) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Property reference not found.");
    }

    const providerId = prop.owner_user_id;

    // Seeker cannot contact themselves
    if (userId === providerId) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot start a conversation with yourself.");
    }

    // 3. Security checks: block state, provider active status, property not archived
    await verifyNoBlocks(userId, providerId);
    await verifyProviderStatus(providerId);

    if (prop.status === "ARCHIVED") {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "The property is no longer active.");
    }

    // Check if an active conversation thread already exists for this listing and seeker
    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("listing_id", data.listingId)
      .eq("seeker_id", userId)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (existing) {
      // If thread exists, append message to it instead of duplicating
      const { data: msg } = await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: existing.id,
          sender_id: userId,
          message_type: "TEXT",
          content: data.initialMessage,
          status: "SENT",
        })
        .select()
        .single();

      // Trigger notification
      await NotificationService.send({
        userId: providerId,
        type: "NEW_MESSAGE",
        title: "New Enquiry Message",
        content: `New message regarding listing: ${listing.title}`,
        payload: { conversationId: existing.id },
      });

      return { success: true, conversationId: existing.id };
    }

    // 4. Create new thread in database transaction/batch
    const { data: conv, error: convErr } = await supabaseAdmin
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

    if (convErr || !conv) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        convErr?.message || "Failed to create conversation.",
      );
    }

    // Insert first message
    const { error: msgErr } = await supabaseAdmin.from("messages").insert({
      conversation_id: conv.id,
      sender_id: userId,
      message_type: "TEXT",
      content: data.initialMessage,
      status: "SENT",
    });

    if (msgErr) {
      // Rollback conversation
      await supabaseAdmin.from("conversations").delete().eq("id", conv.id);
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to send initial message.");
    }

    // 5. Send Notification
    await NotificationService.send({
      userId: providerId,
      type: "NEW_MESSAGE",
      title: "New Enquiry Received",
      content: `A tenant is interested in ${listing.title}: "${data.initialMessage.slice(0, 40)}..."`,
      payload: { conversationId: conv.id },
    });

    // 6. Audit
    await recordAuditEvent({
      actorId: userId,
      action: "CONVERSATION_CREATED",
      resourceType: "conversation",
      resourceId: conv.id,
      afterData: { providerId, listingId: data.listingId },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, conversationId: conv.id };
  });

export const createConversation = (data: z.infer<typeof CreateConversationSchema>) =>
  fnCreateConversation({ data });

const fnGetConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z
      .object({
        status: z.enum(CONVERSATION_STATUSES).optional(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().datetime().optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const limit = data?.limit ?? 20;
    const cursor = data?.cursor;
    const status = data?.status ?? "ACTIVE";

    let query = supabaseAdmin
      .from("conversations")
      .select(
        `
        *,
        listings(title, price, currency),
        properties(name),
        seeker:profiles!seeker_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified),
        messages(content, created_at, sender_id)
      `,
      )
      .or(`seeker_id.eq.${userId},provider_id.eq.${userId}`)
      .eq("status", status)
      .order("updated_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("updated_at", cursor);
    }

    const { data: convs, error } = await query;
    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve conversations.");
    }

    // Format & pagination cursor logic
    const hasNextPage = convs.length > limit;
    const items = hasNextPage ? convs.slice(0, limit) : convs;
    const nextCursor = hasNextPage ? items[items.length - 1].updated_at : undefined;

    // Attach latest message detail
    const formatted = items.map((c: any) => {
      const sortedMsgs = (c.messages || []).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      return {
        ...c,
        latestMessage: sortedMsgs[0] || null,
      };
    });

    return {
      items: formatted,
      nextCursor,
    };
  });

export const getConversations = (data?: any) => fnGetConversations({ data });

const fnGetConversationDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: conversationId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    const { data: conv, error } = await supabaseAdmin
      .from("conversations")
      .select(
        `
        *,
        listings(*, properties(*)),
        seeker:profiles!seeker_id(*),
        provider:profiles!provider_id(*),
        units(*)
      `,
      )
      .eq("id", conversationId)
      .maybeSingle();

    if (error || !conv) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Conversation not found.");
    }

    // IDOR Protection: Must be participant or platform admin
    const isParticipant = conv.seeker_id === userId || conv.provider_id === userId;
    const isAdmin = hasPermission(roles, "ADMIN_VIEW_USERS");
    if (!isParticipant && !isAdmin) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You are not authorized to view this thread.",
      );
    }

    return conv;
  });

export const getConversationDetails = (conversationId: string) =>
  fnGetConversationDetails({ data: conversationId });

// =============================================================
// MESSAGE OPERATIONS
// =============================================================

const fnSendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SendMessageSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // 1. Rate Limit: 60 messages per minute
    checkRateLimit(`msg_send:${userId}`, 60, 60);

    // 2. Fetch conversation details to authenticate participation and identify recipient
    const { data: conv, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("*, listings(title)")
      .eq("id", data.conversationId)
      .maybeSingle();

    if (convErr || !conv) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Conversation thread not found.");
    }

    const isParticipant = conv.seeker_id === userId || conv.provider_id === userId;
    if (!isParticipant) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "You are not a participant in this conversation.");
    }

    if (conv.status === "CLOSED" || conv.status === "BLOCKED") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `Conversation is no longer active (status: ${conv.status}).`,
      );
    }

    const recipientId = conv.seeker_id === userId ? conv.provider_id : conv.seeker_id;

    // 3. Block check
    await verifyNoBlocks(userId, recipientId);
    await verifyProviderStatus(recipientId);

    // 4. Insert message
    const { data: msg, error: msgErr } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: data.conversationId,
        sender_id: userId,
        message_type: data.messageType,
        content: data.content,
        status: "SENT",
      })
      .select()
      .single();

    if (msgErr || !msg) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, msgErr?.message || "Failed to deliver message.");
    }

    // Touch conversation updated_at
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conv.id);

    // 5. Send Notification
    await NotificationService.send({
      userId: recipientId,
      type: "NEW_MESSAGE",
      title: "New Message",
      content: data.messageType === "TEXT" ? data.content : `System update regarding viewing.`,
      payload: { conversationId: conv.id, messageId: msg.id },
    });

    // 6. Audit
    await recordAuditEvent({
      actorId: userId,
      action: "MESSAGE_SENT",
      resourceType: "message",
      resourceId: msg.id,
      afterData: { conversationId: conv.id, recipientId },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return msg;
  });

export const sendMessage = (data: z.infer<typeof SendMessageSchema>) => fnSendMessage({ data });

const fnGetMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      conversationId: z.string().uuid(),
      limit: z.number().int().min(1).max(100).default(50),
      cursor: z.string().datetime().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const limit = data.limit;
    const cursor = data.cursor;

    // Security: Check participation
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("seeker_id, provider_id")
      .eq("id", data.conversationId)
      .maybeSingle();

    if (!conv || (conv.seeker_id !== userId && conv.provider_id !== userId)) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: You cannot read messages from this thread.",
      );
    }

    let query = supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: msgs, error } = await query;
    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to fetch messages.");
    }

    // Set read receipts for other user's messages in this thread
    const unreadFromOther = msgs.filter((m) => m.sender_id !== userId && m.status !== "READ");
    if (unreadFromOther.length > 0) {
      const unreadIds = unreadFromOther.map((m) => m.id);
      await supabaseAdmin.from("messages").update({ status: "READ" }).in("id", unreadIds);
    }

    const hasNextPage = msgs.length > limit;
    const items = hasNextPage ? msgs.slice(0, limit) : msgs;
    const nextCursor = hasNextPage ? items[items.length - 1].created_at : undefined;

    // Reverse for sequential chat view order
    return {
      items: items.reverse(),
      nextCursor,
    };
  });

export const getMessages = (data: any) => fnGetMessages({ data });

// =============================================================
// BLOCKING & REPORTING
// =============================================================

const fnBlockUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: blockedId, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    if (userId === blockedId) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot block yourself.");
    }

    // Create block mapping
    const { error } = await supabaseAdmin.from("blocks").insert({
      blocker_id: userId,
      blocked_id: blockedId,
    });

    if (error && error.code !== "23505") {
      // Ignore duplicate keys
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to block user.");
    }

    // Lock corresponding active conversations as BLOCKED
    await supabaseAdmin
      .from("conversations")
      .update({ status: "BLOCKED" })
      .or(
        `and(seeker_id.eq.${userId},provider_id.eq.${blockedId}),and(seeker_id.eq.${blockedId},provider_id.eq.${userId})`,
      );

    // Audit
    await recordAuditEvent({
      actorId: userId,
      action: "USER_BLOCKED",
      resourceType: "user",
      resourceId: blockedId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const blockUser = (blockedId: string) => fnBlockUser({ data: blockedId });

const fnUnblockUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: blockedId, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { error } = await supabaseAdmin
      .from("blocks")
      .delete()
      .eq("blocker_id", userId)
      .eq("blocked_id", blockedId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to unblock user.");
    }

    // Unlock conversations if neither is blocked anymore
    const { data: reverseBlock } = await supabaseAdmin
      .from("blocks")
      .select("id")
      .eq("blocker_id", blockedId)
      .eq("blocked_id", userId)
      .maybeSingle();

    if (!reverseBlock) {
      await supabaseAdmin
        .from("conversations")
        .update({ status: "ACTIVE" })
        .eq("status", "BLOCKED")
        .or(
          `and(seeker_id.eq.${userId},provider_id.eq.${blockedId}),and(seeker_id.eq.${blockedId},provider_id.eq.${userId})`,
        );
    }

    // Audit
    await recordAuditEvent({
      actorId: userId,
      action: "USER_UNBLOCKED",
      resourceType: "user",
      resourceId: blockedId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const unblockUser = (blockedId: string) => fnUnblockUser({ data: blockedId });

const fnReportUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SubmitUserReportSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // Rate Limit: 3 reports per hour
    checkRateLimit(`report_user:${userId}`, 3, 3600);

    // Insert Report
    const { data: report, error } = await supabaseAdmin
      .from("communication_reports")
      .insert({
        reporter_id: userId,
        reported_id: data.reportedId,
        conversation_id: data.conversationId || null,
        reason: data.reason,
        description: data.description,
        status: "OPEN",
      })
      .select()
      .single();

    if (error || !report) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        error?.message || "Failed to submit abuse report.",
      );
    }

    // Integrate with Phase 4 Risk Engine:
    // If a user receives 3 or more open communication reports, auto-flag with HIGH severity
    const { count } = await supabaseAdmin
      .from("communication_reports")
      .select("id", { count: "exact", head: true })
      .eq("reported_id", data.reportedId)
      .eq("status", "OPEN");

    if (count && count >= 3) {
      await supabaseAdmin.from("risk_flags").insert({
        subject_type: "USER",
        subject_id: data.reportedId,
        risk_type: "REPEATED_COMMUNICATION_REPORTS",
        severity: "HIGH",
        status: "OPEN",
      });
    }

    // Audit
    await recordAuditEvent({
      actorId: userId,
      action: "USER_REPORT_SUBMITTED",
      resourceType: "communication_report",
      resourceId: report.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const reportUser = (data: z.infer<typeof SubmitUserReportSchema>) => fnReportUser({ data });

// =============================================================
// NOTIFICATION & PREFERENCE OPERATIONS
// =============================================================

const fnGetNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to fetch notifications.");
    }
    return data;
  });

export const getNotifications = () => fnGetNotifications();

const fnMarkNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: id, context }) => {
    const { userId } = context;
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update notification.");
    }
    return { success: true };
  });

export const markNotificationRead = (id: string) => fnMarkNotificationRead({ data: id });

const fnGetNotificationPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve notification preferences.");
    }
    return data;
  });

export const getNotificationPreferences = () => fnGetNotificationPreferences();

const fnUpdateNotificationPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UpdateNotificationPreferencesSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseAdmin.from("notification_preferences").upsert(
      {
        user_id: userId,
        channel: data.channel,
        notification_type: data.notificationType,
        enabled: data.enabled,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,channel,notification_type",
      },
    );

    if (error) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Failed to update notification preference mapping.",
      );
    }

    return { success: true };
  });

export const updateNotificationPreferences = (
  data: z.infer<typeof UpdateNotificationPreferencesSchema>,
) => fnUpdateNotificationPreferences({ data });
