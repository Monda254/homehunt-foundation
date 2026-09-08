import { a as getRequest, i as createServerFn } from "./server-BRCrXnf-.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-C5p6KfDB.mjs";
import { c as objectType, d as stringType } from "../_libs/zod.mjs";
import { n as supabaseAdmin$1 } from "./client.server-Ma94aMcQ.mjs";
import { a as resolveRequestId } from "./request-id-Du7XsDoM.mjs";
import { a as requirePermission, t as hasPermission } from "./roles-BzUNBgvo.mjs";
import { t as createServerRpc } from "./createServerRpc-QTbvBIhf.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-Bceddfrr.mjs";
import { t as NotificationService } from "./notifications.server-Dtdxn9Il.mjs";
import { a as EndTenancySchema, i as DeclineLeaseSchema, n as CompleteMoveInSchema, o as PrepareLeaseSchema, r as CreateTenancySchema, s as ScheduleMoveInSchema, t as AcceptLeaseSchema } from "./tenancies.types-Dd6_uOiM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenancies.functions-BhNN4Tid.js
var supabaseAdmin = supabaseAdmin$1;
function getContextMeta() {
	const request = getRequest();
	return {
		requestId: resolveRequestId(request?.headers),
		meta: auditMetadataFromRequest(request)
	};
}
var VALID_TENANCY_TRANSITIONS = {
	PENDING: ["LEASE_PREPARATION", "CANCELLED"],
	LEASE_PREPARATION: ["AWAITING_ACCEPTANCE", "CANCELLED"],
	AWAITING_ACCEPTANCE: [
		"LEASE_PREPARATION",
		"ACTIVE",
		"MOVE_IN_PENDING",
		"CANCELLED"
	],
	MOVE_IN_PENDING: ["OCCUPIED", "CANCELLED"],
	ACTIVE: [
		"MOVE_IN_PENDING",
		"OCCUPIED",
		"NOTICE_GIVEN",
		"ENDED",
		"TERMINATED"
	],
	OCCUPIED: [
		"NOTICE_GIVEN",
		"ENDED",
		"TERMINATED"
	],
	NOTICE_GIVEN: ["ENDED", "TERMINATED"],
	ENDED: [],
	TERMINATED: [],
	CANCELLED: []
};
function validateTenancyTransition(current, next) {
	if (!(VALID_TENANCY_TRANSITIONS[current] || []).includes(next)) throw new AppError(ERROR_CODES.BAD_REQUEST, `Invalid tenancy status transition from '${current}' to '${next}'.`);
}
var VALID_LEASE_TRANSITIONS = {
	DRAFT: [
		"READY_FOR_REVIEW",
		"SENT_TO_TENANT",
		"TERMINATED"
	],
	READY_FOR_REVIEW: [
		"SENT_TO_TENANT",
		"DRAFT",
		"TERMINATED"
	],
	SENT_TO_TENANT: [
		"TENANT_ACCEPTED",
		"DRAFT",
		"TERMINATED"
	],
	TENANT_ACCEPTED: [
		"PROVIDER_ACCEPTED",
		"EXECUTED",
		"ACTIVE",
		"TERMINATED"
	],
	PROVIDER_ACCEPTED: [
		"EXECUTED",
		"ACTIVE",
		"TERMINATED"
	],
	EXECUTED: ["ACTIVE", "TERMINATED"],
	ACTIVE: ["EXPIRED", "TERMINATED"],
	EXPIRED: [],
	TERMINATED: []
};
function validateLeaseTransition(current, next) {
	if (!(VALID_LEASE_TRANSITIONS[current] || []).includes(next)) throw new AppError(ERROR_CODES.BAD_REQUEST, `Invalid lease status transition from '${current}' to '${next}'.`);
}
async function recordTenancyStatusHistory(tenancyId, previousStatus, newStatus, changedBy, notes) {
	await supabaseAdmin.from("tenancy_status_history").insert({
		tenancy_id: tenancyId,
		previous_status: previousStatus,
		new_status: newStatus,
		changed_by: changedBy,
		notes: notes || null
	});
}
var fnCreateTenancy_createServerFn_handler = createServerRpc({
	id: "c4fa739030b3cd1c3ed5532740bdd67d9736d994eab6f4cdbfb0a7cab00fa397",
	name: "fnCreateTenancy",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnCreateTenancy.__executeServer(opts));
var fnCreateTenancy = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateTenancySchema).handler(fnCreateTenancy_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: app, error: appErr } = await supabaseAdmin.from("rental_applications").select("*, listings(*)").eq("id", data.applicationId).maybeSingle();
	if (appErr || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Rental application reference not found.");
	if (app.status !== "APPROVED") throw new AppError(ERROR_CODES.BAD_REQUEST, `Only approved applications can be converted to tenancies. Current status: ${app.status}`);
	const isProvider = app.provider_id === userId;
	const isApplicant = app.applicant_id === userId;
	const isAdmin = hasPermission(roles, "TENANCIES_MANAGE");
	if (!isProvider && !isApplicant && !isAdmin) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to create a tenancy for this application.");
	if (app.unit_id) {
		const { data: activeUnitTenancy } = await supabaseAdmin.from("tenancies").select("id, tenancy_reference, status").eq("unit_id", app.unit_id).in("status", [
			"ACTIVE",
			"OCCUPIED",
			"MOVE_IN_PENDING",
			"AWAITING_ACCEPTANCE"
		]).maybeSingle();
		if (activeUnitTenancy) throw new AppError(ERROR_CODES.BAD_REQUEST, `This unit is already booked or occupied in an active tenancy (${activeUnitTenancy.tenancy_reference}).`);
	} else {
		const { data: activePropTenancy } = await supabaseAdmin.from("tenancies").select("id, tenancy_reference, status").eq("property_id", app.property_id).is("unit_id", null).in("status", [
			"ACTIVE",
			"OCCUPIED",
			"MOVE_IN_PENDING",
			"AWAITING_ACCEPTANCE"
		]).maybeSingle();
		if (activePropTenancy) throw new AppError(ERROR_CODES.BAD_REQUEST, `This property is already booked or occupied in an active tenancy (${activePropTenancy.tenancy_reference}).`);
	}
	const { data: existingAppTenancy } = await supabaseAdmin.from("tenancies").select("id").eq("application_id", data.applicationId).maybeSingle();
	if (existingAppTenancy) throw new AppError(ERROR_CODES.BAD_REQUEST, "A tenancy has already been initialized for this approved application.");
	const { data: tenancy, error: tenancyErr } = await supabaseAdmin.from("tenancies").insert({
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
		deposit_snapshot: app.deposit_snapshot
	}).select().single();
	if (tenancyErr || !tenancy) throw new AppError(ERROR_CODES.BAD_REQUEST, tenancyErr?.message || "Failed to create tenancy record.");
	await recordTenancyStatusHistory(tenancy.id, null, "PENDING", userId, "Tenancy initialized from application approval.");
	const { data: conv } = await supabaseAdmin.from("conversations").select("id").eq("listing_id", app.listing_id).eq("seeker_id", app.applicant_id).eq("provider_id", app.provider_id).maybeSingle();
	if (conv) await supabaseAdmin.from("messages").insert({
		conversation_id: conv.id,
		sender_id: userId,
		message_type: "TENANCY_CREATED",
		content: `Tenancy has been initialized. Reference: ${tenancy.tenancy_reference}. Lease preparation is in progress.`,
		status: "SENT"
	});
	await NotificationService.send({
		userId: app.applicant_id,
		type: "TENANCY_STATUS_CHANGED",
		title: "Tenancy Initialized",
		content: `A tenancy reference (${tenancy.tenancy_reference}) has been set up for your approved application.`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "TENANCY_CREATED",
		resourceType: "tenancy",
		resourceId: tenancy.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		tenancyId: tenancy.id
	};
});
var fnPrepareLease_createServerFn_handler = createServerRpc({
	id: "b1d142305e423c78bfe0b62cb0fee74e0ace5879cc13fdb517925b1e5fd9d8fc",
	name: "fnPrepareLease",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnPrepareLease.__executeServer(opts));
var fnPrepareLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(PrepareLeaseSchema).handler(fnPrepareLease_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: tenancy, error: tenErr } = await supabaseAdmin.from("tenancies").select("id, provider_id, status").eq("id", data.tenancyId).single();
	if (tenErr || !tenancy) throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
	if (tenancy.provider_id !== userId && !hasPermission(roles, "TENANCIES_MANAGE")) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to manage this lease.");
	if (tenancy.status !== "PENDING" && tenancy.status !== "LEASE_PREPARATION" && tenancy.status !== "AWAITING_ACCEPTANCE") throw new AppError(ERROR_CODES.BAD_REQUEST, "Lease terms cannot be prepared in the current tenancy state.");
	const { data: currentLeases } = await supabaseAdmin.from("leases").select("version").eq("tenancy_id", data.tenancyId).order("version", { ascending: false }).limit(1);
	const nextVersion = currentLeases && currentLeases.length > 0 ? currentLeases[0].version + 1 : 1;
	const { data: lease, error: leaseErr } = await supabaseAdmin.from("leases").insert({
		tenancy_id: data.tenancyId,
		version: nextVersion,
		status: "DRAFT",
		rent_amount: data.rentAmount,
		deposit_amount: data.depositAmount,
		start_date: data.startDate,
		end_date: data.endDate,
		terms: data.terms
	}).select().single();
	if (leaseErr || !lease) throw new AppError(ERROR_CODES.BAD_REQUEST, leaseErr?.message || "Failed to create lease version.");
	if (tenancy.status === "PENDING") {
		validateTenancyTransition("PENDING", "LEASE_PREPARATION");
		await supabaseAdmin.from("tenancies").update({
			status: "LEASE_PREPARATION",
			start_date: data.startDate,
			end_date: data.endDate
		}).eq("id", data.tenancyId);
		await recordTenancyStatusHistory(data.tenancyId, "PENDING", "LEASE_PREPARATION", userId, "Draft lease prepared.");
	}
	await recordAuditEvent({
		actorId: userId,
		action: "LEASE_CREATED",
		resourceType: "lease",
		resourceId: lease.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		leaseId: lease.id
	};
});
var fnSendLease_createServerFn_handler = createServerRpc({
	id: "afd0fd6d885c75038d6e00f8f13c71428e7b0cfa9be1a78e29502e00cc627ebc",
	name: "fnSendLease",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnSendLease.__executeServer(opts));
var fnSendLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnSendLease_createServerFn_handler, async ({ data: leaseId, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: lease, error: lErr } = await supabaseAdmin.from("leases").select("*, tenancy:tenancies(*)").eq("id", leaseId).single();
	if (lErr || !lease) throw new AppError(ERROR_CODES.NOT_FOUND, "Lease record not found.");
	const tenancy = lease.tenancy;
	if (tenancy.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	validateLeaseTransition(lease.status, "SENT_TO_TENANT");
	validateTenancyTransition(tenancy.status, "AWAITING_ACCEPTANCE");
	await supabaseAdmin.from("leases").update({ status: "SENT_TO_TENANT" }).eq("id", leaseId);
	await supabaseAdmin.from("tenancies").update({ status: "AWAITING_ACCEPTANCE" }).eq("id", tenancy.id);
	await recordTenancyStatusHistory(tenancy.id, tenancy.status, "AWAITING_ACCEPTANCE", userId, "Lease draft sent to tenant for review.");
	await NotificationService.send({
		userId: tenancy.tenant_id,
		type: "TENANCY_STATUS_CHANGED",
		title: "Lease Ready for Review",
		content: `Your landlord has sent the lease terms for agreement ${tenancy.tenancy_reference}. Please review and sign.`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "LEASE_SENT",
		resourceType: "lease",
		resourceId: leaseId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnAcceptLease_createServerFn_handler = createServerRpc({
	id: "ff5f394bd444e1995d46f88c5ee63d5385301ccc91cff082822506a04617366c",
	name: "fnAcceptLease",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnAcceptLease.__executeServer(opts));
var fnAcceptLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AcceptLeaseSchema).handler(fnAcceptLease_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: lease, error: lErr } = await supabaseAdmin.from("leases").select("*, tenancy:tenancies(*)").eq("id", data.leaseId).single();
	if (lErr || !lease) throw new AppError(ERROR_CODES.NOT_FOUND, "Lease agreement version not found.");
	const tenancy = lease.tenancy;
	if (tenancy.tenant_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to sign this lease.");
	if (lease.status !== "SENT_TO_TENANT") throw new AppError(ERROR_CODES.BAD_REQUEST, "Lease agreement is not in a signable state.");
	validateLeaseTransition("SENT_TO_TENANT", "TENANT_ACCEPTED");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("leases").update({
		status: "TENANT_ACCEPTED",
		tenant_accepted_at: now,
		tenant_accepted_ip: meta.ipAddress,
		tenant_accepted_user_agent: meta.userAgent
	}).eq("id", data.leaseId);
	await NotificationService.send({
		userId: tenancy.provider_id,
		type: "TENANCY_STATUS_CHANGED",
		title: "Lease Signed by Tenant",
		content: `The tenant has accepted the lease terms for ${tenancy.tenancy_reference}. Please countersign to execute.`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "LEASE_ACCEPTED",
		resourceType: "lease",
		resourceId: data.leaseId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnDeclineLease_createServerFn_handler = createServerRpc({
	id: "36ea39fdd985c709b279d8875713bda4ea238dcf2adb997e0a1092393a499bd7",
	name: "fnDeclineLease",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnDeclineLease.__executeServer(opts));
var fnDeclineLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(DeclineLeaseSchema).handler(fnDeclineLease_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: lease, error: lErr } = await supabaseAdmin.from("leases").select("*, tenancy:tenancies(*)").eq("id", data.leaseId).single();
	if (lErr || !lease) throw new AppError(ERROR_CODES.NOT_FOUND, "Lease agreement version not found.");
	const tenancy = lease.tenancy;
	if (tenancy.tenant_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	if (lease.status !== "SENT_TO_TENANT") throw new AppError(ERROR_CODES.BAD_REQUEST, "Lease cannot be declined in the current status.");
	validateLeaseTransition("SENT_TO_TENANT", "DRAFT");
	validateTenancyTransition(tenancy.status, "LEASE_PREPARATION");
	await supabaseAdmin.from("leases").update({ status: "DRAFT" }).eq("id", data.leaseId);
	await supabaseAdmin.from("tenancies").update({ status: "LEASE_PREPARATION" }).eq("id", tenancy.id);
	await recordTenancyStatusHistory(tenancy.id, tenancy.status, "LEASE_PREPARATION", userId, `Correction requested by tenant: "${data.notes}"`);
	await NotificationService.send({
		userId: tenancy.provider_id,
		type: "TENANCY_STATUS_CHANGED",
		title: "Lease Correction Requested",
		content: `The tenant has requested updates for ${tenancy.tenancy_reference}: "${data.notes}"`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "LEASE_DECLINED",
		resourceType: "lease",
		resourceId: data.leaseId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnExecuteLease_createServerFn_handler = createServerRpc({
	id: "d043313d2edbfcebe3a59d08df66ce28434fe172da235f8892693d0ea73e51c7",
	name: "fnExecuteLease",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnExecuteLease.__executeServer(opts));
var fnExecuteLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnExecuteLease_createServerFn_handler, async ({ data: leaseId, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: lease, error: lErr } = await supabaseAdmin.from("leases").select("*, tenancy:tenancies(*)").eq("id", leaseId).single();
	if (lErr || !lease) throw new AppError(ERROR_CODES.NOT_FOUND, "Lease version not found.");
	const tenancy = lease.tenancy;
	if (tenancy.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	if (lease.status !== "TENANT_ACCEPTED") throw new AppError(ERROR_CODES.BAD_REQUEST, "Tenant has not accepted this lease version yet.");
	validateLeaseTransition("TENANT_ACCEPTED", "EXECUTED");
	validateTenancyTransition(tenancy.status, "ACTIVE");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("leases").update({
		status: "EXECUTED",
		provider_accepted_at: now,
		provider_accepted_ip: meta.ipAddress,
		provider_accepted_user_agent: meta.userAgent
	}).eq("id", leaseId);
	await supabaseAdmin.from("leases").update({ status: "TERMINATED" }).eq("tenancy_id", tenancy.id).neq("id", leaseId).eq("status", "EXECUTED");
	await supabaseAdmin.from("tenancies").update({
		status: "ACTIVE",
		activated_at: now,
		start_date: lease.start_date,
		end_date: lease.end_date,
		rent_snapshot: lease.rent_amount,
		deposit_snapshot: lease.deposit_amount
	}).eq("id", tenancy.id);
	await recordTenancyStatusHistory(tenancy.id, tenancy.status, "ACTIVE", userId, "Lease fully executed. Tenancy is now Active.");
	if (tenancy.unit_id) await supabaseAdmin.from("units").update({ status: "RESERVED" }).eq("id", tenancy.unit_id);
	await supabaseAdmin.from("listings").update({ status: "PAUSED" }).eq("id", tenancy.listing_id);
	const { data: conv } = await supabaseAdmin.from("conversations").select("id").eq("listing_id", tenancy.listing_id).eq("seeker_id", tenancy.tenant_id).eq("provider_id", tenancy.provider_id).maybeSingle();
	if (conv) await supabaseAdmin.from("messages").insert({
		conversation_id: conv.id,
		sender_id: userId,
		message_type: "LEASE_EXECUTED",
		content: `The lease agreement has been countersigned and executed! You can schedule move-in details.`,
		status: "SENT"
	});
	await NotificationService.send({
		userId: tenancy.tenant_id,
		type: "TENANCY_STATUS_CHANGED",
		title: "Lease Executed! 🎉",
		content: `The lease for ${tenancy.tenancy_reference} has been fully executed. Your tenancy is now active.`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "LEASE_EXECUTED",
		resourceType: "lease",
		resourceId: leaseId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnScheduleMoveIn_createServerFn_handler = createServerRpc({
	id: "244331cd3eeeb1d0276a0ea0fb0b477a6f5e171e6fb22d97add8a1d52a243423",
	name: "fnScheduleMoveIn",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnScheduleMoveIn.__executeServer(opts));
var fnScheduleMoveIn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ScheduleMoveInSchema).handler(fnScheduleMoveIn_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: tenancy, error: tenErr } = await supabaseAdmin.from("tenancies").select("id, provider_id, status, tenancy_reference, tenant_id").eq("id", data.tenancyId).single();
	if (tenErr || !tenancy) throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
	if (tenancy.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	if (tenancy.status === "ACTIVE") {
		validateTenancyTransition("ACTIVE", "MOVE_IN_PENDING");
		await supabaseAdmin.from("tenancies").update({ status: "MOVE_IN_PENDING" }).eq("id", data.tenancyId);
		await recordTenancyStatusHistory(data.tenancyId, "ACTIVE", "MOVE_IN_PENDING", userId, "Move-in schedule created.");
	}
	await supabaseAdmin.from("move_in_records").upsert({
		tenancy_id: data.tenancyId,
		scheduled_date: data.scheduledDate,
		status: "SCHEDULED"
	}, { onConflict: "tenancy_id" });
	await NotificationService.send({
		userId: tenancy.tenant_id,
		type: "TENANCY_STATUS_CHANGED",
		title: "Move-In Scheduled",
		content: `Your move-in inspection has been scheduled for ${new Date(data.scheduledDate).toLocaleString()}.`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "MOVE_IN_SCHEDULED",
		resourceType: "tenancy",
		resourceId: data.tenancyId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnCompleteMoveIn_createServerFn_handler = createServerRpc({
	id: "cb147a788f4e19070e17a98ca50cbd832ad216753fb60ff8684bc43ab36a799e",
	name: "fnCompleteMoveIn",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnCompleteMoveIn.__executeServer(opts));
var fnCompleteMoveIn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CompleteMoveInSchema).handler(fnCompleteMoveIn_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: tenancy, error: tenErr } = await supabaseAdmin.from("tenancies").select("*, move_in:move_in_records(*)").eq("id", data.tenancyId).single();
	if (tenErr || !tenancy) throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
	if (tenancy.provider_id !== userId && tenancy.tenant_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	if (tenancy.status !== "MOVE_IN_PENDING" && tenancy.status !== "ACTIVE") throw new AppError(ERROR_CODES.BAD_REQUEST, "Tenancy is not in move-in stage.");
	validateTenancyTransition(tenancy.status, "OCCUPIED");
	(/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("move_in_records").update({
		status: "COMPLETED",
		actual_date: data.actualDate,
		checklist: data.checklist,
		condition_notes: data.conditionNotes || null,
		condition_media: data.conditionMedia
	}).eq("tenancy_id", data.tenancyId);
	await supabaseAdmin.from("tenancies").update({ status: "OCCUPIED" }).eq("id", data.tenancyId);
	await recordTenancyStatusHistory(data.tenancyId, tenancy.status, "OCCUPIED", userId, "Move-in checklist completed. Unit occupied.");
	if (tenancy.unit_id) await supabaseAdmin.from("units").update({ status: "OCCUPIED" }).eq("id", tenancy.unit_id);
	await supabaseAdmin.from("listings").update({ status: "ARCHIVED" }).eq("id", tenancy.listing_id);
	const notificationRecipient = userId === tenancy.tenant_id ? tenancy.provider_id : tenancy.tenant_id;
	await NotificationService.send({
		userId: notificationRecipient,
		type: "TENANCY_STATUS_CHANGED",
		title: "Move-In Confirmed",
		content: `The move-in checklist was signed off. Unit is officially occupied.`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "MOVE_IN_COMPLETED",
		resourceType: "tenancy",
		resourceId: data.tenancyId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnEndTenancy_createServerFn_handler = createServerRpc({
	id: "e64dfafd689a4dd471ad097599af41263e53392a8b2e0f9fa979eed1d5ad6993",
	name: "fnEndTenancy",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnEndTenancy.__executeServer(opts));
var fnEndTenancy = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(EndTenancySchema).handler(fnEndTenancy_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: tenancy, error: tenErr } = await supabaseAdmin.from("tenancies").select("id, provider_id, tenant_id, status, unit_id, listing_id").eq("id", data.tenancyId).single();
	if (tenErr || !tenancy) throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
	if (tenancy.provider_id !== userId && !hasPermission(roles, "TENANCIES_MANAGE")) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	const nextStatus = data.reason === "LEASE_EXPIRED" || data.reason === "MUTUAL_END" ? "ENDED" : "TERMINATED";
	validateTenancyTransition(tenancy.status, nextStatus);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("tenancies").update({
		status: nextStatus,
		ended_at: now,
		termination_reason: data.reason,
		termination_notes: data.notes || null
	}).eq("id", data.tenancyId);
	await supabaseAdmin.from("leases").update({ status: "TERMINATED" }).eq("tenancy_id", data.tenancyId).eq("status", "EXECUTED");
	await recordTenancyStatusHistory(data.tenancyId, tenancy.status, nextStatus, userId, `Tenancy ended. Reason: ${data.reason}. ${data.notes || ""}`);
	if (tenancy.unit_id) await supabaseAdmin.from("units").update({ status: "AVAILABLE" }).eq("id", tenancy.unit_id);
	await NotificationService.send({
		userId: tenancy.tenant_id,
		type: "TENANCY_STATUS_CHANGED",
		title: "Tenancy Ended",
		content: `Your tenancy has been marked as ${nextStatus.toLowerCase()}.`,
		payload: { tenancyId: tenancy.id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: nextStatus === "ENDED" ? "TENANCY_ENDED" : "TENANCY_TERMINATED",
		resourceType: "tenancy",
		resourceId: data.tenancyId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnGetTenancyDetails_createServerFn_handler = createServerRpc({
	id: "73d7567969c1d5f1f8f036df8b967d304c71052f1273decab21cbee203949e72",
	name: "fnGetTenancyDetails",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnGetTenancyDetails.__executeServer(opts));
var fnGetTenancyDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnGetTenancyDetails_createServerFn_handler, async ({ data: tenancyId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { data: tenancy, error } = await supabaseAdmin.from("tenancies").select(`
        *,
        listings(title, price, currency, availability_date),
        properties(id, name, county, town, address, verification_status),
        unit:units(unit_number, bedrooms, bathrooms, floor),
        tenant:profiles!tenant_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified)
      `).eq("id", tenancyId).maybeSingle();
	if (error || !tenancy) throw new AppError(ERROR_CODES.NOT_FOUND, "Tenancy record not found.");
	const isTenant = tenancy.tenant_id === userId;
	const isProvider = tenancy.provider_id === userId;
	const isAdmin = hasPermission(roles, "TENANCIES_MANAGE");
	if (!isTenant && !isProvider && !isAdmin) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	const { data: leases } = await supabaseAdmin.from("leases").select("*").eq("tenancy_id", tenancyId).order("version", { ascending: false });
	const { data: moveIn } = await supabaseAdmin.from("move_in_records").select("*").eq("tenancy_id", tenancyId).maybeSingle();
	const { data: history } = await supabaseAdmin.from("tenancy_status_history").select("*").eq("tenancy_id", tenancyId).order("created_at", { ascending: true });
	return {
		tenancy,
		leases: leases || [],
		moveIn: moveIn || null,
		history: history || []
	};
});
var fnListTenantTenancies_createServerFn_handler = createServerRpc({
	id: "bad55de409f6f1a0f6fb1c7efe37348ef5ef07a11403e2ae980da23bde43b32b",
	name: "fnListTenantTenancies",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnListTenantTenancies.__executeServer(opts));
var fnListTenantTenancies = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListTenantTenancies_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { data, error } = await supabaseAdmin.from("tenancies").select(`
        *,
        listings(title, price, currency),
        properties(name, county, town, address),
        unit:units(unit_number)
      `).eq("tenant_id", userId).order("updated_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve tenancies.");
	return data;
});
var fnProviderListTenancies_createServerFn_handler = createServerRpc({
	id: "1dcd9471995c7aba88f9314f325cb3b3894456d009735fcc331ac96c69cfa022",
	name: "fnProviderListTenancies",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnProviderListTenancies.__executeServer(opts));
var fnProviderListTenancies = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	status: stringType().optional(),
	propertyId: stringType().uuid().optional()
}).optional()).handler(fnProviderListTenancies_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "TENANCIES_MANAGE");
	let query = supabaseAdmin.from("tenancies").select(`
        *,
        listings(title, price, currency),
        properties(name, county, town, address),
        unit:units(unit_number),
        tenant:profiles!tenant_id(full_name, phone_number, identity_verified)
      `).eq("provider_id", userId).order("created_at", { ascending: false });
	if (data?.status) query = query.eq("status", data.status);
	if (data?.propertyId) query = query.eq("property_id", data.propertyId);
	const { data: list, error } = await query;
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve provider tenancies.");
	return list;
});
var fnGetSecureTenancyDocUrl_createServerFn_handler = createServerRpc({
	id: "5a8cfeb8e1a1e7da08a8365b0d86e41e1bd8e2a8f3975d96ece0568f69aaaab3",
	name: "fnGetSecureTenancyDocUrl",
	filename: "src/features/tenancies/tenancies.functions.ts"
}, (opts) => fnGetSecureTenancyDocUrl.__executeServer(opts));
var fnGetSecureTenancyDocUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType()).handler(fnGetSecureTenancyDocUrl_createServerFn_handler, async ({ data: filePath, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { data: leases, error: lErr } = await supabaseAdmin.from("leases").select("*, tenancy:tenancies(*)").eq("file_path", filePath).limit(1);
	if (lErr || !leases || leases.length === 0) throw new AppError(ERROR_CODES.NOT_FOUND, "Lease document record not found.");
	const tenancy = leases[0].tenancy;
	const isTenant = tenancy.tenant_id === userId;
	const isProvider = tenancy.provider_id === userId;
	if (!(isTenant || isProvider || hasPermission(roles, "TENANCIES_MANAGE"))) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to view this document.");
	const { data, error } = await supabaseAdmin.storage.from("tenancy_documents").createSignedUrl(filePath, 900);
	if (error || !data) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to generate download URL.");
	return { url: data.signedUrl };
});
//#endregion
export { fnAcceptLease_createServerFn_handler, fnCompleteMoveIn_createServerFn_handler, fnCreateTenancy_createServerFn_handler, fnDeclineLease_createServerFn_handler, fnEndTenancy_createServerFn_handler, fnExecuteLease_createServerFn_handler, fnGetSecureTenancyDocUrl_createServerFn_handler, fnGetTenancyDetails_createServerFn_handler, fnListTenantTenancies_createServerFn_handler, fnPrepareLease_createServerFn_handler, fnProviderListTenancies_createServerFn_handler, fnScheduleMoveIn_createServerFn_handler, fnSendLease_createServerFn_handler };
