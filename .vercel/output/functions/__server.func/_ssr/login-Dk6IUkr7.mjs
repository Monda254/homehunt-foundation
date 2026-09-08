import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as EyeOff, I as LoaderCircle, Q as Eye, _ as Shield, wt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as login } from "./router-Dop2ixCg.mjs";
import { u as Route$33, x as useAuth } from "./router-Dop2ixCg2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Dk6IUkr7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginComponent() {
	const { redirect } = Route$33.useSearch();
	const navigate = useNavigate();
	const { login: establishSession } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const loginMutation = useMutation({
		mutationFn: () => login({
			email,
			password
		}),
		onSuccess: async (data) => {
			toast.success("Signed in successfully!");
			await establishSession({
				access_token: data.access_token,
				refresh_token: data.refresh_token
			});
			navigate({ to: redirect || "/dashboard" });
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Invalid email or password.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!email || !password) return;
		loginMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-md w-full shadow-elevated",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground text-center",
					children: "Sign In"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground text-center leading-relaxed",
					children: "Access your HomeHunt account to find, verify, or manage rental properties."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-8 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "email",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Email Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "email",
							type: "email",
							required: true,
							placeholder: "e.g. user@example.com",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
							disabled: loginMutation.isPending
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "pass",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/forgot-password",
								className: "text-xs font-semibold text-primary hover:underline",
								children: "Forgot Password?"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "pass",
								type: showPassword ? "text" : "password",
								required: true,
								placeholder: "••••••••",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "w-full pl-4 pr-10 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: loginMutation.isPending
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShowPassword(!showPassword),
								className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
								children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loginMutation.isPending || !email || !password,
							className: "w-full mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed",
							children: loginMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Sign In"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 text-center text-sm text-muted-foreground",
					children: [
						"Don't have an account?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							className: "font-semibold text-primary hover:underline",
							children: "Create Account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 border-t border-border/60 pt-6 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Go Back Home"]
					})
				})
			]
		})
	});
}
//#endregion
export { LoginComponent as component };
