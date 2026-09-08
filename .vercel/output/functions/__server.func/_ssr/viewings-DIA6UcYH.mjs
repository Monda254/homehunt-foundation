import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, M as MapPin, f as Star, it as Clock, k as MessageSquare, lt as CircleCheck, mt as Calendar, r as User, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as RequireAuth, x as useAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { i as getViewings, n as confirmViewing, o as submitViewingFeedback, r as declineViewing, t as cancelViewing } from "./viewing.functions-CNZJa548.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/viewings-DIA6UcYH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ViewingsComponent() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = (0, import_react.useState)("UPCOMING");
	const [showFeedbackModal, setShowFeedbackModal] = (0, import_react.useState)(false);
	const [selectedViewingId, setSelectedViewingId] = (0, import_react.useState)(null);
	const [feedbackType, setFeedbackType] = (0, import_react.useState)("INTERESTED");
	const [feedbackNotes, setFeedbackNotes] = (0, import_react.useState)("");
	const [matchRating, setMatchRating] = (0, import_react.useState)(5);
	const [showCancelModal, setShowCancelModal] = (0, import_react.useState)(false);
	const [cancelReason, setCancelReason] = (0, import_react.useState)("");
	const { data: viewingsList, isLoading, refetch } = useQuery({
		queryKey: ["viewings-list"],
		queryFn: async () => await getViewings()
	});
	const confirmMutation = useMutation({
		mutationFn: (id) => confirmViewing(id),
		onSuccess: () => {
			toast.success("Viewing appointment confirmed!");
			refetch();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to confirm viewing.");
		}
	});
	const declineMutation = useMutation({
		mutationFn: (vars) => declineViewing({
			viewingId: vars.id,
			notes: vars.notes
		}),
		onSuccess: () => {
			toast.success("Viewing declined.");
			refetch();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to decline viewing.");
		}
	});
	const cancelMutation = useMutation({
		mutationFn: (vars) => cancelViewing({
			viewingId: vars.id,
			reason: vars.reason
		}),
		onSuccess: () => {
			toast.success("Viewing cancelled.");
			setShowCancelModal(false);
			setCancelReason("");
			setSelectedViewingId(null);
			refetch();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to cancel viewing.");
		}
	});
	const feedbackMutation = useMutation({
		mutationFn: (vars) => submitViewingFeedback({
			viewingId: vars.id,
			feedbackType: vars.type,
			matchRating: vars.rating,
			notes: vars.notes
		}),
		onSuccess: () => {
			toast.success("Thank you! Feedback recorded successfully.");
			setShowFeedbackModal(false);
			setFeedbackNotes("");
			setMatchRating(5);
			setSelectedViewingId(null);
			refetch();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to submit feedback.");
		}
	});
	const filteredViewings = (viewingsList || []).filter((view) => {
		const isPast = new Date(view.requested_start).getTime() < Date.now();
		const status = view.status;
		if (activeTab === "CANCELLED") return status === "CANCELLED" || status === "DECLINED";
		if (activeTab === "PENDING") return status === "REQUESTED" || status === "PENDING" || status === "RESCHEDULE_REQUESTED";
		if (activeTab === "PAST") return isPast || status === "COMPLETED" || status === "NO_SHOW";
		return !isPast && status === "CONFIRMED";
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "Viewings Schedule"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Coordinate physical viewing schedules and log feedback outcomes."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 border-b border-border pb-px",
					children: [
						{
							id: "UPCOMING",
							label: "Upcoming Confirmed"
						},
						{
							id: "PENDING",
							label: "Pending Requests"
						},
						{
							id: "PAST",
							label: "Past Viewings"
						},
						{
							id: "CANCELLED",
							label: "Cancelled / Declined"
						}
					].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab(tab.id),
						className: `text-xs font-bold uppercase tracking-wider pb-3 px-1 border-b-2 transition-all cursor-pointer ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: tab.label
					}, tab.id))
				}),
				isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex py-12 justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" })
				}) : filteredViewings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-12 text-center max-w-md mx-auto shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-10 w-10 text-muted-foreground/40 mx-auto mb-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-bold text-foreground",
							children: "No appointments found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1 leading-normal",
							children: "You have no appointments registered under this category."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: filteredViewings.map((view) => {
						const partner = view.seeker_id === user?.userId ? view.provider : view.seeker;
						const roleText = view.seeker_id === user?.userId ? "Provider" : "Seeker";
						const isPast = new Date(view.requested_start).getTime() < Date.now();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-5 border border-border shadow-sm flex flex-col justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold uppercase tracking-wider text-primary",
												children: view.listings?.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
												className: "font-display font-semibold text-sm text-foreground flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary shrink-0" }),
													view.properties?.town,
													", ",
													view.properties?.county
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${view.status === "CONFIRMED" ? "bg-verified/10 border-verified/25 text-verified" : view.status === "REQUESTED" || view.status === "RESCHEDULE_REQUESTED" ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-600" : "bg-secondary/60 border-border text-muted-foreground"}`,
											children: view.status.replace("_", " ")
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground pt-1.5 border-t border-border/60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(view.requested_start).toLocaleDateString([], {
												weekday: "short",
												month: "short",
												day: "numeric"
											}) })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												new Date(view.requested_start).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit"
												}),
												" ",
												"(EAT)"
											] })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 p-2.5 bg-secondary/35 rounded-xl border text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-muted-foreground font-semibold text-[10px] uppercase tracking-wider leading-none mb-0.5",
												children: roleText
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-foreground truncate",
												children: partner?.full_name || "Anonymous User"
											})]
										})]
									}),
									view.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground leading-normal bg-secondary/20 p-2.5 rounded-lg border border-dashed",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Notes:" }),
											" ",
											view.notes
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 pt-3 border-t border-border/60 justify-end",
								children: [
									view.status === "REQUESTED" && view.provider_id === user?.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => confirmMutation.mutate(view.id),
										className: "px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg cursor-pointer",
										children: "Confirm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => declineMutation.mutate({ id: view.id }),
										className: "px-3 py-1.5 border border-border text-foreground hover:bg-secondary text-xs font-bold rounded-lg cursor-pointer",
										children: "Decline"
									})] }),
									view.status === "CONFIRMED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setSelectedViewingId(view.id);
											setShowCancelModal(true);
										},
										className: "px-3 py-1.5 border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 text-xs font-bold rounded-lg cursor-pointer",
										children: "Cancel Appointment"
									}),
									isPast && view.status === "CONFIRMED" && view.seeker_id === user?.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setSelectedViewingId(view.id);
											setShowFeedbackModal(true);
										},
										className: "px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1",
										children: "Leave Feedback"
									}),
									view.conversation_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/messages",
										className: "inline-flex items-center justify-center p-2 border hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg cursor-pointer",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" })
									})
								]
							})]
						}, view.id);
					})
				})
			]
		}),
		showCancelModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							setShowCancelModal(false);
							setSelectedViewingId(null);
						},
						className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-extrabold text-base text-foreground",
						children: "Cancel Viewing Appointment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
							children: "Reason for cancellation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 3,
							required: true,
							placeholder: "e.g. Schedule conflict arose, property not available...",
							value: cancelReason,
							onChange: (e) => setCancelReason(e.target.value),
							className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 justify-end pt-2 border-t",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => cancelMutation.mutate({
									id: selectedViewingId,
									reason: cancelReason
								}),
								disabled: !cancelReason.trim() || cancelMutation.isPending,
								className: "px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer disabled:opacity-50",
								children: "Cancel Viewing"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setShowCancelModal(false);
									setSelectedViewingId(null);
								},
								className: "px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer",
								children: "Close"
							})]
						})]
					})
				]
			})
		}),
		showFeedbackModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							setShowFeedbackModal(false);
							setSelectedViewingId(null);
						},
						className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-extrabold text-base text-foreground flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-primary" }), " How was the viewing?"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
								children: "Viewing Outcome"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: feedbackType,
								onChange: (e) => setFeedbackType(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "INTERESTED",
										children: "I am interested in leasing this unit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "NEEDS_FOLLOW_UP",
										children: "I have open questions / needs follow up"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "NOT_INTERESTED",
										children: "Not interested (Unsuited parameters)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "NOT_AS_DESCRIBED",
										children: "Property did not match listing details"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "PROPERTY_UNAVAILABLE",
										children: "Property was already locked/unavailable"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
								children: "Listing Accuracy Rating"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1",
								children: [
									1,
									2,
									3,
									4,
									5
								].map((star) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setMatchRating(star),
									className: "cursor-pointer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-6 w-6 transition-all ${star <= matchRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}` })
								}, star))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
								children: "Additional Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								placeholder: "Tell us what you liked or why this didn't suit your search...",
								value: feedbackNotes,
								onChange: (e) => setFeedbackNotes(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 bg-secondary/50 rounded-xl text-[10px] text-muted-foreground border leading-normal",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Matching update:" }), " Rejections will automatically refine your intelligent property recommendation weights in subsequent searches."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 justify-end pt-2 border-t",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => feedbackMutation.mutate({
										id: selectedViewingId,
										type: feedbackType,
										rating: matchRating,
										notes: feedbackNotes
									}),
									disabled: feedbackMutation.isPending,
									className: "px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50",
									children: "Submit Feedback"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setShowFeedbackModal(false);
										setSelectedViewingId(null);
									},
									className: "px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer",
									children: "Close"
								})]
							})
						]
					})
				]
			})
		})
	] });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewingsComponent, {}) });
//#endregion
export { SplitComponent as component };
