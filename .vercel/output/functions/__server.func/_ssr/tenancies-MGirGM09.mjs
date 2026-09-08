import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, M as MapPin, Y as FolderKanban, dt as ChevronRight, mt as Calendar, ut as CircleAlert } from "../_libs/lucide-react.mjs";
import { t as RequireAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { c as listTenantTenancies } from "./tenancies.functions-C6Jkqw8J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenancies-MGirGM09.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TenanciesListComponent() {
	const [tenancies, setTenancies] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		fetchTenancies();
	}, []);
	const fetchTenancies = async () => {
		try {
			setLoading(true);
			const data = await listTenantTenancies();
			setTenancies(data || []);
		} catch (err) {
			console.error(err);
			setErrorMsg(err.message || "Failed to load tenancies.");
		} finally {
			setLoading(false);
		}
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "PENDING": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge badge-secondary",
				children: "Pending"
			});
			case "LEASE_PREPARATION": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-blue-500/10 text-blue-500 border-blue-500/20",
				children: "Lease Preparing"
			});
			case "AWAITING_ACCEPTANCE": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse",
				children: "Sign Required"
			});
			case "ACTIVE": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold",
				children: "Active"
			});
			case "MOVE_IN_PENDING": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-indigo-500/10 text-indigo-500 border-indigo-500/20 animate-pulse",
				children: "Move-in Pending"
			});
			case "OCCUPIED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge badge-success font-bold",
				children: "Occupied"
			});
			case "NOTICE_GIVEN": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-orange-500/10 text-orange-500 border-orange-500/20",
				children: "Notice Given"
			});
			case "ENDED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-neutral-500/10 text-neutral-500",
				children: "Ended"
			});
			case "TERMINATED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge badge-danger",
				children: "Terminated"
			});
			case "CANCELLED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-neutral-500/10 text-neutral-500",
				children: "Cancelled"
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-neutral-500/10 text-neutral-500",
				children: status
			});
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center min-h-[400px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold text-foreground",
				children: "My Tenancies"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Manage your rental agreements, sign lease contracts, and review move-in inspection checkers."
			})] }),
			errorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: errorMsg
				})]
			}),
			tenancies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-12 text-center max-w-xl mx-auto shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-bold text-foreground",
						children: "No tenancies yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground leading-relaxed",
						children: "Once your property application is approved and the landlord initializes your tenancy agreement, it will appear here."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/applications",
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95",
							children: "Track My Applications"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: tenancies.map((ten) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-5 border border-border/80 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-border transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
									children: ten.tenancy_reference || "Pending Ref"
								}), getStatusBadge(ten.status)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-display font-semibold text-base text-foreground leading-snug",
									children: ten.listings?.title || "Rental Home"
								}),
								ten.unit?.unit_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold text-primary block mt-0.5",
									children: ["Unit: ", ten.unit.unit_number]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 text-xs text-muted-foreground mt-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "truncate",
										children: [
											ten.properties?.name,
											", ",
											ten.properties?.town
										]
									})]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-4 items-center bg-secondary/35 p-3 rounded-xl border border-border/30 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
										children: "Agreed Rent"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-foreground",
										children: [
											ten.currency_snapshot,
											" ",
											ten.rent_snapshot.toLocaleString()
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-l border-border/50 h-6" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
										children: "Agreed Deposit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-foreground",
										children: [
											ten.currency_snapshot,
											" ",
											ten.deposit_snapshot.toLocaleString()
										]
									})] })
								]
							}),
							ten.start_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Term: ",
									new Date(ten.start_date).toLocaleDateString(),
									" -",
									" ",
									ten.end_date ? new Date(ten.end_date).toLocaleDateString() : "Ongoing"
								] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-5 pt-4 flex items-center justify-between text-xs",
						children: ten.status === "AWAITING_ACCEPTANCE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/tenancies/$id",
							params: { id: ten.id },
							className: "inline-flex items-center gap-1.5 text-yellow-600 font-bold hover:underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Review & Sign Lease" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/tenancies/$id",
							params: { id: ten.id },
							className: "text-primary font-bold hover:underline inline-flex items-center gap-1",
							children: ["Manage Tenancy ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
						})
					})]
				}, ten.id))
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TenanciesListComponent, {}) });
//#endregion
export { SplitComponent as component };
