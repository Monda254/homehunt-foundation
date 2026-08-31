/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  getTenancyDetails,
  prepareLease,
  sendLease,
  executeLease,
  scheduleMoveIn,
  endTenancy,
  getSecureTenancyDocUrl,
} from "@/features/tenancies/tenancies.functions";
import {
  Loader2,
  ChevronLeft,
  Calendar,
  Building,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  Upload,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  ClipboardList,
  Flame,
  AlertTriangle,
  FolderLock,
} from "lucide-react";
import { TERMINATION_REASONS } from "@/features/tenancies/tenancies.types";

export const Route = createFileRoute("/dashboard/tenancies/$id")({
  component: () => (
    <RequireAuth>
      <ProviderTenancyWorkspaceWrapper />
    </RequireAuth>
  ),
});

function ProviderTenancyWorkspaceWrapper() {
  const { id } = Route.useParams();
  return <ProviderTenancyWorkspaceComponent tenancyId={id} />;
}

interface ProviderTenancyWorkspaceProps {
  tenancyId: string;
}

function ProviderTenancyWorkspaceComponent({ tenancyId }: ProviderTenancyWorkspaceProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states: Lease preparation
  const [rentAmount, setRentAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [petsPolicy, setPetsPolicy] = useState("");
  const [utilities, setUtilities] = useState("");
  const [noticePeriod, setNoticePeriod] = useState<number>(30);
  const [occupancyLimit, setOccupancyLimit] = useState<number>(2);
  const [otherRules, setOtherRules] = useState("");
  const [savingLease, setSavingLease] = useState(false);
  const [sendingLeaseDraft, setSendingLeaseDraft] = useState(false);

  // Form states: Move-in scheduling
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Form states: Execution countersign
  const [executing, setExecuting] = useState(false);

  // Form states: End Tenancy
  const [endReason, setEndReason] = useState<any>("LEASE_EXPIRED");
  const [endNotes, setEndNotes] = useState("");
  const [ending, setEnding] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [tenancyId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getTenancyDetails(tenancyId);
      setDetails(data);
      if (data?.tenancy) {
        setRentAmount(data.tenancy.rent_snapshot || 0);
        setDepositAmount(data.tenancy.deposit_snapshot || 0);
        // Default start/end dates if not set
        setStartDate(data.tenancy.start_date || new Date().toISOString().split("T")[0]);
        // Set default end date to 1 year later
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        setEndDate(data.tenancy.end_date || futureDate.toISOString().split("T")[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load tenancy details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareLease = async () => {
    setSavingLease(true);
    try {
      await prepareLease({
        tenancyId,
        rentAmount,
        depositAmount,
        startDate,
        endDate,
        terms: {
          petsPolicy,
          utilitiesResponsibility: utilities,
          noticePeriodDays: noticePeriod,
          occupancyLimit,
          otherRules,
        },
      });
      await fetchDetails();
      alert("Lease agreement draft saved.");
    } catch (err: any) {
      alert(err.message || "Failed to save lease terms.");
    } finally {
      setSavingLease(false);
    }
  };

  const handleSendLeaseDraft = async (leaseId: string) => {
    setSendingLeaseDraft(true);
    try {
      await sendLease(leaseId);
      await fetchDetails();
      alert("Lease sent to tenant for review & digital signature.");
    } catch (err: any) {
      alert(err.message || "Failed to send lease.");
    } finally {
      setSendingLeaseDraft(false);
    }
  };

  const handleExecuteLease = async (leaseId: string) => {
    if (!confirm("Are you sure you want to countersign and execute this lease agreement?")) return;
    setExecuting(true);
    try {
      await executeLease(leaseId);
      await fetchDetails();
      alert("Lease executed successfully! Tenancy is now active.");
    } catch (err: any) {
      alert(err.message || "Execution failed.");
    } finally {
      setExecuting(false);
    }
  };

  const handleScheduleInspection = async () => {
    if (!scheduledDate) {
      alert("Please select inspection date & time.");
      return;
    }
    setScheduling(true);
    try {
      await scheduleMoveIn({
        tenancyId,
        scheduledDate: new Date(scheduledDate).toISOString(),
      });
      setScheduledDate("");
      await fetchDetails();
      alert("Move-in inspection scheduled.");
    } catch (err: any) {
      alert(err.message || "Scheduling failed.");
    } finally {
      setScheduling(false);
    }
  };

  const handleEndTenancy = async () => {
    if (!confirm("Are you sure you want to end/terminate this tenancy agreement?")) return;
    setEnding(true);
    try {
      await endTenancy({
        tenancyId,
        reason: endReason,
        notes: endNotes,
      });
      setEndNotes("");
      setShowEndForm(false);
      await fetchDetails();
      alert("Tenancy officially marked ended. Listing/unit availability reset.");
    } catch (err: any) {
      alert(err.message || "Termination failed.");
    } finally {
      setEnding(false);
    }
  };

  const handleDownloadDoc = async (filePath: string) => {
    try {
      const res = await getSecureTenancyDocUrl(filePath);
      if (res?.url) {
        window.open(res.url, "_blank");
      }
    } catch (err) {
      console.error("Failed to generate download url", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="badge badge-secondary">Pending</span>;
      case "LEASE_PREPARATION":
        return (
          <span className="badge bg-blue-500/10 text-blue-500 border-blue-500/20">Lease Prep</span>
        );
      case "AWAITING_ACCEPTANCE":
        return (
          <span className="badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
            Sent to Tenant
          </span>
        );
      case "ACTIVE":
        return (
          <span className="badge bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
            Active
          </span>
        );
      case "MOVE_IN_PENDING":
        return (
          <span className="badge bg-indigo-500/10 text-indigo-500 border-indigo-500/20 animate-pulse">
            Move-in Pending
          </span>
        );
      case "OCCUPIED":
        return <span className="badge badge-success font-bold">Occupied</span>;
      case "NOTICE_GIVEN":
        return (
          <span className="badge bg-orange-500/10 text-orange-500 border-orange-500/20">
            Notice Given
          </span>
        );
      case "ENDED":
        return <span className="badge bg-neutral-500/10 text-neutral-500">Ended</span>;
      case "TERMINATED":
        return <span className="badge badge-danger font-bold">Terminated</span>;
      case "CANCELLED":
        return <span className="badge bg-neutral-500/10 text-neutral-500">Cancelled</span>;
      default:
        return <span className="badge bg-neutral-500/10 text-neutral-500">{status}</span>;
    }
  };

  if (errorMsg || !details) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-xl mx-auto text-center py-12">
          <div className="h-12 w-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">Access Denied / Error</h2>
          <p className="text-sm text-muted-foreground">
            {errorMsg || "Record does not exist or you lack provider review permission."}
          </p>
          <div className="pt-4">
            <Link to="/dashboard/tenancies" className="btn btn-secondary text-xs">
              Back to List
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { tenancy: ten, leases, moveIn, history } = details;
  const currentLease = leases && leases.length > 0 ? leases[0] : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/tenancies"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </div>

        {/* Tenancy Summary Banner */}
        <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Ref: {ten.tenancy_reference}
              </span>
              {getStatusBadge(ten.status)}
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {ten.tenant?.full_name || "Rental Tenant"}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-primary" /> {ten.listings?.title}
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-secondary/30 px-5 py-3 rounded-xl border border-border/30">
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                Monthly Rent
              </span>
              <span className="font-bold text-foreground text-sm">
                {ten.currency_snapshot} {ten.rent_snapshot.toLocaleString()}
              </span>
            </div>
            <div className="border-l border-border/50 h-8" />
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                Security Deposit
              </span>
              <span className="font-bold text-foreground text-sm">
                {ten.currency_snapshot} {ten.deposit_snapshot.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Work Panel grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main workspace */}
          <div className="lg:col-span-2 space-y-6">
            {/* COUNTERSIGN / EXECUTE LEASE */}
            {currentLease && currentLease.status === "TENANT_ACCEPTED" && (
              <div className="surface-card p-6 shadow-sm border border-emerald-500/20 bg-emerald-500/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <h3 className="font-display font-bold text-base">
                    Lease Agreement Accepted by Tenant
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The tenant has accepted the lease terms. Countersign and execute the lease
                  contract to activate the tenancy.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={executing}
                    onClick={() => handleExecuteLease(currentLease.id)}
                    className="btn btn-primary bg-emerald-600 text-white hover:bg-emerald-500 text-xs flex items-center gap-2"
                  >
                    {executing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Countersign & Execute Lease
                  </button>
                </div>
              </div>
            )}

            {/* LEASE PREPARATION WORKSPACE */}
            {(ten.status === "PENDING" ||
              ten.status === "LEASE_PREPARATION" ||
              ten.status === "AWAITING_ACCEPTANCE") && (
              <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Lease Terms Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prepare the lease details below. Once saved, send the draft to the tenant for
                  signature.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="label">Monthly Rent Amount (KES)</label>
                    <input
                      type="number"
                      className="input"
                      value={rentAmount}
                      onChange={(e) => setRentAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="label">Required Security Deposit (KES)</label>
                    <input
                      type="number"
                      className="input"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="label">Lease Commencement Date</label>
                    <input
                      type="date"
                      className="input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Lease Termination Date</label>
                    <input
                      type="date"
                      className="input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Notice Period (Days)</label>
                    <input
                      type="number"
                      className="input"
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(parseInt(e.target.value) || 30)}
                    />
                  </div>
                  <div>
                    <label className="label">Occupancy Limit (Adults)</label>
                    <input
                      type="number"
                      className="input"
                      value={occupancyLimit}
                      onChange={(e) => setOccupancyLimit(parseInt(e.target.value) || 2)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Pets Guidelines</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., No dogs permitted. Small cats allowed on pre-approval."
                      value={petsPolicy}
                      onChange={(e) => setPetsPolicy(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Utilities Responsibility</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Tenant is responsible for electricity and water meter billings."
                      value={utilities}
                      onChange={(e) => setUtilities(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Other Custom Rules</label>
                    <textarea
                      rows={3}
                      className="textarea"
                      placeholder="Enter additional terms..."
                      value={otherRules}
                      onChange={(e) => setOtherRules(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={savingLease}
                    onClick={handlePrepareLease}
                    className="btn btn-secondary text-xs flex items-center gap-2"
                  >
                    {savingLease && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Lease Draft
                  </button>

                  {currentLease && currentLease.status === "DRAFT" && (
                    <button
                      type="button"
                      disabled={sendingLeaseDraft}
                      onClick={() => handleSendLeaseDraft(currentLease.id)}
                      className="btn btn-primary text-xs flex items-center gap-2"
                    >
                      {sendingLeaseDraft && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Send Draft to Tenant
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SCHEDULE MOVE-IN INSPECTION */}
            {(ten.status === "ACTIVE" || ten.status === "MOVE_IN_PENDING") && (
              <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
                <h3 className="font-display font-semibold text-base">
                  Schedule Move-In Walkthrough
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Schedule the keys handover and inspection walkthrough appointment with the tenant.
                </p>

                <div className="flex flex-wrap items-end gap-3 pt-2">
                  <div className="w-64">
                    <label className="label text-xs">Inspection Date & Time</label>
                    <input
                      type="datetime-local"
                      className="input text-xs h-9 py-1"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={scheduling}
                    onClick={handleScheduleInspection}
                    className="btn btn-primary text-xs h-9"
                  >
                    {scheduling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Schedule Appointment
                  </button>
                </div>
              </div>
            )}

            {/* MOVE-IN RECORD / INSPECTION CHECKLIST RESULTS */}
            {moveIn && moveIn.status === "COMPLETED" && (
              <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <h3 className="font-display font-semibold text-base">
                    Completed Move-In Checklist
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs bg-secondary/15 p-4 rounded-xl border border-border/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Keys handed over & received</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Access card credentials verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Condition inspected & documented</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Meter coordinates & logs provided</span>
                  </div>
                </div>

                {moveIn.condition_notes && (
                  <div className="text-xs max-w-xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Inspection Notes
                    </span>
                    <p className="text-foreground bg-card p-3 rounded-xl border border-border/40 mt-1">
                      "{moveIn.condition_notes}"
                    </p>
                  </div>
                )}

                {moveIn.condition_media && moveIn.condition_media.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Inspection Photographs
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {moveIn.condition_media.map((m: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleDownloadDoc(m)}
                          className="btn btn-secondary text-[10px] px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> View Photograph{" "}
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lease agreements logs */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-base text-foreground">
                Agreement Versions
              </h3>

              <div className="grid gap-3">
                {leases.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No lease document generated yet.
                  </p>
                ) : (
                  leases.map((l: any) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground block">
                            Lease Contract Version {l.version}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            Status: <span className="capitalize">{l.status.toLowerCase()}</span> •
                            Period: {new Date(l.start_date).toLocaleDateString()} -{" "}
                            {new Date(l.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {l.status === "EXECUTED" && l.file_path && (
                        <button
                          onClick={() => handleDownloadDoc(l.file_path)}
                          className="btn btn-secondary text-[10px] px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> View Contract
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Timeline & Actions sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-base text-foreground">
                Workspace Timeline
              </h3>

              <div className="relative border-l-2 border-border/80 pl-5 ml-2.5 space-y-6 py-2">
                {history.map((event: any) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[27px] top-0.5 bg-background border-2 border-primary rounded-full h-3 w-3" />
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                        {event.new_status.replace(/_/g, " ")}
                      </span>
                      {event.notes && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {event.notes}
                        </p>
                      )}
                      <span className="text-[9px] text-muted-foreground block mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* END / TERMINATE TENANCY CONTROL */}
            {ten.status !== "ENDED" &&
              ten.status !== "TERMINATED" &&
              ten.status !== "CANCELLED" && (
                <div className="surface-card p-6 shadow-sm border border-destructive/20 bg-destructive/5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <Flame className="h-5 w-5 shrink-0" />
                    <h4 className="font-display font-bold text-sm">Terminate Tenancy</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Officially end this tenancy agreement and release property locks/keys. This
                    resets occupancy state.
                  </p>

                  {!showEndForm ? (
                    <button
                      type="button"
                      onClick={() => setShowEndForm(true)}
                      className="btn btn-secondary text-xs w-full border-destructive/20 text-destructive hover:bg-destructive/5 py-2"
                    >
                      End Tenancy
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-destructive/10">
                      <div>
                        <label className="label text-[10px] uppercase font-bold text-muted-foreground">
                          Termination Reason
                        </label>
                        <select
                          value={endReason}
                          onChange={(e) => setEndReason(e.target.value as any)}
                          className="input text-xs"
                        >
                          {TERMINATION_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-[10px] uppercase font-bold text-muted-foreground">
                          Optional Notes
                        </label>
                        <textarea
                          rows={2}
                          className="textarea text-xs"
                          value={endNotes}
                          onChange={(e) => setEndNotes(e.target.value)}
                          placeholder="Detail the exit state..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={ending}
                          onClick={handleEndTenancy}
                          className="btn btn-primary bg-destructive text-white hover:bg-destructive/95 text-xs flex items-center justify-center gap-1.5 py-1.5 flex-1"
                        >
                          {ending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Confirm End
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEndForm(false)}
                          className="btn btn-secondary text-xs py-1.5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Direct messages coordination */}
            <div className="surface-card p-5 border border-border/80 rounded-2xl space-y-3">
              <h4 className="font-display font-bold text-sm">Coordinate Move-In</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect inside the platform thread to coordinate inspection dates or ask rent
                questions.
              </p>
              <Link
                to="/messages"
                className="btn btn-secondary text-xs w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground"
              >
                <MessageSquare className="h-4 w-4" /> Message Tenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
