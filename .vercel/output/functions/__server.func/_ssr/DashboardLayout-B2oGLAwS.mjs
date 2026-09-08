import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { o as useRouterState, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Menu, P as LogOut, R as LayoutDashboard, U as House, Y as FolderKanban, _ as Shield, at as ClipboardList, b as Settings, gt as Building, ht as CalendarDays, j as Map, k as MessageSquare, r as User, rt as Compass, t as X, ut as CircleAlert, yt as Bookmark } from "../_libs/lucide-react.mjs";
import { x as useAuth } from "./router-Dop2ixCg2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DashboardLayout-B2oGLAwS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DashboardLayout = ({ children }) => {
	const { user, logout, hasPermission } = useAuth();
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
	const currentPath = useRouterState().location.pathname;
	const handleSignOut = () => {
		logout();
	};
	const showListingsManager = user && (user.roles.includes("landlord") || user.roles.includes("agent") || user.roles.includes("property_manager") || user.roles.includes("admin") || user.roles.includes("super_admin"));
	const navItems = [
		{
			label: "Dashboard",
			to: "/dashboard",
			icon: LayoutDashboard
		},
		...showListingsManager ? [
			{
				label: "My Properties",
				to: "/properties",
				icon: Building
			},
			{
				label: "My Listings",
				to: "/listings",
				icon: FolderKanban
			},
			{
				label: "Received Applications",
				to: "/dashboard/applications",
				icon: ClipboardList
			}
		] : [],
		{
			label: "Map Search",
			to: "/homes",
			icon: Map
		},
		{
			label: "Recommended Matches",
			to: "/recommendations",
			icon: Compass
		},
		{
			label: "Saved Homes",
			to: "/saved",
			icon: Bookmark
		},
		{
			label: "Applications",
			to: "/applications",
			icon: FolderKanban
		},
		{
			label: "Viewings",
			to: "/viewings",
			icon: CalendarDays
		},
		{
			label: "Messages",
			to: "/messages",
			icon: MessageSquare
		},
		{
			label: "My Profile",
			to: "/profile",
			icon: User
		},
		{
			label: "Settings & Security",
			to: "/settings",
			icon: Settings
		}
	];
	const showAdmin = hasPermission("ADMIN_VIEW_USERS");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background flex font-sans",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-16 flex items-center gap-2.5 px-6 border-b border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4.5 w-4.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-xl font-bold tracking-tight text-primary",
						children: ["Home", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-accent",
							children: "Hunt"
						})]
					})]
				}),
				user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border bg-secondary/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center border border-primary/20 uppercase",
							children: user.firstName?.[0] || user.email?.[0] || "U"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground truncate",
								children: user.fullName || "User Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground truncate uppercase font-bold tracking-wider text-[9px] mt-0.5",
								children: user.roles.join(" / ")
							})]
						})]
					}), user.status === "PENDING_VERIFICATION" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2 text-yellow-700 dark:text-yellow-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] leading-tight font-medium",
							children: "Unverified Email"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex-1 px-4 py-4 space-y-1 overflow-y-auto",
					children: [navItems.map((item) => {
						const Icon = item.icon;
						const active = currentPath === item.to;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4.5 w-4.5" }), item.label]
						}, item.to);
					}), showAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-4 border-t border-border mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2",
							children: "Administration"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin",
							className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentPath.startsWith("/admin") ? "bg-accent/15 text-accent border border-accent/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4.5 w-4.5" }), "User Management"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 border-t border-border mt-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleSignOut,
						className: "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4.5 w-4.5" }), "Sign Out"]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "h-16 flex items-center justify-between px-6 border-b border-border bg-card md:hidden shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-lg font-bold tracking-tight text-primary",
							children: ["Home", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent",
								children: "Hunt"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setSidebarOpen(!sidebarOpen),
						className: "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground",
						children: sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
					})]
				}),
				sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "fixed inset-0 top-16 z-30 bg-background md:hidden flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 border-b border-border bg-secondary/10 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center border border-primary/20 uppercase",
								children: user?.firstName?.[0] || "U"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: user?.fullName || "User Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground uppercase font-bold text-[9px]",
								children: user?.roles.join(" / ")
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleSignOut,
							className: "p-2 text-destructive hover:bg-destructive/10 rounded-lg",
							"aria-label": "Sign out",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex-1 px-4 py-4 space-y-1 overflow-y-auto",
						children: [navItems.map((item) => {
							const Icon = item.icon;
							const active = currentPath === item.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								onClick: () => setSidebarOpen(false),
								className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4.5 w-4.5" }), item.label]
							}, item.to);
						}), showAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-4 border-t border-border mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2",
								children: "Administration"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/admin",
								onClick: () => setSidebarOpen(false),
								className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentPath.startsWith("/admin") ? "bg-accent/15 text-accent border border-accent/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4.5 w-4.5" }), "User Management"]
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 overflow-y-auto p-6 md:p-8 bg-secondary/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-w-5xl mx-auto",
						children
					})
				})
			]
		})]
	});
};
//#endregion
export { DashboardLayout as t };
