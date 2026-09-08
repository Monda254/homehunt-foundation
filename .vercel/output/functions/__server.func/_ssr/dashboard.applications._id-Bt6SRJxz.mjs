import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, J as FolderLock, Z as FileText, ft as ChevronLeft, gt as Building, k as MessageSquare, ut as CircleAlert, v as ShieldCheck } from "../_libs/lucide-react.mjs";
import { p as Route$6, t as RequireAuth, x as useAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { i as REJECTION_REASONS } from "./applications.types-D4vWVnj3.mjs";
import { c as providerReviewApplication, n as getApplicationDetails, o as providerRecordDecision, r as getSecureApplicationDocUrl, s as providerRequestInformation } from "./applications.functions-BSYQUg-b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.applications._id-Bt6SRJxz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProviderReviewWrapper() {
	const { id } = Route$6.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderReviewComponent, { applicationId: id });
}
function ProviderReviewComponent({ applicationId }) {
	const { user } = useAuth();
	useNavigate();
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [details, setDetails] = (0, import_react.useState)(null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [reviewNote, setReviewNote] = (0, import_react.useState)("");
	const [reviewRec, setReviewRec] = (0, import_react.useState)("SHORTLIST");
	const [savingNote, setSavingNote] = (0, import_react.useState)(false);
	const [reqName, setReqName] = (0, import_react.useState)("");
	const [reqMsg, setReqMsg] = (0, import_react.useState)("");
	const [sendingRequest, setSendingRequest] = (0, import_react.useState)(false);
	const [decisionAction, setDecisionAction] = (0, import_react.useState)(null);
	const [rejectionReason, setRejectionReason] = (0, import_react.useState)("REQUIREMENTS_NOT_MET");
	const [rejectionNotes, setRejectionNotes] = (0, import_react.useState)("");
	const [submittingDecision, setSubmittingDecision] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		fetchDetails();
	}, [applicationId]);
	const fetchDetails = async () => {
		try {
			setLoading(true);
			const data = await getApplicationDetails(applicationId);
			setDetails(data);
		} catch (err) {
			setErrorMsg(err.message || "Failed to load application details.");
		} finally {
			setLoading(false);
		}
	};
	const handleSaveReviewNote = async () => {
		if (!reviewNote.trim()) return;
		setSavingNote(true);
		try {
			await providerReviewApplication({
				applicationId,
				recommendation: reviewRec,
				notes: reviewNote
			});
			setReviewNote("");
			await fetchDetails();
		} catch (err) {
			alert(err.message || "Failed to save review note.");
		} finally {
			setSavingNote(false);
		}
	};
	const handleSendInfoRequest = async () => {
		if (!reqName.trim() || !reqMsg.trim()) {
			alert("Please provide a requirement name and request message.");
			return;
		}
		setSendingRequest(true);
		try {
			await providerRequestInformation({
				applicationId,
				requirementName: reqName,
				message: reqMsg
			});
			setReqName("");
			setReqMsg("");
			await fetchDetails();
			alert("Information request sent to applicant.");
		} catch (err) {
			alert(err.message || "Failed to send request.");
		} finally {
			setSendingRequest(false);
		}
	};
	const handleSubmitDecision = async () => {
		if (!decisionAction) return;
		setSubmittingDecision(true);
		try {
			await providerRecordDecision({
				applicationId,
				action: decisionAction,
				rejectionReason: decisionAction === "REJECT" ? rejectionReason : null,
				rejectionNotes: decisionAction === "REJECT" ? rejectionNotes : null
			});
			setDecisionAction(null);
			await fetchDetails();
		} catch (err) {
			alert(err.message || "Failed to log decision.");
		} finally {
			setSubmittingDecision(false);
		}
	};
	const handleDownloadDoc = async (filePath) => {
		try {
			const res = await getSecureApplicationDocUrl(filePath);
			if (res?.url) window.open(res.url, "_blank");
		} catch (err) {
			console.error("Failed to generate download url", err);
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
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center min-h-[400px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
	}) });
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
					to: "/dashboard/applications",
					className: "btn btn-secondary text-xs",
					children: "Back to List"
				})
			})
		]
	}) });
	const { application: app, documents, requests, reviews } = details;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard/applications",
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-widest",
								children: app.application_number
							}), getStatusBadge(app.status)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-bold text-foreground",
							children: app.applicant?.full_name || "Applicant Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-3.5 w-3.5 text-primary" }),
									" ",
									app.listings?.title
								]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 items-center bg-secondary/30 px-5 py-3 rounded-xl border border-border/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
							children: "Advertised Rent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-foreground text-sm",
							children: [
								app.currency_snapshot,
								" ",
								app.rent_snapshot.toLocaleString()
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-l border-border/50 h-8" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
							children: "Deposit Requirement"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-foreground text-sm",
							children: [
								app.currency_snapshot,
								" ",
								app.deposit_snapshot.toLocaleString()
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold text-lg text-foreground",
								children: "Applicant Verification Summary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block",
										children: "Full Contact Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground mt-0.5 block",
										children: app.personal_info?.fullName
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block",
										children: "Email & Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-foreground mt-0.5 block",
										children: [
											app.personal_info?.email,
											" • ",
											app.personal_info?.phoneNumber
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block",
										children: "Preferred Move-in"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground mt-0.5 block",
										children: app.preferred_move_in_date || "Immediate / Flexible"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block",
										children: "Move-in Occupancy Details"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-foreground mt-0.5 block",
										children: [
											app.household_info?.adults,
											" Adults, ",
											app.household_info?.children,
											" Children (Pets: ",
											app.household_info?.pets ? "Yes" : "No",
											")"
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "sm:col-span-2 border-t border-border/60 pt-4 grid gap-4 sm:grid-cols-2 bg-secondary/10 p-3.5 rounded-xl",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block",
											children: "Employment Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground mt-0.5 block capitalize",
											children: app.employment_info?.status?.replace("_", " ")
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block",
											children: "Monthly Income Range"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground mt-0.5 block",
											children: app.employment_info?.incomeRange
										})] })]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderLock, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-lg text-foreground",
									children: "Submitted Private Documents"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground italic",
									children: "No evidence documents submitted by applicant yet."
								}) : documents.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4.5 w-4.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground block",
											children: doc.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-muted-foreground block mt-0.5",
											children: [
												"Status: ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "capitalize",
													children: doc.status.toLowerCase()
												}),
												" • Size: ",
												Math.round(doc.file_size / 1024),
												" KB"
											]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => handleDownloadDoc(doc.file_path),
										className: "btn btn-secondary text-[10px] px-3 py-1.5 flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-500" }), " Decrypt & View"]
									})]
								}, doc.id))
							})]
						}),
						app.status !== "APPROVED" && app.status !== "REJECTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4 bg-secondary/5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-base",
									children: "Request Additional Information"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-normal",
									children: "If the submitted references or documents are missing or require clarification, send a direct request to the applicant."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Requested Document / Info Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "input",
											value: reqName,
											onChange: (e) => setReqName(e.target.value),
											placeholder: "e.g., Updated Employment Contract"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label",
											children: "Instructions message"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 2,
											value: reqMsg,
											onChange: (e) => setReqMsg(e.target.value),
											placeholder: "Explain what is missing or incorrect...",
											className: "textarea"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: handleSendInfoRequest,
											disabled: sendingRequest,
											className: "btn btn-secondary text-xs flex items-center gap-2",
											children: [sendingRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Send Information Request"]
										})
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						app.status !== "APPROVED" && app.status !== "REJECTED" && app.status !== "WITHDRAWN" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-primary/20 bg-primary/5 rounded-2xl space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-base",
									children: "Tenancy Decision"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-normal",
									children: "Decide to shortlist, approve, or reject this application for the property tenancy."
								}),
								!decisionAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2.5 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setDecisionAction("APPROVE"),
										className: "btn btn-primary text-xs w-full py-2.5",
										children: "Approve Applicant"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setDecisionAction("REJECT"),
										className: "btn btn-secondary text-xs w-full py-2.5 border-destructive/20 text-destructive hover:bg-destructive/5",
										children: "Reject Applicant"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 pt-2 border-t border-border/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between items-center text-xs font-bold uppercase",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Action: ", decisionAction] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setDecisionAction(null),
												className: "text-muted-foreground hover:underline",
												children: "Cancel"
											})]
										}),
										decisionAction === "REJECT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Rejection Reason"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: rejectionReason,
												onChange: (e) => setRejectionReason(e.target.value),
												className: "input text-xs",
												children: REJECTION_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: r,
													children: r.replace(/_/g, " ")
												}, r))
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Optional Notes"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												rows: 2,
												value: rejectionNotes,
												onChange: (e) => setRejectionNotes(e.target.value),
												placeholder: "Reasoning notes...",
												className: "textarea text-xs"
											})] })]
										}),
										decisionAction === "APPROVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground leading-relaxed",
											children: "Approving marks this application stage complete. Tenancy lease contracts and payments are coordinated in the subsequent stages."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: handleSubmitDecision,
											disabled: submittingDecision,
											className: "btn btn-primary text-xs w-full flex items-center justify-center gap-2",
											children: [
												submittingDecision && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
												"Confirm ",
												decisionAction === "APPROVE" ? "Approval" : "Rejection"
											]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold text-base",
									children: "Internal Review Workspace"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground leading-normal italic",
									children: "* These reviews and logs are strictly internal to the landlord team and never exposed to the applicant."
								}),
								app.status !== "APPROVED" && app.status !== "REJECTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-1 border-t border-border/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex gap-2 items-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: reviewRec,
												onChange: (e) => setReviewRec(e.target.value),
												className: "input text-[11px] h-8 py-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "SHORTLIST",
														children: "Recommend Shortlist"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "APPROVE",
														children: "Recommend Approve"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "REJECT",
														children: "Recommend Reject"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "HOLD",
														children: "Recommend Hold"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 2,
											value: reviewNote,
											onChange: (e) => setReviewNote(e.target.value),
											placeholder: "Log internal note...",
											className: "textarea text-xs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: handleSaveReviewNote,
											disabled: savingNote || !reviewNote.trim(),
											className: "btn btn-secondary text-[10px] py-1 px-3 flex items-center gap-1",
											children: [savingNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), "Save Note"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3 pt-3 border-t border-border/60 max-h-[250px] overflow-y-auto",
									children: reviews.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground italic",
										children: "No review notes recorded."
									}) : reviews.map((rev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-secondary/15 p-3 rounded-xl border border-border/40 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between items-center text-[10px] font-bold text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: rev.reviewer?.full_name || "Reviewer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: rev.recommendation })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-foreground mt-1 leading-relaxed",
												children: rev.notes
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] text-muted-foreground mt-1 block",
												children: new Date(rev.created_at).toLocaleString()
											})
										]
									}, rev.id))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-5 border border-border/80 rounded-2xl space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-display font-bold text-sm",
									children: "Need to Discuss?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-relaxed",
									children: "Connect directly with the applicant inside the portal secure messaging thread."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/messages",
									className: "btn btn-secondary text-xs w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" }), " Message Applicant"]
								})
							]
						})
					]
				})]
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderReviewWrapper, {}) });
//#endregion
export { SplitComponent as component };
