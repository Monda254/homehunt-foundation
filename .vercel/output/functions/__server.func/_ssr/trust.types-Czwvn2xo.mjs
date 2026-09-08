import { a as enumType, c as objectType, d as stringType, n as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trust.types-Czwvn2xo.js
var SubmitVerificationSchema = objectType({
	subjectType: enumType([
		"USER",
		"PROPERTY",
		"LISTING"
	]),
	subjectId: stringType().uuid(),
	verificationType: enumType([
		"IDENTITY",
		"PROPERTY_OWNERSHIP",
		"PROPERTY_EXISTENCE",
		"LISTING",
		"CONTACT",
		"AGENT",
		"LANDLORD"
	]),
	evidence: arrayType(objectType({
		evidenceType: stringType().min(2).max(100),
		storageReference: stringType().min(5)
	})).min(1, "At least one piece of evidence is required")
});
var ReviewVerificationSchema = objectType({
	id: stringType().uuid(),
	status: enumType([
		"VERIFIED",
		"REJECTED",
		"UNDER_REVIEW"
	]),
	rejectionReason: stringType().optional()
});
var RevokeVerificationSchema = objectType({
	id: stringType().uuid(),
	revocationReason: stringType().min(5, "Reason must be at least 5 characters long")
});
var SubmitClaimSchema = objectType({
	propertyId: stringType().uuid(),
	evidence: arrayType(objectType({
		evidenceType: stringType().min(2).max(100),
		storageReference: stringType().min(5)
	})).min(1, "At least one piece of ownership evidence is required")
});
var ResolveClaimSchema = objectType({
	id: stringType().uuid(),
	action: enumType(["APPROVE", "REJECT"]),
	rejectionReason: stringType().optional()
});
var SubmitReportSchema = objectType({
	listingId: stringType().uuid(),
	reason: enumType([
		"WRONG_PRICE",
		"PROPERTY_UNAVAILABLE",
		"FAKE_LISTING",
		"WRONG_LOCATION",
		"MISLEADING_PHOTOS",
		"DUPLICATE_LISTING",
		"SUSPICIOUS_PAYMENT_REQUEST",
		"IMPERSONATION",
		"OTHER"
	]),
	description: stringType().max(1e3).optional()
});
var ResolveReportSchema = objectType({
	id: stringType().uuid(),
	action: enumType([
		"RESOLVE",
		"DISMISS",
		"ESCALATE"
	]),
	resolution: stringType().optional()
});
var SubmitAppealSchema = objectType({
	targetType: enumType([
		"VERIFICATION",
		"LISTING_SUSPENSION",
		"PROPERTY_CLAIM"
	]),
	targetId: stringType().uuid(),
	reason: stringType().min(10, "Reason must be at least 10 characters long").max(1e3)
});
var ResolveAppealSchema = objectType({
	id: stringType().uuid(),
	action: enumType(["UPHELD", "REVERSED"]),
	notes: stringType().optional()
});
//#endregion
export { RevokeVerificationSchema as a, SubmitReportSchema as c, ReviewVerificationSchema as i, SubmitVerificationSchema as l, ResolveClaimSchema as n, SubmitAppealSchema as o, ResolveReportSchema as r, SubmitClaimSchema as s, ResolveAppealSchema as t };
