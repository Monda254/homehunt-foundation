import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getListing } from "@/features/properties/properties.functions";
import {
  MapPin,
  Bed,
  Bath,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Home,
  PhoneCall,
  ShieldAlert,
  Loader2,
  Compass,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/homes/$id")({
  component: PublicListingDetailComponent,
});

function PublicListingDetailComponent() {
  const { id: listingId } = Route.useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const {
    data: details,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-listing", listingId],
    queryFn: () => getListing(listingId),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-semibold">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-3" />
        <h2 className="font-display text-xl font-bold text-foreground">Listing Unavailable</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          This listing may have been paused, archived, or does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/95"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Homepage
        </Link>
      </div>
    );
  }

  interface PropertyDetailData {
    property_type: string;
    county: string;
    town: string;
    neighborhood?: string | null;
    estate?: string | null;
    landmark_description?: string | null;
    amenity_list?: string[];
  }

  interface UnitDetailData {
    bedrooms: number;
    bathrooms: number;
    floor?: number | null;
  }

  const { listing, media } = details;
  const prop = listing.properties as unknown as PropertyDetailData | null;
  const unit = listing.units as unknown as UnitDetailData | null;

  // Resolve images
  const images = media.length > 0 ? media.map((m) => m.url) : [];
  const mainImage = activeImage || images[0] || null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Meta Headers set up implicitly via TanStack React Router Meta hooks if preferred, or directly in markup */}

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Listings
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
            HomeHunt Verify System Active
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* Gallery Section */}
        {images.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 aspect-[16/10] bg-secondary/20 rounded-2xl overflow-hidden relative border">
              <img src={mainImage!} alt={listing.title} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-3 md:grid-cols-1 gap-3 max-h-[16/10] overflow-y-auto">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(url)}
                  className={`aspect-[16/10] bg-secondary/35 rounded-xl overflow-hidden relative cursor-pointer border transition-all ${
                    mainImage === url
                      ? "ring-2 ring-primary border-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[21/9] bg-secondary/15 rounded-2xl flex flex-col items-center justify-center border border-dashed text-muted-foreground/60 gap-2">
            <Home className="h-12 w-12 stroke-[1.2]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              No photos uploaded for this listing
            </span>
          </div>
        )}

        {/* Listing details grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20">
                  {prop?.property_type || "APARTMENT"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-verified/10 text-verified px-2.5 py-1 rounded border border-verified/20">
                  Verify Coming Soon
                </span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground leading-tight">
                {listing.title}
              </h1>

              {prop && (
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {prop.town}, {prop.county}
                  {prop.neighborhood ? ` — ${prop.neighborhood}` : ""}
                  {prop.estate ? ` (${prop.estate})` : ""}
                </p>
              )}
            </div>

            {/* Layout Specs */}
            <div className="grid grid-cols-3 gap-4 border-y border-border/80 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg text-primary">
                  <Bed className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Bedrooms
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {unit?.bedrooms ?? 0} Beds
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg text-primary">
                  <Bath className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Bathrooms
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {unit?.bathrooms ?? 0} Baths
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg text-primary">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Floor Level
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {unit?.floor !== null && unit?.floor !== undefined
                      ? `Floor ${unit.floor}`
                      : "Ground"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                Listing Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {listing.description || "No description provided for this listing."}
              </p>
            </div>

            {/* Landmarks description */}
            {prop?.landmark_description && (
              <div className="bg-secondary/40 border border-border/60 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Landmarks & Navigation instructions
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {prop.landmark_description}
                </p>
              </div>
            )}

            {/* Amenities Checklist */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <h3 className="font-display font-bold text-lg text-foreground">Shared Amenities</h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {prop?.amenity_list && prop.amenity_list.length > 0 ? (
                  prop.amenity_list.map((am: string) => (
                    <div
                      key={am}
                      className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 text-verified" />
                      <span>{am.replace("_", " ")}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-xs text-muted-foreground italic">
                    No amenities specified for this listing.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Booking Card (Sticky panel) */}
          <div className="md:col-span-1">
            <div className="surface-card p-6 border border-border shadow-md sticky top-24 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Rent Price
                </p>
                <p className="font-display font-extrabold text-3xl text-primary leading-none">
                  {listing.currency} {Number(listing.price).toLocaleString()}
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {" "}
                    / {listing.billing_period.toLowerCase()}
                  </span>
                </p>
                {listing.deposit_amount !== null && (
                  <p className="text-xs text-muted-foreground font-semibold pt-1">
                    Deposit requirement: {listing.currency}{" "}
                    {Number(listing.deposit_amount).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="border-t border-border/80 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" /> Move-in Date
                  </span>
                  <span className="font-bold text-foreground">
                    {new Date(listing.availability_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() =>
                    toast.info(
                      "Booking request and viewing scheduler scheduled for next implementation phase.",
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4" /> Request viewing
                </button>
                <p className="text-[10px] text-center text-muted-foreground/80 leading-normal">
                  Viewings are managed directly by legitimate landlords. Contact info is hidden
                  until application is verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
