import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as Landmark, I as LoaderCircle, _ as Shield, r as User, wt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { m as register } from "./router-CmEb8YAq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-CjuFfOrE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RegisterComponent() {
	const navigate = useNavigate();
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phoneNumber, setPhoneNumber] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("tenant");
	const registerMutation = useMutation({
		mutationFn: () => register({
			firstName,
			lastName,
			email,
			phoneNumber: phoneNumber || void 0,
			password,
			confirmPassword,
			role
		}),
		onSuccess: () => {
			toast.success("Account created successfully!");
			navigate({ to: "/verify-email" });
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Registration failed. Please check inputs.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!firstName || !lastName || !email || !password || !confirmPassword) {
			toast.error("Please fill in all required fields.");
			return;
		}
		if (password.length < 8) {
			toast.error("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}
		if (phoneNumber && !/^\+?[0-9]{9,15}$/.test(phoneNumber)) {
			toast.error("Please enter a valid phone number (e.g. +254712345678).");
			return;
		}
		registerMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card p-8 max-w-xl w-full shadow-elevated",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground text-center",
					children: "Create Account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground text-center leading-relaxed",
					children: "Join HomeHunt today. Find verified rentals or list properties securely."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-8 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3 text-center sm:text-left",
								children: "Select Your Intended Account Role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setRole("tenant"),
										className: `flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${role === "tenant" ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20" : "border-border bg-transparent hover:border-primary/40 text-muted-foreground hover:text-foreground"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-6 w-6 mb-2" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-xs",
												children: "Tenant"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] mt-1 leading-tight block",
												children: "Looking for a home"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setRole("landlord"),
										className: `flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${role === "landlord" ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20" : "border-border bg-transparent hover:border-primary/40 text-muted-foreground hover:text-foreground"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-6 w-6 mb-2" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-xs",
												children: "Landlord"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] mt-1 leading-tight block",
												children: "I own rental units"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setRole("agent"),
										className: `flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${role === "agent" ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20" : "border-border bg-transparent hover:border-primary/40 text-muted-foreground hover:text-foreground"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-6 w-6 mb-2" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-xs",
												children: "Agent / Mgr"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] mt-1 leading-tight block",
												children: "I manage properties"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2.5 text-[10px] text-muted-foreground text-center",
								children: "* Note: Admins, Verifiers, and Property Managers require controlled offline authorization."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "first-name",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "First Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "first-name",
								type: "text",
								required: true,
								placeholder: "e.g. John",
								value: firstName,
								onChange: (e) => setFirstName(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: registerMutation.isPending
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "last-name",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Last Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "last-name",
								type: "text",
								required: true,
								placeholder: "e.g. Doe",
								value: lastName,
								onChange: (e) => setLastName(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: registerMutation.isPending
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "email",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Email Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "email",
								type: "email",
								required: true,
								placeholder: "name@domain.com",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: registerMutation.isPending
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "phone",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: ["Phone Number ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground/60",
									children: "(Optional)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "phone",
								type: "tel",
								placeholder: "e.g. +254712345678",
								value: phoneNumber,
								onChange: (e) => setPhoneNumber(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: registerMutation.isPending
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "pass",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "pass",
								type: "password",
								required: true,
								placeholder: "At least 8 chars",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: registerMutation.isPending
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "confirm-pass",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Confirm Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "confirm-pass",
								type: "password",
								required: true,
								placeholder: "Repeat password",
								value: confirmPassword,
								onChange: (e) => setConfirmPassword(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: registerMutation.isPending
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: registerMutation.isPending,
							className: "w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed",
							children: registerMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Create Account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 text-center text-sm text-muted-foreground",
					children: [
						"Already have an account?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "font-semibold text-primary hover:underline",
							children: "Sign In"
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
export { RegisterComponent as component };
