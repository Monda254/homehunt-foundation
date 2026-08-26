import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/identity/AuthContext";
import {
  searchListings,
  getReferenceData,
  getLocationSuggestions,
  addFavorite,
  removeFavorite,
  getFavorites,
  logSearchAnalytics,
} from "@/features/properties/search.functions";
import {
  SearchListingsSchema,
  type SearchFilters,
  type ListingSearchResult,
} from "@/features/properties/search.types";
import { PropertyMap } from "@/components/Map";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Calendar,
  Heart,
  SlidersHorizontal,
  Map,
  List,
  X,
  RotateCcw,
  Building,
  HelpCircle,
  Sparkles,
  Info,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/homes/")({
  validateSearch: (search) => SearchListingsSchema.parse(search),
  component: HomesDiscoveryPage,
});

function HomesDiscoveryPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Component UI States
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [locQuery, setLocQuery] = useState(searchParams.q || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Queries
  const {
    data: searchResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listings-search", searchParams],
    queryFn: () => searchListings({ data: searchParams }),
  });

  const { data: refData } = useQuery({
    queryKey: ["search-references"],
    queryFn: () => getReferenceData(),
  });

  const { data: suggestions } = useQuery({
    queryKey: ["location-suggestions", locQuery],
    queryFn: () => getLocationSuggestions({ data: locQuery }),
    enabled: locQuery.trim().length >= 2,
  });

  const { data: favorites } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: () => getFavorites(),
    enabled: isAuthenticated,
  });

  // Mutations
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ listingId, isFav }: { listingId: string; isFav: boolean }) => {
      if (isFav) {
        return await removeFavorite({ data: listingId });
      } else {
        return await addFavorite({ data: listingId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update favorites.";
      toast.error(msg);
    },
  });

  // Log search perform event
  useEffect(() => {
    logSearchAnalytics({
      data: {
        eventType: "SEARCH_PERFORMED",
        payload: { filters: searchParams },
      },
    });
  }, [searchParams]);

  // Update query params function
  const updateFilters = (newParams: Partial<SearchFilters>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...newParams,
        page: 1, // Reset page on filter change
      }),
    });
  };

  const clearAllFilters = () => {
    setLocQuery("");
    navigate({
      search: () => ({
        sort: "RECOMMENDED" as const,
        page: 1,
        limit: 20,
        amenities: [],
      }),
    });
    toast.success("Search parameters reset successfully.");
  };

  const handleFavoriteClick = (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to save listings to your favorites.");
      navigate({
        to: "/login",
        search: { redirect: window.location.pathname + window.location.search },
      });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isFav = favorites?.some((f: any) => f.listingId === listingId) || false;
    toggleFavoriteMutation.mutate({ listingId, isFav });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBoundsChange = (bounds: any) => {
    // Prevent bounding box updates from triggering loop recursively by only checking map moves
  };

  // Helper labels
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
    "OTHER",
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
    "OTHER",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-accent/20">
      {/* 1. Header Filter Bar */}
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Back button & Title */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4">
            <Link
              to="/"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              &larr; Exit Search
            </Link>
            <h1 className="font-display font-black text-xl text-primary leading-none">
              Home<span className="text-accent">Hunt</span> Discovery
            </h1>
          </div>

          {/* Autocomplete Location Input */}
          <div className="relative w-full md:w-96">
            <div className="relative flex items-center rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search town, estate, stage or landmark..."
                value={locQuery}
                onChange={(e) => {
                  setLocQuery(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value.trim()) {
                    updateFilters({ q: undefined });
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full py-2.5 pl-10 pr-4 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
              />
              {locQuery && (
                <button
                  onClick={() => {
                    setLocQuery("");
                    updateFilters({ q: undefined });
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3.5 p-0.5 rounded-full hover:bg-secondary text-muted-foreground"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            {/* Suggestions Overlay */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden divide-y divide-border/60">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setLocQuery(s);
                      updateFilters({ q: s });
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-secondary flex items-center gap-2.5 text-xs font-semibold text-foreground transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls: Filter Button, Sorting, View Toggle */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <button
              onClick={() => setShowFiltersDrawer(true)}
              className="flex-1 md:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground shadow-sm hover:bg-secondary transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {((searchParams.amenities && searchParams.amenities.length > 0) ||
                searchParams.county ||
                searchParams.town ||
                searchParams.propertyType ||
                searchParams.unitType ||
                searchParams.bedrooms ||
                searchParams.bathrooms ||
                searchParams.minPrice ||
                searchParams.maxPrice) && <span className="h-2 w-2 rounded-full bg-accent" />}
            </button>

            {/* Sorting Select */}
            <select
              value={searchParams.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as SearchFilters["sort"] })}
              className="inline-flex h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground focus:outline-none hover:bg-secondary transition-all cursor-pointer"
            >
              <option value="RECOMMENDED">Sort: Recommended</option>
              <option value="NEWEST">Sort: Newest Listings</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="AVAILABILITY">Sort: Move-in Date</option>
            </select>

            {/* Toggle Mobile View */}
            <div className="flex md:hidden border border-border rounded-xl bg-card p-1 shrink-0">
              <button
                onClick={() => setMobileView("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  mobileView === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={`p-1.5 rounded-lg transition-all ${
                  mobileView === "map"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main split view layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto flex items-stretch overflow-hidden">
        {/* Results Panel */}
        <section
          className={`flex-1 overflow-y-auto px-4 sm:px-6 py-6 border-r border-border/80 ${
            mobileView === "list" ? "block" : "hidden md:block"
          }`}
        >
          {/* Active Chips & Clear Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">
              {searchResponse?.total || 0} listings found
            </span>
            {searchParams.county && (
              <FilterChip
                label={`County: ${searchParams.county}`}
                onRemove={() => updateFilters({ county: undefined })}
              />
            )}
            {searchParams.town && (
              <FilterChip
                label={`Town: ${searchParams.town}`}
                onRemove={() => updateFilters({ town: undefined })}
              />
            )}
            {searchParams.propertyType && (
              <FilterChip
                label={`Type: ${searchParams.propertyType}`}
                onRemove={() => updateFilters({ propertyType: undefined })}
              />
            )}
            {searchParams.unitType && (
              <FilterChip
                label={`Unit: ${searchParams.unitType}`}
                onRemove={() => updateFilters({ unitType: undefined })}
              />
            )}
            {searchParams.bedrooms && (
              <FilterChip
                label={`Beds: ${searchParams.bedrooms}+`}
                onRemove={() => updateFilters({ bedrooms: undefined })}
              />
            )}
            {searchParams.minPrice && (
              <FilterChip
                label={`Min Price: KES ${Number(searchParams.minPrice).toLocaleString()}`}
                onRemove={() => updateFilters({ minPrice: undefined })}
              />
            )}
            {searchParams.maxPrice && (
              <FilterChip
                label={`Max Price: KES ${Number(searchParams.maxPrice).toLocaleString()}`}
                onRemove={() => updateFilters({ maxPrice: undefined })}
              />
            )}
            {searchParams.amenities &&
              searchParams.amenities.map((am) => (
                <FilterChip
                  key={am}
                  label={am.replace("_", " ")}
                  onRemove={() =>
                    updateFilters({ amenities: searchParams.amenities?.filter((a) => a !== am) })
                  }
                />
              ))}
            {((searchParams.amenities && searchParams.amenities.length > 0) ||
              searchParams.county ||
              searchParams.town ||
              searchParams.propertyType ||
              searchParams.unitType ||
              searchParams.bedrooms ||
              searchParams.bathrooms ||
              searchParams.minPrice ||
              searchParams.maxPrice) && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>

          {/* Listings Rendering */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="surface-card p-12 text-center max-w-md mx-auto border border-dashed text-destructive border-destructive/20 gap-2">
              <Info className="h-10 w-10 mx-auto text-destructive" />
              <h3 className="font-display font-bold text-lg text-foreground mt-3">
                Search System Failure
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                We encountered an error fetching search results. Please refresh or update filters.
              </p>
            </div>
          ) : searchResponse?.items && searchResponse.items.length > 0 ? (
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {searchResponse.items.map((listing) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const isFav = favorites?.some((f: any) => f.listingId === listing.id) || false;
                  return (
                    <SearchListingCard
                      key={listing.id}
                      listing={listing}
                      isFavorite={isFav}
                      isHighlighted={activeListingId === listing.id}
                      onHoverChange={setActiveListingId}
                      onFavoriteToggle={handleFavoriteClick}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {searchResponse.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-border/40">
                  <button
                    disabled={searchParams.page <= 1}
                    onClick={() => updateFilters({ page: searchParams.page - 1 })}
                    className="inline-flex h-9 w-20 items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Page {searchParams.page} of {searchResponse.totalPages}
                  </span>
                  <button
                    disabled={searchParams.page >= searchResponse.totalPages}
                    onClick={() => updateFilters({ page: searchParams.page + 1 })}
                    className="inline-flex h-9 w-20 items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Zero Results suggestions
            <div className="surface-card p-12 text-center max-w-lg mx-auto border border-dashed border-border/80">
              <Building className="h-12 w-12 text-accent mx-auto mb-4 stroke-[1.2]" />
              <h3 className="font-display font-bold text-lg text-foreground">
                No matching rentals found
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                We couldn't find any verified listings matching your exact combination of search
                criteria.
              </p>

              <div className="bg-secondary/40 border border-border/60 p-4 rounded-xl text-left mt-6 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-accent" /> Recommended Actions
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-normal">
                  <li>Increase your budget limit (KSh).</li>
                  <li>Remove specific amenities tags (e.g. CCTV or Pool).</li>
                  <li>Expand your location keyword search query.</li>
                  <li>Reduce the bedroom count requirements.</li>
                </ul>
              </div>

              <button
                onClick={clearAllFilters}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* Map Panel */}
        <section
          className={`flex-[1.2] min-h-[500px] h-[calc(100vh-64px)] sticky top-[64px] ${
            mobileView === "map" ? "block" : "hidden md:block"
          }`}
        >
          <PropertyMap
            listings={searchResponse?.items || []}
            activeListingId={activeListingId}
            onMarkerClick={setActiveListingId}
            onBoundsChange={handleBoundsChange}
          />
        </section>
      </main>

      {/* 3. Filters Sheet Drawer overlay */}
      {showFiltersDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-display font-extrabold text-lg text-foreground">
                  Advanced Search Filters
                </h3>
              </div>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* County dropdown selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  County
                </label>
                <select
                  value={searchParams.county || ""}
                  onChange={(e) =>
                    updateFilters({ county: e.target.value || undefined, town: undefined })
                  }
                  className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select County (All)</option>
                  {refData?.counties.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Town dropdown selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Town / City
                </label>
                <select
                  value={searchParams.town || ""}
                  onChange={(e) => updateFilters({ town: e.target.value || undefined })}
                  className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                  disabled={!searchParams.county}
                >
                  <option value="">Select Town (All)</option>
                  {refData?.towns.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price Budget (KES)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={searchParams.minPrice || ""}
                    onChange={(e) =>
                      updateFilters({
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={searchParams.maxPrice || ""}
                    onChange={(e) =>
                      updateFilters({
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Property & Unit Type Select */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Property Type
                  </label>
                  <select
                    value={searchParams.propertyType || ""}
                    onChange={(e) =>
                      updateFilters({
                        propertyType:
                          (e.target.value as SearchFilters["propertyType"]) || undefined,
                      })
                    }
                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Unit Layout
                  </label>
                  <select
                    value={searchParams.unitType || ""}
                    onChange={(e) =>
                      updateFilters({
                        unitType: (e.target.value as SearchFilters["unitType"]) || undefined,
                      })
                    }
                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">All Layouts</option>
                    {unitTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bedrooms & Bathrooms Range selects */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Min Bedrooms
                  </label>
                  <select
                    value={searchParams.bedrooms || ""}
                    onChange={(e) =>
                      updateFilters({
                        bedrooms: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Any</option>
                    <option value="1">1+ Bedrooms</option>
                    <option value="2">2+ Bedrooms</option>
                    <option value="3">3+ Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Min Bathrooms
                  </label>
                  <select
                    value={searchParams.bathrooms || ""}
                    onChange={(e) =>
                      updateFilters({
                        bathrooms: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Any</option>
                    <option value="1">1+ Bathrooms</option>
                    <option value="2">2+ Bathrooms</option>
                    <option value="3">3+ Bathrooms</option>
                  </select>
                </div>
              </div>

              {/* Amenities checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Shared Amenities
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {refData?.amenities.map((am) => {
                    const isChecked = searchParams.amenities?.includes(am) || false;
                    return (
                      <label
                        key={am}
                        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const newAmenities = isChecked
                              ? searchParams.amenities?.filter((a) => a !== am)
                              : [...(searchParams.amenities || []), am];
                            updateFilters({ amenities: newAmenities });
                          }}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                        />
                        <span>{am.replace("_", " ")}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer controls */}
            <div className="px-6 py-5 border-t border-border flex gap-3 bg-secondary/20">
              <button
                onClick={clearAllFilters}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary transition-all"
              >
                Reset all
              </button>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/95 shadow-md transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// Helper Components
// =============================================================

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 border border-border px-3 py-1 text-xs font-semibold text-foreground">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-border/60 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function SearchListingCard({
  listing,
  isFavorite,
  isHighlighted,
  onHoverChange,
  onFavoriteToggle,
}: {
  listing: ListingSearchResult;
  isFavorite: boolean;
  isHighlighted: boolean;
  onHoverChange: (id: string | null) => void;
  onFavoriteToggle: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <div
      onMouseEnter={() => onHoverChange(listing.id)}
      onMouseLeave={() => onHoverChange(null)}
      className={`bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative ${
        isHighlighted ? "border-accent ring-2 ring-accent/15 scale-[1.01]" : "border-border"
      }`}
    >
      {/* Image Gallery Header */}
      <div className="relative aspect-[16/10] bg-secondary/30 overflow-hidden shrink-0">
        {listing.primaryImageUrl ? (
          <img
            src={listing.primaryImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 gap-1.5">
            <Building className="h-10 w-10 stroke-[1.2]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              No Image Uploaded
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-background bg-foreground/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            {listing.propertyType.replace("_", " ")}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => onFavoriteToggle(e, listing.id)}
          className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm bg-background/80 hover:bg-background shadow border border-border/80 text-foreground transition-all cursor-pointer hover:scale-105"
        >
          <Heart
            className={`h-4.5 w-4.5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      {/* Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline gap-2">
            <p className="font-display font-extrabold text-lg text-primary">
              {listing.currency} {Number(listing.price).toLocaleString()}
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {" "}
                / {listing.billingPeriod.toLowerCase()}
              </span>
            </p>
          </div>

          <h4 className="font-display font-bold text-foreground text-base mt-2 group-hover:text-primary transition-colors line-clamp-2">
            {listing.title}
          </h4>

          <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            {listing.town}, {listing.county}
            {listing.neighborhood ? ` (${listing.neighborhood})` : ""}
          </p>

          <div className="flex gap-4 items-center mt-4 text-xs font-semibold text-muted-foreground/85 border-t border-border/40 pt-3">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-primary" /> {listing.bedrooms ?? 0}{" "}
              {listing.bedrooms === 1 ? "Bed" : "Beds"}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-primary" /> {listing.bathrooms ?? 0}{" "}
              {listing.bathrooms === 1 ? "Bath" : "Baths"}
            </span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-border/40 flex justify-between items-center text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Avail: {new Date(listing.availabilityDate).toLocaleDateString()}
          </span>
          <Link
            to="/homes/$id"
            params={{ id: listing.id }}
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline hover:gap-1.5 transition-all"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

function ListingCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm animate-pulse flex flex-col h-[400px]">
      <div className="aspect-[16/10] bg-secondary/40 w-full shrink-0" />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-6 bg-secondary/50 rounded w-1/3" />
          <div className="h-4 bg-secondary/50 rounded w-full" />
          <div className="h-4 bg-secondary/40 rounded w-2/3" />
        </div>
        <div className="flex gap-4 items-center border-t border-border/40 pt-3">
          <div className="h-4 bg-secondary/40 rounded w-12" />
          <div className="h-4 bg-secondary/40 rounded w-12" />
        </div>
      </div>
    </div>
  );
}
