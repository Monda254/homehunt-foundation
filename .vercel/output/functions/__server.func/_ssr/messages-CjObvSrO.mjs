import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { H as Info, I as LoaderCircle, et as EllipsisVertical, g as Slash, ht as CalendarDays, k as MessageSquare, lt as CircleCheck, mt as Calendar, pt as Check, s as TriangleAlert, t as X, x as Send, y as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as RequireAuth, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { a as requestViewing, i as getViewings, n as confirmViewing, r as declineViewing } from "./viewing.functions-B2DK8JiL.mjs";
import { a as getMessages, i as getConversations, o as reportUser, r as getConversationDetails, s as sendMessage, t as blockUser } from "./communication.functions-Cxkr_8rO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/messages-CjObvSrO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MessagesComponent() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [activeConvId, setActiveConvId] = (0, import_react.useState)(null);
	const [inputText, setInputText] = (0, import_react.useState)("");
	const [filterStatus, setFilterStatus] = (0, import_react.useState)("ACTIVE");
	const [showViewingModal, setShowViewingModal] = (0, import_react.useState)(false);
	const [viewingDate, setViewingDate] = (0, import_react.useState)("");
	const [viewingTime, setViewingTime] = (0, import_react.useState)("");
	const [viewingNotes, setViewingNotes] = (0, import_react.useState)("");
	const [showReportModal, setShowReportModal] = (0, import_react.useState)(false);
	const [reportReason, setReportReason] = (0, import_react.useState)("HARASSMENT");
	const [reportDesc, setReportDesc] = (0, import_react.useState)("");
	const [showActionDropdown, setShowActionDropdown] = (0, import_react.useState)(false);
	const messagesEndRef = (0, import_react.useRef)(null);
	const { data: conversationsData, isLoading: isLoadingConvs, refetch: refetchConvs } = useQuery({
		queryKey: ["conversations", filterStatus],
		queryFn: async () => await getConversations({ status: filterStatus })
	});
	const { data: convDetails, isLoading: isLoadingDetails } = useQuery({
		queryKey: ["conversation-details", activeConvId],
		queryFn: async () => await getConversationDetails(activeConvId),
		enabled: !!activeConvId
	});
	const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery({
		queryKey: ["messages", activeConvId],
		queryFn: async () => await getMessages({ conversationId: activeConvId }),
		enabled: !!activeConvId,
		refetchInterval: 5e3
	});
	(0, import_react.useEffect)(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messagesData?.items]);
	const sendMessageMutation = useMutation({
		mutationFn: (vars) => sendMessage({
			conversationId: activeConvId,
			content: vars.content,
			messageType: vars.messageType || "TEXT"
		}),
		onSuccess: () => {
			setInputText("");
			refetchMessages();
			refetchConvs();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to send message.");
		}
	});
	const blockMutation = useMutation({
		mutationFn: () => {
			const details = convDetails;
			const targetId = details?.seeker_id === user?.userId ? details?.provider_id : details?.seeker_id;
			if (!targetId) return Promise.reject(/* @__PURE__ */ new Error("Target user ID not found"));
			return blockUser(targetId);
		},
		onSuccess: () => {
			toast.success("User blocked successfully.");
			setActiveConvId(null);
			refetchConvs();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to block user.");
		}
	});
	const reportMutation = useMutation({
		mutationFn: () => {
			const details = convDetails;
			const targetId = details?.seeker_id === user?.userId ? details?.provider_id : details?.seeker_id;
			if (!targetId) return Promise.reject(/* @__PURE__ */ new Error("Target user ID not found"));
			return reportUser({
				reportedId: targetId,
				conversationId: activeConvId || void 0,
				reason: reportReason,
				description: reportDesc
			});
		},
		onSuccess: () => {
			toast.success("Abuse report submitted. Our moderators will review this interaction.");
			setShowReportModal(false);
			setReportDesc("");
		},
		onError: (err) => {
			toast.error(err.message || "Failed to submit report.");
		}
	});
	const requestViewingMutation = useMutation({
		mutationFn: (vars) => {
			const details = convDetails;
			if (!details?.listing_id) return Promise.reject(/* @__PURE__ */ new Error("No active listing found"));
			return requestViewing({
				listingId: details.listing_id,
				unitId: details.unit_id || void 0,
				requestedStart: vars.requestedStart,
				notes: vars.notes
			});
		},
		onSuccess: () => {
			toast.success("Viewing requested successfully.");
			setShowViewingModal(false);
			setViewingDate("");
			setViewingTime("");
			setViewingNotes("");
			refetchMessages();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to request viewing.");
		}
	});
	const confirmViewingMutation = useMutation({
		mutationFn: (viewingId) => confirmViewing(viewingId),
		onSuccess: () => {
			toast.success("Viewing confirmed successfully.");
			refetchMessages();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to confirm viewing.");
		}
	});
	const declineViewingMutation = useMutation({
		mutationFn: (vars) => declineViewing({
			viewingId: vars.viewingId,
			notes: vars.notes
		}),
		onSuccess: () => {
			toast.success("Viewing declined.");
			refetchMessages();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to decline viewing.");
		}
	});
	const handleSendText = (text) => {
		if (!text.trim()) return;
		sendMessageMutation.mutate({
			content: text,
			messageType: "TEXT"
		});
	};
	const handleRequestViewingSubmit = (e) => {
		e.preventDefault();
		if (!viewingDate || !viewingTime) {
			toast.error("Please specify both date and time.");
			return;
		}
		const requestedStart = (/* @__PURE__ */ new Date(`${viewingDate}T${viewingTime}`)).toISOString();
		requestViewingMutation.mutate({
			requestedStart,
			notes: viewingNotes
		});
	};
	const getOtherParticipant = (conv) => {
		if (!conv) return null;
		return conv.seeker_id === user?.userId ? conv.provider : conv.seeker;
	};
	const conversations = conversationsData?.items || [];
	const messages = messagesData?.items || [];
	const otherUser = getOtherParticipant(convDetails);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-[calc(100vh-10rem)] border border-border rounded-2xl overflow-hidden flex bg-card shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-80 border-r border-border flex flex-col bg-secondary/15 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-lg font-bold text-foreground",
						children: "Inboxes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1.5 overflow-x-auto pb-1",
						children: [
							"ACTIVE",
							"BLOCKED",
							"ARCHIVED"
						].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setFilterStatus(status);
								setActiveConvId(null);
							},
							className: `text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border transition-all cursor-pointer ${filterStatus === status ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground hover:text-foreground"}`,
							children: status
						}, status))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto divide-y divide-border/60",
					children: isLoadingConvs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin mx-auto text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground mt-2 block",
							children: "Loading threads..."
						})]
					}) : conversations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6 text-center space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-8 w-8 text-muted-foreground/50 mx-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground leading-normal",
							children: [
								"No ",
								filterStatus.toLowerCase(),
								" conversations yet. Discover listings and contact landlords or agents to start."
							]
						})]
					}) : conversations.map((conv) => {
						const partner = getOtherParticipant(conv);
						const active = activeConvId === conv.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setActiveConvId(conv.id),
							className: `w-full p-4 text-left transition-all hover:bg-secondary/40 flex flex-col gap-1 cursor-pointer ${active ? "bg-secondary/65 border-l-2 border-primary" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-start w-full",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-sm text-foreground truncate",
										children: partner?.full_name || "Anonymous User"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground whitespace-nowrap",
										children: new Date(conv.updated_at).toLocaleDateString()
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-primary font-bold truncate",
									children: conv.listings?.title || "Property Listing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground truncate leading-normal mt-0.5",
									children: conv.latestMessage?.content || "No messages yet."
								})
							]
						}, conv.id);
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 flex flex-col bg-background relative",
				children: !activeConvId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 flex flex-col items-center justify-center text-center p-8 bg-secondary/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-10 w-10 text-muted-foreground/40 mb-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-base text-foreground",
							children: "Select a thread"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1 max-w-xs",
							children: "Pick a conversation from the sidebar list to view property details, contact records, and send messages."
						})
					]
				}) : isLoadingDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 border-b border-border flex items-center justify-between bg-card shadow-sm z-10 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-sm text-foreground",
									children: otherUser?.full_name || "Landlord/Seeker"
								}), otherUser?.identity_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-0.5 text-[9px] font-bold bg-verified/10 text-verified px-1.5 py-0.5 rounded border border-verified/25",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-2.5 w-2.5" }), " ID Verified"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [
									"Context:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-primary",
										children: convDetails?.listings?.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-border",
										children: "|"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										convDetails?.listings?.currency,
										" ",
										Number(convDetails?.listings?.price).toLocaleString()
									] })
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowActionDropdown(!showActionDropdown),
								className: "p-2 hover:bg-secondary rounded-lg border text-muted-foreground hover:text-foreground cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4" })
							}), showActionDropdown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in duration-100",
								children: [
									convDetails?.seeker_id === user?.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											setShowViewingModal(true);
											setShowActionDropdown(false);
										},
										className: "w-full text-left px-4 py-2 hover:bg-secondary text-xs font-semibold flex items-center gap-2 text-foreground cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-primary" }), " Request Viewing"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											blockMutation.mutate();
											setShowActionDropdown(false);
										},
										className: "w-full text-left px-4 py-2 hover:bg-secondary text-xs font-semibold flex items-center gap-2 text-destructive cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slash, { className: "h-4 w-4" }), " Block User"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											setShowReportModal(true);
											setShowActionDropdown(false);
										},
										className: "w-full text-left px-4 py-2 hover:bg-secondary text-xs font-semibold flex items-center gap-2 text-destructive cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4" }), " Report Interaction"]
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5",
						children: [isLoadingMessages ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center py-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" })
						}) : messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center py-12 text-xs text-muted-foreground italic",
							children: "Start of secure discussion thread."
						}) : messages.map((msg) => {
							const isSelf = msg.sender_id === user?.userId;
							if (msg.message_type === "VIEWING_REQUEST") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-center w-full my-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-card border border-border rounded-2xl p-4 max-w-sm w-full shadow-sm space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-primary font-display font-bold text-xs uppercase tracking-wider",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4.5 w-4.5" }), " Viewing Requested"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground leading-normal",
											children: msg.content
										}),
										!isSelf && convDetails?.provider_id === user?.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2 pt-1 border-t border-border/60",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													toast.promise((async () => {
														const pendingForConv = (await queryClient.fetchQuery({
															queryKey: ["viewings-list"],
															queryFn: async () => await getViewings()
														}) || []).filter((v) => v.conversation_id === activeConvId && v.status === "REQUESTED");
														if (pendingForConv && pendingForConv.length > 0) await confirmViewingMutation.mutateAsync(pendingForConv[0].id);
														else throw new Error("No pending request found.");
													})(), {
														loading: "Confirming appointment...",
														success: "Viewing confirmed!",
														error: (err) => err.message
													});
												},
												className: "flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all",
												children: "Accept"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													toast.promise((async () => {
														const pendingForConv = (await queryClient.fetchQuery({
															queryKey: ["viewings-list"],
															queryFn: async () => await getViewings()
														}) || []).filter((v) => v.conversation_id === activeConvId && v.status === "REQUESTED");
														if (pendingForConv && pendingForConv.length > 0) await declineViewingMutation.mutateAsync({ viewingId: pendingForConv[0].id });
														else throw new Error("No pending request found.");
													})(), {
														loading: "Declining request...",
														success: "Viewing declined.",
														error: (err) => err.message
													});
												},
												className: "flex-1 border border-border text-foreground hover:bg-secondary text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all",
												children: "Decline"
											})]
										})
									]
								})
							}, msg.id);
							if (msg.message_type === "VIEWING_CONFIRMATION") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-center w-full my-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-verified/5 border border-verified/25 rounded-2xl p-4 max-w-sm w-full shadow-sm text-center space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-6 w-6 text-verified mx-auto" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-display font-bold text-xs text-foreground uppercase tracking-wider",
											children: "Appointment Confirmed"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground leading-normal",
											children: msg.content
										})
									]
								})
							}, msg.id);
							if (msg.message_type === "VIEWING_CANCELLATION") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-center w-full my-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-destructive/5 border border-destructive/20 rounded-2xl p-4 max-w-sm w-full shadow-sm text-center space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slash, { className: "h-6 w-6 text-destructive mx-auto" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-display font-bold text-xs text-destructive uppercase tracking-wider",
											children: "Viewing Cancelled"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground leading-normal",
											children: msg.content
										})
									]
								})
							}, msg.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `flex w-full ${isSelf ? "justify-end" : "justify-start"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${isSelf ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: msg.content }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[9px] block text-right mt-1 opacity-70 ${isSelf ? "text-primary-foreground" : "text-muted-foreground"}`,
										children: new Date(msg.created_at).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit"
										})
									})]
								})
							}, msg.id);
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: messagesEndRef })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 border-t border-border space-y-3 bg-card shrink-0",
						children: [convDetails?.status === "ACTIVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin",
							children: [
								"Is this property still available?",
								"Can I schedule a viewing?",
								"Are pets allowed?",
								"Is parking available?"
							].map((temp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleSendText(temp),
								className: "text-[10px] font-semibold bg-secondary hover:bg-secondary/80 border text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors",
								children: temp
							}, temp))
						}), convDetails?.status !== "ACTIVE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 p-3 bg-secondary/50 border border-border/80 rounded-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4.5 w-4.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"This conversation is currently ",
									convDetails?.status.toLowerCase(),
									". You cannot send messages here."
								]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								handleSendText(inputText);
							},
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "Type a secure message...",
								value: inputText,
								onChange: (e) => setInputText(e.target.value),
								className: "flex-1 px-4 py-2.5 bg-secondary/35 rounded-xl border border-border text-xs focus:outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: !inputText.trim() || sendMessageMutation.isPending,
								className: "h-10 w-10 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center rounded-xl shadow cursor-pointer disabled:opacity-50 transition-all",
								children: sendMessageMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
							})]
						})]
					})
				] })
			})]
		}),
		showViewingModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setShowViewingModal(false),
						className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-extrabold text-base text-foreground flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5 text-primary" }), " Request Viewing Appointment"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleRequestViewingSubmit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
									children: "Preferred Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									required: true,
									value: viewingDate,
									onChange: (e) => setViewingDate(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
									children: "Preferred Time"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "time",
									required: true,
									value: viewingTime,
									onChange: (e) => setViewingTime(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
								children: "Optional notes for landlord"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								placeholder: "e.g. Could we meet at the property entrance?",
								value: viewingNotes,
								onChange: (e) => setViewingNotes(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 rounded-xl text-[10px] leading-normal flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Safety check:" }), " Viewings should always be physical. Do not send deposits or reserve fees prior to viewing."] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 justify-end pt-2 border-t",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: requestViewingMutation.isPending,
									className: "px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50 flex items-center gap-1",
									children: [requestViewingMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Submit Request"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowViewingModal(false),
									className: "px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer",
									children: "Cancel"
								})]
							})
						]
					})
				]
			})
		}),
		showReportModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setShowReportModal(false),
						className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-extrabold text-base text-foreground flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-5 w-5 text-destructive" }), " Report Suspicious Behavior"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							reportMutation.mutate();
						},
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
								children: "Reason for reporting"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: reportReason,
								onChange: (e) => setReportReason(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "HARASSMENT",
										children: "Harassment or abusive language"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "SPAM",
										children: "Spam / Repeated advertisements"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "SCAM",
										children: "Scam / Advance deposit requests"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "INAPPROPRIATE",
										children: "Inappropriate or illicit content"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "MISLEADING",
										children: "Misleading information"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "OTHER",
										children: "Other reasons"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
								children: "Provide Details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 4,
								required: true,
								placeholder: "Describe details of the issue so our verification team can review...",
								value: reportDesc,
								onChange: (e) => setReportDesc(e.target.value),
								className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 justify-end pt-2 border-t",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: reportMutation.isPending,
									className: "px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer disabled:opacity-50",
									children: "Submit Report"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowReportModal(false),
									className: "px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer",
									children: "Cancel"
								})]
							})
						]
					})
				]
			})
		})
	] });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesComponent, {}) });
//#endregion
export { SplitComponent as component };
