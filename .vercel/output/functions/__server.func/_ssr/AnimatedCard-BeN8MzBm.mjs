import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/framer-motion+[...].mjs";
import { g as fadeUpVariants } from "./router-Dop2ixCg2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AnimatedCard-BeN8MzBm.js
var import_jsx_runtime = require_jsx_runtime();
function AnimatedCard({ children, className = "", delay = 0, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		variants: fadeUpVariants,
		custom: { delay },
		initial: "initial",
		whileInView: "animate",
		viewport: {
			once: true,
			margin: "-40px"
		},
		whileHover: {
			y: -3,
			transition: { duration: .2 }
		},
		className: `will-change-transform ${className}`,
		...props,
		children
	});
}
//#endregion
export { AnimatedCard as t };
