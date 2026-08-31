/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import React, { useState, useEffect } from "react";
import {
  getApplicationDetails,
  providerReviewApplication,
  providerRequestInformation,
  providerRecordDecision,
  getSecureApplicationDocUrl,
} from "@/features/applications/applications.functions";
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
  Mail,
  UserCheck,
  BookmarkCheck,
  FolderLock,
} from "lucide-react";
import { REJECTION_REASONS } from "@/features/applications/applications.types";

export const Route = createFileRoute("/dashboard/applications/$id")({
  component: () => (
    <RequireAuth>
      <ProviderReviewWrapper />
    </RequireAuth>
  ),
});

function ProviderReviewWrapper() {
  const { id } = Route.useParams();
  return <ProviderReviewComponent applicationId={id} />;
}

interface ProviderReviewComponentProps {
  applicationId: string;
}

function ProviderReviewComponent({ applicationId }: ProviderReviewComponentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Note log states
  const [reviewNote, setReviewNote] = useState("");
  const [reviewRec, setReviewRec] = useState<"APPROVE" | "REJECT" | "SHORTLIST" | "HOLD">(
    "SHORTLIST",
  );
  const [savingNote, setSavingNote] = useState(false);

  // Info Request states
  const [reqName, setReqName] = useState("");
  const [reqMsg, setReqMsg] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Decision Panel states
  const [decisionAction, setDecisionAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectionReason, setRejectionReason] = useState<any>("REQUIREMENTS_NOT_MET");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [applicationId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getApplicationDetails(applicationId);
      setDetails(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReviewNote = async () => {
    if (!reviewNote.trim()) return;
    setSavingNote(true);
    try {
      await providerReviewApplication({
        applicationId,
        recommendation: reviewRec,
        notes: reviewNote,
      });
      setReviewNote("");
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || "Failed to save review note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleSendInfoRequest = async () => {
    if (!reqName.trim() || !reqMsg.trim()) {
      alert("Please provide a requirement name and request message.");
      return;
    }
    setSendingRequest(true);
    try {
      await providerRequestInformation({
        applicationId,
        requirementName: reqName,
        message: reqMsg,
      });
      setReqName("");
      setReqMsg("");
      await fetchDetails();
      alert("Information request sent to applicant.");
    } catch (err: any) {
      alert(err.message || "Failed to send request.");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSubmitDecision = async () => {
    if (!decisionAction) return;
    setSubmittingDecision(true);
    try {
      await providerRecordDecision({
        applicationId,
        action: decisionAction,
        rejectionReason: decisionAction === "REJECT" ? rejectionReason : null,
        rejectionNotes: decisionAction === "REJECT" ? rejectionNotes : null,
      });
      setDecisionAction(null);
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || "Failed to log decision.");
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleDownloadDoc = async (filePath: string) => {
    try {
      const res = await getSecureApplicationDocUrl(filePath);
      if (res?.url) {
        window.open(res.url, "_blank");
      }
    } catch (err) {
      console.error("Failed to generate download url", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="badge badge-primary">Submitted</span>;
      case "UNDER_REVIEW":
        return (
          <span className="badge bg-blue-500/10 text-blue-500 border-blue-500/20">
            Under Review
          </span>
        );
      case "ADDITIONAL_INFORMATION_REQUIRED":
        return (
          <span className="badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Awaiting Info
          </span>
        );
      case "RESUBMITTED":
        return (
          <span className="badge bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
            Resubmitted
          </span>
        );
      case "SHORTLISTED":
        return (
          <span className="badge bg-purple-500/10 text-purple-500 border-purple-500/20">
            Shortlisted
          </span>
        );
      case "APPROVED":
        return <span className="badge badge-success">Approved</span>;
      case "REJECTED":
        return <span className="badge badge-danger">Rejected</span>;
      case "WITHDRAWN":
        return <span className="badge bg-neutral-500/10 text-neutral-500">Withdrawn</span>;
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
          <h2 className="font-display text-lg font-bold text-foreground">Access Denied / Error</h2>
          <p className="text-sm text-muted-foreground">
            {errorMsg || "Record does not exist or you lack provider review permission."}
          </p>
          <div className="pt-4">
            <Link to="/dashboard/applications" className="btn btn-secondary text-xs">
              Back to List
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { application: app, documents, requests, reviews } = details;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/applications"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </div>

        {/* Application Summary Banner */}
        <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {app.application_number}
              </span>
              {getStatusBadge(app.status)}
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {app.applicant?.full_name || "Applicant Name"}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-primary" /> {app.listings?.title}
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-secondary/30 px-5 py-3 rounded-xl border border-border/30">
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                Advertised Rent
              </span>
              <span className="font-bold text-foreground text-sm">
                {app.currency_snapshot} {app.rent_snapshot.toLocaleString()}
              </span>
            </div>
            <div className="border-l border-border/50 h-8" />
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                Deposit Requirement
              </span>
              <span className="font-bold text-foreground text-sm">
                {app.currency_snapshot} {app.deposit_snapshot.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left panel: Info logs & document reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Profile Details */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Applicant Verification Summary
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Full Contact Name</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {app.personal_info?.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email & Phone</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {app.personal_info?.email} • {app.personal_info?.phoneNumber}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Preferred Move-in</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {app.preferred_move_in_date || "Immediate / Flexible"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Move-in Occupancy Details</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {app.household_info?.adults} Adults, {app.household_info?.children} Children
                    (Pets: {app.household_info?.pets ? "Yes" : "No"})
                  </span>
                </div>
                <div className="sm:col-span-2 border-t border-border/60 pt-4 grid gap-4 sm:grid-cols-2 bg-secondary/10 p-3.5 rounded-xl">
                  <div>
                    <span className="text-muted-foreground block">Employment Status</span>
                    <span className="font-semibold text-foreground mt-0.5 block capitalize">
                      {app.employment_info?.status?.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Monthly Income Range</span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {app.employment_info?.incomeRange}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Evidence Viewer */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <FolderLock className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Submitted Private Documents
                </h3>
              </div>

              <div className="grid gap-3">
                {documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No evidence documents submitted by applicant yet.
                  </p>
                ) : (
                  documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground block">{doc.name}</span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            Status: <span className="capitalize">{doc.status.toLowerCase()}</span> •
                            Size: {Math.round(doc.file_size / 1024)} KB
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadDoc(doc.file_path)}
                        className="btn btn-secondary text-[10px] px-3 py-1.5 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Decrypt & View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Request Additional Information panel */}
            {app.status !== "APPROVED" && app.status !== "REJECTED" && (
              <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4 bg-secondary/5">
                <h3 className="font-display font-semibold text-base">
                  Request Additional Information
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  If the submitted references or documents are missing or require clarification,
                  send a direct request to the applicant.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="label">Requested Document / Info Name</label>
                    <input
                      type="text"
                      className="input"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g., Updated Employment Contract"
                    />
                  </div>
                  <div>
                    <label className="label">Instructions message</label>
                    <textarea
                      rows={2}
                      value={reqMsg}
                      onChange={(e) => setReqMsg(e.target.value)}
                      placeholder="Explain what is missing or incorrect..."
                      className="textarea"
                    />
                  </div>
                  <button
                    onClick={handleSendInfoRequest}
                    disabled={sendingRequest}
                    className="btn btn-secondary text-xs flex items-center gap-2"
                  >
                    {sendingRequest && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Send Information Request
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Timeline, Internal logs, Decision controls */}
          <div className="space-y-6">
            {/* Decisive Actions Panel */}
            {app.status !== "APPROVED" &&
              app.status !== "REJECTED" &&
              app.status !== "WITHDRAWN" && (
                <div className="surface-card p-6 shadow-sm border border-primary/20 bg-primary/5 rounded-2xl space-y-4">
                  <h3 className="font-display font-semibold text-base">Tenancy Decision</h3>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Decide to shortlist, approve, or reject this application for the property
                    tenancy.
                  </p>

                  {!decisionAction ? (
                    <div className="grid gap-2.5 pt-2">
                      <button
                        onClick={() => setDecisionAction("APPROVE")}
                        className="btn btn-primary text-xs w-full py-2.5"
                      >
                        Approve Applicant
                      </button>
                      <button
                        onClick={() => setDecisionAction("REJECT")}
                        className="btn btn-secondary text-xs w-full py-2.5 border-destructive/20 text-destructive hover:bg-destructive/5"
                      >
                        Reject Applicant
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2 border-t border-border/60">
                      <div className="flex justify-between items-center text-xs font-bold uppercase">
                        <span>Action: {decisionAction}</span>
                        <button
                          onClick={() => setDecisionAction(null)}
                          className="text-muted-foreground hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      {decisionAction === "REJECT" && (
                        <div className="space-y-3">
                          <div>
                            <label className="label">Rejection Reason</label>
                            <select
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="input text-xs"
                            >
                              {REJECTION_REASONS.map((r) => (
                                <option key={r} value={r}>
                                  {r.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="label">Optional Notes</label>
                            <textarea
                              rows={2}
                              value={rejectionNotes}
                              onChange={(e) => setRejectionNotes(e.target.value)}
                              placeholder="Reasoning notes..."
                              className="textarea text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {decisionAction === "APPROVE" && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Approving marks this application stage complete. Tenancy lease contracts
                          and payments are coordinated in the subsequent stages.
                        </p>
                      )}

                      <button
                        onClick={handleSubmitDecision}
                        disabled={submittingDecision}
                        className="btn btn-primary text-xs w-full flex items-center justify-center gap-2"
                      >
                        {submittingDecision && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Confirm {decisionAction === "APPROVE" ? "Approval" : "Rejection"}
                      </button>
                    </div>
                  )}
                </div>
              )}

            {/* Internal Review Notes Logs */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-base">Internal Review Workspace</h3>
              <p className="text-[10px] text-muted-foreground leading-normal italic">
                * These reviews and logs are strictly internal to the landlord team and never
                exposed to the applicant.
              </p>

              {/* Log new review note */}
              {app.status !== "APPROVED" && app.status !== "REJECTED" && (
                <div className="space-y-3 pt-1 border-t border-border/60">
                  <div className="flex gap-2 items-center">
                    <select
                      value={reviewRec}
                      onChange={(e) => setReviewRec(e.target.value as any)}
                      className="input text-[11px] h-8 py-1"
                    >
                      <option value="SHORTLIST">Recommend Shortlist</option>
                      <option value="APPROVE">Recommend Approve</option>
                      <option value="REJECT">Recommend Reject</option>
                      <option value="HOLD">Recommend Hold</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Log internal note..."
                    className="textarea text-xs"
                  />
                  <button
                    onClick={handleSaveReviewNote}
                    disabled={savingNote || !reviewNote.trim()}
                    className="btn btn-secondary text-[10px] py-1 px-3 flex items-center gap-1"
                  >
                    {savingNote && <Loader2 className="h-3 w-3 animate-spin" />}
                    Save Note
                  </button>
                </div>
              )}

              {/* Review History */}
              <div className="space-y-3 pt-3 border-t border-border/60 max-h-[250px] overflow-y-auto">
                {reviews.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">
                    No review notes recorded.
                  </p>
                ) : (
                  reviews.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="bg-secondary/15 p-3 rounded-xl border border-border/40 text-xs"
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                        <span>{rev.reviewer?.full_name || "Reviewer"}</span>
                        <span>{rev.recommendation}</span>
                      </div>
                      <p className="text-foreground mt-1 leading-relaxed">{rev.notes}</p>
                      <span className="text-[9px] text-muted-foreground mt-1 block">
                        {new Date(rev.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messaging channel link */}
            <div className="surface-card p-5 border border-border/80 rounded-2xl space-y-3">
              <h4 className="font-display font-bold text-sm">Need to Discuss?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect directly with the applicant inside the portal secure messaging thread.
              </p>
              <Link
                to="/messages"
                className="btn btn-secondary text-xs w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground"
              >
                <MessageSquare className="h-4 w-4" /> Message Applicant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
