import { a as getRequest, i as createServerFn } from "./server-BRCrXnf-.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-C5p6KfDB.mjs";
import { d as stringType } from "../_libs/zod.mjs";
import { n as supabaseAdmin$1 } from "./client.server-Ma94aMcQ.mjs";
import { a as resolveRequestId } from "./request-id-Du7XsDoM.mjs";
import { t as createServerRpc } from "./createServerRpc-QTbvBIhf.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-Bceddfrr.mjs";
import { i as UserPreferencesInputSchema, n as RecommendationFeedbackSchema, r as SaveSearchSchema, t as DEFAULT_PRIORITY_SCORES } from "./matching.types-PEIC8pz-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matching.functions-jaTN10Cw.js
var supabaseAdmin = supabaseAdmin$1;
function getContextMeta() {
	const request = getRequest();
	return {
		requestId: resolveRequestId(request?.headers),
		meta: auditMetadataFromRequest(request)
	};
}
var fnSaveUserPreferences_createServerFn_handler = createServerRpc({
	id: "161f3d29a540e7478f8cb373894209f732c87a4d636030a9700bf3571c31a2f1",
	name: "fnSaveUserPreferences",
	filename: "src/features/properties/matching.functions.ts"
}, (opts) => fnSaveUserPreferences.__executeServer(opts));
var fnSaveUserPreferences = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UserPreferencesInputSchema).handler(fnSaveUserPreferences_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const payload = {
		user_id: userId,
		min_budget: data.minBudget ?? null,
		max_budget: data.maxBudget ?? null,
		preferred_budget: data.preferredBudget ?? null,
		property_types: data.propertyTypes,
		bedrooms: data.bedrooms ?? null,
		bedrooms_rule: data.bedroomsRule,
		bathrooms: data.bathrooms ?? null,
		bathrooms_rule: data.bathroomsRule,
		move_in_date: data.moveInDate || null,
		preferred_locations: JSON.stringify(data.preferredLocations),
		amenities: JSON.stringify(data.amenities),
		furnishing_preference: data.furnishingPreference,
		priority_weights: JSON.stringify(data.priorityWeights),
		use_behavioral_personalization: data.useBehavioralPersonalization
	};
	const { error } = await supabaseAdmin.from("user_preferences").upsert(payload, { onConflict: "user_id" });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, error.message || "Failed to save user housing preferences.");
	await recordAuditEvent({
		actorId: userId,
		action: "PREFERENCE_CHANGED",
		resourceType: "user_preferences",
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
async function getUserPreferencesInternal(userId) {
	const { data, error } = await supabaseAdmin.from("user_preferences").select("*").eq("user_id", userId).maybeSingle();
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve user preferences.");
	if (!data) return {
		propertyTypes: [],
		bedroomsRule: "MIN",
		bathroomsRule: "MIN",
		preferredLocations: [],
		amenities: [],
		furnishingPreference: "ANY",
		priorityWeights: {
			budget: "CRITICAL",
			location: "CRITICAL",
			bedrooms: "HIGH",
			bathrooms: "MEDIUM",
			amenities: "MEDIUM",
			propertyType: "HIGH"
		},
		useBehavioralPersonalization: true
	};
	const preferredLocations = typeof data.preferred_locations === "string" ? JSON.parse(data.preferred_locations) : data.preferred_locations || [];
	const amenities = typeof data.amenities === "string" ? JSON.parse(data.amenities) : data.amenities || [];
	const priorityWeights = typeof data.priority_weights === "string" ? JSON.parse(data.priority_weights) : data.priority_weights || {};
	return {
		minBudget: data.min_budget ? Number(data.min_budget) : void 0,
		maxBudget: data.max_budget ? Number(data.max_budget) : void 0,
		preferredBudget: data.preferred_budget ? Number(data.preferred_budget) : void 0,
		propertyTypes: data.property_types || [],
		bedrooms: data.bedrooms !== null ? Number(data.bedrooms) : void 0,
		bedroomsRule: data.bedrooms_rule || "MIN",
		bathrooms: data.bathrooms !== null ? Number(data.bathrooms) : void 0,
		bathroomsRule: data.bathrooms_rule || "MIN",
		moveInDate: data.move_in_date || void 0,
		preferredLocations,
		amenities,
		furnishingPreference: data.furnishing_preference || "ANY",
		priorityWeights,
		useBehavioralPersonalization: !!data.use_behavioral_personalization
	};
}
var fnGetUserPreferences_createServerFn_handler = createServerRpc({
	id: "3b3bf9595214e704f4c2ee2bfe39571e260535193e0b23e3a61880dec81337b8",
	name: "fnGetUserPreferences",
	filename: "src/features/properties/matching.functions.ts"
}, (opts) => fnGetUserPreferences.__executeServer(opts));
var fnGetUserPreferences = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnGetUserPreferences_createServerFn_handler, async ({ context }) => {
	return getUserPreferencesInternal(context.userId);
});
var fnSaveSearch_createServerFn_handler = createServerRpc({
	id: "238615ca9f80e8c23afb79cf8ad69dbfb81756063a3cff1b7c5b0f2126c60ee5",
	name: "fnSaveSearch",
	filename: "src/features/properties/matching.functions.ts"
}, (opts) => fnSaveSearch.__executeServer(opts));
var fnSaveSearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SaveSearchSchema).handler(fnSaveSearch_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { requestId, meta } = getContextMeta();
	const { data: savedSearch, error } = await supabaseAdmin.from("saved_searches").insert({
		user_id: userId,
		name: data.name,
		criteria: JSON.stringify(data.criteria)
	}).select().single();
	if (error || !savedSearch) throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to save search query.");
	await recordAuditEvent({
		actorId: userId,
		action: "SAVED_SEARCH_CREATED",
		resourceType: "saved_search",
		resourceId: savedSearch.id,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		success: true,
		savedSearchId: savedSearch.id
	};
});
var fnListSavedSearches_createServerFn_handler = createServerRpc({
	id: "684cb65a44c3305e8b843b02745487af46657526fd937da4401639cf09f06bc2",
	name: "fnListSavedSearches",
	filename: "src/features/properties/matching.functions.ts"
}, (opts) => fnListSavedSearches.__executeServer(opts));
var fnListSavedSearches = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnListSavedSearches_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const { data, error } = await supabaseAdmin.from("saved_searches").select("*").eq("user_id", userId).order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve saved searches.");
	return (data || []).map((row) => ({
		id: row.id,
		name: row.name,
		criteria: typeof row.criteria === "string" ? JSON.parse(row.criteria) : row.criteria,
		createdAt: row.created_at
	}));
});
var fnDeleteSavedSearch_createServerFn_handler = createServerRpc({
	id: "63a11dd2b9f8b4e4ef667c139092a618f901cba4dac0c57e2f7a59c1ebb68a66",
	name: "fnDeleteSavedSearch",
	filename: "src/features/properties/matching.functions.ts"
}, (opts) => fnDeleteSavedSearch.__executeServer(opts));
var fnDeleteSavedSearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(fnDeleteSavedSearch_createServerFn_handler, async ({ data: searchId, context }) => {
	const { userId } = context;
	const { error } = await supabaseAdmin.from("saved_searches").delete().eq("id", searchId).eq("user_id", userId);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to delete saved search.");
	return { success: true };
});
var fnSubmitRecommendationFeedback_createServerFn_handler = createServerRpc({
	id: "cac6dc7191130ac345ffff8ad59c22051d95b1be2dd2ba861809e289fdf9ce8e",
	name: "fnSubmitRecommendationFeedback",
	filename: "src/features/properties/matching.functions.ts"
}, (opts) => fnSubmitRecommendationFeedback.__executeServer(opts));
var fnSubmitRecommendationFeedback = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RecommendationFeedbackSchema).handler(fnSubmitRecommendationFeedback_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { error } = await supabaseAdmin.from("recommendation_feedback").upsert({
		user_id: userId,
		listing_id: data.listingId,
		feedback_type: data.feedbackType
	}, { onConflict: "user_id, listing_id, feedback_type" });
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to submit recommendation feedback.");
	if (data.feedbackType === "HIDE" || data.feedbackType === "DISLIKE") await supabaseAdmin.from("recommendation_history").insert({
		user_id: userId,
		listing_id: data.listingId,
		hidden_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	return { success: true };
});
var fnGetRecommendations_createServerFn_handler = createServerRpc({
	id: "a57b8be53f67227a7811d760ac5b83b4732c09c0596a898fe42d647fe69ad8c1",
	name: "fnGetRecommendations",
	filename: "src/features/properties/matching.functions.ts"
}, (opts) => fnGetRecommendations.__executeServer(opts));
var fnGetRecommendations = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(fnGetRecommendations_createServerFn_handler, async ({ context }) => {
	const { userId } = context;
	const prefs = await getUserPreferencesInternal(userId);
	const { data: hiddenData } = await supabaseAdmin.from("recommendation_feedback").select("listing_id").eq("user_id", userId).eq("feedback_type", "HIDE");
	const hiddenIds = (hiddenData || []).map((row) => row.listing_id);
	let query = supabaseAdmin.from("listings_search_view").select("*").eq("listing_status", "PUBLISHED");
	if (hiddenIds.length > 0) query = query.not("listing_id", "in", `(${hiddenIds.join(",")})`);
	if (prefs.propertyTypes && prefs.propertyTypes.length > 0) query = query.in("property_type", prefs.propertyTypes);
	if (prefs.bedrooms !== void 0) {
		if (prefs.bedroomsRule === "EXACT") query = query.eq("bedrooms", prefs.bedrooms);
		else if (prefs.bedroomsRule === "MIN") query = query.gte("bedrooms", prefs.bedrooms);
		else if (prefs.bedroomsRule === "MAX") query = query.lte("bedrooms", prefs.bedrooms);
	}
	const upperLimit = prefs.maxBudget ? prefs.maxBudget * 1.25 : void 0;
	if (upperLimit !== void 0) query = query.lte("price", upperLimit);
	const { data: candidates, error } = await query.limit(100);
	if (error) throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve matching candidates.");
	if (!candidates || candidates.length === 0) return {
		items: [],
		total: 0
	};
	const priorityWeights = prefs.priorityWeights || {};
	const getWeightPoints = (categoryKey) => {
		const level = priorityWeights[categoryKey] || "MEDIUM";
		return DEFAULT_PRIORITY_SCORES[level] || 15;
	};
	const budgetWeight = getWeightPoints("budget");
	const locationWeight = getWeightPoints("location");
	const bedroomsWeight = getWeightPoints("bedrooms");
	const bathroomsWeight = getWeightPoints("bathrooms");
	const amenitiesWeight = getWeightPoints("amenities");
	const propertyTypeWeight = getWeightPoints("propertyType");
	const totalWeights = budgetWeight + locationWeight + bedroomsWeight + bathroomsWeight + amenitiesWeight + propertyTypeWeight;
	const matchedItems = [];
	for (const item of candidates) {
		const reasons = [];
		let budgetFit = false;
		let locationFit = false;
		let bedroomsFit = false;
		let bathroomsFit = false;
		let amenitiesFit = false;
		let furnishingFit = false;
		let budgetScore = 0;
		const listingPrice = Number(item.price);
		if (prefs.preferredBudget !== void 0 && prefs.maxBudget !== void 0) {
			if (listingPrice <= prefs.preferredBudget) {
				budgetScore = 1;
				budgetFit = true;
				reasons.push({
					code: "WITHIN_BUDGET",
					isPositive: true,
					message: "Fits within your target preferred budget."
				});
			} else if (listingPrice <= prefs.maxBudget) {
				const range = prefs.maxBudget - prefs.preferredBudget;
				budgetScore = range > 0 ? 1 - (listingPrice - prefs.preferredBudget) / range : 1;
				budgetFit = true;
				reasons.push({
					code: "WITHIN_MAX_BUDGET",
					isPositive: true,
					message: "Fits within your maximum budget ceiling."
				});
			} else {
				budgetScore = 0;
				reasons.push({
					code: "EXCEEDS_BUDGET_SLIGHTLY",
					isPositive: false,
					message: `Exceeds your maximum budget limit by KES ${(listingPrice - prefs.maxBudget).toLocaleString()}.`
				});
			}
		} else {
			budgetScore = 1;
			budgetFit = true;
		}
		let locationScore = 0;
		if (prefs.preferredLocations && prefs.preferredLocations.length > 0) {
			let maxLocScore = 0;
			for (const loc of prefs.preferredLocations) {
				let score = 0;
				if (item.county?.toLowerCase() === loc.county?.toLowerCase()) {
					score = .2;
					if (loc.town && item.town?.toLowerCase() === loc.town?.toLowerCase()) {
						score = .6;
						if (loc.neighborhood && item.neighborhood?.toLowerCase() === loc.neighborhood?.toLowerCase()) {
							score = .9;
							if (loc.estate && item.estate?.toLowerCase() === loc.estate?.toLowerCase()) score = 1;
						}
					}
				}
				if (score > maxLocScore) maxLocScore = score;
			}
			locationScore = maxLocScore;
			if (locationScore >= .6) {
				locationFit = true;
				reasons.push({
					code: "LOCATION_MATCH",
					isPositive: true,
					message: "Located in one of your preferred areas."
				});
			} else if (locationScore > 0) reasons.push({
				code: "LOCATION_NEAR",
				isPositive: true,
				message: "Close proximity to your preferred locations."
			});
			else reasons.push({
				code: "LOCATION_MISMATCH",
				isPositive: false,
				message: "Outside your preferred geographic boundary."
			});
		} else {
			locationScore = 1;
			locationFit = true;
		}
		let bedroomScore = 0;
		if (prefs.bedrooms !== void 0) {
			const itemBeds = Number(item.bedrooms);
			if (itemBeds === prefs.bedrooms) {
				bedroomScore = 1;
				bedroomsFit = true;
				reasons.push({
					code: "BEDROOMS_EXACT",
					isPositive: true,
					message: "Matches your exact bedroom count requirement."
				});
			} else if (prefs.bedroomsRule === "MIN" && itemBeds > prefs.bedrooms) {
				bedroomScore = .8;
				bedroomsFit = true;
				reasons.push({
					code: "BEDROOMS_SUFFICIENT",
					isPositive: true,
					message: "Meets your minimum bedroom constraint."
				});
			} else {
				bedroomScore = 0;
				reasons.push({
					code: "BEDROOMS_MISMATCH",
					isPositive: false,
					message: "Does not satisfy bedroom capacity."
				});
			}
		} else {
			bedroomScore = 1;
			bedroomsFit = true;
		}
		let bathroomScore = 0;
		if (prefs.bathrooms !== void 0) {
			if (Number(item.bathrooms) >= prefs.bathrooms) {
				bathroomScore = 1;
				bathroomsFit = true;
			} else {
				bathroomScore = 0;
				reasons.push({
					code: "BATHROOMS_SHORTAGE",
					isPositive: false,
					message: "Has fewer bathrooms than requested."
				});
			}
		} else {
			bathroomScore = 1;
			bathroomsFit = true;
		}
		let typeScore = 0;
		if (prefs.propertyTypes && prefs.propertyTypes.length > 0) {
			if (prefs.propertyTypes.includes(item.property_type)) typeScore = 1;
			else typeScore = 0;
		} else typeScore = 1;
		let amenityScore = 0;
		if (prefs.amenities && prefs.amenities.length > 0) {
			const itemAm = item.property_amenities || [];
			const requiredAms = prefs.amenities.filter((a) => a.priority === "MUST_HAVE");
			const preferredAms = prefs.amenities.filter((a) => a.priority !== "MUST_HAVE");
			let mustHaveSatisfied = true;
			for (const req of requiredAms) if (!itemAm.includes(req.amenity)) mustHaveSatisfied = false;
			const prefSatisfiedCount = preferredAms.filter((pref) => itemAm.includes(pref.amenity)).length;
			const totalPrefCount = preferredAms.length;
			if (mustHaveSatisfied) {
				amenityScore = totalPrefCount > 0 ? .7 + .3 * (prefSatisfiedCount / totalPrefCount) : 1;
				amenitiesFit = true;
				if (requiredAms.length > 0 || prefSatisfiedCount > 0) reasons.push({
					code: "AMENITY_MATCH",
					isPositive: true,
					message: "Offers your required and preferred amenities."
				});
			} else {
				amenityScore = 0;
				reasons.push({
					code: "AMENITY_MISSING_REQUIRED",
					isPositive: false,
					message: "Lacks one or more MUST-HAVE amenities."
				});
			}
		} else {
			amenityScore = 1;
			amenitiesFit = true;
		}
		if (prefs.furnishingPreference && prefs.furnishingPreference !== "ANY") {
			if (item.furnishing_status === prefs.furnishingPreference) furnishingFit = true;
		} else furnishingFit = true;
		const basePercent = (budgetScore * budgetWeight + locationScore * locationWeight + bedroomScore * bedroomsWeight + bathroomScore * bathroomsWeight + typeScore * propertyTypeWeight + amenityScore * amenitiesWeight) / totalWeights * 100;
		let bonus = 0;
		const isVerified = item.property_verification_status === "VERIFIED" || item.listing_verification_status === "VERIFIED";
		if (isVerified) bonus += 3;
		if (item.listing_freshness_status === "CURRENT") bonus += 2;
		const finalScore = Math.min(100, Math.round(basePercent + bonus));
		let category = "GOOD_MATCH";
		if (!budgetFit || !locationFit || !bedroomsFit || !amenitiesFit) category = "CLOSE_MATCH";
		else if (finalScore >= 90) category = "BEST_MATCH";
		else if (finalScore >= 75) category = "STRONG_MATCH";
		if (isVerified) reasons.push({
			code: "VERIFIED_TRUST",
			isPositive: true,
			message: "Listing is verified by HomeHunt inspectors."
		});
		await supabaseAdmin.from("recommendation_history").insert({
			user_id: userId,
			listing_id: item.listing_id
		});
		const mappedListing = {
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
			bedrooms: item.bedrooms,
			bathrooms: item.bathrooms,
			primaryImageUrl: item.primary_image_url,
			propertyAmenities: item.property_amenities || []
		};
		matchedItems.push({
			listing: mappedListing,
			score: finalScore,
			category,
			reasons,
			matchedPreferences: {
				budgetFit,
				locationFit,
				bedroomsFit,
				bathroomsFit,
				amenitiesFit,
				furnishingFit
			},
			freshness: item.listing_freshness_status || "CURRENT",
			trust: {
				propertyVerified: item.property_verification_status === "VERIFIED",
				contactVerified: !!item.owner_identity_verified,
				listingVerified: item.listing_verification_status === "VERIFIED"
			}
		});
	}
	const categoryOrder = {
		BEST_MATCH: 1,
		STRONG_MATCH: 2,
		GOOD_MATCH: 3,
		CLOSE_MATCH: 4
	};
	matchedItems.sort((a, b) => {
		const orderA = categoryOrder[a.category];
		const orderB = categoryOrder[b.category];
		if (orderA !== orderB) return orderA - orderB;
		return b.score - a.score;
	});
	return {
		items: matchedItems,
		total: matchedItems.length
	};
});
//#endregion
export { fnDeleteSavedSearch_createServerFn_handler, fnGetRecommendations_createServerFn_handler, fnGetUserPreferences_createServerFn_handler, fnListSavedSearches_createServerFn_handler, fnSaveSearch_createServerFn_handler, fnSaveUserPreferences_createServerFn_handler, fnSubmitRecommendationFeedback_createServerFn_handler };
