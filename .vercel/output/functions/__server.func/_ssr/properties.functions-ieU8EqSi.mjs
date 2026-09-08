import { a as getRequest, i as createServerFn } from "./server-Dy3VKkCi.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-CUUESrGA.mjs";
import { a as enumType, c as objectType, d as stringType, n as arrayType, r as booleanType, s as numberType } from "../_libs/zod.mjs";
import { n as supabaseAdmin } from "./client.server-KNnxUzUb.mjs";
import { a as resolveRequestId } from "./request-id-Du7XsDoM.mjs";
import { i as isPlatformAdmin, t as hasPermission } from "./roles-dcbFSAkR.mjs";
import { t as createServerRpc } from "./createServerRpc-fDPuksr0.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-CB7xqELv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties.functions-ieU8EqSi.js
/**
* Checks if the user is authorized to view a specific property.
* A property is viewable if:
* 1. The property status is 'ACTIVE'.
* 2. The user is the owner or creator.
* 3. The user is an active party (agent, manager, etc.) of that property.
* 4. The user is a platform administrator.
*/
async function canViewProperty(userId, roles, propertyId, supabase) {
	if (isPlatformAdmin(roles)) return true;
	const { data: prop, error } = await supabase.from("properties").select("status, owner_user_id, created_by_user_id").eq("id", propertyId).maybeSingle();
	if (error || !prop) return false;
	if (prop.status === "ACTIVE") return true;
	if (!userId) return false;
	if (prop.owner_user_id === userId || prop.created_by_user_id === userId) return true;
	const { data: party } = await supabase.from("property_parties").select("id").eq("property_id", propertyId).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
	return !!party;
}
/**
* Checks if the user is authorized to update a specific property.
* A user can update a property if:
* 1. The user is the owner.
* 2. The user has the PROPERTY_UPDATE permission AND is an active party of the property (agent/manager).
* 3. The user is a platform administrator.
*/
async function canUpdateProperty(userId, roles, propertyId, supabase) {
	if (isPlatformAdmin(roles)) return true;
	if (!userId) return false;
	const { data: prop, error } = await supabase.from("properties").select("owner_user_id, status").eq("id", propertyId).maybeSingle();
	if (error || !prop) return false;
	if (prop.status === "ARCHIVED") return false;
	if (prop.owner_user_id === userId) return true;
	if (hasPermission(roles, "PROPERTY_UPDATE")) {
		const { data: party } = await supabase.from("property_parties").select("id").eq("property_id", propertyId).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
		return !!party;
	}
	return false;
}
/**
* Checks if the user can archive a specific property (requires owner or admin).
*/
async function canArchiveProperty(userId, roles, propertyId, supabase) {
	if (isPlatformAdmin(roles)) return true;
	if (!userId) return false;
	const { data: prop, error } = await supabase.from("properties").select("owner_user_id, status").eq("id", propertyId).maybeSingle();
	if (error || !prop) return false;
	if (prop.status === "ARCHIVED") return false;
	if (prop.owner_user_id === userId) return true;
	return false;
}
/**
* Checks if the user is authorized to create a listing for a property.
* Requires ownership, active agent/manager relationship, or admin overrides.
*/
async function canCreateListing(userId, roles, propertyId, supabase) {
	if (isPlatformAdmin(roles)) return true;
	if (!userId) return false;
	const { data: prop, error } = await supabase.from("properties").select("owner_user_id, status").eq("id", propertyId).maybeSingle();
	if (error || !prop) return false;
	if (prop.status !== "ACTIVE" && prop.status !== "DRAFT") return false;
	if (prop.owner_user_id === userId) return true;
	if (hasPermission(roles, "LISTING_CREATE")) {
		const { data: party } = await supabase.from("property_parties").select("id").eq("property_id", propertyId).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
		return !!party;
	}
	return false;
}
/**
* Validates a listing and checks authorization before publishing.
* Publishing requires:
* 1. Ownership or active agent/manager relationship on the underlying property.
* 2. Mandatory completed fields: title, description, price, availability_date, and at least one primary media image.
*/
async function canPublishListing(userId, roles, listingId, supabase) {
	if (!userId) return {
		authorized: false,
		reason: "Unauthenticated request."
	};
	const { data: listing, error } = await supabase.from("listings").select("*, properties(owner_user_id, status)").eq("id", listingId).maybeSingle();
	if (error || !listing) return {
		authorized: false,
		reason: "Listing not found."
	};
	const prop = listing.properties;
	if (!prop) return {
		authorized: false,
		reason: "Property reference not found."
	};
	let authorized = isPlatformAdmin(roles) || prop.owner_user_id === userId;
	if (!authorized && hasPermission(roles, "LISTING_PUBLISH")) {
		const { data: party } = await supabase.from("property_parties").select("id").eq("property_id", listing.property_id).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
		authorized = !!party;
	}
	if (!authorized) return {
		authorized: false,
		reason: "User is not authorized to publish this listing."
	};
	if (!listing.title || listing.title.trim().length < 5) return {
		authorized: false,
		reason: "Listing title is too short (min 5 characters)."
	};
	if (!listing.description || listing.description.trim().length < 10) return {
		authorized: false,
		reason: "Listing description is too short (min 10 characters)."
	};
	if (listing.price === null || listing.price === void 0 || listing.price < 0) return {
		authorized: false,
		reason: "Listing price must be a non-negative number."
	};
	if (!listing.availability_date) return {
		authorized: false,
		reason: "Listing availability date is required."
	};
	const { data: media } = await supabase.from("property_media").select("id").eq("listing_id", listingId).eq("is_primary", true).maybeSingle();
	if (!media) return {
		authorized: false,
		reason: "At least one primary listing image is required before publishing."
	};
	return { authorized: true };
}
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
function getContextMeta() {
	const request = getRequest();
	return {
		requestId: resolveRequestId(request?.headers),
		meta: auditMetadataFromRequest(request)
	};
}
var fnCreateProperty_createServerFn_handler = createServerRpc({
	id: "af735aa3e090800d7357530ee83acee11d52017ac4fafdd3f301108b4bc84b54",
	name: "fnCreateProperty",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnCreateProperty.__executeServer(opts));
var fnCreateProperty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreatePropertySchema).handler(fnCreateProperty_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: prop, error: propErr } = await supabaseAdmin.from("properties").insert({
		property_type: data.propertyType,
		name: data.name,
		description: data.description ?? null,
		owner_user_id: userId,
		created_by_user_id: userId,
		county: data.county,
		town: data.town,
		neighborhood: data.neighborhood ?? null,
		estate: data.estate ?? null,
		address: data.address ?? null,
		latitude: data.latitude ?? null,
		longitude: data.longitude ?? null,
		landmark_description: data.landmarkDescription ?? null,
		status: "DRAFT"
	}).select().single();
	if (propErr || !prop) throw new AppError(ERROR_CODES.BAD_REQUEST, propErr?.message || "Failed to create property.");
	const { error: partyErr } = await supabaseAdmin.from("property_parties").insert({
		property_id: prop.id,
		user_id: userId,
		relationship_type: "OWNER",
		status: "ACTIVE"
	});
	if (partyErr) {
		await supabaseAdmin.from("properties").delete().eq("id", prop.id);
		throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to create property relationship mapping.");
	}
	if (data.amenities.length > 0) {
		const amenityRows = data.amenities.map((amenity) => ({
			property_id: prop.id,
			amenity
		}));
		await supabaseAdmin.from("property_amenities").insert(amenityRows);
	}
	await Promise.all([recordAuditEvent({
		actorId: userId,
		action: "PROPERTY_CREATED",
		resourceType: "property",
		resourceId: prop.id,
		afterData: {
			name: prop.name,
			status: prop.status
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	}), recordAuditEvent({
		actorId: userId,
		action: "PROPERTY_PARTY_ADDED",
		resourceType: "property_party",
		resourceId: prop.id,
		afterData: {
			relationshipType: "OWNER",
			status: "ACTIVE"
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	})]);
	return {
		success: true,
		propertyId: prop.id
	};
});
var fnGetProperty_createServerFn_handler = createServerRpc({
	id: "3b8b62408a2c390b9b1b419277493308f4cd30e9239cac1ea98a52cfd2de0a7e",
	name: "fnGetProperty",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnGetProperty.__executeServer(opts));
var fnGetProperty = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnGetProperty_createServerFn_handler, async ({ data: propertyId, context }) => {
	const { userId, claims } = context;
	if (!await canViewProperty(userId, claims["roles"] || [], propertyId, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You cannot view this property.");
	const [propRes, buildingsRes, unitsRes, amenitiesRes, mediaRes, listingsRes, partiesRes] = await Promise.all([
		supabaseAdmin.from("properties").select("*").eq("id", propertyId).maybeSingle(),
		supabaseAdmin.from("buildings").select("*").eq("property_id", propertyId),
		supabaseAdmin.from("units").select("*").eq("property_id", propertyId).is("deleted_at", null),
		supabaseAdmin.from("property_amenities").select("amenity").eq("property_id", propertyId),
		supabaseAdmin.from("property_media").select("*").eq("property_id", propertyId).order("sort_order"),
		supabaseAdmin.from("listings").select("*").eq("property_id", propertyId).is("deleted_at", null),
		supabaseAdmin.from("property_parties").select("*, profiles(full_name, phone_number)").eq("property_id", propertyId)
	]);
	if (propRes.error || !propRes.data) throw new AppError(ERROR_CODES.NOT_FOUND, "Property not found.");
	return {
		property: propRes.data,
		buildings: buildingsRes.data || [],
		units: unitsRes.data || [],
		amenities: (amenitiesRes.data || []).map((r) => r.amenity),
		media: mediaRes.data || [],
		listings: listingsRes.data || [],
		parties: partiesRes.data || []
	};
});
var fnUpdateProperty_createServerFn_handler = createServerRpc({
	id: "43dcd5cb18045dfc1dfe764fd44d2231729952d4a1f8469a20f4b4ef9c667c9f",
	name: "fnUpdateProperty",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnUpdateProperty.__executeServer(opts));
var fnUpdateProperty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdatePropertySchema).handler(fnUpdateProperty_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	if (!await canUpdateProperty(userId, roles, data.id, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to modify this property.");
	const { data: original } = await supabaseAdmin.from("properties").select("*").eq("id", data.id).single();
	const { data: updated, error } = await supabaseAdmin.from("properties").update({
		property_type: data.propertyType,
		name: data.name,
		description: data.description,
		status: data.status,
		county: data.county,
		town: data.town,
		neighborhood: data.neighborhood,
		estate: data.estate,
		address: data.address,
		latitude: data.latitude,
		longitude: data.longitude,
		landmark_description: data.landmarkDescription,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.id).select().single();
	if (error || !updated) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to update property.");
	if (data.amenities !== void 0) {
		await supabaseAdmin.from("property_amenities").delete().eq("property_id", data.id);
		if (data.amenities.length > 0) {
			const amenityRows = data.amenities.map((amenity) => ({
				property_id: data.id,
				amenity
			}));
			await supabaseAdmin.from("property_amenities").insert(amenityRows);
		}
	}
	await recordAuditEvent({
		actorId: userId,
		action: "PROPERTY_UPDATED",
		resourceType: "property",
		resourceId: data.id,
		beforeData: original,
		afterData: updated,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnArchiveProperty_createServerFn_handler = createServerRpc({
	id: "a90f115e30a97dc1ed34196bec78f6945e629178885866e8295faf46b9d17538",
	name: "fnArchiveProperty",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnArchiveProperty.__executeServer(opts));
var fnArchiveProperty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnArchiveProperty_createServerFn_handler, async ({ data: propertyId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	if (!await canArchiveProperty(userId, roles, propertyId, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Only property owners can delete property assets.");
	const { error } = await supabaseAdmin.from("properties").update({
		status: "ARCHIVED",
		deleted_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", propertyId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to archive property.");
	await recordAuditEvent({
		actorId: userId,
		action: "PROPERTY_ARCHIVED",
		resourceType: "property",
		resourceId: propertyId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnCreateUnit_createServerFn_handler = createServerRpc({
	id: "b79dceacfa2d0d525540e7daf921d8f40ca02f05e50cf79e8c774aed20ded3b1",
	name: "fnCreateUnit",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnCreateUnit.__executeServer(opts));
var fnCreateUnit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateUnitSchema).handler(fnCreateUnit_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	if (!await canUpdateProperty(userId, roles, data.propertyId, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to modify property units.");
	const { data: conflict } = await supabaseAdmin.from("units").select("id").eq("property_id", data.propertyId).eq("unit_number", data.unitNumber).is("deleted_at", null).maybeSingle();
	if (conflict) throw new AppError(ERROR_CODES.BAD_REQUEST, `Unit number '${data.unitNumber}' already exists on this property.`);
	const { data: unit, error } = await supabaseAdmin.from("units").insert({
		property_id: data.propertyId,
		building_id: data.buildingId || null,
		unit_number: data.unitNumber,
		unit_type: data.unitType,
		floor: data.floor ?? null,
		bedrooms: data.bedrooms,
		bathrooms: data.bathrooms,
		area: data.area ?? null,
		status: data.status,
		description: data.description ?? null
	}).select().single();
	if (error || !unit) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to create unit.");
	if (data.amenities.length > 0) {
		const amenityRows = data.amenities.map((amenity) => ({
			unit_id: unit.id,
			amenity
		}));
		await supabaseAdmin.from("unit_amenities").insert(amenityRows);
	}
	await recordAuditEvent({
		actorId: userId,
		action: "UNIT_CREATED",
		resourceType: "unit",
		resourceId: unit.id,
		afterData: {
			unitNumber: unit.unit_number,
			status: unit.status
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		unitId: unit.id
	};
});
var fnUpdateUnit_createServerFn_handler = createServerRpc({
	id: "9a2c7449b10ec86233837c4e9e02691c0d5480eb037e3e5fc27cafa89d1064d1",
	name: "fnUpdateUnit",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnUpdateUnit.__executeServer(opts));
var fnUpdateUnit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateUnitSchema).handler(fnUpdateUnit_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: original, error: findErr } = await supabaseAdmin.from("units").select("*").eq("id", data.id).single();
	if (findErr || !original) throw new AppError(ERROR_CODES.NOT_FOUND, "Unit not found.");
	if (!await canUpdateProperty(userId, roles, original.property_id, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to modify property units.");
	const { data: updated, error } = await supabaseAdmin.from("units").update({
		unit_number: data.unitNumber,
		unit_type: data.unitType,
		floor: data.floor,
		bedrooms: data.bedrooms,
		bathrooms: data.bathrooms,
		area: data.area,
		status: data.status,
		description: data.description,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.id).select().single();
	if (error || !updated) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to update unit.");
	if (data.amenities !== void 0) {
		await supabaseAdmin.from("unit_amenities").delete().eq("unit_id", data.id);
		if (data.amenities.length > 0) {
			const amenityRows = data.amenities.map((amenity) => ({
				unit_id: data.id,
				amenity
			}));
			await supabaseAdmin.from("unit_amenities").insert(amenityRows);
		}
	}
	await recordAuditEvent({
		actorId: userId,
		action: "UNIT_UPDATED",
		resourceType: "unit",
		resourceId: data.id,
		beforeData: original,
		afterData: updated,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnArchiveUnit_createServerFn_handler = createServerRpc({
	id: "206887d95f4c3c3460144eadf1265e1ef30fc798f3b1a566c879154af32cb98d",
	name: "fnArchiveUnit",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnArchiveUnit.__executeServer(opts));
var fnArchiveUnit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnArchiveUnit_createServerFn_handler, async ({ data: unitId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: original, error: findErr } = await supabaseAdmin.from("units").select("*").eq("id", unitId).single();
	if (findErr || !original) throw new AppError(ERROR_CODES.NOT_FOUND, "Unit not found.");
	if (!await canUpdateProperty(userId, roles, original.property_id, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to modify property units.");
	await supabaseAdmin.from("units").update({
		status: "ARCHIVED",
		deleted_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", unitId);
	await recordAuditEvent({
		actorId: userId,
		action: "UNIT_ARCHIVED",
		resourceType: "unit",
		resourceId: unitId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnCreateListing_createServerFn_handler = createServerRpc({
	id: "8196ce161156db957e3d2ea954aa649185db11b5511eafcab34d74f49e2187d0",
	name: "fnCreateListing",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnCreateListing.__executeServer(opts));
var fnCreateListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateListingSchema).handler(fnCreateListing_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	if (!await canCreateListing(userId, roles, data.propertyId, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to create listings for this property.");
	const { data: listing, error } = await supabaseAdmin.from("listings").insert({
		property_id: data.propertyId,
		unit_id: data.unitId || null,
		title: data.title,
		description: data.description ?? null,
		listing_type: data.listingType,
		status: "DRAFT",
		price: data.price,
		currency: data.currency,
		billing_period: data.billingPeriod,
		deposit_amount: data.depositAmount ?? null,
		availability_date: data.availabilityDate,
		created_by_user_id: userId
	}).select().single();
	if (error || !listing) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to create listing.");
	await recordAuditEvent({
		actorId: userId,
		action: "LISTING_CREATED",
		resourceType: "listing",
		resourceId: listing.id,
		afterData: {
			title: listing.title,
			status: listing.status
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		listingId: listing.id
	};
});
var fnGetListing_createServerFn_handler = createServerRpc({
	id: "b64c49224fc175f692e36963ba4c2fcbf325293c2db47406b2b902babfc86d8d",
	name: "fnGetListing",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnGetListing.__executeServer(opts));
var fnGetListing = createServerFn({ method: "GET" }).validator(stringType().uuid()).handler(fnGetListing_createServerFn_handler, async ({ data: listingId }) => {
	const { data: listing, error } = await supabaseAdmin.from("listings").select(`
        *,
        properties (*),
        units (*)
      `).eq("id", listingId).is("deleted_at", null).maybeSingle();
	if (error || !listing) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
	const [mediaRes, amenitiesRes, ownerProfileRes] = await Promise.all([
		supabaseAdmin.from("property_media").select("*").eq("listing_id", listingId).order("sort_order"),
		supabaseAdmin.from("property_amenities").select("amenity").eq("property_id", listing.property_id),
		supabaseAdmin.from("profiles").select("identity_verified, agent_verified").eq("id", listing.properties?.owner_user_id || "").maybeSingle()
	]);
	if (listing.properties) {
		const propData = listing.properties;
		propData.amenity_list = (amenitiesRes.data || []).map((r) => r.amenity);
		propData.owner_identity_verified = ownerProfileRes.data?.identity_verified || false;
		propData.owner_agent_verified = ownerProfileRes.data?.agent_verified || false;
	}
	return {
		listing,
		media: mediaRes.data || []
	};
});
var fnUpdateListing_createServerFn_handler = createServerRpc({
	id: "21b756cdabc66b4080352046bf15bc1613071845515915183b0b9edb1fb83a57",
	name: "fnUpdateListing",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnUpdateListing.__executeServer(opts));
var fnUpdateListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateListingSchema).handler(fnUpdateListing_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: original, error: findErr } = await supabaseAdmin.from("listings").select("*").eq("id", data.id).single();
	if (findErr || !original) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
	let relationshipOk = isPlatformAdmin(roles) || original.created_by_user_id === userId;
	if (!relationshipOk) {
		const { data: party } = await supabaseAdmin.from("property_parties").select("id").eq("property_id", original.property_id).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
		relationshipOk = !!party;
	}
	if (!relationshipOk) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to edit listing.");
	const { data: updated, error } = await supabaseAdmin.from("listings").update({
		title: data.title,
		description: data.description,
		status: data.status,
		price: data.price,
		billing_period: data.billingPeriod,
		deposit_amount: data.depositAmount,
		availability_date: data.availabilityDate,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.id).select().single();
	if (error || !updated) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to update listing.");
	await recordAuditEvent({
		actorId: userId,
		action: "LISTING_UPDATED",
		resourceType: "listing",
		resourceId: data.id,
		beforeData: original,
		afterData: updated,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnPublishListing_createServerFn_handler = createServerRpc({
	id: "a68813ec8099ea2e766ba41bf690252d91e476609598dfda6cb7f899014ab018",
	name: "fnPublishListing",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnPublishListing.__executeServer(opts));
var fnPublishListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnPublishListing_createServerFn_handler, async ({ data: listingId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const validation = await canPublishListing(userId, roles, listingId, supabaseAdmin);
	if (!validation.authorized) throw new AppError(ERROR_CODES.BAD_REQUEST, validation.reason || "Publish validation check failed.");
	const { error } = await supabaseAdmin.from("listings").update({
		status: "PUBLISHED",
		published_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", listingId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to publish listing.");
	await recordAuditEvent({
		actorId: userId,
		action: "LISTING_PUBLISHED",
		resourceType: "listing",
		resourceId: listingId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnPauseListing_createServerFn_handler = createServerRpc({
	id: "94c12d00e26d3c171975396bb83bc669a481bf1b0e3c94b5fec08e7a3ff3a46f",
	name: "fnPauseListing",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnPauseListing.__executeServer(opts));
var fnPauseListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnPauseListing_createServerFn_handler, async ({ data: listingId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: original, error: findErr } = await supabaseAdmin.from("listings").select("property_id, created_by_user_id").eq("id", listingId).single();
	if (findErr || !original) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
	let relationshipOk = isPlatformAdmin(roles) || original.created_by_user_id === userId;
	if (!relationshipOk) {
		const { data: party } = await supabaseAdmin.from("property_parties").select("id").eq("property_id", original.property_id).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
		relationshipOk = !!party;
	}
	if (!relationshipOk) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to pause listing.");
	const { error } = await supabaseAdmin.from("listings").update({ status: "PAUSED" }).eq("id", listingId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to pause listing.");
	await recordAuditEvent({
		actorId: userId,
		action: "LISTING_PAUSED",
		resourceType: "listing",
		resourceId: listingId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnArchiveListing_createServerFn_handler = createServerRpc({
	id: "fbef2a81e3601d98bf36853d54a2c7b5e8f1ac5474e5dc1c0281c6e7bd6075cb",
	name: "fnArchiveListing",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnArchiveListing.__executeServer(opts));
var fnArchiveListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnArchiveListing_createServerFn_handler, async ({ data: listingId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: original, error: findErr } = await supabaseAdmin.from("listings").select("property_id, created_by_user_id").eq("id", listingId).single();
	if (findErr || !original) throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
	let relationshipOk = isPlatformAdmin(roles) || original.created_by_user_id === userId;
	if (!relationshipOk) {
		const { data: party } = await supabaseAdmin.from("property_parties").select("id").eq("property_id", original.property_id).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
		relationshipOk = !!party;
	}
	if (!relationshipOk) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to archive listing.");
	const { error } = await supabaseAdmin.from("listings").update({
		status: "ARCHIVED",
		deleted_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", listingId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to archive listing.");
	await recordAuditEvent({
		actorId: userId,
		action: "LISTING_ARCHIVED",
		resourceType: "listing",
		resourceId: listingId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnAddPropertyMedia_createServerFn_handler = createServerRpc({
	id: "b728bca5db6ff2aca6db2010f0d58c136ccc2e19e1414a7464812c90e233654d",
	name: "fnAddPropertyMedia",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnAddPropertyMedia.__executeServer(opts));
var fnAddPropertyMedia = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AddMediaSchema).handler(fnAddPropertyMedia_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const propId = data.propertyId;
	if (!propId) throw new AppError(ERROR_CODES.BAD_REQUEST, "Property reference propertyId is mandatory.");
	if (!await canUpdateProperty(userId, roles, propId, supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to modify property media.");
	const { data: media, error } = await supabaseAdmin.from("property_media").insert({
		property_id: data.propertyId || null,
		unit_id: data.unitId || null,
		listing_id: data.listingId || null,
		media_type: data.mediaType,
		url: data.url,
		storage_key: data.storageKey || null,
		caption: data.caption || null,
		sort_order: data.sortOrder,
		is_primary: data.isPrimary
	}).select().single();
	if (error || !media) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to add media.");
	await recordAuditEvent({
		actorId: userId,
		action: "MEDIA_ADDED",
		resourceType: "media",
		resourceId: media.id,
		afterData: { url: media.url },
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		mediaId: media.id
	};
});
var fnRemovePropertyMedia_createServerFn_handler = createServerRpc({
	id: "b2ae7308bf38c62cfe765a466020378ab01bb3ceda842f8079d4ecbdf29ddb2b",
	name: "fnRemovePropertyMedia",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnRemovePropertyMedia.__executeServer(opts));
var fnRemovePropertyMedia = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnRemovePropertyMedia_createServerFn_handler, async ({ data: mediaId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: media, error: findErr } = await supabaseAdmin.from("property_media").select("*").eq("id", mediaId).single();
	if (findErr || !media) throw new AppError(ERROR_CODES.NOT_FOUND, "Media not found.");
	if (!await canUpdateProperty(userId, roles, media.property_id || "", supabaseAdmin)) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to modify property media.");
	await supabaseAdmin.from("property_media").delete().eq("id", mediaId);
	await recordAuditEvent({
		actorId: userId,
		action: "MEDIA_REMOVED",
		resourceType: "media",
		resourceId: mediaId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnAddPropertyParty_createServerFn_handler = createServerRpc({
	id: "daf626593cd9a60f7e43e7ce4ce1c202e042db373eb2fb3541166c13850528f9",
	name: "fnAddPropertyParty",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnAddPropertyParty.__executeServer(opts));
var fnAddPropertyParty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AddPartySchema).handler(fnAddPropertyParty_createServerFn_handler, async ({ data, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: prop, error: findErr } = await supabaseAdmin.from("properties").select("owner_user_id").eq("id", data.propertyId).single();
	if (findErr || !prop) throw new AppError(ERROR_CODES.NOT_FOUND, "Property not found.");
	if (!(prop.owner_user_id === userId || isPlatformAdmin(roles))) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Only property owners can add parties.");
	const { data: party, error } = await supabaseAdmin.from("property_parties").insert({
		property_id: data.propertyId,
		user_id: data.userId,
		relationship_type: data.relationshipType,
		status: data.status
	}).select().single();
	if (error || !party) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to add property party relationship.");
	await recordAuditEvent({
		actorId: userId,
		action: "PROPERTY_PARTY_ADDED",
		resourceType: "property_party",
		resourceId: party.id,
		afterData: {
			userId: party.user_id,
			relationshipType: party.relationship_type
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		partyId: party.id
	};
});
var fnRemovePropertyParty_createServerFn_handler = createServerRpc({
	id: "a91636799a3ada9e403d1020a6d7b3927679f680f59025687c33bdf3f265b351",
	name: "fnRemovePropertyParty",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => fnRemovePropertyParty.__executeServer(opts));
var fnRemovePropertyParty = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnRemovePropertyParty_createServerFn_handler, async ({ data: partyId, context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	const { requestId, meta } = getContextMeta();
	const { data: party, error: findErr } = await supabaseAdmin.from("property_parties").select("*, properties(owner_user_id)").eq("id", partyId).single();
	if (findErr || !party) throw new AppError(ERROR_CODES.NOT_FOUND, "Party relationship not found.");
	const prop = party.properties;
	if (!(prop && prop.owner_user_id === userId || isPlatformAdmin(roles))) throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Only property owners can remove parties.");
	await supabaseAdmin.from("property_parties").update({
		status: "REVOKED",
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", partyId);
	await recordAuditEvent({
		actorId: userId,
		action: "PROPERTY_PARTY_REMOVED",
		resourceType: "property_party",
		resourceId: partyId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var getMyProperties_createServerFn_handler = createServerRpc({
	id: "1b9912925723fe329e685700ee34d3a9328d2003aa540ef9f659316deef2a8e0",
	name: "getMyProperties",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => getMyProperties.__executeServer(opts));
var getMyProperties = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyProperties_createServerFn_handler, async ({ context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	if (isPlatformAdmin(roles)) {
		const { data } = await supabaseAdmin.from("properties").select(`
          *,
          units(count)
        `).is("deleted_at", null);
		return data || [];
	}
	const { data: partyRows } = await supabaseAdmin.from("property_parties").select("property_id").eq("user_id", userId).eq("status", "ACTIVE");
	const propertyIds = (partyRows || []).map((r) => r.property_id);
	if (propertyIds.length === 0) return [];
	const { data } = await supabaseAdmin.from("properties").select(`
        *,
        units(count)
      `).in("id", propertyIds).is("deleted_at", null);
	return data || [];
});
var getMyListings_createServerFn_handler = createServerRpc({
	id: "2d2b10b8203d1682c80c0694f4f8a6a750e69a98fe698bfdb1208afbf0786e97",
	name: "getMyListings",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => getMyListings.__executeServer(opts));
var getMyListings = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyListings_createServerFn_handler, async ({ context }) => {
	const { userId, claims } = context;
	const roles = claims["roles"] || [];
	if (isPlatformAdmin(roles)) {
		const { data } = await supabaseAdmin.from("listings").select("*, properties(name, county, town)").is("deleted_at", null);
		return data || [];
	}
	const { data: partyRows } = await supabaseAdmin.from("property_parties").select("property_id").eq("user_id", userId).eq("status", "ACTIVE");
	const propertyIds = (partyRows || []).map((r) => r.property_id);
	const { data } = await supabaseAdmin.from("listings").select("*, properties(name, county, town)").or(`created_by_user_id.eq.${userId},property_id.in.(${propertyIds.join(",")})`).is("deleted_at", null);
	return data || [];
});
var getPublicListings_createServerFn_handler = createServerRpc({
	id: "4c9dd5a51c0d4b0f434ea3e2dc17ff67e2248046f408b3917711db2e153ebb10",
	name: "getPublicListings",
	filename: "src/features/properties/properties.functions.ts"
}, (opts) => getPublicListings.__executeServer(opts));
var getPublicListings = createServerFn({ method: "GET" }).handler(getPublicListings_createServerFn_handler, async () => {
	const { data } = await supabaseAdmin.from("listings").select(`
        id,
        title,
        price,
        currency,
        billing_period,
        availability_date,
        properties (
          property_type,
          county,
          town,
          neighborhood
        ),
        units (
          bedrooms,
          bathrooms
        )
      `).eq("status", "PUBLISHED").is("deleted_at", null).order("published_at", { ascending: false });
	const listingIds = (data || []).map((l) => l.id);
	const { data: mediaRows } = await supabaseAdmin.from("property_media").select("listing_id, url").in("listing_id", listingIds).eq("is_primary", true);
	const mediaMap = (mediaRows || []).reduce((acc, row) => {
		if (row.listing_id) acc[row.listing_id] = row.url;
		return acc;
	}, {});
	return (data || []).map((listing) => ({
		...listing,
		primaryImageUrl: mediaMap[listing.id] || null
	}));
});
//#endregion
export { fnAddPropertyMedia_createServerFn_handler, fnAddPropertyParty_createServerFn_handler, fnArchiveListing_createServerFn_handler, fnArchiveProperty_createServerFn_handler, fnArchiveUnit_createServerFn_handler, fnCreateListing_createServerFn_handler, fnCreateProperty_createServerFn_handler, fnCreateUnit_createServerFn_handler, fnGetListing_createServerFn_handler, fnGetProperty_createServerFn_handler, fnPauseListing_createServerFn_handler, fnPublishListing_createServerFn_handler, fnRemovePropertyMedia_createServerFn_handler, fnRemovePropertyParty_createServerFn_handler, fnUpdateListing_createServerFn_handler, fnUpdateProperty_createServerFn_handler, fnUpdateUnit_createServerFn_handler, getMyListings_createServerFn_handler, getMyProperties_createServerFn_handler, getPublicListings_createServerFn_handler };
