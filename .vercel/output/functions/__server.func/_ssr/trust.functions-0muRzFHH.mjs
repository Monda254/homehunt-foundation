import { a as getRequest, i as createServerFn } from "./server-BRCrXnf-.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-C5p6KfDB.mjs";
import { a as enumType, c as objectType, d as stringType } from "../_libs/zod.mjs";
import { n as supabaseAdmin$1 } from "./client.server-Ma94aMcQ.mjs";
import { a as resolveRequestId } from "./request-id-Du7XsDoM.mjs";
import { a as requirePermission, t as hasPermission } from "./roles-BzUNBgvo.mjs";
import { a as RevokeVerificationSchema, c as SubmitReportSchema, i as ReviewVerificationSchema, l as SubmitVerificationSchema, n as ResolveClaimSchema, o as SubmitAppealSchema, r as ResolveReportSchema, s as SubmitClaimSchema, t as ResolveAppealSchema } from "./trust.types-Czwvn2xo.mjs";
import { t as createServerRpc } from "./createServerRpc-QTbvBIhf.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-Bceddfrr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trust.functions-0muRzFHH.js
var supabaseAdmin = supabaseAdmin$1;
function getContextMeta() {
	const request = getRequest();
	return {
		requestId: resolveRequestId(request?.headers),
		meta: auditMetadataFromRequest(request)
	};
}
var fnSubmitVerificationRequest_createServerFn_handler = createServerRpc({
	id: "41dd480e819857d3e903a22511e161a1c442fc863702785c7b5e6e0aca34f095",
	name: "fnSubmitVerificationRequest",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnSubmitVerificationRequest.__executeServer(opts));
var fnSubmitVerificationRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitVerificationSchema).handler(fnSubmitVerificationRequest_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: active } = await supabaseAdmin.from("verifications").select("id, status").eq("subject_id", data.subjectId).eq("verification_type", data.verificationType).in("status", [
		"PENDING",
		"UNDER_REVIEW",
		"VERIFIED"
	]).maybeSingle();
	if (active) throw new AppError(ERROR_CODES.BAD_REQUEST, `An active or pending verification of type '${data.verificationType}' already exists for this subject.`);
	const { data: verification, error: verErr } = await supabaseAdmin.from("verifications").insert({
		subject_type: data.subjectType,
		subject_id: data.subjectId,
		verification_type: data.verificationType,
		status: "PENDING"
	}).select().single();
	if (verErr || !verification) throw new AppError(ERROR_CODES.BAD_REQUEST, verErr?.message || "Failed to create verification request.");
	const evidenceRows = data.evidence.map((doc) => ({
		verification_id: verification.id,
		evidence_type: doc.evidenceType,
		storage_reference: doc.storageReference,
		submitted_by: userId
	}));
	const { error: evErr } = await supabaseAdmin.from("verification_evidence").insert(evidenceRows);
	if (evErr) {
		await supabaseAdmin.from("verifications").delete().eq("id", verification.id);
		throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to save verification evidence documents.");
	}
	await supabaseAdmin.from("verification_history").insert({
		verification_id: verification.id,
		status: "PENDING",
		changed_by: userId,
		notes: "Verification request submitted by user."
	});
	await recordAuditEvent({
		actorId: userId,
		action: "VERIFICATION_SUBMITTED",
		resourceType: "verification",
		resourceId: verification.id,
		afterData: {
			subjectType: data.subjectType,
			verificationType: data.verificationType
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		verificationId: verification.id
	};
});
var fnListVerificationRequests_createServerFn_handler = createServerRpc({
	id: "b60715f8823214fe399b57482fd889ee07301b9ed84c05cafbadd4458fb6707b",
	name: "fnListVerificationRequests",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnListVerificationRequests.__executeServer(opts));
var fnListVerificationRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListVerificationRequests_createServerFn_handler, async ({ context }) => {
	const { claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "VERIFICATION_VIEW");
	const { data, error } = await supabaseAdmin.from("verifications").select("*, verification_evidence(*)").order("submitted_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve verification requests.");
	return data;
});
var fnReviewVerificationRequest_createServerFn_handler = createServerRpc({
	id: "2626d48ec92a07be09f3249b067f486104edcd4a1f1202c26d619c1ab9d8bd12",
	name: "fnReviewVerificationRequest",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnReviewVerificationRequest.__executeServer(opts));
var fnReviewVerificationRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ReviewVerificationSchema).handler(fnReviewVerificationRequest_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	if (data.status === "VERIFIED") requirePermission(roles, "VERIFICATION_APPROVE");
	else requirePermission(roles, "VERIFICATION_REVIEW");
	const { data: ver, error: findErr } = await supabaseAdmin.from("verifications").select("*").eq("id", data.id).single();
	if (findErr || !ver) throw new AppError(ERROR_CODES.NOT_FOUND, "Verification request not found.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const expiresAt = data.status === "VERIFIED" ? new Date(Date.now() + 31536e6).toISOString() : null;
	const { error: updateErr } = await supabaseAdmin.from("verifications").update({
		status: data.status,
		reviewed_at: now,
		reviewed_by: userId,
		rejection_reason: data.rejectionReason || null,
		expires_at: expiresAt,
		updated_at: now
	}).eq("id", data.id);
	if (updateErr) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to update verification status.");
	await supabaseAdmin.from("verification_history").insert({
		verification_id: ver.id,
		status: data.status,
		changed_by: userId,
		notes: data.rejectionReason || "Verification reviewed by moderator."
	});
	if (data.status === "VERIFIED") {
		if (ver.subject_type === "USER") {
			if (ver.verification_type === "IDENTITY") await supabaseAdmin.from("profiles").update({ identity_verified: true }).eq("id", ver.subject_id);
			else if (ver.verification_type === "AGENT") await supabaseAdmin.from("profiles").update({ agent_verified: true }).eq("id", ver.subject_id);
		} else if (ver.subject_type === "PROPERTY") await supabaseAdmin.from("properties").update({ verification_status: "VERIFIED" }).eq("id", ver.subject_id);
		else if (ver.subject_type === "LISTING") await supabaseAdmin.from("listings").update({
			verification_status: "VERIFIED",
			last_verified_at: now
		}).eq("id", ver.subject_id);
	} else if (data.status === "REJECTED") {
		if (ver.subject_type === "USER") {
			if (ver.verification_type === "IDENTITY") await supabaseAdmin.from("profiles").update({ identity_verified: false }).eq("id", ver.subject_id);
			else if (ver.verification_type === "AGENT") await supabaseAdmin.from("profiles").update({ agent_verified: false }).eq("id", ver.subject_id);
		} else if (ver.subject_type === "PROPERTY") await supabaseAdmin.from("properties").update({ verification_status: "REJECTED" }).eq("id", ver.subject_id);
		else if (ver.subject_type === "LISTING") await supabaseAdmin.from("listings").update({ verification_status: "REJECTED" }).eq("id", ver.subject_id);
	}
	const evidenceStatus = data.status === "VERIFIED" ? "APPROVED" : "REJECTED";
	await supabaseAdmin.from("verification_evidence").update({
		status: evidenceStatus,
		review_notes: data.rejectionReason || null
	}).eq("verification_id", ver.id);
	await recordAuditEvent({
		actorId: userId,
		action: data.status === "VERIFIED" ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
		resourceType: "verification",
		resourceId: ver.id,
		afterData: { status: data.status },
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnRevokeVerification_createServerFn_handler = createServerRpc({
	id: "5ceb9193bef12cd0bc5684f0faf0a1ec7ac978d745ea5c071814b9e21125a949",
	name: "fnRevokeVerification",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnRevokeVerification.__executeServer(opts));
var fnRevokeVerification = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RevokeVerificationSchema).handler(fnRevokeVerification_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "VERIFICATION_REJECT");
	const { requestId, meta } = getContextMeta();
	const { data: ver, error: findErr } = await supabaseAdmin.from("verifications").select("*").eq("id", data.id).single();
	if (findErr || !ver) throw new AppError(ERROR_CODES.NOT_FOUND, "Verification record not found.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("verifications").update({
		status: "REVOKED",
		revocation_reason: data.revocationReason,
		updated_at: now
	}).eq("id", data.id);
	await supabaseAdmin.from("verification_history").insert({
		verification_id: ver.id,
		status: "REVOKED",
		changed_by: userId,
		notes: data.revocationReason
	});
	if (ver.subject_type === "USER") {
		if (ver.verification_type === "IDENTITY") await supabaseAdmin.from("profiles").update({ identity_verified: false }).eq("id", ver.subject_id);
		else if (ver.verification_type === "AGENT") await supabaseAdmin.from("profiles").update({ agent_verified: false }).eq("id", ver.subject_id);
	} else if (ver.subject_type === "PROPERTY") await supabaseAdmin.from("properties").update({ verification_status: "REVOKED" }).eq("id", ver.subject_id);
	else if (ver.subject_type === "LISTING") await supabaseAdmin.from("listings").update({ verification_status: "REVOKED" }).eq("id", ver.subject_id);
	await recordAuditEvent({
		actorId: userId,
		action: "VERIFICATION_REVOKED",
		resourceType: "verification",
		resourceId: ver.id,
		afterData: { revocationReason: data.revocationReason },
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnSubmitPropertyClaim_createServerFn_handler = createServerRpc({
	id: "b0211eb2256a8673a7e8c299905467b6447df21dbbbf0b72973e348f582c6a11",
	name: "fnSubmitPropertyClaim",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnSubmitPropertyClaim.__executeServer(opts));
var fnSubmitPropertyClaim = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitClaimSchema).handler(fnSubmitPropertyClaim_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: conflicting } = await supabaseAdmin.from("property_claims").select("id, status, user_id").eq("property_id", data.propertyId).in("status", ["PENDING", "APPROVED"]).maybeSingle();
	if (conflicting) {
		if (conflicting.status === "APPROVED") await supabaseAdmin.from("risk_flags").insert({
			subject_type: "PROPERTY",
			subject_id: data.propertyId,
			risk_type: "CONFLICTING_CLAIM",
			severity: "HIGH",
			status: "OPEN"
		});
		throw new AppError(ERROR_CODES.BAD_REQUEST, "A property claim has already been submitted for this asset. Conflict has been flagged for admin review.");
	}
	const { data: claim, error: claimErr } = await supabaseAdmin.from("property_claims").insert({
		property_id: data.propertyId,
		user_id: userId,
		status: "PENDING"
	}).select().single();
	if (claimErr || !claim) throw new AppError(ERROR_CODES.BAD_REQUEST, claimErr?.message || "Failed to create property claim.");
	const { data: ver, error: verErr } = await supabaseAdmin.from("verifications").insert({
		subject_type: "PROPERTY",
		subject_id: data.propertyId,
		verification_type: "PROPERTY_OWNERSHIP",
		status: "PENDING"
	}).select().single();
	if (verErr || !ver) {
		await supabaseAdmin.from("property_claims").delete().eq("id", claim.id);
		throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to create ownership verification request.");
	}
	const evidenceRows = data.evidence.map((doc) => ({
		verification_id: ver.id,
		evidence_type: doc.evidenceType,
		storage_reference: doc.storageReference,
		submitted_by: userId
	}));
	await supabaseAdmin.from("verification_evidence").insert(evidenceRows);
	await supabaseAdmin.from("verification_history").insert({
		verification_id: ver.id,
		status: "PENDING",
		changed_by: userId,
		notes: "Property ownership claim submitted with evidence documents."
	});
	await recordAuditEvent({
		actorId: userId,
		action: "PROPERTY_CLAIMED",
		resourceType: "property_claim",
		resourceId: claim.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		claimId: claim.id
	};
});
var fnListPropertyClaims_createServerFn_handler = createServerRpc({
	id: "5bd295bd8ff5646c5facccba8421e9989442891d00d0eecd722a6166b387a78e",
	name: "fnListPropertyClaims",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnListPropertyClaims.__executeServer(opts));
var fnListPropertyClaims = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListPropertyClaims_createServerFn_handler, async ({ context }) => {
	const { claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "CLAIMS_VIEW");
	const { data, error } = await supabaseAdmin.from("property_claims").select("*, properties(name), profiles(full_name, phone_number)").order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to list property claims.");
	return data;
});
var fnResolvePropertyClaim_createServerFn_handler = createServerRpc({
	id: "585f13336d9377f217ab7170c1ffa22e993c0b416a98ec1c01b3733932916f73",
	name: "fnResolvePropertyClaim",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnResolvePropertyClaim.__executeServer(opts));
var fnResolvePropertyClaim = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ResolveClaimSchema).handler(fnResolvePropertyClaim_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "CLAIMS_RESOLVE");
	const { requestId, meta } = getContextMeta();
	const { data: claim, error: findErr } = await supabaseAdmin.from("property_claims").select("*").eq("id", data.id).single();
	if (findErr || !claim) throw new AppError(ERROR_CODES.NOT_FOUND, "Claim record not found.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const claimStatus = data.action === "APPROVE" ? "APPROVED" : "REJECTED";
	const { error: updateErr } = await supabaseAdmin.from("property_claims").update({
		status: claimStatus,
		rejection_reason: data.rejectionReason || null,
		resolved_at: now,
		resolved_by: userId,
		updated_at: now
	}).eq("id", claim.id);
	if (updateErr) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to resolve property claim.");
	const { data: ver } = await supabaseAdmin.from("verifications").select("id").eq("subject_id", claim.property_id).eq("verification_type", "PROPERTY_OWNERSHIP").eq("status", "PENDING").maybeSingle();
	if (ver) {
		const verStatus = data.action === "APPROVE" ? "VERIFIED" : "REJECTED";
		await supabaseAdmin.from("verifications").update({
			status: verStatus,
			reviewed_at: now,
			reviewed_by: userId,
			rejection_reason: data.rejectionReason || null,
			expires_at: data.action === "APPROVE" ? new Date(Date.now() + 31536e6).toISOString() : null,
			updated_at: now
		}).eq("id", ver.id);
		await supabaseAdmin.from("verification_history").insert({
			verification_id: ver.id,
			status: verStatus,
			changed_by: userId,
			notes: data.rejectionReason || "Ownership claim verified by admin."
		});
		await supabaseAdmin.from("properties").update({ verification_status: verStatus }).eq("id", claim.property_id);
	}
	if (data.action === "APPROVE") await supabaseAdmin.from("property_parties").insert({
		property_id: claim.property_id,
		user_id: claim.user_id,
		relationship_type: "OWNER",
		status: "ACTIVE"
	}).onConflict("(property_id, user_id, relationship_type)").doUpdate({ set: {
		status: "ACTIVE",
		updated_at: now
	} });
	await recordAuditEvent({
		actorId: userId,
		action: data.action === "APPROVE" ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
		resourceType: "property_claim",
		resourceId: claim.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnReportListing_createServerFn_handler = createServerRpc({
	id: "0e786c6011152195a98585f5dec880d00132dd06b6823b3c8a6cabc1d930a163",
	name: "fnReportListing",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnReportListing.__executeServer(opts));
var fnReportListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitReportSchema).handler(fnReportListing_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const oneHourAgo = (/* @__PURE__ */ new Date(Date.now() - 36e5)).toISOString();
	const { count } = await supabaseAdmin.from("listing_reports").select("id", {
		count: "exact",
		head: true
	}).eq("reporter_id", userId).gte("created_at", oneHourAgo);
	if (count && count >= 5) throw new AppError(ERROR_CODES.BAD_REQUEST, "Rate limit exceeded: You have submitted too many reports recently. Please try again later.");
	const { data: report, error } = await supabaseAdmin.from("listing_reports").insert({
		reporter_id: userId,
		listing_id: data.listingId,
		reason: data.reason,
		description: data.description || null,
		status: "OPEN"
	}).select().single();
	if (error || !report) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to submit listing report.");
	const { count: reportCount } = await supabaseAdmin.from("listing_reports").select("id", {
		count: "exact",
		head: true
	}).eq("listing_id", data.listingId).eq("status", "OPEN");
	if (reportCount && reportCount >= 3) await supabaseAdmin.from("risk_flags").insert({
		subject_type: "LISTING",
		subject_id: data.listingId,
		risk_type: "REPEATED_REPORTS",
		severity: "MEDIUM",
		status: "OPEN"
	});
	await recordAuditEvent({
		actorId: userId,
		action: "REPORT_SUBMITTED",
		resourceType: "listing_report",
		resourceId: report.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		reportId: report.id
	};
});
var fnListListingReports_createServerFn_handler = createServerRpc({
	id: "ef79135d8647eb3867da30a2c19981b6a62200644fd6905e4c6d8b48e5ce24bf",
	name: "fnListListingReports",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnListListingReports.__executeServer(opts));
var fnListListingReports = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListListingReports_createServerFn_handler, async ({ context }) => {
	const { claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "REPORTS_VIEW");
	const { data, error } = await supabaseAdmin.from("listing_reports").select("*, listings(title)").order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve listing reports.");
	return data;
});
var fnResolveListingReport_createServerFn_handler = createServerRpc({
	id: "893125ba4acec3bb2db8a9cd497de0b836accaaa26b45253826162d2ae3c0f6e",
	name: "fnResolveListingReport",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnResolveListingReport.__executeServer(opts));
var fnResolveListingReport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ResolveReportSchema).handler(fnResolveListingReport_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "REPORTS_RESOLVE");
	const { requestId, meta } = getContextMeta();
	const { data: report, error: findErr } = await supabaseAdmin.from("listing_reports").select("*").eq("id", data.id).single();
	if (findErr || !report) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing report not found.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const reportStatus = data.action === "RESOLVE" ? "RESOLVED" : data.action === "ESCALATE" ? "ESCALATED" : "DISMISSED";
	await supabaseAdmin.from("listing_reports").update({
		status: reportStatus,
		resolution: data.resolution || null,
		resolved_at: now,
		resolved_by: userId,
		updated_at: now
	}).eq("id", report.id);
	if (data.action === "RESOLVE") await supabaseAdmin.from("listings").update({
		status: "PAUSED",
		updated_at: now
	}).eq("id", report.listing_id);
	await recordAuditEvent({
		actorId: userId,
		action: "REPORT_RESOLVED",
		resourceType: "listing_report",
		resourceId: report.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnConfirmListingFreshness_createServerFn_handler = createServerRpc({
	id: "f7265560705a0b548bfbab9f2ef8cb787d974c4c9954d9fc260fae475fd57f6d",
	name: "fnConfirmListingFreshness",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnConfirmListingFreshness.__executeServer(opts));
var fnConfirmListingFreshness = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnConfirmListingFreshness_createServerFn_handler, async ({ data: listingId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: listing, error: findErr } = await supabaseAdmin.from("listings").select("*, properties(owner_user_id)").eq("id", listingId).single();
	if (findErr || !listing) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
	const prop = listing.properties;
	if (!(hasPermission(roles, "LISTING_UPDATE") || listing.created_by_user_id === userId || prop?.owner_user_id === userId)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You do not have permission to revalidate this listing.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("listings").update({
		freshness_status: "CURRENT",
		last_verified_at: now,
		price_confirmed_at: now,
		availability_confirmed_at: now,
		updated_at: now
	}).eq("id", listingId);
	await recordAuditEvent({
		actorId: userId,
		action: "LISTING_REVALIDATED",
		resourceType: "listing",
		resourceId: listingId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnSubmitModerationAppeal_createServerFn_handler = createServerRpc({
	id: "3d3d2ae17c3a3628cc7102843015cae8588a037730c1c72ac780ae5e0a89db80",
	name: "fnSubmitModerationAppeal",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnSubmitModerationAppeal.__executeServer(opts));
var fnSubmitModerationAppeal = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitAppealSchema).handler(fnSubmitModerationAppeal_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: appeal, error } = await supabaseAdmin.from("moderation_appeals").insert({
		user_id: userId,
		target_type: data.targetType,
		target_id: data.targetId,
		reason: data.reason,
		status: "APPEAL_SUBMITTED"
	}).select().single();
	if (error || !appeal) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to submit appeal.");
	await recordAuditEvent({
		actorId: userId,
		action: "APPEAL_SUBMITTED",
		resourceType: "moderation_appeal",
		resourceId: appeal.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		appealId: appeal.id
	};
});
var fnListModerationAppeals_createServerFn_handler = createServerRpc({
	id: "44ab52f7db4e597d2b7d7f53d773b388fd3c022b0707230fd65dc3bb51711b64",
	name: "fnListModerationAppeals",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnListModerationAppeals.__executeServer(opts));
var fnListModerationAppeals = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListModerationAppeals_createServerFn_handler, async ({ context }) => {
	const { claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "APPEALS_VIEW");
	const { data, error } = await supabaseAdmin.from("moderation_appeals").select("*, profiles(full_name, phone_number)").order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve appeals.");
	return data;
});
var fnResolveModerationAppeal_createServerFn_handler = createServerRpc({
	id: "ac2fcd14bd7f37226d59d8ff2e64f4935e03b6426ce358a835142257e269a9ea",
	name: "fnResolveModerationAppeal",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnResolveModerationAppeal.__executeServer(opts));
var fnResolveModerationAppeal = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ResolveAppealSchema).handler(fnResolveModerationAppeal_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "APPEALS_RESOLVE");
	const { requestId, meta } = getContextMeta();
	const { data: appeal, error: findErr } = await supabaseAdmin.from("moderation_appeals").select("*").eq("id", data.id).single();
	if (findErr || !appeal) throw new AppError(ERROR_CODES.NOT_FOUND, "Appeal not found.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const appealStatus = data.action === "UPHELD" ? "UPHELD" : "REVERSED";
	await supabaseAdmin.from("moderation_appeals").update({
		status: appealStatus,
		notes: data.notes || null,
		resolved_at: now,
		resolved_by: userId,
		updated_at: now
	}).eq("id", appeal.id);
	if (data.action === "REVERSED") {
		if (appeal.target_type === "VERIFICATION") {
			await supabaseAdmin.from("verifications").update({
				status: "VERIFIED",
				updated_at: now
			}).eq("id", appeal.target_id);
			const { data: ver } = await supabaseAdmin.from("verifications").select("*").eq("id", appeal.target_id).single();
			if (ver) {
				if (ver.subject_type === "USER") await supabaseAdmin.from("profiles").update({ identity_verified: true }).eq("id", ver.subject_id);
				else if (ver.subject_type === "PROPERTY") await supabaseAdmin.from("properties").update({ verification_status: "VERIFIED" }).eq("id", ver.subject_id);
				else if (ver.subject_type === "LISTING") await supabaseAdmin.from("listings").update({ verification_status: "VERIFIED" }).eq("id", ver.subject_id);
			}
		} else if (appeal.target_type === "LISTING_SUSPENSION") await supabaseAdmin.from("listings").update({
			status: "PUBLISHED",
			updated_at: now
		}).eq("id", appeal.target_id);
		else if (appeal.target_type === "PROPERTY_CLAIM") {
			await supabaseAdmin.from("property_claims").update({
				status: "APPROVED",
				updated_at: now
			}).eq("id", appeal.target_id);
			const { data: claim } = await supabaseAdmin.from("property_claims").select("*").eq("id", appeal.target_id).single();
			if (claim) await supabaseAdmin.from("property_parties").insert({
				property_id: claim.property_id,
				user_id: claim.user_id,
				relationship_type: "OWNER",
				status: "ACTIVE"
			});
		}
	}
	await recordAuditEvent({
		actorId: userId,
		action: "APPEAL_RESOLVED",
		resourceType: "moderation_appeal",
		resourceId: appeal.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnListRiskFlags_createServerFn_handler = createServerRpc({
	id: "e28d824d263a551eb534ec5e05371a0d634839b62fa9fe1977b77a3ab0700168",
	name: "fnListRiskFlags",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnListRiskFlags.__executeServer(opts));
var fnListRiskFlags = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListRiskFlags_createServerFn_handler, async ({ context }) => {
	const { claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "RISK_VIEW");
	const { data, error } = await supabaseAdmin.from("risk_flags").select("*").order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve risk flags.");
	return data;
});
var fnResolveRiskFlag_createServerFn_handler = createServerRpc({
	id: "840641032e3cc44fe1d42fbd9f7c5e8869f2679b0dae76892484e0f20c8c4306",
	name: "fnResolveRiskFlag",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnResolveRiskFlag.__executeServer(opts));
var fnResolveRiskFlag = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	id: stringType().uuid(),
	status: enumType(["RESOLVED", "DISMISSED"])
})).handler(fnResolveRiskFlag_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	requirePermission(roles, "RISK_RESOLVE");
	const { requestId, meta } = getContextMeta();
	const { data: flag, error: findErr } = await supabaseAdmin.from("risk_flags").select("*").eq("id", data.id).single();
	if (findErr || !flag) throw new AppError(ERROR_CODES.NOT_FOUND, "Risk flag not found.");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await supabaseAdmin.from("risk_flags").update({
		status: data.status,
		resolved_at: now,
		resolved_by: userId
	}).eq("id", flag.id);
	await recordAuditEvent({
		actorId: userId,
		action: "RISK_FLAG_RESOLVED",
		resourceType: "risk_flag",
		resourceId: flag.id,
		afterData: { status: data.status },
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnGetSecureEvidenceUrl_createServerFn_handler = createServerRpc({
	id: "93bbc74e35786875e1e4a1afc7973873bb2d93a13e5575b7914dcb0748de4805",
	name: "fnGetSecureEvidenceUrl",
	filename: "src/features/properties/trust.functions.ts"
}, (opts) => fnGetSecureEvidenceUrl.__executeServer(opts));
var fnGetSecureEvidenceUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType()).handler(fnGetSecureEvidenceUrl_createServerFn_handler, async ({ data: storageReference, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const isOwner = storageReference.split("/")[0] === userId;
	const isReviewer = public_is_reviewer(roles) || isPlatformAdmin(roles);
	if (!isOwner && !isReviewer) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You are not authorized to view this document.");
	const { data, error } = await supabaseAdmin.storage.from("verification_evidence").createSignedUrl(storageReference, 900);
	if (error || !data) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to sign document URL.");
	return { signedUrl: data.signedUrl };
});
function public_is_reviewer(roles) {
	return roles.includes("verifier") || roles.includes("admin") || roles.includes("super_admin");
}
function isPlatformAdmin(roles) {
	return roles.includes("admin") || roles.includes("super_admin");
}
//#endregion
export { fnConfirmListingFreshness_createServerFn_handler, fnGetSecureEvidenceUrl_createServerFn_handler, fnListListingReports_createServerFn_handler, fnListModerationAppeals_createServerFn_handler, fnListPropertyClaims_createServerFn_handler, fnListRiskFlags_createServerFn_handler, fnListVerificationRequests_createServerFn_handler, fnReportListing_createServerFn_handler, fnResolveListingReport_createServerFn_handler, fnResolveModerationAppeal_createServerFn_handler, fnResolvePropertyClaim_createServerFn_handler, fnResolveRiskFlag_createServerFn_handler, fnReviewVerificationRequest_createServerFn_handler, fnRevokeVerification_createServerFn_handler, fnSubmitModerationAppeal_createServerFn_handler, fnSubmitPropertyClaim_createServerFn_handler, fnSubmitVerificationRequest_createServerFn_handler };
