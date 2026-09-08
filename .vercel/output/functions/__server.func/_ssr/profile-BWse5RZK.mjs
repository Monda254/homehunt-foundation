import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { C as Save, I as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as updateMyProfile, u as getMyProfile } from "./router-CmEb8YAq.mjs";
import { t as RequireAuth, x as useAuth } from "./router-CmEb8YAq2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-C9s7lFyb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-BWse5RZK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfileComponent() {
	const queryClient = useQueryClient();
	const { user: authUser, refetch: refetchAuth } = useAuth();
	const { data: profile, isLoading } = useQuery({
		queryKey: ["my-profile"],
		queryFn: () => getMyProfile()
	});
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [county, setCounty] = (0, import_react.useState)("");
	const [town, setTown] = (0, import_react.useState)("");
	const [preferredLanguage, setPreferredLanguage] = (0, import_react.useState)("en");
	(0, import_react.useEffect)(() => {
		if (profile) {
			setFirstName(profile.first_name || "");
			setLastName(profile.last_name || "");
			setDisplayName(profile.display_name || "");
			setBio(profile.bio || "");
			setCounty(profile.county || "");
			setTown(profile.town || "");
			setPreferredLanguage(profile.preferred_language || "en");
		}
	}, [profile]);
	const updateMutation = useMutation({
		mutationFn: () => updateMyProfile({
			firstName,
			lastName,
			displayName: displayName || void 0,
			bio: bio || void 0,
			county: county || void 0,
			town: town || void 0,
			preferredLanguage
		}),
		onSuccess: async () => {
			toast.success("Profile updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["my-profile"] });
			await refetchAuth();
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Failed to update profile.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!firstName || !lastName) {
			toast.error("First name and Last name are required.");
			return;
		}
		updateMutation.mutate();
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 text-primary animate-spin" })
	}) });
	const roleText = authUser?.roles.join(" / ").toUpperCase();
	const statusColor = authUser?.status === "ACTIVE" ? "bg-verified/10 text-verified border-verified/20" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold text-foreground",
			children: "My Profile"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Manage your personal profile details and contact information."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-6 flex flex-col items-center text-center shadow-sm max-h-fit",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-20 w-20 rounded-full bg-primary/10 text-primary font-display font-bold text-2xl flex items-center justify-center border border-primary/20 uppercase mb-4",
						children: firstName?.[0] || authUser?.email?.[0] || "U"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-bold text-lg text-foreground",
						children: firstName || lastName ? `${firstName} ${lastName}`.trim() : "User Profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: authUser?.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap justify-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`,
							children: authUser?.status
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-border bg-secondary/50 text-muted-foreground",
							children: ["ROLE: ", roleText]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full border-t border-border/60 mt-6 pt-4 text-left space-y-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Account Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground capitalize",
									children: profile?.status?.toLowerCase()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Member Since"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "User ID"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground font-mono text-[9px] truncate max-w-[150px]",
									children: authUser?.userId
								})]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card p-6 lg:col-span-2 shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "first-name",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: ["First Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "first-name",
								type: "text",
								required: true,
								placeholder: "e.g. John",
								value: firstName,
								onChange: (e) => setFirstName(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: updateMutation.isPending
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "last-name",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: ["Last Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "last-name",
								type: "text",
								required: true,
								placeholder: "e.g. Doe",
								value: lastName,
								onChange: (e) => setLastName(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: updateMutation.isPending
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "display-name",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Display Name / Nickname"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "display-name",
							type: "text",
							placeholder: "e.g. J. Doe",
							value: displayName,
							onChange: (e) => setDisplayName(e.target.value),
							className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
							disabled: updateMutation.isPending
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "bio",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Short Bio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "bio",
							rows: 3,
							placeholder: "Tell us a bit about yourself...",
							value: bio,
							onChange: (e) => setBio(e.target.value),
							className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none",
							disabled: updateMutation.isPending,
							maxLength: 500
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "county",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "County"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "county",
								type: "text",
								placeholder: "e.g. Nairobi",
								value: county,
								onChange: (e) => setCounty(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: updateMutation.isPending
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "town",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Town / Neighborhood"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "town",
								type: "text",
								placeholder: "e.g. Kilimani",
								value: town,
								onChange: (e) => setTown(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: updateMutation.isPending
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "language",
							className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
							children: "Preferred Language"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "language",
							value: preferredLanguage,
							onChange: (e) => setPreferredLanguage(e.target.value),
							className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer",
							disabled: updateMutation.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "en",
								children: "English (UK)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "sw",
								children: "Swahili"
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-4 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: updateMutation.isPending,
								className: "flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow",
								children: updateMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Saving Changes"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Save Profile"] })
							})
						})
					]
				})
			})]
		})]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileComponent, {}) });
//#endregion
export { SplitComponent as component };
