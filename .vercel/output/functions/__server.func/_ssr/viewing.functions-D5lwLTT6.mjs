import { a as getRequest, i as createServerFn } from "./server-Dy3VKkCi.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-CUUESrGA.mjs";
import { a as enumType, c as objectType, d as stringType } from "../_libs/zod.mjs";
import { n as supabaseAdmin } from "./client.server-KNnxUzUb.mjs";
import { a as resolveRequestId } from "./request-id-Du7XsDoM.mjs";
import { a as RequestViewingSchema, f as VIEWING_STATUSES, i as DeclineViewingSchema, l as SubmitViewingFeedbackSchema, n as CancelViewingSchema, o as RescheduleViewingSchema, u as UpdateAvailabilitySchema } from "./communication.types-DyuZcG1y.mjs";
import { t as createServerRpc } from "./createServerRpc-fDPuksr0.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-CB7xqELv.mjs";
import { t as NotificationService } from "./notifications.server-CoeRjyQN.mjs";
import { t as checkRateLimit } from "./rate-limit.server-GETUhkRi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/viewing.functions-D5lwLTT6.js
function getContextMeta() {
	const request = getRequest();
	return {
		requestId: resolveRequestId(request?.headers),
		meta: auditMetadataFromRequest(request)
	};
}
function getLocalTimeComponents(dateStr) {
	const d = new Date(dateStr);
	const localD = new Date(d.getTime() + 108e5);
	return {
		dayOfWeek: localD.getUTCDay(),
		timeStr: `${String(localD.getUTCHours()).padStart(2, "0")}:${String(localD.getUTCMinutes()).padStart(2, "0")}`
	};
}
async function verifyNoViewingConflicts(seekerId, startStr, endStr, excludeViewingId) {
	let query = supabaseAdmin.from("viewings").select("id").eq("seeker_id", seekerId).in("status", [
		"CONFIRMED",
		"REQUESTED",
		"PENDING"
	]).or(`requested_start.lt.${endStr},requested_end.gt.${startStr}`);
	if (excludeViewingId) query = query.neq("id", excludeViewingId);
	const { data } = await query;
	if (data && data.length > 0) throw new AppError(ERROR_CODES.BAD_REQUEST, "Double booking conflict: You already have a viewing requested or confirmed during this time slot.");
}
async function verifyProviderAvailability(providerId, startStr) {
	const { dayOfWeek, timeStr } = getLocalTimeComponents(startStr);
	const { data: slots } = await supabaseAdmin.from("viewing_availabilities").select("*").eq("provider_id", providerId).eq("day_of_week", dayOfWeek);
	if (slots && slots.length > 0) {
		if (!slots.some((slot) => {
			return timeStr >= slot.start_time && timeStr <= slot.end_time;
		})) throw new AppError(ERROR_CODES.BAD_REQUEST, "The selected time slot falls outside the provider's defined viewing availability.");
	}
}
var fnRequestViewing_createServerFn_handler = createServerRpc({
	id: "38343f13d09794d0550d5c28f1ac664cbfbbc121cf3abc984c09f94192a9ec1c",
	name: "fnRequestViewing",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnRequestViewing.__executeServer(opts));
var fnRequestViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RequestViewingSchema).handler(fnRequestViewing_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	checkRateLimit(`viewing_request:${userId}`, 5, 86400);
	const start = new Date(data.requestedStart);
	if (start.getTime() <= Date.now()) throw new AppError(ERROR_CODES.BAD_REQUEST, "The requested viewing start time must be in the future.");
	const end = new Date(start.getTime() + 36e5);
	const startIso = start.toISOString();
	const endIso = end.toISOString();
	const { data: listing, error: listingErr } = await supabaseAdmin.from("listings").select("*, properties(id, owner_user_id, status)").eq("id", data.listingId).maybeSingle();
	if (listingErr || !listing) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
	const prop = listing.properties;
	if (!prop) throw new AppError(ERROR_CODES.BAD_REQUEST, "Property reference not found.");
	const providerId = prop.owner_user_id;
	if (userId === providerId) throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot request a viewing on your own listing.");
	await verifyProviderAvailability(providerId, startIso);
	await verifyNoViewingConflicts(userId, startIso, endIso);
	let { data: conv } = await supabaseAdmin.from("conversations").select("id").eq("listing_id", data.listingId).eq("seeker_id", userId).eq("provider_id", providerId).maybeSingle();
	if (!conv) {
		const { data: newConv, error: newConvErr } = await supabaseAdmin.from("conversations").insert({
			property_id: prop.id,
			listing_id: data.listingId,
			unit_id: data.unitId || null,
			seeker_id: userId,
			provider_id: providerId,
			status: "ACTIVE"
		}).select().single();
		if (newConvErr || !newConv) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to initialize communication context.");
		conv = newConv;
	}
	const { data: viewing, error: viewErr } = await supabaseAdmin.from("viewings").insert({
		listing_id: data.listingId,
		property_id: prop.id,
		unit_id: data.unitId || null,
		seeker_id: userId,
		provider_id: providerId,
		conversation_id: conv.id,
		requested_start: startIso,
		requested_end: endIso,
		status: "REQUESTED",
		notes: data.notes || null
	}).select().single();
	if (viewErr || !viewing) throw new AppError(ERROR_CODES.BAD_REQUEST, viewErr?.message || "Failed to submit viewing request.");
	const localTimeFormatted = new Date(startIso).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
	await supabaseAdmin.from("messages").insert({
		conversation_id: conv.id,
		sender_id: userId,
		message_type: "VIEWING_REQUEST",
		content: `I would like to request a physical viewing on ${localTimeFormatted}. Notes: ${data.notes || "None."}`,
		status: "SENT"
	});
	await supabaseAdmin.from("conversations").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", conv.id);
	await NotificationService.send({
		userId: providerId,
		type: "VIEWING_REQUEST",
		title: "Viewing Requested",
		content: `A tenant has requested a viewing for ${listing.title} on ${localTimeFormatted}.`,
		payload: {
			viewingId: viewing.id,
			conversationId: conv.id
		}
	});
	await recordAuditEvent({
		actorId: userId,
		action: "VIEWING_REQUESTED",
		resourceType: "viewing",
		resourceId: viewing.id,
		afterData: {
			startIso,
			endIso
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		viewingId: viewing.id
	};
});
var fnConfirmViewing_createServerFn_handler = createServerRpc({
	id: "23edcbc3b26df55657e167e0842f6e4140453a8c5f609fcb543d90e6aac5311c",
	name: "fnConfirmViewing",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnConfirmViewing.__executeServer(opts));
var fnConfirmViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnConfirmViewing_createServerFn_handler, async ({ data: viewingId, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: viewing, error } = await supabaseAdmin.from("viewings").select("*, listings(title)").eq("id", viewingId).maybeSingle();
	if (error || !viewing) throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing request not found.");
	if (viewing.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Only the property provider can confirm this viewing.");
	if (viewing.status !== "REQUESTED" && viewing.status !== "RESCHEDULE_REQUESTED") throw new AppError(ERROR_CODES.BAD_REQUEST, `Viewing cannot be confirmed because it is in '${viewing.status}' status.`);
	const { data: duplicateConfirmed } = await supabaseAdmin.from("viewings").select("id").eq("listing_id", viewing.listing_id).eq("status", "CONFIRMED").or(`confirmed_start.lt.${viewing.requested_end},confirmed_end.gt.${viewing.requested_start}`).maybeSingle();
	if (duplicateConfirmed) throw new AppError(ERROR_CODES.BAD_REQUEST, "Double booking conflict: Another viewing has already been confirmed for this listing at this time slot.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { error: updateErr } = await supabaseAdmin.from("viewings").update({
		status: "CONFIRMED",
		confirmed_start: viewing.requested_start,
		confirmed_end: viewing.requested_end,
		updated_at: now
	}).eq("id", viewingId);
	if (updateErr) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to confirm viewing.");
	if (viewing.conversation_id) {
		const localTimeFormatted = new Date(viewing.requested_start).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
		await supabaseAdmin.from("messages").insert({
			conversation_id: viewing.conversation_id,
			sender_id: userId,
			message_type: "VIEWING_CONFIRMATION",
			content: `Viewing appointment has been CONFIRMED for ${localTimeFormatted}.`,
			status: "SENT"
		});
		await supabaseAdmin.from("conversations").update({ updated_at: now }).eq("id", viewing.conversation_id);
	}
	const localTimeFormatted = new Date(viewing.requested_start).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
	await NotificationService.send({
		userId: viewing.seeker_id,
		type: "VIEWING_CONFIRMED",
		title: "Viewing Confirmed",
		content: `Your viewing request for ${viewing.listings?.title || "Property"} on ${localTimeFormatted} is confirmed!`,
		payload: {
			viewingId: viewing.id,
			conversationId: viewing.conversation_id
		}
	});
	await recordAuditEvent({
		actorId: userId,
		action: "VIEWING_CONFIRMED",
		resourceType: "viewing",
		resourceId: viewing.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnDeclineViewing_createServerFn_handler = createServerRpc({
	id: "b93bbedb68cbdf313c222506d94f1a0073a398e41f959e358354e3f643b398ed",
	name: "fnDeclineViewing",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnDeclineViewing.__executeServer(opts));
var fnDeclineViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(DeclineViewingSchema).handler(fnDeclineViewing_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: viewing } = await supabaseAdmin.from("viewings").select("*").eq("id", data.viewingId).maybeSingle();
	if (!viewing) throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing record not found.");
	if (viewing.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Only the property provider can decline this viewing.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("viewings").update({
		status: "DECLINED",
		notes: data.notes || null,
		updated_at: now
	}).eq("id", data.viewingId);
	if (viewing.conversation_id) {
		await supabaseAdmin.from("messages").insert({
			conversation_id: viewing.conversation_id,
			sender_id: userId,
			message_type: "SYSTEM",
			content: `Viewing request has been DECLINED by provider. Reason/Notes: ${data.notes || "None."}`,
			status: "SENT"
		});
		await supabaseAdmin.from("conversations").update({ updated_at: now }).eq("id", viewing.conversation_id);
	}
	await NotificationService.send({
		userId: viewing.seeker_id,
		type: "VIEWING_CANCELLED",
		title: "Viewing Declined",
		content: `Your viewing request has been declined. Notes: ${data.notes || "None."}`,
		payload: {
			viewingId: viewing.id,
			conversationId: viewing.conversation_id
		}
	});
	await recordAuditEvent({
		actorId: userId,
		action: "VIEWING_DECLINED",
		resourceType: "viewing",
		resourceId: viewing.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnRescheduleViewing_createServerFn_handler = createServerRpc({
	id: "c992085c8a9faa20b661a8bdf75d1b7c7edf6c1f4bfb73f199d0cdc0f2f34fd1",
	name: "fnRescheduleViewing",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnRescheduleViewing.__executeServer(opts));
var fnRescheduleViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RescheduleViewingSchema).handler(fnRescheduleViewing_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: viewing } = await supabaseAdmin.from("viewings").select("*, listings(title)").eq("id", data.viewingId).maybeSingle();
	if (!viewing) throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing request not found.");
	const isSeeker = viewing.seeker_id === userId;
	const isProvider = viewing.provider_id === userId;
	if (!isSeeker && !isProvider) throw new AppError(ERROR_CODES.FORBIDDEN, "Only viewing participants can reschedule.");
	const start = new Date(data.newStart);
	const end = new Date(start.getTime() + 36e5);
	const startIso = start.toISOString();
	const endIso = end.toISOString();
	await verifyNoViewingConflicts(viewing.seeker_id, startIso, endIso, viewing.id);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const recipientId = isSeeker ? viewing.provider_id : viewing.seeker_id;
	await supabaseAdmin.from("viewings").update({
		status: "RESCHEDULE_REQUESTED",
		requested_start: startIso,
		requested_end: endIso,
		updated_at: now
	}).eq("id", data.viewingId);
	const localTimeFormatted = new Date(startIso).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
	if (viewing.conversation_id) {
		await supabaseAdmin.from("messages").insert({
			conversation_id: viewing.conversation_id,
			sender_id: userId,
			message_type: "VIEWING_RESCHEDULE",
			content: `I would like to reschedule the viewing to ${localTimeFormatted}.`,
			status: "SENT"
		});
		await supabaseAdmin.from("conversations").update({ updated_at: now }).eq("id", viewing.conversation_id);
	}
	await NotificationService.send({
		userId: recipientId,
		type: "VIEWING_RESCHEDULED",
		title: "Viewing Reschedule Requested",
		content: `A request was made to reschedule viewing of ${viewing.listings?.title || "Property"} to ${localTimeFormatted}.`,
		payload: {
			viewingId: viewing.id,
			conversationId: viewing.conversation_id
		}
	});
	await recordAuditEvent({
		actorId: userId,
		action: "VIEWING_RESCHEDULE_REQUESTED",
		resourceType: "viewing",
		resourceId: viewing.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnCancelViewing_createServerFn_handler = createServerRpc({
	id: "c379e4b02d17ddc0307ab6901ac58f16edfc90ac877b9c20d0d6884864e713c3",
	name: "fnCancelViewing",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnCancelViewing.__executeServer(opts));
var fnCancelViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CancelViewingSchema).handler(fnCancelViewing_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: viewing, error } = await supabaseAdmin.from("viewings").select("*, listings(title)").eq("id", data.viewingId).maybeSingle();
	if (error || !viewing) throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing appointment not found.");
	const isSeeker = viewing.seeker_id === userId;
	const isProvider = viewing.provider_id === userId;
	if (!isSeeker && !isProvider) throw new AppError(ERROR_CODES.FORBIDDEN, "Only participants can cancel this viewing.");
	if (viewing.status === "CANCELLED") throw new AppError(ERROR_CODES.BAD_REQUEST, "This viewing has already been cancelled.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("viewings").update({
		status: "CANCELLED",
		notes: data.reason,
		updated_at: now
	}).eq("id", data.viewingId);
	if (viewing.conversation_id) {
		await supabaseAdmin.from("messages").insert({
			conversation_id: viewing.conversation_id,
			sender_id: userId,
			message_type: "VIEWING_CANCELLATION",
			content: `Viewing has been CANCELLED. Reason: ${data.reason}`,
			status: "SENT"
		});
		await supabaseAdmin.from("conversations").update({ updated_at: now }).eq("id", viewing.conversation_id);
	}
	const recipientId = isSeeker ? viewing.provider_id : viewing.seeker_id;
	await NotificationService.send({
		userId: recipientId,
		type: "VIEWING_CANCELLED",
		title: "Viewing Cancelled",
		content: `The viewing appointment for ${viewing.listings?.title || "Property"} has been cancelled. Reason: ${data.reason}`,
		payload: {
			viewingId: viewing.id,
			conversationId: viewing.conversation_id
		}
	});
	await recordAuditEvent({
		actorId: userId,
		action: "VIEWING_CANCELLED",
		resourceType: "viewing",
		resourceId: viewing.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnSubmitViewingFeedback_createServerFn_handler = createServerRpc({
	id: "3ed5d09b0865d4bb74536145125d2d3237b3c1195deeb0c6a42504674a280b13",
	name: "fnSubmitViewingFeedback",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnSubmitViewingFeedback.__executeServer(opts));
var fnSubmitViewingFeedback = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitViewingFeedbackSchema).handler(fnSubmitViewingFeedback_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: viewing } = await supabaseAdmin.from("viewings").select("*").eq("id", data.viewingId).maybeSingle();
	if (!viewing) throw new AppError(ERROR_CODES.NOT_FOUND, "Viewing record not found.");
	if (viewing.seeker_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Only the viewing seeker can submit feedback.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("viewings").update({
		status: "COMPLETED",
		notes: data.notes || null,
		updated_at: now
	}).eq("id", data.viewingId);
	let feedbackType = "LIKE";
	if (data.feedbackType === "NOT_INTERESTED" || data.feedbackType === "NOT_AS_DESCRIBED") feedbackType = "DISLIKE";
	else if (data.feedbackType === "PROPERTY_UNAVAILABLE") feedbackType = "NOT_RELEVANT";
	await supabaseAdmin.from("recommendation_feedback").upsert({
		user_id: userId,
		listing_id: viewing.listing_id,
		feedback_type: feedbackType,
		created_at: now
	}, { onConflict: "user_id,listing_id,feedback_type" });
	if (data.feedbackType === "NOT_AS_DESCRIBED" || data.feedbackType === "PROPERTY_UNAVAILABLE") await supabaseAdmin.from("listing_reports").insert({
		reporter_id: userId,
		listing_id: viewing.listing_id,
		reason: data.feedbackType === "NOT_AS_DESCRIBED" ? "MISLEADING_PHOTOS" : "PROPERTY_UNAVAILABLE",
		description: `Feedback from completed viewing: ${data.notes || "None."}`,
		status: "OPEN"
	});
	await recordAuditEvent({
		actorId: userId,
		action: "VIEWING_FEEDBACK_SUBMITTED",
		resourceType: "viewing",
		resourceId: viewing.id,
		afterData: { feedbackType: data.feedbackType },
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnGetViewings_createServerFn_handler = createServerRpc({
	id: "597af23becaa2e91de1219590665a94973624a0805c2e8ba2e2d7b71314c7efb",
	name: "fnGetViewings",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnGetViewings.__executeServer(opts));
var fnGetViewings = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({ status: enumType(VIEWING_STATUSES).optional() }).optional()).handler(fnGetViewings_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const status = data?.status;
	let query = supabaseAdmin.from("viewings").select(`
        *,
        listings(title, price, currency),
        properties(name, county, town, address, verification_status),
        seeker:profiles!seeker_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified)
      `).or(`seeker_id.eq.${userId},provider_id.eq.${userId}`).order("requested_start", { ascending: true });
	if (status) query = query.eq("status", status);
	const { data: list, error } = await query;
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve viewings.");
	return list;
});
var fnUpdateAvailability_createServerFn_handler = createServerRpc({
	id: "b623a4f141f956e86eab72f55eef0c4029d99934f86063495be0c41d32e4e5bd",
	name: "fnUpdateAvailability",
	filename: "src/features/communication/viewing.functions.ts"
}, (opts) => fnUpdateAvailability.__executeServer(opts));
var fnUpdateAvailability = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateAvailabilitySchema).handler(fnUpdateAvailability_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { error: delErr } = await supabaseAdmin.from("viewing_availabilities").delete().eq("provider_id", userId);
	if (delErr) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to reset current availabilities.");
	if (data.availabilities.length > 0) {
		const rows = data.availabilities.map((slot) => ({
			provider_id: userId,
			day_of_week: slot.dayOfWeek,
			start_time: slot.startTime,
			end_time: slot.endTime
		}));
		const { error: insErr } = await supabaseAdmin.from("viewing_availabilities").insert(rows);
		if (insErr) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to insert new availability schedules.");
	}
	return { success: true };
});
//#endregion
export { fnCancelViewing_createServerFn_handler, fnConfirmViewing_createServerFn_handler, fnDeclineViewing_createServerFn_handler, fnGetViewings_createServerFn_handler, fnRequestViewing_createServerFn_handler, fnRescheduleViewing_createServerFn_handler, fnSubmitViewingFeedback_createServerFn_handler, fnUpdateAvailability_createServerFn_handler };
