/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserPreferences,
  saveUserPreferences,
  getRecommendations,
  submitRecommendationFeedback,
} from "@/features/properties/matching.functions";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  SlidersHorizontal,
  Home,
  CheckCircle2,
  AlertTriangle,
  X,
  Heart,
  EyeOff,
  Compass,
  ArrowRight,
  Plus,
  Trash2,
  Info,
  Check,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/recommendations")({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);

  // Active preference inputs (local state for edits)
  const [prefBudget, setPrefBudget] = useState<number>(30000);
  const [maxBudget, setMaxBudget] = useState<number>(45000);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["APARTMENT"]);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bedroomsRule, setBedroomsRule] = useState<"MIN" | "MAX" | "EXACT">("MIN");
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [bathroomsRule, setBathroomsRule] = useState<"MIN" | "MAX" | "EXACT">("MIN");

  const [countyInput, setCountyInput] = useState("Nairobi");
  const [townInput, setTownInput] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<any[]>([]);

  const [amenityInput, setAmenityInput] = useState("");
  const [amenityPriority, setAmenityPriority] = useState<"MUST_HAVE" | "PREFERRED" | "OPTIONAL">(
    "PREFERRED",
  );
  const [preferredAmenities, setPreferredAmenities] = useState<any[]>([]);

  // Priority Weights
  const [budgetWeight, setBudgetWeight] = useState<string>("CRITICAL");
  const [locationWeight, setLocationWeight] = useState<string>("CRITICAL");
  const [bedroomsWeight, setBedroomsWeight] = useState<string>("HIGH");
  const [bathroomsWeight, setBathroomsWeight] = useState<string>("MEDIUM");
  const [amenitiesWeight, setAmenitiesWeight] = useState<string>("MEDIUM");
  const [propertyTypeWeight, setPropertyTypeWeight] = useState<string>("HIGH");

  // Selected explanation modal
  const [explainedMatch, setExplainedMatch] = useState<any | null>(null);

  // Onboarding Step state (if preferences are completely empty)
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);

  // ------------------------------------------------------------
  // Queries
  // ------------------------------------------------------------
  const { data: prefs, isLoading: isPrefsLoading } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: () => getUserPreferences(),
  });

  const { data: recommendations, isLoading: isRecsLoading } = useQuery({
    queryKey: ["matching-recommendations"],
    queryFn: () => getRecommendations() as Promise<any>,
  });

  // Sync preferences data into local states on load/edit
  React.useEffect(() => {
    if (prefs) {
      setPrefBudget(prefs.preferredBudget || 30000);
      setMaxBudget(prefs.maxBudget || 45000);
      setPropertyTypes(prefs.propertyTypes || ["APARTMENT"]);
      setBedrooms(prefs.bedrooms || 2);
      setBedroomsRule((prefs.bedroomsRule as any) || "MIN");
      setBathrooms(prefs.bathrooms || 1);
      setBathroomsRule((prefs.bathroomsRule as any) || "MIN");
      setPreferredLocations(prefs.preferredLocations || []);
      setPreferredAmenities(prefs.amenities || []);

      if (prefs.priorityWeights) {
        setBudgetWeight(prefs.priorityWeights.budget || "CRITICAL");
        setLocationWeight(prefs.priorityWeights.location || "CRITICAL");
        setBedroomsWeight(prefs.priorityWeights.bedrooms || "HIGH");
        setBathroomsWeight(prefs.priorityWeights.bathrooms || "MEDIUM");
        setAmenitiesWeight(prefs.priorityWeights.amenities || "MEDIUM");
        setPropertyTypeWeight(prefs.priorityWeights.propertyType || "HIGH");
      }

      // Check if preferences are completely unconfigured to prompt onboarding
      const hasConfig =
        !!prefs.maxBudget || (prefs.preferredLocations && prefs.preferredLocations.length > 0);
      if (!hasConfig && onboardingStep === null) {
        setOnboardingStep(1);
      }
    }
  }, [prefs]);

  // ------------------------------------------------------------
  // Mutations
  // ------------------------------------------------------------
  const savePrefsMutation = useMutation({
    mutationFn: (newPrefs: any) => saveUserPreferences(newPrefs),
    onSuccess: () => {
      toast.success("Housing preference profile saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["matching-recommendations"] });
      setShowEditor(false);
      setOnboardingStep(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save preferences.");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (feedback: {
      listingId: string;
      type: "LIKE" | "SAVE" | "DISLIKE" | "HIDE" | "NOT_RELEVANT";
    }) =>
      submitRecommendationFeedback({
        listingId: feedback.listingId,
        feedbackType: feedback.type,
      }),
    onSuccess: (_, variables) => {
      if (variables.type === "HIDE") {
        toast.success("Listing hidden. We won't recommend this listing to you again.");
      } else if (variables.type === "SAVE") {
        toast.success("Listing saved to recommendations.");
      }
      queryClient.invalidateQueries({ queryKey: ["matching-recommendations"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit feedback.");
    },
  });

  // ------------------------------------------------------------
  // Helper Handlers
  // ------------------------------------------------------------
  const handleAddLocation = () => {
    if (!countyInput) return;
    const newLoc = {
      county: countyInput,
      town: townInput || undefined,
      priority: "HIGH" as const,
    };
    setPreferredLocations([...preferredLocations, newLoc]);
    setTownInput("");
  };

  const handleRemoveLocation = (index: number) => {
    setPreferredLocations(preferredLocations.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (!amenityInput) return;
    const newAm = {
      amenity: amenityInput,
      priority: amenityPriority,
    };
    setPreferredAmenities([...preferredAmenities, newAm]);
    setAmenityInput("");
  };

  const handleRemoveAmenity = (index: number) => {
    setPreferredAmenities(preferredAmenities.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    savePrefsMutation.mutate({
      preferredBudget: prefBudget || undefined,
      maxBudget: maxBudget || undefined,
      propertyTypes,
      bedrooms: bedrooms || undefined,
      bedroomsRule,
      bathrooms: bathrooms || undefined,
      bathroomsRule,
      preferredLocations,
      amenities: preferredAmenities,
      priorityWeights: {
        budget: budgetWeight,
        location: locationWeight,
        bedrooms: bedroomsWeight,
        bathrooms: bathroomsWeight,
        amenities: amenitiesWeight,
        propertyType: propertyTypeWeight,
      },
      furnishingPreference: "ANY",
      useBehavioralPersonalization: true,
    });
  };

  const handleResetPersonalization = () => {
    savePrefsMutation.mutate({
      preferredBudget: undefined,
      maxBudget: undefined,
      propertyTypes: [],
      bedrooms: undefined,
      bedroomsRule: "MIN",
      bathrooms: undefined,
      bathroomsRule: "MIN",
      preferredLocations: [],
      amenities: [],
      priorityWeights: {
        budget: "CRITICAL",
        location: "CRITICAL",
        bedrooms: "HIGH",
        bathrooms: "MEDIUM",
        amenities: "MEDIUM",
        propertyType: "HIGH",
      },
      furnishingPreference: "ANY",
      useBehavioralPersonalization: true,
    });
    toast.success("Preferences and behavioral model reset to default.");
  };

  const handleTogglePropType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter((t) => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  if (isPrefsLoading || isRecsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-semibold">
              Generating housing matches...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ------------------------------------------------------------
  // ONBOARDING QUESTIONNAIRE RENDERING
  // ------------------------------------------------------------
  if (onboardingStep !== null) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-10 px-4 bg-card border rounded-3xl shadow-lg space-y-6">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="font-display font-black text-primary text-sm flex items-center gap-1">
              <Compass className="h-5 w-5" /> HomeHunt Onboarding
            </span>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
              Step {onboardingStep} of 4
            </span>
          </div>

          {onboardingStep === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">
                Where do you want to live?
              </h2>
              <p className="text-xs text-muted-foreground">
                Select preferred county and town in Kenya:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    County
                  </label>
                  <select
                    value={countyInput}
                    onChange={(e) => setCountyInput(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Nyeri">Nyeri</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Town (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kilimani, Nyeri Town"
                    value={townInput}
                    onChange={(e) => setTownInput(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleAddLocation();
                  setOnboardingStep(2);
                }}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer mt-4"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">
                What is your monthly budget?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Target Budget (KES)
                  </label>
                  <input
                    type="number"
                    value={prefBudget}
                    onChange={(e) => setPrefBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Absolute Ceiling (KES)
                  </label>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(3)}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer"
                >
                  Next Step <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="px-4 py-2 border rounded-xl hover:bg-secondary text-xs font-semibold"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">
                Rooms & Property Type
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Preferred Bedrooms
                  </label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Property Type
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {["APARTMENT", "HOUSE", "STUDIO", "BEDSITTER"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTogglePropType(t)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          propertyTypes.includes(t)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/40 text-muted-foreground border-border"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(4)}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer"
                >
                  Next Step <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="px-4 py-2 border rounded-xl hover:bg-secondary text-xs font-semibold"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground">
                Select priority preferences
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground">Budget Priority</span>
                  <select
                    value={budgetWeight}
                    onChange={(e) => setBudgetWeight(e.target.value)}
                    className="px-2 py-1 bg-secondary border rounded cursor-pointer"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground">Location Priority</span>
                  <select
                    value={locationWeight}
                    onChange={(e) => setLocationWeight(e.target.value)}
                    className="px-2 py-1 bg-secondary border rounded cursor-pointer"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer"
                >
                  Complete Onboarding
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(3)}
                  className="px-4 py-2 border rounded-xl hover:bg-secondary text-xs font-semibold"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Group recommendations by categories
  const items = recommendations?.items || [];
  const bestMatches = items.filter(
    (x: any) => x.category === "BEST_MATCH" || x.category === "STRONG_MATCH",
  );
  const goodMatches = items.filter((x: any) => x.category === "GOOD_MATCH");
  const closeMatches = items.filter((x: any) => x.category === "CLOSE_MATCH");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Intelligent Matcher</h1>
            <p className="text-sm text-muted-foreground">
              Housing options ranked and evaluated dynamically based on your preferences profile.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 shadow-md transition-all cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" /> Customize Preferences
            </button>
            <button
              onClick={handleResetPersonalization}
              className="inline-flex items-center gap-1 bg-secondary text-foreground text-xs font-semibold px-3 py-2.5 rounded-xl border hover:bg-secondary/80 cursor-pointer"
            >
              Reset personalization
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------
            PREFERENCES CONFIGURATION EDITOR
           ------------------------------------------------------------ */}
        {showEditor && (
          <div className="bg-card border rounded-2xl p-6 shadow-md space-y-6 animate-in slide-in-from-top-4 duration-200">
            <h3 className="font-display font-bold text-lg text-foreground border-b pb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="h-5 w-5 text-primary" /> Edit Housing Preference Profile
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Left Column: Constraints */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                      Preferred Rent (KES)
                    </label>
                    <input
                      type="number"
                      value={prefBudget}
                      onChange={(e) => setPrefBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                      Maximum Rent (KES)
                    </label>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                      Bedrooms Required
                    </label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                      Bedrooms Constraint
                    </label>
                    <select
                      value={bedroomsRule}
                      onChange={(e: any) => setBedroomsRule(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="MIN">At Least (Min)</option>
                      <option value="EXACT">Exactly</option>
                      <option value="MAX">At Most (Max)</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Locations */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Preferred Locations
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countyInput}
                      onChange={(e) => setCountyInput(e.target.value)}
                      className="px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none"
                    >
                      <option value="Nairobi">Nairobi</option>
                      <option value="Nyeri">Nyeri</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Mombasa">Mombasa</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Town name (optional)..."
                      value={townInput}
                      onChange={(e) => setTownInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddLocation}
                      className="px-3 bg-secondary text-foreground hover:bg-secondary/80 border rounded-lg cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preferredLocations.map((loc, i) => (
                      <span
                        key={i}
                        className="bg-secondary px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted-foreground border border-border flex items-center gap-1"
                      >
                        {loc.county} {loc.town ? `— ${loc.town}` : ""}
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(i)}
                          className="text-destructive font-black text-xs px-1 hover:bg-destructive/10 rounded"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Weights and Priorities */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block border-b pb-1">
                    Matching Priority Weight Configurations
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-muted-foreground">Budget weight</span>
                      <select
                        value={budgetWeight}
                        onChange={(e) => setBudgetWeight(e.target.value)}
                        className="px-2 py-1.5 bg-secondary border rounded cursor-pointer"
                      >
                        <option value="CRITICAL">Critical (40 pts)</option>
                        <option value="HIGH">High (25 pts)</option>
                        <option value="MEDIUM">Medium (15 pts)</option>
                        <option value="LOW">Low (10 pts)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-muted-foreground">Location weight</span>
                      <select
                        value={locationWeight}
                        onChange={(e) => setLocationWeight(e.target.value)}
                        className="px-2 py-1.5 bg-secondary border rounded cursor-pointer"
                      >
                        <option value="CRITICAL">Critical (40 pts)</option>
                        <option value="HIGH">High (25 pts)</option>
                        <option value="MEDIUM">Medium (15 pts)</option>
                        <option value="LOW">Low (10 pts)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-muted-foreground">Bedrooms weight</span>
                      <select
                        value={bedroomsWeight}
                        onChange={(e) => setBedroomsWeight(e.target.value)}
                        className="px-2 py-1.5 bg-secondary border rounded cursor-pointer"
                      >
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-muted-foreground">Amenities weight</span>
                      <select
                        value={amenitiesWeight}
                        onChange={(e) => setAmenitiesWeight(e.target.value)}
                        className="px-2 py-1.5 bg-secondary border rounded cursor-pointer"
                      >
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Amenities editor */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Target Amenities
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none"
                    >
                      <option value="">Select amenity...</option>
                      <option value="PARKING">Parking space</option>
                      <option value="SECURITY">Security guard</option>
                      <option value="WATER">Reliable water</option>
                      <option value="INTERNET">Fiber internet</option>
                      <option value="BALCONY">Private balcony</option>
                      <option value="BACKUP_WATER">Backup water supply</option>
                    </select>
                    <select
                      value={amenityPriority}
                      onChange={(e: any) => setAmenityPriority(e.target.value)}
                      className="px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none"
                    >
                      <option value="MUST_HAVE">MUST HAVE</option>
                      <option value="PREFERRED">PREFERRED</option>
                      <option value="OPTIONAL">OPTIONAL</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="px-3 bg-secondary text-foreground hover:bg-secondary/80 border rounded-lg cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preferredAmenities.map((am, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                          am.priority === "MUST_HAVE"
                            ? "bg-destructive/5 text-destructive border-destructive/20"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}
                      >
                        {am.amenity} ({am.priority})
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(i)}
                          className="text-destructive font-black text-xs px-1 hover:bg-destructive/10 rounded"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                onClick={handleSaveAll}
                disabled={savePrefsMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {savePrefsMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Save Preference Profile
              </button>
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            SECTION 1: BEST & STRONG MATCHES
           ------------------------------------------------------------ */}
        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-verified" /> Best & Strong Matches
          </h2>
          {bestMatches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {bestMatches.map((item: any) => (
                <MatchCard
                  key={item.listing.id}
                  item={item}
                  onInspect={() => setExplainedMatch(item)}
                  onSave={() =>
                    feedbackMutation.mutate({ listingId: item.listing.id, type: "SAVE" })
                  }
                  onHide={() =>
                    feedbackMutation.mutate({ listingId: item.listing.id, type: "HIDE" })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-secondary/15 border border-dashed rounded-2xl text-center text-muted-foreground/60 text-xs">
              No strong housing matches found within your current constraints. Try adjusting your
              preferences.
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------
            SECTION 2: GOOD MATCHES
           ------------------------------------------------------------ */}
        {goodMatches.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Good Matches
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {goodMatches.map((item: any) => (
                <MatchCard
                  key={item.listing.id}
                  item={item}
                  onInspect={() => setExplainedMatch(item)}
                  onSave={() =>
                    feedbackMutation.mutate({ listingId: item.listing.id, type: "SAVE" })
                  }
                  onHide={() =>
                    feedbackMutation.mutate({ listingId: item.listing.id, type: "HIDE" })
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------
            SECTION 3: CLOSE MATCHES (RELAXATION ENGINE RESULTS)
           ------------------------------------------------------------ */}
        {closeMatches.length > 0 && (
          <section className="space-y-4">
            <div className="flex gap-2 items-center text-accent">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="font-display font-bold text-lg text-foreground">Close Matches</h2>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed -mt-3">
              Listings that slightly exceed budget limits or lack non-critical parameters but are
              nearby:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {closeMatches.map((item: any) => (
                <MatchCard
                  key={item.listing.id}
                  item={item}
                  onInspect={() => setExplainedMatch(item)}
                  onSave={() =>
                    feedbackMutation.mutate({ listingId: item.listing.id, type: "SAVE" })
                  }
                  onHide={() =>
                    feedbackMutation.mutate({ listingId: item.listing.id, type: "HIDE" })
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State suggestions */}
        {items.length === 0 && (
          <div className="max-w-md mx-auto text-center py-10 space-y-4 bg-secondary/10 border border-dashed rounded-2xl">
            <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-display font-bold text-sm text-foreground">No matches found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              We couldn't locate listings matching your filters. Try relaxing your budget limits,
              lowering room constraints, or selecting adjacent locations.
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------
          MATCH SCORE EXPLANATION DIALOG MODAL
         ------------------------------------------------------------ */}
      {explainedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setExplainedMatch(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-primary font-display font-bold">
              <Info className="h-5 w-5" /> Match Score Breakdown
            </div>

            <div className="flex justify-between items-center bg-secondary/35 p-4 rounded-xl">
              <div>
                <p className="text-2xl font-black text-primary">{explainedMatch.score}%</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {explainedMatch.category.replace("_", " ")}
                </p>
              </div>
              <div className="text-right text-[10px] text-muted-foreground">
                Compatibility Rating
              </div>
            </div>

            {/* Reasons logs */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {explainedMatch.reasons?.map((reason: any, idx: number) => (
                <div key={idx} className="flex gap-2 items-start text-xs leading-normal">
                  {reason.isPositive ? (
                    <Check className="h-4 w-4 text-verified shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <span className="text-muted-foreground">{reason.message}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-secondary/35 border rounded-xl text-[10px] text-muted-foreground leading-normal">
              <strong>Matching Disclaimer:</strong> Scores are suggestions based on metadata.
              Renters should inspect properties and confirm caretaker status physically.
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ------------------------------------------------------------
// COMPACT MATCH CARD COMPONENT
// ------------------------------------------------------------
interface MatchCardProps {
  item: any;
  onInspect: () => void;
  onSave: () => void;
  onHide: () => void;
}

function MatchCard({ item, onInspect, onSave, onHide }: MatchCardProps) {
  const listing = item.listing;
  const price = Number(listing.price);

  return (
    <div className="surface-card border rounded-2xl overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col group relative">
      {/* Listing Photo */}
      <div className="aspect-[16/10] bg-secondary/30 relative overflow-hidden">
        {listing.primaryImageUrl ? (
          <img
            src={listing.primaryImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/35">
            <Home className="h-10 w-10" />
          </div>
        )}

        {/* Match score overlay badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect();
            }}
            className="text-[10px] font-black uppercase tracking-wider text-white bg-primary px-2.5 py-1 rounded-lg flex items-center gap-0.5 shadow cursor-pointer hover:bg-primary/95 transition-all"
          >
            {item.score}% Match
          </button>

          {item.trust?.propertyVerified && (
            <span className="text-[10px] font-bold uppercase bg-verified text-white px-2.5 py-1 rounded-lg shadow flex items-center gap-0.5">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Dislike/Hide button on overlay */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
            className="p-1.5 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive rounded-lg shadow transition-colors cursor-pointer"
            title="Hide this recommendation"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <Link
            to="/homes/$id"
            params={{ id: listing.id } as any}
            className="font-display font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block"
          >
            {listing.title}
          </Link>
          <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-0.5">
            <MapPinIcon className="h-3.5 w-3.5" />
            {listing.town}, {listing.county}
          </p>
        </div>

        {/* Specs and Pricing */}
        <div className="flex justify-between items-end border-t border-border/60 pt-3">
          <div className="text-xs text-muted-foreground font-semibold">
            {listing.bedrooms} Beds • {listing.bathrooms} Baths
          </div>
          <div className="text-right">
            <p className="font-display font-extrabold text-base text-primary">
              KES {price.toLocaleString()}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider -mt-0.5">
              / {listing.billingPeriod?.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
