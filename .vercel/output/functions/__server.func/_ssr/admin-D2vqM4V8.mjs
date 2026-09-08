import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { D as OctagonAlert, I as LoaderCircle, S as Search, St as ArrowUpRight, T as RefreshCw, Z as FileText, a as UserCheck, i as UserX, q as FolderOpen, s as TriangleAlert, st as CircleQuestionMark, t as X, v as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as adminReactivateUser, i as adminManageRole, n as adminGetUser, o as adminSuspendUser, r as adminListUsers } from "./router-Dop2ixCg.mjs";
import { t as RequireAuth, x as useAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { a as listRiskFlags, c as resolveListingReport, d as resolveRiskFlag, f as reviewVerificationRequest, i as listPropertyClaims, l as resolveModerationAppeal, n as listListingReports, o as listVerificationRequests, p as revokeVerification, r as listModerationAppeals, t as getSecureEvidenceUrl, u as resolvePropertyClaim } from "./trust.functions-CPrv8JdR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-D2vqM4V8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminComponent() {
	const queryClient = useQueryClient();
	const { user: currentUser, hasPermission } = useAuth();
	const [activeTab, setActiveTab] = (0, import_react.useState)("users");
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const [selectedUserId, setSelectedUserId] = (0, import_react.useState)(null);
	const [suspensionReason, setSuspensionReason] = (0, import_react.useState)("");
	const [isSuspending, setIsSuspending] = (0, import_react.useState)(false);
	const [selectedVerification, setSelectedVerification] = (0, import_react.useState)(null);
	const [selectedClaim, setSelectedClaim] = (0, import_react.useState)(null);
	const [selectedReport, setSelectedReport] = (0, import_react.useState)(null);
	const [selectedAppeal, setSelectedAppeal] = (0, import_react.useState)(null);
	const [reviewReason, setReviewReason] = (0, import_react.useState)("");
	const [signedDocUrl, setSignedDocUrl] = (0, import_react.useState)(null);
	const [isSigning, setIsSigning] = (0, import_react.useState)(false);
	const { data: usersData, isLoading: isUsersLoading } = useQuery({
		queryKey: [
			"admin-users",
			page,
			search,
			roleFilter,
			statusFilter
		],
		queryFn: () => adminListUsers({
			page,
			pageSize: 10,
			search: search || void 0,
			role: roleFilter || void 0,
			status: statusFilter || void 0
		}),
		enabled: activeTab === "users"
	});
	const { data: verifications, isLoading: isVerificationsLoading } = useQuery({
		queryKey: ["admin-verifications"],
		queryFn: () => listVerificationRequests(),
		enabled: activeTab === "verifications" && hasPermission("VERIFICATION_VIEW")
	});
	const { data: claims, isLoading: isClaimsLoading } = useQuery({
		queryKey: ["admin-claims"],
		queryFn: () => listPropertyClaims(),
		enabled: activeTab === "claims" && hasPermission("CLAIMS_VIEW")
	});
	const { data: reports, isLoading: isReportsLoading } = useQuery({
		queryKey: ["admin-reports"],
		queryFn: () => listListingReports(),
		enabled: activeTab === "reports" && hasPermission("REPORTS_VIEW")
	});
	const { data: riskFlags, isLoading: isRiskFlagsLoading } = useQuery({
		queryKey: ["admin-risk-flags"],
		queryFn: () => listRiskFlags(),
		enabled: activeTab === "reports" && hasPermission("RISK_VIEW")
	});
	const { data: appeals, isLoading: isAppealsLoading } = useQuery({
		queryKey: ["admin-appeals"],
		queryFn: () => listModerationAppeals(),
		enabled: activeTab === "appeals" && hasPermission("APPEALS_VIEW")
	});
	const { data: selectedUser, isLoading: userLoading } = useQuery({
		queryKey: ["admin-user-detail", selectedUserId],
		queryFn: () => adminGetUser({ userId: selectedUserId || "" }),
		enabled: !!selectedUserId && activeTab === "users"
	});
	const suspendMutation = useMutation({
		mutationFn: () => adminSuspendUser({
			userId: selectedUserId || "",
			reason: suspensionReason
		}),
		onSuccess: () => {
			toast.success("User suspended successfully.");
			setSuspensionReason("");
			setIsSuspending(false);
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to suspend user.");
		}
	});
	const reactivateMutation = useMutation({
		mutationFn: () => adminReactivateUser({ userId: selectedUserId || "" }),
		onSuccess: () => {
			toast.success("User reactivated successfully.");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to reactivate user.");
		}
	});
	const manageRoleMutation = useMutation({
		mutationFn: (variables) => adminManageRole({
			userId: selectedUserId || "",
			role: variables.role,
			action: variables.action
		}),
		onSuccess: (_, variables) => {
			toast.success(`Role '${variables.role}' ${variables.action === "assign" ? "assigned" : "removed"} successfully.`);
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to modify user roles.");
		}
	});
	const reviewVerMutation = useMutation({
		mutationFn: (variables) => reviewVerificationRequest({
			id: variables.id,
			status: variables.status,
			rejectionReason: variables.reason
		}),
		onSuccess: () => {
			toast.success("Verification request updated successfully.");
			setSelectedVerification(null);
			setReviewReason("");
			setSignedDocUrl(null);
			queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to update verification status.");
		}
	});
	const revokeVerMutation = useMutation({
		mutationFn: (variables) => revokeVerification({
			id: variables.id,
			revocationReason: variables.reason
		}),
		onSuccess: () => {
			toast.success("Verification revoked successfully.");
			setSelectedVerification(null);
			setReviewReason("");
			queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to revoke verification.");
		}
	});
	const resolveClaimMutation = useMutation({
		mutationFn: (variables) => resolvePropertyClaim({
			id: variables.id,
			action: variables.action,
			rejectionReason: variables.reason
		}),
		onSuccess: () => {
			toast.success("Property claim resolved successfully.");
			setSelectedClaim(null);
			setReviewReason("");
			queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to resolve property claim.");
		}
	});
	const resolveReportMutation = useMutation({
		mutationFn: (variables) => resolveListingReport({
			id: variables.id,
			action: variables.action,
			resolution: variables.resolution
		}),
		onSuccess: () => {
			toast.success("Report resolved successfully.");
			setSelectedReport(null);
			setReviewReason("");
			queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to resolve listing report.");
		}
	});
	const resolveAppealMutation = useMutation({
		mutationFn: (variables) => resolveModerationAppeal({
			id: variables.id,
			action: variables.action,
			notes: variables.notes
		}),
		onSuccess: () => {
			toast.success("Appeal resolved successfully.");
			setSelectedAppeal(null);
			setReviewReason("");
			queryClient.invalidateQueries({ queryKey: ["admin-appeals"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to resolve appeal.");
		}
	});
	const resolveRiskFlagMutation = useMutation({
		mutationFn: (variables) => resolveRiskFlag(variables.id, variables.status),
		onSuccess: () => {
			toast.success("Risk flag resolved successfully.");
			queryClient.invalidateQueries({ queryKey: ["admin-risk-flags"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to resolve risk flag.");
		}
	});
	const handleViewEvidence = async (ref) => {
		setIsSigning(true);
		setSignedDocUrl(null);
		try {
			const res = await getSecureEvidenceUrl(ref);
			setSignedDocUrl(res.signedUrl);
		} catch (e) {
			toast.error(e.message || "Failed to retrieve secure URL for document.");
		} finally {
			setIsSigning(false);
		}
	};
	const handleSearchChange = (e) => {
		setSearch(e.target.value);
		setPage(1);
	};
	const handleRoleFilterChange = (e) => {
		setRoleFilter(e.target.value);
		setPage(1);
	};
	const handleStatusFilterChange = (e) => {
		setStatusFilter(e.target.value);
		setPage(1);
	};
	const handleSuspendSubmit = (e) => {
		e.preventDefault();
		if (!suspensionReason) return;
		suspendMutation.mutate();
	};
	const pendingVerificationsCount = verifications?.filter?.((v) => v.status === "PENDING")?.length || 0;
	const pendingClaimsCount = claims?.filter?.((c) => c.status === "PENDING")?.length || 0;
	const openReportsCount = reports?.filter?.((r) => r.status === "OPEN")?.length || 0;
	const activeAppealsCount = appeals?.filter?.((a) => a.status === "APPEAL_SUBMITTED")?.length || 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Platform Administration"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Monitor registered accounts, verification requests, property claims, reports, risk signals, and appeals."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						queryClient.invalidateQueries();
						toast.success("Dashboard metrics refreshed.");
					},
					className: "inline-flex items-center gap-1 bg-secondary text-foreground text-xs font-semibold px-3 py-2 rounded-lg border hover:bg-secondary/80 cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), " Refresh Queues"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 grid-cols-2 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 bg-card border rounded-2xl space-y-1 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
							children: "Pending Verifications"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-black text-primary",
							children: pendingVerificationsCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 bg-card border rounded-2xl space-y-1 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
							children: "Pending Property Claims"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-black text-primary",
							children: pendingClaimsCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 bg-card border rounded-2xl space-y-1 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
							children: "Open Listing Reports"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-black text-destructive",
							children: openReportsCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 bg-card border rounded-2xl space-y-1 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
							children: "Active Moderation Appeals"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-black text-primary",
							children: activeAppealsCount
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex border-b border-border overflow-x-auto gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab("users"),
						className: `px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: "User Admin"
					}),
					hasPermission("VERIFICATION_VIEW") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("verifications"),
						className: `px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "verifications" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Verification Requests (",
							pendingVerificationsCount,
							")"
						]
					}),
					hasPermission("CLAIMS_VIEW") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("claims"),
						className: `px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "claims" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Property Claims (",
							pendingClaimsCount,
							")"
						]
					}),
					hasPermission("REPORTS_VIEW") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("reports"),
						className: `px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "reports" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Listing Reports & Risks (",
							openReportsCount,
							")"
						]
					}),
					hasPermission("APPEALS_VIEW") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("appeals"),
						className: `px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "appeals" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: [
							"Moderation Appeals (",
							activeAppealsCount,
							")"
						]
					})
				]
			}),
			activeTab === "users" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-4 bg-card p-4 rounded-xl border border-border shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "Search by name, phone...",
								value: search,
								onChange: handleSearchChange,
								className: "w-full pl-9 pr-4 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: roleFilter,
							onChange: handleRoleFilterChange,
							className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none text-sm cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All Roles"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "tenant",
									children: "Tenant"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "landlord",
									children: "Landlord"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "agent",
									children: "Agent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "property_manager",
									children: "Property Manager"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "verifier",
									children: "Verifier"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "admin",
									children: "Administrator"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "super_admin",
									children: "Super Admin"
								})
							]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: statusFilter,
							onChange: handleStatusFilterChange,
							className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none text-sm cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All Statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "PENDING_VERIFICATION",
									children: "Pending Verification"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "ACTIVE",
									children: "Active"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "SUSPENDED",
									children: "Suspended"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "DEACTIVATED",
									children: "Deactivated"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "LOCKED",
									children: "Locked"
								})
							]
						}) })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
					children: isUsersLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-60 items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4 pl-6",
										children: "Name / Email"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Assigned Roles"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4",
										children: "Created Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-4 pr-6 text-right",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/60 text-sm",
								children: usersData && usersData.users.length > 0 ? usersData.users.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-secondary/10 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-4 pl-6",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-foreground",
												children: item.fullName || "Un-onboarded Account"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground mt-0.5",
												children: item.email
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-1",
												children: item.roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border border-border",
													children: r
												}, r))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === "ACTIVE" ? "bg-verified/10 text-verified border-verified/20" : item.status === "SUSPENDED" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
												children: item.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-4 text-xs text-muted-foreground",
											children: new Date(item.createdAt).toLocaleDateString()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-4 pr-6 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setSelectedUserId(item.id),
												className: "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer",
												children: "Inspect"
											})
										})
									]
								}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									className: "text-center p-8 text-muted-foreground",
									children: "No registered users found matching the query filters."
								}) })
							})]
						})
					})
				})]
			}),
			activeTab === "verifications" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
				children: isVerificationsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-60 items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 pl-6",
									children: "Subject / Type"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Submission Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 pr-6 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60 text-sm",
							children: verifications && verifications.length > 0 ? verifications.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-secondary/10 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-4 pl-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold text-foreground",
											children: [item.verification_type, " Request"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: [
												"Subject: ",
												item.subject_type,
												" (",
												item.subject_id,
												")"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 text-xs text-muted-foreground",
										children: new Date(item.submitted_at).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === "VERIFIED" ? "bg-verified/10 text-verified border-verified/20" : item.status === "REJECTED" || item.status === "REVOKED" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
											children: item.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 pr-6 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												setSelectedVerification(item);
												setReviewReason("");
											},
											className: "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer",
											children: "Inspect Request"
										})
									})
								]
							}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 4,
								className: "text-center p-8 text-muted-foreground",
								children: "No verification requests submitted."
							}) })
						})]
					})
				})
			}),
			activeTab === "claims" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
				children: isClaimsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-60 items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 pl-6",
									children: "Property / User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Date Claimed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 pr-6 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60 text-sm",
							children: claims && claims.length > 0 ? claims.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-secondary/10 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-4 pl-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: item.properties?.name || "Asset Record"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: ["Claimed by: ", item.profiles?.full_name || "Unknown User"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 text-xs text-muted-foreground",
										children: new Date(item.created_at).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === "APPROVED" ? "bg-verified/10 text-verified border-verified/20" : item.status === "REJECTED" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
											children: item.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 pr-6 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												setSelectedClaim(item);
												setReviewReason("");
											},
											className: "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer",
											children: "Inspect Claim"
										})
									})
								]
							}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 4,
								className: "text-center p-8 text-muted-foreground",
								children: "No property ownership claims registered."
							}) })
						})]
					})
				})
			}),
			activeTab === "reports" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-bold text-base text-foreground flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OctagonAlert, { className: "h-5 w-5 text-destructive" }), " Internal Automated Risk Flags"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
						children: isRiskFlagsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-32 items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 text-primary animate-spin" })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left border-collapse",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4 pl-6",
											children: "Risk Signal / Target"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4",
											children: "Severity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4 pr-6 text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border/60 text-sm",
									children: riskFlags && riskFlags.length > 0 ? riskFlags.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-secondary/10 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-4 pl-6",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground",
													children: item.risk_type
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground mt-0.5",
													children: [
														"Target: ",
														item.subject_type,
														" (",
														item.subject_id,
														")"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `px-2 py-0.5 rounded text-[9px] font-bold ${item.severity === "CRITICAL" || item.severity === "HIGH" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"}`,
													children: item.severity
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-semibold text-muted-foreground",
													children: item.status
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4 pr-6 text-right space-x-2",
												children: item.status === "OPEN" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => resolveRiskFlagMutation.mutate({
														id: item.id,
														status: "RESOLVED"
													}),
													className: "text-verified font-bold hover:underline text-xs cursor-pointer",
													children: "Resolve"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => resolveRiskFlagMutation.mutate({
														id: item.id,
														status: "DISMISSED"
													}),
													className: "text-muted-foreground font-bold hover:underline text-xs cursor-pointer",
													children: "Dismiss"
												})] })
											})
										]
									}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 4,
										className: "text-center p-6 text-muted-foreground",
										children: "No automated risk flags open."
									}) })
								})]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-bold text-base text-foreground flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-accent" }), " Listing Reports"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
						children: isReportsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-60 items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left border-collapse",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4 pl-6",
											children: "Listing / Issue"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4",
											children: "Submitted Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-4 pr-6 text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border/60 text-sm",
									children: reports && reports.length > 0 ? reports.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-secondary/10 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-4 pl-6",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground",
													children: item.listings?.title || "Marketplace Listing"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground mt-0.5",
													children: ["Reason: ", item.reason]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4 text-xs text-muted-foreground",
												children: new Date(item.created_at).toLocaleString()
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === "RESOLVED" ? "bg-verified/10 text-verified border-verified/20" : item.status === "DISMISSED" ? "bg-secondary text-muted-foreground border-border" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
													children: item.status
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-4 pr-6 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => {
														setSelectedReport(item);
														setReviewReason("");
													},
													className: "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer",
													children: "Inspect Report"
												})
											})
										]
									}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 4,
										className: "text-center p-8 text-muted-foreground",
										children: "No reports submitted by users."
									}) })
								})]
							})
						})
					})]
				})]
			}),
			activeTab === "appeals" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm",
				children: isAppealsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-60 items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 pl-6",
									children: "Appellant / Target"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Date Appealed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 pr-6 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60 text-sm",
							children: appeals && appeals.length > 0 ? appeals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-secondary/10 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-4 pl-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: item.profiles?.full_name || "User Account"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: [
												"Appeal on: ",
												item.target_type,
												" (",
												item.target_id,
												")"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 text-xs text-muted-foreground",
										children: new Date(item.created_at).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === "REVERSED" ? "bg-verified/10 text-verified border-verified/20" : item.status === "UPHELD" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
											children: item.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 pr-6 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												setSelectedAppeal(item);
												setReviewReason("");
											},
											className: "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer",
											children: "Inspect Appeal"
										})
									})
								]
							}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 4,
								className: "text-center p-8 text-muted-foreground",
								children: "No appeals submitted."
							}) })
						})]
					})
				})
			}),
			selectedUserId && activeTab === "users" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm animate-in fade-in duration-200",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg bg-card border-l border-border h-full flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center pb-4 border-b border-border mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-bold text-lg text-foreground",
							children: "User Detail Inspector"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setSelectedUserId(null);
								setIsSuspending(false);
							},
							className: "text-muted-foreground hover:text-foreground cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						})]
					}), userLoading || !selectedUser ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-1 items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 text-primary animate-spin" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-14 w-14 rounded-full bg-primary/10 text-primary font-display font-bold text-lg flex items-center justify-center border border-primary/20 uppercase",
									children: selectedUser.firstName?.[0] || selectedUser.email?.[0] || "U"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-display font-bold text-foreground",
									children: selectedUser.fullName || "Un-onboarded User"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: selectedUser.email
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl bg-secondary/30 border border-border space-y-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Account Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold uppercase text-primary",
											children: selectedUser.status
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "User Phone"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: selectedUser.phoneNumber || "None"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Identity Verified"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-verified",
											children: selectedUser.identityVerified ? "VERIFIED" : "UNVERIFIED"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3",
								children: "Account Status Controls"
							}), selectedUser.status === "SUSPENDED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => reactivateMutation.mutate(),
								disabled: reactivateMutation.isPending,
								className: "inline-flex items-center gap-1.5 rounded-lg border border-verified/20 text-verified bg-verified/5 hover:bg-verified/10 px-4 py-2 text-xs font-semibold cursor-pointer transition-all",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4" }), " Restore & Reactivate Account"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: !isSuspending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setIsSuspending(true),
									className: "inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4 py-2 text-xs font-semibold cursor-pointer transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "h-4 w-4" }), " Temporarily Suspend User"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSuspendSubmit,
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-muted-foreground block",
											children: "Suspension Justification Reason"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											required: true,
											placeholder: "e.g. Terms violations",
											value: suspensionReason,
											onChange: (e) => setSuspensionReason(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none text-xs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "submit",
												disabled: suspendMutation.isPending,
												className: "rounded-lg bg-destructive px-3.5 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 cursor-pointer",
												children: "Confirm Suspend"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setIsSuspending(false),
												className: "rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer",
												children: "Cancel"
											})]
										})
									]
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3",
									children: "Role Configuration"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5 mb-4",
									children: selectedUser.roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "bg-secondary px-2.5 py-1 rounded text-xs font-bold text-muted-foreground border border-border flex items-center gap-1",
										children: [r, selectedUserId !== currentUser?.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => manageRoleMutation.mutate({
												role: r,
												action: "remove"
											}),
											className: "text-destructive hover:bg-destructive/10 rounded font-semibold text-[10px] px-1",
											children: "×"
										})]
									}, r))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									onChange: (e) => {
										const val = e.target.value;
										if (val) {
											manageRoleMutation.mutate({
												role: val,
												action: "assign"
											});
											e.target.value = "";
										}
									},
									className: "px-3 py-1.5 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "+ Assign Role..."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "tenant",
											children: "Tenant"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "landlord",
											children: "Landlord"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "agent",
											children: "Agent"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "property_manager",
											children: "Property Manager"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "verifier",
											children: "Verifier"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "admin",
											children: "Administrator"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "super_admin",
											children: "Super Admin"
										})
									]
								})
							] })
						]
					})]
				})
			}),
			selectedVerification && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setSelectedVerification(null);
								setSignedDocUrl(null);
							},
							className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display font-extrabold text-lg text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-primary" }), " Inspect Verification Request"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-xs leading-normal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 p-3 bg-secondary/20 rounded-xl",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-semibold",
											children: "Verification Type:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-foreground",
											children: selectedVerification.verification_type
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-semibold",
											children: "Subject Type:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-foreground",
											children: selectedVerification.subject_type
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Subject ID:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono text-[10px] break-all",
												children: selectedVerification.subject_id
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold text-foreground uppercase tracking-wider text-[10px] mb-2",
									children: "Submitted Evidence Documents (Private Storage)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: selectedVerification.verification_evidence?.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 border rounded-xl bg-secondary/10 flex items-center justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-foreground",
											children: doc.evidence_type
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] text-muted-foreground truncate max-w-[200px]",
											children: doc.storage_reference
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => handleViewEvidence(doc.storage_reference),
											className: "inline-flex items-center gap-1 bg-secondary px-2.5 py-1 rounded text-[10px] font-bold border hover:bg-secondary/80 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "h-3 w-3" }), " View Private Doc"]
										})]
									}, doc.id))
								})] }),
								isSigning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 items-center text-primary font-bold text-[10px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), " Retrieving secure temporary download link..."]
								}),
								signedDocUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-primary/10 rounded-xl border border-primary/20 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-bold text-primary mb-1",
										children: "Temporary Signed Access URL:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: signedDocUrl,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "text-primary hover:underline font-semibold break-all inline-flex items-center gap-1 text-[10px]",
										children: [
											"Click to inspect document (Valid for 15 mins)",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5" })
										]
									})]
								}),
								selectedVerification.status === "PENDING" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-3 border-t",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block",
											children: "Decision Notes / Rejection Reason"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											placeholder: "Required for rejections, optional for approval notes...",
											value: reviewReason,
											onChange: (e) => setReviewReason(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2 justify-end",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => reviewVerMutation.mutate({
													id: selectedVerification.id,
													status: "VERIFIED",
													reason: reviewReason
												}),
												className: "px-3.5 py-2 bg-verified text-white text-xs font-semibold rounded-lg hover:bg-verified/95 cursor-pointer",
												children: "Approve & Verify"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													if (!reviewReason) {
														toast.error("Please supply a rejection reason first.");
														return;
													}
													reviewVerMutation.mutate({
														id: selectedVerification.id,
														status: "REJECTED",
														reason: reviewReason
													});
												},
												className: "px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer",
												children: "Reject Request"
											})]
										})
									]
								}),
								selectedVerification.status === "VERIFIED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-3 border-t",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block",
											children: "Revocation Reason"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											placeholder: "Required justification for revoking this verified badge...",
											value: reviewReason,
											onChange: (e) => setReviewReason(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex justify-end",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													if (!reviewReason) {
														toast.error("Please supply a revocation reason first.");
														return;
													}
													revokeVerMutation.mutate({
														id: selectedVerification.id,
														reason: reviewReason
													});
												},
												className: "px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer",
												children: "Revoke Verification"
											})
										})
									]
								})
							]
						})
					]
				})
			}),
			selectedClaim && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSelectedClaim(null),
							className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display font-extrabold text-lg text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary" }), " Inspect Property Claim"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-xs leading-normal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-secondary/20 rounded-xl space-y-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Property:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedClaim.properties?.name || "Asset" })
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "User:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedClaim.profiles?.full_name || "Account User" })
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "User Phone:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedClaim.profiles?.phone_number || "None" })
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground leading-relaxed text-[11px]",
									children: "Approved claims will automatically register the appellant as an active owner party relationship with write access to property details and listings units management."
								}),
								selectedClaim.status === "PENDING" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-3 border-t",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block",
											children: "Rejection Reason (If rejecting)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											placeholder: "Why is this claim rejected...",
											value: reviewReason,
											onChange: (e) => setReviewReason(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2 justify-end",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => resolveClaimMutation.mutate({
													id: selectedClaim.id,
													action: "APPROVE"
												}),
												className: "px-3.5 py-2 bg-verified text-white text-xs font-semibold rounded-lg hover:bg-verified/95 cursor-pointer",
												children: "Approve Claim"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													if (!reviewReason) {
														toast.error("Please supply a rejection reason first.");
														return;
													}
													resolveClaimMutation.mutate({
														id: selectedClaim.id,
														action: "REJECT",
														reason: reviewReason
													});
												},
												className: "px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer",
												children: "Reject Claim"
											})]
										})
									]
								})
							]
						})
					]
				})
			}),
			selectedReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSelectedReport(null),
							className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display font-extrabold text-lg text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-accent" }), " Inspect Listing Report"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-xs leading-normal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-secondary/20 rounded-xl space-y-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Report ID:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[10px]",
												children: selectedReport.id
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Listing Name:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedReport.listings?.title || "Listing" })
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Issue Flagged:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-destructive",
												children: selectedReport.reason
											})
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-semibold block mb-1",
									children: "Reporter Description Note:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "p-3 bg-secondary/10 border rounded-lg text-foreground italic",
									children: [
										"\"",
										selectedReport.description || "No descriptive notes supplied.",
										"\""
									]
								})] }),
								selectedReport.status === "OPEN" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-3 border-t",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block",
											children: "Resolution Detail Note"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											placeholder: "Resolving action explanation...",
											value: reviewReason,
											onChange: (e) => setReviewReason(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2 justify-end",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => resolveReportMutation.mutate({
													id: selectedReport.id,
													action: "RESOLVE",
													resolution: reviewReason
												}),
												className: "px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer",
												children: "Resolve & Pause Listing"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => resolveReportMutation.mutate({
													id: selectedReport.id,
													action: "DISMISS",
													resolution: reviewReason
												}),
												className: "px-3.5 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer",
												children: "Dismiss Report"
											})]
										})
									]
								})
							]
						})
					]
				})
			}),
			selectedAppeal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSelectedAppeal(null),
							className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display font-extrabold text-lg text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-5 w-5 text-primary" }), " Inspect Moderation Appeal"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-xs leading-normal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-secondary/20 rounded-xl space-y-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Appeal ID:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[10px]",
												children: selectedAppeal.id
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Appellant:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedAppeal.profiles?.full_name || "User" })
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-semibold",
												children: "Target Action:"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
												selectedAppeal.target_type,
												" (",
												selectedAppeal.target_id,
												")"
											] })
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-semibold block mb-1",
									children: "Appeal Reason Statement:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "p-3 bg-secondary/10 border rounded-lg text-foreground italic",
									children: [
										"\"",
										selectedAppeal.reason,
										"\""
									]
								})] }),
								selectedAppeal.status === "APPEAL_SUBMITTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-3 border-t",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block",
											children: "Review notes / justification"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											placeholder: "Notes for upholding or reversing the decision...",
											value: reviewReason,
											onChange: (e) => setReviewReason(e.target.value),
											className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2 justify-end",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => resolveAppealMutation.mutate({
													id: selectedAppeal.id,
													action: "REVERSED",
													notes: reviewReason
												}),
												className: "px-3.5 py-2 bg-verified text-white text-xs font-semibold rounded-lg hover:bg-verified/95 cursor-pointer",
												children: "Reverse Decision (Approve)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => resolveAppealMutation.mutate({
													id: selectedAppeal.id,
													action: "UPHELD",
													notes: reviewReason
												}),
												className: "px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer",
												children: "Uphold Decision (Reject)"
											})]
										})
									]
								})
							]
						})
					]
				})
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
	permission: "ADMIN_VIEW_USERS",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminComponent, {})
});
//#endregion
export { SplitComponent as component };
