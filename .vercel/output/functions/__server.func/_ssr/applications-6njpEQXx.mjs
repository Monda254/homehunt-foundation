import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-Blvxy4_Y.mjs";
import { E as Plus, H as Info, I as LoaderCircle, M as MapPin, Y as FolderKanban, Z as FileText, _t as Briefcase, dt as ChevronRight, l as Trash2, n as Users, o as Upload, r as User, ut as CircleAlert, v as ShieldCheck } from "../_libs/lucide-react.mjs";
import { r as AnimatePresence, t as motion } from "../_libs/framer-motion+[...].mjs";
import { d as Route$36, t as RequireAuth, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
import { n as EMPLOYMENT_STATUSES, r as INCOME_RANGES } from "./applications.types-D4vWVnj3.mjs";
import { d as updateApplicationDraft, f as withdrawApplication, i as listApplicantApplications, t as createApplicationDraft, u as submitApplication } from "./applications.functions-U6iYTQoi.mjs";
import { i as getViewings } from "./viewing.functions-B2DK8JiL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications-6njpEQXx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ApplicationsComponent() {
	const { user } = useAuth();
	useNavigate();
	const initialListingId = Route$36.useSearch().listingId || "";
	const [applications, setApplications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [viewings, setViewings] = (0, import_react.useState)([]);
	const [isCreating, setIsCreating] = (0, import_react.useState)(!!initialListingId);
	const [wizardStep, setWizardStep] = (0, import_react.useState)(1);
	const [selectedListing, setSelectedListing] = (0, import_react.useState)(null);
	const [listingRequirements, setListingRequirements] = (0, import_react.useState)([]);
	const [personalInfo, setPersonalInfo] = (0, import_react.useState)({
		fullName: user?.fullName || "",
		phoneNumber: user?.phoneNumber || "",
		email: user?.email || ""
	});
	const [occupancyInfo, setOccupancyInfo] = (0, import_react.useState)({
		preferredMoveInDate: "",
		preferredLeaseMonths: 12,
		adults: 1,
		children: 0,
		pets: false,
		additionalOccupants: ""
	});
	const [employmentInfo, setEmploymentInfo] = (0, import_react.useState)({
		status: "EMPLOYED",
		employer: "",
		occupation: "",
		incomeRange: "KES 50,000 - 100,000",
		employmentDuration: ""
	});
	const [uploadedDocs, setUploadedDocs] = (0, import_react.useState)([]);
	const [uploadingDocId, setUploadingDocId] = (0, import_react.useState)(null);
	const [wizardDraftId, setWizardDraftId] = (0, import_react.useState)(null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		fetchApplications();
		fetchViewings();
	}, []);
	(0, import_react.useEffect)(() => {
		if (initialListingId && viewings.length > 0) {
			const matched = viewings.find((v) => v.listing_id === initialListingId);
			if (matched) handleStartNewWizard(matched.listings, matched.listing_id, matched.unit_id);
		}
	}, [initialListingId, viewings]);
	const fetchApplications = async () => {
		try {
			const data = await listApplicantApplications();
			setApplications(data || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};
	const fetchViewings = async () => {
		try {
			const data = await getViewings();
			setViewings(data || []);
		} catch (err) {
			console.error(err);
		}
	};
	const handleStartNewWizard = async (listing, listingId, unitId) => {
		setSelectedListing(listing);
		setErrorMsg(null);
		try {
			const res = await createApplicationDraft({
				listingId,
				unitId: unitId || null
			});
			if (res.success && res.applicationId) {
				setWizardDraftId(res.applicationId);
				const { data: reqs } = await supabase.from("application_requirements").select("*").eq("property_id", listing.property_id || listing.properties?.id).eq("is_active", true).order("order_index", { ascending: true });
				if (!reqs || reqs.length === 0) setListingRequirements([{
					id: "default-id-card",
					name: "National ID / Passport copy",
					is_required: true
				}, {
					id: "default-payslip",
					name: "Proof of Income (3 months bank statements/payslips)",
					is_required: true
				}]);
				else setListingRequirements(reqs);
				setIsCreating(true);
				setWizardStep(1);
			}
		} catch (err) {
			setErrorMsg(err.message || "Could not initialize application. Make sure you don't already have an active application.");
		}
	};
	const handleSaveDraftProgress = async () => {
		if (!wizardDraftId) return;
		try {
			await updateApplicationDraft({
				id: wizardDraftId,
				personalInfo,
				preferredMoveInDate: occupancyInfo.preferredMoveInDate || void 0,
				preferredLeaseMonths: occupancyInfo.preferredLeaseMonths,
				employmentInfo,
				householdInfo: {
					adults: occupancyInfo.adults,
					children: occupancyInfo.children,
					pets: occupancyInfo.pets,
					additionalOccupants: occupancyInfo.additionalOccupants
				}
			});
		} catch (err) {
			console.error("Draft autosave failed", err);
		}
	};
	const handleNextStep = async () => {
		await handleSaveDraftProgress();
		setWizardStep((prev) => prev + 1);
	};
	const handleFileUpload = async (e, requirementId, requirementName) => {
		const file = e.target.files?.[0];
		if (!file || !user || !wizardDraftId) return;
		setUploadingDocId(requirementId);
		setErrorMsg(null);
		try {
			const fileExt = file.name.split(".").pop();
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
			const storagePath = `${user.userId}/${fileName}`;
			const { error: uploadError } = await supabase.storage.from("application_documents").upload(storagePath, file);
			if (uploadError) throw uploadError;
			const { data: doc, error: insertError } = await supabase.from("application_documents").insert({
				application_id: wizardDraftId,
				requirement_id: requirementId.startsWith("default-") ? null : requirementId,
				name: requirementName,
				file_path: storagePath,
				file_size: file.size,
				mime_type: file.type,
				status: "UPLOADED"
			}).select().single();
			if (insertError) throw insertError;
			setUploadedDocs((prev) => [...prev, {
				...doc,
				tempRequirementId: requirementId
			}]);
		} catch (err) {
			setErrorMsg(err.message || "Failed to upload document.");
		} finally {
			setUploadingDocId(null);
		}
	};
	const handleDeleteUploadedDoc = async (docId, filePath) => {
		try {
			await supabase.storage.from("application_documents").remove([filePath]);
			await supabase.from("application_documents").delete().eq("id", docId);
			setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
		} catch (err) {
			console.error("Failed to delete document", err);
		}
	};
	const handleSubmitApplicationForm = async () => {
		if (!wizardDraftId) return;
		setSubmitting(true);
		setErrorMsg(null);
		try {
			await handleSaveDraftProgress();
			await submitApplication(wizardDraftId);
			setIsCreating(false);
			fetchApplications();
		} catch (err) {
			setErrorMsg(err.message || "Submission failed. Please check viewing and document requirements.");
		} finally {
			setSubmitting(false);
		}
	};
	const handleWithdraw = async (appId) => {
		if (!confirm("Are you sure you want to withdraw this application?")) return;
		try {
			await withdrawApplication(appId);
			fetchApplications();
		} catch (err) {
			alert(err.message);
		}
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "DRAFT": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "badge badge-secondary",
				children: "Draft"
			});
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
				children: "Action Required"
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground",
					children: "My Applications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Track status, upload documents, and review decisions on your rental applications."
				})] }), !isCreating && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						const eligible = viewings.filter((v) => v.status === "COMPLETED");
						if (eligible.length === 0) alert("You must complete at least one physical viewing to apply for properties requesting it.");
						else handleStartNewWizard(eligible[0].listings, eligible[0].listing_id, eligible[0].unit_id);
					},
					className: "btn btn-primary flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Start New Application"]
				})]
			}),
			errorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: errorMsg
				})]
			}),
			isCreating && selectedListing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Step ",
								wizardStep,
								" of 5"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedListing.title })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 w-full bg-secondary rounded-full overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-primary transition-all duration-300",
								style: { width: `${wizardStep / 5 * 100}%` }
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
						mode: "wait",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								x: 10
							},
							animate: {
								opacity: 1,
								x: 0
							},
							exit: {
								opacity: 0,
								x: -10
							},
							transition: { duration: .2 },
							children: [
								wizardStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 max-w-xl",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "font-display font-semibold text-lg flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-5 w-5 text-primary" }), " Personal Information"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground leading-relaxed",
											children: "These details will be shared with the landlord to contact you regarding the tenancy."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Full Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													className: "input",
													value: personalInfo.fullName,
													onChange: (e) => setPersonalInfo({
														...personalInfo,
														fullName: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Phone Number"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													className: "input",
													value: personalInfo.phoneNumber,
													onChange: (e) => setPersonalInfo({
														...personalInfo,
														phoneNumber: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Email Address"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "email",
													className: "input",
													value: personalInfo.email,
													onChange: (e) => setPersonalInfo({
														...personalInfo,
														email: e.target.value
													})
												})] })
											]
										})
									]
								}),
								wizardStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 max-w-xl",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "font-display font-semibold text-lg flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-primary" }), " Household Details"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-4 sm:grid-cols-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Preferred Move-in Date"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "date",
													className: "input",
													value: occupancyInfo.preferredMoveInDate,
													onChange: (e) => setOccupancyInfo({
														...occupancyInfo,
														preferredMoveInDate: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Preferred Lease Term (Months)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													className: "input",
													value: occupancyInfo.preferredLeaseMonths,
													onChange: (e) => setOccupancyInfo({
														...occupancyInfo,
														preferredLeaseMonths: parseInt(e.target.value) || 12
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Number of Adults"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													className: "input",
													value: occupancyInfo.adults,
													onChange: (e) => setOccupancyInfo({
														...occupancyInfo,
														adults: parseInt(e.target.value) || 1
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Number of Children"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													className: "input",
													value: occupancyInfo.children,
													onChange: (e) => setOccupancyInfo({
														...occupancyInfo,
														children: parseInt(e.target.value) || 0
													})
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 pt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												id: "pets",
												checked: occupancyInfo.pets,
												onChange: (e) => setOccupancyInfo({
													...occupancyInfo,
													pets: e.target.checked
												}),
												className: "rounded text-primary border-border focus:ring-primary h-4 w-4"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "pets",
												className: "text-sm font-medium text-foreground select-none",
												children: "I have pets"
											})]
										})
									]
								}),
								wizardStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 max-w-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "font-display font-semibold text-lg flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-5 w-5 text-primary" }), " Employment & Income"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Employment Status"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "input",
												value: employmentInfo.status,
												onChange: (e) => setEmploymentInfo({
													...employmentInfo,
													status: e.target.value
												}),
												children: EMPLOYMENT_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: status,
													children: status.replace("_", " ")
												}, status))
											})] }),
											employmentInfo.status !== "UNEMPLOYED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid gap-3 sm:grid-cols-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Employer Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													className: "input",
													value: employmentInfo.employer,
													onChange: (e) => setEmploymentInfo({
														...employmentInfo,
														employer: e.target.value
													})
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "label",
													children: "Occupation"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													className: "input",
													value: employmentInfo.occupation,
													onChange: (e) => setEmploymentInfo({
														...employmentInfo,
														occupation: e.target.value
													})
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Monthly Income Range"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "input",
												value: employmentInfo.incomeRange,
												onChange: (e) => setEmploymentInfo({
													...employmentInfo,
													incomeRange: e.target.value
												}),
												children: INCOME_RANGES.map((range) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: range,
													children: range
												}, range))
											})] })
										]
									})]
								}),
								wizardStep === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "font-display font-semibold text-lg flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary" }), " Required Documents"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1 leading-relaxed",
										children: "Private and encrypted. Only visible to the landlord and verifier."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid gap-4 max-w-2xl",
										children: listingRequirements.map((req) => {
											const uploaded = uploadedDocs.filter((d) => d.requirement_id === req.id || req.id.startsWith("default-") && !d.requirement_id);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-all",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-sm font-semibold text-foreground",
															children: req.name
														}), req.is_required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] font-bold text-accent uppercase tracking-widest",
															children: "Required"
														})]
													}),
													req.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground mt-1",
														children: req.description
													}),
													uploaded.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mt-3 space-y-1.5",
														children: uploaded.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 w-fit",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4.5 w-4.5 shrink-0" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: doc.name }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																	type: "button",
																	onClick: () => handleDeleteUploadedDoc(doc.id, doc.file_path),
																	className: "text-emerald-800 hover:text-red-600 shrink-0 ml-1.5",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
																})
															]
														}, doc.id))
													})
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "btn btn-secondary text-xs flex items-center gap-2 cursor-pointer w-fit shrink-0",
													children: [uploadingDocId === req.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), " Uploading..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }), " Upload File"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "file",
														accept: "image/*,application/pdf",
														className: "hidden",
														disabled: uploadingDocId !== null,
														onChange: (e) => handleFileUpload(e, req.id, req.name)
													})]
												}) })]
											}, req.id);
										})
									})]
								}),
								wizardStep === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-display font-semibold text-lg",
											children: "Review Application Details"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: "Double-check all information before submitting to the property landlord."
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-6 md:grid-cols-2 max-w-4xl",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "surface-card p-5 border border-border/70 rounded-xl space-y-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
													className: "font-display font-bold text-sm text-foreground uppercase tracking-wider",
													children: "Profile & Occupancy"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs space-y-2.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Applicant Name"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium",
																children: personalInfo.fullName
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Phone Number"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium",
																children: personalInfo.phoneNumber
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Email Address"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium",
																children: personalInfo.email
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-border/60 my-2 pt-2" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Move-in Date"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium",
																children: occupancyInfo.preferredMoveInDate || "Not Specified"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Lease Term"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-medium",
																children: [occupancyInfo.preferredLeaseMonths, " Months"]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Household Size"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-medium",
																children: [
																	occupancyInfo.adults,
																	" Adult(s), ",
																	occupancyInfo.children,
																	" Child(ren)"
																]
															})]
														})
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "surface-card p-5 border border-border/70 rounded-xl space-y-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
													className: "font-display font-bold text-sm text-foreground uppercase tracking-wider",
													children: "Employment & Files"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs space-y-2.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Employment Status"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium capitalize",
																children: employmentInfo.status
															})]
														}),
														employmentInfo.employer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Employer"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium",
																children: employmentInfo.employer
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: "Income Range"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium",
																children: employmentInfo.incomeRange
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-border/60 my-2 pt-2" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-muted-foreground block mb-2",
															children: [
																"Uploaded Files (",
																uploadedDocs.length,
																")"
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "space-y-1",
															children: uploadedDocs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-1.5 text-xs text-foreground",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate max-w-[200px]",
																	children: doc.name
																})]
															}, doc.id))
														})] })
													]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2.5 rounded-xl bg-secondary/50 p-4 border border-border/60 text-left max-w-xl",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-5 w-5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground leading-normal",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Submission Confirmation:" }), " Submitting this application sends your files and profile details directly to the property landlord. It does not establish a tenancy or process any payments."]
											})]
										})
									]
								})
							]
						}, wizardStep)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								if (wizardStep === 1) setIsCreating(false);
								else setWizardStep((prev) => prev - 1);
							},
							className: "btn btn-secondary text-xs",
							children: "Back"
						}), wizardStep < 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleNextStep,
							className: "btn btn-primary text-xs",
							children: "Continue"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: submitting,
							onClick: handleSubmitApplicationForm,
							className: "btn btn-primary text-xs flex items-center gap-2",
							children: [submitting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Submit Application"]
						})]
					})
				]
			}),
			!isCreating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: applications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-12 text-center max-w-xl mx-auto shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4 animate-pulse",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-bold text-foreground",
						children: "No applications yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground leading-relaxed",
						children: "Browse matching properties, schedule viewing calendars, and start an application to rent here."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/homes",
							search: {
								page: 1,
								limit: 20,
								sort: "RECOMMENDED",
								amenities: []
							},
							className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95",
							children: "Browse Map Listings"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: applications.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-5 border border-border/80 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-border transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
									children: app.application_number || "Draft App"
								}), getStatusBadge(app.status)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-display font-semibold text-base text-foreground leading-snug",
								children: app.listings?.title || "Rental Property"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-xs text-muted-foreground mt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									app.properties?.name,
									", ",
									app.properties?.town
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-4 items-center bg-secondary/30 p-2.5 rounded-xl border border-border/30 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
										children: "Rent"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-foreground",
										children: [
											app.currency_snapshot,
											" ",
											app.rent_snapshot.toLocaleString()
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-l border-border/50 h-6" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
										children: "Deposit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-foreground",
										children: [
											app.currency_snapshot,
											" ",
											app.deposit_snapshot.toLocaleString()
										]
									})] })
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border/60 mt-5 pt-4 flex items-center justify-between gap-3 text-xs",
						children: app.status === "DRAFT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setSelectedListing(app.listings);
								setPersonalInfo(app.personal_info || personalInfo);
								setOccupancyInfo({
									preferredMoveInDate: app.preferred_move_in_date || "",
									preferredLeaseMonths: app.preferred_lease_months || 12,
									adults: app.household_info?.adults || 1,
									children: app.household_info?.children || 0,
									pets: app.household_info?.pets || false,
									additionalOccupants: app.household_info?.additionalOccupants || ""
								});
								setEmploymentInfo(app.employment_info || employmentInfo);
								setWizardDraftId(app.id);
								supabase.from("application_requirements").select("*").eq("property_id", app.property_id).eq("is_active", true).then(({ data: reqs }) => {
									if (!reqs || reqs.length === 0) setListingRequirements([{
										id: "default-id-card",
										name: "National ID / Passport copy",
										is_required: true
									}, {
										id: "default-payslip",
										name: "Proof of Income",
										is_required: true
									}]);
									else setListingRequirements(reqs);
									supabase.from("application_documents").select("*").eq("application_id", app.id).then(({ data: docs }) => {
										setUploadedDocs(docs || []);
										setIsCreating(true);
										setWizardStep(1);
									});
								});
							},
							className: "text-primary font-bold hover:underline",
							children: "Continue Application →"
						}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/applications/$id",
							params: { id: app.id },
							className: "text-primary font-bold hover:underline flex items-center gap-1",
							children: ["Track Progress ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
						}), app.status !== "WITHDRAWN" && app.status !== "REJECTED" && app.status !== "APPROVED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => handleWithdraw(app.id),
							className: "text-destructive font-medium hover:underline text-[11px]",
							children: "Withdraw"
						})] })
					})]
				}, app.id))
			}) })
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationsComponent, {}) });
//#endregion
export { SplitComponent as component };
