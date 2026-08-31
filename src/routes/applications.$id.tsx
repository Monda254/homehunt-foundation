/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import React, { useState, useEffect } from "react";
import {
  getApplicationDetails,
  respondToInformationRequest,
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/applications/$id")({
  component: () => (
    <RequireAuth>
      <ApplicationDetailsWrapper />
    </RequireAuth>
  ),
});

function ApplicationDetailsWrapper() {
  const { id } = Route.useParams();
  return <ApplicationDetailsComponent applicationId={id} />;
}

interface ApplicationDetailsProps {
  applicationId: string;
}

function ApplicationDetailsComponent({ applicationId }: ApplicationDetailsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Response Form States
  const [responseText, setResponseText] = useState("");
  const [responseFiles, setResponseFiles] = useState<any[]>([]);
  const [uploadingReqId, setUploadingReqId] = useState<string | null>(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);

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

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    requirementId: string,
    requirementName: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingReqId(requirementId);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `${user.userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("application_documents")
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      setResponseFiles((prev) => [
        ...prev,
        {
          requirementId,
          name: requirementName,
          filePath: storagePath,
          fileSize: file.size,
          mimeType: file.type,
        },
      ]);
    } catch (err: any) {
      alert(err.message || "Failed to upload file.");
    } finally {
      setUploadingReqId(null);
    }
  };

  const handleSubmitResponse = async (requestId: string) => {
    if (!responseText.trim()) {
      alert("Please provide a response message.");
      return;
    }
    setSubmittingResponse(true);
    try {
      await respondToInformationRequest({
        requestId,
        message: responseText,
        documents: responseFiles,
      });
      // Clear forms
      setResponseText("");
      setResponseFiles([]);
      // Reload details
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || "Failed to submit response.");
    } finally {
      setSubmittingResponse(false);
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
      case "DRAFT":
        return <span className="badge badge-secondary">Draft</span>;
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
            Action Required
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
          <h2 className="font-display text-lg font-bold text-foreground">
            Failed to Load Application
          </h2>
          <p className="text-sm text-muted-foreground">
            {errorMsg || "Record does not exist or you lack access permissions."}
          </p>
          <div className="pt-4">
            <Link to="/applications" className="btn btn-secondary text-xs">
              Back to Applications
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { application: app, documents, requests, history } = details;

  // Filter requests that are open and recipient is current user
  const openRequests = requests.filter(
    (r: any) => r.status === "OPEN" && r.recipient_id === user?.userId,
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            to="/applications"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Applications
          </Link>
        </div>

        {/* Application Banner */}
        <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {app.application_number}
              </span>
              {getStatusBadge(app.status)}
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {app.listings?.title || "Rental Property"}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {app.properties?.name},{" "}
                {app.properties?.county}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Preferred Move-in:{" "}
                {app.preferred_move_in_date || "Not set"}
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-secondary/30 px-5 py-3 rounded-xl border border-border/30">
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                Monthly Rent
              </span>
              <span className="font-bold text-foreground text-sm">
                {app.currency_snapshot} {app.rent_snapshot.toLocaleString()}
              </span>
            </div>
            <div className="border-l border-border/50 h-8" />
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                Required Deposit
              </span>
              <span className="font-bold text-foreground text-sm">
                {app.currency_snapshot} {app.deposit_snapshot.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* ACTION REQUIRED: Open requests from landlord */}
            {openRequests.length > 0 && (
              <div className="surface-card p-6 shadow-sm border border-yellow-500/20 bg-yellow-500/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <h3 className="font-display font-bold text-base">Landlord Action Requested</h3>
                </div>

                {openRequests.map((req: any) => (
                  <div
                    key={req.id}
                    className="space-y-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm text-foreground bg-card/50 p-3.5 rounded-xl border border-border/40 leading-relaxed">
                      "{req.message}"
                    </p>
                    {req.due_date && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Respond before: {new Date(req.due_date).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Response Fields */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="label">Response Message / Notes</label>
                        <textarea
                          rows={3}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Provide details or explanations regarding the requested item..."
                          className="textarea"
                        />
                      </div>

                      {/* File upload if linked requirement exists */}
                      {req.requirement && (
                        <div className="p-4 rounded-xl border border-dashed border-border flex items-center justify-between gap-4">
                          <div>
                            <span className="text-xs font-semibold text-foreground block">
                              Upload: {req.requirement.name}
                            </span>
                            {responseFiles.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {responseFiles.map((f, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>{f.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="btn btn-secondary text-xs flex items-center gap-2 cursor-pointer shrink-0">
                              {uploadingReqId === req.requirement.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              Upload document
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, req.requirement.id, req.requirement.name)
                                }
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={submittingResponse}
                          onClick={() => handleSubmitResponse(req.id)}
                          className="btn btn-primary text-xs flex items-center gap-2"
                        >
                          {submittingResponse && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Submit Response
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile Overview */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-5">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Application Details
              </h3>

              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    Personal Information
                  </span>
                  <div className="surface-card p-3.5 border border-border/40 rounded-xl space-y-1.5">
                    <p className="text-foreground font-medium">{app.personal_info?.fullName}</p>
                    <p className="text-muted-foreground">{app.personal_info?.phoneNumber}</p>
                    <p className="text-muted-foreground">{app.personal_info?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    Household & Occupancy
                  </span>
                  <div className="surface-card p-3.5 border border-border/40 rounded-xl space-y-1.5">
                    <p className="text-foreground">
                      <strong>Occupants:</strong> {app.household_info?.adults} Adult(s),{" "}
                      {app.household_info?.children} Child(ren)
                    </p>
                    <p className="text-foreground">
                      <strong>Pets:</strong> {app.household_info?.pets ? "Yes" : "No"}
                    </p>
                    {app.household_info?.additionalOccupants && (
                      <p className="text-muted-foreground truncate">
                        {app.household_info.additionalOccupants}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    Employment & Profile Verification
                  </span>
                  <div className="surface-card p-4 border border-border/40 rounded-xl grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Employment Status</p>
                      <p className="font-semibold text-foreground mt-0.5 capitalize">
                        {app.employment_info?.status?.replace("_", " ")}
                      </p>
                    </div>
                    {app.employment_info?.employer && (
                      <div>
                        <p className="text-muted-foreground">Employer / Org</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {app.employment_info.employer}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Monthly Income</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {app.employment_info?.incomeRange}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Occupation</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {app.employment_info?.occupation || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submitted Documents Checklist */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Submitted Verification Files
              </h3>

              <div className="grid gap-3">
                {documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No evidence files submitted.
                  </p>
                ) : (
                  documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground block">{doc.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            Size: {Math.round(doc.file_size / 1024)} KB • Status:{" "}
                            <span className="capitalize">{doc.status.toLowerCase()}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadDoc(doc.file_path)}
                        className="btn btn-secondary text-[10px] px-2.5 py-1.5 flex items-center gap-1"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> View Document
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Timeline & Messaging sidebar */}
          <div className="space-y-6">
            {/* Status Timeline Progress */}
            <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-base text-foreground">
                Application Progress
              </h3>

              <div className="relative border-l-2 border-border/80 pl-5 ml-2.5 space-y-6 py-2">
                {history.map((event: any, idx: number) => (
                  <div key={event.id} className="relative">
                    {/* Circle bullet on timeline */}
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

            {/* Message/Help block */}
            <div className="surface-card p-5 border border-primary/20 bg-primary/5 rounded-2xl space-y-3">
              <h4 className="font-display font-bold text-sm text-foreground">
                Need to Coordinate?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Start a direct conversation thread with the landlord to schedule follow-ups or ask
                tenancy questions.
              </p>
              {app.provider_id && (
                <div className="pt-2">
                  <Link
                    to="/messages"
                    className="btn btn-primary text-xs w-full flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" /> Message Landlord
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
