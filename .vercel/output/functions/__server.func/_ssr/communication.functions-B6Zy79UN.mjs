import { a as getRequest, i as createServerFn } from "./server-BRCrXnf-.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-C5p6KfDB.mjs";
import { a as enumType, c as objectType, d as stringType, s as numberType } from "../_libs/zod.mjs";
import { n as supabaseAdmin } from "./client.server-Ma94aMcQ.mjs";
import { a as resolveRequestId } from "./request-id-Du7XsDoM.mjs";
import { t as hasPermission } from "./roles-BzUNBgvo.mjs";
import { c as SubmitUserReportSchema, d as UpdateNotificationPreferencesSchema, r as CreateConversationSchema, s as SendMessageSchema, t as CONVERSATION_STATUSES } from "./communication.types-DyuZcG1y.mjs";
import { t as createServerRpc } from "./createServerRpc-QTbvBIhf.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-Bceddfrr.mjs";
import { t as NotificationService } from "./notifications.server-Dtdxn9Il.mjs";
import { t as checkRateLimit } from "./rate-limit.server-dC5Xqp4I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/communication.functions-B6Zy79UN.js
function getContextMeta() {
	const request = getRequest();
	return {
		requestId: resolveRequestId(request?.headers),
		meta: auditMetadataFromRequest(request)
	};
}
async function verifyNoBlocks(userA, userB) {
	const { data } = await supabaseAdmin.from("blocks").select("id").or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`).maybeSingle();
	if (data) throw new AppError(ERROR_CODES.FORBIDDEN, "Unable to communicate: This user has blocked you or you have blocked them.");
}
async function verifyProviderStatus(providerId) {
	const { data: profile } = await supabaseAdmin.from("profiles").select("status").eq("id", providerId).maybeSingle();
	if (profile) {
		const status = profile.status;
		if (status === "SUSPENDED" || status === "LOCKED" || status === "DEACTIVATED") throw new AppError(ERROR_CODES.FORBIDDEN, `Unable to communicate: Property provider account is currently ${status}.`);
	}
}
var fnCreateConversation_createServerFn_handler = createServerRpc({
	id: "83fc557dc82f79a2f55f3b56c034d0318faebca6ffb9ad98fd6115f48a8ddaa2",
	name: "fnCreateConversation",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnCreateConversation.__executeServer(opts));
var fnCreateConversation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateConversationSchema).handler(fnCreateConversation_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	checkRateLimit(`conv_create:${userId}`, 5, 3600);
	const { data: listing, error: listingErr } = await supabaseAdmin.from("listings").select("*, properties(id, owner_user_id, status)").eq("id", data.listingId).maybeSingle();
	if (listingErr || !listing) throw new AppError(ERROR_CODES.NOT_FOUND, "The listing could not be found.");
	const prop = listing.properties;
	if (!prop) throw new AppError(ERROR_CODES.BAD_REQUEST, "Property reference not found.");
	const providerId = prop.owner_user_id;
	if (userId === providerId) throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot start a conversation with yourself.");
	await verifyNoBlocks(userId, providerId);
	await verifyProviderStatus(providerId);
	if (prop.status === "ARCHIVED") throw new AppError(ERROR_CODES.BAD_REQUEST, "The property is no longer active.");
	const { data: existing } = await supabaseAdmin.from("conversations").select("id").eq("listing_id", data.listingId).eq("seeker_id", userId).eq("provider_id", providerId).maybeSingle();
	if (existing) {
		const { data: msg } = await supabaseAdmin.from("messages").insert({
			conversation_id: existing.id,
			sender_id: userId,
			message_type: "TEXT",
			content: data.initialMessage,
			status: "SENT"
		}).select().single();
		await NotificationService.send({
			userId: providerId,
			type: "NEW_MESSAGE",
			title: "New Enquiry Message",
			content: `New message regarding listing: ${listing.title}`,
			payload: { conversationId: existing.id }
		});
		return {
			success: true,
			conversationId: existing.id
		};
	}
	const { data: conv, error: convErr } = await supabaseAdmin.from("conversations").insert({
		property_id: prop.id,
		listing_id: data.listingId,
		unit_id: data.unitId || null,
		seeker_id: userId,
		provider_id: providerId,
		status: "ACTIVE"
	}).select().single();
	if (convErr || !conv) throw new AppError(ERROR_CODES.BAD_REQUEST, convErr?.message || "Failed to create conversation.");
	const { error: msgErr } = await supabaseAdmin.from("messages").insert({
		conversation_id: conv.id,
		sender_id: userId,
		message_type: "TEXT",
		content: data.initialMessage,
		status: "SENT"
	});
	if (msgErr) {
		await supabaseAdmin.from("conversations").delete().eq("id", conv.id);
		throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to send initial message.");
	}
	await NotificationService.send({
		userId: providerId,
		type: "NEW_MESSAGE",
		title: "New Enquiry Received",
		content: `A tenant is interested in ${listing.title}: "${data.initialMessage.slice(0, 40)}..."`,
		payload: { conversationId: conv.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "CONVERSATION_CREATED",
		resourceType: "conversation",
		resourceId: conv.id,
		afterData: {
			providerId,
			listingId: data.listingId
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		conversationId: conv.id
	};
});
var fnGetConversations_createServerFn_handler = createServerRpc({
	id: "712facd15d69daef3d7abef5e8827c080be4ca3bb83f49fbb5e3bc7992504441",
	name: "fnGetConversations",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnGetConversations.__executeServer(opts));
var fnGetConversations = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	status: enumType(CONVERSATION_STATUSES).optional(),
	limit: numberType().int().min(1).max(50).default(20),
	cursor: stringType().datetime().optional()
}).optional()).handler(fnGetConversations_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const limit = data?.limit ?? 20;
	const cursor = data?.cursor;
	const status = data?.status ?? "ACTIVE";
	let query = supabaseAdmin.from("conversations").select(`
        *,
        listings(title, price, currency),
        properties(name),
        seeker:profiles!seeker_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified),
        messages(content, created_at, sender_id)
      `).or(`seeker_id.eq.${userId},provider_id.eq.${userId}`).eq("status", status).order("updated_at", { ascending: false }).limit(limit + 1);
	if (cursor) query = query.lt("updated_at", cursor);
	const { data: convs, error } = await query;
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve conversations.");
	const hasNextPage = convs.length > limit;
	const items = hasNextPage ? convs.slice(0, limit) : convs;
	const nextCursor = hasNextPage ? items[items.length - 1].updated_at : void 0;
	return {
		items: items.map((c) => {
			const sortedMsgs = (c.messages || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
			return {
				...c,
				latestMessage: sortedMsgs[0] || null
			};
		}),
		nextCursor
	};
});
var fnGetConversationDetails_createServerFn_handler = createServerRpc({
	id: "6198eb07c0b4e6cd925c57121cba9a815cfbfd981a1930a205ae6222b1d93110",
	name: "fnGetConversationDetails",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnGetConversationDetails.__executeServer(opts));
var fnGetConversationDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnGetConversationDetails_createServerFn_handler, async ({ data: conversationId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { data: conv, error } = await supabaseAdmin.from("conversations").select(`
        *,
        listings(*, properties(*)),
        seeker:profiles!seeker_id(*),
        provider:profiles!provider_id(*),
        units(*)
      `).eq("id", conversationId).maybeSingle();
	if (error || !conv) throw new AppError(ERROR_CODES.NOT_FOUND, "Conversation not found.");
	const isParticipant = conv.seeker_id === userId || conv.provider_id === userId;
	const isAdmin = hasPermission(roles, "ADMIN_VIEW_USERS");
	if (!isParticipant && !isAdmin) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to view this thread.");
	return conv;
});
var fnSendMessage_createServerFn_handler = createServerRpc({
	id: "debe91dbcd9d40d3fb5222baf887416bf189546410c80b86e14084b40b3c8d56",
	name: "fnSendMessage",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnSendMessage.__executeServer(opts));
var fnSendMessage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SendMessageSchema).handler(fnSendMessage_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	checkRateLimit(`msg_send:${userId}`, 60, 60);
	const { data: conv, error: convErr } = await supabaseAdmin.from("conversations").select("*, listings(title)").eq("id", data.conversationId).maybeSingle();
	if (convErr || !conv) throw new AppError(ERROR_CODES.NOT_FOUND, "Conversation thread not found.");
	if (!(conv.seeker_id === userId || conv.provider_id === userId)) throw new AppError(ERROR_CODES.FORBIDDEN, "You are not a participant in this conversation.");
	if (conv.status === "CLOSED" || conv.status === "BLOCKED") throw new AppError(ERROR_CODES.BAD_REQUEST, `Conversation is no longer active (status: ${conv.status}).`);
	const recipientId = conv.seeker_id === userId ? conv.provider_id : conv.seeker_id;
	await verifyNoBlocks(userId, recipientId);
	await verifyProviderStatus(recipientId);
	const { data: msg, error: msgErr } = await supabaseAdmin.from("messages").insert({
		conversation_id: data.conversationId,
		sender_id: userId,
		message_type: data.messageType,
		content: data.content,
		status: "SENT"
	}).select().single();
	if (msgErr || !msg) throw new AppError(ERROR_CODES.BAD_REQUEST, msgErr?.message || "Failed to deliver message.");
	await supabaseAdmin.from("conversations").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", conv.id);
	await NotificationService.send({
		userId: recipientId,
		type: "NEW_MESSAGE",
		title: "New Message",
		content: data.messageType === "TEXT" ? data.content : `System update regarding viewing.`,
		payload: {
			conversationId: conv.id,
			messageId: msg.id
		}
	});
	await recordAuditEvent({
		actorId: userId,
		action: "MESSAGE_SENT",
		resourceType: "message",
		resourceId: msg.id,
		afterData: {
			conversationId: conv.id,
			recipientId
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return msg;
});
var fnGetMessages_createServerFn_handler = createServerRpc({
	id: "7a1473d7cfdd80499f10f272c4d5f317412fc144d9b3fdcb8217835c513f70e6",
	name: "fnGetMessages",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnGetMessages.__executeServer(opts));
var fnGetMessages = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	conversationId: stringType().uuid(),
	limit: numberType().int().min(1).max(100).default(50),
	cursor: stringType().datetime().optional()
})).handler(fnGetMessages_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const limit = data.limit;
	const cursor = data.cursor;
	const { data: conv } = await supabaseAdmin.from("conversations").select("seeker_id, provider_id").eq("id", data.conversationId).maybeSingle();
	if (!conv || conv.seeker_id !== userId && conv.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You cannot read messages from this thread.");
	let query = supabaseAdmin.from("messages").select("*").eq("conversation_id", data.conversationId).order("created_at", { ascending: false }).limit(limit + 1);
	if (cursor) query = query.lt("created_at", cursor);
	const { data: msgs, error } = await query;
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to fetch messages.");
	const unreadFromOther = msgs.filter((m) => m.sender_id !== userId && m.status !== "READ");
	if (unreadFromOther.length > 0) {
		const unreadIds = unreadFromOther.map((m) => m.id);
		await supabaseAdmin.from("messages").update({ status: "READ" }).in("id", unreadIds);
	}
	const hasNextPage = msgs.length > limit;
	const items = hasNextPage ? msgs.slice(0, limit) : msgs;
	const nextCursor = hasNextPage ? items[items.length - 1].created_at : void 0;
	return {
		items: items.reverse(),
		nextCursor
	};
});
var fnBlockUser_createServerFn_handler = createServerRpc({
	id: "18866b28a2b927a122cf9ca138cad241b2e8776d99f7052bf63d0839bb8610d8",
	name: "fnBlockUser",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnBlockUser.__executeServer(opts));
var fnBlockUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnBlockUser_createServerFn_handler, async ({ data: blockedId, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	if (userId === blockedId) throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot block yourself.");
	const { error } = await supabaseAdmin.from("blocks").insert({
		blocker_id: userId,
		blocked_id: blockedId
	});
	if (error && error.code !== "23505") throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to block user.");
	await supabaseAdmin.from("conversations").update({ status: "BLOCKED" }).or(`and(seeker_id.eq.${userId},provider_id.eq.${blockedId}),and(seeker_id.eq.${blockedId},provider_id.eq.${userId})`);
	await recordAuditEvent({
		actorId: userId,
		action: "USER_BLOCKED",
		resourceType: "user",
		resourceId: blockedId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnUnblockUser_createServerFn_handler = createServerRpc({
	id: "0568f48967d7ad9618ab6a7f1497d0b1c7996dfd5c974a27979e73118b4dd6aa",
	name: "fnUnblockUser",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnUnblockUser.__executeServer(opts));
var fnUnblockUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnUnblockUser_createServerFn_handler, async ({ data: blockedId, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { error } = await supabaseAdmin.from("blocks").delete().eq("blocker_id", userId).eq("blocked_id", blockedId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to unblock user.");
	const { data: reverseBlock } = await supabaseAdmin.from("blocks").select("id").eq("blocker_id", blockedId).eq("blocked_id", userId).maybeSingle();
	if (!reverseBlock) await supabaseAdmin.from("conversations").update({ status: "ACTIVE" }).eq("status", "BLOCKED").or(`and(seeker_id.eq.${userId},provider_id.eq.${blockedId}),and(seeker_id.eq.${blockedId},provider_id.eq.${userId})`);
	await recordAuditEvent({
		actorId: userId,
		action: "USER_UNBLOCKED",
		resourceType: "user",
		resourceId: blockedId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnReportUser_createServerFn_handler = createServerRpc({
	id: "1206ce3787636dadf48b1061522e8d0de14230236c819331e263e0dfb6901924",
	name: "fnReportUser",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnReportUser.__executeServer(opts));
var fnReportUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitUserReportSchema).handler(fnReportUser_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	checkRateLimit(`report_user:${userId}`, 3, 3600);
	const { data: report, error } = await supabaseAdmin.from("communication_reports").insert({
		reporter_id: userId,
		reported_id: data.reportedId,
		conversation_id: data.conversationId || null,
		reason: data.reason,
		description: data.description,
		status: "OPEN"
	}).select().single();
	if (error || !report) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to submit abuse report.");
	const { count } = await supabaseAdmin.from("communication_reports").select("id", {
		count: "exact",
		head: true
	}).eq("reported_id", data.reportedId).eq("status", "OPEN");
	if (count && count >= 3) await supabaseAdmin.from("risk_flags").insert({
		subject_type: "USER",
		subject_id: data.reportedId,
		risk_type: "REPEATED_COMMUNICATION_REPORTS",
		severity: "HIGH",
		status: "OPEN"
	});
	await recordAuditEvent({
		actorId: userId,
		action: "USER_REPORT_SUBMITTED",
		resourceType: "communication_report",
		resourceId: report.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnGetNotifications_createServerFn_handler = createServerRpc({
	id: "961d4e1969a0985354c6bf92ba67dd9132b9793e505009bdb7d4a9b0bc1a858d",
	name: "fnGetNotifications",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnGetNotifications.__executeServer(opts));
var fnGetNotifications = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnGetNotifications_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { data, error } = await supabaseAdmin.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to fetch notifications.");
	return data;
});
var fnMarkNotificationRead_createServerFn_handler = createServerRpc({
	id: "ecadc9822c7be847f369a927f970e9702d45b76d1a8ad35c3715a6e94606e4ac",
	name: "fnMarkNotificationRead",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnMarkNotificationRead.__executeServer(opts));
var fnMarkNotificationRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnMarkNotificationRead_createServerFn_handler, async ({ data: id, context }) => {
	const { userId } = context;
	const { error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", userId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update notification.");
	return { success: true };
});
var fnGetNotificationPreferences_createServerFn_handler = createServerRpc({
	id: "9034fba1dbdd88f6fea8a1b213955474b7a4a6f9d214a47abb025ad0d40f8500",
	name: "fnGetNotificationPreferences",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnGetNotificationPreferences.__executeServer(opts));
var fnGetNotificationPreferences = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnGetNotificationPreferences_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { data, error } = await supabaseAdmin.from("notification_preferences").select("*").eq("user_id", userId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve notification preferences.");
	return data;
});
var fnUpdateNotificationPreferences_createServerFn_handler = createServerRpc({
	id: "663bfe331e872176d044d79d1522395773c6946d5ad9d23aa3cb80ab17be73e2",
	name: "fnUpdateNotificationPreferences",
	filename: "src/features/communication/communication.functions.ts"
}, (opts) => fnUpdateNotificationPreferences.__executeServer(opts));
var fnUpdateNotificationPreferences = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateNotificationPreferencesSchema).handler(fnUpdateNotificationPreferences_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { error } = await supabaseAdmin.from("notification_preferences").upsert({
		user_id: userId,
		channel: data.channel,
		notification_type: data.notificationType,
		enabled: data.enabled,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id,channel,notification_type" });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update notification preference mapping.");
	return { success: true };
});
//#endregion
export { fnBlockUser_createServerFn_handler, fnCreateConversation_createServerFn_handler, fnGetConversationDetails_createServerFn_handler, fnGetConversations_createServerFn_handler, fnGetMessages_createServerFn_handler, fnGetNotificationPreferences_createServerFn_handler, fnGetNotifications_createServerFn_handler, fnMarkNotificationRead_createServerFn_handler, fnReportUser_createServerFn_handler, fnSendMessage_createServerFn_handler, fnUnblockUser_createServerFn_handler, fnUpdateNotificationPreferences_createServerFn_handler };
