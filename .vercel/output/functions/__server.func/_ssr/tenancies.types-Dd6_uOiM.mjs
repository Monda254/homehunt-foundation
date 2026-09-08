import { a as enumType, c as objectType, d as stringType, n as arrayType, r as booleanType, s as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenancies.types-Dd6_uOiM.js
var TERMINATION_REASONS = [
	"LEASE_EXPIRED",
	"MUTUAL_END",
	"TERMINATION",
	"OTHER"
];
var CreateTenancySchema = objectType({ applicationId: stringType().uuid() });
var PrepareLeaseSchema = objectType({
	tenancyId: stringType().uuid(),
	rentAmount: numberType().positive("Rent must be greater than zero"),
	depositAmount: numberType().nonnegative("Deposit must be non-negative"),
	startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
	endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
	terms: objectType({
		petsPolicy: stringType().optional(),
		utilitiesResponsibility: stringType().optional(),
		noticePeriodDays: numberType().int().nonnegative().optional(),
		occupancyLimit: numberType().int().positive().optional(),
		permittedUse: stringType().optional(),
		otherRules: stringType().optional()
	}).optional().default({})
});
var AcceptLeaseSchema = objectType({ leaseId: stringType().uuid() });
var DeclineLeaseSchema = objectType({
	leaseId: stringType().uuid(),
	notes: stringType().min(5, "Reason for correction must be at least 5 characters")
});
var ScheduleMoveInSchema = objectType({
	tenancyId: stringType().uuid(),
	scheduledDate: stringType().datetime("Invalid ISO date format")
});
var CompleteMoveInSchema = objectType({
	tenancyId: stringType().uuid(),
	actualDate: stringType().datetime("Invalid ISO date format"),
	checklist: objectType({
		keysReceived: booleanType(),
		accessConfirmed: booleanType(),
		conditionDocumented: booleanType(),
		utilityInfoProvided: booleanType()
	}),
	conditionNotes: stringType().optional(),
	conditionMedia: arrayType(stringType()).optional().default([])
});
var EndTenancySchema = objectType({
	tenancyId: stringType().uuid(),
	reason: enumType(TERMINATION_REASONS),
	notes: stringType().optional()
});
//#endregion
export { EndTenancySchema as a, TERMINATION_REASONS as c, DeclineLeaseSchema as i, CompleteMoveInSchema as n, PrepareLeaseSchema as o, CreateTenancySchema as r, ScheduleMoveInSchema as s, AcceptLeaseSchema as t };
