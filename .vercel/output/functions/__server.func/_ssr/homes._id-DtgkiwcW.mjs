import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, M as MapPin, U as House, bt as Bed, k as MessageSquare, lt as CircleCheck, mt as Calendar, pt as Check, rt as Compass, s as TriangleAlert, st as CircleQuestionMark, t as X, v as ShieldCheck, wt as ArrowLeft, xt as Bath, y as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Route$15, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { s as reportListing } from "./trust.functions-CdhbrDzg.mjs";
import { a as requestViewing } from "./viewing.functions-B2DK8JiL.mjs";
import { l as getListing } from "./properties.functions-CKL-q0ta.mjs";
import { n as createConversation } from "./communication.functions-Cxkr_8rO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/homes._id-DtgkiwcW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PublicListingDetailComponent() {
	const { id: listingId } = Route$15.useParams();
	const [activeImage, setActiveImage] = (0, import_react.useState)(null);
	const { user } = useAuth();
	const navigate = useNavigate();
	const [showContactModal, setShowContactModal] = (0, import_react.useState)(false);
	const [contactMessage, setContactMessage] = (0, import_react.useState)("Hi, I am interested in this listing. Is it still available?");
	const [showViewingModal, setShowViewingModal] = (0, import_react.useState)(false);
	const [viewingDate, setViewingDate] = (0, import_react.useState)("");
	const [viewingTime, setViewingTime] = (0, import_react.useState)("");
	const [viewingNotes, setViewingNotes] = (0, import_react.useState)("");
	const contactMutation = useMutation({
		mutationFn: () => createConversation({
			listingId,
			initialMessage: contactMessage
		}),
		onSuccess: () => {
			toast.success("Enquiry sent successfully!");
			setShowContactModal(false);
			navigate({ to: "/messages" });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to start conversation.");
		}
	});
	const requestViewingMutation = useMutation({
		mutationFn: (vars) => requestViewing({
			listingId,
			requestedStart: vars.requestedStart,
			notes: vars.notes
		}),
		onSuccess: () => {
			toast.success("Viewing request submitted!");
			setShowViewingModal(false);
			setViewingDate("");
			setViewingTime("");
			setViewingNotes("");
			navigate({ to: "/viewings" });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to request viewing.");
		}
	});
	const [badgeExplanation, setBadgeExplanation] = (0, import_react.useState)(null);
	const [showReportModal, setShowReportModal] = (0, import_react.useState)(false);
	const [reportReason, setReportReason] = (0, import_react.useState)("WRONG_PRICE");
	const [reportDescription, setReportDescription] = (0, import_react.useState)("");
	import_react.useEffect(() => {
		if (typeof window !== "undefined" && user) {
			const action = new URLSearchParams(window.location.search).get("action");
			if (action === "contact") setShowContactModal(true);
			else if (action === "viewing") setShowViewingModal(true);
		}
	}, [user]);
	const { data: details, isLoading, error, refetch } = useQuery({
		queryKey: ["public-listing", listingId],
		queryFn: () => getListing(listingId)
	});
	const submitReportMutation = useMutation({
		mutationFn: () => reportListing({
			listingId,
			reason: reportReason,
			description: reportDescription || void 0
		}),
		onSuccess: () => {
			toast.success("Listing reported successfully. Our moderation team will review this asset.");
			setShowReportModal(false);
			setReportDescription("");
		},
		onError: (err) => {
			toast.error(err?.message || "Failed to submit report.");
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin mx-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground font-semibold",
				children: "Loading listing details..."
			})]
		})
	});
	if (error || !details) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-screen flex-col items-center justify-center bg-background p-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-12 w-12 text-destructive mb-3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-bold text-foreground",
				children: "Listing Unavailable"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-2 max-w-sm",
				children: "This listing may have been paused, archived, or does not exist."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "mt-6 inline-flex items-center gap-1.5 justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/95",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Return to Homepage"]
			})
		]
	});
	const { listing: rawListing, media } = details;
	const listing = rawListing;
	const prop = listing.properties;
	const unit = listing.units;
	const images = media.length > 0 ? media.map((m) => m.url) : [];
	const mainImage = activeImage || images[0] || null;
	const BADGE_INFO = {
		property: {
			title: "Verified Property",
			description: "HomeHunt has reviewed official ownership deeds or physical existence documents confirming this property asset exists at the specified coordinates.",
			notGuaranteed: "This does not represent a government construction guarantee or safety certification. Always perform physical inspection."
		},
		contact: {
			title: "Verified Contact",
			description: "The landlord, manager, or agent listing this property has completed legal identity verification with matching government-issued credentials.",
			notGuaranteed: "This does not guarantee that the landlord will act in accordance with tenancy laws or prevent contract disputes."
		},
		listing: {
			title: "Verified Listing",
			description: "This specific marketplace listing details (price, unit amenities, type) have been verified against active manager logs or checked by HomeHunt verifiers.",
			notGuaranteed: "Listing specifications can change. Always verify availability and rent terms with the landlord directly."
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Listings"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/trust",
						className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg hover:bg-secondary/80 transition-colors",
						children: "HomeHunt Trust Center"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6 space-y-8",
				children: [images.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-2 aspect-[16/10] bg-secondary/20 rounded-2xl overflow-hidden relative border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: mainImage,
							alt: listing.title,
							className: "w-full h-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 md:grid-cols-1 gap-3 max-h-[16/10] overflow-y-auto",
						children: images.map((url, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveImage(url),
							className: `aspect-[16/10] bg-secondary/35 rounded-xl overflow-hidden relative cursor-pointer border transition-all ${mainImage === url ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: url,
								alt: `Gallery ${i}`,
								className: "w-full h-full object-cover"
							})
						}, i))
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full aspect-[21/9] bg-secondary/15 rounded-2xl flex flex-col items-center justify-center border border-dashed text-muted-foreground/60 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-12 w-12 stroke-[1.2]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold uppercase tracking-wider",
						children: "No photos uploaded for this listing"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-8 md:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2 space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2 flex-wrap items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20",
												children: prop?.property_type || "APARTMENT"
											}),
											prop?.verification_status === "VERIFIED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setBadgeExplanation(BADGE_INFO.property),
												className: "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-verified/10 text-verified px-2.5 py-1 rounded border border-verified/20 cursor-pointer hover:bg-verified/15 transition-all",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }),
													" Property Verified",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-2.5 w-2.5 opacity-60" })
												]
											}),
											prop?.owner_identity_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setBadgeExplanation(BADGE_INFO.contact),
												className: "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-verified/10 text-verified px-2.5 py-1 rounded border border-verified/20 cursor-pointer hover:bg-verified/15 transition-all",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }),
													" Contact Verified",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-2.5 w-2.5 opacity-60" })
												]
											}),
											listing.verification_status === "VERIFIED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setBadgeExplanation(BADGE_INFO.listing),
												className: "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-verified/10 text-verified px-2.5 py-1 rounded border border-verified/20 cursor-pointer hover:bg-verified/15 transition-all",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }),
													" Listing Verified",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-2.5 w-2.5 opacity-60" })
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display font-extrabold text-2xl sm:text-3xl text-foreground leading-tight",
										children: listing.title
									}),
									prop && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-semibold text-muted-foreground flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary shrink-0" }),
											prop.town,
											", ",
											prop.county,
											prop.neighborhood ? ` — ${prop.neighborhood}` : "",
											prop.estate ? ` (${prop.estate})` : ""
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-4 border-y border-border/80 py-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-2 bg-secondary rounded-lg text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bed, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wide",
											children: "Bedrooms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold text-foreground text-sm",
											children: [unit?.bedrooms ?? 0, " Beds"]
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-2 bg-secondary rounded-lg text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bath, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wide",
											children: "Bathrooms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold text-foreground text-sm",
											children: [unit?.bathrooms ?? 0, " Baths"]
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-2 bg-secondary rounded-lg text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wide",
											children: "Floor Level"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground text-sm",
											children: unit?.floor !== null && unit?.floor !== void 0 ? `Floor ${unit.floor}` : "Ground"
										})] })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-secondary/40 border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4.5 w-4.5 text-verified" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listing.freshness_status === "CURRENT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "Availability confirmed recently" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "Availability requires confirmation" }) })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-right",
									children: listing.last_verified_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Last confirmed: ", new Date(listing.last_verified_at).toLocaleDateString()] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Last confirmed: Unknown" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-bold text-lg text-foreground",
									children: "Listing Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-line",
									children: listing.description || "No description provided for this listing."
								})]
							}),
							prop?.landmark_description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-secondary/40 border border-border/60 p-4 rounded-xl space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs font-bold uppercase tracking-wider text-foreground",
									children: "Landmarks & Navigation instructions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground leading-relaxed",
									children: prop.landmark_description
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 pt-4 border-t border-border/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-bold text-lg text-foreground",
									children: "Shared Amenities"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-3 grid-cols-2 sm:grid-cols-3",
									children: prop?.amenity_list && prop.amenity_list.length > 0 ? prop.amenity_list.map((am) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4.5 w-4.5 text-verified" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: am.replace("_", " ") })]
									}, am)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "col-span-3 text-xs text-muted-foreground italic",
										children: "No amenities specified for this listing."
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 rounded-xl space-y-2 text-xs leading-normal",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "font-bold flex items-center gap-1.5 text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-yellow-600" }), " Financial Safety Advisory"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Never send money before physical viewing." }), " Be extremely cautious of requests for \"booking fees\" or deposits prior to inspecting the property. HomeHunt does not facilitate or guarantee transactions."] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 border border-border shadow-md sticky top-24 space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
											children: "Rent Price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-display font-extrabold text-3xl text-primary leading-none",
											children: [
												listing.currency,
												" ",
												Number(listing.price).toLocaleString(),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
													children: [
														" ",
														"/ ",
														listing.billing_period.toLowerCase()
													]
												})
											]
										}),
										listing.deposit_amount !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground font-semibold pt-1",
											children: [
												"Deposit requirement: ",
												listing.currency,
												" ",
												Number(listing.deposit_amount).toLocaleString()
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-t border-border/80 pt-4 space-y-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground font-semibold flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-primary" }), " Move-in Date"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-foreground",
											children: new Date(listing.availability_date).toLocaleDateString()
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-secondary/30 rounded-xl border border-border text-[10px] text-muted-foreground leading-relaxed",
									children: [
										"If the owner redirects you to ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "WhatsApp" }),
										", verify their identity and do not make payments before viewing the location."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 pt-2",
									children: [prop?.owner_user_id === user?.userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-center p-3 bg-secondary/50 rounded-xl border text-xs font-semibold text-muted-foreground",
										children: "This is your listing"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											if (!user) {
												toast.error("Please sign in to contact the provider.");
												navigate({ to: "/login" });
												return;
											}
											setShowContactModal(true);
										},
										className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" }), " Contact Provider"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											if (!user) {
												toast.error("Please sign in to request a viewing.");
												navigate({ to: "/login" });
												return;
											}
											setShowViewingModal(true);
										},
										className: "w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border text-foreground bg-secondary/15 hover:bg-secondary/40 py-2.5 text-xs font-bold cursor-pointer transition-all",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }), " Request viewing"]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											if (!user) {
												toast.error("Please sign in to report a listing.");
												navigate({ to: "/login" });
												return;
											}
											setShowReportModal(true);
										},
										className: "w-full inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 py-2 text-xs font-bold cursor-pointer transition-all",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4" }), " Report this listing"]
									})]
								})
							]
						})
					})]
				})]
			}),
			badgeExplanation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setBadgeExplanation(null),
							className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-primary font-display font-bold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" }),
								" ",
								badgeExplanation.title
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground leading-relaxed",
							children: badgeExplanation.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 bg-secondary/50 rounded-xl text-[10px] text-muted-foreground leading-normal border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "What this does not guarantee:" }),
								" ",
								badgeExplanation.notGuaranteed
							]
						})
					]
				})
			}),
			showReportModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowReportModal(false),
							className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display font-extrabold text-lg text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-5 w-5 text-destructive" }), " Report Suspicious Listing"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Help us keep HomeHunt trustworthy. Please select a reason for reporting this listing:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								submitReportMutation.mutate();
							},
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
									children: "Reason for report"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: reportReason,
									onChange: (e) => setReportReason(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "WRONG_PRICE",
											children: "Wrong price displayed"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "PROPERTY_UNAVAILABLE",
											children: "Property is no longer available"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "FAKE_LISTING",
											children: "Fake listing / Scam offer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "WRONG_LOCATION",
											children: "Incorrect geographic location"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "MISLEADING_PHOTOS",
											children: "Misleading property photos"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "DUPLICATE_LISTING",
											children: "Duplicate listing"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "SUSPICIOUS_PAYMENT_REQUEST",
											children: "Suspicious advance payment requested"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "IMPERSONATION",
											children: "Impersonating landlord/agent"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "OTHER",
											children: "Other listing issues"
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
									children: "Details / Explanation"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 4,
									required: true,
									placeholder: "Provide details about the issue to assist our moderation team...",
									value: reportDescription,
									onChange: (e) => setReportDescription(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 justify-end pt-2 border-t",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: submitReportMutation.isPending,
										className: "px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5",
										children: [submitReportMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), "Submit Report"]
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
			}),
			showContactModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowContactModal(false),
							className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display font-extrabold text-lg text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-5 w-5 text-primary" }), " Contact Property Provider"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Start a secure conversation about this listing. You can send an enquiry or ask specific questions."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								contactMutation.mutate();
							},
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
									children: "Your Message"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 4,
									required: true,
									value: contactMessage,
									onChange: (e) => setContactMessage(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1.5 overflow-x-auto pb-1",
									children: [
										"Is this property still available?",
										"Can I schedule a viewing?",
										"Are pets allowed?"
									].map((temp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setContactMessage(`Hi, I'm interested in this listing. ${temp}`),
										className: "text-[10px] bg-secondary border border-border px-2 py-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer whitespace-nowrap",
										children: temp
									}, temp))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 justify-end pt-2 border-t",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: contactMutation.isPending,
										className: "px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5",
										children: [contactMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Send Enquiry"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowContactModal(false),
										className: "px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer",
										children: "Cancel"
									})]
								})
							]
						})
					]
				})
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
							className: "font-display font-extrabold text-lg text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5 text-primary" }), " Request Viewing Appointment"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Propose a physical appointment date and time to view the property."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								if (!viewingDate || !viewingTime) {
									toast.error("Please pick a date and time.");
									return;
								}
								const startIso = (/* @__PURE__ */ new Date(`${viewingDate}T${viewingTime}`)).toISOString();
								requestViewingMutation.mutate({
									requestedStart: startIso,
									notes: viewingNotes
								});
							},
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
										children: "Date"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										required: true,
										value: viewingDate,
										onChange: (e) => setViewingDate(e.target.value),
										className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1",
										children: "Time"
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
									children: "Notes / Location Instructions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									placeholder: "e.g. I will be arriving by public transport, please let me know which gate.",
									value: viewingNotes,
									onChange: (e) => setViewingNotes(e.target.value),
									className: "w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 rounded-xl text-[10px] leading-normal flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Financial Safety:" }), " Never pay reservation fees before physically viewing the location and verifying details."] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 justify-end pt-2 border-t",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: requestViewingMutation.isPending,
										className: "px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5",
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
			})
		]
	});
}
//#endregion
export { PublicListingDetailComponent as component };
