import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminListUsers,
  adminGetUser,
  adminSuspendUser,
  adminReactivateUser,
  adminManageRole,
} from "@/features/identity/identity.functions";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Search,
  User,
  Shield,
  AlertTriangle,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Calendar,
  Globe,
  Monitor,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { type AppRole } from "@/core/auth/roles";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireAuth permission="ADMIN_VIEW_USERS">
      <AdminComponent />
    </RequireAuth>
  ),
});

function AdminComponent() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // 1. Fetch user list
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: () =>
      adminListUsers({
        page,
        pageSize: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  // 2. Fetch specific user details for the side-drawer
  const { data: selectedUser, isLoading: userLoading } = useQuery({
    queryKey: ["admin-user-detail", selectedUserId],
    queryFn: () => adminGetUser({ userId: selectedUserId || "" }),
    enabled: !!selectedUserId,
  });

  // Suspend Mutation
  const suspendMutation = useMutation({
    mutationFn: () =>
      adminSuspendUser({
        userId: selectedUserId || "",
        reason: suspensionReason,
      }),
    onSuccess: () => {
      toast.success("User suspended successfully.");
      setSuspensionReason("");
      setIsSuspending(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to suspend user.");
    },
  });

  // Reactivate Mutation
  const reactivateMutation = useMutation({
    mutationFn: () => adminReactivateUser({ userId: selectedUserId || "" }),
    onSuccess: () => {
      toast.success("User reactivated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to reactivate user.");
    },
  });

  // Manage Role Mutation
  const manageRoleMutation = useMutation({
    mutationFn: (variables: { role: AppRole; action: "assign" | "remove" }) =>
      adminManageRole({
        userId: selectedUserId || "",
        role: variables.role,
        action: variables.action,
      }),
    onSuccess: (_, variables) => {
      toast.success(
        `Role '${variables.role}' ${variables.action === "assign" ? "assigned" : "removed"} successfully.`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
    },
    onError: (err: unknown) => {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to modify user roles.");
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSuspendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspensionReason) return;
    suspendMutation.mutate();
  };

  const totalPages = data ? Math.ceil(data.totalCount / 10) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">User Administration</h1>
          <p className="text-sm text-muted-foreground">
            Monitor registered accounts, toggle suspension statuses, and delegate platform roles.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="grid gap-3 sm:grid-cols-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none text-sm cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
              <option value="agent">Agent</option>
              <option value="property_manager">Property Manager</option>
              <option value="verifier">Verifier</option>
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none text-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DEACTIVATED">Deactivated</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>
        </div>

        {/* Users Table / Grid */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Name / Email</th>
                    <th className="p-4">Assigned Roles</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {data && data.users.length > 0 ? (
                    data.users.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-foreground">
                            {item.fullName || "Un-onboarded Account"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.email}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {item.roles.map((r) => (
                              <span
                                key={r}
                                className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border border-border"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.status === "ACTIVE"
                                ? "bg-verified/10 text-verified border-verified/20"
                                : item.status === "SUSPENDED"
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => setSelectedUserId(item.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        No registered users found matching the query filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-secondary/20 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-border disabled:opacity-50 text-muted-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-border disabled:opacity-50 text-muted-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------
            USER DETAILS DRAWERS / DIALOGS
           ------------------------------------------------------------ */}
        {selectedUserId && (
          <div className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-card border-l border-border h-full flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
                <h3 className="font-display font-bold text-lg text-foreground">
                  User Detail Inspector
                </h3>
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setIsSuspending(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {userLoading || !selectedUser ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  {/* Account overview */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 text-primary font-display font-bold text-lg flex items-center justify-center border border-primary/20 uppercase">
                      {selectedUser.firstName?.[0] || selectedUser.email?.[0] || "U"}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-foreground">
                        {selectedUser.fullName || "Un-onboarded User"}
                      </h4>
                      <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* General Status Card */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Status</span>
                      <span
                        className={`font-bold uppercase ${
                          selectedUser.status === "ACTIVE" ? "text-verified" : "text-destructive"
                        }`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Phone</span>
                      <span className="font-semibold text-foreground">
                        {selectedUser.phoneNumber || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered At</span>
                      <span className="font-semibold text-foreground">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="font-semibold text-foreground">
                        {selectedUser.lastLoginAt
                          ? new Date(selectedUser.lastLoginAt).toLocaleString()
                          : "Never"}
                      </span>
                    </div>
                  </div>

                  {/* Account Status management */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Account Status Controls
                    </p>
                    {selectedUser.status === "SUSPENDED" ? (
                      <button
                        onClick={() => reactivateMutation.mutate()}
                        disabled={reactivateMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-verified/20 text-verified bg-verified/5 hover:bg-verified/10 px-4 py-2 text-xs font-semibold disabled:opacity-50 transition-all"
                      >
                        <UserCheck className="h-4 w-4" /> Restore & Reactivate Account
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {!isSuspending ? (
                          <button
                            onClick={() => setIsSuspending(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4 py-2 text-xs font-semibold transition-all"
                          >
                            <UserX className="h-4 w-4" /> Temporarily Suspend User
                          </button>
                        ) : (
                          <form onSubmit={handleSuspendSubmit} className="space-y-3">
                            <label className="text-xs font-semibold text-muted-foreground block">
                              Suspension Justification Reason
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Terms violations, repeated fake listings"
                              value={suspensionReason}
                              onChange={(e) => setSuspensionReason(e.target.value)}
                              className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={suspendMutation.isPending}
                                className="rounded-lg bg-destructive px-3.5 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
                              >
                                Confirm Suspend
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsSuspending(false)}
                                className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Role delegation */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Role Configuration
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {selectedUser.roles.map((r) => (
                        <span
                          key={r}
                          className="bg-secondary px-2.5 py-1 rounded text-xs font-bold text-muted-foreground border border-border flex items-center gap-1"
                        >
                          {r}
                          {selectedUserId !== currentUser?.userId && (
                            <button
                              onClick={() =>
                                manageRoleMutation.mutate({ role: r, action: "remove" })
                              }
                              disabled={manageRoleMutation.isPending}
                              className="text-destructive hover:bg-destructive/10 rounded font-semibold text-[10px] px-1"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center flex-wrap">
                      <select
                        onChange={(e) => {
                          const val = e.target.value as AppRole;
                          if (val) {
                            manageRoleMutation.mutate({ role: val, action: "assign" });
                            e.target.value = "";
                          }
                        }}
                        className="px-3 py-1.5 bg-secondary/30 rounded-lg border border-border text-xs cursor-pointer focus:outline-none"
                      >
                        <option value="">+ Assign Role...</option>
                        <option value="tenant">Tenant</option>
                        <option value="landlord">Landlord</option>
                        <option value="agent">Agent</option>
                        <option value="property_manager">Property Manager</option>
                        <option value="verifier">Verifier</option>
                        <option value="admin">Administrator</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Active login sessions */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Recent Authentication Sessions
                    </p>
                    <div className="space-y-2">
                      {selectedUser.sessions && selectedUser.sessions.length > 0 ? (
                        selectedUser.sessions.map((sess) => {
                          const isMobile = /mobile/i.test(sess.userAgent || "");
                          const DeviceIcon = isMobile ? Laptop : Monitor;

                          return (
                            <div
                              key={sess.id}
                              className="p-3 border rounded-lg bg-secondary/10 flex items-center justify-between text-xs"
                            >
                              <div className="flex gap-2 items-center overflow-hidden">
                                <DeviceIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div className="overflow-hidden">
                                  <p className="font-semibold text-foreground truncate max-w-[180px]">
                                    {sess.userAgent ? sess.userAgent.split(" ")[0] : "Browser"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                    <Globe className="h-3 w-3" /> {sess.ipAddress || "Unknown IP"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {sess.revokedAt ? (
                                  <span className="text-[9px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded font-semibold">
                                    Revoked
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-verified/10 text-verified border border-verified/20 px-1.5 py-0.5 rounded font-semibold">
                                    Active
                                  </span>
                                )}
                                <p className="text-[9px] text-muted-foreground mt-1">
                                  {new Date(sess.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No login sessions recorded.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
