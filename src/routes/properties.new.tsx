import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createProperty } from "@/features/properties/properties.functions";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Building, MapPin, CheckSquare, Loader2, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/new")({
  component: () => (
    <RequireAuth>
      <NewPropertyComponent />
    </RequireAuth>
  ),
});

const AMENITY_OPTIONS = [
  { value: "PARKING", label: "Parking Space" },
  { value: "WATER", label: "Reliable Water" },
  { value: "ELECTRICITY", label: "Electricity connection" },
  { value: "SECURITY", label: "Physical Guard Security" },
  { value: "BOREHOLE", label: "Borehole system" },
  { value: "ELEVATOR", label: "Elevator access" },
  { value: "BALCONY", label: "Balcony" },
  { value: "GARDEN", label: "Garden / Yard" },
  { value: "GYM", label: "Fitness Center" },
  { value: "POOL", label: "Swimming Pool" },
  { value: "INTERNET", label: "Fibre Internet" },
  { value: "CCTV", label: "CCTV surveillance" },
  { value: "BACKUP_POWER", label: "Generator backup" },
  { value: "PET_FRIENDLY", label: "Pet friendly" },
  { value: "FURNISHED", label: "Furnished" },
  { value: "DSQ", label: "Domestic Staff Quarter" },
];

function NewPropertyComponent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState<string>("APARTMENT");
  const [description, setDescription] = useState("");

  // Step 2: Location
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [estate, setEstate] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [landmarkDescription, setLandmarkDescription] = useState("");

  // Step 3: Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: () =>
      createProperty({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        propertyType: propertyType as any,
        name,
        description: description || undefined,
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
    onSuccess: (res) => {
      toast.success("Property created successfully!");
      navigate({ to: `/properties/${res.propertyId}` });
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to create property.");
    },
  });

  const toggleAmenity = (val: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val],
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name || name.trim().length < 3) {
        toast.error("Property name must be at least 3 characters.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!county || !town) {
        toast.error("County and Town location parameters are required.");
        return;
      }
      if (latitude && isNaN(parseFloat(latitude))) {
        toast.error("Latitude must be a valid number.");
        return;
      }
      if (longitude && isNaN(parseFloat(longitude))) {
        toast.error("Longitude must be a valid number.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Add New Property</h1>
          <p className="text-sm text-muted-foreground">
            Onboard a physical property. You can link buildings, units, and listings once created.
          </p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between border border-border p-4 rounded-xl bg-card">
          <div className="flex items-center gap-2">
            <span
              className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                step >= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-foreground">Basics</span>
          </div>
          <div className="h-px bg-border flex-1 mx-4" />
          <div className="flex items-center gap-2">
            <span
              className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                step >= 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-foreground">Location</span>
          </div>
          <div className="h-px bg-border flex-1 mx-4" />
          <div className="flex items-center gap-2">
            <span
              className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                step >= 3
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-foreground">Amenities</span>
          </div>
        </div>

        <div className="surface-card p-6 shadow-sm">
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-1.5 mb-4">
                <Building className="h-5 w-5 text-primary" /> Basic Details
              </h3>

              <div>
                <label
                  htmlFor="prop-name"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Property Name / Title <span className="text-destructive">*</span>
                </label>
                <input
                  id="prop-name"
                  type="text"
                  required
                  placeholder="e.g. Oakwood Heights Apartments"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="prop-type"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Property Type <span className="text-destructive">*</span>
                </label>
                <select
                  id="prop-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer"
                >
                  <option value="APARTMENT">Apartment Building</option>
                  <option value="HOUSE">Standalone House / Villa</option>
                  <option value="BEDSITTER">Bedsitter</option>
                  <option value="STUDIO">Studio Apartment</option>
                  <option value="MAISONETTE">Maisonette</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="VILLA">Villa</option>
                  <option value="BUNGALOW">Bungalow</option>
                  <option value="ROOM">Single Room</option>
                  <option value="SHARED_ACCOMMODATION">Shared Accommodation</option>
                  <option value="OTHER">Other Structural Type</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="prop-desc"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Property Description
                </label>
                <textarea
                  id="prop-desc"
                  rows={4}
                  placeholder="Detail the property layout, accessibility, neighborhood highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                  maxLength={1000}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-1.5 mb-4">
                <MapPin className="h-5 w-5 text-primary" /> Location parameters
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="prop-county"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    County <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="prop-county"
                    type="text"
                    required
                    placeholder="e.g. Nairobi"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prop-town"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Town / City <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="prop-town"
                    type="text"
                    required
                    placeholder="e.g. Kilimani"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="prop-neighborhood"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Neighborhood / Area
                  </label>
                  <input
                    id="prop-neighborhood"
                    type="text"
                    placeholder="e.g. Yaya Centre area"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prop-estate"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Estate / Phase
                  </label>
                  <input
                    id="prop-estate"
                    type="text"
                    placeholder="e.g. Rosewood Estate"
                    value={estate}
                    onChange={(e) => setEstate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="prop-address"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Physical Address
                </label>
                <input
                  id="prop-address"
                  type="text"
                  placeholder="e.g. Plot 42, Argwings Kodhek Rd"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 border-t border-border/40 pt-4">
                <div>
                  <label
                    htmlFor="prop-lat"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Latitude{" "}
                    <span className="text-[10px] text-muted-foreground/60">(Optional Decimal)</span>
                  </label>
                  <input
                    id="prop-lat"
                    type="text"
                    placeholder="e.g. -1.2921"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prop-long"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                  >
                    Longitude{" "}
                    <span className="text-[10px] text-muted-foreground/60">(Optional Decimal)</span>
                  </label>
                  <input
                    id="prop-long"
                    type="text"
                    placeholder="e.g. 36.8219"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="prop-landmark"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Landmarks / Discovery instructions
                </label>
                <input
                  id="prop-landmark"
                  type="text"
                  placeholder="e.g. 100 meters behind Quickmart Kilimani, near the stage"
                  value={landmarkDescription}
                  onChange={(e) => setLandmarkDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AMENITIES */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-1.5 mb-2">
                  <CheckSquare className="h-5 w-5 text-primary" /> Property Amenities
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Select all amenities available at this property layout. These are shared features.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {AMENITY_OPTIONS.map((item) => {
                    const active = selectedAmenities.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleAmenity(item.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          active
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/25"
                            : "border-border bg-transparent hover:border-primary/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/60"
                          }`}
                        >
                          {active && (
                            <svg
                              className="h-3 w-3"
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
                        <span className="text-xs font-semibold text-foreground">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer"
                  disabled={createMutation.isPending}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Property
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
