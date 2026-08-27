import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getListing } from "@/features/properties/properties.functions";
import { reportListing } from "@/features/properties/trust.functions";
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
  Shield,
  HelpCircle,
  AlertTriangle,
  X,
  ShieldCheck,
  Check,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/homes/$id")({
  component: PublicListingDetailComponent,
});

function PublicListingDetailComponent() {
  const { id: listingId } = Route.useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Trust UI states
  const [badgeExplanation, setBadgeExplanation] = useState<{
    title: string;
    description: string;
    notGuaranteed: string;
  } | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<
    | "WRONG_PRICE"
    | "PROPERTY_UNAVAILABLE"
    | "FAKE_LISTING"
    | "WRONG_LOCATION"
    | "MISLEADING_PHOTOS"
    | "DUPLICATE_LISTING"
    | "SUSPICIOUS_PAYMENT_REQUEST"
    | "IMPERSONATION"
    | "OTHER"
  >("WRONG_PRICE");
  const [reportDescription, setReportDescription] = useState("");

  const {
    data: details,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-listing", listingId],
    queryFn: () => getListing(listingId),
  });

  const submitReportMutation = useMutation({
    mutationFn: () =>
      reportListing({
        listingId,
        reason: reportReason,
        description: reportDescription || undefined,
      }),
    onSuccess: () => {
      toast.success("Listing reported successfully. Our moderation team will review this asset.");
      setShowReportModal(false);
      setReportDescription("");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to submit report.");
    },
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
    verification_status: string;
    owner_identity_verified?: boolean;
    owner_agent_verified?: boolean;
  }

  interface UnitDetailData {
    bedrooms: number;
    bathrooms: number;
    floor?: number | null;
  }

  const { listing: rawListing, media } = details;
  const listing = rawListing as any;
  const prop = listing.properties as unknown as PropertyDetailData | null;
  const unit = listing.units as unknown as UnitDetailData | null;

  // Resolve images
  const images = media.length > 0 ? media.map((m) => m.url) : [];
  const mainImage = activeImage || images[0] || null;

  // Badge Explanations Metadata
  const BADGE_INFO = {
    property: {
      title: "Verified Property",
      description:
        "HomeHunt has reviewed official ownership deeds or physical existence documents confirming this property asset exists at the specified coordinates.",
      notGuaranteed:
        "This does not represent a government construction guarantee or safety certification. Always perform physical inspection.",
    },
    contact: {
      title: "Verified Contact",
      description:
        "The landlord, manager, or agent listing this property has completed legal identity verification with matching government-issued credentials.",
      notGuaranteed:
        "This does not guarantee that the landlord will act in accordance with tenancy laws or prevent contract disputes.",
    },
    listing: {
      title: "Verified Listing",
      description:
        "This specific marketplace listing details (price, unit amenities, type) have been verified against active manager logs or checked by HomeHunt verifiers.",
      notGuaranteed:
        "Listing specifications can change. Always verify availability and rent terms with the landlord directly.",
    },
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Listings
          </Link>
          <Link
            to={"/trust" as any}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            HomeHunt Trust Center
          </Link>
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
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20">
                  {prop?.property_type || "APARTMENT"}
                </span>

                {/* Evidence-backed Trust Badges */}
                {prop?.verification_status === "VERIFIED" && (
                  <button
                    onClick={() => setBadgeExplanation(BADGE_INFO.property)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-verified/10 text-verified px-2.5 py-1 rounded border border-verified/20 cursor-pointer hover:bg-verified/15 transition-all"
                  >
                    <ShieldCheck className="h-3 w-3" /> Property Verified
                    <HelpCircle className="h-2.5 w-2.5 opacity-60" />
                  </button>
                )}

                {prop?.owner_identity_verified && (
                  <button
                    onClick={() => setBadgeExplanation(BADGE_INFO.contact)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-verified/10 text-verified px-2.5 py-1 rounded border border-verified/20 cursor-pointer hover:bg-verified/15 transition-all"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Contact Verified
                    <HelpCircle className="h-2.5 w-2.5 opacity-60" />
                  </button>
                )}

                {listing.verification_status === "VERIFIED" && (
                  <button
                    onClick={() => setBadgeExplanation(BADGE_INFO.listing)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-verified/10 text-verified px-2.5 py-1 rounded border border-verified/20 cursor-pointer hover:bg-verified/15 transition-all"
                  >
                    <Check className="h-3 w-3" /> Listing Verified
                    <HelpCircle className="h-2.5 w-2.5 opacity-60" />
                  </button>
                )}
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

            {/* Freshness confirmation bar */}
            <div className="bg-secondary/40 border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-verified" />
                <span>
                  {listing.freshness_status === "CURRENT" ? (
                    <>Availability confirmed recently</>
                  ) : (
                    <>Availability requires confirmation</>
                  )}
                </span>
              </div>
              <div className="text-right">
                {listing.last_verified_at ? (
                  <span>
                    Last confirmed: {new Date(listing.last_verified_at).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Last confirmed: Unknown</span>
                )}
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

            {/* Contextual payment warning card */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 rounded-xl space-y-2 text-xs leading-normal">
              <h4 className="font-bold flex items-center gap-1.5 text-foreground">
                <AlertTriangle className="h-4 w-4 text-yellow-600" /> Financial Safety Advisory
              </h4>
              <p>
                <strong>Never send money before physical viewing.</strong> Be extremely cautious of requests for "booking fees" or deposits prior to inspecting the property. HomeHunt does not facilitate or guarantee transactions.
              </p>
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

              {/* Safety warning around WhatsApp redirection */}
              <div className="p-3 bg-secondary/30 rounded-xl border border-border text-[10px] text-muted-foreground leading-relaxed">
                If the owner redirects you to <strong>WhatsApp</strong>, verify their identity and do not make payments before viewing the location.
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() =>
                    toast.info(
                      "Viewing requests are managed directly by verifications contacts. Please call owner.",
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4" /> Request viewing
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 py-2.5 text-xs font-bold cursor-pointer transition-all"
                >
                  <ShieldAlert className="h-4 w-4" /> Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------
          BADGE EXPLANATION TOOLTIP / DIALOG
         ------------------------------------------------------------ */}
      {badgeExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setBadgeExplanation(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-primary font-display font-bold">
              <ShieldCheck className="h-5 w-5" /> {badgeExplanation.title}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {badgeExplanation.description}
            </p>
            <div className="p-3 bg-secondary/50 rounded-xl text-[10px] text-muted-foreground leading-normal border">
              <strong>What this does not guarantee:</strong> {badgeExplanation.notGuaranteed}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          REPORT LISTING DIALOG / MODAL
         ------------------------------------------------------------ */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display font-extrabold text-lg text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" /> Report Suspicious Listing
            </h3>
            <p className="text-xs text-muted-foreground">
              Help us keep HomeHunt trustworthy. Please select a reason for reporting this listing:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitReportMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Reason for report
                </label>
                <select
                  value={reportReason}
                  onChange={(e: any) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer"
                >
                  <option value="WRONG_PRICE">Wrong price displayed</option>
                  <option value="PROPERTY_UNAVAILABLE">Property is no longer available</option>
                  <option value="FAKE_LISTING">Fake listing / Scam offer</option>
                  <option value="WRONG_LOCATION">Incorrect geographic location</option>
                  <option value="MISLEADING_PHOTOS">Misleading property photos</option>
                  <option value="DUPLICATE_LISTING">Duplicate listing</option>
                  <option value="SUSPICIOUS_PAYMENT_REQUEST">Suspicious advance payment requested</option>
                  <option value="IMPERSONATION">Impersonating landlord/agent</option>
                  <option value="OTHER">Other listing issues</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Details / Explanation
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide details about the issue to assist our moderation team..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                  type="submit"
                  disabled={submitReportMutation.isPending}
                  className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitReportMutation.isPending && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
