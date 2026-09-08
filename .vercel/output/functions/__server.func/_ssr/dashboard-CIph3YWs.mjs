import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as Search, _ as Shield, a as UserCheck, ct as CirclePlus, gt as Building, q as FolderOpen, s as TriangleAlert } from "../_libs/lucide-react.mjs";
import { S as useMotion, t as RequireAuth, x as useAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { t as AnimatedCard } from "./AnimatedCard-BeN8MzBm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-CIph3YWs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AnimatedNumber({ value, duration = 800, formatter = (val) => Math.round(val).toLocaleString() }) {
	const { reducedMotion } = useMotion();
	const [current, setCurrent] = (0, import_react.useState)(reducedMotion ? value : 0);
	(0, import_react.useEffect)(() => {
		if (reducedMotion) {
			setCurrent(value);
			return;
		}
		const start = 0;
		const end = value;
		if (start === end) return;
		const startTime = performance.now();
		const updateNumber = (now) => {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easeProgress = progress * (2 - progress);
			const val = start + (end - start) * easeProgress;
			setCurrent(val);
			if (progress < 1) requestAnimationFrame(updateNumber);
		};
		requestAnimationFrame(updateNumber);
	}, [
		value,
		duration,
		reducedMotion
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatter(current) });
}
function DashboardComponent() {
	const { user } = useAuth();
	if (!user) return null;
	const fields = [
		user.firstName,
		user.lastName,
		user.phoneNumber,
		user.county,
		user.town,
		user.fullName
	];
	const filled = fields.filter((f) => f && f.trim() !== "").length;
	const completeness = Math.round(filled / fields.length * 100);
	const isTenant = user.roles.includes("tenant");
	const isLandlord = user.roles.includes("landlord");
	const isAgent = user.roles.includes("agent");
	const isAdmin = user.roles.includes("admin") || user.roles.includes("super_admin");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: [
						"Welcome back, ",
						user.firstName || "User",
						"!"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: [
						"You are signed in as a",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-primary capitalize",
							children: user.roles.join(", ")
						}),
						"."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block",
						children: "Profile Completeness"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							className: "w-12 h-12 transform -rotate-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "24",
								cy: "24",
								r: "20",
								stroke: "currentColor",
								strokeWidth: "4",
								className: "text-secondary",
								fill: "transparent"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "24",
								cy: "24",
								r: "20",
								stroke: "currentColor",
								strokeWidth: "4",
								className: "text-primary transition-all duration-500",
								fill: "transparent",
								strokeDasharray: 125.6,
								strokeDashoffset: 125.6 - 125.6 * completeness / 100
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute text-[10px] font-bold text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, { value: completeness }), "%"]
						})]
					})]
				})]
			}),
			user.status === "PENDING_VERIFICATION" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-800 dark:text-yellow-400",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-semibold text-sm",
						children: "Email Verification Required"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs mt-1 leading-relaxed opacity-90",
						children: "Your account is currently restricted. Please check your email inbox for the verification link. If you didn't receive it, you can request a resend."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/verify-email",
						className: "inline-flex items-center gap-1 text-xs font-bold mt-2 hover:underline",
						children: "Go to Verification Screen →"
					})
				] })]
			}),
			isTenant && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
					className: "surface-card p-6 flex flex-col justify-between shadow-sm",
					delay: .05,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Find a Verified Home"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2 leading-relaxed",
							children: "Browse apartments, bedsitters, and townhouses verified by physical agents. Zero scams, direct bookings."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-6 pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground block italic",
							children: "* Property search module is scheduled for Phase 3 (Integrates with PostGIS maps)."
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
					className: "surface-card p-6 flex flex-col justify-between shadow-sm",
					delay: .1,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 bg-accent/15 text-accent flex items-center justify-center rounded-xl mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "My Rental Applications"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2 leading-relaxed",
							children: "Manage your rental requests, coordinate viewing calendars, and sign leases directly inside the portal."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-6 pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground block italic",
							children: "* Application and lease signing workflows scheduled for Phase 4."
						})
					})]
				})]
			}),
			isLandlord && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
					className: "surface-card p-6 flex flex-col justify-between shadow-sm",
					delay: .05,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Add New Property"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2 leading-relaxed",
							children: "Create and manage your apartment blocks, houses, or single units. Request physical agent verification checks."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-6 pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground block italic",
							children: "* Property creation and KYC verification scheduled for Phase 2."
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
					className: "surface-card p-6 flex flex-col justify-between shadow-sm",
					delay: .1,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 bg-accent/15 text-accent flex items-center justify-center rounded-xl mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Marketplace Listings"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2 leading-relaxed",
							children: "Publish vacant units to the marketplace, manage monthly rents, review applicant trust scores, and collect deposits."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-6 pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground block italic",
							children: "* Rental listings, tenancy support, and payments (M-Pesa) are scheduled for later modules."
						})
					})]
				})]
			}),
			isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
					className: "surface-card p-6 flex flex-col justify-between shadow-sm",
					delay: .05,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Managed Portfolios"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2 leading-relaxed",
							children: "Coordinate with landlords who assigned their properties to your agency, monitor vacancy rates, and update leases."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-6 pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground block italic",
							children: "* Property agent assignment scheduled for Phase 2."
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
					className: "surface-card p-6 flex flex-col justify-between shadow-sm",
					delay: .1,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 bg-accent/15 text-accent flex items-center justify-center rounded-xl mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-lg text-foreground",
							children: "Tenant Inquiries"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2 leading-relaxed",
							children: "Review applicant profiles, schedule viewing appointments, verify national IDs, and handle deposit claims."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-6 pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground block italic",
							children: "* Viewer bookings and trust scores are scheduled for subsequent phases."
						})
					})]
				})]
			}),
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
				className: "surface-card p-6 shadow-sm space-y-4",
				delay: .15,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-semibold text-lg text-foreground flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-primary" }), " Admin Controls"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "You hold administrative privileges. You can view, audit, suspend, reactivate users, and manage account roles."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95",
							children: "Open User Management"
						})
					})
				]
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardComponent, {}) });
//#endregion
export { SplitComponent as component };
