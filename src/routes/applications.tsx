/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Info,
  Plus,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  Upload,
  User,
  Users,
  Briefcase,
  ShieldCheck,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  listApplicantApplications,
  createApplicationDraft,
  updateApplicationDraft,
  submitApplication,
  withdrawApplication,
} from "@/features/applications/applications.functions";
import { getViewings } from "@/features/communication/viewing.functions";
import { getApplicationDetails } from "@/features/applications/applications.functions";
import { EMPLOYMENT_STATUSES, INCOME_RANGES } from "@/features/applications/applications.types";

export const Route = createFileRoute("/applications")({
  component: () => (
    <RequireAuth>
      <ApplicationsComponent />
    </RequireAuth>
  ),
});

function ApplicationsComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch() as any;
  const initialListingId = searchParams.listingId || "";

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewings, setViewings] = useState<any[]>([]);

  // Wizard States
  const [isCreating, setIsCreating] = useState(!!initialListingId);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [listingRequirements, setListingRequirements] = useState<any[]>([]);

  // Form States
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
  });
  const [occupancyInfo, setOccupancyInfo] = useState({
    preferredMoveInDate: "",
    preferredLeaseMonths: 12,
    adults: 1,
    children: 0,
    pets: false,
    additionalOccupants: "",
  });
  const [employmentInfo, setEmploymentInfo] = useState<any>({
    status: "EMPLOYED",
    employer: "",
    occupation: "",
    incomeRange: "KES 50,000 - 100,000",
    employmentDuration: "",
  });

  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [wizardDraftId, setWizardDraftId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchViewings();
  }, []);

  useEffect(() => {
    if (initialListingId && viewings.length > 0) {
      const matched = viewings.find((v) => v.listing_id === initialListingId);
      if (matched) {
        handleStartNewWizard(matched.listings, matched.listing_id, matched.unit_id);
      }
    }
  }, [initialListingId, viewings]);

  const fetchApplications = async () => {
    try {
      const data = await listApplicantApplications();
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewings = async () => {
    try {
      const data = await getViewings();
      // Filter viewings that are COMPLETED to verify eligibility or suggest applying
      setViewings(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartNewWizard = async (listing: any, listingId: string, unitId: any) => {
    setSelectedListing(listing);
    setErrorMsg(null);

    // Initialize application draft in DB
    try {
      const res = await createApplicationDraft({
        listingId,
        unitId: unitId || null,
      });

      if (res.success && res.applicationId) {
        setWizardDraftId(res.applicationId);

        // Fetch property application requirements
        const { data: reqs } = await supabase
          .from("application_requirements")
          .select("*")
          .eq("property_id", listing.property_id || listing.properties?.id)
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        // If no requirements configured, seed defaults for UI checklist
        if (!reqs || reqs.length === 0) {
          setListingRequirements([
            { id: "default-id-card", name: "National ID / Passport copy", is_required: true },
            {
              id: "default-payslip",
              name: "Proof of Income (3 months bank statements/payslips)",
              is_required: true,
            },
          ]);
        } else {
          setListingRequirements(reqs);
        }

        setIsCreating(true);
        setWizardStep(1);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Could not initialize application. Make sure you don't already have an active application.",
      );
    }
  };

  const handleSaveDraftProgress = async () => {
    if (!wizardDraftId) return;
    try {
      await updateApplicationDraft({
        id: wizardDraftId,
        personalInfo,
        preferredMoveInDate: occupancyInfo.preferredMoveInDate || undefined,
        preferredLeaseMonths: occupancyInfo.preferredLeaseMonths,
        employmentInfo,
        householdInfo: {
          adults: occupancyInfo.adults,
          children: occupancyInfo.children,
          pets: occupancyInfo.pets,
          additionalOccupants: occupancyInfo.additionalOccupants,
        },
      });
    } catch (err) {
      console.error("Draft autosave failed", err);
    }
  };

  const handleNextStep = async () => {
    await handleSaveDraftProgress();
    setWizardStep((prev) => prev + 1);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    requirementId: string,
    requirementName: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user || !wizardDraftId) return;

    setUploadingDocId(requirementId);
    setErrorMsg(null);

    try {
      // 1. Upload to Supabase Storage (private bucket application_documents)
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `${user.userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("application_documents")
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // 2. Register in application_documents table
      const { data: doc, error: insertError } = await supabase
        .from("application_documents")
        .insert({
          application_id: wizardDraftId,
          requirement_id: requirementId.startsWith("default-") ? null : requirementId,
          name: requirementName,
          file_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
          status: "UPLOADED",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setUploadedDocs((prev) => [...prev, { ...doc, tempRequirementId: requirementId }]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload document.");
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleDeleteUploadedDoc = async (docId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from("application_documents").remove([filePath]);
      // Delete from database
      await supabase.from("application_documents").delete().eq("id", docId);
      setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const handleSubmitApplicationForm = async () => {
    if (!wizardDraftId) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Save any final changes
      await handleSaveDraftProgress();

      // Submit
      await submitApplication(wizardDraftId);
      setIsCreating(false);
      fetchApplications();
    } catch (err: any) {
      setErrorMsg(
        err.message || "Submission failed. Please check viewing and document requirements.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await withdrawApplication(appId);
      fetchApplications();
    } catch (err: any) {
      alert(err.message);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-sm text-muted-foreground">
              Track status, upload documents, and review decisions on your rental applications.
            </p>
          </div>
          {!isCreating && (
            <button
              onClick={() => {
                // Suggest applying for completed viewings
                const eligible = viewings.filter((v) => v.status === "COMPLETED");
                if (eligible.length === 0) {
                  alert(
                    "You must complete at least one physical viewing to apply for properties requesting it.",
                  );
                } else {
                  // Open selection modal or directly start first completed
                  handleStartNewWizard(
                    eligible[0].listings,
                    eligible[0].listing_id,
                    eligible[0].unit_id,
                  );
                }
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Start New Application
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="flex gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {/* =============================================================
            WIZARD BUILDER VIEW
           ============================================================= */}
        {isCreating && selectedListing && (
          <div className="surface-card p-6 shadow-sm border border-border/80 rounded-2xl space-y-6">
            {/* Header progress bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span>Step {wizardStep} of 5</span>
                <span>{selectedListing.title}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(wizardStep / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: Personal Info */}
            {wizardStep === 1 && (
              <div className="space-y-4 max-w-xl">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Personal Information
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These details will be shared with the landlord to contact you regarding the
                  tenancy.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      className="input"
                      value={personalInfo.fullName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="text"
                      className="input"
                      value={personalInfo.phoneNumber}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      className="input"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Occupancy & Move-in */}
            {wizardStep === 2 && (
              <div className="space-y-4 max-w-xl">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Household Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Preferred Move-in Date</label>
                    <input
                      type="date"
                      className="input"
                      value={occupancyInfo.preferredMoveInDate}
                      onChange={(e) =>
                        setOccupancyInfo({ ...occupancyInfo, preferredMoveInDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Preferred Lease Term (Months)</label>
                    <input
                      type="number"
                      className="input"
                      value={occupancyInfo.preferredLeaseMonths}
                      onChange={(e) =>
                        setOccupancyInfo({
                          ...occupancyInfo,
                          preferredLeaseMonths: parseInt(e.target.value) || 12,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Number of Adults</label>
                    <input
                      type="number"
                      className="input"
                      value={occupancyInfo.adults}
                      onChange={(e) =>
                        setOccupancyInfo({
                          ...occupancyInfo,
                          adults: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Number of Children</label>
                    <input
                      type="number"
                      className="input"
                      value={occupancyInfo.children}
                      onChange={(e) =>
                        setOccupancyInfo({
                          ...occupancyInfo,
                          children: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="pets"
                    checked={occupancyInfo.pets}
                    onChange={(e) => setOccupancyInfo({ ...occupancyInfo, pets: e.target.checked })}
                    className="rounded text-primary border-border focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="pets" className="text-sm font-medium text-foreground select-none">
                    I have pets
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Employment & Income */}
            {wizardStep === 3 && (
              <div className="space-y-4 max-w-xl">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Employment & Income
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Employment Status</label>
                    <select
                      className="input"
                      value={employmentInfo.status}
                      onChange={(e) =>
                        setEmploymentInfo({ ...employmentInfo, status: e.target.value })
                      }
                    >
                      {EMPLOYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  {employmentInfo.status !== "UNEMPLOYED" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">Employer Name</label>
                        <input
                          type="text"
                          className="input"
                          value={employmentInfo.employer}
                          onChange={(e) =>
                            setEmploymentInfo({ ...employmentInfo, employer: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="label">Occupation</label>
                        <input
                          type="text"
                          className="input"
                          value={employmentInfo.occupation}
                          onChange={(e) =>
                            setEmploymentInfo({ ...employmentInfo, occupation: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="label">Monthly Income Range</label>
                    <select
                      className="input"
                      value={employmentInfo.incomeRange}
                      onChange={(e) =>
                        setEmploymentInfo({ ...employmentInfo, incomeRange: e.target.value })
                      }
                    >
                      {INCOME_RANGES.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Verification Documents */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Required Documents
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Private and encrypted. Only visible to the landlord and verifier.
                  </p>
                </div>

                <div className="grid gap-4 max-w-2xl">
                  {listingRequirements.map((req) => {
                    const uploaded = uploadedDocs.filter(
                      (d) =>
                        d.requirement_id === req.id ||
                        (req.id.startsWith("default-") && !d.requirement_id),
                    );

                    return (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {req.name}
                            </span>
                            {req.is_required && (
                              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                                Required
                              </span>
                            )}
                          </div>
                          {req.description && (
                            <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                          )}

                          {/* List of uploaded files for this requirement */}
                          {uploaded.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {uploaded.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 w-fit"
                                >
                                  <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
                                  <span>{doc.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUploadedDoc(doc.id, doc.file_path)}
                                    className="text-emerald-800 hover:text-red-600 shrink-0 ml-1.5"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="btn btn-secondary text-xs flex items-center gap-2 cursor-pointer w-fit shrink-0">
                            {uploadingDocId === req.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3.5 w-3.5" /> Upload File
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              disabled={uploadingDocId !== null}
                              onChange={(e) => handleFileUpload(e, req.id, req.name)}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Review & Submit */}
            {wizardStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg">Review Application Details</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Double-check all information before submitting to the property landlord.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
                  {/* Summary card */}
                  <div className="surface-card p-5 border border-border/70 rounded-xl space-y-4">
                    <h4 className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
                      Profile & Occupancy
                    </h4>
                    <div className="text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applicant Name</span>
                        <span className="font-medium">{personalInfo.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone Number</span>
                        <span className="font-medium">{personalInfo.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email Address</span>
                        <span className="font-medium">{personalInfo.email}</span>
                      </div>
                      <div className="border-t border-border/60 my-2 pt-2" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Move-in Date</span>
                        <span className="font-medium">
                          {occupancyInfo.preferredMoveInDate || "Not Specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lease Term</span>
                        <span className="font-medium">
                          {occupancyInfo.preferredLeaseMonths} Months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Household Size</span>
                        <span className="font-medium">
                          {occupancyInfo.adults} Adult(s), {occupancyInfo.children} Child(ren)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Employment card */}
                  <div className="surface-card p-5 border border-border/70 rounded-xl space-y-4">
                    <h4 className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
                      Employment & Files
                    </h4>
                    <div className="text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employment Status</span>
                        <span className="font-medium capitalize">{employmentInfo.status}</span>
                      </div>
                      {employmentInfo.employer && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employer</span>
                          <span className="font-medium">{employmentInfo.employer}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Income Range</span>
                        <span className="font-medium">{employmentInfo.incomeRange}</span>
                      </div>
                      <div className="border-t border-border/60 my-2 pt-2" />
                      <div>
                        <span className="text-muted-foreground block mb-2">
                          Uploaded Files ({uploadedDocs.length})
                        </span>
                        <div className="space-y-1">
                          {uploadedDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-1.5 text-xs text-foreground"
                            >
                              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span className="truncate max-w-[200px]">{doc.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 rounded-xl bg-secondary/50 p-4 border border-border/60 text-left max-w-xl">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-normal">
                    <strong>Submission Confirmation:</strong> Submitting this application sends your
                    files and profile details directly to the property landlord. It does not
                    establish a tenancy or process any payments.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={() => {
                  if (wizardStep === 1) {
                    setIsCreating(false);
                  } else {
                    setWizardStep((prev) => prev - 1);
                  }
                }}
                className="btn btn-secondary text-xs"
              >
                Back
              </button>

              {wizardStep < 5 ? (
                <button type="button" onClick={handleNextStep} className="btn btn-primary text-xs">
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitApplicationForm}
                  className="btn btn-primary text-xs flex items-center gap-2"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Application
                </button>
              )}
            </div>
          </div>
        )}

        {/* =============================================================
            APPLICATIONS LIST VIEW
           ============================================================= */}
        {!isCreating && (
          <>
            {applications.length === 0 ? (
              <div className="surface-card p-12 text-center max-w-xl mx-auto shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4 animate-pulse">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  No applications yet
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Browse matching properties, schedule viewing calendars, and start an application
                  to rent here.
                </p>
                <div className="mt-6">
                  <Link
                    to="/homes"
                    search={{ page: 1, limit: 20, sort: "RECOMMENDED", amenities: [] }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95"
                  >
                    Browse Map Listings
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="surface-card p-5 border border-border/80 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-border transition-all"
                  >
                    <div className="space-y-4">
                      {/* Badge / Status */}
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {app.application_number || "Draft App"}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h4 className="font-display font-semibold text-base text-foreground leading-snug">
                          {app.listings?.title || "Rental Property"}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {app.properties?.name}, {app.properties?.town}
                          </span>
                        </div>
                      </div>

                      {/* Snapshotted Pricing info */}
                      <div className="flex gap-4 items-center bg-secondary/30 p-2.5 rounded-xl border border-border/30 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                            Rent
                          </span>
                          <span className="font-bold text-foreground">
                            {app.currency_snapshot} {app.rent_snapshot.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-border/50 h-6" />
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                            Deposit
                          </span>
                          <span className="font-bold text-foreground">
                            {app.currency_snapshot} {app.deposit_snapshot.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/60 mt-5 pt-4 flex items-center justify-between gap-3 text-xs">
                      {app.status === "DRAFT" ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedListing(app.listings);
                              setPersonalInfo(app.personal_info || personalInfo);
                              setOccupancyInfo({
                                preferredMoveInDate: app.preferred_move_in_date || "",
                                preferredLeaseMonths: app.preferred_lease_months || 12,
                                adults: app.household_info?.adults || 1,
                                children: app.household_info?.children || 0,
                                pets: app.household_info?.pets || false,
                                additionalOccupants: app.household_info?.additionalOccupants || "",
                              });
                              setEmploymentInfo(app.employment_info || employmentInfo);
                              setWizardDraftId(app.id);

                              // Fetch requirements
                              supabase
                                .from("application_requirements")
                                .select("*")
                                .eq("property_id", app.property_id)
                                .eq("is_active", true)
                                .then(({ data: reqs }) => {
                                  if (!reqs || reqs.length === 0) {
                                    setListingRequirements([
                                      {
                                        id: "default-id-card",
                                        name: "National ID / Passport copy",
                                        is_required: true,
                                      },
                                      {
                                        id: "default-payslip",
                                        name: "Proof of Income",
                                        is_required: true,
                                      },
                                    ]);
                                  } else {
                                    setListingRequirements(reqs);
                                  }
                                  // Fetch already uploaded docs
                                  supabase
                                    .from("application_documents")
                                    .select("*")
                                    .eq("application_id", app.id)
                                    .then(({ data: docs }) => {
                                      setUploadedDocs(docs || []);
                                      setIsCreating(true);
                                      setWizardStep(1);
                                    });
                                });
                            }}
                            className="text-primary font-bold hover:underline"
                          >
                            Continue Application →
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/applications/$id"
                            params={{ id: app.id }}
                            className="text-primary font-bold hover:underline flex items-center gap-1"
                          >
                            Track Progress <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                          {app.status !== "WITHDRAWN" &&
                            app.status !== "REJECTED" &&
                            app.status !== "APPROVED" && (
                              <button
                                onClick={() => handleWithdraw(app.id)}
                                className="text-destructive font-medium hover:underline text-[11px]"
                              >
                                Withdraw
                              </button>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
