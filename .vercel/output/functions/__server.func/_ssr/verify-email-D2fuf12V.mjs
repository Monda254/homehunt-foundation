import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as ArrowRight, I as LoaderCircle, N as Mail, T as RefreshCw, lt as CircleCheck, ot as CircleX } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as resendVerification, x as verifyEmail } from "./router-Dop2ixCg.mjs";
import { c as Route$22, x as useAuth } from "./router-Dop2ixCg2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify-email-D2fuf12V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VerifyEmailComponent() {
	const { token } = Route$22.useSearch();
	const navigate = useNavigate();
	const { user, refetch } = useAuth();
	const [resendEmail, setResendEmail] = (0, import_react.useState)("");
	const [countdown, setCountdown] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (user && user.status === "ACTIVE") navigate({ to: "/dashboard" });
	}, [user, navigate]);
	const verifyMutation = useMutation({
		mutationFn: (tok) => verifyEmail({ token: tok }),
		onSuccess: async () => {
			toast.success("Email verified successfully!");
			await refetch();
			setTimeout(() => {
				navigate({ to: "/dashboard" });
			}, 3e3);
		},
		onError: (err) => {
			const msg = err.message || "Invalid or expired verification token.";
			toast.error(msg);
		}
	});
	(0, import_react.useEffect)(() => {
		if (token) verifyMutation.mutate(token);
	}, [token, verifyMutation]);
	const resendMutation = useMutation({
		mutationFn: (email) => resendVerification({ email }),
		onSuccess: () => {
			toast.success("Verification link sent! Check your inbox.");
			setCountdown(60);
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Failed to resend verification link.");
		}
	});
	(0, import_react.useEffect)(() => {
		if (countdown <= 0) return;
		const timer = setTimeout(() => setCountdown(countdown - 1), 1e3);
		return () => clearTimeout(timer);
	}, [countdown]);
	const handleResendSubmit = (e) => {
		e.preventDefault();
		if (!resendEmail) return;
		resendMutation.mutate(resendEmail);
	};
	if (token && verifyMutation.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-md w-full text-center shadow-elevated",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-12 w-12 text-primary animate-spin mx-auto mb-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Verifying Email..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "We are cryptographically validating your email verification link. Please wait a moment."
				})
			]
		})
	});
	if (token && verifyMutation.isSuccess) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-md w-full text-center shadow-elevated border border-verified/20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-verified/10 text-verified mx-auto mb-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-8 w-8" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Verification Successful!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "Your email has been successfully verified. You are being redirected to your dashboard."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/dashboard",
						className: "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95",
						children: ["Go to Dashboard ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
					})
				})
			]
		})
	});
	if (token && verifyMutation.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-md w-full text-center shadow-elevated border border-destructive/20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto mb-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-8 w-8" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Verification Failed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "The link is invalid, expired, or has already been used. You can request a new verification link below."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleResendSubmit,
					className: "mt-8 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "resend-email-fail",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Email Address"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "resend-email-fail",
							type: "email",
							required: true,
							placeholder: "e.g. user@example.com",
							value: resendEmail,
							onChange: (e) => setResendEmail(e.target.value),
							className: "w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm mb-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: resendMutation.isPending || countdown > 0,
							className: "w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed",
							children: resendMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : countdown > 0 ? `Resend in ${countdown}s` : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Resend Link ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" })] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "text-xs font-semibold text-primary hover:underline",
						children: "Back to Sign In"
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
					className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent mx-auto mb-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-8 w-8" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Check Your Email"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground leading-relaxed",
					children: "We have sent a cryptographically secure verification link to your registered email address. Please check your inbox (and spam folder) and click the link to activate your account."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleResendSubmit,
					className: "mt-8 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "resend-email",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Didn't receive the email? Resend link"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "resend-email",
							type: "email",
							required: true,
							placeholder: "Enter your email to resend",
							value: resendEmail,
							onChange: (e) => setResendEmail(e.target.value),
							className: "w-full px-4 py-3 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm mb-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: resendMutation.isPending || countdown > 0,
							className: "w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed",
							children: resendMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : countdown > 0 ? `Resend in ${countdown}s` : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Resend Verification Link ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" })] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 text-center flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "text-xs font-semibold text-primary hover:underline",
						children: "Back to Sign In"
					}), user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => refetch(),
						className: "text-xs font-semibold text-primary hover:underline flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" }), " Check status"]
					})]
				})
			]
		})
	});
}
//#endregion
export { VerifyEmailComponent as component };
