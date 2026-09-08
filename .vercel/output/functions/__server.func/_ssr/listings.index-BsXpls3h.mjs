import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { G as Globe, I as LoaderCircle, M as MapPin, Q as Eye, U as House, Z as FileText, d as ToggleLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as RequireAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { t as AnimatedCard } from "./AnimatedCard-D2nQAN3M.mjs";
import { h as publishListing, m as pauseListing, r as archiveListing, u as getMyListings } from "./properties.functions-CKL-q0ta.mjs";
import { t as AnimatedButton } from "./AnimatedButton-DJI27DWs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listings.index-BsXpls3h.js
var import_jsx_runtime = require_jsx_runtime();
function ListingsManagementComponent() {
	const queryClient = useQueryClient();
	const { data: listings, isLoading } = useQuery({
		queryKey: ["my-listings"],
		queryFn: () => getMyListings()
	});
	const publishMutation = useMutation({
		mutationFn: (id) => publishListing(id),
		onSuccess: () => {
			toast.success("Listing published to marketplace!");
			queryClient.invalidateQueries({ queryKey: ["my-listings"] });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to publish listing.");
		}
	});
	const pauseMutation = useMutation({
		mutationFn: (id) => pauseListing(id),
		onSuccess: () => {
			toast.success("Listing paused successfully.");
			queryClient.invalidateQueries({ queryKey: ["my-listings"] });
		}
	});
	const archiveMutation = useMutation({
		mutationFn: (id) => archiveListing(id),
		onSuccess: () => {
			toast.success("Listing archived.");
			queryClient.invalidateQueries({ queryKey: ["my-listings"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold text-foreground",
			children: "Marketplace Listings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Manage your online property listings, rent advertisements, and publishing statuses."
		})] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-60 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
		}) : listings && listings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4",
			children: listings.map((list) => {
				const prop = list.properties;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
					className: "surface-card p-5 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-base text-foreground",
									children: list.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${list.status === "PUBLISHED" ? "bg-verified/10 text-verified border-verified/20" : list.status === "DRAFT" ? "bg-secondary text-muted-foreground border-border" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
									children: list.status
								})]
							}),
							prop && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
									prop.name,
									" — ",
									prop.town,
									", ",
									prop.county
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-extrabold text-primary pt-1",
								children: [
									"KES ",
									Number(list.price).toLocaleString(),
									" /",
									" ",
									list.billing_period.toLowerCase()
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 flex-wrap self-end md:self-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/listings/$id",
								params: { id: list.id },
								className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " Edit"]
							}),
							list.status === "DRAFT" || list.status === "PAUSED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedButton, {
								onClick: () => publishMutation.mutate(list.id),
								loading: publishMutation.isPending,
								variant: "primary",
								className: "text-xs font-semibold py-1.5 px-3 rounded-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3.5 w-3.5" }), " Publish"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/homes/$id",
								params: { id: list.id },
								className: "inline-flex items-center gap-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/85 px-3 py-1.5 text-xs font-semibold cursor-pointer border border-border/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " View Public"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedButton, {
								onClick: () => pauseMutation.mutate(list.id),
								loading: pauseMutation.isPending,
								variant: "secondary",
								className: "text-xs font-semibold py-1.5 px-3 rounded-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "h-3.5 w-3.5 text-muted-foreground" }), " Pause"]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedButton, {
								onClick: () => {
									if (confirm("Are you sure you want to archive this advertisement?")) archiveMutation.mutate(list.id);
								},
								loading: archiveMutation.isPending,
								variant: "danger",
								className: "text-xs font-semibold py-1.5 px-3 rounded-lg border border-border",
								children: "Archive"
							})
						]
					})]
				}, list.id);
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-12 text-center max-w-xl mx-auto shadow-sm border border-dashed border-border/80",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold text-foreground",
					children: "No listings yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "Before advertising rent or sales to the public, you need to configure your underlying properties and subunits."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/properties",
						className: "inline-flex items-center gap-1.5 justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/95",
						children: "Go to Properties Dashboard"
					})
				})
			]
		})]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingsManagementComponent, {}) });
//#endregion
export { SplitComponent as component };
