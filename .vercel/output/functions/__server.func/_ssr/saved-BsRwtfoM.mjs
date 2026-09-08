import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { H as Info, W as Heart } from "../_libs/lucide-react.mjs";
import { t as RequireAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/saved-BsRwtfoM.js
var import_jsx_runtime = require_jsx_runtime();
function SavedPropertiesComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold text-foreground",
			children: "Saved Homes"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Manage your bookmarked properties and search listings."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 text-center max-w-xl mx-auto shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold text-foreground",
					children: "Future Implementation Module"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "The saved properties list, filters, and bookmarking directory will be implemented in subsequent phases."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center gap-2.5 rounded-xl bg-secondary/50 p-4 border border-border/60 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-5 w-5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground leading-normal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Phase 1 Identity active:" }), " You are fully authenticated. The property and maps modules will activate in later phases."]
					})]
				})
			]
		})]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedPropertiesComponent, {}) });
//#endregion
export { SplitComponent as component };
