/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getViewings,
  confirmViewing,
  declineViewing,
  cancelViewing,
  submitViewingFeedback,
} from "@/features/communication/viewing.functions";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Info,
  ChevronRight,
  Star,
  X,
  MessageSquare,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/viewings")({
  component: () => (
    <RequireAuth>
      <ViewingsComponent />
    </RequireAuth>
  ),
});

function ViewingsComponent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PENDING" | "PAST" | "CANCELLED">(
    "UPCOMING",
  );

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedViewingId, setSelectedViewingId] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<
    | "INTERESTED"
    | "NOT_INTERESTED"
    | "NEEDS_FOLLOW_UP"
    | "NOT_AS_DESCRIBED"
    | "PROPERTY_UNAVAILABLE"
  >("INTERESTED");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [matchRating, setMatchRating] = useState(5);

  // Reschedule state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Queries
  const {
    data: viewingsList,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["viewings-list"],
    queryFn: async () => (await getViewings()) as any,
  });

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmViewing(id),
    onSuccess: () => {
      toast.success("Viewing appointment confirmed!");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to confirm viewing.");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (vars: { id: string; notes?: string }) =>
      declineViewing({ viewingId: vars.id, notes: vars.notes }),
    onSuccess: () => {
      toast.success("Viewing declined.");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to decline viewing.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (vars: { id: string; reason: string }) =>
      cancelViewing({ viewingId: vars.id, reason: vars.reason }),
    onSuccess: () => {
      toast.success("Viewing cancelled.");
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedViewingId(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel viewing.");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (vars: { id: string; type: any; rating?: number; notes?: string }) =>
      submitViewingFeedback({
        viewingId: vars.id,
        feedbackType: vars.type,
        matchRating: vars.rating,
        notes: vars.notes,
      }),
    onSuccess: () => {
      toast.success("Thank you! Feedback recorded successfully.");
      setShowFeedbackModal(false);
      setFeedbackNotes("");
      setMatchRating(5);
      setSelectedViewingId(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit feedback.");
    },
  });

  const viewings = viewingsList || [];

  // Filter list
  const filteredViewings = viewings.filter((view: any) => {
    const isPast = new Date(view.requested_start).getTime() < Date.now();
    const status = view.status;

    if (activeTab === "CANCELLED") {
      return status === "CANCELLED" || status === "DECLINED";
    }
    if (activeTab === "PENDING") {
      return status === "REQUESTED" || status === "PENDING" || status === "RESCHEDULE_REQUESTED";
    }
    if (activeTab === "PAST") {
      return isPast || status === "COMPLETED" || status === "NO_SHOW";
    }
    // UPCOMING
    return !isPast && status === "CONFIRMED";
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Viewings Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Coordinate physical viewing schedules and log feedback outcomes.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-border pb-px">
          {(
            [
              { id: "UPCOMING", label: "Upcoming Confirmed" },
              { id: "PENDING", label: "Pending Requests" },
              { id: "PAST", label: "Past Viewings" },
              { id: "CANCELLED", label: "Cancelled / Declined" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-bold uppercase tracking-wider pb-3 px-1 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="flex py-12 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredViewings.length === 0 ? (
          <div className="surface-card p-12 text-center max-w-md mx-auto shadow-sm">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-foreground">
              No appointments found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-normal">
              You have no appointments registered under this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredViewings.map((view: any) => {
              const partner = view.seeker_id === user?.userId ? view.provider : view.seeker;
              const roleText = view.seeker_id === user?.userId ? "Provider" : "Seeker";
              const isPast = new Date(view.requested_start).getTime() < Date.now();

              return (
                <div
                  key={view.id}
                  className="surface-card p-5 border border-border shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {view.listings?.title}
                        </span>
                        <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          {view.properties?.town}, {view.properties?.county}
                        </h4>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          view.status === "CONFIRMED"
                            ? "bg-verified/10 border-verified/25 text-verified"
                            : view.status === "REQUESTED" || view.status === "RESCHEDULE_REQUESTED"
                              ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-600"
                              : "bg-secondary/60 border-border text-muted-foreground"
                        }`}
                      >
                        {view.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground pt-1.5 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {new Date(view.requested_start).toLocaleDateString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {new Date(view.requested_start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          (EAT)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-secondary/35 rounded-xl border text-xs">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider leading-none mb-0.5">
                          {roleText}
                        </p>
                        <p className="font-bold text-foreground truncate">
                          {partner?.full_name || "Anonymous User"}
                        </p>
                      </div>
                    </div>

                    {view.notes && (
                      <p className="text-[11px] text-muted-foreground leading-normal bg-secondary/20 p-2.5 rounded-lg border border-dashed">
                        <strong>Notes:</strong> {view.notes}
                      </p>
                    )}
                  </div>

                  {/* Context Actions */}
                  <div className="flex gap-2 pt-3 border-t border-border/60 justify-end">
                    {view.status === "REQUESTED" && view.provider_id === user?.userId && (
                      <>
                        <button
                          onClick={() => confirmMutation.mutate(view.id)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => declineMutation.mutate({ id: view.id })}
                          className="px-3 py-1.5 border border-border text-foreground hover:bg-secondary text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {view.status === "CONFIRMED" && (
                      <button
                        onClick={() => {
                          setSelectedViewingId(view.id);
                          setShowCancelModal(true);
                        }}
                        className="px-3 py-1.5 border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    )}

                    {isPast && view.status === "CONFIRMED" && view.seeker_id === user?.userId && (
                      <button
                        onClick={() => {
                          setSelectedViewingId(view.id);
                          setShowFeedbackModal(true);
                        }}
                        className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        Leave Feedback
                      </button>
                    )}

                    {view.conversation_id && (
                      <Link
                        to="/messages"
                        className="inline-flex items-center justify-center p-2 border hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------
          CANCEL APPOINTMENT MODAL
         ------------------------------------------------------------ */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setSelectedViewingId(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display font-extrabold text-base text-foreground">
              Cancel Viewing Appointment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Reason for cancellation
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Schedule conflict arose, property not available..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                  onClick={() =>
                    cancelMutation.mutate({ id: selectedViewingId!, reason: cancelReason })
                  }
                  disabled={!cancelReason.trim() || cancelMutation.isPending}
                  className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer disabled:opacity-50"
                >
                  Cancel Viewing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedViewingId(null);
                  }}
                  className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          SUBMIT VIEWING FEEDBACK MODAL
         ------------------------------------------------------------ */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => {
                setShowFeedbackModal(false);
                setSelectedViewingId(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-5 w-5 text-primary" /> How was the viewing?
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Viewing Outcome
                </label>
                <select
                  value={feedbackType}
                  onChange={(e: any) => setFeedbackType(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer"
                >
                  <option value="INTERESTED">I am interested in leasing this unit</option>
                  <option value="NEEDS_FOLLOW_UP">I have open questions / needs follow up</option>
                  <option value="NOT_INTERESTED">Not interested (Unsuited parameters)</option>
                  <option value="NOT_AS_DESCRIBED">Property did not match listing details</option>
                  <option value="PROPERTY_UNAVAILABLE">
                    Property was already locked/unavailable
                  </option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Listing Accuracy Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setMatchRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 transition-all ${
                          star <= matchRating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us what you liked or why this didn't suit your search..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Personalization Hint */}
              <div className="p-3 bg-secondary/50 rounded-xl text-[10px] text-muted-foreground border leading-normal">
                <strong>Matching update:</strong> Rejections will automatically refine your
                intelligent property recommendation weights in subsequent searches.
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                  onClick={() =>
                    feedbackMutation.mutate({
                      id: selectedViewingId!,
                      type: feedbackType,
                      rating: matchRating,
                      notes: feedbackNotes,
                    })
                  }
                  disabled={feedbackMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50"
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedViewingId(null);
                  }}
                  className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
