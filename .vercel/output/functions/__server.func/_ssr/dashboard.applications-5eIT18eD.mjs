import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, K as Funnel, M as MapPin, Y as FolderKanban, dt as ChevronRight } from "../_libs/lucide-react.mjs";
import { t as RequireAuth, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { a as providerListApplications } from "./applications.functions-U6iYTQoi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.applications-5eIT18eD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProviderApplicationsComponent() {
	const { user } = useAuth();
	const [applications, setApplications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		fetchApplications();
	}, [statusFilter]);
	const fetchApplications = async () => {
		try {
			setLoading(true);
			const submittedOnly = (await providerListApplications({ status: statusFilter || void 0 }) || []).filter((app) => app.status !== "DRAFT");
			setApplications(submittedOnly);
		} catch (err) {
			console.error("Failed to load provider applications", err);
		} finally {
			setLoading(false);
		}
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "SUBMITTED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge badge-primary",
				children: "Submitted"
			});
			case "UNDER_REVIEW": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-blue-500/10 text-blue-500 border-blue-500/20",
				children: "Under Review"
			});
			case "ADDITIONAL_INFORMATION_REQUIRED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
				children: "Awaiting Info"
			});
			case "RESUBMITTED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
				children: "Resubmitted"
			});
			case "SHORTLISTED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-purple-500/10 text-purple-500 border-purple-500/20",
				children: "Shortlisted"
			});
			case "APPROVED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge badge-success",
				children: "Approved"
			});
			case "REJECTED": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge badge-danger",
				children: "Rejected"
			});
			case "WITHDRAWN": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge bg-neutral-500/10 text-neutral-500",
				children: "Withdrawn"
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Applicant Management"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Review submitted profiles, request missing evidence, and decide on tenancies."
				})] })
			}),
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
								children: "All Statuses (excluding Drafts)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "SUBMITTED",
								children: "Submitted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "UNDER_REVIEW",
								children: "Under Review"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ADDITIONAL_INFORMATION_REQUIRED",
								children: "Awaiting Info"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "RESUBMITTED",
								children: "Resubmitted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "SHORTLISTED",
								children: "Shortlisted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "APPROVED",
								children: "Approved"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "REJECTED",
								children: "Rejected"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "WITHDRAWN",
								children: "Withdrawn"
							})
						]
					})
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center min-h-[300px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
			}) : applications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-12 text-center max-w-xl mx-auto shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-bold text-foreground",
						children: "No applications received"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground leading-relaxed",
						children: "When seekers apply for your listings, they will appear here. Confirm that your listings are active and verified."
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
									children: "App Ref"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Applicant"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Listing / Property"
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
									children: "Submitted Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60 text-xs",
							children: applications.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-secondary/15 transition-all",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 font-bold text-foreground truncate max-w-[120px]",
										children: app.application_number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 uppercase text-[10px]",
												children: app.applicant?.full_name?.[0] || "U"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground block",
												children: app.applicant?.full_name || "Applicant Profile"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground block",
												children: app.applicant?.phone_number || "No Phone"
											})] })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground block truncate max-w-[200px]",
											children: app.listings?.title || "Listing Unit"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-muted-foreground flex items-center gap-0.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 shrink-0 text-primary" }),
												" ",
												app.properties?.name,
												", ",
												app.properties?.town
											]
										})] })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-4 font-bold text-foreground",
										children: [
											app.currency_snapshot,
											" ",
											app.rent_snapshot.toLocaleString()
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: getStatusBadge(app.status)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 text-muted-foreground",
										children: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Draft"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/dashboard/applications/$id",
											params: { id: app.id },
											className: "btn btn-secondary text-[10px] py-1.5 px-3 inline-flex items-center gap-1 hover:bg-primary hover:text-primary-foreground",
											children: ["Review ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
										})
									})
								]
							}, app.id))
						})]
					})
				})
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderApplicationsComponent, {}) });
//#endregion
export { SplitComponent as component };
