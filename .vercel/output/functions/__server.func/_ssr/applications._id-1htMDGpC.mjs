import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-BSPz5QXw.mjs";
import { I as LoaderCircle, M as MapPin, Z as FileText, ft as ChevronLeft, it as Clock, k as MessageSquare, lt as CircleCheck, mt as Calendar, o as Upload, ut as CircleAlert, v as ShieldCheck } from "../_libs/lucide-react.mjs";
import { s as Route$19, t as RequireAuth, x as useAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
import { l as respondToInformationRequest, n as getApplicationDetails, r as getSecureApplicationDocUrl } from "./applications.functions-BSYQUg-b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications._id-1htMDGpC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ApplicationDetailsWrapper() {
	const { id } = Route$19.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationDetailsComponent, { applicationId: id });
}
function ApplicationDetailsComponent({ applicationId }) {
	const { user } = useAuth();
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [details, setDetails] = (0, import_react.useState)(null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [responseText, setResponseText] = (0, import_react.useState)("");
	const [responseFiles, setResponseFiles] = (0, import_react.useState)([]);
	const [uploadingReqId, setUploadingReqId] = (0, import_react.useState)(null);
	const [submittingResponse, setSubmittingResponse] = (0, import_react.useState)(false);
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
	const handleFileUpload = async (e, requirementId, requirementName) => {
		const file = e.target.files?.[0];
		if (!file || !user) return;
		setUploadingReqId(requirementId);
		try {
			const fileExt = file.name.split(".").pop();
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
			const storagePath = `${user.userId}/${fileName}`;
			const { error: uploadError } = await supabase.storage.from("application_documents").upload(storagePath, file);
			if (uploadError) throw uploadError;
			setResponseFiles((prev) => [...prev, {
				requirementId,
				name: requirementName,
				filePath: storagePath,
				fileSize: file.size,
				mimeType: file.type
			}]);
		} catch (err) {
			alert(err.message || "Failed to upload file.");
		} finally {
			setUploadingReqId(null);
		}
	};
	const handleSubmitResponse = async (requestId) => {
		if (!responseText.trim()) {
			alert("Please provide a response message.");
			return;
		}
		setSubmittingResponse(true);
		try {
			await respondToInformationRequest({
				requestId,
				message: responseText,
				documents: responseFiles
			});
			setResponseText("");
			setResponseFiles([]);
			await fetchDetails();
		} catch (err) {
			alert(err.message || "Failed to submit response.");
		} finally {
			setSubmittingResponse(false);
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
	if (errorMsg || !details) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 max-w-xl mx-auto text-center py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-12 w-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-bold text-foreground",
				children: "Failed to Load Application"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: errorMsg || "Record does not exist or you lack access permissions."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/applications",
					className: "btn btn-secondary text-xs",
					children: "Back to Applications"
				})
			})
		]
	}) });
	const { application: app, documents, requests, history } = details;
	const openRequests = requests.filter((r) => r.status === "OPEN" && r.recipient_id === user?.userId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/applications",
					className: "text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" }), " Back to Applications"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2.5",
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
							children: app.listings?.title || "Rental Property"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary" }),
									" ",
									app.properties?.name,
									",",
									" ",
									app.properties?.county
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5 text-primary" }),
									" Preferred Move-in:",
									" ",
									app.preferred_move_in_date || "Not set"
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
								app.currency_snapshot,
								" ",
								app.rent_snapshot.toLocaleString()
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-l border-border/50 h-8" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground block text-[9px] uppercase font-bold tracking-wider",
							children: "Required Deposit"
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
						openRequests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-yellow-500/20 bg-yellow-500/5 rounded-2xl space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-yellow-800 dark:text-yellow-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-bold text-base",
									children: "Landlord Action Requested"
								})]
							}), openRequests.map((req) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-foreground bg-card/50 p-3.5 rounded-xl border border-border/40 leading-relaxed",
										children: [
											"\"",
											req.message,
											"\""
										]
									}),
									req.due_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-yellow-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Respond before: ", new Date(req.due_date).toLocaleString()] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3 pt-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "label",
												children: "Response Message / Notes"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												rows: 3,
												value: responseText,
												onChange: (e) => setResponseText(e.target.value),
												placeholder: "Provide details or explanations regarding the requested item...",
												className: "textarea"
											})] }),
											req.requirement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-4 rounded-xl border border-dashed border-border flex items-center justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs font-semibold text-foreground block",
													children: ["Upload: ", req.requirement.name]
												}), responseFiles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-2 space-y-1",
													children: responseFiles.map((f, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 text-xs text-emerald-600 font-bold",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.name })]
													}, idx))
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "btn btn-secondary text-xs flex items-center gap-2 cursor-pointer shrink-0",
													children: [
														uploadingReqId === req.requirement.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }),
														"Upload document",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "file",
															accept: "image/*,application/pdf",
															className: "hidden",
															onChange: (e) => handleFileUpload(e, req.requirement.id, req.requirement.name)
														})
													]
												}) })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pt-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													disabled: submittingResponse,
													onClick: () => handleSubmitResponse(req.id),
													className: "btn btn-primary text-xs flex items-center gap-2",
													children: [submittingResponse && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), "Submit Response"]
												})
											})
										]
									})
								]
							}, req.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold text-lg text-foreground",
								children: "Application Details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-6 sm:grid-cols-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
											children: "Personal Information"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "surface-card p-3.5 border border-border/40 rounded-xl space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-foreground font-medium",
													children: app.personal_info?.fullName
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground",
													children: app.personal_info?.phoneNumber
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground",
													children: app.personal_info?.email
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
											children: "Household & Occupancy"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "surface-card p-3.5 border border-border/40 rounded-xl space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Occupants:" }),
														" ",
														app.household_info?.adults,
														" Adult(s),",
														" ",
														app.household_info?.children,
														" Child(ren)"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pets:" }),
														" ",
														app.household_info?.pets ? "Yes" : "No"
													]
												}),
												app.household_info?.additionalOccupants && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground truncate",
													children: app.household_info.additionalOccupants
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",
											children: "Employment & Profile Verification"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "surface-card p-4 border border-border/40 rounded-xl grid gap-4 sm:grid-cols-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground",
													children: "Employment Status"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5 capitalize",
													children: app.employment_info?.status?.replace("_", " ")
												})] }),
												app.employment_info?.employer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground",
													children: "Employer / Org"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5",
													children: app.employment_info.employer
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground",
													children: "Monthly Income"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5",
													children: app.employment_info?.incomeRange
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground",
													children: "Occupation"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5",
													children: app.employment_info?.occupation || "N/A"
												})] })
											]
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold text-lg text-foreground",
								children: "Submitted Verification Files"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3",
								children: documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground italic",
									children: "No evidence files submitted."
								}) : documents.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3 rounded-xl border border-border bg-card/60 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4.5 w-4.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground block",
											children: doc.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-muted-foreground",
											children: [
												"Size: ",
												Math.round(doc.file_size / 1024),
												" KB • Status:",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "capitalize",
													children: doc.status.toLowerCase()
												})
											]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => handleDownloadDoc(doc.file_path),
										className: "btn btn-secondary text-[10px] px-2.5 py-1.5 flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-500" }), " View Document"]
									})]
								}, doc.id))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display font-semibold text-base text-foreground",
							children: "Application Progress"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative border-l-2 border-border/80 pl-5 ml-2.5 space-y-6 py-2",
							children: history.map((event, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-5 border border-primary/20 bg-primary/5 rounded-2xl space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-display font-bold text-sm text-foreground",
								children: "Need to Coordinate?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground leading-relaxed",
								children: "Start a direct conversation thread with the landlord to schedule follow-ups or ask tenancy questions."
							}),
							app.provider_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/messages",
									className: "btn btn-primary text-xs w-full flex items-center justify-center gap-2",
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
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationDetailsWrapper, {}) });
//#endregion
export { SplitComponent as component };
