import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as EyeOff, I as LoaderCircle, Q as Eye, lt as CircleCheck, wt as ArrowLeft, y as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as resetPassword } from "./router-Dop2ixCg.mjs";
import { l as Route$27 } from "./router-Dop2ixCg2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-BhxKDl5q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordComponent() {
	const { token } = Route$27.useSearch();
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const resetMutation = useMutation({
		mutationFn: () => resetPassword({
			token: token || "",
			password,
			confirmPassword
		}),
		onSuccess: () => {
			toast.success("Password has been reset successfully!");
			setTimeout(() => {
				navigate({ to: "/login" });
			}, 3e3);
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Failed to reset password. The link may have expired.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!token) {
			toast.error("Missing password reset token.");
			return;
		}
		if (password.length < 8) {
			toast.error("Password must be at least 8 characters long.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}
		resetMutation.mutate();
	};
	if (!token) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-md w-full text-center shadow-elevated border border-destructive/20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Invalid Reset Request"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "No password reset token was provided, or the reset token is invalid. Please request a new link."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/forgot-password",
						className: "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/95",
						children: "Request Reset Link"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-md w-full text-center shadow-elevated",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Reset Password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "Please enter and confirm your new secure account password below."
				}),
				resetMutation.isSuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-xl bg-verified/5 border border-verified/20 p-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-display font-semibold text-foreground text-sm flex items-center gap-1.5",
						children: "Password Reset Complete!"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground leading-relaxed",
						children: "Your password has been successfully updated. All other active sessions for your account have been invalidated. Redirecting you to the Sign In screen in a few seconds..."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-8 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "new-pass",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "New Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "new-pass",
									type: showPassword ? "text" : "password",
									required: true,
									placeholder: "At least 8 characters",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									className: "w-full pl-4 pr-10 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
									disabled: resetMutation.isPending
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowPassword(!showPassword),
									className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
									children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "confirm-pass",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Confirm New Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "confirm-pass",
							type: showPassword ? "text" : "password",
							required: true,
							placeholder: "Repeat new password",
							value: confirmPassword,
							onChange: (e) => setConfirmPassword(e.target.value),
							className: "w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
							disabled: resetMutation.isPending
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: resetMutation.isPending || password.length < 8 || password !== confirmPassword,
						className: "mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed",
						children: resetMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Reset Password"
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
export { ResetPasswordComponent as component };
