import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMySessions,
  revokeSession,
  revokeAllSessions,
  changePassword,
} from "@/features/identity/identity.functions";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Shield, Monitor, Laptop, Globe, LogOut, Loader2, Save, KeyRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: () => (
    <RequireAuth>
      <SettingsComponent />
    </RequireAuth>
  ),
});

type TabId = "security" | "sessions";

function SettingsComponent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("security");

  // Tab 1: Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Tab 2: Fetch Active Sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: () => getMySessions(),
    enabled: activeTab === "sessions",
  });

  // Password Change Mutation
  const changePasswordMutation = useMutation({
    mutationFn: () =>
      changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to change password.");
    },
  });

  // Revoke Specific Session Mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessId: string) => revokeSession({ sessionId: sessId }),
    onSuccess: () => {
      toast.success("Session revoked successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to revoke session.");
    },
  });

  // Revoke All Other Sessions Mutation
  const revokeAllMutation = useMutation({
    mutationFn: () => revokeAllSessions(),
    onSuccess: () => {
      toast.success("All other sessions revoked.");
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to revoke sessions.");
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings & Security</h1>
          <p className="text-sm text-muted-foreground">
            Manage your credentials, active authentication sessions, and security options.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Password & Security
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "sessions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Active Sessions
          </button>
        </div>

        {/* ------------------------------------------------------------
            SECURITY TAB
           ------------------------------------------------------------ */}
        {activeTab === "security" && (
          <div className="surface-card p-6 max-w-2xl shadow-sm">
            <h3 className="font-display font-semibold text-lg text-foreground mb-1 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Update Password
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Change your account password. All other active devices will be automatically logged
              out for your security.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="curr-pass"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Current Password
                </label>
                <input
                  id="curr-pass"
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              <div>
                <label
                  htmlFor="new-pass"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  New Password
                </label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-pass"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-pass"
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Changing Password
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" /> Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------
            SESSIONS TAB
           ------------------------------------------------------------ */}
        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Device Session Logs
                </h3>
                <p className="text-xs text-muted-foreground">
                  Here is a list of active authentication sessions. Revoke any unfamiliar device
                  sessions.
                </p>
              </div>
              <button
                onClick={() => revokeAllMutation.mutate()}
                disabled={revokeAllMutation.isPending || (sessions && sessions.length <= 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all self-start sm:self-auto"
              >
                {revokeAllMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                Revoke All Other Sessions
              </button>
            </div>

            {sessionsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions && sessions.length > 0 ? (
                  sessions.map((sess) => {
                    const isMobile = /mobile/i.test(sess.userAgent || "");
                    const DeviceIcon = isMobile ? Laptop : Monitor;

                    return (
                      <div
                        key={sess.id}
                        className={`surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                          sess.isCurrent ? "border-primary/20 bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              sess.isCurrent
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            <DeviceIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {sess.userAgent
                                  ? sess.userAgent.split(" ")[0] || "Unknown Client"
                                  : "Unknown Browser"}
                              </span>
                              {sess.isCurrent && (
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] font-bold border border-primary/20">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[280px] sm:max-w-md">
                              {sess.userAgent || "Unknown User Agent"}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5" /> IP: {sess.ipAddress || "Unknown"}
                              </span>
                              <span>•</span>
                              <span>Logged in: {new Date(sess.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {!sess.isCurrent && (
                          <button
                            onClick={() => revokeSessionMutation.mutate(sess.id)}
                            disabled={revokeSessionMutation.isPending}
                            className="inline-flex items-center justify-center rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-all self-start sm:self-auto shrink-0"
                          >
                            {revokeSessionMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Revoke"
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 border border-dashed rounded-xl bg-card">
                    <p className="text-sm text-muted-foreground">No active sessions found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
