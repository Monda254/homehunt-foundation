import { a as enumType, c as objectType, d as stringType, n as arrayType, r as booleanType, s as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications.types-D4vWVnj3.js
var EMPLOYMENT_STATUSES = [
	"EMPLOYED",
	"SELF_EMPLOYED",
	"UNEMPLOYED",
	"STUDENT"
];
var INCOME_RANGES = [
	"Below KES 25,000",
	"KES 25,000 - 50,000",
	"KES 50,000 - 100,000",
	"KES 100,000 - 200,000",
	"Above KES 200,000"
];
var REJECTION_REASONS = [
	"REQUIREMENTS_NOT_MET",
	"DOCUMENTATION_INCOMPLETE",
	"PROPERTY_NO_LONGER_AVAILABLE",
	"APPLICATION_WITHDRAWN",
	"OTHER"
];
var CreateApplicationSchema = objectType({
	listingId: stringType().uuid(),
	unitId: stringType().uuid().optional().nullable()
});
var UpdateDraftSchema = objectType({
	id: stringType().uuid(),
	preferredMoveInDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().nullable(),
	preferredLeaseMonths: numberType().int().min(1).max(60).optional().nullable(),
	personalInfo: objectType({
		fullName: stringType().min(2, "Full name must be at least 2 characters").optional(),
		phoneNumber: stringType().min(10, "Invalid phone number").optional(),
		email: stringType().email("Invalid email address").optional()
	}).optional(),
	employmentInfo: objectType({
		status: enumType(EMPLOYMENT_STATUSES).optional(),
		employer: stringType().optional(),
		occupation: stringType().optional(),
		incomeRange: enumType(INCOME_RANGES).optional(),
		employmentDuration: stringType().optional()
	}).optional(),
	householdInfo: objectType({
		adults: numberType().int().min(1).max(10).optional(),
		children: numberType().int().min(0).max(10).optional(),
		pets: booleanType().optional(),
		additionalOccupants: stringType().optional()
	}).optional()
});
var SubmitApplicationSchema = stringType().uuid();
var RespondToRequestSchema = objectType({
	requestId: stringType().uuid(),
	message: stringType().min(5, "Response message must be at least 5 characters"),
	documents: arrayType(objectType({
		requirementId: stringType().uuid().optional().nullable(),
		name: stringType(),
		filePath: stringType(),
		fileSize: numberType().int(),
		mimeType: stringType()
	})).optional()
});
var RequestAdditionalInfoSchema = objectType({
	applicationId: stringType().uuid(),
	requirementName: stringType().min(2, "Requirement name must be defined"),
	message: stringType().min(5, "Request message must be at least 5 characters"),
	dueDate: stringType().datetime().optional().nullable()
});
var RecordReviewSchema = objectType({
	applicationId: stringType().uuid(),
	recommendation: enumType([
		"APPROVE",
		"REJECT",
		"SHORTLIST",
		"HOLD"
	]),
	notes: stringType().optional()
});
var RecordDecisionSchema = objectType({
	applicationId: stringType().uuid(),
	action: enumType([
		"APPROVE",
		"REJECT",
		"SHORTLIST"
	]),
	rejectionReason: enumType(REJECTION_REASONS).optional().nullable(),
	rejectionNotes: stringType().optional().nullable()
});
//#endregion
export { RecordDecisionSchema as a, RespondToRequestSchema as c, REJECTION_REASONS as i, SubmitApplicationSchema as l, EMPLOYMENT_STATUSES as n, RecordReviewSchema as o, INCOME_RANGES as r, RequestAdditionalInfoSchema as s, CreateApplicationSchema as t, UpdateDraftSchema as u };
