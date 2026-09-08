import { a as enumType, c as objectType, d as stringType, i as coerce, l as preprocessType, n as arrayType, r as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search.types-M7Ux6mOs.js
var PropertyTypeEnum = enumType([
	"APARTMENT",
	"HOUSE",
	"BEDSITTER",
	"STUDIO",
	"MAISONETTE",
	"TOWNHOUSE",
	"VILLA",
	"BUNGALOW",
	"ROOM",
	"SHARED_ACCOMMODATION",
	"OTHER"
]);
var UnitTypeEnum = enumType([
	"BEDSITTER",
	"STUDIO",
	"ONE_BEDROOM",
	"TWO_BEDROOM",
	"THREE_BEDROOM",
	"FOUR_PLUS_BEDROOM",
	"ROOM",
	"SHARED",
	"HOUSE",
	"OTHER"
]);
var SearchListingsSchema = objectType({
	q: stringType().optional(),
	county: stringType().optional(),
	town: stringType().optional(),
	neighborhood: stringType().optional(),
	estate: stringType().optional(),
	minPrice: coerce.number().nonnegative().optional(),
	maxPrice: coerce.number().nonnegative().optional(),
	propertyType: PropertyTypeEnum.optional(),
	unitType: UnitTypeEnum.optional(),
	bedrooms: coerce.number().nonnegative().optional(),
	bathrooms: coerce.number().nonnegative().optional(),
	amenities: arrayType(stringType()).default([]),
	availabilityDate: stringType().optional(),
	verifiedOnly: preprocessType((val) => val === "true" || val === true, booleanType()).optional(),
	bounds: objectType({
		north: coerce.number(),
		south: coerce.number(),
		east: coerce.number(),
		west: coerce.number()
	}).optional(),
	sort: enumType([
		"NEWEST",
		"PRICE_ASC",
		"PRICE_DESC",
		"AVAILABILITY",
		"RECOMMENDED"
	]).default("RECOMMENDED"),
	page: coerce.number().int().positive().default(1),
	limit: coerce.number().int().positive().default(20)
});
//#endregion
export { SearchListingsSchema as t };
