import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { G as Globe, I as LoaderCircle, O as Monitor, P as LogOut, V as KeyRound, _ as Shield, z as Laptop } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as getMySessions, s as changePassword, v as revokeAllSessions, y as revokeSession } from "./router-Dop2ixCg.mjs";
import { t as RequireAuth } from "./router-Dop2ixCg2.mjs";
import { t as DashboardLayout } from "./DashboardLayout-B2oGLAwS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-D3ty60jm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsComponent() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = (0, import_react.useState)("security");
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmNewPassword, setConfirmNewPassword] = (0, import_react.useState)("");
	const { data: sessions, isLoading: sessionsLoading } = useQuery({
		queryKey: ["my-sessions"],
		queryFn: () => getMySessions(),
		enabled: activeTab === "sessions"
	});
	const changePasswordMutation = useMutation({
		mutationFn: () => changePassword({
			currentPassword,
			newPassword,
			confirmNewPassword
		}),
		onSuccess: () => {
			toast.success("Password changed successfully!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmNewPassword("");
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Failed to change password.");
		}
	});
	const revokeSessionMutation = useMutation({
		mutationFn: (sessId) => revokeSession({ sessionId: sessId }),
		onSuccess: () => {
			toast.success("Session revoked successfully.");
			queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Failed to revoke session.");
		}
	});
	const revokeAllMutation = useMutation({
		mutationFn: () => revokeAllSessions(),
		onSuccess: () => {
			toast.success("All other sessions revoked.");
			queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
		},
		onError: (err) => {
			const error = err;
			toast.error(error.message || "Failed to revoke sessions.");
		}
	});
	const handlePasswordSubmit = (e) => {
		e.preventDefault();
		if (!currentPassword || !newPassword || !confirmNewPassword) {
			toast.error("Please fill in all password fields.");
			return;
		}
		if (newPassword.length < 8) {
			toast.error("New password must be at least 8 characters.");
			return;
		}
		if (newPassword !== confirmNewPassword) {
			toast.error("New passwords do not match.");
			return;
		}
		changePasswordMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold text-foreground",
				children: "Settings & Security"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Manage your credentials, active authentication sessions, and security options."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex border-b border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setActiveTab("security"),
					className: `px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "security" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
					children: "Password & Security"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setActiveTab("sessions"),
					className: `px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "sessions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
					children: "Active Sessions"
				})]
			}),
			activeTab === "security" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card p-6 max-w-2xl shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display font-semibold text-lg text-foreground mb-1 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-primary" }), " Update Password"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mb-6",
						children: "Change your account password. All other active devices will be automatically logged out for your security."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handlePasswordSubmit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "curr-pass",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Current Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "curr-pass",
								type: "password",
								required: true,
								placeholder: "Enter current password",
								value: currentPassword,
								onChange: (e) => setCurrentPassword(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: changePasswordMutation.isPending
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "new-pass",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "New Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "new-pass",
								type: "password",
								required: true,
								placeholder: "Minimum 8 characters",
								value: newPassword,
								onChange: (e) => setNewPassword(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: changePasswordMutation.isPending
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "confirm-pass",
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
								children: "Confirm New Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "confirm-pass",
								type: "password",
								required: true,
								placeholder: "Repeat new password",
								value: confirmNewPassword,
								onChange: (e) => setConfirmNewPassword(e.target.value),
								className: "w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm",
								disabled: changePasswordMutation.isPending
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-4 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: changePasswordMutation.isPending || !currentPassword || !newPassword,
									className: "flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow",
									children: changePasswordMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Changing Password"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4" }), " Change Password"] })
								})
							})
						]
					})
				]
			}),
			activeTab === "sessions" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-semibold text-lg text-foreground",
						children: "Device Session Logs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Here is a list of active authentication sessions. Revoke any unfamiliar device sessions."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => revokeAllMutation.mutate(),
						disabled: revokeAllMutation.isPending || sessions && sessions.length <= 1,
						className: "inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all self-start sm:self-auto",
						children: [revokeAllMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), "Revoke All Other Sessions"]
					})]
				}), sessionsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-40 items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 text-primary animate-spin" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4",
					children: sessions && sessions.length > 0 ? sessions.map((sess) => {
						const DeviceIcon = /mobile/i.test(sess.userAgent || "") ? Laptop : Monitor;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${sess.isCurrent ? "border-primary/20 bg-primary/5" : "border-border"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${sess.isCurrent ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceIcon, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-sm text-foreground",
											children: sess.userAgent ? sess.userAgent.split(" ")[0] || "Unknown Client" : "Unknown Browser"
										}), sess.isCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] font-bold border border-primary/20",
											children: "Current Session"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1 truncate max-w-[280px] sm:max-w-md",
										children: sess.userAgent || "Unknown User Agent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3 mt-2 text-[10px] text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3.5 w-3.5" }),
													" IP: ",
													sess.ipAddress || "Unknown"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Logged in: ", new Date(sess.createdAt).toLocaleString()] })
										]
									})
								] })]
							}), !sess.isCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => revokeSessionMutation.mutate(sess.id),
								disabled: revokeSessionMutation.isPending,
								className: "inline-flex items-center justify-center rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-all self-start sm:self-auto shrink-0",
								children: revokeSessionMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Revoke"
							})]
						}, sess.id);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center p-8 border border-dashed rounded-xl bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No active sessions found."
						})
					})
				})]
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsComponent, {}) });
//#endregion
export { SplitComponent as component };
