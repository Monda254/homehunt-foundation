import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-BSPz5QXw.mjs";
import { I as LoaderCircle, M as MapPin, Z as FileText, at as ClipboardList, ft as ChevronLeft, gt as Building, k as MessageSquare, lt as CircleCheck, o as Upload, s as TriangleAlert, ut as CircleAlert, v as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/framer-motion+[...].mjs";
import { m as Route$9, t as RequireAuth, x as useAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { t as AnimatedCard } from "./AnimatedCard-BeN8MzBm.mjs";
import { n as completeMoveIn, o as getSecureTenancyDocUrl, r as declineLease, s as getTenancyDetails, t as acceptLease } from "./tenancies.functions-BhJoCLS5.mjs";
import { t as AnimatedButton } from "./AnimatedButton-DJI27DWs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenancies._id-heH3YVhZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGES = [
	{
		id: "DISCOVER",
		label: "Discover"
	},
	{
		id: "VIEW",
		label: "View"
	},
	{
		id: "APPLY",
		label: "Apply"
	},
	{
		id: "APPROVE",
		label: "Approve"
	},
	{
		id: "LEASE",
		label: "Lease"
	},
	{
		id: "MOVE_IN",
		label: "Move-In"
	},
	{
		id: "TENANCY",
		label: "Tenancy"
	}
];
function HomeHuntJourney({ currentStage, className = "" }) {
	const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `surface-card p-5 border border-border/80 rounded-2xl shadow-sm ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4",
			children: "Your Housing Journey Progress"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-between overflow-x-auto gap-4 py-2",
			children: STAGES.map((stage, index) => {
				const isCompleted = index < currentIndex;
				const isActive = index === currentIndex;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center min-w-[70px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: { scale: .9 },
						animate: isActive ? { scale: 1.1 } : { scale: 1 },
						className: `h-7 w-7 rounded-full flex items-center justify-center border font-bold text-xs ${isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : isActive ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary/40 text-muted-foreground border-border/50"}`,
						children: isCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4.5 w-4.5 text-emerald-500 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index + 1 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-[10px] font-semibold mt-2 ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`,
						children: stage.label
					})]
				}), index < STAGES.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 min-w-[20px] h-0.5 relative bg-secondary/50 rounded",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: { width: 0 },
						animate: { width: isCompleted ? "100%" : "0%" },
						className: "absolute inset-0 bg-emerald-400",
						transition: { duration: .5 }
					})
				})] }, stage.id);
			})
		})]
	});
}
function TenancyDetailsWrapper() {
	const { id } = Route$9.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TenancyDetailsComponent, { tenancyId: id });
}
function TenancyDetailsComponent({ tenancyId }) {
	const { user } = useAuth();
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [details, setDetails] = (0, import_react.useState)(null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [signing, setSigning] = (0, import_react.useState)(false);
	const [correctionNote, setCorrectionNote] = (0, import_react.useState)("");
	const [declining, setDeclining] = (0, import_react.useState)(false);
	const [showDeclineForm, setShowDeclineForm] = (0, import_react.useState)(false);
	const [keysReceived, setKeysReceived] = (0, import_react.useState)(false);
	const [accessConfirmed, setAccessConfirmed] = (0, import_react.useState)(false);
	const [conditionDocumented, setConditionDocumented] = (0, import_react.useState)(false);
	const [utilityInfoProvided, setUtilityInfoProvided] = (0, import_react.useState)(false);
	const [moveInNotes, setMoveInNotes] = (0, import_react.useState)("");
	const [moveInMedia, setMoveInMedia] = (0, import_react.useState)([]);
	const [uploadingMedia, setUploadingMedia] = (0, import_react.useState)(false);
	const [completingMoveIn, setCompletingMoveIn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		fetchDetails();
	}, [tenancyId]);
	const fetchDetails = async () => {
		try {
			setLoading(true);
			const data = await getTenancyDetails(tenancyId);
			setDetails(data);
			if (data?.moveIn) {
				setKeysReceived(data.moveIn.checklist?.keysReceived || false);
				setAccessConfirmed(data.moveIn.checklist?.accessConfirmed || false);
				setConditionDocumented(data.moveIn.checklist?.conditionDocumented || false);
				setUtilityInfoProvided(data.moveIn.checklist?.utilityInfoProvided || false);
				setMoveInNotes(data.moveIn.condition_notes || "");
				setMoveInMedia(data.moveIn.condition_media || []);
			}
		} catch (err) {
			setErrorMsg(err.message || "Failed to load tenancy details.");
		} finally {
			setLoading(false);
		}
	};
	const handleAcceptLease = async (leaseId) => {
		if (!confirm("Are you sure you want to digitally sign and accept this lease agreement?")) return;
		setSigning(true);
		try {
			await acceptLease({ leaseId });
			await fetchDetails();
			alert("Lease agreement accepted successfully. Landlord has been notified.");
		} catch (err) {
			alert(err.message || "Acceptance failed.");
		} finally {
			setSigning(false);
		}
	};
	const handleDeclineLease = async (leaseId) => {
		if (!correctionNote.trim()) {
			alert("Please provide details for the correction request.");
			return;
		}
		setDeclining(true);
		try {
			await declineLease({
				leaseId,
				notes: correctionNote
			});
			setCorrectionNote("");
			setShowDeclineForm(false);
			await fetchDetails();
			alert("Lease declined. Landlord has been notified to edit terms.");
		} catch (err) {
			alert(err.message || "Decline failed.");
		} finally {
			setDeclining(false);
		}
	};
	const handleMediaUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file || !user) return;
		setUploadingMedia(true);
		try {
			const fileExt = file.name.split(".").pop();
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
			const storagePath = `${user.userId}/${fileName}`;
			const { error: uploadError } = await supabase.storage.from("tenancy_documents").upload(storagePath, file);
			if (uploadError) throw uploadError;
			setMoveInMedia((prev) => [...prev, storagePath]);
		} catch (err) {
			alert(err.message || "Failed to upload file.");
		} finally {
			setUploadingMedia(false);
		}
	};
	const handleCompleteMoveIn = async () => {
		if (!keysReceived || !accessConfirmed || !conditionDocumented || !utilityInfoProvided) {
			alert("Please complete all checklist requirements before signing off occupancy.");
			return;
		}
		setCompletingMoveIn(true);
		try {
			await completeMoveIn({
				tenancyId,
				actualDate: (/* @__PURE__ */ new Date()).toISOString(),
				checklist: {
					keysReceived,
					accessConfirmed,
					conditionDocumented,
					utilityInfoProvided
				},
				conditionNotes: moveInNotes,
				conditionMedia: moveInMedia
			});
			await fetchDetails();
			alert("Move-in successfully completed! Welcome to your new home.");
		} catch (err) {
			alert(err.message || "Submission failed.");
		} finally {
			setCompletingMoveIn(false);
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
	if (errorMsg || !details) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 max-w-xl mx-auto text-center py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-12 w-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-bold text-foreground",
				children: "Failed to Load Tenancy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: errorMsg || "Tenancy record does not exist or you lack access permissions."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/tenancies",
					className: "btn btn-secondary text-xs",
					children: "Back to Tenancies"
				})
			})
		]
	}) });
	const { tenancy: ten, leases, moveIn, history } = details;
	const currentLease = leases && leases.length > 0 ? leases[0] : null;
	let journeyStage = "DISCOVER";
	if (ten.status === "PENDING" || ten.status === "LEASE_PREPARATION") journeyStage = "APPROVE";
	else if (ten.status === "AWAITING_ACCEPTANCE") journeyStage = "LEASE";
	else if (ten.status === "MOVE_IN_PENDING") journeyStage = "MOVE_IN";
	else if (ten.status === "ACTIVE" || ten.status === "OCCUPIED") journeyStage = "TENANCY";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/tenancies",
					className: "text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" }), " Back to My Tenancies"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeHuntJourney, { currentStage: journeyStage }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2.5",
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
							children: ten.listings?.title || "Rental Home"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary" }),
									" ",
									ten.properties?.name,
									",",
									" ",
									ten.properties?.county
								]
							}), ten.unit?.unit_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-3.5 w-3.5 text-primary" }),
									" Unit: ",
									ten.unit.unit_number
								]
							})]
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
						ten.status === "AWAITING_ACCEPTANCE" && currentLease && currentLease.status === "SENT_TO_TENANT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-yellow-500/20 bg-yellow-500/5 rounded-2xl space-y-5 animate-in fade-in duration-200",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-yellow-800 dark:text-yellow-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-bold text-base",
										children: "Lease Agreement Action Required"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-card p-4 rounded-xl border border-border/80 text-xs space-y-3 max-w-2xl leading-relaxed",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold text-foreground",
											children: [
												"Summary of Terms (Version ",
												currentLease.version,
												"):"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-2 sm:grid-cols-2 pt-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Start Date:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: new Date(currentLease.start_date).toLocaleDateString()
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "End Date:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: new Date(currentLease.end_date).toLocaleDateString()
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Notice Period:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-medium",
														children: [currentLease.terms?.noticePeriodDays || 30, " Days"]
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Occupancy Limit:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-medium",
														children: [currentLease.terms?.occupancyLimit || 2, " Occupant(s)"]
													})
												] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-border/40 my-2 pt-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block font-bold mb-1",
											children: "Utilities responsibility:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: currentLease.terms?.utilitiesResponsibility || "Tenant responsibility."
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block font-bold mb-1",
											children: "Pets Policy:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: currentLease.terms?.petsPolicy || "No pets permitted without landlord approval."
										})] }),
										currentLease.terms?.otherRules && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground block font-bold mb-1",
											children: "Other Rules & Guidelines:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: currentLease.terms.otherRules
										})] })
									]
								}),
								!showDeclineForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedButton, {
										onClick: () => handleAcceptLease(currentLease.id),
										loading: signing,
										variant: "primary",
										className: "text-xs font-semibold py-2 px-4 rounded-lg",
										children: "Digitally Sign & Accept Lease"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowDeclineForm(true),
										className: "btn btn-secondary text-xs border-destructive/20 text-destructive hover:bg-destructive/5",
										children: "Request Corrections"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-3 border-t border-border/60 max-w-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "label text-xs",
										children: "Reason for decline / Needed corrections"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 3,
										className: "textarea text-xs",
										value: correctionNote,
										onChange: (e) => setCorrectionNote(e.target.value),
										placeholder: "Detail which terms, dates, or rent details need to be corrected..."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedButton, {
											onClick: () => handleDeclineLease(currentLease.id),
											loading: declining,
											variant: "danger",
											className: "text-xs font-semibold py-2 px-4 rounded-lg",
											children: "Decline Terms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowDeclineForm(false),
											className: "btn btn-secondary text-xs",
											children: "Cancel"
										})]
									})]
								})
							]
						}),
						ten.status === "MOVE_IN_PENDING" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-primary/20 bg-primary/5 rounded-2xl space-y-4 animate-in fade-in duration-200",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-bold text-base",
										children: "Move-In Inspection & Sign-off"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-relaxed max-w-xl",
									children: "Please verify the property layout and check off items during your walkthrough inspection. Once confirmed, this signs off on the occupancy condition."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 pt-2 max-w-lg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												id: "keys",
												checked: keysReceived,
												onChange: (e) => setKeysReceived(e.target.checked),
												className: "rounded text-primary border-border focus:ring-primary h-4 w-4"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "keys",
												className: "text-xs font-semibold text-foreground select-none",
												children: "Received keys and access cards"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												id: "access",
												checked: accessConfirmed,
												onChange: (e) => setAccessConfirmed(e.target.checked),
												className: "rounded text-primary border-border focus:ring-primary h-4 w-4"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "access",
												className: "text-xs font-semibold text-foreground select-none",
												children: "Access to unit and common facilities verified"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												id: "condition",
												checked: conditionDocumented,
												onChange: (e) => setConditionDocumented(e.target.checked),
												className: "rounded text-primary border-border focus:ring-primary h-4 w-4"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "condition",
												className: "text-xs font-semibold text-foreground select-none",
												children: "Property condition is documented and inspected"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												id: "utility",
												checked: utilityInfoProvided,
												onChange: (e) => setUtilityInfoProvided(e.target.checked),
												className: "rounded text-primary border-border focus:ring-primary h-4 w-4"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "utility",
												className: "text-xs font-semibold text-foreground select-none",
												children: "Utility meters & local guide information provided"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 pt-3 max-w-xl",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "label text-xs",
											children: "Walkthrough Inspection Notes (Optional)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 2,
											className: "textarea text-xs",
											value: moveInNotes,
											onChange: (e) => setMoveInNotes(e.target.value),
											placeholder: "Note down any defects, damages, or requests..."
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
												children: [
													"Condition Evidence Photos / Logs (",
													moveInMedia.length,
													")"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-2.5",
												children: [moveInMedia.map((m, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 w-fit animate-in zoom-in-95",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["File ", idx + 1] })]
												}, idx)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "btn btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer",
													children: [
														uploadingMedia ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }),
														"Upload File",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "file",
															accept: "image/*,application/pdf",
															className: "hidden",
															onChange: handleMediaUpload
														})
													]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "pt-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedButton, {
												onClick: handleCompleteMoveIn,
												loading: completingMoveIn,
												variant: "primary",
												className: "text-xs font-semibold py-2 px-4 rounded-lg",
												children: "Confirm Occupancy & Sign Move-In"
											})
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold text-lg text-foreground",
								children: "Tenancy Parameters"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-6 sm:grid-cols-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
										children: "Property Provider"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "surface-card p-3.5 border border-border/40 rounded-xl space-y-1 bg-secondary/10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-foreground font-medium",
											children: ten.provider?.full_name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: ten.provider?.phone_number
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
										children: "Tenancy Period"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "surface-card p-3.5 border border-border/40 rounded-xl space-y-1 bg-secondary/10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Start Date:" }),
												" ",
												ten.start_date ? new Date(ten.start_date).toLocaleDateString() : "Not started"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "End Date:" }),
												" ",
												ten.end_date ? new Date(ten.end_date).toLocaleDateString() : "Ongoing / Open"
											]
										})]
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold text-base text-foreground",
								children: "Lease Agreement Files"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: leases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground italic",
									children: "No lease document generated yet."
								}) : leases.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
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
										className: "btn btn-secondary text-[10px] px-3 py-1.5 flex items-center gap-1.5 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-500" }), " View Contract"]
									})]
								}, l.id))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-base text-foreground",
							children: "Tenancy Timeline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative border-l-2 border-border/80 pl-5 ml-2.5 space-y-6 py-2",
							children: history.map((event, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatedCard, {
								className: "relative",
								delay: idx * .05,
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-5 border border-primary/20 bg-primary/5 rounded-2xl space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-display font-bold text-sm text-foreground",
								children: "Contact Landlord"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground leading-relaxed",
								children: "Connect inside the platform thread to coordinate inspection dates or ask rent questions."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/messages",
									className: "btn btn-primary text-xs w-full flex items-center justify-center gap-2 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" }), " Message Landlord"]
								})
							})
						]
					})]
				})]
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TenancyDetailsWrapper, {}) });
//#endregion
export { SplitComponent as component };
