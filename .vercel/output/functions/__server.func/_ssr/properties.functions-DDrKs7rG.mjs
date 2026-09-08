import { i as createServerFn } from "./server-BRCrXnf-.mjs";
import { r as requireSupabaseAuth } from "./api-error-C5p6KfDB.mjs";
import { a as enumType, c as objectType, d as stringType, n as arrayType, r as booleanType, s as numberType } from "../_libs/zod.mjs";
import { c as createSsrRpc } from "./router-Dop2ixCg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties.functions-DDrKs7rG.js
var CreatePropertySchema = objectType({
	propertyType: enumType([
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
	]),
	name: stringType().min(3).max(100),
	description: stringType().optional(),
	county: stringType().min(2).max(60),
	town: stringType().min(2).max(60),
	neighborhood: stringType().optional(),
	estate: stringType().optional(),
	address: stringType().optional(),
	latitude: numberType().min(-90).max(90).optional(),
	longitude: numberType().min(-180).max(180).optional(),
	landmarkDescription: stringType().optional(),
	amenities: arrayType(stringType()).default([])
});
var UpdatePropertySchema = objectType({
	id: stringType().uuid(),
	propertyType: enumType([
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
	]).optional(),
	name: stringType().min(3).max(100).optional(),
	description: stringType().optional(),
	status: enumType([
		"DRAFT",
		"ACTIVE",
		"INACTIVE",
		"ARCHIVED"
	]).optional(),
	county: stringType().min(2).max(60).optional(),
	town: stringType().min(2).max(60).optional(),
	neighborhood: stringType().optional(),
	estate: stringType().optional(),
	address: stringType().optional(),
	latitude: numberType().min(-90).max(90).optional(),
	longitude: numberType().min(-180).max(180).optional(),
	landmarkDescription: stringType().optional(),
	amenities: arrayType(stringType()).optional()
});
var CreateUnitSchema = objectType({
	propertyId: stringType().uuid(),
	buildingId: stringType().uuid().optional(),
	unitNumber: stringType().min(1).max(30),
	unitType: enumType([
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
	]),
	floor: numberType().optional(),
	bedrooms: numberType().nonnegative().default(0),
	bathrooms: numberType().nonnegative().default(0),
	area: numberType().positive().optional(),
	status: enumType([
		"DRAFT",
		"AVAILABLE",
		"RESERVED",
		"OCCUPIED",
		"MAINTENANCE",
		"UNAVAILABLE",
		"ARCHIVED"
	]).default("DRAFT"),
	description: stringType().optional(),
	amenities: arrayType(stringType()).default([])
});
var UpdateUnitSchema = objectType({
	id: stringType().uuid(),
	unitNumber: stringType().min(1).max(30).optional(),
	unitType: enumType([
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
	]).optional(),
	floor: numberType().optional(),
	bedrooms: numberType().nonnegative().optional(),
	bathrooms: numberType().nonnegative().optional(),
	area: numberType().positive().optional(),
	status: enumType([
		"DRAFT",
		"AVAILABLE",
		"RESERVED",
		"OCCUPIED",
		"MAINTENANCE",
		"UNAVAILABLE",
		"ARCHIVED"
	]).optional(),
	description: stringType().optional(),
	amenities: arrayType(stringType()).optional()
});
var CreateListingSchema = objectType({
	propertyId: stringType().uuid(),
	unitId: stringType().uuid().optional(),
	title: stringType().min(5).max(120),
	description: stringType().optional(),
	listingType: enumType(["FOR_RENT", "FOR_SALE"]).default("FOR_RENT"),
	price: numberType().nonnegative(),
	currency: stringType().length(3).default("KES"),
	billingPeriod: enumType([
		"MONTHLY",
		"WEEKLY",
		"DAILY",
		"YEARLY"
	]).default("MONTHLY"),
	depositAmount: numberType().nonnegative().optional(),
	availabilityDate: stringType()
});
var UpdateListingSchema = objectType({
	id: stringType().uuid(),
	title: stringType().min(5).max(120).optional(),
	description: stringType().optional(),
	status: enumType([
		"DRAFT",
		"PENDING_REVIEW",
		"PUBLISHED",
		"PAUSED",
		"EXPIRED",
		"ARCHIVED"
	]).optional(),
	price: numberType().nonnegative().optional(),
	billingPeriod: enumType([
		"MONTHLY",
		"WEEKLY",
		"DAILY",
		"YEARLY"
	]).optional(),
	depositAmount: numberType().nonnegative().optional(),
	availabilityDate: stringType().optional()
});
var AddMediaSchema = objectType({
	propertyId: stringType().uuid().optional(),
	unitId: stringType().uuid().optional(),
	listingId: stringType().uuid().optional(),
	mediaType: enumType([
		"IMAGE",
		"VIDEO",
		"FLOOR_PLAN",
		"DOCUMENT"
	]).default("IMAGE"),
	url: stringType().url(),
	storageKey: stringType().optional(),
	caption: stringType().optional(),
	sortOrder: numberType().int().default(0),
	isPrimary: booleanType().default(false)
});
objectType({ items: arrayType(objectType({
	id: stringType().uuid(),
	sortOrder: numberType().int()
})) });
var AddPartySchema = objectType({
	propertyId: stringType().uuid(),
	userId: stringType().uuid(),
	relationshipType: enumType([
		"OWNER",
		"AGENT",
		"PROPERTY_MANAGER"
	]),
	status: enumType([
		"ACTIVE",
		"PENDING",
		"REVOKED"
	]).default("PENDING")
});
var fnCreateProperty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreatePropertySchema).handler(createSsrRpc("af735aa3e090800d7357530ee83acee11d52017ac4fafdd3f301108b4bc84b54"));
var createProperty = (data) => fnCreateProperty({ data });
var fnGetProperty = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("3b8b62408a2c390b9b1b419277493308f4cd30e9239cac1ea98a52cfd2de0a7e"));
var getProperty = (propertyId) => fnGetProperty({ data: propertyId });
var fnUpdateProperty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdatePropertySchema).handler(createSsrRpc("43dcd5cb18045dfc1dfe764fd44d2231729952d4a1f8469a20f4b4ef9c667c9f"));
var updateProperty = (data) => fnUpdateProperty({ data });
var fnArchiveProperty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("a90f115e30a97dc1ed34196bec78f6945e629178885866e8295faf46b9d17538"));
var archiveProperty = (propertyId) => fnArchiveProperty({ data: propertyId });
var fnCreateUnit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateUnitSchema).handler(createSsrRpc("b79dceacfa2d0d525540e7daf921d8f40ca02f05e50cf79e8c774aed20ded3b1"));
var createUnit = (data) => fnCreateUnit({ data });
var fnUpdateUnit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateUnitSchema).handler(createSsrRpc("9a2c7449b10ec86233837c4e9e02691c0d5480eb037e3e5fc27cafa89d1064d1"));
var updateUnit = (data) => fnUpdateUnit({ data });
var fnArchiveUnit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("206887d95f4c3c3460144eadf1265e1ef30fc798f3b1a566c879154af32cb98d"));
var archiveUnit = (unitId) => fnArchiveUnit({ data: unitId });
var fnCreateListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateListingSchema).handler(createSsrRpc("8196ce161156db957e3d2ea954aa649185db11b5511eafcab34d74f49e2187d0"));
var createListing = (data) => fnCreateListing({ data });
var fnGetListing = createServerFn({ method: "GET" }).validator(stringType().uuid()).handler(createSsrRpc("b64c49224fc175f692e36963ba4c2fcbf325293c2db47406b2b902babfc86d8d"));
var getListing = (listingId) => fnGetListing({ data: listingId });
var fnUpdateListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateListingSchema).handler(createSsrRpc("21b756cdabc66b4080352046bf15bc1613071845515915183b0b9edb1fb83a57"));
var updateListing = (data) => fnUpdateListing({ data });
var fnPublishListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("a68813ec8099ea2e766ba41bf690252d91e476609598dfda6cb7f899014ab018"));
var publishListing = (listingId) => fnPublishListing({ data: listingId });
var fnPauseListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("94c12d00e26d3c171975396bb83bc669a481bf1b0e3c94b5fec08e7a3ff3a46f"));
var pauseListing = (listingId) => fnPauseListing({ data: listingId });
var fnArchiveListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("fbef2a81e3601d98bf36853d54a2c7b5e8f1ac5474e5dc1c0281c6e7bd6075cb"));
var archiveListing = (listingId) => fnArchiveListing({ data: listingId });
var fnAddPropertyMedia = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AddMediaSchema).handler(createSsrRpc("b728bca5db6ff2aca6db2010f0d58c136ccc2e19e1414a7464812c90e233654d"));
var addPropertyMedia = (data) => fnAddPropertyMedia({ data });
var fnRemovePropertyMedia = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("b2ae7308bf38c62cfe765a466020378ab01bb3ceda842f8079d4ecbdf29ddb2b"));
var removePropertyMedia = (mediaId) => fnRemovePropertyMedia({ data: mediaId });
var fnAddPropertyParty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AddPartySchema).handler(createSsrRpc("daf626593cd9a60f7e43e7ce4ce1c202e042db373eb2fb3541166c13850528f9"));
var addPropertyParty = (data) => fnAddPropertyParty({ data });
var fnRemovePropertyParty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("a91636799a3ada9e403d1020a6d7b3927679f680f59025687c33bdf3f265b351"));
var removePropertyParty = (partyId) => fnRemovePropertyParty({ data: partyId });
var getMyProperties = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("1b9912925723fe329e685700ee34d3a9328d2003aa540ef9f659316deef2a8e0"));
var getMyListings = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("2d2b10b8203d1682c80c0694f4f8a6a750e69a98fe698bfdb1208afbf0786e97"));
var getPublicListings = createServerFn({ method: "GET" }).handler(createSsrRpc("4c9dd5a51c0d4b0f434ea3e2dc17ff67e2248046f408b3917711db2e153ebb10"));
//#endregion
export { removePropertyParty as _, archiveUnit as a, updateUnit as b, createUnit as c, getMyProperties as d, getProperty as f, removePropertyMedia as g, publishListing as h, archiveProperty as i, getListing as l, pauseListing as m, addPropertyParty as n, createListing as o, getPublicListings as p, archiveListing as r, createProperty as s, addPropertyMedia as t, getMyListings as u, updateListing as v, updateProperty as y };
