import { r as __toESM } from "../_runtime.mjs";
import { i as createServerFn } from "./server-Dy3VKkCi.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as requireSupabaseAuth } from "./api-error-CUUESrGA.mjs";
import { a as enumType, c as objectType, d as stringType, t as anyType } from "../_libs/zod.mjs";
import { H as Info, L as List, M as MapPin, S as Search, W as Heart, bt as Bed, gt as Building, h as SlidersHorizontal, j as Map, m as Sparkles, mt as Calendar, t as X, w as RotateCcw, xt as Bath } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./router-CmEb8YAq.mjs";
import { S as useMotion, o as Route$16, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { t as AnimatedCard } from "./AnimatedCard-D2nQAN3M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/homes.index-BiNO1Zeo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var searchListings = createServerFn({ method: "GET" }).validator((data) => data).handler(createSsrRpc("70f1b9a1e2efd1fd11235198393599c4c3f60e876196eac7d47fb063e311b46b"));
var getLocationSuggestions = createServerFn({ method: "GET" }).validator(stringType()).handler(createSsrRpc("bd1dce0244a703cb48fec211207a77ff19d75014e76127085a179e6c34f1ec51"));
var getReferenceData = createServerFn({ method: "GET" }).handler(createSsrRpc("72db247065ba4b16b254ea93e22ca7cbce6371bc8afdd6573c2647e9db07de82"));
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
})).handler(createSsrRpc("a0b24ad2592b0c26e0f666a9d848e3e76595c2588fa9204772c2512e1c366be8"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	name: stringType().min(1).max(100),
	filters: anyType()
})).handler(createSsrRpc("01b9389a46fd186b388f9608190b9250fd07267f66c9b6ad99595248c8dc7de2"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("0158151f137032a3167b24ec0b1c6f0d01fed1596cb7384e0a201eec77940166"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("4d135bf91454122ed5dbfec179c3bfd2d01a16f1c07f747fec45bf2a58b500f3"));
var addFavorite = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("0fae67e55638e22c9ab123fa0f633497293cce18271613b2579ab1a7d558c045"));
var removeFavorite = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("1afc78168e94499b68f95f83bb27a04873b4e96fb70226cdc94f3e68980f3acf"));
var getFavorites = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("30d62791bc2668baefe07364f1a20261361b50435dfd9216f7697300fa8cb2fe"));
var PropertyMap = ({ listings, activeListingId, onMarkerClick, onBoundsChange }) => {
	const mapContainerRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const markersRef = (0, import_react.useRef)({});
	const [isLeafletLoaded, setIsLeafletLoaded] = (0, import_react.useState)(false);
	const LRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || mapRef.current) return;
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
		document.head.appendChild(link);
		import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t())).then((L) => {
			LRef.current = L;
			setIsLeafletLoaded(true);
			if (mapContainerRef.current) {
				const map = L.map(mapContainerRef.current, {
					center: [-1.2921, 36.8219],
					zoom: 12,
					zoomControl: false
				});
				L.control.zoom({ position: "bottomright" }).addTo(map);
				L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
					attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
					subdomains: "abcd",
					maxZoom: 20
				}).addTo(map);
				mapRef.current = map;
				map.on("moveend", () => {
					if (onBoundsChange) {
						const bounds = map.getBounds();
						onBoundsChange({
							north: bounds.getNorth(),
							south: bounds.getSouth(),
							east: bounds.getEast(),
							west: bounds.getWest()
						});
					}
				});
			}
		});
		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
			link.remove();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isLeafletLoaded || !mapRef.current) return;
		const L = LRef.current;
		const map = mapRef.current;
		Object.values(markersRef.current).forEach((marker) => marker.remove());
		markersRef.current = {};
		if (listings.length === 0) return;
		const markerBounds = [];
		listings.forEach((listing) => {
			const lat = listing.displayLatitude ?? listing.latitude;
			const lng = listing.displayLongitude ?? listing.longitude;
			if (!lat || !lng) return;
			markerBounds.push([lat, lng]);
			const formattedPrice = listing.price >= 1e3 ? `${(listing.price / 1e3).toFixed(0)}k` : listing.price.toString();
			const isActive = activeListingId === listing.id;
			const icon = L.divIcon({
				className: "custom-div-icon",
				html: `
          <button class="flex items-center justify-center px-2.5 py-1.5 rounded-xl font-display font-extrabold text-[11px] shadow-md border transition-all duration-300 transform cursor-pointer whitespace-nowrap ${isActive ? "bg-accent border-accent text-accent-foreground scale-110 ring-2 ring-accent/30 z-50" : "bg-background border-border text-primary hover:border-primary/50 hover:scale-105 z-10"}">
            ${listing.currency} ${formattedPrice}
          </button>
        `,
				iconSize: [60, 28],
				iconAnchor: [30, 14]
			});
			const marker = L.marker([lat, lng], { icon }).addTo(map);
			const popupContent = `
        <div class="p-1 font-sans max-w-[200px]">
          ${listing.primaryImageUrl ? `<img src="${listing.primaryImageUrl}" class="w-full h-24 object-cover rounded-lg mb-2 border border-border/80" alt="${listing.title}" />` : ""}
          <h4 class="font-display font-bold text-xs text-foreground line-clamp-1 mb-0.5">${listing.title}</h4>
          <p class="text-[10px] text-muted-foreground font-semibold mb-1">${listing.town}, ${listing.county}</p>
          <div class="flex justify-between items-center mt-2 border-t border-border/40 pt-1.5">
            <span class="font-display font-extrabold text-xs text-primary">${listing.currency} ${Number(listing.price).toLocaleString()}</span>
            <a href="/homes/${listing.id}" class="text-[10px] font-bold text-accent hover:underline">Details &rarr;</a>
          </div>
        </div>
      `;
			marker.bindPopup(popupContent, {
				closeButton: false,
				offset: [0, -10]
			});
			marker.on("click", () => {
				marker.openPopup();
				if (onMarkerClick) onMarkerClick(listing.id);
			});
			markersRef.current[listing.id] = marker;
		});
		if (markerBounds.length > 0 && listings.length > 0) map.fitBounds(markerBounds, {
			padding: [40, 40],
			maxZoom: 15
		});
	}, [
		listings,
		isLeafletLoaded,
		activeListingId
	]);
	(0, import_react.useEffect)(() => {
		if (!isLeafletLoaded || !mapRef.current || !activeListingId) return;
		const marker = markersRef.current[activeListingId];
		if (marker) {
			const latLng = marker.getLatLng();
			mapRef.current.setView(latLng, mapRef.current.getZoom(), { animate: true });
			marker.openPopup();
		}
	}, [activeListingId, isLeafletLoaded]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-border shadow-inner bg-secondary/15 flex items-center justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: mapContainerRef,
			className: "absolute inset-0 w-full h-full z-10"
		}), !isLeafletLoaded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center gap-2 z-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
				children: "Loading maps system..."
			})]
		})]
	});
};
function Skeleton({ className = "", variant = "rect" }) {
	const { reducedMotion } = useMotion();
	let borderStyle = "";
	if (variant === "circle") borderStyle = "rounded-full";
	else if (variant === "text") borderStyle = "rounded h-3 w-3/4";
	else borderStyle = "rounded-xl";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `${reducedMotion ? "bg-secondary/40" : "bg-secondary/30 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-secondary/20 before:to-transparent"} ${borderStyle} ${className}` });
}
function HomesDiscoveryPage() {
	const navigate = useNavigate({ from: Route$16.fullPath });
	const searchParams = Route$16.useSearch();
	const queryClient = useQueryClient();
	const { isAuthenticated } = useAuth();
	const [mobileView, setMobileView] = (0, import_react.useState)("list");
	const [showFiltersDrawer, setShowFiltersDrawer] = (0, import_react.useState)(false);
	const [activeListingId, setActiveListingId] = (0, import_react.useState)(null);
	const [locQuery, setLocQuery] = (0, import_react.useState)(searchParams.q || "");
	const [showSuggestions, setShowSuggestions] = (0, import_react.useState)(false);
	const { data: searchResponse, isLoading, error } = useQuery({
		queryKey: ["listings-search", searchParams],
		queryFn: () => searchListings({ data: searchParams })
	});
	const { data: refData } = useQuery({
		queryKey: ["search-references"],
		queryFn: () => getReferenceData()
	});
	const { data: suggestions } = useQuery({
		queryKey: ["location-suggestions", locQuery],
		queryFn: () => getLocationSuggestions({ data: locQuery }),
		enabled: locQuery.trim().length >= 2
	});
	const { data: favorites } = useQuery({
		queryKey: ["user-favorites"],
		queryFn: () => getFavorites(),
		enabled: isAuthenticated
	});
	const toggleFavoriteMutation = useMutation({
		mutationFn: async ({ listingId, isFav }) => {
			if (isFav) return await removeFavorite({ data: listingId });
			else return await addFavorite({ data: listingId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
		},
		onError: (err) => {
			const msg = err instanceof Error ? err.message : "Failed to update favorites.";
			toast.error(msg);
		}
	});
	(0, import_react.useEffect)(() => {
		logSearchAnalytics({ data: {
			eventType: "SEARCH_PERFORMED",
			payload: { filters: searchParams }
		} });
	}, [searchParams]);
	const updateFilters = (newParams) => {
		navigate({ search: (prev) => ({
			...prev,
			...newParams,
			page: 1
		}) });
	};
	const clearAllFilters = () => {
		setLocQuery("");
		navigate({ search: () => ({
			sort: "RECOMMENDED",
			page: 1,
			limit: 20,
			amenities: []
		}) });
		toast.success("Search parameters reset successfully.");
	};
	const handleFavoriteClick = (e, listingId) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isAuthenticated) {
			toast.error("Please login to save listings to your favorites.");
			navigate({
				to: "/login",
				search: { redirect: window.location.pathname + window.location.search }
			});
			return;
		}
		const isFav = favorites?.some((f) => f.listingId === listingId) || false;
		toggleFavoriteMutation.mutate({
			listingId,
			isFav
		});
	};
	const handleBoundsChange = (bounds) => {};
	const propertyTypes = [
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
	];
	const unitTypes = [
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
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background flex flex-col font-sans selection:bg-accent/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 bg-background/95 border-b border-border/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full md:w-auto flex items-center justify-between md:justify-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
								children: "← Exit Search"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-display font-black text-xl text-primary leading-none",
								children: [
									"Home",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-accent",
										children: "Hunt"
									}),
									" Discovery"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full md:w-96",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex items-center rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3.5 h-4.5 w-4.5 text-muted-foreground shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Search town, estate, stage or landmark...",
										value: locQuery,
										onChange: (e) => {
											setLocQuery(e.target.value);
											setShowSuggestions(true);
											if (!e.target.value.trim()) updateFilters({ q: void 0 });
										},
										onFocus: () => setShowSuggestions(true),
										className: "w-full py-2.5 pl-10 pr-4 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
									}),
									locQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setLocQuery("");
											updateFilters({ q: void 0 });
											setShowSuggestions(false);
										},
										className: "absolute right-3.5 p-0.5 rounded-full hover:bg-secondary text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4.5 w-4.5" })
									})
								]
							}), showSuggestions && suggestions && suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden divide-y divide-border/60",
								children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => {
										setLocQuery(s);
										updateFilters({ q: s });
										setShowSuggestions(false);
									},
									className: "w-full text-left px-4 py-3 hover:bg-secondary flex items-center gap-2.5 text-xs font-semibold text-foreground transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s })]
								}, s))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full md:w-auto flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setShowFiltersDrawer(true),
									className: "flex-1 md:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground shadow-sm hover:bg-secondary transition-all",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-4 w-4" }),
										" Filters",
										(searchParams.amenities && searchParams.amenities.length > 0 || searchParams.county || searchParams.town || searchParams.propertyType || searchParams.unitType || searchParams.bedrooms || searchParams.bathrooms || searchParams.minPrice || searchParams.maxPrice) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-accent" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: searchParams.sort,
									onChange: (e) => updateFilters({ sort: e.target.value }),
									className: "inline-flex h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground focus:outline-none hover:bg-secondary transition-all cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "RECOMMENDED",
											children: "Sort: Recommended"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "NEWEST",
											children: "Sort: Newest Listings"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "PRICE_ASC",
											children: "Price: Low to High"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "PRICE_DESC",
											children: "Price: High to Low"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "AVAILABILITY",
											children: "Sort: Move-in Date"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex md:hidden border border-border rounded-xl bg-card p-1 shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setMobileView("list"),
										className: `p-1.5 rounded-lg transition-all ${mobileView === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setMobileView("map"),
										className: `p-1.5 rounded-lg transition-all ${mobileView === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-4 w-4" })
									})]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 max-w-[1600px] w-full mx-auto flex items-stretch overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: `flex-1 overflow-y-auto px-4 sm:px-6 py-6 border-r border-border/80 ${mobileView === "list" ? "block" : "hidden md:block"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 mb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2",
								children: [searchResponse?.total || 0, " listings found"]
							}),
							searchParams.verifiedOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: "Verified Properties Only",
								onRemove: () => updateFilters({ verifiedOnly: void 0 })
							}),
							searchParams.county && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: `County: ${searchParams.county}`,
								onRemove: () => updateFilters({ county: void 0 })
							}),
							searchParams.town && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: `Town: ${searchParams.town}`,
								onRemove: () => updateFilters({ town: void 0 })
							}),
							searchParams.propertyType && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: `Type: ${searchParams.propertyType}`,
								onRemove: () => updateFilters({ propertyType: void 0 })
							}),
							searchParams.unitType && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: `Unit: ${searchParams.unitType}`,
								onRemove: () => updateFilters({ unitType: void 0 })
							}),
							searchParams.bedrooms && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: `Beds: ${searchParams.bedrooms}+`,
								onRemove: () => updateFilters({ bedrooms: void 0 })
							}),
							searchParams.minPrice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: `Min Price: KES ${Number(searchParams.minPrice).toLocaleString()}`,
								onRemove: () => updateFilters({ minPrice: void 0 })
							}),
							searchParams.maxPrice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: `Max Price: KES ${Number(searchParams.maxPrice).toLocaleString()}`,
								onRemove: () => updateFilters({ maxPrice: void 0 })
							}),
							searchParams.amenities && searchParams.amenities.map((am) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
								label: am.replace("_", " "),
								onRemove: () => updateFilters({ amenities: searchParams.amenities?.filter((a) => a !== am) })
							}, am)),
							(searchParams.amenities && searchParams.amenities.length > 0 || searchParams.county || searchParams.town || searchParams.propertyType || searchParams.unitType || searchParams.bedrooms || searchParams.bathrooms || searchParams.minPrice || searchParams.maxPrice) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: clearAllFilters,
								className: "inline-flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), " Clear all"]
							})
						]
					}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-6 sm:grid-cols-2",
						children: [...Array(6)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCardSkeleton, {}, i))
					}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-12 text-center max-w-md mx-auto border border-dashed text-destructive border-destructive/20 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-10 w-10 mx-auto text-destructive" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-bold text-lg text-foreground mt-3",
								children: "Search System Failure"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-2",
								children: "We encountered an error fetching search results. Please refresh or update filters."
							})
						]
					}) : searchResponse?.items && searchResponse.items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-6 sm:grid-cols-2",
							children: searchResponse.items.map((listing) => {
								const isFav = favorites?.some((f) => f.listingId === listing.id) || false;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchListingCard, {
									listing,
									isFavorite: isFav,
									isHighlighted: activeListingId === listing.id,
									onHoverChange: setActiveListingId,
									onFavoriteToggle: handleFavoriteClick
								}, listing.id);
							})
						}), searchResponse.totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-2 pt-6 border-t border-border/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: (searchParams.page || 1) <= 1,
									onClick: () => updateFilters({ page: (searchParams.page || 1) - 1 }),
									className: "inline-flex h-9 w-20 items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50",
									children: "Previous"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground font-semibold",
									children: [
										"Page ",
										searchParams.page || 1,
										" of ",
										searchResponse.totalPages
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: (searchParams.page || 1) >= searchResponse.totalPages,
									onClick: () => updateFilters({ page: (searchParams.page || 1) + 1 }),
									className: "inline-flex h-9 w-20 items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50",
									children: "Next"
								})
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-12 text-center max-w-lg mx-auto border border-dashed border-border/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-12 w-12 text-accent mx-auto mb-4 stroke-[1.2]" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-bold text-lg text-foreground",
								children: "No matching rentals found"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-2 leading-relaxed",
								children: "We couldn't find any verified listings matching your exact combination of search criteria."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-secondary/40 border border-border/60 p-4 rounded-xl text-left mt-6 space-y-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-accent" }), " Recommended Actions"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-normal",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Increase your budget limit (KSh)." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Remove specific amenities tags (e.g. CCTV or Pool)." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Expand your location keyword search query." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Reduce the bedroom count requirements." })
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: clearAllFilters,
								className: "mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 transition-all",
								children: "Clear all filters"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: `flex-[1.2] min-h-[500px] h-[calc(100vh-64px)] sticky top-[64px] ${mobileView === "map" ? "block" : "hidden md:block"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropertyMap, {
						listings: searchResponse?.items || [],
						activeListingId,
						onMarkerClick: setActiveListingId,
						onBoundsChange: handleBoundsChange
					})
				})]
			}),
			showFiltersDrawer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-5 border-b border-border flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-4.5 w-4.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-extrabold text-lg text-foreground",
									children: "Advanced Search Filters"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowFiltersDrawer(false),
								className: "p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto px-6 py-6 space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "County"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: searchParams.county || "",
										onChange: (e) => updateFilters({
											county: e.target.value || void 0,
											town: void 0
										}),
										className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select County (All)"
										}), refData?.counties.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c,
											children: c
										}, c))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Town / City"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: searchParams.town || "",
										onChange: (e) => updateFilters({ town: e.target.value || void 0 }),
										className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer",
										disabled: !searchParams.county,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select Town (All)"
										}), refData?.towns.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: t,
											children: t
										}, t))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Price Budget (KES)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											placeholder: "Min Price",
											value: searchParams.minPrice || "",
											onChange: (e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : void 0 }),
											className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											placeholder: "Max Price",
											value: searchParams.maxPrice || "",
											onChange: (e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : void 0 }),
											className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
											children: "Property Type"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: searchParams.propertyType || "",
											onChange: (e) => updateFilters({ propertyType: e.target.value || void 0 }),
											className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "All Types"
											}), propertyTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: type,
												children: type.replace("_", " ")
											}, type))]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
											children: "Unit Layout"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: searchParams.unitType || "",
											onChange: (e) => updateFilters({ unitType: e.target.value || void 0 }),
											className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "All Layouts"
											}), unitTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: type,
												children: type.replace("_", " ")
											}, type))]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
											children: "Min Bedrooms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: searchParams.bedrooms || "",
											onChange: (e) => updateFilters({ bedrooms: e.target.value ? Number(e.target.value) : void 0 }),
											className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "Any"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "1",
													children: "1+ Bedrooms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "2",
													children: "2+ Bedrooms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "3",
													children: "3+ Bedrooms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "4",
													children: "4+ Bedrooms"
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
											children: "Min Bathrooms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: searchParams.bathrooms || "",
											onChange: (e) => updateFilters({ bathrooms: e.target.value ? Number(e.target.value) : void 0 }),
											className: "w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "Any"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "1",
													children: "1+ Bathrooms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "2",
													children: "2+ Bathrooms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "3",
													children: "3+ Bathrooms"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Trust & Verification"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: searchParams.verifiedOnly || false,
											onChange: (e) => updateFilters({ verifiedOnly: e.target.checked || void 0 }),
											className: "h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verified Properties Only" })]
									}) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Shared Amenities"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-3",
										children: refData?.amenities.map((am) => {
											const isChecked = searchParams.amenities?.includes(am) || false;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: isChecked,
													onChange: () => {
														const newAmenities = isChecked ? searchParams.amenities?.filter((a) => a !== am) : [...searchParams.amenities || [], am];
														updateFilters({ amenities: newAmenities });
													},
													className: "h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: am.replace("_", " ") })]
											}, am);
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-5 border-t border-border flex gap-3 bg-secondary/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: clearAllFilters,
								className: "flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary transition-all",
								children: "Reset all"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowFiltersDrawer(false),
								className: "flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/95 shadow-md transition-all",
								children: "Apply Filters"
							})]
						})
					]
				})
			})
		]
	});
}
function FilterChip({ label, onRemove }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 rounded-full bg-secondary/80 border border-border px-3 py-1 text-xs font-semibold text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: onRemove,
			className: "p-0.5 rounded-full hover:bg-border/60 text-muted-foreground hover:text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
		})]
	});
}
function SearchListingCard({ listing, isFavorite, isHighlighted, onHoverChange, onFavoriteToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
		onMouseEnter: () => onHoverChange(listing.id),
		onMouseLeave: () => onHoverChange(null),
		className: `bg-card rounded-2xl border overflow-hidden shadow-sm flex flex-col group relative ${isHighlighted ? "border-accent ring-2 ring-accent/15 scale-[1.01]" : "border-border"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[16/10] bg-secondary/30 overflow-hidden shrink-0",
			children: [
				listing.primaryImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: listing.primaryImageUrl,
					alt: listing.title,
					className: "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-10 w-10 stroke-[1.2]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold uppercase tracking-wider",
						children: "No Image Uploaded"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-3 left-3 flex gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold uppercase tracking-wider text-background bg-foreground/80 backdrop-blur-sm px-2.5 py-1 rounded-lg",
						children: listing.propertyType.replace("_", " ")
					}), listing.propertyVerificationStatus === "VERIFIED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold uppercase tracking-wider text-white bg-verified px-2.5 py-1 rounded-lg flex items-center gap-0.5 shadow-sm",
						children: "✓ Verified"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e) => onFavoriteToggle(e, listing.id),
					className: "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm bg-background/80 hover:bg-background shadow border border-border/80 text-foreground transition-all cursor-pointer hover:scale-105",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `h-4.5 w-4.5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}` })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5 flex-1 flex flex-col justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-between items-baseline gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display font-extrabold text-lg text-primary",
						children: [
							listing.currency,
							" ",
							Number(listing.price).toLocaleString(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
								children: [
									" ",
									"/ ",
									listing.billingPeriod.toLowerCase()
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-display font-bold text-foreground text-base mt-2 group-hover:text-primary transition-colors line-clamp-2",
					children: listing.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-2.5 flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
						listing.town,
						", ",
						listing.county,
						listing.neighborhood ? ` (${listing.neighborhood})` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 items-center mt-4 text-xs font-semibold text-muted-foreground/85 border-t border-border/40 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bed, { className: "h-4 w-4 text-primary" }),
							" ",
							listing.bedrooms ?? 0,
							" ",
							listing.bedrooms === 1 ? "Bed" : "Beds"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bath, { className: "h-4 w-4 text-primary" }),
							" ",
							listing.bathrooms ?? 0,
							" ",
							listing.bathrooms === 1 ? "Bath" : "Baths"
						]
					})]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 pt-3 border-t border-border/40 flex justify-between items-center text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1 text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }),
						"Avail: ",
						new Date(listing.availabilityDate).toLocaleDateString()
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/homes/$id",
					params: { id: listing.id },
					className: "inline-flex items-center gap-1 font-bold text-primary hover:underline hover:gap-1.5 transition-all",
					children: "Details →"
				})]
			})]
		})]
	});
}
function ListingCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-[400px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[16/10] w-full shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5 flex-1 flex flex-col justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-1/3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-4 items-center border-t border-border/40 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-12" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-12" })]
			})]
		})]
	});
}
//#endregion
export { HomesDiscoveryPage as component };
