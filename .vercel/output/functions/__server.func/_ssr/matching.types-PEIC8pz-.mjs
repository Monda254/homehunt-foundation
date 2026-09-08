import { a as enumType, c as objectType, d as stringType, i as coerce, n as arrayType, r as booleanType, t as anyType, u as recordType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matching.types-PEIC8pz-.js
var PRIORITY_LEVELS = [
	"CRITICAL",
	"HIGH",
	"MEDIUM",
	"LOW"
];
var AMENITY_PRIORITY_LEVELS = [
	"MUST_HAVE",
	"PREFERRED",
	"OPTIONAL"
];
var LocationPreferenceSchema = objectType({
	county: stringType().min(1, "County is required"),
	town: stringType().optional(),
	neighborhood: stringType().optional(),
	estate: stringType().optional(),
	priority: enumType(PRIORITY_LEVELS).default("HIGH")
});
var AmenityPreferenceSchema = objectType({
	amenity: stringType().min(1, "Amenity name is required"),
	priority: enumType(AMENITY_PRIORITY_LEVELS).default("PREFERRED")
});
var PriorityWeightsSchema = objectType({
	budget: enumType(PRIORITY_LEVELS).default("CRITICAL"),
	location: enumType(PRIORITY_LEVELS).default("CRITICAL"),
	bedrooms: enumType(PRIORITY_LEVELS).default("HIGH"),
	bathrooms: enumType(PRIORITY_LEVELS).default("MEDIUM"),
	amenities: enumType(PRIORITY_LEVELS).default("MEDIUM"),
	propertyType: enumType(PRIORITY_LEVELS).default("HIGH")
});
var UserPreferencesInputSchema = objectType({
	minBudget: coerce.number().nonnegative().optional(),
	maxBudget: coerce.number().nonnegative().optional(),
	preferredBudget: coerce.number().nonnegative().optional(),
	propertyTypes: arrayType(stringType()).default([]),
	bedrooms: coerce.number().int().nonnegative().optional(),
	bedroomsRule: enumType([
		"MIN",
		"MAX",
		"EXACT"
	]).default("MIN"),
	bathrooms: coerce.number().nonnegative().optional(),
	bathroomsRule: enumType([
		"MIN",
		"MAX",
		"EXACT"
	]).default("MIN"),
	moveInDate: stringType().optional(),
	preferredLocations: arrayType(LocationPreferenceSchema).default([]),
	amenities: arrayType(AmenityPreferenceSchema).default([]),
	furnishingPreference: enumType([
		"FURNISHED",
		"SEMI-FURNISHED",
		"UNFURNISHED",
		"ANY"
	]).default("ANY"),
	priorityWeights: PriorityWeightsSchema.default({}),
	useBehavioralPersonalization: booleanType().default(true)
});
var RecommendationFeedbackSchema = objectType({
	listingId: stringType().uuid(),
	feedbackType: enumType([
		"LIKE",
		"SAVE",
		"DISLIKE",
		"HIDE",
		"NOT_RELEVANT"
	])
});
var SaveSearchSchema = objectType({
	name: stringType().min(1, "Name is required").max(100),
	criteria: recordType(anyType())
});
var DEFAULT_PRIORITY_SCORES = {
	CRITICAL: 40,
	HIGH: 25,
	MEDIUM: 15,
	LOW: 10
};
//#endregion
export { UserPreferencesInputSchema as i, RecommendationFeedbackSchema as n, SaveSearchSchema as r, DEFAULT_PRIORITY_SCORES as t };
