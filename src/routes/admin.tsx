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
import {
  listVerificationRequests,
  reviewVerificationRequest,
  revokeVerification,
  listPropertyClaims,
  resolvePropertyClaim,
  listListingReports,
  resolveListingReport,
  listRiskFlags,
  resolveRiskFlag,
  listModerationAppeals,
  resolveModerationAppeal,
  getSecureEvidenceUrl,
} from "@/features/properties/trust.functions";
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
  CheckCircle2,
  AlertOctagon,
  FileText,
  HelpCircle,
  FolderOpen,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
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

type TabId = "users" | "verifications" | "claims" | "reports" | "appeals";

function AdminComponent() {
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>("users");

  // User Admin state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // Moderation state
  const [selectedVerification, setSelectedVerification] = useState<any | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<any | null>(null);

  const [reviewReason, setReviewReason] = useState("");
  const [signedDocUrl, setSignedDocUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // ------------------------------------------------------------
  // Data Queries
  // ------------------------------------------------------------
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: () =>
      adminListUsers({
        page,
        pageSize: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      }),
    enabled: activeTab === "users",
  });

  const { data: verifications, isLoading: isVerificationsLoading } = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: () => listVerificationRequests() as Promise<any>,
    enabled: activeTab === "verifications" && hasPermission("VERIFICATION_VIEW"),
  });

  const { data: claims, isLoading: isClaimsLoading } = useQuery({
    queryKey: ["admin-claims"],
    queryFn: () => listPropertyClaims() as Promise<any>,
    enabled: activeTab === "claims" && hasPermission("CLAIMS_VIEW"),
  });

  const { data: reports, isLoading: isReportsLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => listListingReports() as Promise<any>,
    enabled: activeTab === "reports" && hasPermission("REPORTS_VIEW"),
  });

  const { data: riskFlags, isLoading: isRiskFlagsLoading } = useQuery({
    queryKey: ["admin-risk-flags"],
    queryFn: () => listRiskFlags() as Promise<any>,
    enabled: activeTab === "reports" && hasPermission("RISK_VIEW"),
  });

  const { data: appeals, isLoading: isAppealsLoading } = useQuery({
    queryKey: ["admin-appeals"],
    queryFn: () => listModerationAppeals() as Promise<any>,
    enabled: activeTab === "appeals" && hasPermission("APPEALS_VIEW"),
  });

  // User detail drawer query
  const { data: selectedUser, isLoading: userLoading } = useQuery({
    queryKey: ["admin-user-detail", selectedUserId],
    queryFn: () => adminGetUser({ userId: selectedUserId || "" }),
    enabled: !!selectedUserId && activeTab === "users",
  });

  // ------------------------------------------------------------
  // Mutations
  // ------------------------------------------------------------
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
    onError: (err: any) => {
      toast.error(err.message || "Failed to suspend user.");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => adminReactivateUser({ userId: selectedUserId || "" }),
    onSuccess: () => {
      toast.success("User reactivated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reactivate user.");
    },
  });

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
    onError: (err: any) => {
      toast.error(err.message || "Failed to modify user roles.");
    },
  });

  // Verification review
  const reviewVerMutation = useMutation({
    mutationFn: (variables: { id: string; status: "VERIFIED" | "REJECTED"; reason?: string }) =>
      reviewVerificationRequest({
        id: variables.id,
        status: variables.status,
        rejectionReason: variables.reason,
      }),
    onSuccess: () => {
      toast.success("Verification request updated successfully.");
      setSelectedVerification(null);
      setReviewReason("");
      setSignedDocUrl(null);
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update verification status.");
    },
  });

  // Revoke verification
  const revokeVerMutation = useMutation({
    mutationFn: (variables: { id: string; reason: string }) =>
      revokeVerification({
        id: variables.id,
        revocationReason: variables.reason,
      }),
    onSuccess: () => {
      toast.success("Verification revoked successfully.");
      setSelectedVerification(null);
      setReviewReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revoke verification.");
    },
  });

  // Property claim resolve
  const resolveClaimMutation = useMutation({
    mutationFn: (variables: { id: string; action: "APPROVE" | "REJECT"; reason?: string }) =>
      resolvePropertyClaim({
        id: variables.id,
        action: variables.action,
        rejectionReason: variables.reason,
      }),
    onSuccess: () => {
      toast.success("Property claim resolved successfully.");
      setSelectedClaim(null);
      setReviewReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resolve property claim.");
    },
  });

  // Listing report resolve
  const resolveReportMutation = useMutation({
    mutationFn: (variables: { id: string; action: "RESOLVE" | "DISMISS" | "ESCALATE"; resolution?: string }) =>
      resolveListingReport({
        id: variables.id,
        action: variables.action,
        resolution: variables.resolution,
      }),
    onSuccess: () => {
      toast.success("Report resolved successfully.");
      setSelectedReport(null);
      setReviewReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resolve listing report.");
    },
  });

  // Appeal resolve
  const resolveAppealMutation = useMutation({
    mutationFn: (variables: { id: string; action: "UPHELD" | "REVERSED"; notes?: string }) =>
      resolveModerationAppeal({
        id: variables.id,
        action: variables.action,
        notes: variables.notes,
      }),
    onSuccess: () => {
      toast.success("Appeal resolved successfully.");
      setSelectedAppeal(null);
      setReviewReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-appeals"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resolve appeal.");
    },
  });

  // Risk flag resolve
  const resolveRiskFlagMutation = useMutation({
    mutationFn: (variables: { id: string; status: "RESOLVED" | "DISMISSED" }) =>
      resolveRiskFlag(variables.id, variables.status),
    onSuccess: () => {
      toast.success("Risk flag resolved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-risk-flags"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resolve risk flag.");
    },
  });

  // Secure URL retrieval
  const handleViewEvidence = async (ref: string) => {
    setIsSigning(true);
    setSignedDocUrl(null);
    try {
      const res = await getSecureEvidenceUrl(ref);
      setSignedDocUrl(res.signedUrl);
    } catch (e: any) {
      toast.error(e.message || "Failed to retrieve secure URL for document.");
    } finally {
      setIsSigning(false);
    }
  };

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
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

  // Calculated factual metrics (dashboard dashboard metrics)
  const pendingVerificationsCount = (verifications as any)?.filter?.((v: any) => v.status === "PENDING")?.length || 0;
  const pendingClaimsCount = (claims as any)?.filter?.((c: any) => c.status === "PENDING")?.length || 0;
  const openReportsCount = (reports as any)?.filter?.((r: any) => r.status === "OPEN")?.length || 0;
  const activeAppealsCount = (appeals as any)?.filter?.((a: any) => a.status === "APPEAL_SUBMITTED")?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Platform Administration</h1>
            <p className="text-sm text-muted-foreground">
              Monitor registered accounts, verification requests, property claims, reports, risk signals, and appeals.
            </p>
          </div>
          <button
            onClick={() => {
              queryClient.invalidateQueries();
              toast.success("Dashboard metrics refreshed.");
            }}
            className="inline-flex items-center gap-1 bg-secondary text-foreground text-xs font-semibold px-3 py-2 rounded-lg border hover:bg-secondary/80 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Queues
          </button>
        </div>

        {/* Dashboard Metrics Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="p-4 bg-card border rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Pending Verifications
            </span>
            <p className="text-2xl font-black text-primary">{pendingVerificationsCount}</p>
          </div>
          <div className="p-4 bg-card border rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Pending Property Claims
            </span>
            <p className="text-2xl font-black text-primary">{pendingClaimsCount}</p>
          </div>
          <div className="p-4 bg-card border rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Open Listing Reports
            </span>
            <p className="text-2xl font-black text-destructive">{openReportsCount}</p>
          </div>
          <div className="p-4 bg-card border rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Active Moderation Appeals
            </span>
            <p className="text-2xl font-black text-primary">{activeAppealsCount}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            User Admin
          </button>
          {hasPermission("VERIFICATION_VIEW") && (
            <button
              onClick={() => setActiveTab("verifications")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "verifications"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Verification Requests ({pendingVerificationsCount})
            </button>
          )}
          {hasPermission("CLAIMS_VIEW") && (
            <button
              onClick={() => setActiveTab("claims")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "claims"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Property Claims ({pendingClaimsCount})
            </button>
          )}
          {hasPermission("REPORTS_VIEW") && (
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Listing Reports & Risks ({openReportsCount})
            </button>
          )}
          {hasPermission("APPEALS_VIEW") && (
            <button
              onClick={() => setActiveTab("appeals")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "appeals"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Moderation Appeals ({activeAppealsCount})
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------
            TAB 1: USER ADMINISTRATION
           ------------------------------------------------------------ */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filters */}
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

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {isUsersLoading ? (
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
                      {usersData && usersData.users.length > 0 ? (
                        usersData.users.map((item) => (
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
                                className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer"
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
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            TAB 2: VERIFICATION REQUESTS
           ------------------------------------------------------------ */}
        {activeTab === "verifications" && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {isVerificationsLoading ? (
              <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4 pl-6">Subject / Type</th>
                      <th className="p-4">Submission Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {verifications && verifications.length > 0 ? (
                      verifications.map((item: any) => (
                        <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-semibold text-foreground">
                              {item.verification_type} Request
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Subject: {item.subject_type} ({item.subject_id})
                            </p>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(item.submitted_at).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === "VERIFIED"
                                  ? "bg-verified/10 text-verified border-verified/20"
                                  : item.status === "REJECTED" || item.status === "REVOKED"
                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                    : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => {
                                setSelectedVerification(item);
                                setReviewReason("");
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer"
                            >
                              Inspect Request
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center p-8 text-muted-foreground">
                          No verification requests submitted.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------
            TAB 3: PROPERTY CLAIMS
           ------------------------------------------------------------ */}
        {activeTab === "claims" && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {isClaimsLoading ? (
              <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4 pl-6">Property / User</th>
                      <th className="p-4">Date Claimed</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {claims && claims.length > 0 ? (
                      claims.map((item: any) => (
                        <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-semibold text-foreground">
                              {item.properties?.name || "Asset Record"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Claimed by: {item.profiles?.full_name || "Unknown User"}
                            </p>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === "APPROVED"
                                  ? "bg-verified/10 text-verified border-verified/20"
                                  : item.status === "REJECTED"
                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                    : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => {
                                setSelectedClaim(item);
                                setReviewReason("");
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer"
                            >
                              Inspect Claim
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center p-8 text-muted-foreground">
                          No property ownership claims registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------
            TAB 4: LISTING REPORTS & RISK FLAGS
           ------------------------------------------------------------ */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Risk Flags Section */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                <AlertOctagon className="h-5 w-5 text-destructive" /> Internal Automated Risk Flags
              </h3>
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                {isRiskFlagsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-4 pl-6">Risk Signal / Target</th>
                          <th className="p-4">Severity</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm">
                        {riskFlags && riskFlags.length > 0 ? (
                          riskFlags.map((item: any) => (
                            <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                              <td className="p-4 pl-6">
                                <p className="font-semibold text-foreground">{item.risk_type}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Target: {item.subject_type} ({item.subject_id})
                                </p>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    item.severity === "CRITICAL" || item.severity === "HIGH"
                                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                                      : "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"
                                  }`}
                                >
                                  {item.severity}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right space-x-2">
                                {item.status === "OPEN" && (
                                  <>
                                    <button
                                      onClick={() => resolveRiskFlagMutation.mutate({ id: item.id, status: "RESOLVED" })}
                                      className="text-verified font-bold hover:underline text-xs cursor-pointer"
                                    >
                                      Resolve
                                    </button>
                                    <button
                                      onClick={() => resolveRiskFlagMutation.mutate({ id: item.id, status: "DISMISSED" })}
                                      className="text-muted-foreground font-bold hover:underline text-xs cursor-pointer"
                                    >
                                      Dismiss
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center p-6 text-muted-foreground">
                              No automated risk flags open.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Reports Section */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-5 w-5 text-accent" /> Listing Reports
              </h3>
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                {isReportsLoading ? (
                  <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-4 pl-6">Listing / Issue</th>
                          <th className="p-4">Submitted Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm">
                        {reports && reports.length > 0 ? (
                          reports.map((item: any) => (
                            <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                              <td className="p-4 pl-6">
                                <p className="font-semibold text-foreground">
                                  {item.listings?.title || "Marketplace Listing"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Reason: {item.reason}
                                </p>
                              </td>
                              <td className="p-4 text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleString()}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    item.status === "RESOLVED"
                                      ? "bg-verified/10 text-verified border-verified/20"
                                      : item.status === "DISMISSED"
                                        ? "bg-secondary text-muted-foreground border-border"
                                        : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedReport(item);
                                    setReviewReason("");
                                  }}
                                  className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer"
                                >
                                  Inspect Report
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center p-8 text-muted-foreground">
                              No reports submitted by users.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            TAB 5: MODERATION APPEALS
           ------------------------------------------------------------ */}
        {activeTab === "appeals" && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {isAppealsLoading ? (
              <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4 pl-6">Appellant / Target</th>
                      <th className="p-4">Date Appealed</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {appeals && appeals.length > 0 ? (
                      appeals.map((item: any) => (
                        <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-semibold text-foreground">
                              {item.profiles?.full_name || "User Account"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Appeal on: {item.target_type} ({item.target_id})
                            </p>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === "REVERSED"
                                  ? "bg-verified/10 text-verified border-verified/20"
                                  : item.status === "UPHELD"
                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                    : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => {
                                setSelectedAppeal(item);
                                setReviewReason("");
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground transition-all cursor-pointer"
                            >
                              Inspect Appeal
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center p-8 text-muted-foreground">
                          No appeals submitted.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------
            MODALS / DRAWERS
           ------------------------------------------------------------ */}

        {/* 1. User detail inspector drawer */}
        {selectedUserId && activeTab === "users" && (
          <div className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-card border-l border-border h-full flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
                <h3 className="font-display font-bold text-lg text-foreground">User Detail Inspector</h3>
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setIsSuspending(false);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
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

                  <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Status</span>
                      <span className="font-bold uppercase text-primary">{selectedUser.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Phone</span>
                      <span className="font-semibold text-foreground">{selectedUser.phoneNumber || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Identity Verified</span>
                      <span className="font-bold text-verified">
                        {selectedUser.identityVerified ? "VERIFIED" : "UNVERIFIED"}
                      </span>
                    </div>
                  </div>

                  {/* Account suspension controls */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Account Status Controls
                    </p>
                    {selectedUser.status === "SUSPENDED" ? (
                      <button
                        onClick={() => reactivateMutation.mutate()}
                        disabled={reactivateMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-verified/20 text-verified bg-verified/5 hover:bg-verified/10 px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                      >
                        <UserCheck className="h-4 w-4" /> Restore & Reactivate Account
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {!isSuspending ? (
                          <button
                            onClick={() => setIsSuspending(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
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
                              placeholder="e.g. Terms violations"
                              value={suspensionReason}
                              onChange={(e) => setSuspensionReason(e.target.value)}
                              className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:outline-none text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={suspendMutation.isPending}
                                className="rounded-lg bg-destructive px-3.5 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                              >
                                Confirm Suspend
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsSuspending(false)}
                                className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Role configuration */}
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
                              className="text-destructive hover:bg-destructive/10 rounded font-semibold text-[10px] px-1"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        const val = e.target.value as AppRole;
                        if (val) {
                          manageRoleMutation.mutate({ role: val, action: "assign" });
                          e.target.value = "";
                        }
                      }}
                      className="px-3 py-1.5 bg-secondary/35 rounded-lg border border-border text-xs cursor-pointer focus:outline-none"
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
              )}
            </div>
          </div>
        )}

        {/* 2. Verification request modal inspector */}
        {selectedVerification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedVerification(null);
                  setSignedDocUrl(null);
                }}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display font-extrabold text-lg text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Inspect Verification Request
              </h3>

              <div className="space-y-3 text-xs leading-normal">
                <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/20 rounded-xl">
                  <div>
                    <span className="text-muted-foreground font-semibold">Verification Type:</span>
                    <p className="font-bold text-foreground">{selectedVerification.verification_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Subject Type:</span>
                    <p className="font-bold text-foreground">{selectedVerification.subject_type}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground font-semibold">Subject ID:</span>
                    <p className="font-mono text-[10px] break-all">{selectedVerification.subject_id}</p>
                  </div>
                </div>

                {/* Evidence files */}
                <div>
                  <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px] mb-2">
                    Submitted Evidence Documents (Private Storage)
                  </h4>
                  <div className="space-y-2">
                    {selectedVerification.verification_evidence?.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-3 border rounded-xl bg-secondary/10 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-foreground">{doc.evidence_type}</p>
                          <p className="text-[9px] text-muted-foreground truncate max-w-[200px]">
                            {doc.storage_reference}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewEvidence(doc.storage_reference)}
                          className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 rounded text-[10px] font-bold border hover:bg-secondary/80 cursor-pointer"
                        >
                          <FolderOpen className="h-3 w-3" /> View Private Doc
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display signed private doc URL */}
                {isSigning && (
                  <div className="flex gap-2 items-center text-primary font-bold text-[10px]">
                    <Loader2 className="h-3 w-3 animate-spin" /> Retrieving secure temporary download link...
                  </div>
                )}

                {signedDocUrl && (
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-xs">
                    <p className="font-bold text-primary mb-1">Temporary Signed Access URL:</p>
                    <a
                      href={signedDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold break-all inline-flex items-center gap-1 text-[10px]"
                    >
                      Click to inspect document (Valid for 15 mins) <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                {/* Verification Decisions */}
                {selectedVerification.status === "PENDING" && (
                  <div className="space-y-3 pt-3 border-t">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Decision Notes / Rejection Reason
                    </label>
                    <input
                      type="text"
                      placeholder="Required for rejections, optional for approval notes..."
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() =>
                          reviewVerMutation.mutate({
                            id: selectedVerification.id,
                            status: "VERIFIED",
                            reason: reviewReason,
                          })
                        }
                        className="px-3.5 py-2 bg-verified text-white text-xs font-semibold rounded-lg hover:bg-verified/95 cursor-pointer"
                      >
                        Approve & Verify
                      </button>
                      <button
                        onClick={() => {
                          if (!reviewReason) {
                            toast.error("Please supply a rejection reason first.");
                            return;
                          }
                          reviewVerMutation.mutate({
                            id: selectedVerification.id,
                            status: "REJECTED",
                            reason: reviewReason,
                          });
                        }}
                        className="px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer"
                      >
                        Reject Request
                      </button>
                    </div>
                  </div>
                )}

                {selectedVerification.status === "VERIFIED" && (
                  <div className="space-y-3 pt-3 border-t">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Revocation Reason
                    </label>
                    <input
                      type="text"
                      placeholder="Required justification for revoking this verified badge..."
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (!reviewReason) {
                            toast.error("Please supply a revocation reason first.");
                            return;
                          }
                          revokeVerMutation.mutate({
                            id: selectedVerification.id,
                            reason: reviewReason,
                          });
                        }}
                        className="px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer"
                      >
                        Revoke Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Property Claim inspector modal */}
        {selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150">
              <button
                onClick={() => setSelectedClaim(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display font-extrabold text-lg text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Inspect Property Claim
              </h3>

              <div className="space-y-3 text-xs leading-normal">
                <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
                  <p>
                    <span className="text-muted-foreground font-semibold">Property:</span>{" "}
                    <strong>{selectedClaim.properties?.name || "Asset"}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground font-semibold">User:</span>{" "}
                    <strong>{selectedClaim.profiles?.full_name || "Account User"}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground font-semibold">User Phone:</span>{" "}
                    <strong>{selectedClaim.profiles?.phone_number || "None"}</strong>
                  </p>
                </div>

                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Approved claims will automatically register the appellant as an active owner party relationship with write access to property details and listings units management.
                </p>

                {selectedClaim.status === "PENDING" && (
                  <div className="space-y-3 pt-3 border-t">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Rejection Reason (If rejecting)
                    </label>
                    <input
                      type="text"
                      placeholder="Why is this claim rejected..."
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() =>
                          resolveClaimMutation.mutate({
                            id: selectedClaim.id,
                            action: "APPROVE",
                          })
                        }
                        className="px-3.5 py-2 bg-verified text-white text-xs font-semibold rounded-lg hover:bg-verified/95 cursor-pointer"
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => {
                          if (!reviewReason) {
                            toast.error("Please supply a rejection reason first.");
                            return;
                          }
                          resolveClaimMutation.mutate({
                            id: selectedClaim.id,
                            action: "REJECT",
                            reason: reviewReason,
                          });
                        }}
                        className="px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer"
                      >
                        Reject Claim
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Listing Report inspector modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150">
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display font-extrabold text-lg text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" /> Inspect Listing Report
              </h3>

              <div className="space-y-3 text-xs leading-normal">
                <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
                  <p>
                    <span className="text-muted-foreground font-semibold">Report ID:</span>{" "}
                    <span className="font-mono text-[10px]">{selectedReport.id}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground font-semibold">Listing Name:</span>{" "}
                    <strong>{selectedReport.listings?.title || "Listing"}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground font-semibold">Issue Flagged:</span>{" "}
                    <strong className="text-destructive">{selectedReport.reason}</strong>
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold block mb-1">
                    Reporter Description Note:
                  </span>
                  <p className="p-3 bg-secondary/10 border rounded-lg text-foreground italic">
                    "{selectedReport.description || "No descriptive notes supplied."}"
                  </p>
                </div>

                {selectedReport.status === "OPEN" && (
                  <div className="space-y-3 pt-3 border-t">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Resolution Detail Note
                    </label>
                    <input
                      type="text"
                      placeholder="Resolving action explanation..."
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() =>
                          resolveReportMutation.mutate({
                            id: selectedReport.id,
                            action: "RESOLVE",
                            resolution: reviewReason,
                          })
                        }
                        className="px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer"
                      >
                        Resolve & Pause Listing
                      </button>
                      <button
                        onClick={() =>
                          resolveReportMutation.mutate({
                            id: selectedReport.id,
                            action: "DISMISS",
                            resolution: reviewReason,
                          })
                        }
                        className="px-3.5 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Moderation Appeal inspector modal */}
        {selectedAppeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 relative animate-in zoom-in-95 duration-150">
              <button
                onClick={() => setSelectedAppeal(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display font-extrabold text-lg text-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> Inspect Moderation Appeal
              </h3>

              <div className="space-y-3 text-xs leading-normal">
                <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
                  <p>
                    <span className="text-muted-foreground font-semibold">Appeal ID:</span>{" "}
                    <span className="font-mono text-[10px]">{selectedAppeal.id}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground font-semibold">Appellant:</span>{" "}
                    <strong>{selectedAppeal.profiles?.full_name || "User"}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground font-semibold">Target Action:</span>{" "}
                    <strong>{selectedAppeal.target_type} ({selectedAppeal.target_id})</strong>
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold block mb-1">
                    Appeal Reason Statement:
                  </span>
                  <p className="p-3 bg-secondary/10 border rounded-lg text-foreground italic">
                    "{selectedAppeal.reason}"
                  </p>
                </div>

                {selectedAppeal.status === "APPEAL_SUBMITTED" && (
                  <div className="space-y-3 pt-3 border-t">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Review notes / justification
                    </label>
                    <input
                      type="text"
                      placeholder="Notes for upholding or reversing the decision..."
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() =>
                          resolveAppealMutation.mutate({
                            id: selectedAppeal.id,
                            action: "REVERSED",
                            notes: reviewReason,
                          })
                        }
                        className="px-3.5 py-2 bg-verified text-white text-xs font-semibold rounded-lg hover:bg-verified/95 cursor-pointer"
                      >
                        Reverse Decision (Approve)
                      </button>
                      <button
                        onClick={() =>
                          resolveAppealMutation.mutate({
                            id: selectedAppeal.id,
                            action: "UPHELD",
                            notes: reviewReason,
                          })
                        }
                        className="px-3.5 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer"
                      >
                        Uphold Decision (Reject)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
