/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  getTenancyDetails,
  acceptLease,
  declineLease,
  completeMoveIn,
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
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tenancies/$id")({
  component: () => (
    <RequireAuth>
      <TenancyDetailsWrapper />
    </RequireAuth>
  ),
});

function TenancyDetailsWrapper() {
  const { id } = Route.useParams();
  return <TenancyDetailsComponent tenancyId={id} />;
}

interface TenancyDetailsProps {
  tenancyId: string;
}

function TenancyDetailsComponent({ tenancyId }: TenancyDetailsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign State
  const [signing, setSigning] = useState(false);

  // Correction State
  const [correctionNote, setCorrectionNote] = useState("");
  const [declining, setDeclining] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  // Move-in state
  const [keysReceived, setKeysReceived] = useState(false);
  const [accessConfirmed, setAccessConfirmed] = useState(false);
  const [conditionDocumented, setConditionDocumented] = useState(false);
  const [utilityInfoProvided, setUtilityInfoProvided] = useState(false);
  const [moveInNotes, setMoveInNotes] = useState("");
  const [moveInMedia, setMoveInMedia] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [completingMoveIn, setCompletingMoveIn] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [tenancyId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getTenancyDetails(tenancyId);
      setDetails(data);
      if (data?.moveIn) {
        setKeysReceived(data.moveIn.checklist?.keysReceived || false);
        setAccessConfirmed(data.moveIn.checklist?.accessConfirmed || false);
        setConditionDocumented(data.moveIn.checklist?.conditionDocumented || false);
        setUtilityInfoProvided(data.moveIn.checklist?.utilityInfoProvided || false);
        setMoveInNotes(data.moveIn.condition_notes || "");
        setMoveInMedia(data.moveIn.condition_media || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load tenancy details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptLease = async (leaseId: string) => {
    if (!confirm("Are you sure you want to digitally sign and accept this lease agreement?"))
      return;
    setSigning(true);
    try {
      await acceptLease({ leaseId });
      await fetchDetails();
      alert("Lease agreement accepted successfully. Landlord has been notified.");
    } catch (err: any) {
      alert(err.message || "Acceptance failed.");
    } finally {
      setSigning(false);
    }
  };

  const handleDeclineLease = async (leaseId: string) => {
    if (!correctionNote.trim()) {
      alert("Please provide details for the correction request.");
      return;
    }
    setDeclining(true);
    try {
      await declineLease({ leaseId, notes: correctionNote });
      setCorrectionNote("");
      setShowDeclineForm(false);
      await fetchDetails();
      alert("Lease declined. Landlord has been notified to edit terms.");
    } catch (err: any) {
      alert(err.message || "Decline failed.");
    } finally {
      setDeclining(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingMedia(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `${user.userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("tenancy_documents")
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      setMoveInMedia((prev) => [...prev, storagePath]);
    } catch (err: any) {
      alert(err.message || "Failed to upload file.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCompleteMoveIn = async () => {
    if (!keysReceived || !accessConfirmed || !conditionDocumented || !utilityInfoProvided) {
      alert("Please complete all checklist requirements before signing off occupancy.");
      return;
    }
    setCompletingMoveIn(true);
    try {
      await completeMoveIn({
        tenancyId,
        actualDate: new Date().toISOString(),
        checklist: {
          keysReceived,
          accessConfirmed,
          conditionDocumented,
          utilityInfoProvided,
        },
        conditionNotes: moveInNotes,
        conditionMedia: moveInMedia,
      });
      await fetchDetails();
      alert("Move-in successfully completed! Welcome to your new home.");
    } catch (err: any) {
      alert(err.message || "Submission failed.");
    } finally {
      setCompletingMoveIn(false);
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
          <span className="badge bg-blue-500/10 text-blue-500 border-blue-500/20">
            Lease Preparing
          </span>
        );
      case "AWAITING_ACCEPTANCE":
        return (
          <span className="badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
            Sign Required
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
        return <span className="badge badge-danger">Terminated</span>;
      case "CANCELLED":
        return <span className="badge bg-neutral-500/10 text-neutral-500">Cancelled</span>;
      default:
        return <span className="badge bg-neutral-500/10 text-neutral-500">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (errorMsg || !details) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-xl mx-auto text-center py-12">
          <div className="h-12 w-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">Failed to Load Tenancy</h2>
          <p className="text-sm text-muted-foreground">
            {errorMsg || "Tenancy record does not exist or you lack access permissions."}
          </p>
          <div className="pt-4">
            <Link to="/tenancies" className="btn btn-secondary text-xs">
              Back to Tenancies
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
            to="/tenancies"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to My Tenancies
          </Link>
        </div>

        {/* Summary Banner */}
        <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Ref: {ten.tenancy_reference}
              </span>
              {getStatusBadge(ten.status)}
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {ten.listings?.title || "Rental Home"}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {ten.properties?.name},{" "}
                {ten.properties?.county}
              </span>
              {ten.unit?.unit_number && (
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-primary" /> Unit: {ten.unit.unit_number}
                </span>
              )}
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

        {/* Detailed Layout columns */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main workspace (Lease signature, checklists) */}
          <div className="lg:col-span-2 space-y-6">
            {/* SIGN REQUIRED PANEL */}
            {ten.status === "AWAITING_ACCEPTANCE" &&
              currentLease &&
              currentLease.status === "SENT_TO_TENANT" && (
                <div className="surface-card p-6 shadow-sm border border-yellow-500/20 bg-yellow-500/5 rounded-2xl space-y-5">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <h3 className="font-display font-bold text-base">
                      Lease Agreement Action Required
                    </h3>
                  </div>

                  <div className="bg-card p-4 rounded-xl border border-border/80 text-xs space-y-3 max-w-2xl leading-relaxed">
                    <p className="font-semibold text-foreground">
                      Summary of Terms (Version {currentLease.version}):
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 pt-1">
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>{" "}
                        <span className="font-medium">
                          {new Date(currentLease.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date:</span>{" "}
                        <span className="font-medium">
                          {new Date(currentLease.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Notice Period:</span>{" "}
                        <span className="font-medium">
                          {currentLease.terms?.noticePeriodDays || 30} Days
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Occupancy Limit:</span>{" "}
                        <span className="font-medium">
                          {currentLease.terms?.occupancyLimit || 2} Occupant(s)
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-border/40 my-2 pt-2" />
                    <div>
                      <span className="text-muted-foreground block font-bold mb-1">
                        Utilities responsibility:
                      </span>
                      <p className="text-muted-foreground">
                        {currentLease.terms?.utilitiesResponsibility || "Tenant responsibility."}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-bold mb-1">
                        Pets Policy:
                      </span>
                      <p className="text-muted-foreground">
                        {currentLease.terms?.petsPolicy ||
                          "No pets permitted without landlord approval."}
                      </p>
                    </div>
                    {currentLease.terms?.otherRules && (
                      <div>
                        <span className="text-muted-foreground block font-bold mb-1">
                          Other Rules & Guidelines:
                        </span>
                        <p className="text-muted-foreground">{currentLease.terms.otherRules}</p>
                      </div>
                    )}
                  </div>

                  {!showDeclineForm ? (
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        disabled={signing}
                        onClick={() => handleAcceptLease(currentLease.id)}
                        className="btn btn-primary text-xs flex items-center gap-2"
                      >
                        {signing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Digitally Sign & Accept Lease
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeclineForm(true)}
                        className="btn btn-secondary text-xs border-destructive/20 text-destructive hover:bg-destructive/5"
                      >
                        Request Corrections
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-3 border-t border-border/60 max-w-xl">
                      <div>
                        <label className="label text-xs">
                          Reason for decline / Needed corrections
                        </label>
                        <textarea
                          rows={3}
                          className="textarea text-xs"
                          value={correctionNote}
                          onChange={(e) => setCorrectionNote(e.target.value)}
                          placeholder="Detail which terms, dates, or rent details need to be corrected..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={declining}
                          onClick={() => handleDeclineLease(currentLease.id)}
                          className="btn btn-primary bg-destructive text-white hover:bg-destructive/95 text-xs flex items-center gap-2"
                        >
                          {declining && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Decline Terms
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeclineForm(false)}
                          className="btn btn-secondary text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* MOVE-IN ACTION REQUIRED PANEL */}
            {ten.status === "MOVE_IN_PENDING" && (
              <div className="surface-card p-6 shadow-sm border border-primary/20 bg-primary/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <ClipboardList className="h-5 w-5 shrink-0" />
                  <h3 className="font-display font-bold text-base">
                    Move-In Inspection & Sign-off
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                  Please verify the property layout and check off items during your walkthrough
                  inspection. Once confirmed, this signs off on the occupancy condition.
                </p>

                <div className="grid gap-3 pt-2 max-w-lg">
                  <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40">
                    <input
                      type="checkbox"
                      id="keys"
                      checked={keysReceived}
                      onChange={(e) => setKeysReceived(e.target.checked)}
                      className="rounded text-primary border-border focus:ring-primary h-4 w-4"
                    />
                    <label
                      htmlFor="keys"
                      className="text-xs font-semibold text-foreground select-none"
                    >
                      Received keys and access cards
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40">
                    <input
                      type="checkbox"
                      id="access"
                      checked={accessConfirmed}
                      onChange={(e) => setAccessConfirmed(e.target.checked)}
                      className="rounded text-primary border-border focus:ring-primary h-4 w-4"
                    />
                    <label
                      htmlFor="access"
                      className="text-xs font-semibold text-foreground select-none"
                    >
                      Access to unit and common facilities verified
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40">
                    <input
                      type="checkbox"
                      id="condition"
                      checked={conditionDocumented}
                      onChange={(e) => setConditionDocumented(e.target.checked)}
                      className="rounded text-primary border-border focus:ring-primary h-4 w-4"
                    />
                    <label
                      htmlFor="condition"
                      className="text-xs font-semibold text-foreground select-none"
                    >
                      Property condition is documented and inspected
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/40">
                    <input
                      type="checkbox"
                      id="utility"
                      checked={utilityInfoProvided}
                      onChange={(e) => setUtilityInfoProvided(e.target.checked)}
                      className="rounded text-primary border-border focus:ring-primary h-4 w-4"
                    />
                    <label
                      htmlFor="utility"
                      className="text-xs font-semibold text-foreground select-none"
                    >
                      Utility meters & local guide information provided
                    </label>
                  </div>
                </div>

                {/* Move-in Notes & Uploads */}
                <div className="space-y-4 pt-3 max-w-xl">
                  <div>
                    <label className="label text-xs">Walkthrough Inspection Notes (Optional)</label>
                    <textarea
                      rows={2}
                      className="textarea text-xs"
                      value={moveInNotes}
                      onChange={(e) => setMoveInNotes(e.target.value)}
                      placeholder="Note down any defects, damages, or requests..."
                    />
                  </div>

                  {/* Document uploads */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Condition Evidence Photos / Logs ({moveInMedia.length})
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {moveInMedia.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 w-fit"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>File {idx + 1}</span>
                        </div>
                      ))}
                      <label className="btn btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer">
                        {uploadingMedia ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Upload File
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handleMediaUpload}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={completingMoveIn}
                      onClick={handleCompleteMoveIn}
                      className="btn btn-primary text-xs flex items-center gap-2"
                    >
                      {completingMoveIn && <Loader2 className="h-4 w-4 animate-spin" />}
                      Confirm Occupancy & Sign Move-In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* General Tenancy Overview */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Tenancy Parameters
              </h3>

              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    Property Provider
                  </span>
                  <div className="surface-card p-3.5 border border-border/40 rounded-xl space-y-1">
                    <p className="text-foreground font-medium">{ten.provider?.full_name}</p>
                    <p className="text-muted-foreground">{ten.provider?.phone_number}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    Tenancy Period
                  </span>
                  <div className="surface-card p-3.5 border border-border/40 rounded-xl space-y-1">
                    <p className="text-foreground">
                      <strong>Start Date:</strong>{" "}
                      {ten.start_date
                        ? new Date(ten.start_date).toLocaleDateString()
                        : "Not started"}
                    </p>
                    <p className="text-foreground">
                      <strong>End Date:</strong>{" "}
                      {ten.end_date
                        ? new Date(ten.end_date).toLocaleDateString()
                        : "Ongoing / Open"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lease agreements versions log */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-base text-foreground">
                Lease Agreement Files
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

          {/* Timeline sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-base text-foreground">
                Tenancy Timeline
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

            {/* Direct Messaging shortcut */}
            <div className="surface-card p-5 border border-primary/20 bg-primary/5 rounded-2xl space-y-3">
              <h4 className="font-display font-bold text-sm text-foreground">Contact Landlord</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect inside the platform thread to coordinate inspection dates or ask rent
                questions.
              </p>
              <div className="pt-2">
                <Link
                  to="/messages"
                  className="btn btn-primary text-xs w-full flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> Message Landlord
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
