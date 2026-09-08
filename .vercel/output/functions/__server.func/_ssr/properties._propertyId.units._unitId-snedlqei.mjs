import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Save, I as LoaderCircle, Z as FileText, l as Trash2, wt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$1, t as RequireAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { a as archiveUnit, b as updateUnit, f as getProperty } from "./properties.functions-CKL-q0ta.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties._propertyId.units._unitId-snedlqei.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UnitDetailsComponent() {
	const { propertyId, unitId } = Route$1.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: details, isLoading } = useQuery({
		queryKey: ["property-detail", propertyId],
		queryFn: () => getProperty(propertyId)
	});
	const [unitNumber, setUnitNumber] = (0, import_react.useState)("");
	const [unitType, setUnitType] = (0, import_react.useState)("ONE_BEDROOM");
	const [floor, setFloor] = (0, import_react.useState)("");
	const [bedrooms, setBedrooms] = (0, import_react.useState)("1");
	const [bathrooms, setBathrooms] = (0, import_react.useState)("1");
	const [area, setArea] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("AVAILABLE");
	const [description, setDescription] = (0, import_react.useState)("");
	const [fieldsSynced, setFieldsSynced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (details) {
			const unit = details.units.find((u) => u.id === unitId);
			if (unit && !fieldsSynced) {
				setUnitNumber(unit.unit_number || "");
				setUnitType(unit.unit_type || "ONE_BEDROOM");
				setFloor(unit.floor?.toString() || "");
				setBedrooms(unit.bedrooms?.toString() || "1");
				setBathrooms(unit.bathrooms?.toString() || "1");
				setArea(unit.area?.toString() || "");
				setStatus(unit.status || "AVAILABLE");
				setDescription(unit.description || "");
				setFieldsSynced(true);
			}
		}
	}, [
		details,
		unitId,
		fieldsSynced
	]);
	const updateMutation = useMutation({
		mutationFn: () => updateUnit({
			id: unitId,
			unitNumber,
			unitType,
			floor: floor ? parseInt(floor) : void 0,
			bedrooms: parseInt(bedrooms),
			bathrooms: parseInt(bathrooms),
			area: area ? parseFloat(area) : void 0,
			status,
			description: description || void 0,
			amenities: []
		}),
		onSuccess: () => {
			toast.success("Unit updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
			navigate({ to: `/properties/${propertyId}` });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to update unit.");
		}
	});
	const archiveMutation = useMutation({
		mutationFn: () => archiveUnit(unitId),
		onSuccess: () => {
			toast.success("Unit archived.");
			queryClient.invalidateQueries({ queryKey: ["property-detail", propertyId] });
			navigate({ to: `/properties/${propertyId}` });
		}
	});
	const handleArchive = () => {
		if (confirm("Are you sure you want to delete/archive this unit?")) archiveMutation.mutate();
	};
	if (isLoading || !details) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
	}) });
	if (!details.units.find((u) => u.id === unitId)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-center p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-bold text-foreground",
				children: "Unit not found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-2",
				children: "The unit ID you are attempting to inspect does not exist on this property."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/properties/$id",
				params: { id: propertyId },
				className: "text-xs font-bold text-primary hover:underline mt-4 block",
				children: "Return to Property"
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-2xl font-bold text-foreground",
				children: ["Edit Unit ", unitNumber]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground mt-0.5",
				children: ["Parent Property: ", details.property.name]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/properties/$id",
				params: { id: propertyId },
				className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Property Details"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-6 shadow-sm space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "font-display font-semibold text-lg text-foreground flex items-center gap-1.5 border-b pb-3 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary" }), " Modify Subunit Layout"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					updateMutation.mutate();
				},
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "u-no",
						className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
						children: "Unit Number / Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "u-no",
						type: "text",
						required: true,
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
							htmlFor: "u-status",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Occupancy Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "u-status",
							value: status,
							onChange: (e) => setStatus(e.target.value),
							className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "AVAILABLE",
									children: "Available"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "RESERVED",
									children: "Reserved"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "OCCUPIED",
									children: "Occupied"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "MAINTENANCE",
									children: "Maintenance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "UNAVAILABLE",
									children: "Unavailable"
								})
							]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "u-floor",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Floor Level"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "u-floor",
								type: "number",
								value: floor,
								onChange: (e) => setFloor(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
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
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
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
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "u-area",
						className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
						children: "Unit Area (Sq Ft)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "u-area",
						type: "text",
						placeholder: "e.g. 750",
						value: area,
						onChange: (e) => setArea(e.target.value),
						className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "u-desc",
						className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
						children: "Unit Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "u-desc",
						rows: 3,
						value: description,
						onChange: (e) => setDescription(e.target.value),
						className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center pt-6 border-t border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleArchive,
							className: "inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer",
							disabled: archiveMutation.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Delete Unit"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: updateMutation.isPending,
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
							children: [updateMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), "Save Layout"]
						})]
					})
				]
			})]
		})]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitDetailsComponent, {}) });
//#endregion
export { SplitComponent as component };
