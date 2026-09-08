import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, X as Flame, Z as FileText, ft as ChevronLeft, gt as Building, k as MessageSquare, lt as CircleCheck, ut as CircleAlert, v as ShieldCheck } from "../_libs/lucide-react.mjs";
import { f as Route$5, t as RequireAuth, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { c as TERMINATION_REASONS } from "./tenancies.types-Dd6_uOiM.mjs";
import { a as executeLease, d as scheduleMoveIn, f as sendLease, i as endTenancy, l as prepareLease, o as getSecureTenancyDocUrl, s as getTenancyDetails } from "./tenancies.functions-C6Jkqw8J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.tenancies._id-Dlnmgpzz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProviderTenancyWorkspaceWrapper() {
	const { id } = Route$5.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderTenancyWorkspaceComponent, { tenancyId: id });
}
function ProviderTenancyWorkspaceComponent({ tenancyId }) {
	const { user } = useAuth();
	useNavigate();
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [details, setDetails] = (0, import_react.useState)(null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [rentAmount, setRentAmount] = (0, import_react.useState)(0);
	const [depositAmount, setDepositAmount] = (0, import_react.useState)(0);
	const [startDate, setStartDate] = (0, import_react.useState)("");
	const [endDate, setEndDate] = (0, import_react.useState)("");
	const [petsPolicy, setPetsPolicy] = (0, import_react.useState)("");
	const [utilities, setUtilities] = (0, import_react.useState)("");
	const [noticePeriod, setNoticePeriod] = (0, import_react.useState)(30);
	const [occupancyLimit, setOccupancyLimit] = (0, import_react.useState)(2);
	const [otherRules, setOtherRules] = (0, import_react.useState)("");
	const [savingLease, setSavingLease] = (0, import_react.useState)(false);
	const [sendingLeaseDraft, setSendingLeaseDraft] = (0, import_react.useState)(false);
	const [scheduledDate, setScheduledDate] = (0, import_react.useState)("");
	const [scheduling, setScheduling] = (0, import_react.useState)(false);
	const [executing, setExecuting] = (0, import_react.useState)(false);
	const [endReason, setEndReason] = (0, import_react.useState)("LEASE_EXPIRED");
	const [endNotes, setEndNotes] = (0, import_react.useState)("");
	const [ending, setEnding] = (0, import_react.useState)(false);
	const [showEndForm, setShowEndForm] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		fetchDetails();
	}, [tenancyId]);
	const fetchDetails = async () => {
		try {
			setLoading(true);
			const data = await getTenancyDetails(tenancyId);
			setDetails(data);
			if (data?.tenancy) {
				setRentAmount(data.tenancy.rent_snapshot || 0);
				setDepositAmount(data.tenancy.deposit_snapshot || 0);
				setStartDate(data.tenancy.start_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
				const futureDate = /* @__PURE__ */ new Date();
				futureDate.setFullYear(futureDate.getFullYear() + 1);
				setEndDate(data.tenancy.end_date || futureDate.toISOString().split("T")[0]);
			}
		} catch (err) {
			setErrorMsg(err.message || "Failed to load tenancy details.");
		} finally {
			setLoading(false);
		}
	};
	const handlePrepareLease = async () => {
		setSavingLease(true);
		try {
			await prepareLease({
				tenancyId,
				rentAmount,
				depositAmount,
				startDate,
				endDate,
				terms: {
					petsPolicy,
					utilitiesResponsibility: utilities,
					noticePeriodDays: noticePeriod,
					occupancyLimit,
					otherRules
				}
			});
			await fetchDetails();
			alert("Lease agreement draft saved.");
		} catch (err) {
			alert(err.message || "Failed to save lease terms.");
		} finally {
			setSavingLease(false);
		}
	};
	const handleSendLeaseDraft = async (leaseId) => {
		setSendingLeaseDraft(true);
		try {
			await sendLease(leaseId);
			await fetchDetails();
			alert("Lease sent to tenant for review & digital signature.");
		} catch (err) {
			alert(err.message || "Failed to send lease.");
		} finally {
			setSendingLeaseDraft(false);
		}
	};
	const handleExecuteLease = async (leaseId) => {
		if (!confirm("Are you sure you want to countersign and execute this lease agreement?")) return;
		setExecuting(true);
		try {
			await executeLease(leaseId);
			await fetchDetails();
			alert("Lease executed successfully! Tenancy is now active.");
		} catch (err) {
			alert(err.message || "Execution failed.");
		} finally {
			setExecuting(false);
		}
	};
	const handleScheduleInspection = async () => {
		if (!scheduledDate) {
			alert("Please select inspection date & time.");
			return;
		}
		setScheduling(true);
		try {
			await scheduleMoveIn({
				tenancyId,
				scheduledDate: new Date(scheduledDate).toISOString()
			});
			setScheduledDate("");
			await fetchDetails();
			alert("Move-in inspection scheduled.");
		} catch (err) {
			alert(err.message || "Scheduling failed.");
		} finally {
			setScheduling(false);
		}
	};
	const handleEndTenancy = async () => {
		if (!confirm("Are you sure you want to end/terminate this tenancy agreement?")) return;
		setEnding(true);
		try {
			await endTenancy({
				tenancyId,
				reason: endReason,
				notes: endNotes
			});
			setEndNotes("");
			setShowEndForm(false);
			await fetchDetails();
			alert("Tenancy officially marked ended. Listing/unit availability reset.");
		} catch (err) {
			alert(err.message || "Termination failed.");
		} finally {
			setEnding(false);
		}
	};
	const handleDownloadDoc = async (filePath) => {
		try {
			const res = await getSecureTenancyDocUrl(filePath);
			if (res?.url) window.open(res.url, "_blank");
		} catch (err) {
			console.error("Failed to generate download url", err);
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
				className: "badge badge-danger font-bold",
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
	if (errorMsg || !details) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 max-w-xl mx-auto text-center py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-12 w-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-bold text-foreground",
				children: "Access Denied / Error"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: errorMsg || "Record does not exist or you lack provider review permission."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/dashboard/tenancies",
					className: "btn btn-secondary text-xs",
					children: "Back to List"
				})
			})
		]
	}) });
	const { tenancy: ten, leases, moveIn, history } = details;
	const currentLease = leases && leases.length > 0 ? leases[0] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard/tenancies",
					className: "text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" }), " Back to Dashboard"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-widest",
								children: ["Ref: ", ten.tenancy_reference]
							}), getStatusBadge(ten.status)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-bold text-foreground",
							children: ten.tenant?.full_name || "Rental Tenant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-3.5 w-3.5 text-primary" }),
									" ",
									ten.listings?.title
								]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 items-center bg-secondary/30 px-5 py-3 rounded-xl border border-border/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
							children: "Monthly Rent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-foreground text-sm",
							children: [
								ten.currency_snapshot,
								" ",
								ten.rent_snapshot.toLocaleString()
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-l border-border/50 h-8" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
							children: "Security Deposit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-foreground text-sm",
							children: [
								ten.currency_snapshot,
								" ",
								ten.deposit_snapshot.toLocaleString()
							]
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-6",
					children: [
						currentLease && currentLease.status === "TENANT_ACCEPTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-emerald-500/20 bg-emerald-500/5 rounded-2xl space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-emerald-800 dark:text-emerald-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-bold text-base",
										children: "Lease Agreement Accepted by Tenant"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-relaxed",
									children: "The tenant has accepted the lease terms. Countersign and execute the lease contract to activate the tenancy."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: executing,
										onClick: () => handleExecuteLease(currentLease.id),
										className: "btn btn-primary bg-emerald-600 text-white hover:bg-emerald-500 text-xs flex items-center gap-2",
										children: [executing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Countersign & Execute Lease"]
									})
								})
							]
						}),
						(ten.status === "PENDING" || ten.status === "LEASE_PREPARATION" || ten.status === "AWAITING_ACCEPTANCE") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-lg text-foreground",
									children: "Lease Terms Configuration"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: "Prepare the lease details below. Once saved, send the draft to the tenant for signature."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Monthly Rent Amount (KES)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											className: "input",
											value: rentAmount,
											onChange: (e) => setRentAmount(parseFloat(e.target.value) || 0)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Required Security Deposit (KES)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											className: "input",
											value: depositAmount,
											onChange: (e) => setDepositAmount(parseFloat(e.target.value) || 0)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Lease Commencement Date"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "date",
											className: "input",
											value: startDate,
											onChange: (e) => setStartDate(e.target.value)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Lease Termination Date"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "date",
											className: "input",
											value: endDate,
											onChange: (e) => setEndDate(e.target.value)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Notice Period (Days)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											className: "input",
											value: noticePeriod,
											onChange: (e) => setNoticePeriod(parseInt(e.target.value) || 30)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Occupancy Limit (Adults)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											className: "input",
											value: occupancyLimit,
											onChange: (e) => setOccupancyLimit(parseInt(e.target.value) || 2)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Pets Guidelines"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												className: "input",
												placeholder: "e.g., No dogs permitted. Small cats allowed on pre-approval.",
												value: petsPolicy,
												onChange: (e) => setPetsPolicy(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Utilities Responsibility"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												className: "input",
												placeholder: "e.g., Tenant is responsible for electricity and water meter billings.",
												value: utilities,
												onChange: (e) => setUtilities(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Other Custom Rules"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												rows: 3,
												className: "textarea",
												placeholder: "Enter additional terms...",
												value: otherRules,
												onChange: (e) => setOtherRules(e.target.value)
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: savingLease,
										onClick: handlePrepareLease,
										className: "btn btn-secondary text-xs flex items-center gap-2",
										children: [savingLease && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Save Lease Draft"]
									}), currentLease && currentLease.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: sendingLeaseDraft,
										onClick: () => handleSendLeaseDraft(currentLease.id),
										className: "btn btn-primary text-xs flex items-center gap-2",
										children: [sendingLeaseDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Send Draft to Tenant"]
									})]
								})
							]
						}),
						(ten.status === "ACTIVE" || ten.status === "MOVE_IN_PENDING") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-base",
									children: "Schedule Move-In Walkthrough"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-normal",
									children: "Schedule the keys handover and inspection walkthrough appointment with the tenant."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-end gap-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "w-64",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label text-xs",
											children: "Inspection Date & Time"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "datetime-local",
											className: "input text-xs h-9 py-1",
											value: scheduledDate,
											onChange: (e) => setScheduledDate(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: scheduling,
										onClick: handleScheduleInspection,
										className: "btn btn-primary text-xs h-9",
										children: [scheduling && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Schedule Appointment"]
									})]
								})
							]
						}),
						moveIn && moveIn.status === "COMPLETED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-emerald-600",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-semibold text-base",
										children: "Completed Move-In Checklist"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2 text-xs bg-secondary/15 p-4 rounded-xl border border-border/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4.5 w-4.5 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Keys handed over & received" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4.5 w-4.5 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Access card credentials verified" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4.5 w-4.5 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Condition inspected & documented" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4.5 w-4.5 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Meter coordinates & logs provided" })]
										})
									]
								}),
								moveIn.condition_notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs max-w-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
										children: "Inspection Notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-foreground bg-card p-3 rounded-xl border border-border/40 mt-1",
										children: [
											"\"",
											moveIn.condition_notes,
											"\""
										]
									})]
								}),
								moveIn.condition_media && moveIn.condition_media.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
										children: "Inspection Photographs"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2.5",
										children: moveIn.condition_media.map((m, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => handleDownloadDoc(m),
											className: "btn btn-secondary text-[10px] px-3 py-1.5 flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-500" }),
												" View Photograph",
												" ",
												idx + 1
											]
										}, idx))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold text-base text-foreground",
								children: "Agreement Versions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: leases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground italic",
									children: "No lease document generated yet."
								}) : leases.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4.5 w-4.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold text-foreground block",
											children: ["Lease Contract Version ", l.version]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-muted-foreground block mt-0.5",
											children: [
												"Status: ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "capitalize",
													children: l.status.toLowerCase()
												}),
												" • Period: ",
												new Date(l.start_date).toLocaleDateString(),
												" -",
												" ",
												new Date(l.end_date).toLocaleDateString()
											]
										})] })]
									}), l.status === "EXECUTED" && l.file_path && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => handleDownloadDoc(l.file_path),
										className: "btn btn-secondary text-[10px] px-3 py-1.5 flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-500" }), " View Contract"]
									})]
								}, l.id))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold text-base text-foreground",
								children: "Workspace Timeline"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative border-l-2 border-border/80 pl-5 ml-2.5 space-y-6 py-2",
								children: history.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-[27px] top-0.5 bg-background border-2 border-primary rounded-full h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] font-bold text-primary uppercase tracking-widest block",
											children: event.new_status.replace(/_/g, " ")
										}),
										event.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground mt-0.5 leading-relaxed",
											children: event.notes
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[9px] text-muted-foreground block mt-1",
											children: new Date(event.created_at).toLocaleString()
										})
									] })]
								}, event.id))
							})]
						}),
						ten.status !== "ENDED" && ten.status !== "TERMINATED" && ten.status !== "CANCELLED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-destructive/20 bg-destructive/5 rounded-2xl space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-display font-bold text-sm",
										children: "Terminate Tenancy"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground leading-normal",
									children: "Officially end this tenancy agreement and release property locks/keys. This resets occupancy state."
								}),
								!showEndForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowEndForm(true),
									className: "btn btn-secondary text-xs w-full border-destructive/20 text-destructive hover:bg-destructive/5 py-2",
									children: "End Tenancy"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-2 border-t border-destructive/10",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label text-[10px] uppercase font-bold text-muted-foreground",
											children: "Termination Reason"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: endReason,
											onChange: (e) => setEndReason(e.target.value),
											className: "input text-xs",
											children: TERMINATION_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: r,
												children: r.replace(/_/g, " ")
											}, r))
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label text-[10px] uppercase font-bold text-muted-foreground",
											children: "Optional Notes"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 2,
											className: "textarea text-xs",
											value: endNotes,
											onChange: (e) => setEndNotes(e.target.value),
											placeholder: "Detail the exit state..."
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												disabled: ending,
												onClick: handleEndTenancy,
												className: "btn btn-primary bg-destructive text-white hover:bg-destructive/95 text-xs flex items-center justify-center gap-1.5 py-1.5 flex-1",
												children: [ending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Confirm End"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setShowEndForm(false),
												className: "btn btn-secondary text-xs py-1.5",
												children: "Cancel"
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-5 border border-border/80 rounded-2xl space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-display font-bold text-sm",
									children: "Coordinate Move-In"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-relaxed",
									children: "Connect inside the platform thread to coordinate inspection dates or ask rent questions."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/messages",
									className: "btn btn-secondary text-xs w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" }), " Message Tenant"]
								})
							]
						})
					]
				})]
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderTenancyWorkspaceWrapper, {}) });
//#endregion
export { SplitComponent as component };
