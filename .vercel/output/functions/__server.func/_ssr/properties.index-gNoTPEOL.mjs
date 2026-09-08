import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as Plus, I as LoaderCircle, gt as Building } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as RequireAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { d as getMyProperties, i as archiveProperty } from "./properties.functions-DDrKs7rG.mjs";
import { n as PropertyCard } from "./PropertyCard-BAZG8EfF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties.index-gNoTPEOL.js
var import_jsx_runtime = require_jsx_runtime();
function PropertiesDashboardComponent() {
	const queryClient = useQueryClient();
	const { data: properties, isLoading } = useQuery({
		queryKey: ["my-properties"],
		queryFn: () => getMyProperties()
	});
	const archiveMutation = useMutation({
		mutationFn: (id) => archiveProperty(id),
		onSuccess: () => {
			toast.success("Property archived successfully.");
			queryClient.invalidateQueries({ queryKey: ["my-properties"] });
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to archive property.");
		}
	});
	const handleArchive = (id) => {
		if (confirm("Are you sure you want to archive this property? All listing references will remain historical.")) archiveMutation.mutate(id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold text-foreground",
				children: "Property Management"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Add and manage your apartments, standalone rentals, and managed portfolios."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/properties/new",
				className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all self-start sm:self-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create Property"]
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-60 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
		}) : properties && properties.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
			children: properties.map((prop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropertyCard, {
				property: prop,
				onArchive: handleArchive
			}, prop.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-12 text-center max-w-xl mx-auto shadow-sm border border-dashed border-border/80",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold text-foreground",
					children: "No properties yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "Create your first physical property to start managing units and publishing marketplace advertisements."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/properties/new",
						className: "inline-flex items-center gap-1.5 justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/95",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Your First Property"]
					})
				})
			]
		})]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PropertiesDashboardComponent, {}) });
//#endregion
export { SplitComponent as component };
