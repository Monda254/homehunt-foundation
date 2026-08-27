import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { recordAuditEvent, auditMetadataFromRequest } from "@/core/audit/audit.server";
import { resolveRequestId } from "@/core/observability/request-id";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import {
  canViewProperty,
  canUpdateProperty,
  canArchiveProperty,
  canCreateListing,
  canPublishListing,
} from "./properties.auth";
import { type AppRole, isPlatformAdmin } from "@/core/auth/roles";

// =============================================================
// Validation Schemas
// =============================================================

export const CreatePropertySchema = z.object({
  propertyType: z.enum([
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
    "OTHER",
  ]),
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  county: z.string().min(2).max(60),
  town: z.string().min(2).max(60),
  neighborhood: z.string().optional(),
  estate: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  landmarkDescription: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});

export const UpdatePropertySchema = z.object({
  id: z.string().uuid(),
  propertyType: z
    .enum([
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
      "OTHER",
    ])
    .optional(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  county: z.string().min(2).max(60).optional(),
  town: z.string().min(2).max(60).optional(),
  neighborhood: z.string().optional(),
  estate: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  landmarkDescription: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export const CreateUnitSchema = z.object({
  propertyId: z.string().uuid(),
  buildingId: z.string().uuid().optional(),
  unitNumber: z.string().min(1).max(30),
  unitType: z.enum([
    "BEDSITTER",
    "STUDIO",
    "ONE_BEDROOM",
    "TWO_BEDROOM",
    "THREE_BEDROOM",
    "FOUR_PLUS_BEDROOM",
    "ROOM",
    "SHARED",
    "HOUSE",
    "OTHER",
  ]),
  floor: z.number().optional(),
  bedrooms: z.number().nonnegative().default(0),
  bathrooms: z.number().nonnegative().default(0),
  area: z.number().positive().optional(),
  status: z
    .enum(["DRAFT", "AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE", "UNAVAILABLE", "ARCHIVED"])
    .default("DRAFT"),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});

export const UpdateUnitSchema = z.object({
  id: z.string().uuid(),
  unitNumber: z.string().min(1).max(30).optional(),
  unitType: z
    .enum([
      "BEDSITTER",
      "STUDIO",
      "ONE_BEDROOM",
      "TWO_BEDROOM",
      "THREE_BEDROOM",
      "FOUR_PLUS_BEDROOM",
      "ROOM",
      "SHARED",
      "HOUSE",
      "OTHER",
    ])
    .optional(),
  floor: z.number().optional(),
  bedrooms: z.number().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  area: z.number().positive().optional(),
  status: z
    .enum(["DRAFT", "AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE", "UNAVAILABLE", "ARCHIVED"])
    .optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export const CreateListingSchema = z.object({
  propertyId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  title: z.string().min(5).max(120),
  description: z.string().optional(),
  listingType: z.enum(["FOR_RENT", "FOR_SALE"]).default("FOR_RENT"),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default("KES"),
  billingPeriod: z.enum(["MONTHLY", "WEEKLY", "DAILY", "YEARLY"]).default("MONTHLY"),
  depositAmount: z.number().nonnegative().optional(),
  availabilityDate: z.string(), // ISO date string
});

export const UpdateListingSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5).max(120).optional(),
  description: z.string().optional(),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "PAUSED", "EXPIRED", "ARCHIVED"])
    .optional(),
  price: z.number().nonnegative().optional(),
  billingPeriod: z.enum(["MONTHLY", "WEEKLY", "DAILY", "YEARLY"]).optional(),
  depositAmount: z.number().nonnegative().optional(),
  availabilityDate: z.string().optional(),
});

export const AddMediaSchema = z.object({
  propertyId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  listingId: z.string().uuid().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO", "FLOOR_PLAN", "DOCUMENT"]).default("IMAGE"),
  url: z.string().url(),
  storageKey: z.string().optional(),
  caption: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const ReorderMediaSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    }),
  ),
});

export const AddPartySchema = z.object({
  propertyId: z.string().uuid(),
  userId: z.string().uuid(),
  relationshipType: z.enum(["OWNER", "AGENT", "PROPERTY_MANAGER"]),
  status: z.enum(["ACTIVE", "PENDING", "REVOKED"]).default("PENDING"),
});

// =============================================================
// Helper: Resolve context details
// =============================================================
function getContextMeta() {
  const request = getRequest();
  const requestId = resolveRequestId(request?.headers);
  const meta = auditMetadataFromRequest(request);
  return { requestId, meta };
}

// =============================================================
// PROPERTY OPERATIONS
// =============================================================

const fnCreateProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CreatePropertySchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    // 1. Insert property
    const { data: prop, error: propErr } = await supabaseAdmin
      .from("properties")
      .insert({
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
        status: "DRAFT",
      })
      .select()
      .single();

    if (propErr || !prop) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, propErr?.message || "Failed to create property.");
    }

    // 2. Add owner to property parties implicitly
    const { error: partyErr } = await supabaseAdmin.from("property_parties").insert({
      property_id: prop.id,
      user_id: userId,
      relationship_type: "OWNER",
      status: "ACTIVE",
    });

    if (partyErr) {
      // Cleanup created property to prevent orphaned records
      await supabaseAdmin.from("properties").delete().eq("id", prop.id);
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Failed to create property relationship mapping.",
      );
    }

    // 3. Add amenities
    if (data.amenities.length > 0) {
      const amenityRows = data.amenities.map((amenity) => ({
        property_id: prop.id,
        amenity,
      }));
      await supabaseAdmin.from("property_amenities").insert(amenityRows);
    }

    // 4. Auditing
    await Promise.all([
      recordAuditEvent({
        actorId: userId,
        action: "PROPERTY_CREATED",
        resourceType: "property",
        resourceId: prop.id,
        afterData: { name: prop.name, status: prop.status },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        requestId,
      }),
      recordAuditEvent({
        actorId: userId,
        action: "PROPERTY_PARTY_ADDED",
        resourceType: "property_party",
        resourceId: prop.id,
        afterData: { relationshipType: "OWNER", status: "ACTIVE" },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        requestId,
      }),
    ]);

    return { success: true, propertyId: prop.id };
  });

export const createProperty = (data: z.infer<typeof CreatePropertySchema>) =>
  fnCreateProperty({ data });

const fnGetProperty = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: propertyId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    // Read access check
    const viewable = await canViewProperty(userId, roles, propertyId, supabaseAdmin);
    if (!viewable) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: You cannot view this property.");
    }

    // Fetch details
    const [propRes, buildingsRes, unitsRes, amenitiesRes, mediaRes, listingsRes, partiesRes] =
      await Promise.all([
        supabaseAdmin.from("properties").select("*").eq("id", propertyId).maybeSingle(),
        supabaseAdmin.from("buildings").select("*").eq("property_id", propertyId),
        supabaseAdmin
          .from("units")
          .select("*")
          .eq("property_id", propertyId)
          .is("deleted_at", null),
        supabaseAdmin.from("property_amenities").select("amenity").eq("property_id", propertyId),
        supabaseAdmin
          .from("property_media")
          .select("*")
          .eq("property_id", propertyId)
          .order("sort_order"),
        supabaseAdmin
          .from("listings")
          .select("*")
          .eq("property_id", propertyId)
          .is("deleted_at", null),
        supabaseAdmin
          .from("property_parties")
          .select("*, profiles(full_name, phone_number)")
          .eq("property_id", propertyId),
      ]);

    if (propRes.error || !propRes.data) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Property not found.");
    }

    return {
      property: propRes.data,
      buildings: buildingsRes.data || [],
      units: unitsRes.data || [],
      amenities: (amenitiesRes.data || []).map((r) => r.amenity),
      media: mediaRes.data || [],
      listings: listingsRes.data || [],
      parties: partiesRes.data || [],
    };
  });

export const getProperty = (propertyId: string) => fnGetProperty({ data: propertyId });

const fnUpdateProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UpdatePropertySchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const authorized = await canUpdateProperty(userId, roles, data.id, supabaseAdmin);
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Unauthorized to modify this property.",
      );
    }

    // Fetch existing state for audit log snapshotting
    const { data: original } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("id", data.id)
      .single();

    // 1. Update core table
    const { data: updated, error } = await supabaseAdmin
      .from("properties")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error || !updated) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to update property.");
    }

    // 2. Sync amenities if provided
    if (data.amenities !== undefined) {
      await supabaseAdmin.from("property_amenities").delete().eq("property_id", data.id);
      if (data.amenities.length > 0) {
        const amenityRows = data.amenities.map((amenity) => ({
          property_id: data.id,
          amenity,
        }));
        await supabaseAdmin.from("property_amenities").insert(amenityRows);
      }
    }

    // 3. Auditing
    await recordAuditEvent({
      actorId: userId,
      action: "PROPERTY_UPDATED",
      resourceType: "property",
      resourceId: data.id,
      beforeData: original as Record<string, unknown>,
      afterData: updated as Record<string, unknown>,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const updateProperty = (data: z.infer<typeof UpdatePropertySchema>) =>
  fnUpdateProperty({ data });

const fnArchiveProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: propertyId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const authorized = await canArchiveProperty(userId, roles, propertyId, supabaseAdmin);
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Only property owners can delete property assets.",
      );
    }

    const { error } = await supabaseAdmin
      .from("properties")
      .update({
        status: "ARCHIVED",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", propertyId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to archive property.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "PROPERTY_ARCHIVED",
      resourceType: "property",
      resourceId: propertyId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const archiveProperty = (propertyId: string) => fnArchiveProperty({ data: propertyId });

// =============================================================
// UNIT OPERATIONS
// =============================================================

const fnCreateUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CreateUnitSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    // Check relationship validation on parent property
    const authorized = await canUpdateProperty(userId, roles, data.propertyId, supabaseAdmin);
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Unauthorized to modify property units.",
      );
    }

    // Verify unit number uniqueness per property/building
    const { data: conflict } = await supabaseAdmin
      .from("units")
      .select("id")
      .eq("property_id", data.propertyId)
      .eq("unit_number", data.unitNumber)
      .is("deleted_at", null)
      .maybeSingle();

    if (conflict) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `Unit number '${data.unitNumber}' already exists on this property.`,
      );
    }

    // 1. Insert unit
    const { data: unit, error } = await supabaseAdmin
      .from("units")
      .insert({
        property_id: data.propertyId,
        building_id: data.buildingId || null,
        unit_number: data.unitNumber,
        unit_type: data.unitType,
        floor: data.floor ?? null,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area ?? null,
        status: data.status,
        description: data.description ?? null,
      })
      .select()
      .single();

    if (error || !unit) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to create unit.");
    }

    // 2. Add amenities
    if (data.amenities.length > 0) {
      const amenityRows = data.amenities.map((amenity) => ({
        unit_id: unit.id,
        amenity,
      }));
      await supabaseAdmin.from("unit_amenities").insert(amenityRows);
    }

    // 3. Auditing
    await recordAuditEvent({
      actorId: userId,
      action: "UNIT_CREATED",
      resourceType: "unit",
      resourceId: unit.id,
      afterData: { unitNumber: unit.unit_number, status: unit.status },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, unitId: unit.id };
  });

export const createUnit = (data: z.infer<typeof CreateUnitSchema>) => fnCreateUnit({ data });

const fnUpdateUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UpdateUnitSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    // Fetch existing unit details
    const { data: original, error: findErr } = await supabaseAdmin
      .from("units")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !original) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Unit not found.");
    }

    // Check relationship validation on parent property
    const authorized = await canUpdateProperty(userId, roles, original.property_id, supabaseAdmin);
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Unauthorized to modify property units.",
      );
    }

    // 1. Update unit
    const { data: updated, error } = await supabaseAdmin
      .from("units")
      .update({
        unit_number: data.unitNumber,
        unit_type: data.unitType,
        floor: data.floor,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        status: data.status,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error || !updated) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to update unit.");
    }

    // 2. Sync amenities
    if (data.amenities !== undefined) {
      await supabaseAdmin.from("unit_amenities").delete().eq("unit_id", data.id);
      if (data.amenities.length > 0) {
        const amenityRows = data.amenities.map((amenity) => ({
          unit_id: data.id,
          amenity,
        }));
        await supabaseAdmin.from("unit_amenities").insert(amenityRows);
      }
    }

    // 3. Auditing
    await recordAuditEvent({
      actorId: userId,
      action: "UNIT_UPDATED",
      resourceType: "unit",
      resourceId: data.id,
      beforeData: original as Record<string, unknown>,
      afterData: updated as Record<string, unknown>,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const updateUnit = (data: z.infer<typeof UpdateUnitSchema>) => fnUpdateUnit({ data });

const fnArchiveUnit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: unitId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: original, error: findErr } = await supabaseAdmin
      .from("units")
      .select("*")
      .eq("id", unitId)
      .single();

    if (findErr || !original) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Unit not found.");
    }

    const authorized = await canUpdateProperty(userId, roles, original.property_id, supabaseAdmin);
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Unauthorized to modify property units.",
      );
    }

    await supabaseAdmin
      .from("units")
      .update({
        status: "ARCHIVED",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", unitId);

    await recordAuditEvent({
      actorId: userId,
      action: "UNIT_ARCHIVED",
      resourceType: "unit",
      resourceId: unitId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const archiveUnit = (unitId: string) => fnArchiveUnit({ data: unitId });

// =============================================================
// LISTING OPERATIONS
// =============================================================

const fnCreateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(CreateListingSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const authorized = await canCreateListing(userId, roles, data.propertyId, supabaseAdmin);
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Unauthorized to create listings for this property.",
      );
    }

    const { data: listing, error } = await supabaseAdmin
      .from("listings")
      .insert({
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
        created_by_user_id: userId,
      })
      .select()
      .single();

    if (error || !listing) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to create listing.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "LISTING_CREATED",
      resourceType: "listing",
      resourceId: listing.id,
      afterData: { title: listing.title, status: listing.status },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, listingId: listing.id };
  });

export const createListing = (data: z.infer<typeof CreateListingSchema>) =>
  fnCreateListing({ data });

const fnGetListing = createServerFn({ method: "GET" })
  .validator(z.string().uuid())
  .handler(async ({ data: listingId }) => {
    // PUBLIC ACCESS SUPPORT: Fetch listing
    const { data: listing, error } = await supabaseAdmin
      .from("listings")
      .select(
        `
        *,
        properties (*),
        units (*)
      `,
      )
      .eq("id", listingId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !listing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }

    // Retrieve associated media, shared amenities, and owner's profile verification status
    const [mediaRes, amenitiesRes, ownerProfileRes] = await Promise.all([
      supabaseAdmin
        .from("property_media")
        .select("*")
        .eq("listing_id", listingId)
        .order("sort_order"),
      supabaseAdmin
        .from("property_amenities")
        .select("amenity")
        .eq("property_id", listing.property_id),
      supabaseAdmin
        .from("profiles")
        .select("identity_verified, agent_verified")
        .eq("id", (listing.properties as any)?.owner_user_id || "")
        .maybeSingle(),
    ]);

    if (listing.properties) {
      const propData = listing.properties as any;
      propData.amenity_list = (amenitiesRes.data || []).map((r) => r.amenity);
      propData.owner_identity_verified = (ownerProfileRes.data as any)?.identity_verified || false;
      propData.owner_agent_verified = (ownerProfileRes.data as any)?.agent_verified || false;
    }

    return {
      listing,
      media: mediaRes.data || [],
    };
  });

export const getListing = (listingId: string) => fnGetListing({ data: listingId });

const fnUpdateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UpdateListingSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: original, error: findErr } = await supabaseAdmin
      .from("listings")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !original) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }

    // Verify ownership/active party authorization on listing property
    const authorized = isPlatformAdmin(roles) || original.created_by_user_id === userId;
    let relationshipOk = authorized;
    if (!relationshipOk) {
      const { data: party } = await supabaseAdmin
        .from("property_parties")
        .select("id")
        .eq("property_id", original.property_id)
        .eq("user_id", userId)
        .eq("status", "ACTIVE")
        .maybeSingle();
      relationshipOk = !!party;
    }

    if (!relationshipOk) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to edit listing.");
    }

    const { data: updated, error } = await supabaseAdmin
      .from("listings")
      .update({
        title: data.title,
        description: data.description,
        status: data.status,
        price: data.price,
        billing_period: data.billingPeriod,
        deposit_amount: data.depositAmount,
        availability_date: data.availabilityDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error || !updated) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to update listing.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "LISTING_UPDATED",
      resourceType: "listing",
      resourceId: data.id,
      beforeData: original as Record<string, unknown>,
      afterData: updated as Record<string, unknown>,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const updateListing = (data: z.infer<typeof UpdateListingSchema>) =>
  fnUpdateListing({ data });

const fnPublishListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: listingId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    // Run structural completeness validation
    const validation = await canPublishListing(userId, roles, listingId, supabaseAdmin);
    if (!validation.authorized) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        validation.reason || "Publish validation check failed.",
      );
    }

    const { error } = await supabaseAdmin
      .from("listings")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to publish listing.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "LISTING_PUBLISHED",
      resourceType: "listing",
      resourceId: listingId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const publishListing = (listingId: string) => fnPublishListing({ data: listingId });

const fnPauseListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: listingId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: original, error: findErr } = await supabaseAdmin
      .from("listings")
      .select("property_id, created_by_user_id")
      .eq("id", listingId)
      .single();

    if (findErr || !original) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }

    const authorized = isPlatformAdmin(roles) || original.created_by_user_id === userId;
    let relationshipOk = authorized;
    if (!relationshipOk) {
      const { data: party } = await supabaseAdmin
        .from("property_parties")
        .select("id")
        .eq("property_id", original.property_id)
        .eq("user_id", userId)
        .eq("status", "ACTIVE")
        .maybeSingle();
      relationshipOk = !!party;
    }

    if (!relationshipOk) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to pause listing.");
    }

    const { error } = await supabaseAdmin
      .from("listings")
      .update({ status: "PAUSED" })
      .eq("id", listingId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to pause listing.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "LISTING_PAUSED",
      resourceType: "listing",
      resourceId: listingId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const pauseListing = (listingId: string) => fnPauseListing({ data: listingId });

const fnArchiveListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: listingId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: original, error: findErr } = await supabaseAdmin
      .from("listings")
      .select("property_id, created_by_user_id")
      .eq("id", listingId)
      .single();

    if (findErr || !original) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }

    const authorized = isPlatformAdmin(roles) || original.created_by_user_id === userId;
    let relationshipOk = authorized;
    if (!relationshipOk) {
      const { data: party } = await supabaseAdmin
        .from("property_parties")
        .select("id")
        .eq("property_id", original.property_id)
        .eq("user_id", userId)
        .eq("status", "ACTIVE")
        .maybeSingle();
      relationshipOk = !!party;
    }

    if (!relationshipOk) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access Denied: Unauthorized to archive listing.");
    }

    const { error } = await supabaseAdmin
      .from("listings")
      .update({
        status: "ARCHIVED",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to archive listing.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "LISTING_ARCHIVED",
      resourceType: "listing",
      resourceId: listingId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const archiveListing = (listingId: string) => fnArchiveListing({ data: listingId });

// =============================================================
// MEDIA & RELATIONSHIP OPERATIONS
// =============================================================

const fnAddPropertyMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AddMediaSchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    // Verify parent container write access
    const propId = data.propertyId;
    if (!propId) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Property reference propertyId is mandatory.");
    }

    const authorized = await canUpdateProperty(userId, roles, propId, supabaseAdmin);
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Unauthorized to modify property media.",
      );
    }

    // Insert media
    const { data: media, error } = await supabaseAdmin
      .from("property_media")
      .insert({
        property_id: data.propertyId || null,
        unit_id: data.unitId || null,
        listing_id: data.listingId || null,
        media_type: data.mediaType,
        url: data.url,
        storage_key: data.storageKey || null,
        caption: data.caption || null,
        sort_order: data.sortOrder,
        is_primary: data.isPrimary,
      })
      .select()
      .single();

    if (error || !media) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to add media.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "MEDIA_ADDED",
      resourceType: "media",
      resourceId: media.id,
      afterData: { url: media.url },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, mediaId: media.id };
  });

export const addPropertyMedia = (data: z.infer<typeof AddMediaSchema>) =>
  fnAddPropertyMedia({ data });

const fnRemovePropertyMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: mediaId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: media, error: findErr } = await supabaseAdmin
      .from("property_media")
      .select("*")
      .eq("id", mediaId)
      .single();

    if (findErr || !media) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Media not found.");
    }

    const authorized = await canUpdateProperty(
      userId,
      roles,
      media.property_id || "",
      supabaseAdmin,
    );
    if (!authorized) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Unauthorized to modify property media.",
      );
    }

    await supabaseAdmin.from("property_media").delete().eq("id", mediaId);

    await recordAuditEvent({
      actorId: userId,
      action: "MEDIA_REMOVED",
      resourceType: "media",
      resourceId: mediaId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const removePropertyMedia = (mediaId: string) => fnRemovePropertyMedia({ data: mediaId });

const fnAddPropertyParty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AddPartySchema)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    // Verify user owns the property
    const { data: prop, error: findErr } = await supabaseAdmin
      .from("properties")
      .select("owner_user_id")
      .eq("id", data.propertyId)
      .single();

    if (findErr || !prop) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Property not found.");
    }

    const isOwner = prop.owner_user_id === userId || isPlatformAdmin(roles);
    if (!isOwner) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Only property owners can add parties.",
      );
    }

    const { data: party, error } = await supabaseAdmin
      .from("property_parties")
      .insert({
        property_id: data.propertyId,
        user_id: data.userId,
        relationship_type: data.relationshipType,
        status: data.status,
      })
      .select()
      .single();

    if (error || !party) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        error?.message || "Failed to add property party relationship.",
      );
    }

    await recordAuditEvent({
      actorId: userId,
      action: "PROPERTY_PARTY_ADDED",
      resourceType: "property_party",
      resourceId: party.id,
      afterData: { userId: party.user_id, relationshipType: party.relationship_type },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, partyId: party.id };
  });

export const addPropertyParty = (data: z.infer<typeof AddPartySchema>) =>
  fnAddPropertyParty({ data });

const fnRemovePropertyParty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: partyId, context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];
    const { requestId, meta } = getContextMeta();

    const { data: party, error: findErr } = await supabaseAdmin
      .from("property_parties")
      .select("*, properties(owner_user_id)")
      .eq("id", partyId)
      .single();

    if (findErr || !party) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Party relationship not found.");
    }

    const prop = party.properties as unknown as { owner_user_id: string } | null;
    const isOwner = (prop && prop.owner_user_id === userId) || isPlatformAdmin(roles);
    if (!isOwner) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Access Denied: Only property owners can remove parties.",
      );
    }

    // Revoke relationship
    await supabaseAdmin
      .from("property_parties")
      .update({ status: "REVOKED", updated_at: new Date().toISOString() })
      .eq("id", partyId);

    await recordAuditEvent({
      actorId: userId,
      action: "PROPERTY_PARTY_REMOVED",
      resourceType: "property_party",
      resourceId: partyId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const removePropertyParty = (partyId: string) => fnRemovePropertyParty({ data: partyId });

// =============================================================
// LISTING BULK QUERIES FOR MANAGEMENT DASHBOARD & DISCOVERY
// =============================================================

export const getMyProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    if (isPlatformAdmin(roles)) {
      // Admins see all properties
      const { data } = await supabaseAdmin
        .from("properties")
        .select(
          `
          *,
          units(count)
        `,
        )
        .is("deleted_at", null);
      return data || [];
    }

    // Landlords / Agents see properties they are active parties of
    const { data: partyRows } = await supabaseAdmin
      .from("property_parties")
      .select("property_id")
      .eq("user_id", userId)
      .eq("status", "ACTIVE");

    const propertyIds = (partyRows || []).map((r) => r.property_id);
    if (propertyIds.length === 0) return [];

    const { data } = await supabaseAdmin
      .from("properties")
      .select(
        `
        *,
        units(count)
      `,
      )
      .in("id", propertyIds)
      .is("deleted_at", null);

    return data || [];
  });

export const getMyListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const roles = (claims["roles"] || []) as AppRole[];

    if (isPlatformAdmin(roles)) {
      const { data } = await supabaseAdmin
        .from("listings")
        .select("*, properties(name, county, town)")
        .is("deleted_at", null);
      return data || [];
    }

    // Listings created by user, or properties user manages
    const { data: partyRows } = await supabaseAdmin
      .from("property_parties")
      .select("property_id")
      .eq("user_id", userId)
      .eq("status", "ACTIVE");

    const propertyIds = (partyRows || []).map((r) => r.property_id);

    const { data } = await supabaseAdmin
      .from("listings")
      .select("*, properties(name, county, town)")
      .or(`created_by_user_id.eq.${userId},property_id.in.(${propertyIds.join(",")})`)
      .is("deleted_at", null);

    return data || [];
  });

export const getPublicListings = createServerFn({ method: "GET" }).handler(async () => {
  // Retrieve published listings for landing page search cards
  const { data } = await supabaseAdmin
    .from("listings")
    .select(
      `
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
      `,
    )
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  // Fetch primary images for each listing
  const listingIds = (data || []).map((l) => l.id);
  const { data: mediaRows } = await supabaseAdmin
    .from("property_media")
    .select("listing_id, url")
    .in("listing_id", listingIds)
    .eq("is_primary", true);

  const mediaMap = (mediaRows || []).reduce(
    (acc, row) => {
      if (row.listing_id) acc[row.listing_id] = row.url;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (data || []).map((listing) => ({
    ...listing,
    primaryImageUrl: mediaMap[listing.id] || null,
  }));
});
