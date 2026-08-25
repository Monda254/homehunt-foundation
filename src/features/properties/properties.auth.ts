import { type SupabaseClient } from "@supabase/supabase-js";
import { type AppRole, isPlatformAdmin, hasPermission } from "@/core/auth/roles";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";

/**
 * Checks if the user is authorized to view a specific property.
 * A property is viewable if:
 * 1. The property status is 'ACTIVE'.
 * 2. The user is the owner or creator.
 * 3. The user is an active party (agent, manager, etc.) of that property.
 * 4. The user is a platform administrator.
 */
export async function canViewProperty(
  userId: string | null,
  roles: readonly AppRole[],
  propertyId: string,
  supabase: SupabaseClient,
): Promise<boolean> {
  if (isPlatformAdmin(roles)) return true;

  const { data: prop, error } = await supabase
    .from("properties")
    .select("status, owner_user_id, created_by_user_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !prop) return false;

  // Active properties are visible to everyone
  if (prop.status === "ACTIVE") return true;

  if (!userId) return false;

  // Owner or creator check
  if (prop.owner_user_id === userId || prop.created_by_user_id === userId) return true;

  // Active party relationship check
  const { data: party } = await supabase
    .from("property_parties")
    .select("id")
    .eq("property_id", propertyId)
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  return !!party;
}

/**
 * Checks if the user is authorized to update a specific property.
 * A user can update a property if:
 * 1. The user is the owner.
 * 2. The user has the PROPERTY_UPDATE permission AND is an active party of the property (agent/manager).
 * 3. The user is a platform administrator.
 */
export async function canUpdateProperty(
  userId: string | null,
  roles: readonly AppRole[],
  propertyId: string,
  supabase: SupabaseClient,
): Promise<boolean> {
  if (isPlatformAdmin(roles)) return true;
  if (!userId) return false;

  const { data: prop, error } = await supabase
    .from("properties")
    .select("owner_user_id, status")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !prop) return false;
  if (prop.status === "ARCHIVED") return false;

  // Owner check
  if (prop.owner_user_id === userId) return true;

  // Active party with permissions check
  if (hasPermission(roles, "PROPERTY_UPDATE")) {
    const { data: party } = await supabase
      .from("property_parties")
      .select("id")
      .eq("property_id", propertyId)
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .maybeSingle();

    return !!party;
  }

  return false;
}

/**
 * Checks if the user can archive a specific property (requires owner or admin).
 */
export async function canArchiveProperty(
  userId: string | null,
  roles: readonly AppRole[],
  propertyId: string,
  supabase: SupabaseClient,
): Promise<boolean> {
  if (isPlatformAdmin(roles)) return true;
  if (!userId) return false;

  const { data: prop, error } = await supabase
    .from("properties")
    .select("owner_user_id, status")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !prop) return false;
  if (prop.status === "ARCHIVED") return false;

  // Owner check
  if (prop.owner_user_id === userId) return true;

  return false;
}

/**
 * Checks if the user is authorized to create a listing for a property.
 * Requires ownership, active agent/manager relationship, or admin overrides.
 */
export async function canCreateListing(
  userId: string | null,
  roles: readonly AppRole[],
  propertyId: string,
  supabase: SupabaseClient,
): Promise<boolean> {
  if (isPlatformAdmin(roles)) return true;
  if (!userId) return false;

  const { data: prop, error } = await supabase
    .from("properties")
    .select("owner_user_id, status")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !prop) return false;
  if (prop.status !== "ACTIVE" && prop.status !== "DRAFT") return false;

  // Owner check
  if (prop.owner_user_id === userId) return true;

  // Active party checking
  if (hasPermission(roles, "LISTING_CREATE")) {
    const { data: party } = await supabase
      .from("property_parties")
      .select("id")
      .eq("property_id", propertyId)
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .maybeSingle();

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
export async function canPublishListing(
  userId: string | null,
  roles: readonly AppRole[],
  listingId: string,
  supabase: SupabaseClient,
): Promise<{ authorized: boolean; reason?: string }> {
  if (!userId) return { authorized: false, reason: "Unauthenticated request." };

  // Fetch listing and related property details
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, properties(owner_user_id, status)")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !listing) {
    return { authorized: false, reason: "Listing not found." };
  }

  const prop = listing.properties as unknown as { owner_user_id: string; status: string } | null;
  if (!prop) {
    return { authorized: false, reason: "Property reference not found." };
  }

  // 1. Check relationship authorization
  let authorized = isPlatformAdmin(roles) || prop.owner_user_id === userId;
  if (!authorized && hasPermission(roles, "LISTING_PUBLISH")) {
    const { data: party } = await supabase
      .from("property_parties")
      .select("id")
      .eq("property_id", listing.property_id)
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .maybeSingle();

    authorized = !!party;
  }

  if (!authorized) {
    return { authorized: false, reason: "User is not authorized to publish this listing." };
  }

  // 2. Validate mandatory listing fields
  if (!listing.title || listing.title.trim().length < 5) {
    return { authorized: false, reason: "Listing title is too short (min 5 characters)." };
  }
  if (!listing.description || listing.description.trim().length < 10) {
    return { authorized: false, reason: "Listing description is too short (min 10 characters)." };
  }
  if (listing.price === null || listing.price === undefined || listing.price < 0) {
    return { authorized: false, reason: "Listing price must be a non-negative number." };
  }
  if (!listing.availability_date) {
    return { authorized: false, reason: "Listing availability date is required." };
  }

  // 3. Validate primary media is present
  const { data: media } = await supabase
    .from("property_media")
    .select("id")
    .eq("listing_id", listingId)
    .eq("is_primary", true)
    .maybeSingle();

  if (!media) {
    return {
      authorized: false,
      reason: "At least one primary listing image is required before publishing.",
    };
  }

  return { authorized: true };
}
