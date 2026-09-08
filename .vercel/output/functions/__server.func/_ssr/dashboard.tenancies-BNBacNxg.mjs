import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, K as Funnel, M as MapPin, Y as FolderKanban, dt as ChevronRight } from "../_libs/lucide-react.mjs";
import { t as RequireAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { u as providerListTenancies } from "./tenancies.functions-BhJoCLS5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.tenancies-BNBacNxg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProviderTenanciesComponent() {
	const [tenancies, setTenancies] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		fetchTenancies();
	}, [statusFilter]);
	const fetchTenancies = async () => {
		try {
			setLoading(true);
			const data = await providerListTenancies({ status: statusFilter || void 0 });
			setTenancies(data || []);
		} catch (err) {
			console.error("Failed to load provider tenancies", err);
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
				children: "Lease Prep"
			});
			case "AWAITING_ACCEPTANCE": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse",
				children: "Sent to Tenant"
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold text-foreground",
				children: "Tenancy Portfolio"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Manage your active tenants, draft lease terms, execute agreements, and schedule inspections."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-4 border border-border/80 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-4 w-4" }), " Filter by"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: statusFilter,
						onChange: (e) => setStatusFilter(e.target.value),
						className: "input text-xs h-9 py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All Statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "PENDING",
								children: "Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "LEASE_PREPARATION",
								children: "Lease Prep"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "AWAITING_ACCEPTANCE",
								children: "Awaiting Acceptance"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ACTIVE",
								children: "Active"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "MOVE_IN_PENDING",
								children: "Move-in Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "OCCUPIED",
								children: "Occupied"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "NOTICE_GIVEN",
								children: "Notice Given"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ENDED",
								children: "Ended"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "TERMINATED",
								children: "Terminated"
							})
						]
					})
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center min-h-[300px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
			}) : tenancies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-12 text-center max-w-xl mx-auto shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-bold text-foreground",
						children: "No tenancies found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground leading-relaxed",
						children: "When you approve rental applications and initialize active tenancy lifecycles, they will be listed here."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card overflow-hidden border border-border/80 rounded-2xl shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-secondary/40 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Reference"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Tenant"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Property / Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Rent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Dates"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60 text-xs",
							children: tenancies.map((ten) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-secondary/15 transition-all",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 font-bold text-foreground truncate max-w-[120px]",
										children: ten.tenancy_reference
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 uppercase text-[10px]",
												children: ten.tenant?.full_name?.[0] || "T"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground block",
												children: ten.tenant?.full_name || "Rental Tenant"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground block",
												children: ten.tenant?.phone_number || "No Phone"
											})] })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground block truncate max-w-[200px]",
												children: ten.properties?.name || "Property Home"
											}),
											ten.unit?.unit_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] text-primary font-bold block",
												children: ["Unit: ", ten.unit.unit_number]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] text-muted-foreground flex items-center gap-0.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 shrink-0 text-primary" }),
													" ",
													ten.properties?.town
												]
											})
										] })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-4 font-bold text-foreground",
										children: [
											ten.currency_snapshot,
											" ",
											ten.rent_snapshot.toLocaleString()
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: getStatusBadge(ten.status)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 text-muted-foreground",
										children: ten.start_date ? `${new Date(ten.start_date).toLocaleDateString()} - ${ten.end_date ? new Date(ten.end_date).toLocaleDateString() : "Ongoing"}` : "Not Started"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/dashboard/tenancies/$id",
											params: { id: ten.id },
											className: "btn btn-secondary text-[10px] py-1.5 px-3 inline-flex items-center gap-1 hover:bg-primary hover:text-primary-foreground",
											children: ["Workspace ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
										})
									})
								]
							}, ten.id))
						})]
					})
				})
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderTenanciesComponent, {}) });
//#endregion
export { SplitComponent as component };
