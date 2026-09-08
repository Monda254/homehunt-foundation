import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Save, G as Globe, I as LoaderCircle, Q as Eye, Z as FileText, d as ToggleLeft, wt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Route$13, t as RequireAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { h as publishListing, l as getListing, m as pauseListing, v as updateListing } from "./properties.functions-DDrKs7rG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listings._id-DGan6eTa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ListingDetailsComponent() {
	const { id: listingId } = Route$13.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: details, isLoading } = useQuery({
		queryKey: ["listing-detail", listingId],
		queryFn: () => getListing(listingId)
	});
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("");
	const [billingPeriod, setBillingPeriod] = (0, import_react.useState)("MONTHLY");
	const [depositAmount, setDepositAmount] = (0, import_react.useState)("");
	const [availabilityDate, setAvailabilityDate] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("DRAFT");
	const [fieldsSynced, setFieldsSynced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (details && !fieldsSynced) {
			setTitle(details.listing.title || "");
			setDescription(details.listing.description || "");
			setPrice(details.listing.price?.toString() || "");
			setBillingPeriod(details.listing.billing_period || "MONTHLY");
			setDepositAmount(details.listing.deposit_amount?.toString() || "");
			setAvailabilityDate(details.listing.availability_date || "");
			setStatus(details.listing.status || "DRAFT");
			setFieldsSynced(true);
		}
	}, [details, fieldsSynced]);
	const updateMutation = useMutation({
		mutationFn: () => updateListing({
			id: listingId,
			title,
			description: description || void 0,
			price: parseFloat(price),
			billingPeriod,
			depositAmount: depositAmount ? parseFloat(depositAmount) : void 0,
			availabilityDate,
			status
		}),
		onSuccess: () => {
			toast.success("Listing details updated!");
			queryClient.invalidateQueries({ queryKey: ["listing-detail", listingId] });
			navigate({ to: "/listings" });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to update listing.");
		}
	});
	const publishMutation = useMutation({
		mutationFn: () => publishListing(listingId),
		onSuccess: () => {
			toast.success("Listing published successfully!");
			queryClient.invalidateQueries({ queryKey: ["listing-detail", listingId] });
		},
		onError: (err) => {
			toast.error(err?.message || "Publish validation failed. Make sure a primary image is attached and fields are complete.");
		}
	});
	const pauseMutation = useMutation({
		mutationFn: () => pauseListing(listingId),
		onSuccess: () => {
			toast.success("Listing paused.");
			queryClient.invalidateQueries({ queryKey: ["listing-detail", listingId] });
		}
	});
	if (isLoading || !details) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `px-2.5 py-0.5 rounded text-xs font-bold border ${details.listing.status === "PUBLISHED" ? "bg-verified/10 text-verified border-verified/20" : "bg-secondary text-muted-foreground border-border"}`,
						children: details.listing.status
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground mt-2",
					children: details.listing.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: ["Ref Property: ", details.listing.properties?.name || "Physical Property Reference"]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/listings",
					className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Listings"]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-6 shadow-sm space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center border-b pb-3 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-display font-semibold text-lg text-foreground flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary" }), " Listing Settings"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: details.listing.status === "PUBLISHED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/homes/$id",
						params: { id: listingId },
						className: "inline-flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-bold text-foreground border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View Public"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => pauseMutation.mutate(),
						disabled: pauseMutation.isPending,
						className: "inline-flex items-center gap-1 rounded border border-border bg-transparent px-2.5 py-1 text-xs font-bold text-foreground hover:bg-secondary cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "h-3 w-3" }), " Pause"]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => publishMutation.mutate(),
						disabled: publishMutation.isPending,
						className: "inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3.5 w-3.5" }), " Publish"]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					updateMutation.mutate();
				},
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "l-title",
						className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
						children: "Listing Title"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "l-title",
						type: "text",
						required: true,
						value: title,
						onChange: (e) => setTitle(e.target.value),
						className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "l-price",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Rental Price (KES)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "l-price",
							type: "number",
							required: true,
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
							value: depositAmount,
							onChange: (e) => setDepositAmount(e.target.value),
							className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "l-period",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Billing Period"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "l-period",
							value: billingPeriod,
							onChange: (e) => setBillingPeriod(e.target.value),
							className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "MONTHLY",
									children: "Monthly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "WEEKLY",
									children: "Weekly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "DAILY",
									children: "Daily"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "YEARLY",
									children: "Yearly"
								})
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "l-avail",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Availability Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "l-avail",
							type: "date",
							required: true,
							value: availabilityDate,
							onChange: (e) => setAvailabilityDate(e.target.value),
							className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "l-desc",
						className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
						children: "Listing Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "l-desc",
						rows: 4,
						value: description,
						onChange: (e) => setDescription(e.target.value),
						className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border text-sm focus:outline-none resize-none"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end pt-4 border-t",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: updateMutation.isPending,
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all cursor-pointer",
							children: [updateMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), "Save Changes"]
						})
					})
				]
			})]
		})]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingDetailsComponent, {}) });
//#endregion
export { SplitComponent as component };
