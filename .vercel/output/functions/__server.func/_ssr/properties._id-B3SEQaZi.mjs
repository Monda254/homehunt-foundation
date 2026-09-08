import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Save, E as Plus, G as Globe, I as LoaderCircle, Z as FileText, d as ToggleLeft, p as SquareCheckBig, wt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$11, t as RequireAuth, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { _ as removePropertyParty, c as createUnit, f as getProperty, g as removePropertyMedia, h as publishListing, m as pauseListing, n as addPropertyParty, o as createListing, r as archiveListing, t as addPropertyMedia, y as updateProperty } from "./properties.functions-CKL-q0ta.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties._id-B3SEQaZi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PropertyDetailsComponent() {
	const { id: propertyId } = Route$11.useParams();
	const queryClient = useQueryClient();
	const { user: authUser } = useAuth();
	const [activeTab, setActiveTab] = (0, import_react.useState)("overview");
	const { data: details, isLoading } = useQuery({
		queryKey: ["property-detail", propertyId],
		queryFn: () => getProperty(propertyId)
	});
	const [isAddingUnit, setIsAddingUnit] = (0, import_react.useState)(false);
	const [isAddingListing, setIsAddingListing] = (0, import_react.useState)(false);
	const [isAddingMedia, setIsAddingMedia] = (0, import_react.useState)(false);
	const [isAddingParty, setIsAddingParty] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("DRAFT");
	const [description, setDescription] = (0, import_react.useState)("");
	const [county, setCounty] = (0, import_react.useState)("");
	const [town, setTown] = (0, import_react.useState)("");
	const [neighborhood, setNeighborhood] = (0, import_react.useState)("");
	const [estate, setEstate] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [latitude, setLatitude] = (0, import_react.useState)("");
	const [longitude, setLongitude] = (0, import_react.useState)("");
	const [landmarkDescription, setLandmarkDescription] = (0, import_react.useState)("");
	const [selectedAmenities, setSelectedAmenities] = (0, import_react.useState)([]);
	const [fieldsSynced, setFieldsSynced] = (0, import_react.useState)(false);
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
		mutationFn: () => updateProperty({
			id: propertyId,
			name,
			propertyType: details?.property.property_type,
			description,
			status,
			county,
			town,
			neighborhood: neighborhood || void 0,
			estate: estate || void 0,
			address: address || void 0,
			latitude: latitude ? parseFloat(latitude) : void 0,
			longitude: longitude ? parseFloat(longitude) : void 0,
			landmarkDescription: landmarkDescription || void 0,
			amenities: selectedAmenities
		}),
		onSuccess: () => {
			toast.success("Property details updated!");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to update property.");
		}
	});
	const [unitNumber, setUnitNumber] = (0, import_react.useState)("");
	const [unitType, setUnitType] = (0, import_react.useState)("ONE_BEDROOM");
	const [floor, setFloor] = (0, import_react.useState)("");
	const [bedrooms, setBedrooms] = (0, import_react.useState)("1");
	const [bathrooms, setBathrooms] = (0, import_react.useState)("1");
	const [area, setArea] = (0, import_react.useState)("");
	const [unitDescription, setUnitDescription] = (0, import_react.useState)("");
	const unitMutation = useMutation({
		mutationFn: () => createUnit({
			propertyId,
			unitNumber,
			unitType,
			floor: floor ? parseInt(floor) : void 0,
			bedrooms: parseInt(bedrooms),
			bathrooms: parseInt(bathrooms),
			area: area ? parseFloat(area) : void 0,
			status: "AVAILABLE",
			description: unitDescription || void 0,
			amenities: []
		}),
		onSuccess: () => {
			toast.success("Unit created successfully!");
			setIsAddingUnit(false);
			setUnitNumber("");
			setUnitDescription("");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to create unit.");
		}
	});
	const [listingTitle, setListingTitle] = (0, import_react.useState)("");
	const [listingDescription, setListingDescription] = (0, import_react.useState)("");
	const [listingUnitId, setListingUnitId] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("");
	const [billingPeriod, setBillingPeriod] = (0, import_react.useState)("MONTHLY");
	const [depositAmount, setDepositAmount] = (0, import_react.useState)("");
	const [availabilityDate, setAvailabilityDate] = (0, import_react.useState)("");
	const listingMutation = useMutation({
		mutationFn: () => createListing({
			propertyId,
			unitId: listingUnitId || void 0,
			title: listingTitle,
			description: listingDescription || void 0,
			price: parseFloat(price),
			billingPeriod,
			depositAmount: depositAmount ? parseFloat(depositAmount) : void 0,
			availabilityDate,
			currency: "KES",
			listingType: "FOR_RENT"
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
		onError: (err) => {
			toast.error(err?.message || "Failed to create listing.");
		}
	});
	const [mediaUrl, setMediaUrl] = (0, import_react.useState)("");
	const [mediaCaption, setMediaCaption] = (0, import_react.useState)("");
	const [isPrimaryMedia, setIsPrimaryMedia] = (0, import_react.useState)(false);
	const [mediaListingId, setMediaListingId] = (0, import_react.useState)("");
	const mediaMutation = useMutation({
		mutationFn: () => addPropertyMedia({
			propertyId,
			listingId: mediaListingId || void 0,
			url: mediaUrl,
			caption: mediaCaption || void 0,
			isPrimary: isPrimaryMedia,
			mediaType: "IMAGE",
			sortOrder: 0
		}),
		onSuccess: () => {
			toast.success("Image attached successfully!");
			setIsAddingMedia(false);
			setMediaUrl("");
			setMediaCaption("");
			setIsPrimaryMedia(false);
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to attach image.");
		}
	});
	const removeMediaMutation = useMutation({
		mutationFn: (mediaId) => removePropertyMedia(mediaId),
		onSuccess: () => {
			toast.success("Media deleted.");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		}
	});
	const [partyUserId, setPartyUserId] = (0, import_react.useState)("");
	const [partyType, setPartyType] = (0, import_react.useState)("AGENT");
	const partyMutation = useMutation({
		mutationFn: () => addPropertyParty({
			propertyId,
			userId: partyUserId,
			relationshipType: partyType,
			status: "ACTIVE"
		}),
		onSuccess: () => {
			toast.success("Property relationship added!");
			setIsAddingParty(false);
			setPartyUserId("");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to add user relationship.");
		}
	});
	const removePartyMutation = useMutation({
		mutationFn: (partyId) => removePropertyParty(partyId),
		onSuccess: () => {
			toast.success("User relationship revoked.");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		}
	});
	const publishMutation = useMutation({
		mutationFn: (id) => publishListing(id),
		onSuccess: () => {
			toast.success("Listing published to marketplace!");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		},
		onError: (err) => {
			toast.error(err?.message || "Publish check failed.");
		}
	});
	const pauseMutation = useMutation({
		mutationFn: (id) => pauseListing(id),
		onSuccess: () => {
			toast.success("Listing paused.");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		}
	});
	const archiveListingMutation = useMutation({
		mutationFn: (id) => archiveListing(id),
		onSuccess: () => {
			toast.success("Listing archived.");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
		}
	});
	if (isLoading || !details) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
	}) });
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
		"DSQ"
	];
	const handleAmenityToggle = (val) => {
		setSelectedAmenities((prev) => prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-bold uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded border border-primary/20",
							children: details.property.property_type.replace("_", " ")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2.5 py-0.5 rounded text-xs font-bold border ${details.property.status === "ACTIVE" ? "bg-verified/10 text-verified border-verified/20" : "bg-secondary text-muted-foreground border-border"}`,
							children: details.property.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-bold text-foreground mt-2",
						children: details.property.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mt-0.5",
						children: [
							details.property.town,
							", ",
							details.property.county
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/properties",
						className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Dashboard"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex border-b border-border overflow-x-auto whitespace-nowrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("overview"),
						className: `px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: "Overview & Location"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("units"),
						className: `px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "units" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Units (",
							details.units.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("listings"),
						className: `px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "listings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Listings (",
							details.listings.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("media"),
						className: `px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "media" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Media & Photos (",
							details.media.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("parties"),
						className: `px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "parties" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Owner/Parties (",
							details.parties.length,
							")"
						]
					})
				]
			}),
			activeTab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-6 lg:col-span-2 shadow-sm space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-semibold text-lg text-foreground flex items-center gap-1.5 border-b pb-3 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary" }), " Modify Property Profile"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							updateMutation.mutate();
						},
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-name",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Property Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "p-name",
									type: "text",
									required: true,
									value: name,
									onChange: (e) => setName(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-status",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Lifecycle Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									id: "p-status",
									value: status,
									onChange: (e) => setStatus(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "DRAFT",
											children: "Draft"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "ACTIVE",
											children: "Active (Marketable)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "INACTIVE",
											children: "Inactive (Off Market)"
										})
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "p-desc",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Property Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "p-desc",
								rows: 4,
								value: description,
								onChange: (e) => setDescription(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-xs font-bold uppercase tracking-widest text-muted-foreground border-t pt-4",
								children: "Location Settings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-county",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "County"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "p-county",
									type: "text",
									value: county,
									onChange: (e) => setCounty(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-town",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Town"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "p-town",
									type: "text",
									value: town,
									onChange: (e) => setTown(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-hood",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Neighborhood"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "p-hood",
									type: "text",
									value: neighborhood,
									onChange: (e) => setNeighborhood(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-estate",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Estate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "p-estate",
									type: "text",
									value: estate,
									onChange: (e) => setEstate(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2 border-t border-border/40 pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-lat",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Latitude"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "p-lat",
									type: "text",
									value: latitude,
									onChange: (e) => setLatitude(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "p-long",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Longitude"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "p-long",
									type: "text",
									value: longitude,
									onChange: (e) => setLongitude(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "p-landmark",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Landmarks"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "p-landmark",
								type: "text",
								value: landmarkDescription,
								onChange: (e) => setLandmarkDescription(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end pt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: updateMutation.isPending,
									className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
									children: [updateMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), "Save Profile changes"]
								})
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-6 shadow-sm max-h-fit",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-semibold text-lg text-foreground flex items-center gap-1.5 border-b pb-3 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "h-5 w-5 text-primary" }), " Edit Amenities"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: AMENITIES.map((amenity) => {
							const active = selectedAmenities.includes(amenity);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									handleAmenityToggle(amenity);
									updateMutation.mutate();
								},
								className: `w-full flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${active ? "border-primary/30 bg-primary/5 text-primary" : "border-border hover:border-primary/20 text-muted-foreground hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									children: amenity.replace("_", " ")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-4 w-4 rounded border flex items-center justify-center ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`,
									children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "h-2.5 w-2.5",
										fill: "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "3",
											d: "M5 13l4 4L19 7"
										})
									})
								})]
							}, amenity);
						})
					})]
				})]
			}),
			activeTab === "units" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Registered Subunits"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "List of rentable units within this property asset."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setIsAddingUnit(true),
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Unit"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4 pl-6",
										children: "Unit ID / Number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Structural Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Layout (Beds/Baths)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4 pr-6 text-right",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/60 text-sm",
								children: details.units.length > 0 ? details.units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-secondary/10 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-4 pl-6 font-semibold text-foreground",
											children: [unit.unit_number, unit.floor !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] text-muted-foreground font-normal ml-2",
												children: [
													"(Floor ",
													unit.floor,
													")"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-4 text-xs font-medium text-muted-foreground",
											children: unit.unit_type.replace("_", " ")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-4 text-xs text-foreground font-semibold",
											children: [
												unit.bedrooms,
												" Bedroom(s) / ",
												unit.bathrooms,
												" Bath(s)"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${unit.status === "AVAILABLE" ? "bg-verified/10 text-verified border-verified/20" : "bg-secondary text-muted-foreground border-border"}`,
												children: unit.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-4 pr-6 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/properties/$propertyId/units/$unitId",
												params: {
													propertyId,
													unitId: unit.id
												},
												className: "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground",
												children: "Edit"
											})
										})
									]
								}, unit.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									className: "text-center p-8 text-muted-foreground",
									children: "No subunits registered. Create a unit to start advertising individual vacancies."
								}) })
							})]
						})
					}),
					isAddingUnit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center pb-3 border-b border-border mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-bold text-lg text-foreground",
									children: "Add Subunit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setIsAddingUnit(false),
									className: "text-muted-foreground hover:text-foreground cursor-pointer",
									children: "×"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									unitMutation.mutate();
								},
								className: "space-y-4 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "u-number",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: ["Unit Number / Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "u-number",
										type: "text",
										required: true,
										placeholder: "e.g. Apartment A101",
										value: unitNumber,
										onChange: (e) => setUnitNumber(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "u-type",
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
											children: "Unit Type"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											id: "u-type",
											value: unitType,
											onChange: (e) => setUnitType(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "ONE_BEDROOM",
													children: "1 Bedroom"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "TWO_BEDROOM",
													children: "2 Bedroom"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "THREE_BEDROOM",
													children: "3 Bedroom"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "FOUR_PLUS_BEDROOM",
													children: "4+ Bedroom"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "BEDSITTER",
													children: "Bedsitter"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "STUDIO",
													children: "Studio"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "ROOM",
													children: "Single Room"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "SHARED",
													children: "Shared Room"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "HOUSE",
													children: "House"
												})
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "u-floor",
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
											children: "Floor Level"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "u-floor",
											type: "number",
											placeholder: "e.g. 1",
											value: floor,
											onChange: (e) => setFloor(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "u-beds",
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
											children: "Bedrooms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "u-beds",
											type: "number",
											required: true,
											value: bedrooms,
											onChange: (e) => setBedrooms(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "u-baths",
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
											children: "Bathrooms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "u-baths",
											type: "number",
											required: true,
											value: bathrooms,
											onChange: (e) => setBathrooms(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "u-desc",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: "Unit Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "u-desc",
										rows: 3,
										placeholder: "Description of this specific unit layout or view...",
										value: unitDescription,
										onChange: (e) => setUnitDescription(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2 pt-4 border-t",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setIsAddingUnit(false),
											className: "rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer",
											children: "Cancel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: unitMutation.isPending,
											className: "rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5",
											children: [unitMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), "Add Unit"]
										})]
									})
								]
							})]
						})
					})
				]
			}),
			activeTab === "listings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Marketplace Advertisements"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Listings created to publish this property (or sub-units) online."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setIsAddingListing(true),
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create Listing"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4",
						children: details.listings.length > 0 ? details.listings.map((list) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-5 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-sm text-foreground",
										children: list.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `px-2 py-0.5 rounded-full text-[9px] font-bold border ${list.status === "PUBLISHED" ? "bg-verified/10 text-verified border-verified/20" : list.status === "DRAFT" ? "bg-secondary text-muted-foreground border-border" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
										children: list.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs font-bold text-primary mt-1",
									children: [
										list.currency,
										" ",
										Number(list.price).toLocaleString(),
										" /",
										" ",
										list.billing_period.toLowerCase()
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-muted-foreground mt-2",
									children: ["Availability: ", new Date(list.availability_date).toLocaleDateString()]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 flex-wrap self-end md:self-auto",
								children: [list.status === "DRAFT" || list.status === "PAUSED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => publishMutation.mutate(list.id),
									disabled: publishMutation.isPending,
									className: "inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 px-3 py-1.5 text-xs font-semibold cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3.5 w-3.5" }), " Publish"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => pauseMutation.mutate(list.id),
									disabled: pauseMutation.isPending,
									className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "h-3.5 w-3.5 text-muted-foreground" }), " Pause"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => archiveListingMutation.mutate(list.id),
									disabled: archiveListingMutation.isPending,
									className: "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 cursor-pointer",
									children: "Archive"
								})]
							})]
						}, list.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center p-8 border border-dashed rounded-xl bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No listings created. Add a listing to advertise vacancies to the public."
							})
						})
					}),
					isAddingListing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center pb-3 border-b border-border mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-bold text-lg text-foreground",
									children: "Create Listing Draft"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setIsAddingListing(false),
									className: "text-muted-foreground hover:text-foreground cursor-pointer",
									children: "×"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									listingMutation.mutate();
								},
								className: "space-y-4 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "l-title",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: ["Listing Title ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "l-title",
										type: "text",
										required: true,
										placeholder: "e.g. Premium 2-Bedroom in Kilimani with Balcony",
										value: listingTitle,
										onChange: (e) => setListingTitle(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "l-unit",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: [
											"Associate Subunit",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground/60",
												children: "(Optional)"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										id: "l-unit",
										value: listingUnitId,
										onChange: (e) => setListingUnitId(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Whole Property (Structural unit not specified)"
										}), details.units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: unit.id,
											children: [
												unit.unit_number,
												" (",
												unit.unit_type,
												")"
											]
										}, unit.id))]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											htmlFor: "l-price",
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
											children: ["Monthly Rent (KES) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-destructive",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "l-price",
											type: "number",
											required: true,
											placeholder: "e.g. 45000",
											value: price,
											onChange: (e) => setPrice(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "l-deposit",
											className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
											children: "Security Deposit (KES)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "l-deposit",
											type: "number",
											placeholder: "e.g. 45000",
											value: depositAmount,
											onChange: (e) => setDepositAmount(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "l-avail",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: ["Availability Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "l-avail",
										type: "date",
										required: true,
										value: availabilityDate,
										onChange: (e) => setAvailabilityDate(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "l-desc",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: "Listing Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "l-desc",
										rows: 3,
										placeholder: "Detail payment conditions, utilities billing, roommate status...",
										value: listingDescription,
										onChange: (e) => setListingDescription(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2 pt-4 border-t",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setIsAddingListing(false),
											className: "rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer",
											children: "Cancel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: listingMutation.isPending,
											className: "rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5",
											children: [listingMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), "Create Draft"]
										})]
									})
								]
							})]
						})
					})
				]
			}),
			activeTab === "media" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Property Galleries"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Attach images to listings or units."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setIsAddingMedia(true),
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Image"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: details.media.length > 0 ? details.media.map((media) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative bg-card border border-border rounded-xl overflow-hidden group shadow-sm flex flex-col justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "aspect-video bg-secondary/30 overflow-hidden relative shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: media.url,
									alt: media.caption || "",
									className: "w-full h-full object-cover"
								}), media.is_primary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded",
									children: "Primary"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 flex justify-between items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground truncate",
									children: media.caption || "No Caption"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => removeMediaMutation.mutate(media.id),
									disabled: removeMediaMutation.isPending,
									className: "text-destructive hover:bg-destructive/10 p-1.5 rounded cursor-pointer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2$1, { className: "h-3.5 w-3.5" })
								})]
							})]
						}, media.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-3 text-center p-8 border border-dashed rounded-xl bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No media attachments found. Upload photos before publishing listings."
							})
						})
					}),
					isAddingMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center pb-3 border-b border-border mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-bold text-lg text-foreground",
									children: "Attach Image Link"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setIsAddingMedia(false),
									className: "text-muted-foreground hover:text-foreground cursor-pointer",
									children: "×"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									mediaMutation.mutate();
								},
								className: "space-y-4 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "m-url",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: ["Image URL ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "m-url",
										type: "url",
										required: true,
										placeholder: "https://images.unsplash.com/photo-...",
										value: mediaUrl,
										onChange: (e) => setMediaUrl(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "m-list",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: [
											"Associate to Listing",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground/60",
												children: "(Required for listings display)"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										id: "m-list",
										value: mediaListingId,
										onChange: (e) => setMediaListingId(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "General Property Image"
										}), details.listings.map((list) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: list.id,
											children: list.title
										}, list.id))]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "m-cap",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: "Caption"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "m-cap",
										type: "text",
										placeholder: "e.g. Master Bedroom",
										value: mediaCaption,
										onChange: (e) => setMediaCaption(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "m-primary",
											type: "checkbox",
											checked: isPrimaryMedia,
											onChange: (e) => setIsPrimaryMedia(e.target.checked),
											className: "rounded border-border text-primary focus:ring-primary/20 h-4.5 w-4.5"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "m-primary",
											className: "text-xs font-semibold text-foreground",
											children: "Set as Primary/Thumbnail Image"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2 pt-4 border-t",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setIsAddingMedia(false),
											className: "rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer",
											children: "Cancel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: mediaMutation.isPending,
											className: "rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5",
											children: [mediaMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), "Attach Image"]
										})]
									})
								]
							})]
						})
					})
				]
			}),
			activeTab === "parties" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Authorized Management relationships"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "List of users who can inspect or update details for this specific property."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setIsAddingParty(true),
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Manager / Agent"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4 pl-6",
										children: "Associated User ID"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Assigned Relationship"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4 pr-6 text-right",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/60 text-sm",
								children: details.parties.map((party) => {
									const prof = party.profiles;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-secondary/10 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-4 pl-6",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground",
													children: prof?.full_name || "Platform User"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground font-mono mt-0.5",
													children: party.user_id
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4 font-semibold text-xs text-primary",
												children: party.relationship_type
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${party.status === "ACTIVE" ? "bg-verified/10 text-verified border-verified/20" : "bg-destructive/10 text-destructive border-destructive/20"}`,
													children: party.status
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4 pr-6 text-right",
												children: party.user_id !== details.property.owner_user_id && party.status === "ACTIVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => removePartyMutation.mutate(party.id),
													className: "text-xs font-semibold text-destructive hover:underline cursor-pointer",
													children: "Revoke Relationship"
												})
											})
										]
									}, party.id);
								})
							})]
						})
					}),
					isAddingParty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center pb-3 border-b border-border mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-bold text-lg text-foreground",
									children: "Add Property relationship"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setIsAddingParty(false),
									className: "text-muted-foreground hover:text-foreground cursor-pointer",
									children: "×"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									partyMutation.mutate();
								},
								className: "space-y-4 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "p-userid",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: ["Target User UUID ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "p-userid",
										type: "text",
										required: true,
										placeholder: "e.g. 550e8400-e29b-41d4-a716-446655440000",
										value: partyUserId,
										onChange: (e) => setPartyUserId(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "p-reltype",
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
										children: "Relationship Designation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										id: "p-reltype",
										value: partyType,
										onChange: (e) => setPartyType(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "AGENT",
											children: "Marketing Agent"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "PROPERTY_MANAGER",
											children: "Property Manager"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2 pt-4 border-t",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setIsAddingParty(false),
											className: "rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer",
											children: "Cancel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: partyMutation.isPending,
											className: "rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer flex items-center gap-1.5",
											children: [partyMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), "Add relationship"]
										})]
									})
								]
							})]
						})
					})
				]
			})
		]
	}) });
}
function Trash2$1(props) {
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
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 6h18" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropertyDetailsComponent, {}) });
//#endregion
export { SplitComponent as component };
