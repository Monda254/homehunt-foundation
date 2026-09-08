import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, N as Mail, V as KeyRound, wt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { h as requestPasswordReset } from "./router-Dop2ixCg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-Ndtw9LW3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPasswordComponent() {
	const [email, setEmail] = (0, import_react.useState)("");
	const resetRequestMutation = useMutation({
		mutationFn: (emailAddress) => requestPasswordReset({ email: emailAddress }),
		onSuccess: (data) => {
			toast.success("Reset request processed!");
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "An error occurred. Please try again.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!email) return;
		resetRequestMutation.mutate(email);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-md w-full text-center shadow-elevated",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Forgot Password?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "No worries! Enter your email address below and we'll send you instructions to reset your password."
				}),
				resetRequestMutation.isSuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-xl bg-verified/5 border border-verified/20 p-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
						className: "font-display font-semibold text-foreground text-sm flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-verified" }), " Check your inbox"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted-foreground leading-relaxed",
						children: [
							"If an account is associated with ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: email
							}),
							", we have dispatched a password reset link to it. The link will expire in 1 hour."
						]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-8 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "email",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Email Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "email",
							type: "email",
							required: true,
							placeholder: "e.g. yourname@domain.com",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
							disabled: resetRequestMutation.isPending
						})] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: resetRequestMutation.isPending || !email,
						className: "mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed",
						children: resetRequestMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Send Reset Instructions"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 border-t border-border/60 pt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/login",
						className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Sign In"]
					})
				})
			]
		})
	});
}
//#endregion
export { ForgotPasswordComponent as component };
