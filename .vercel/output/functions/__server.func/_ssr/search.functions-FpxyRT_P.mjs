import { i as createServerFn } from "./server-Dy3VKkCi.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-CUUESrGA.mjs";
import { a as enumType, c as objectType, d as stringType, t as anyType } from "../_libs/zod.mjs";
import { n as supabaseAdmin } from "./client.server-KNnxUzUb.mjs";
import { t as supabase } from "./client-Blvxy4_Y.mjs";
import { t as SearchListingsSchema } from "./search.types-M7Ux6mOs.mjs";
import { t as createServerRpc } from "./createServerRpc-fDPuksr0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search.functions-FpxyRT_P.js
var db$1 = supabase;
var ListingSearchRepository = class {
	async search(filters) {
		let query = db$1.from("listings_search_view").select("*", { count: "exact" });
		query = query.eq("listing_status", "PUBLISHED");
		query = query.is("listing_deleted_at", null);
		if (filters.q && filters.q.trim()) {
			const term = `%${filters.q.trim().replace(/[\\%_]/g, "\\$&")}%`;
			query = query.or(`county.ilike.${term},town.ilike.${term},neighborhood.ilike.${term},estate.ilike.${term},landmark_description.ilike.${term},listing_title.ilike.${term},property_name.ilike.${term}`);
		}
		if (filters.county) query = query.eq("county", filters.county);
		if (filters.town) query = query.eq("town", filters.town);
		if (filters.neighborhood) query = query.eq("neighborhood", filters.neighborhood);
		if (filters.estate) query = query.eq("estate", filters.estate);
		if (filters.minPrice !== void 0) query = query.gte("price", filters.minPrice);
		if (filters.maxPrice !== void 0) query = query.lte("price", filters.maxPrice);
		if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
		if (filters.unitType) query = query.eq("unit_type", filters.unitType);
		if (filters.verifiedOnly) query = query.eq("property_verification_status", "VERIFIED");
		if (filters.bedrooms !== void 0) query = query.gte("bedrooms", filters.bedrooms);
		if (filters.bathrooms !== void 0) query = query.gte("bathrooms", filters.bathrooms);
		if (filters.amenities && filters.amenities.length > 0) query = query.contains("property_amenities", filters.amenities);
		if (filters.availabilityDate) query = query.lte("availability_date", filters.availabilityDate);
		if (filters.bounds) query = query.gte("latitude", filters.bounds.south).lte("latitude", filters.bounds.north).gte("longitude", filters.bounds.west).lte("longitude", filters.bounds.east);
		switch (filters.sort) {
			case "NEWEST":
				query = query.order("published_at", {
					ascending: false,
					nullsFirst: false
				}).order("listing_created_at", { ascending: false });
				break;
			case "PRICE_ASC":
				query = query.order("price", { ascending: true }).order("published_at", {
					ascending: false,
					nullsFirst: false
				});
				break;
			case "PRICE_DESC":
				query = query.order("price", { ascending: false }).order("published_at", {
					ascending: false,
					nullsFirst: false
				});
				break;
			case "AVAILABILITY":
				query = query.order("availability_date", { ascending: true }).order("published_at", {
					ascending: false,
					nullsFirst: false
				});
				break;
			default: query = query.order("published_at", {
				ascending: false,
				nullsFirst: false
			}).order("listing_created_at", { ascending: false });
		}
		const limit = Math.min(filters.limit || 20, 50);
		const from = ((filters.page || 1) - 1) * limit;
		const to = from + limit - 1;
		query = query.range(from, to);
		const { data, count, error } = await query;
		if (error) {
			console.error("[ListingSearchRepository] Query error:", error);
			throw error;
		}
		return {
			items: data || [],
			count: count || 0
		};
	}
	async getLocations(q) {
		const term = `%${q.trim().replace(/[\\%_]/g, "\\$&")}%`;
		const { data, error } = await db$1.from("properties").select("county, town, neighborhood").eq("status", "ACTIVE").or(`county.ilike.${term},town.ilike.${term},neighborhood.ilike.${term}`).limit(10);
		if (error) throw error;
		return data || [];
	}
	async getReferenceData() {
		const [propertiesRes, amenitiesRes] = await Promise.all([db$1.from("properties").select("county, town").eq("status", "ACTIVE"), db$1.from("property_amenities").select("amenity")]);
		if (propertiesRes.error) throw propertiesRes.error;
		if (amenitiesRes.error) throw amenitiesRes.error;
		const propertiesData = propertiesRes.data || [];
		const amenitiesData = amenitiesRes.data || [];
		return {
			counties: Array.from(new Set(propertiesData.map((p) => p.county))),
			towns: Array.from(new Set(propertiesData.map((p) => p.town))),
			amenities: Array.from(new Set(amenitiesData.map((a) => a.amenity)))
		};
	}
};
var ListingSearchService = class {
	repository = new ListingSearchRepository();
	async search(rawFilters) {
		const filters = SearchListingsSchema.parse(rawFilters);
		const { items: dbItems, count } = await this.repository.search(filters);
		const mappedItems = dbItems.map((item) => {
			const displayLat = this.getDisplayCoordinate(item.listing_id, item.latitude);
			const displayLng = this.getDisplayCoordinate(item.listing_id, item.longitude);
			return {
				id: item.listing_id,
				title: item.listing_title,
				description: item.listing_description,
				listingType: item.listing_type,
				price: Number(item.price),
				currency: item.currency,
				billingPeriod: item.billing_period,
				depositAmount: item.deposit_amount ? Number(item.deposit_amount) : null,
				availabilityDate: item.availability_date,
				publishedAt: item.published_at,
				propertyId: item.property_id,
				propertyType: item.property_type,
				propertyName: item.property_name,
				county: item.county,
				town: item.town,
				neighborhood: item.neighborhood,
				estate: item.estate,
				address: item.address,
				latitude: item.latitude ? Number(item.latitude) : null,
				longitude: item.longitude ? Number(item.longitude) : null,
				displayLatitude: displayLat,
				displayLongitude: displayLng,
				landmarkDescription: item.landmark_description,
				unitId: item.unit_id,
				unitType: item.unit_type,
				floor: item.floor,
				bedrooms: item.bedrooms,
				bathrooms: item.bathrooms,
				area: item.area ? Number(item.area) : null,
				propertyAmenities: item.property_amenities || [],
				primaryImageUrl: item.primary_image_url,
				propertyVerificationStatus: item.property_verification_status || "UNVERIFIED",
				listingVerificationStatus: item.listing_verification_status || "UNVERIFIED",
				freshnessStatus: item.listing_freshness_status || "CURRENT",
				ownerIdentityVerified: item.owner_identity_verified || false,
				ownerAgentVerified: item.owner_agent_verified || false
			};
		});
		const limit = Math.min(filters.limit || 20, 50);
		return {
			items: mappedItems,
			total: count,
			page: filters.page || 1,
			totalPages: Math.ceil(count / limit),
			limit
		};
	}
	async getSuggestions(q) {
		if (!q || q.trim().length < 2) return [];
		const results = await this.repository.getLocations(q);
		const suggestions = [];
		results.forEach((row) => {
			if (row.neighborhood) suggestions.push(`${row.neighborhood}, ${row.town}`);
			if (row.town) suggestions.push(`${row.town}, ${row.county}`);
			if (row.county) suggestions.push(`${row.county} County`);
		});
		return Array.from(new Set(suggestions)).slice(0, 5);
	}
	async getReferences() {
		return this.repository.getReferenceData();
	}
	/**
	* Generates a stable, pseudo-random coordinate offset to protect landlord privacy on maps.
	*/
	getDisplayCoordinate(id, coord) {
		if (coord === null || coord === void 0) return null;
		const numCoord = Number(coord);
		const offset = (id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100 / 100 - .5) * .006;
		return Number((numCoord + offset).toFixed(6));
	}
};
var searchService = new ListingSearchService();
var db = supabaseAdmin;
var searchListings_createServerFn_handler = createServerRpc({
	id: "70f1b9a1e2efd1fd11235198393599c4c3f60e876196eac7d47fb063e311b46b",
	name: "searchListings",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => searchListings.__executeServer(opts));
var searchListings = createServerFn({ method: "GET" }).validator((data) => data).handler(searchListings_createServerFn_handler, async ({ data }) => {
	try {
		return await searchService.search(data);
	} catch (err) {
		console.error("[searchListings] Error:", err);
		const msg = err instanceof Error ? err.message : "Search failed.";
		throw new AppError(ERROR_CODES.BAD_REQUEST, msg);
	}
});
var getLocationSuggestions_createServerFn_handler = createServerRpc({
	id: "bd1dce0244a703cb48fec211207a77ff19d75014e76127085a179e6c34f1ec51",
	name: "getLocationSuggestions",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => getLocationSuggestions.__executeServer(opts));
var getLocationSuggestions = createServerFn({ method: "GET" }).validator(stringType()).handler(getLocationSuggestions_createServerFn_handler, async ({ data: q }) => {
	try {
		return await searchService.getSuggestions(q);
	} catch (err) {
		console.error("[getLocationSuggestions] Error:", err);
		return [];
	}
});
var getReferenceData_createServerFn_handler = createServerRpc({
	id: "72db247065ba4b16b254ea93e22ca7cbce6371bc8afdd6573c2647e9db07de82",
	name: "getReferenceData",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => getReferenceData.__executeServer(opts));
var getReferenceData = createServerFn({ method: "GET" }).handler(getReferenceData_createServerFn_handler, async () => {
	try {
		return await searchService.getReferences();
	} catch (err) {
		console.error("[getReferenceData] Error:", err);
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve reference data.");
	}
});
var logSearchAnalytics_createServerFn_handler = createServerRpc({
	id: "a0b24ad2592b0c26e0f666a9d848e3e76595c2588fa9204772c2512e1c366be8",
	name: "logSearchAnalytics",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => logSearchAnalytics.__executeServer(opts));
var logSearchAnalytics = createServerFn({ method: "POST" }).validator(objectType({
	eventType: enumType([
		"SEARCH_PERFORMED",
		"FILTER_APPLIED",
		"FILTER_REMOVED",
		"LISTING_VIEWED",
		"MAP_OPENED",
		"MAP_AREA_CHANGED",
		"SORT_CHANGED"
	]),
	payload: anyType()
})).handler(logSearchAnalytics_createServerFn_handler, async ({ data, context }) => {
	const userId = context?.userId || null;
	try {
		await db.from("search_analytics_events").insert({
			user_id: userId,
			event_type: data.eventType,
			payload: data.payload
		});
		return { success: true };
	} catch (err) {
		console.error("[logSearchAnalytics] Failed to record search event:", err);
		return { success: false };
	}
});
var createSavedSearch_createServerFn_handler = createServerRpc({
	id: "01b9389a46fd186b388f9608190b9250fd07267f66c9b6ad99595248c8dc7de2",
	name: "createSavedSearch",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => createSavedSearch.__executeServer(opts));
var createSavedSearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	name: stringType().min(1).max(100),
	filters: anyType()
})).handler(createSavedSearch_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { data: saved, error } = await db.from("saved_searches").insert({
		user_id: userId,
		name: data.name,
		filters: data.filters
	}).select("id").single();
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
	return {
		success: true,
		id: saved.id
	};
});
var getSavedSearches_createServerFn_handler = createServerRpc({
	id: "0158151f137032a3167b24ec0b1c6f0d01fed1596cb7384e0a201eec77940166",
	name: "getSavedSearches",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => getSavedSearches.__executeServer(opts));
var getSavedSearches = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getSavedSearches_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { data, error } = await db.from("saved_searches").select("*").eq("user_id", userId).order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
	return data || [];
});
var deleteSavedSearch_createServerFn_handler = createServerRpc({
	id: "4d135bf91454122ed5dbfec179c3bfd2d01a16f1c07f747fec45bf2a58b500f3",
	name: "deleteSavedSearch",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => deleteSavedSearch.__executeServer(opts));
var deleteSavedSearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(deleteSavedSearch_createServerFn_handler, async ({ data: id, context }) => {
	const { userId } = context;
	const { error } = await db.from("saved_searches").delete().eq("id", id).eq("user_id", userId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
	return { success: true };
});
var addFavorite_createServerFn_handler = createServerRpc({
	id: "0fae67e55638e22c9ab123fa0f633497293cce18271613b2579ab1a7d558c045",
	name: "addFavorite",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => addFavorite.__executeServer(opts));
var addFavorite = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(addFavorite_createServerFn_handler, async ({ data: listingId, context }) => {
	const { userId } = context;
	const { error } = await db.from("favorites").insert({
		user_id: userId,
		listing_id: listingId
	});
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
	return { success: true };
});
var removeFavorite_createServerFn_handler = createServerRpc({
	id: "1afc78168e94499b68f95f83bb27a04873b4e96fb70226cdc94f3e68980f3acf",
	name: "removeFavorite",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => removeFavorite.__executeServer(opts));
var removeFavorite = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(removeFavorite_createServerFn_handler, async ({ data: listingId, context }) => {
	const { userId } = context;
	const { error } = await db.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
	return { success: true };
});
var getFavorites_createServerFn_handler = createServerRpc({
	id: "30d62791bc2668baefe07364f1a20261361b50435dfd9216f7697300fa8cb2fe",
	name: "getFavorites",
	filename: "src/features/properties/search.functions.ts"
}, (opts) => getFavorites.__executeServer(opts));
var getFavorites = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getFavorites_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { data, error } = await db.from("favorites").select(`
        id,
        listing_id,
        created_at,
        listings (
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
        )
      `).eq("user_id", userId).order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
	const listingIds = (data || []).map((f) => f.listing_id);
	const { data: mediaRows } = await supabaseAdmin.from("property_media").select("listing_id, url").in("listing_id", listingIds).eq("is_primary", true);
	const mediaMap = (mediaRows || []).reduce((acc, row) => {
		if (row.listing_id) acc[row.listing_id] = row.url;
		return acc;
	}, {});
	return (data || []).map((fav) => ({
		id: fav.id,
		listingId: fav.listing_id,
		createdAt: fav.created_at,
		listing: fav.listings ? {
			...fav.listings,
			primaryImageUrl: mediaMap[fav.listing_id] || null
		} : null
	}));
});
//#endregion
export { addFavorite_createServerFn_handler, createSavedSearch_createServerFn_handler, deleteSavedSearch_createServerFn_handler, getFavorites_createServerFn_handler, getLocationSuggestions_createServerFn_handler, getReferenceData_createServerFn_handler, getSavedSearches_createServerFn_handler, logSearchAnalytics_createServerFn_handler, removeFavorite_createServerFn_handler, searchListings_createServerFn_handler };
