import { a as getRequest, i as createServerFn } from "./server-BRCrXnf-.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-C5p6KfDB.mjs";
import { c as objectType, d as stringType } from "../_libs/zod.mjs";
import { n as supabaseAdmin$1 } from "./client.server-Ma94aMcQ.mjs";
import { a as resolveRequestId } from "./request-id-Du7XsDoM.mjs";
import { a as requirePermission, t as hasPermission } from "./roles-BzUNBgvo.mjs";
import { a as RecordDecisionSchema, c as RespondToRequestSchema, l as SubmitApplicationSchema, o as RecordReviewSchema, s as RequestAdditionalInfoSchema, t as CreateApplicationSchema, u as UpdateDraftSchema } from "./applications.types-D4vWVnj3.mjs";
import { t as createServerRpc } from "./createServerRpc-QTbvBIhf.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-Bceddfrr.mjs";
import { t as NotificationService } from "./notifications.server-Dtdxn9Il.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications.functions-CzsJkLa4.js
var supabaseAdmin = supabaseAdmin$1;
function getContextMeta() {
	const request = getRequest();
	return {
		requestId: resolveRequestId(request?.headers),
		meta: auditMetadataFromRequest(request)
	};
}
var VALID_TRANSITIONS = {
	DRAFT: ["SUBMITTED", "WITHDRAWN"],
	SUBMITTED: ["UNDER_REVIEW", "WITHDRAWN"],
	UNDER_REVIEW: [
		"ADDITIONAL_INFORMATION_REQUIRED",
		"SHORTLISTED",
		"APPROVED",
		"REJECTED",
		"WITHDRAWN"
	],
	ADDITIONAL_INFORMATION_REQUIRED: ["RESUBMITTED", "WITHDRAWN"],
	RESUBMITTED: ["UNDER_REVIEW", "WITHDRAWN"],
	SHORTLISTED: [
		"APPROVED",
		"REJECTED",
		"WITHDRAWN"
	],
	APPROVED: ["WITHDRAWN"],
	REJECTED: [],
	WITHDRAWN: [],
	EXPIRED: []
};
function validateStatusTransition(current, next) {
	if (!(VALID_TRANSITIONS[current] || []).includes(next)) throw new AppError(ERROR_CODES.BAD_REQUEST, `Invalid application status transition from '${current}' to '${next}'.`);
}
async function recordStatusHistory(applicationId, previousStatus, newStatus, changedBy, notes) {
	await supabaseAdmin.from("application_status_history").insert({
		application_id: applicationId,
		previous_status: previousStatus,
		new_status: newStatus,
		changed_by: changedBy,
		notes: notes || null
	});
}
async function checkEligibilityAndFetchListing(listingId, userId) {
	const { data: listing, error: listingErr } = await supabaseAdmin.from("listings").select("*, properties(id, owner_user_id, status, verification_status)").eq("id", listingId).maybeSingle();
	if (listingErr || !listing) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing reference not found.");
	if (listing.status !== "PUBLISHED") throw new AppError(ERROR_CODES.BAD_REQUEST, "This listing is currently not active or accepting applications.");
	const prop = listing.properties;
	if (!prop) throw new AppError(ERROR_CODES.BAD_REQUEST, "Property reference associated with listing not found.");
	if (prop.owner_user_id === userId) throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot apply for your own properties or listings.");
	return listing;
}
var fnCreateApplicationDraft_createServerFn_handler = createServerRpc({
	id: "4b0c8762b2bc6b0447537a24ac90989a91fc54241ac1158c8adedea8b90070c7",
	name: "fnCreateApplicationDraft",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnCreateApplicationDraft.__executeServer(opts));
var fnCreateApplicationDraft = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateApplicationSchema).handler(fnCreateApplicationDraft_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const listing = await checkEligibilityAndFetchListing(data.listingId, userId);
	const prop = listing.properties;
	const { data: activeApp } = await supabaseAdmin.from("rental_applications").select("id, status").eq("listing_id", data.listingId).eq("applicant_id", userId).in("status", [
		"DRAFT",
		"SUBMITTED",
		"UNDER_REVIEW",
		"ADDITIONAL_INFORMATION_REQUIRED",
		"RESUBMITTED",
		"SHORTLISTED",
		"APPROVED"
	]).maybeSingle();
	if (activeApp) throw new AppError(ERROR_CODES.BAD_REQUEST, `You already have an active application (${activeApp.status}) for this listing.`);
	const { data: app, error: appErr } = await supabaseAdmin.from("rental_applications").insert({
		listing_id: data.listingId,
		property_id: prop.id,
		unit_id: data.unitId || null,
		applicant_id: userId,
		provider_id: prop.owner_user_id,
		status: "DRAFT",
		rent_snapshot: listing.price,
		currency_snapshot: listing.currency,
		billing_period_snapshot: listing.billing_period || "MONTHLY",
		deposit_snapshot: listing.deposit_amount || listing.price
	}).select().single();
	if (appErr || !app) throw new AppError(ERROR_CODES.BAD_REQUEST, appErr?.message || "Failed to initialize application draft.");
	await recordStatusHistory(app.id, null, "DRAFT", userId, "Draft created.");
	await recordAuditEvent({
		actorId: userId,
		action: "APPLICATION_DRAFT_CREATED",
		resourceType: "rental_application",
		resourceId: app.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		applicationId: app.id
	};
});
var fnUpdateApplicationDraft_createServerFn_handler = createServerRpc({
	id: "2c435c5e4fd11087fd4412d124cb974a88b79b4c9904f2ef9bed0b15e8ae7114",
	name: "fnUpdateApplicationDraft",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnUpdateApplicationDraft.__executeServer(opts));
var fnUpdateApplicationDraft = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateDraftSchema).handler(fnUpdateApplicationDraft_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { data: app, error: findErr } = await supabaseAdmin.from("rental_applications").select("id, applicant_id, status").eq("id", data.id).single();
	if (findErr || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Application draft not found.");
	if (app.applicant_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You do not own this application.");
	if (app.status !== "DRAFT") throw new AppError(ERROR_CODES.BAD_REQUEST, "Only applications in DRAFT status can be modified.");
	const { error: updateErr } = await supabaseAdmin.from("rental_applications").update({
		preferred_move_in_date: data.preferredMoveInDate,
		preferred_lease_months: data.preferredLeaseMonths,
		personal_info: data.personalInfo,
		employment_info: data.employmentInfo,
		household_info: data.householdInfo
	}).eq("id", data.id);
	if (updateErr) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update draft values.");
	return { success: true };
});
var fnSubmitApplication_createServerFn_handler = createServerRpc({
	id: "585661b2c70b6c7c985ae25b72bd253b3d05893ba772e2533d8dfe12f5e66c73",
	name: "fnSubmitApplication",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnSubmitApplication.__executeServer(opts));
var fnSubmitApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitApplicationSchema).handler(fnSubmitApplication_createServerFn_handler, async ({ data: applicationId, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: app, error: findErr } = await supabaseAdmin.from("rental_applications").select("*, listings(title, status)").eq("id", applicationId).single();
	if (findErr || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Application draft not found.");
	if (app.applicant_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You do not own this application.");
	if (app.status !== "DRAFT") throw new AppError(ERROR_CODES.BAD_REQUEST, "This application has already been submitted.");
	const info = app.personal_info;
	const emp = app.employment_info;
	const house = app.household_info;
	if (!info.fullName || !info.phoneNumber || !info.email) throw new AppError(ERROR_CODES.BAD_REQUEST, "Personal contact information is incomplete.");
	if (!emp.status || !emp.incomeRange) throw new AppError(ERROR_CODES.BAD_REQUEST, "Employment and income profile details are incomplete.");
	if (!house.adults) throw new AppError(ERROR_CODES.BAD_REQUEST, "Household occupancy detail is incomplete.");
	const { data: listingInfo } = await supabaseAdmin.from("listings").select("viewing_required").eq("id", app.listing_id).maybeSingle();
	if (listingInfo?.viewing_required) {
		const { data: viewings } = await supabaseAdmin.from("viewings").select("id").eq("listing_id", app.listing_id).eq("seeker_id", userId).eq("status", "COMPLETED");
		if (!viewings || viewings.length === 0) throw new AppError(ERROR_CODES.BAD_REQUEST, "A completed viewing is required before submitting this application.");
	}
	const { data: reqs } = await supabaseAdmin.from("application_requirements").select("id").eq("property_id", app.property_id).eq("is_required", true).eq("is_active", true);
	if (reqs && reqs.length > 0) {
		const { data: docs } = await supabaseAdmin.from("application_documents").select("requirement_id").eq("application_id", applicationId);
		const uploadedReqIds = new Set((docs || []).map((d) => d.requirement_id));
		if (reqs.filter((r) => !uploadedReqIds.has(r.id)).length > 0) throw new AppError(ERROR_CODES.BAD_REQUEST, "All required verification documents must be uploaded before submission.");
	}
	const now = (/* @__PURE__ */ new Date()).toISOString();
	validateStatusTransition("DRAFT", "SUBMITTED");
	const { error: updateErr } = await supabaseAdmin.from("rental_applications").update({
		status: "SUBMITTED",
		submitted_at: now,
		updated_at: now
	}).eq("id", applicationId);
	if (updateErr) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to submit rental application.");
	await recordStatusHistory(applicationId, "DRAFT", "SUBMITTED", userId, "Application submitted.");
	let { data: conv } = await supabaseAdmin.from("conversations").select("id").eq("listing_id", app.listing_id).eq("seeker_id", userId).eq("provider_id", app.provider_id).maybeSingle();
	if (!conv) {
		const { data: newConv } = await supabaseAdmin.from("conversations").insert({
			property_id: app.property_id,
			listing_id: app.listing_id,
			unit_id: app.unit_id || null,
			seeker_id: userId,
			provider_id: app.provider_id,
			status: "ACTIVE"
		}).select().single();
		conv = newConv;
	}
	if (conv) {
		await supabaseAdmin.from("messages").insert({
			conversation_id: conv.id,
			sender_id: userId,
			message_type: "APPLICATION_SUBMITTED",
			content: `I have submitted my rental application: Reference number is ${app.application_number || "HH-APP-" + applicationId}.`,
			status: "SENT"
		});
		await supabaseAdmin.from("conversations").update({ updated_at: now }).eq("id", conv.id);
	}
	await NotificationService.send({
		userId: app.provider_id,
		type: "APPLICATION_SUBMITTED",
		title: "New Application Received",
		content: `You received a new application for ${app.listings?.title || "Property"}. Reference: ${app.application_number || "HH-APP-" + applicationId}`,
		payload: {
			applicationId,
			conversationId: conv?.id
		}
	});
	await recordAuditEvent({
		actorId: userId,
		action: "APPLICATION_SUBMITTED",
		resourceType: "rental_application",
		resourceId: applicationId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnWithdrawApplication_createServerFn_handler = createServerRpc({
	id: "ae8dc5f84687f91002627944062522199afd6f160daaec4e24d6145cb1e63773",
	name: "fnWithdrawApplication",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnWithdrawApplication.__executeServer(opts));
var fnWithdrawApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnWithdrawApplication_createServerFn_handler, async ({ data: applicationId, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: app, error: findErr } = await supabaseAdmin.from("rental_applications").select("id, applicant_id, provider_id, status, application_number").eq("id", applicationId).single();
	if (findErr || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Application record not found.");
	if (app.applicant_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You do not own this application.");
	validateStatusTransition(app.status, "WITHDRAWN");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("rental_applications").update({
		status: "WITHDRAWN",
		updated_at: now
	}).eq("id", applicationId);
	await recordStatusHistory(applicationId, app.status, "WITHDRAWN", userId, "Application withdrawn by seeker.");
	await NotificationService.send({
		userId: app.provider_id,
		type: "APPLICATION_STATUS_CHANGED",
		title: "Application Withdrawn",
		content: `The applicant has withdrawn application ${app.application_number}.`,
		payload: { applicationId }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "APPLICATION_WITHDRAWN",
		resourceType: "rental_application",
		resourceId: applicationId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnProviderReviewApplication_createServerFn_handler = createServerRpc({
	id: "4b5695ffeaf94265fe346f01044d687c06abcd7f6e311dc74da986a41f847d50",
	name: "fnProviderReviewApplication",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnProviderReviewApplication.__executeServer(opts));
var fnProviderReviewApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RecordReviewSchema).handler(fnProviderReviewApplication_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "APPLICATIONS_MANAGE");
	const { requestId, meta } = getContextMeta();
	const { data: app, error: findErr } = await supabaseAdmin.from("rental_applications").select("id, status, provider_id, applicant_id").eq("id", data.applicationId).single();
	if (findErr || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Application not found.");
	if (app.provider_id !== userId && !hasPermission(roles, "ADMIN_VIEW_USERS")) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to review this application.");
	if (app.status === "SUBMITTED" || app.status === "RESUBMITTED") {
		validateStatusTransition(app.status, "UNDER_REVIEW");
		await supabaseAdmin.from("rental_applications").update({
			status: "UNDER_REVIEW",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", data.applicationId);
		await recordStatusHistory(data.applicationId, app.status, "UNDER_REVIEW", userId, "Review started.");
	}
	await supabaseAdmin.from("application_reviews").insert({
		application_id: data.applicationId,
		reviewer_id: userId,
		recommendation: data.recommendation,
		notes: data.notes || null
	});
	if (data.recommendation === "SHORTLIST" && app.status !== "SHORTLISTED") {
		validateStatusTransition("UNDER_REVIEW", "SHORTLISTED");
		await supabaseAdmin.from("rental_applications").update({
			status: "SHORTLISTED",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", data.applicationId);
		await recordStatusHistory(data.applicationId, "UNDER_REVIEW", "SHORTLISTED", userId, "Applicant shortlisted.");
		await NotificationService.send({
			userId: app.applicant_id,
			type: "APPLICATION_STATUS_CHANGED",
			title: "Application Shortlisted!",
			content: `Your rental application has been shortlisted. The provider is reviewing details.`,
			payload: { applicationId: app.id }
		});
	}
	await recordAuditEvent({
		actorId: userId,
		action: "APPLICATION_REVIEWED",
		resourceType: "rental_application",
		resourceId: data.applicationId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnProviderRequestInformation_createServerFn_handler = createServerRpc({
	id: "5fa8e8190bf36a4dd5744154a6f29d4ce5041343612ff5a35a5148bee31f1209",
	name: "fnProviderRequestInformation",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnProviderRequestInformation.__executeServer(opts));
var fnProviderRequestInformation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RequestAdditionalInfoSchema).handler(fnProviderRequestInformation_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "APPLICATIONS_MANAGE");
	const { requestId, meta } = getContextMeta();
	const { data: app, error: findErr } = await supabaseAdmin.from("rental_applications").select("id, status, provider_id, applicant_id, application_number").eq("id", data.applicationId).single();
	if (findErr || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Application not found.");
	if (app.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	validateStatusTransition(app.status, "ADDITIONAL_INFORMATION_REQUIRED");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { data: req } = await supabaseAdmin.from("application_requirements").insert({
		property_id: app.property_id,
		listing_id: app.listing_id,
		name: data.requirementName,
		description: data.message,
		type: "DOCUMENT",
		is_required: true,
		is_active: true
	}).select().single();
	await supabaseAdmin.from("application_requests").insert({
		application_id: data.applicationId,
		requester_id: userId,
		recipient_id: app.applicant_id,
		requirement_id: req?.id || null,
		message: data.message,
		status: "OPEN",
		due_date: data.dueDate || null
	});
	await supabaseAdmin.from("rental_applications").update({
		status: "ADDITIONAL_INFORMATION_REQUIRED",
		updated_at: now
	}).eq("id", data.applicationId);
	await recordStatusHistory(data.applicationId, app.status, "ADDITIONAL_INFORMATION_REQUIRED", userId, `Info request: ${data.message}`);
	await NotificationService.send({
		userId: app.applicant_id,
		type: "APPLICATION_INFO_REQUEST",
		title: "Information Required",
		content: `The provider has requested additional details: "${data.message}"`,
		payload: { applicationId: app.id }
	});
	const { data: conv } = await supabaseAdmin.from("conversations").select("id").eq("listing_id", app.listing_id).eq("seeker_id", app.applicant_id).eq("provider_id", userId).maybeSingle();
	if (conv) await supabaseAdmin.from("messages").insert({
		conversation_id: conv.id,
		sender_id: userId,
		message_type: "APPLICATION_INFO_REQUEST",
		content: `I have requested additional information for your application: "${data.message}"`,
		status: "SENT"
	});
	await recordAuditEvent({
		actorId: userId,
		action: "APPLICATION_INFO_REQUESTED",
		resourceType: "rental_application",
		resourceId: data.applicationId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnRespondToInformationRequest_createServerFn_handler = createServerRpc({
	id: "4fe2f130b7d78c8da8c96649b381abe4779b4ac3a641fe3667e47c622038925d",
	name: "fnRespondToInformationRequest",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnRespondToInformationRequest.__executeServer(opts));
var fnRespondToInformationRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RespondToRequestSchema).handler(fnRespondToInformationRequest_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: request, error: reqErr } = await supabaseAdmin.from("application_requests").select("*, rental_applications(status, provider_id, property_id, listing_id)").eq("id", data.requestId).single();
	if (reqErr || !request) throw new AppError(ERROR_CODES.NOT_FOUND, "Information request not found.");
	if (request.recipient_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not the recipient.");
	const app = request.rental_applications;
	if (app.status !== "ADDITIONAL_INFORMATION_REQUIRED") throw new AppError(ERROR_CODES.BAD_REQUEST, "The application is not in the required information state.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	if (data.documents && data.documents.length > 0) {
		const docRows = data.documents.map((d) => ({
			application_id: request.application_id,
			requirement_id: d.requirementId || request.requirement_id,
			name: d.name,
			file_path: d.filePath,
			file_size: d.fileSize,
			mime_type: d.mimeType,
			status: "UPLOADED"
		}));
		await supabaseAdmin.from("application_documents").insert(docRows);
	}
	await supabaseAdmin.from("application_requests").update({
		status: "RESPONDED",
		updated_at: now
	}).eq("id", data.requestId);
	validateStatusTransition("ADDITIONAL_INFORMATION_REQUIRED", "RESUBMITTED");
	await supabaseAdmin.from("rental_applications").update({
		status: "RESUBMITTED",
		updated_at: now
	}).eq("id", request.application_id);
	await recordStatusHistory(request.application_id, "ADDITIONAL_INFORMATION_REQUIRED", "RESUBMITTED", userId, `Responded: ${data.message}`);
	await NotificationService.send({
		userId: app.provider_id,
		type: "APPLICATION_STATUS_CHANGED",
		title: "Information Response Received",
		content: `The applicant has submitted the requested information: "${data.message}"`,
		payload: { applicationId: request.application_id }
	});
	await recordAuditEvent({
		actorId: userId,
		action: "APPLICATION_INFO_PROVIDED",
		resourceType: "rental_application",
		resourceId: request.application_id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnProviderRecordDecision_createServerFn_handler = createServerRpc({
	id: "ce9a3d2e70db03e51edeb2d1079a9cc07aa67160f74d1f6660743117646fc827",
	name: "fnProviderRecordDecision",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnProviderRecordDecision.__executeServer(opts));
var fnProviderRecordDecision = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RecordDecisionSchema).handler(fnProviderRecordDecision_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "APPLICATIONS_MANAGE");
	const { requestId, meta } = getContextMeta();
	const { data: app, error: findErr } = await supabaseAdmin.from("rental_applications").select("id, status, provider_id, applicant_id, application_number").eq("id", data.applicationId).single();
	if (findErr || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Application not found.");
	if (app.provider_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized.");
	const nextStatus = {
		APPROVE: "APPROVED",
		REJECT: "REJECTED",
		SHORTLIST: "SHORTLISTED"
	}[data.action];
	validateStatusTransition(app.status, nextStatus);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const updateFields = {
		status: nextStatus,
		decided_at: now,
		decided_by: userId,
		updated_at: now
	};
	if (nextStatus === "REJECTED") {
		updateFields.rejection_reason = data.rejectionReason || "OTHER";
		updateFields.rejection_notes = data.rejectionNotes || null;
	}
	await supabaseAdmin.from("rental_applications").update(updateFields).eq("id", data.applicationId);
	await recordStatusHistory(data.applicationId, app.status, nextStatus, userId, nextStatus === "REJECTED" ? `Rejected. Reason: ${data.rejectionReason}` : "Approved.");
	const decisionTitle = nextStatus === "APPROVED" ? "Application Approved! 🎉" : "Application Decision Update";
	const decisionContent = nextStatus === "APPROVED" ? `Your application ${app.application_number} has been approved. The provider will contact you shortly to coordinate lease details.` : `We regret to inform you that your application ${app.application_number} was not selected. Reason: ${data.rejectionReason || "Requirements not met"}`;
	await NotificationService.send({
		userId: app.applicant_id,
		type: "APPLICATION_STATUS_CHANGED",
		title: decisionTitle,
		content: decisionContent,
		payload: { applicationId: app.id }
	});
	const { data: conv } = await supabaseAdmin.from("conversations").select("id").eq("listing_id", app.listing_id).eq("seeker_id", app.applicant_id).eq("provider_id", userId).maybeSingle();
	if (conv) await supabaseAdmin.from("messages").insert({
		conversation_id: conv.id,
		sender_id: userId,
		message_type: "APPLICATION_STATUS_CHANGED",
		content: `Application decision has been posted: ${nextStatus}. Notes: ${data.rejectionNotes || "None."}`,
		status: "SENT"
	});
	await recordAuditEvent({
		actorId: userId,
		action: nextStatus === "APPROVED" ? "APPLICATION_APPROVED" : "APPLICATION_REJECTED",
		resourceType: "rental_application",
		resourceId: data.applicationId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnGetApplicationDetails_createServerFn_handler = createServerRpc({
	id: "90f7e50daaaeccabbf26a88c5ec129a809d57d596c4e2b591f579419bdc22018",
	name: "fnGetApplicationDetails",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnGetApplicationDetails.__executeServer(opts));
var fnGetApplicationDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnGetApplicationDetails_createServerFn_handler, async ({ data: applicationId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { data: app, error } = await supabaseAdmin.from("rental_applications").select(`
        *,
        listings(title, price, currency, availability_date),
        properties(name, county, town, address, verification_status),
        applicant:profiles!applicant_id(full_name, phone_number, identity_verified),
        provider:profiles!provider_id(full_name, phone_number, identity_verified)
      `).eq("id", applicationId).maybeSingle();
	if (error || !app) throw new AppError(ERROR_CODES.NOT_FOUND, "Application record not found.");
	const isApplicant = app.applicant_id === userId;
	const isProvider = app.provider_id === userId;
	const isAdmin = hasPermission(roles, "ADMIN_VIEW_USERS") || hasPermission(roles, "VERIFICATION_VIEW");
	if (!isApplicant && !isProvider && !isAdmin) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to view this application.");
	const { data: documents } = await supabaseAdmin.from("application_documents").select("*, requirement:application_requirements(*)").eq("application_id", applicationId);
	const { data: requests } = await supabaseAdmin.from("application_requests").select("*, requirement:application_requirements(*)").eq("application_id", applicationId).order("created_at", { ascending: false });
	const { data: history } = await supabaseAdmin.from("application_status_history").select("*").eq("application_id", applicationId).order("created_at", { ascending: true });
	let reviews = [];
	if (isProvider || isAdmin) {
		const { data: revList } = await supabaseAdmin.from("application_reviews").select("*, reviewer:profiles!reviewer_id(full_name)").eq("application_id", applicationId).order("created_at", { ascending: false });
		reviews = revList || [];
	}
	return {
		application: app,
		documents: documents || [],
		requests: requests || [],
		history: history || [],
		reviews
	};
});
var fnListApplicantApplications_createServerFn_handler = createServerRpc({
	id: "f230a71fb04e49c4cea59a782336f4583100f8816adc8041ac449029f8d30e54",
	name: "fnListApplicantApplications",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnListApplicantApplications.__executeServer(opts));
var fnListApplicantApplications = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListApplicantApplications_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { data, error } = await supabaseAdmin.from("rental_applications").select(`
        *,
        listings(title, price, currency),
        properties(name, county, town, address)
      `).eq("applicant_id", userId).order("updated_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve applications.");
	return data;
});
var fnProviderListApplications_createServerFn_handler = createServerRpc({
	id: "d196c19cbb2b000b394d33a3434915a3764faac580f146122551204933f27614",
	name: "fnProviderListApplications",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnProviderListApplications.__executeServer(opts));
var fnProviderListApplications = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	status: stringType().optional(),
	listingId: stringType().uuid().optional()
}).optional()).handler(fnProviderListApplications_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "APPLICATIONS_MANAGE");
	let query = supabaseAdmin.from("rental_applications").select(`
        *,
        listings(title, price, currency),
        properties(name, county, town, address),
        applicant:profiles!applicant_id(full_name, phone_number, identity_verified)
      `).eq("provider_id", userId).order("created_at", { ascending: false });
	if (data?.status) query = query.eq("status", data.status);
	if (data?.listingId) query = query.eq("listing_id", data.listingId);
	const { data: list, error } = await query;
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve provider applications.");
	return list;
});
var fnGetSecureApplicationDocUrl_createServerFn_handler = createServerRpc({
	id: "1f0671104ef12c462ce6f8ab491d140998f4d7889c770fd36bfe5d7783e754b1",
	name: "fnGetSecureApplicationDocUrl",
	filename: "src/features/applications/applications.functions.ts"
}, (opts) => fnGetSecureApplicationDocUrl.__executeServer(opts));
var fnGetSecureApplicationDocUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType()).handler(fnGetSecureApplicationDocUrl_createServerFn_handler, async ({ data: filePath, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { data: doc, error: findErr } = await supabaseAdmin.from("application_documents").select("*, rental_applications(applicant_id, provider_id)").eq("file_path", filePath).maybeSingle();
	if (findErr || !doc) throw new AppError(ERROR_CODES.NOT_FOUND, "Document record not found.");
	const app = doc.rental_applications;
	const isApplicant = app.applicant_id === userId;
	const isProvider = app.provider_id === userId;
	if (!(isApplicant || isProvider || hasPermission(roles, "ADMIN_VIEW_USERS") || hasPermission(roles, "VERIFICATION_VIEW"))) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to view this document.");
	const { data, error } = await supabaseAdmin.storage.from("application_documents").createSignedUrl(filePath, 900);
	if (error || !data) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to generate download URL.");
	return { url: data.signedUrl };
});
//#endregion
export { fnCreateApplicationDraft_createServerFn_handler, fnGetApplicationDetails_createServerFn_handler, fnGetSecureApplicationDocUrl_createServerFn_handler, fnListApplicantApplications_createServerFn_handler, fnProviderListApplications_createServerFn_handler, fnProviderRecordDecision_createServerFn_handler, fnProviderRequestInformation_createServerFn_handler, fnProviderReviewApplication_createServerFn_handler, fnRespondToInformationRequest_createServerFn_handler, fnSubmitApplication_createServerFn_handler, fnUpdateApplicationDraft_createServerFn_handler, fnWithdrawApplication_createServerFn_handler };
