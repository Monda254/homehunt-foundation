import { r as __toESM } from "../_runtime.mjs";
import { i as createServerFn } from "./server-Dy3VKkCi.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as requireSupabaseAuth } from "./api-error-CUUESrGA.mjs";
import { d as stringType } from "../_libs/zod.mjs";
import { $ as EyeOff, Ct as ArrowRight, E as Plus, H as Info, I as LoaderCircle, U as House, W as Heart, h as SlidersHorizontal, lt as CircleCheck, pt as Check, rt as Compass, s as TriangleAlert, t as X, y as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./router-CmEb8YAq.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { i as UserPreferencesInputSchema, n as RecommendationFeedbackSchema, r as SaveSearchSchema } from "./matching.types-PEIC8pz-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recommendations-NXt8nTPA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fnSaveUserPreferences = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UserPreferencesInputSchema).handler(createSsrRpc("161f3d29a540e7478f8cb373894209f732c87a4d636030a9700bf3571c31a2f1"));
var saveUserPreferences = (data) => fnSaveUserPreferences({ data });
var fnGetUserPreferences = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("3b3bf9595214e704f4c2ee2bfe39571e260535193e0b23e3a61880dec81337b8"));
var getUserPreferences = () => fnGetUserPreferences();
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SaveSearchSchema).handler(createSsrRpc("238615ca9f80e8c23afb79cf8ad69dbfb81756063a3cff1b7c5b0f2126c60ee5"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("684cb65a44c3305e8b843b02745487af46657526fd937da4401639cf09f06bc2"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("63a11dd2b9f8b4e4ef667c139092a618f901cba4dac0c57e2f7a59c1ebb68a66"));
var fnSubmitRecommendationFeedback = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RecommendationFeedbackSchema).handler(createSsrRpc("cac6dc7191130ac345ffff8ad59c22051d95b1be2dd2ba861809e289fdf9ce8e"));
var submitRecommendationFeedback = (data) => fnSubmitRecommendationFeedback({ data });
var fnGetRecommendations = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("a57b8be53f67227a7811d760ac5b83b4732c09c0596a898fe42d647fe69ad8c1"));
var getRecommendations = () => fnGetRecommendations();
function RecommendationsPage() {
	const queryClient = useQueryClient();
	const [showEditor, setShowEditor] = (0, import_react.useState)(false);
	const [prefBudget, setPrefBudget] = (0, import_react.useState)(3e4);
	const [maxBudget, setMaxBudget] = (0, import_react.useState)(45e3);
	const [propertyTypes, setPropertyTypes] = (0, import_react.useState)(["APARTMENT"]);
	const [bedrooms, setBedrooms] = (0, import_react.useState)(2);
	const [bedroomsRule, setBedroomsRule] = (0, import_react.useState)("MIN");
	const [bathrooms, setBathrooms] = (0, import_react.useState)(1);
	const [bathroomsRule, setBathroomsRule] = (0, import_react.useState)("MIN");
	const [countyInput, setCountyInput] = (0, import_react.useState)("Nairobi");
	const [townInput, setTownInput] = (0, import_react.useState)("");
	const [preferredLocations, setPreferredLocations] = (0, import_react.useState)([]);
	const [amenityInput, setAmenityInput] = (0, import_react.useState)("");
	const [amenityPriority, setAmenityPriority] = (0, import_react.useState)("PREFERRED");
	const [preferredAmenities, setPreferredAmenities] = (0, import_react.useState)([]);
	const [budgetWeight, setBudgetWeight] = (0, import_react.useState)("CRITICAL");
	const [locationWeight, setLocationWeight] = (0, import_react.useState)("CRITICAL");
	const [bedroomsWeight, setBedroomsWeight] = (0, import_react.useState)("HIGH");
	const [bathroomsWeight, setBathroomsWeight] = (0, import_react.useState)("MEDIUM");
	const [amenitiesWeight, setAmenitiesWeight] = (0, import_react.useState)("MEDIUM");
	const [propertyTypeWeight, setPropertyTypeWeight] = (0, import_react.useState)("HIGH");
	const [explainedMatch, setExplainedMatch] = (0, import_react.useState)(null);
	const [onboardingStep, setOnboardingStep] = (0, import_react.useState)(null);
	const { data: prefs, isLoading: isPrefsLoading } = useQuery({
		queryKey: ["user-preferences"],
		queryFn: () => getUserPreferences()
	});
	const { data: recommendations, isLoading: isRecsLoading } = useQuery({
		queryKey: ["matching-recommendations"],
		queryFn: () => getRecommendations()
	});
	import_react.useEffect(() => {
		if (prefs) {
			setPrefBudget(prefs.preferredBudget || 3e4);
			setMaxBudget(prefs.maxBudget || 45e3);
			setPropertyTypes(prefs.propertyTypes || ["APARTMENT"]);
			setBedrooms(prefs.bedrooms || 2);
			setBedroomsRule(prefs.bedroomsRule || "MIN");
			setBathrooms(prefs.bathrooms || 1);
			setBathroomsRule(prefs.bathroomsRule || "MIN");
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
			if (!(!!prefs.maxBudget || prefs.preferredLocations && prefs.preferredLocations.length > 0) && onboardingStep === null) setOnboardingStep(1);
		}
	}, [prefs]);
	const savePrefsMutation = useMutation({
		mutationFn: (newPrefs) => saveUserPreferences(newPrefs),
		onSuccess: () => {
			toast.success("Housing preference profile saved successfully.");
			queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
			queryClient.invalidateQueries({ queryKey: ["matching-recommendations"] });
			setShowEditor(false);
			setOnboardingStep(null);
		},
		onError: (err) => {
			toast.error(err.message || "Failed to save preferences.");
		}
	});
	const feedbackMutation = useMutation({
		mutationFn: (feedback) => submitRecommendationFeedback({
			listingId: feedback.listingId,
			feedbackType: feedback.type
		}),
		onSuccess: (_, variables) => {
			if (variables.type === "HIDE") toast.success("Listing hidden. We won't recommend this listing to you again.");
			else if (variables.type === "SAVE") toast.success("Listing saved to recommendations.");
			queryClient.invalidateQueries({ queryKey: ["matching-recommendations"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to submit feedback.");
		}
	});
	const handleAddLocation = () => {
		if (!countyInput) return;
		const newLoc = {
			county: countyInput,
			town: townInput || void 0,
			priority: "HIGH"
		};
		setPreferredLocations([...preferredLocations, newLoc]);
		setTownInput("");
	};
	const handleRemoveLocation = (index) => {
		setPreferredLocations(preferredLocations.filter((_, i) => i !== index));
	};
	const handleAddAmenity = () => {
		if (!amenityInput) return;
		const newAm = {
			amenity: amenityInput,
			priority: amenityPriority
		};
		setPreferredAmenities([...preferredAmenities, newAm]);
		setAmenityInput("");
	};
	const handleRemoveAmenity = (index) => {
		setPreferredAmenities(preferredAmenities.filter((_, i) => i !== index));
	};
	const handleSaveAll = () => {
		savePrefsMutation.mutate({
			preferredBudget: prefBudget || void 0,
			maxBudget: maxBudget || void 0,
			propertyTypes,
			bedrooms: bedrooms || void 0,
			bedroomsRule,
			bathrooms: bathrooms || void 0,
			bathroomsRule,
			preferredLocations,
			amenities: preferredAmenities,
			priorityWeights: {
				budget: budgetWeight,
				location: locationWeight,
				bedrooms: bedroomsWeight,
				bathrooms: bathroomsWeight,
				amenities: amenitiesWeight,
				propertyType: propertyTypeWeight
			},
			furnishingPreference: "ANY",
			useBehavioralPersonalization: true
		});
	};
	const handleResetPersonalization = () => {
		savePrefsMutation.mutate({
			preferredBudget: void 0,
			maxBudget: void 0,
			propertyTypes: [],
			bedrooms: void 0,
			bedroomsRule: "MIN",
			bathrooms: void 0,
			bathroomsRule: "MIN",
			preferredLocations: [],
			amenities: [],
			priorityWeights: {
				budget: "CRITICAL",
				location: "CRITICAL",
				bedrooms: "HIGH",
				bathrooms: "MEDIUM",
				amenities: "MEDIUM",
				propertyType: "HIGH"
			},
			furnishingPreference: "ANY",
			useBehavioralPersonalization: true
		});
		toast.success("Preferences and behavioral model reset to default.");
	};
	const handleTogglePropType = (type) => {
		if (propertyTypes.includes(type)) setPropertyTypes(propertyTypes.filter((t) => t !== type));
		else setPropertyTypes([...propertyTypes, type]);
	};
	if (isPrefsLoading || isRecsLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin mx-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground font-semibold",
				children: "Generating housing matches..."
			})]
		})
	}) });
	if (onboardingStep !== null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-xl mx-auto py-10 px-4 bg-card border rounded-3xl shadow-lg space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center pb-3 border-b",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display font-black text-primary text-sm flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-5 w-5" }), " HomeHunt Onboarding"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg",
					children: [
						"Step ",
						onboardingStep,
						" of 4"
					]
				})]
			}),
			onboardingStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-bold text-lg text-foreground",
						children: "Where do you want to live?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Select preferred county and town in Kenya:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold text-muted-foreground block mb-1",
							children: "County"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: countyInput,
							onChange: (e) => setCountyInput(e.target.value),
							className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Nairobi",
									children: "Nairobi"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Nyeri",
									children: "Nyeri"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Kiambu",
									children: "Kiambu"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Mombasa",
									children: "Mombasa"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Kisumu",
									children: "Kisumu"
								})
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold text-muted-foreground block mb-1",
							children: "Town (Optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "e.g. Kilimani, Nyeri Town",
							value: townInput,
							onChange: (e) => setTownInput(e.target.value),
							className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							handleAddLocation();
							setOnboardingStep(2);
						},
						className: "w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer mt-4",
						children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
					})
				]
			}),
			onboardingStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-bold text-lg text-foreground",
						children: "What is your monthly budget?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold text-muted-foreground block mb-1",
							children: "Target Budget (KES)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: prefBudget,
							onChange: (e) => setPrefBudget(Number(e.target.value)),
							className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold text-muted-foreground block mb-1",
							children: "Absolute Ceiling (KES)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: maxBudget,
							onChange: (e) => setMaxBudget(Number(e.target.value)),
							className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setOnboardingStep(3),
							className: "w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer",
							children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOnboardingStep(1),
							className: "px-4 py-2 border rounded-xl hover:bg-secondary text-xs font-semibold",
							children: "Back"
						})]
					})
				]
			}),
			onboardingStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-bold text-lg text-foreground",
						children: "Rooms & Property Type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold text-muted-foreground block mb-1",
							children: "Preferred Bedrooms"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: bedrooms,
							onChange: (e) => setBedrooms(Number(e.target.value)),
							className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold text-muted-foreground block mb-1",
							children: "Property Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1.5 flex-wrap",
							children: [
								"APARTMENT",
								"HOUSE",
								"STUDIO",
								"BEDSITTER"
							].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleTogglePropType(t),
								className: `px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${propertyTypes.includes(t) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/40 text-muted-foreground border-border"}`,
								children: t
							}, t))
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setOnboardingStep(4),
							className: "w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer",
							children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOnboardingStep(2),
							className: "px-4 py-2 border rounded-xl hover:bg-secondary text-xs font-semibold",
							children: "Back"
						})]
					})
				]
			}),
			onboardingStep === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-bold text-lg text-foreground",
						children: "Select priority preferences"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-muted-foreground",
								children: "Budget Priority"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: budgetWeight,
								onChange: (e) => setBudgetWeight(e.target.value),
								className: "px-2 py-1 bg-secondary border rounded cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "CRITICAL",
										children: "Critical"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "HIGH",
										children: "High"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "MEDIUM",
										children: "Medium"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "LOW",
										children: "Low"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-muted-foreground",
								children: "Location Priority"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: locationWeight,
								onChange: (e) => setLocationWeight(e.target.value),
								className: "px-2 py-1 bg-secondary border rounded cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "CRITICAL",
										children: "Critical"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "HIGH",
										children: "High"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "MEDIUM",
										children: "Medium"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "LOW",
										children: "Low"
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleSaveAll,
							className: "w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer",
							children: "Complete Onboarding"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOnboardingStep(3),
							className: "px-4 py-2 border rounded-xl hover:bg-secondary text-xs font-semibold",
							children: "Back"
						})]
					})
				]
			})
		]
	}) });
	const items = recommendations?.items || [];
	const bestMatches = items.filter((x) => x.category === "BEST_MATCH" || x.category === "STRONG_MATCH");
	const goodMatches = items.filter((x) => x.category === "GOOD_MATCH");
	const closeMatches = items.filter((x) => x.category === "CLOSE_MATCH");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Intelligent Matcher"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Housing options ranked and evaluated dynamically based on your preferences profile."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowEditor(!showEditor),
						className: "inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 shadow-md transition-all cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-4 w-4" }), " Customize Preferences"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleResetPersonalization,
						className: "inline-flex items-center gap-1 bg-secondary text-foreground text-xs font-semibold px-3 py-2.5 rounded-xl border hover:bg-secondary/80 cursor-pointer",
						children: "Reset personalization"
					})]
				})]
			}),
			showEditor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border rounded-2xl p-6 shadow-md space-y-6 animate-in slide-in-from-top-4 duration-200",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-bold text-lg text-foreground border-b pb-2 flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-5 w-5 text-primary" }), " Edit Housing Preference Profile"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[10px] font-bold text-muted-foreground uppercase block mb-1",
										children: "Preferred Rent (KES)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										value: prefBudget,
										onChange: (e) => setPrefBudget(Number(e.target.value)),
										className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[10px] font-bold text-muted-foreground uppercase block mb-1",
										children: "Maximum Rent (KES)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										value: maxBudget,
										onChange: (e) => setMaxBudget(Number(e.target.value)),
										className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[10px] font-bold text-muted-foreground uppercase block mb-1",
										children: "Bedrooms Required"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										value: bedrooms,
										onChange: (e) => setBedrooms(Number(e.target.value)),
										className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[10px] font-bold text-muted-foreground uppercase block mb-1",
										children: "Bedrooms Constraint"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: bedroomsRule,
										onChange: (e) => setBedroomsRule(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "MIN",
												children: "At Least (Min)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "EXACT",
												children: "Exactly"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "MAX",
												children: "At Most (Max)"
											})
										]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-[10px] font-bold text-muted-foreground uppercase block",
											children: "Preferred Locations"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: countyInput,
													onChange: (e) => setCountyInput(e.target.value),
													className: "px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Nairobi",
															children: "Nairobi"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Nyeri",
															children: "Nyeri"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Kiambu",
															children: "Kiambu"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Mombasa",
															children: "Mombasa"
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													placeholder: "Town name (optional)...",
													value: townInput,
													onChange: (e) => setTownInput(e.target.value),
													className: "flex-1 px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: handleAddLocation,
													className: "px-3 bg-secondary text-foreground hover:bg-secondary/80 border rounded-lg cursor-pointer",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-1.5",
											children: preferredLocations.map((loc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "bg-secondary px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted-foreground border border-border flex items-center gap-1",
												children: [
													loc.county,
													" ",
													loc.town ? `— ${loc.town}` : "",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => handleRemoveLocation(i),
														className: "text-destructive font-black text-xs px-1 hover:bg-destructive/10 rounded",
														children: "×"
													})
												]
											}, i))
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] font-bold text-muted-foreground uppercase block border-b pb-1",
									children: "Matching Priority Weight Configurations"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-muted-foreground",
												children: "Budget weight"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: budgetWeight,
												onChange: (e) => setBudgetWeight(e.target.value),
												className: "px-2 py-1.5 bg-secondary border rounded cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "CRITICAL",
														children: "Critical (40 pts)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "HIGH",
														children: "High (25 pts)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "MEDIUM",
														children: "Medium (15 pts)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "LOW",
														children: "Low (10 pts)"
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-muted-foreground",
												children: "Location weight"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: locationWeight,
												onChange: (e) => setLocationWeight(e.target.value),
												className: "px-2 py-1.5 bg-secondary border rounded cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "CRITICAL",
														children: "Critical (40 pts)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "HIGH",
														children: "High (25 pts)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "MEDIUM",
														children: "Medium (15 pts)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "LOW",
														children: "Low (10 pts)"
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-muted-foreground",
												children: "Bedrooms weight"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: bedroomsWeight,
												onChange: (e) => setBedroomsWeight(e.target.value),
												className: "px-2 py-1.5 bg-secondary border rounded cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "CRITICAL",
														children: "Critical"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "HIGH",
														children: "High"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "MEDIUM",
														children: "Medium"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "LOW",
														children: "Low"
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-muted-foreground",
												children: "Amenities weight"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: amenitiesWeight,
												onChange: (e) => setAmenitiesWeight(e.target.value),
												className: "px-2 py-1.5 bg-secondary border rounded cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "CRITICAL",
														children: "Critical"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "HIGH",
														children: "High"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "MEDIUM",
														children: "Medium"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "LOW",
														children: "Low"
													})
												]
											})]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[10px] font-bold text-muted-foreground uppercase block",
										children: "Target Amenities"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: amenityInput,
												onChange: (e) => setAmenityInput(e.target.value),
												className: "flex-1 px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "",
														children: "Select amenity..."
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "PARKING",
														children: "Parking space"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "SECURITY",
														children: "Security guard"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "WATER",
														children: "Reliable water"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "INTERNET",
														children: "Fiber internet"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "BALCONY",
														children: "Private balcony"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "BACKUP_WATER",
														children: "Backup water supply"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: amenityPriority,
												onChange: (e) => setAmenityPriority(e.target.value),
												className: "px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "MUST_HAVE",
														children: "MUST HAVE"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "PREFERRED",
														children: "PREFERRED"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "OPTIONAL",
														children: "OPTIONAL"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: handleAddAmenity,
												className: "px-3 bg-secondary text-foreground hover:bg-secondary/80 border rounded-lg cursor-pointer",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1.5",
										children: preferredAmenities.map((am, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${am.priority === "MUST_HAVE" ? "bg-destructive/5 text-destructive border-destructive/20" : "bg-secondary text-muted-foreground border-border"}`,
											children: [
												am.amenity,
												" (",
												am.priority,
												")",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleRemoveAmenity(i),
													className: "text-destructive font-black text-xs px-1 hover:bg-destructive/10 rounded",
													children: "×"
												})
											]
										}, i))
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 justify-end pt-4 border-t",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleSaveAll,
							disabled: savePrefsMutation.isPending,
							className: "px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50 flex items-center gap-1",
							children: [savePrefsMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), "Save Preference Profile"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowEditor(false),
							className: "px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer",
							children: "Cancel"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display font-bold text-lg text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-verified" }), " Best & Strong Matches"]
				}), bestMatches.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 md:grid-cols-3",
					children: bestMatches.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
						item,
						onInspect: () => setExplainedMatch(item),
						onSave: () => feedbackMutation.mutate({
							listingId: item.listing.id,
							type: "SAVE"
						}),
						onHide: () => feedbackMutation.mutate({
							listingId: item.listing.id,
							type: "HIDE"
						})
					}, item.listing.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 bg-secondary/15 border border-dashed rounded-2xl text-center text-muted-foreground/60 text-xs",
					children: "No strong housing matches found within your current constraints. Try adjusting your preferences."
				})]
			}),
			goodMatches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display font-bold text-lg text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-5 w-5 text-primary" }), " Good Matches"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 md:grid-cols-3",
					children: goodMatches.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
						item,
						onInspect: () => setExplainedMatch(item),
						onSave: () => feedbackMutation.mutate({
							listingId: item.listing.id,
							type: "SAVE"
						}),
						onHide: () => feedbackMutation.mutate({
							listingId: item.listing.id,
							type: "HIDE"
						})
					}, item.listing.id))
				})]
			}),
			closeMatches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 items-center text-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display font-bold text-lg text-foreground",
							children: "Close Matches"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground leading-relaxed -mt-3",
						children: "Listings that slightly exceed budget limits or lack non-critical parameters but are nearby:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-2 md:grid-cols-3",
						children: closeMatches.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
							item,
							onInspect: () => setExplainedMatch(item),
							onSave: () => feedbackMutation.mutate({
								listingId: item.listing.id,
								type: "SAVE"
							}),
							onHide: () => feedbackMutation.mutate({
								listingId: item.listing.id,
								type: "HIDE"
							})
						}, item.listing.id))
					})
				]
			}),
			items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-md mx-auto text-center py-10 space-y-4 bg-secondary/10 border border-dashed rounded-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-10 w-10 text-muted-foreground mx-auto" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-bold text-sm text-foreground",
						children: "No matches found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed",
						children: "We couldn't locate listings matching your filters. Try relaxing your budget limits, lowering room constraints, or selecting adjacent locations."
					})
				]
			})
		]
	}), explainedMatch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setExplainedMatch(null),
					className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-primary font-display font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-5 w-5" }), " Match Score Breakdown"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center bg-secondary/35 p-4 rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-2xl font-black text-primary",
						children: [explainedMatch.score, "%"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground font-semibold uppercase tracking-wider",
						children: explainedMatch.category.replace("_", " ")
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-right text-[10px] text-muted-foreground",
						children: "Compatibility Rating"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 max-h-[40vh] overflow-y-auto",
					children: explainedMatch.reasons?.map((reason, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 items-start text-xs leading-normal",
						children: [reason.isPositive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-verified shrink-0 mt-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-destructive shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: reason.message
						})]
					}, idx))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 bg-secondary/35 border rounded-xl text-[10px] text-muted-foreground leading-normal",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Matching Disclaimer:" }), " Scores are suggestions based on metadata. Renters should inspect properties and confirm caretaker status physically."]
				})
			]
		})
	})] });
}
function MatchCard({ item, onInspect, onSave, onHide }) {
	const listing = item.listing;
	const price = Number(listing.price);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card border rounded-2xl overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col group relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "aspect-[16/10] bg-secondary/30 relative overflow-hidden",
			children: [
				listing.primaryImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: listing.primaryImageUrl,
					alt: listing.title,
					className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full h-full flex items-center justify-center text-muted-foreground/35",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-10 w-10" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-3 left-3 flex gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: (e) => {
							e.stopPropagation();
							onInspect();
						},
						className: "text-[10px] font-black uppercase tracking-wider text-white bg-primary px-2.5 py-1 rounded-lg flex items-center gap-0.5 shadow cursor-pointer hover:bg-primary/95 transition-all",
						children: [item.score, "% Match"]
					}), item.trust?.propertyVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold uppercase bg-verified text-white px-2.5 py-1 rounded-lg shadow flex items-center gap-0.5",
						children: "✓ Verified"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-3 right-3 flex gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: (e) => {
							e.stopPropagation();
							onHide();
						},
						className: "p-1.5 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive rounded-lg shadow transition-colors cursor-pointer",
						title: "Hide this recommendation",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-3.5 w-3.5" })
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 flex-1 flex flex-col justify-between space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/homes/$id",
						params: { id: listing.id },
						className: "font-display font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block",
						children: listing.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] font-semibold text-muted-foreground flex items-center gap-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPinIcon, { className: "h-3.5 w-3.5" }),
							listing.town,
							", ",
							listing.county
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-end border-t border-border/60 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground font-semibold",
						children: [
							listing.bedrooms,
							" Beds • ",
							listing.bathrooms,
							" Baths"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display font-extrabold text-base text-primary",
							children: ["KES ", price.toLocaleString()]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[9px] text-muted-foreground uppercase font-bold tracking-wider -mt-0.5",
							children: ["/ ", listing.billingPeriod?.toLowerCase()]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1.5 mt-3 pt-3 border-t border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/homes/$id",
							params: { id: listing.id },
							search: { action: "contact" },
							className: "flex-1 text-center bg-primary hover:bg-primary/95 text-white text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-colors",
							children: "Contact"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/homes/$id",
							params: { id: listing.id },
							search: { action: "viewing" },
							className: "flex-1 text-center border border-border text-foreground hover:bg-secondary text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-colors",
							children: "Request Viewing"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: (e) => {
								e.stopPropagation();
								onSave();
							},
							className: "p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 rounded-lg cursor-pointer",
							title: "Save Recommendation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-3.5 w-3.5" })
						})
					]
				})
			]
		})]
	});
}
function MapPinIcon(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "24",
		height: "24",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "10",
			r: "3"
		})]
	});
}
//#endregion
export { RecommendationsPage as component };
