import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Save, Ct as ArrowRight, I as LoaderCircle, M as MapPin, gt as Building, p as SquareCheckBig, wt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as RequireAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { s as createProperty } from "./properties.functions-CKL-q0ta.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties.new-BbwGxqoA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AMENITY_OPTIONS = [
	{
		value: "PARKING",
		label: "Parking Space"
	},
	{
		value: "WATER",
		label: "Reliable Water"
	},
	{
		value: "ELECTRICITY",
		label: "Electricity connection"
	},
	{
		value: "SECURITY",
		label: "Physical Guard Security"
	},
	{
		value: "BOREHOLE",
		label: "Borehole system"
	},
	{
		value: "ELEVATOR",
		label: "Elevator access"
	},
	{
		value: "BALCONY",
		label: "Balcony"
	},
	{
		value: "GARDEN",
		label: "Garden / Yard"
	},
	{
		value: "GYM",
		label: "Fitness Center"
	},
	{
		value: "POOL",
		label: "Swimming Pool"
	},
	{
		value: "INTERNET",
		label: "Fibre Internet"
	},
	{
		value: "CCTV",
		label: "CCTV surveillance"
	},
	{
		value: "BACKUP_POWER",
		label: "Generator backup"
	},
	{
		value: "PET_FRIENDLY",
		label: "Pet friendly"
	},
	{
		value: "FURNISHED",
		label: "Furnished"
	},
	{
		value: "DSQ",
		label: "Domestic Staff Quarter"
	}
];
function NewPropertyComponent() {
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)(1);
	const [name, setName] = (0, import_react.useState)("");
	const [propertyType, setPropertyType] = (0, import_react.useState)("APARTMENT");
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
	const createMutation = useMutation({
		mutationFn: () => createProperty({
			propertyType,
			name,
			description: description || void 0,
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
		onSuccess: (res) => {
			toast.success("Property created successfully!");
			navigate({ to: `/properties/${res.propertyId}` });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to create property.");
		}
	});
	const toggleAmenity = (val) => {
		setSelectedAmenities((prev) => prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]);
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
	const handleSubmit = (e) => {
		e.preventDefault();
		createMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold text-foreground",
				children: "Add New Property"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Onboard a physical property. You can link buildings, units, and listings once created."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border border-border p-4 rounded-xl bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`,
							children: "1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-foreground",
							children: "Basics"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border flex-1 mx-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`,
							children: "2"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-foreground",
							children: "Location"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border flex-1 mx-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`,
							children: "3"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-foreground",
							children: "Amenities"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-6 shadow-sm",
				children: [
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-display font-semibold text-lg text-foreground flex items-center gap-1.5 mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-5 w-5 text-primary" }), " Basic Details"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "prop-name",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: ["Property Name / Title ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "prop-name",
								type: "text",
								required: true,
								placeholder: "e.g. Oakwood Heights Apartments",
								value: name,
								onChange: (e) => setName(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "prop-type",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: ["Property Type ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "prop-type",
								value: propertyType,
								onChange: (e) => setPropertyType(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "APARTMENT",
										children: "Apartment Building"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "HOUSE",
										children: "Standalone House / Villa"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "BEDSITTER",
										children: "Bedsitter"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "STUDIO",
										children: "Studio Apartment"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "MAISONETTE",
										children: "Maisonette"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "TOWNHOUSE",
										children: "Townhouse"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "VILLA",
										children: "Villa"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "BUNGALOW",
										children: "Bungalow"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "ROOM",
										children: "Single Room"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "SHARED_ACCOMMODATION",
										children: "Shared Accommodation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "OTHER",
										children: "Other Structural Type"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "prop-desc",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Property Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "prop-desc",
								rows: 4,
								placeholder: "Detail the property layout, accessibility, neighborhood highlights...",
								value: description,
								onChange: (e) => setDescription(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none",
								maxLength: 1e3
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-4 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleNext,
									className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
									children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							})
						]
					}),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-display font-semibold text-lg text-foreground flex items-center gap-1.5 mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5 text-primary" }), " Location parameters"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "prop-county",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: ["County ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-destructive",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "prop-county",
									type: "text",
									required: true,
									placeholder: "e.g. Nairobi",
									value: county,
									onChange: (e) => setCounty(e.target.value),
									className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "prop-town",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: ["Town / City ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-destructive",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "prop-town",
									type: "text",
									required: true,
									placeholder: "e.g. Kilimani",
									value: town,
									onChange: (e) => setTown(e.target.value),
									className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "prop-neighborhood",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Neighborhood / Area"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "prop-neighborhood",
									type: "text",
									placeholder: "e.g. Yaya Centre area",
									value: neighborhood,
									onChange: (e) => setNeighborhood(e.target.value),
									className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "prop-estate",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Estate / Phase"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "prop-estate",
									type: "text",
									placeholder: "e.g. Rosewood Estate",
									value: estate,
									onChange: (e) => setEstate(e.target.value),
									className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "prop-address",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Physical Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "prop-address",
								type: "text",
								placeholder: "e.g. Plot 42, Argwings Kodhek Rd",
								value: address,
								onChange: (e) => setAddress(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2 border-t border-border/40 pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "prop-lat",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: [
										"Latitude",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground/60",
											children: "(Optional Decimal)"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "prop-lat",
									type: "text",
									placeholder: "e.g. -1.2921",
									value: latitude,
									onChange: (e) => setLatitude(e.target.value),
									className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "prop-long",
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: [
										"Longitude",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground/60",
											children: "(Optional Decimal)"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "prop-long",
									type: "text",
									placeholder: "e.g. 36.8219",
									value: longitude,
									onChange: (e) => setLongitude(e.target.value),
									className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "prop-landmark",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Landmarks / Discovery instructions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "prop-landmark",
								type: "text",
								placeholder: "e.g. 100 meters behind Quickmart Kilimani, near the stage",
								value: landmarkDescription,
								onChange: (e) => setLandmarkDescription(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-4 flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setStep(1),
									className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleNext,
									className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
									children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})]
							})
						]
					}),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-display font-semibold text-lg text-foreground flex items-center gap-1.5 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "h-5 w-5 text-primary" }), " Property Amenities"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mb-6",
								children: "Select all amenities available at this property layout. These are shared features."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: AMENITY_OPTIONS.map((item) => {
									const active = selectedAmenities.includes(item.value);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => toggleAmenity(item.value),
										className: `flex items-center gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all ${active ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/25" : "border-border bg-transparent hover:border-primary/30 text-muted-foreground hover:text-foreground"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60"}`,
											children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
												className: "h-3 w-3",
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
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold text-foreground",
											children: item.label
										})]
									}, item.value);
								})
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-6 border-t border-border flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setStep(2),
								className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all cursor-pointer",
								disabled: createMutation.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: createMutation.isPending,
								className: "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer",
								children: createMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Saving..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Save Property"] })
							})]
						})]
					})
				]
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewPropertyComponent, {}) });
//#endregion
export { SplitComponent as component };
