import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { I as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/framer-motion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AnimatedButton-DJI27DWs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AnimatedButton = import_react.forwardRef(({ children, loading = false, success = false, variant = "primary", className = "", ...props }, ref) => {
	let btnStyle = "btn ";
	if (variant === "primary") btnStyle += "btn-primary";
	else if (variant === "secondary") btnStyle += "btn-secondary";
	else if (variant === "danger") btnStyle += "btn-primary bg-destructive text-white hover:bg-destructive/95";
	else if (variant === "ghost") btnStyle += "bg-transparent hover:bg-secondary/40 text-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
		ref,
		whileTap: props.disabled || loading ? {} : { scale: .98 },
		whileHover: props.disabled || loading ? {} : { scale: 1.01 },
		className: `${btnStyle} ${className} relative flex items-center justify-center gap-2 overflow-hidden`,
		...props,
		children: [
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-current shrink-0" }),
			success && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				initial: { scale: 0 },
				animate: { scale: 1 },
				className: "text-emerald-500 mr-1",
				children: "✓"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: loading ? "opacity-90" : "opacity-100",
				children
			})
		]
	});
});
AnimatedButton.displayName = "AnimatedButton";
//#endregion
export { AnimatedButton as t };
