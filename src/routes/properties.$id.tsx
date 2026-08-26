import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProperty,
  updateProperty,
  createUnit,
  createListing,
  addPropertyMedia,
  removePropertyMedia,
  addPropertyParty,
  removePropertyParty,
  publishListing,
  pauseListing,
  archiveListing,
} from "@/features/properties/properties.functions";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Building,
  MapPin,
  CheckSquare,
  Loader2,
  Save,
  Plus,
  Eye,
  ToggleLeft,
  Globe,
  FileText,
  Image as ImageIcon,
  Users,
  KeyRound,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/$id")({
  component: () => (
    <RequireAuth>
      <PropertyDetailsComponent />
    </RequireAuth>
  ),
});

type TabId = "overview" | "units" | "listings" | "media" | "parties";

function PropertyDetailsComponent() {
  const { id: propertyId } = Route.useParams();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Query property details
  const { data: details, isLoading } = useQuery({
    queryKey: ["property-detail", propertyId],
    queryFn: () => getProperty(propertyId),
  });

  // Modal display toggles
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [isAddingParty, setIsAddingParty] = useState(false);

  // ------------------------------------------------------------
  // Property update mutation
  // ------------------------------------------------------------
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [description, setDescription] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [estate, setEstate] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [landmarkDescription, setLandmarkDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [fieldsSynced, setFieldsSynced] = useState(false);

  // Sync state when details load
  if (details && !fieldsSynced) {
    setName(details.property.name || "");
    setStatus(details.property.status || "DRAFT");
    setDescription(details.property.description || "");
    setCounty(details.property.county || "");
    setTown(details.property.town || "");
    setNeighborhood(details.property.neighborhood || "");
    setEstate(details.property.estate || "");
    setAddress(details.property.address || "");
    setLatitude(details.property.latitude?.toString() || "");
    setLongitude(details.property.longitude?.toString() || "");
    setLandmarkDescription(details.property.landmark_description || "");
    setSelectedAmenities(details.amenities || []);
    setFieldsSynced(true);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProperty({
        id: propertyId,
        name,
        propertyType: details?.property.property_type as unknown as
          | "APARTMENT"
          | "HOUSE"
          | "BEDSITTER"
          | "STUDIO"
          | "MAISONETTE"
          | "TOWNHOUSE"
          | "VILLA"
          | "BUNGALOW"
          | "ROOM"
          | "SHARED_ACCOMMODATION"
          | "OTHER",
        description,
        status: status as unknown as "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED",
        county,
        town,
        neighborhood: neighborhood || undefined,
        estate: estate || undefined,
        address: address || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        landmarkDescription: landmarkDescription || undefined,
        amenities: selectedAmenities,
      }),
    onSuccess: () => {
      toast.success("Property details updated!");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to update property.");
    },
  });

  // ------------------------------------------------------------
  // Unit creation mutation
  // ------------------------------------------------------------
  const [unitNumber, setUnitNumber] = useState("");
  const [unitType, setUnitType] = useState<string>("ONE_BEDROOM");
  const [floor, setFloor] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [area, setArea] = useState("");
  const [unitDescription, setUnitDescription] = useState("");

  const unitMutation = useMutation({
    mutationFn: () =>
      createUnit({
        propertyId,
        unitNumber,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unitType: unitType as any,
        floor: floor ? parseInt(floor) : undefined,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area: area ? parseFloat(area) : undefined,
        status: "AVAILABLE",
        description: unitDescription || undefined,
        amenities: [],
      }),
    onSuccess: () => {
      toast.success("Unit created successfully!");
      setIsAddingUnit(false);
      setUnitNumber("");
      setUnitDescription("");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to create unit.");
    },
  });

  // ------------------------------------------------------------
  // Listing creation mutation
  // ------------------------------------------------------------
  const [listingTitle, setListingTitle] = useState("");
  const [listingDescription, setListingDescription] = useState("");
  const [listingUnitId, setListingUnitId] = useState("");
  const [price, setPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<string>("MONTHLY");
  const [depositAmount, setDepositAmount] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");

  const listingMutation = useMutation({
    mutationFn: () =>
      createListing({
        propertyId,
        unitId: listingUnitId || undefined,
        title: listingTitle,
        description: listingDescription || undefined,
        price: parseFloat(price),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        billingPeriod: billingPeriod as any,
        depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
        availabilityDate,
        currency: "KES",
        listingType: "FOR_RENT",
      }),
    onSuccess: () => {
      toast.success("Listing draft created successfully!");
      setIsAddingListing(false);
      setListingTitle("");
      setListingDescription("");
      setPrice("");
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to create listing.");
    },
  });

  // ------------------------------------------------------------
  // Media creation mutation
  // ------------------------------------------------------------
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [isPrimaryMedia, setIsPrimaryMedia] = useState(false);
  const [mediaListingId, setMediaListingId] = useState("");

  const mediaMutation = useMutation({
    mutationFn: () =>
      addPropertyMedia({
        propertyId,
        listingId: mediaListingId || undefined,
        url: mediaUrl,
        caption: mediaCaption || undefined,
        isPrimary: isPrimaryMedia,
        mediaType: "IMAGE",
        sortOrder: 0,
      }),
    onSuccess: () => {
      toast.success("Image attached successfully!");
      setIsAddingMedia(false);
      setMediaUrl("");
      setMediaCaption("");
      setIsPrimaryMedia(false);
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to attach image.");
    },
  });

  const removeMediaMutation = useMutation({
    mutationFn: (mediaId: string) => removePropertyMedia(mediaId),
    onSuccess: () => {
      toast.success("Media deleted.");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
  });

  // ------------------------------------------------------------
  // Party relationship mutation
  // ------------------------------------------------------------
  const [partyUserId, setPartyUserId] = useState("");
  const [partyType, setPartyType] = useState<string>("AGENT");

  const partyMutation = useMutation({
    mutationFn: () =>
      addPropertyParty({
        propertyId,
        userId: partyUserId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        relationshipType: partyType as any,
        status: "ACTIVE",
      }),
    onSuccess: () => {
      toast.success("Property relationship added!");
      setIsAddingParty(false);
      setPartyUserId("");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to add user relationship.");
    },
  });

  const removePartyMutation = useMutation({
    mutationFn: (partyId: string) => removePropertyParty(partyId),
    onSuccess: () => {
      toast.success("User relationship revoked.");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
  });

  // ------------------------------------------------------------
  // Listing lifecycle toggles
  // ------------------------------------------------------------
  const publishMutation = useMutation({
    mutationFn: (id: string) => publishListing(id),
    onSuccess: () => {
      toast.success("Listing published to marketplace!");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Publish check failed.");
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => pauseListing(id),
    onSuccess: () => {
      toast.success("Listing paused.");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
  });

  const archiveListingMutation = useMutation({
    mutationFn: (id: string) => archiveListing(id),
    onSuccess: () => {
      toast.success("Listing archived.");
      queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
    },
  });

  if (isLoading || !details) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const AMENITIES = [
    "PARKING",
    "WATER",
    "ELECTRICITY",
    "SECURITY",
    "BOREHOLE",
    "ELEVATOR",
    "BALCONY",
    "GARDEN",
    "GYM",
    "POOL",
    "INTERNET",
    "CCTV",
    "BACKUP_POWER",
    "PET_FRIENDLY",
    "FURNISHED",
    "DSQ",
  ];

  const handleAmenityToggle = (val: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val],
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded border border-primary/20">
                {details.property.property_type.replace("_", " ")}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                  details.property.status === "ACTIVE"
                    ? "bg-verified/10 text-verified border-verified/20"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {details.property.status}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mt-2">
              {details.property.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {details.property.town}, {details.property.county}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex border-b border-border overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview & Location
          </button>
          <button
            onClick={() => setActiveTab("units")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "units"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Units ({details.units.length})
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "listings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Listings ({details.listings.length})
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "media"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Media & Photos ({details.media.length})
          </button>
          <button
            onClick={() => setActiveTab("parties")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "parties"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Owner/Parties ({details.parties.length})
          </button>
        </div>

        {/* ------------------------------------------------------------
            OVERVIEW TAB
           ------------------------------------------------------------ */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="surface-card p-6 lg:col-span-2 shadow-sm space-y-4">
              <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-1.5 border-b pb-3 mb-4">
                <FileText className="h-5 w-5 text-primary" /> Modify Property Profile
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="p-name"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Property Name
                    </label>
                    <input
                      id="p-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="p-status"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Lifecycle Status
                    </label>
                    <select
                      id="p-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active (Marketable)</option>
                      <option value="INACTIVE">Inactive (Off Market)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="p-desc"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Property Description
                  </label>
                  <textarea
                    id="p-desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
                  />
                </div>

                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-t pt-4">
                  Location Settings
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="p-county"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      County
                    </label>
                    <input
                      id="p-county"
                      type="text"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="p-town"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Town
                    </label>
                    <input
                      id="p-town"
                      type="text"
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="p-hood"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Neighborhood
                    </label>
                    <input
                      id="p-hood"
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="p-estate"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Estate
                    </label>
                    <input
                      id="p-estate"
                      type="text"
                      value={estate}
                      onChange={(e) => setEstate(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-border/40 pt-4">
                  <div>
                    <label
                      htmlFor="p-lat"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Latitude
                    </label>
                    <input
                      id="p-lat"
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="p-long"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Longitude
                    </label>
                    <input
                      id="p-long"
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="p-landmark"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Landmarks
                  </label>
                  <input
                    id="p-landmark"
                    type="text"
                    value={landmarkDescription}
                    onChange={(e) => setLandmarkDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Profile changes
                  </button>
                </div>
              </form>
            </div>

            {/* Amenities Panel */}
            <div className="surface-card p-6 shadow-sm max-h-fit">
              <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-1.5 border-b pb-3 mb-4">
                <CheckSquare className="h-5 w-5 text-primary" /> Edit Amenities
              </h3>

              <div className="space-y-2">
                {AMENITIES.map((amenity) => {
                  const active = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => {
                        handleAmenityToggle(amenity);
                        updateMutation.mutate();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        active
                          ? "border-primary/30 bg-primary/5 text-primary"
                          : "border-border hover:border-primary/20 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs font-semibold">{amenity.replace("_", " ")}</span>
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {active && (
                          <svg
                            className="h-2.5 w-2.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            UNITS TAB
           ------------------------------------------------------------ */}
        {activeTab === "units" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Registered Subunits
                </h3>
                <p className="text-xs text-muted-foreground">
                  List of rentable units within this property asset.
                </p>
              </div>
              <button
                onClick={() => setIsAddingUnit(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Unit
              </button>
            </div>

            {/* Units table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Unit ID / Number</th>
                    <th className="p-4">Structural Type</th>
                    <th className="p-4">Layout (Beds/Baths)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {details.units.length > 0 ? (
                    details.units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="p-4 pl-6 font-semibold text-foreground">
                          {unit.unit_number}
                          {unit.floor !== null && (
                            <span className="text-[10px] text-muted-foreground font-normal ml-2">
                              (Floor {unit.floor})
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs font-medium text-muted-foreground">
                          {unit.unit_type.replace("_", " ")}
                        </td>
                        <td className="p-4 text-xs text-foreground font-semibold">
                          {unit.bedrooms} Bedroom(s) / {unit.bathrooms} Bath(s)
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              unit.status === "AVAILABLE"
                                ? "bg-verified/10 text-verified border-verified/20"
                                : "bg-secondary text-muted-foreground border-border"
                            }`}
                          >
                            {unit.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Link
                            to="/properties/$propertyId/units/$unitId"
                            params={{ propertyId, unitId: unit.id }}
                            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        No subunits registered. Create a unit to start advertising individual
                        vacancies.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Unit Modal */}
            {isAddingUnit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated">
                  <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                    <h3 className="font-display font-bold text-lg text-foreground">Add Subunit</h3>
                    <button
                      onClick={() => setIsAddingUnit(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      unitMutation.mutate();
                    }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label
                        htmlFor="u-number"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Unit Number / Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="u-number"
                        type="text"
                        required
                        placeholder="e.g. Apartment A101"
                        value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="u-type"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                        >
                          Unit Type
                        </label>
                        <select
                          id="u-type"
                          value={unitType}
                          onChange={(e) => setUnitType(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                        >
                          <option value="ONE_BEDROOM">1 Bedroom</option>
                          <option value="TWO_BEDROOM">2 Bedroom</option>
                          <option value="THREE_BEDROOM">3 Bedroom</option>
                          <option value="FOUR_PLUS_BEDROOM">4+ Bedroom</option>
                          <option value="BEDSITTER">Bedsitter</option>
                          <option value="STUDIO">Studio</option>
                          <option value="ROOM">Single Room</option>
                          <option value="SHARED">Shared Room</option>
                          <option value="HOUSE">House</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="u-floor"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                        >
                          Floor Level
                        </label>
                        <input
                          id="u-floor"
                          type="number"
                          placeholder="e.g. 1"
                          value={floor}
                          onChange={(e) => setFloor(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="u-beds"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                        >
                          Bedrooms
                        </label>
                        <input
                          id="u-beds"
                          type="number"
                          required
                          value={bedrooms}
                          onChange={(e) => setBedrooms(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="u-baths"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                        >
                          Bathrooms
                        </label>
                        <input
                          id="u-baths"
                          type="number"
                          required
                          value={bathrooms}
                          onChange={(e) => setBathrooms(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="u-desc"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Unit Description
                      </label>
                      <textarea
                        id="u-desc"
                        rows={3}
                        placeholder="Description of this specific unit layout or view..."
                        value={unitDescription}
                        onChange={(e) => setUnitDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsAddingUnit(false)}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={unitMutation.isPending}
                        className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5"
                      >
                        {unitMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                        Add Unit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------
            LISTINGS TAB
           ------------------------------------------------------------ */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Marketplace Advertisements
                </h3>
                <p className="text-xs text-muted-foreground">
                  Listings created to publish this property (or sub-units) online.
                </p>
              </div>
              <button
                onClick={() => setIsAddingListing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create Listing
              </button>
            </div>

            {/* Listings List */}
            <div className="grid gap-4">
              {details.listings.length > 0 ? (
                details.listings.map((list) => (
                  <div
                    key={list.id}
                    className="surface-card p-5 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{list.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            list.status === "PUBLISHED"
                              ? "bg-verified/10 text-verified border-verified/20"
                              : list.status === "DRAFT"
                                ? "bg-secondary text-muted-foreground border-border"
                                : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                          }`}
                        >
                          {list.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-primary mt-1">
                        {list.currency} {Number(list.price).toLocaleString()} /{" "}
                        {list.billing_period.toLowerCase()}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Availability: {new Date(list.availability_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap self-end md:self-auto">
                      {list.status === "DRAFT" || list.status === "PAUSED" ? (
                        <button
                          onClick={() => publishMutation.mutate(list.id)}
                          disabled={publishMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <Globe className="h-3.5 w-3.5" /> Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => pauseMutation.mutate(list.id)}
                          disabled={pauseMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                        >
                          <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" /> Pause
                        </button>
                      )}

                      <button
                        onClick={() => archiveListingMutation.mutate(list.id)}
                        disabled={archiveListingMutation.isPending}
                        className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 cursor-pointer"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground">
                    No listings created. Add a listing to advertise vacancies to the public.
                  </p>
                </div>
              )}
            </div>

            {/* Add Listing Modal */}
            {isAddingListing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated">
                  <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Create Listing Draft
                    </h3>
                    <button
                      onClick={() => setIsAddingListing(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      listingMutation.mutate();
                    }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label
                        htmlFor="l-title"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Listing Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="l-title"
                        type="text"
                        required
                        placeholder="e.g. Premium 2-Bedroom in Kilimani with Balcony"
                        value={listingTitle}
                        onChange={(e) => setListingTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="l-unit"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Associate Subunit{" "}
                        <span className="text-muted-foreground/60">(Optional)</span>
                      </label>
                      <select
                        id="l-unit"
                        value={listingUnitId}
                        onChange={(e) => setListingUnitId(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                      >
                        <option value="">Whole Property (Structural unit not specified)</option>
                        {details.units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unit_number} ({unit.unit_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="l-price"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                        >
                          Monthly Rent (KES) <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="l-price"
                          type="number"
                          required
                          placeholder="e.g. 45000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="l-deposit"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                        >
                          Security Deposit (KES)
                        </label>
                        <input
                          id="l-deposit"
                          type="number"
                          placeholder="e.g. 45000"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="l-avail"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Availability Date <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="l-avail"
                        type="date"
                        required
                        value={availabilityDate}
                        onChange={(e) => setAvailabilityDate(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="l-desc"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Listing Description
                      </label>
                      <textarea
                        id="l-desc"
                        rows={3}
                        placeholder="Detail payment conditions, utilities billing, roommate status..."
                        value={listingDescription}
                        onChange={(e) => setListingDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsAddingListing(false)}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={listingMutation.isPending}
                        className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5"
                      >
                        {listingMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                        Create Draft
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------
            MEDIA TAB
           ------------------------------------------------------------ */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Property Galleries
                </h3>
                <p className="text-xs text-muted-foreground">Attach images to listings or units.</p>
              </div>
              <button
                onClick={() => setIsAddingMedia(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Image
              </button>
            </div>

            {/* Media grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              {details.media.length > 0 ? (
                details.media.map((media) => (
                  <div
                    key={media.id}
                    className="relative bg-card border border-border rounded-xl overflow-hidden group shadow-sm flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-secondary/30 overflow-hidden relative shrink-0">
                      <img
                        src={media.url}
                        alt={media.caption || ""}
                        className="w-full h-full object-cover"
                      />
                      {media.is_primary && (
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="p-3 flex justify-between items-center gap-2">
                      <p className="text-[10px] text-muted-foreground truncate">
                        {media.caption || "No Caption"}
                      </p>
                      <button
                        onClick={() => removeMediaMutation.mutate(media.id)}
                        disabled={removeMediaMutation.isPending}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center p-8 border border-dashed rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground">
                    No media attachments found. Upload photos before publishing listings.
                  </p>
                </div>
              )}
            </div>

            {/* Add Media Modal */}
            {isAddingMedia && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated">
                  <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Attach Image Link
                    </h3>
                    <button
                      onClick={() => setIsAddingMedia(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      mediaMutation.mutate();
                    }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label
                        htmlFor="m-url"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Image URL <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="m-url"
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/photo-..."
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="m-list"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Associate to Listing{" "}
                        <span className="text-muted-foreground/60">
                          (Required for listings display)
                        </span>
                      </label>
                      <select
                        id="m-list"
                        value={mediaListingId}
                        onChange={(e) => setMediaListingId(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                      >
                        <option value="">General Property Image</option>
                        {details.listings.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="m-cap"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Caption
                      </label>
                      <input
                        id="m-cap"
                        type="text"
                        placeholder="e.g. Master Bedroom"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-2">
                      <input
                        id="m-primary"
                        type="checkbox"
                        checked={isPrimaryMedia}
                        onChange={(e) => setIsPrimaryMedia(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/20 h-4.5 w-4.5"
                      />
                      <label htmlFor="m-primary" className="text-xs font-semibold text-foreground">
                        Set as Primary/Thumbnail Image
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsAddingMedia(false)}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={mediaMutation.isPending}
                        className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5"
                      >
                        {mediaMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                        Attach Image
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------
            PARTIES TAB
           ------------------------------------------------------------ */}
        {activeTab === "parties" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Authorized Management relationships
                </h3>
                <p className="text-xs text-muted-foreground">
                  List of users who can inspect or update details for this specific property.
                </p>
              </div>
              <button
                onClick={() => setIsAddingParty(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Manager / Agent
              </button>
            </div>

            {/* Parties List */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Associated User ID</th>
                    <th className="p-4">Assigned Relationship</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {details.parties.map((party) => {
                    const prof = party.profiles as unknown as {
                      full_name: string;
                      phone_number: string;
                    } | null;
                    return (
                      <tr key={party.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-foreground">
                            {prof?.full_name || "Platform User"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {party.user_id}
                          </p>
                        </td>
                        <td className="p-4 font-semibold text-xs text-primary">
                          {party.relationship_type}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              party.status === "ACTIVE"
                                ? "bg-verified/10 text-verified border-verified/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {party.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {party.user_id !== details.property.owner_user_id &&
                            party.status === "ACTIVE" && (
                              <button
                                onClick={() => removePartyMutation.mutate(party.id)}
                                className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
                              >
                                Revoke Relationship
                              </button>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Party Modal */}
            {isAddingParty && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated">
                  <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Add Property relationship
                    </h3>
                    <button
                      onClick={() => setIsAddingParty(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      partyMutation.mutate();
                    }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label
                        htmlFor="p-userid"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Target User UUID <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="p-userid"
                        type="text"
                        required
                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                        value={partyUserId}
                        onChange={(e) => setPartyUserId(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="p-reltype"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Relationship Designation
                      </label>
                      <select
                        id="p-reltype"
                        value={partyType}
                        onChange={(e) => setPartyType(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer"
                      >
                        <option value="AGENT">Marketing Agent</option>
                        <option value="PROPERTY_MANAGER">Property Manager</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsAddingParty(false)}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={partyMutation.isPending}
                        className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5"
                      >
                        {partyMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                        Add relationship
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Inline trash icon since trash2 is missing from imports list
function Trash2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
