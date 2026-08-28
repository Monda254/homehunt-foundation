/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getConversationDetails,
  getMessages,
  sendMessage,
  blockUser,
  unblockUser,
  reportUser,
} from "@/features/communication/communication.functions";
import {
  requestViewing,
  confirmViewing,
  declineViewing,
  cancelViewing,
  getViewings,
} from "@/features/communication/viewing.functions";
import {
  MessageSquare,
  Info,
  Send,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Check,
  ShieldAlert,
  Slash,
  X,
  AlertTriangle,
  Loader2,
  CalendarDays,
  MoreVertical,
  Plus,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  component: () => (
    <RequireAuth>
      <MessagesComponent />
    </RequireAuth>
  ),
});

function MessagesComponent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "ARCHIVED" | "BLOCKED" | "CLOSED">(
    "ACTIVE",
  );

  // Modals state
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [viewingNotes, setViewingNotes] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<
    "HARASSMENT" | "SPAM" | "SCAM" | "INAPPROPRIATE" | "MISLEADING" | "OTHER"
  >("HARASSMENT");
  const [reportDesc, setReportDesc] = useState("");

  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const {
    data: conversationsData,
    isLoading: isLoadingConvs,
    refetch: refetchConvs,
  } = useQuery({
    queryKey: ["conversations", filterStatus],
    queryFn: async () => (await getConversations({ status: filterStatus })) as any,
  });

  const { data: convDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["conversation-details", activeConvId],
    queryFn: async () => (await getConversationDetails(activeConvId!)) as any,
    enabled: !!activeConvId,
  });

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["messages", activeConvId],
    queryFn: async () => (await getMessages({ conversationId: activeConvId! })) as any,
    enabled: !!activeConvId,
    refetchInterval: 5000, // Poll every 5 seconds for simulated chat feel
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.items]);

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (vars: { content: string; messageType?: string }) =>
      sendMessage({
        conversationId: activeConvId!,
        content: vars.content,
        messageType: (vars.messageType || "TEXT") as any,
      }),
    onSuccess: () => {
      setInputText("");
      refetchMessages();
      refetchConvs();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send message.");
    },
  });

  const blockMutation = useMutation({
    mutationFn: () => {
      const details = convDetails as any;
      const targetId =
        details?.seeker_id === user?.userId ? details?.provider_id : details?.seeker_id;
      if (!targetId) return Promise.reject(new Error("Target user ID not found"));
      return blockUser(targetId);
    },
    onSuccess: () => {
      toast.success("User blocked successfully.");
      setActiveConvId(null);
      refetchConvs();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to block user.");
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => {
      const details = convDetails as any;
      const targetId =
        details?.seeker_id === user?.userId ? details?.provider_id : details?.seeker_id;
      if (!targetId) return Promise.reject(new Error("Target user ID not found"));
      return reportUser({
        reportedId: targetId,
        conversationId: activeConvId || undefined,
        reason: reportReason,
        description: reportDesc,
      });
    },
    onSuccess: () => {
      toast.success("Abuse report submitted. Our moderators will review this interaction.");
      setShowReportModal(false);
      setReportDesc("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit report.");
    },
  });

  const requestViewingMutation = useMutation({
    mutationFn: (vars: { requestedStart: string; notes?: string }) => {
      const details = convDetails as any;
      if (!details?.listing_id) return Promise.reject(new Error("No active listing found"));
      return requestViewing({
        listingId: details.listing_id,
        unitId: details.unit_id || undefined,
        requestedStart: vars.requestedStart,
        notes: vars.notes,
      });
    },
    onSuccess: () => {
      toast.success("Viewing requested successfully.");
      setShowViewingModal(false);
      setViewingDate("");
      setViewingTime("");
      setViewingNotes("");
      refetchMessages();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to request viewing.");
    },
  });

  const confirmViewingMutation = useMutation({
    mutationFn: (viewingId: string) => confirmViewing(viewingId),
    onSuccess: () => {
      toast.success("Viewing confirmed successfully.");
      refetchMessages();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to confirm viewing.");
    },
  });

  const declineViewingMutation = useMutation({
    mutationFn: (vars: { viewingId: string; notes?: string }) =>
      declineViewing({ viewingId: vars.viewingId, notes: vars.notes }),
    onSuccess: () => {
      toast.success("Viewing declined.");
      refetchMessages();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to decline viewing.");
    },
  });

  // Action helpers
  const handleSendText = (text: string) => {
    if (!text.trim()) return;
    sendMessageMutation.mutate({ content: text, messageType: "TEXT" });
  };

  const handleRequestViewingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingDate || !viewingTime) {
      toast.error("Please specify both date and time.");
      return;
    }
    const requestedStart = new Date(`${viewingDate}T${viewingTime}`).toISOString();
    requestViewingMutation.mutate({ requestedStart, notes: viewingNotes });
  };

  // Resolve other participant details
  const getOtherParticipant = (conv: any) => {
    if (!conv) return null;
    return conv.seeker_id === user?.userId ? conv.provider : conv.seeker;
  };

  const conversations = conversationsData?.items || [];
  const messages = messagesData?.items || [];
  const otherUser = getOtherParticipant(convDetails);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] border border-border rounded-2xl overflow-hidden flex bg-card shadow-sm">
        {/* Conversations Sidebar (Left) */}
        <div className="w-80 border-r border-border flex flex-col bg-secondary/15 shrink-0">
          <div className="p-4 border-b border-border space-y-3">
            <h1 className="font-display text-lg font-bold text-foreground">Inboxes</h1>

            {/* Status filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(["ACTIVE", "BLOCKED", "ARCHIVED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setActiveConvId(null);
                  }}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    filterStatus === status
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {isLoadingConvs ? (
              <div className="p-6 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                <span className="text-xs text-muted-foreground mt-2 block">Loading threads...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-xs text-muted-foreground leading-normal">
                  No {filterStatus.toLowerCase()} conversations yet. Discover listings and contact
                  landlords or agents to start.
                </p>
              </div>
            ) : (
              conversations.map((conv: any) => {
                const partner = getOtherParticipant(conv);
                const active = activeConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-4 text-left transition-all hover:bg-secondary/40 flex flex-col gap-1 cursor-pointer ${
                      active ? "bg-secondary/65 border-l-2 border-primary" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {partner?.full_name || "Anonymous User"}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-primary font-bold truncate">
                      {conv.listings?.title || "Property Listing"}
                    </span>
                    <p className="text-xs text-muted-foreground truncate leading-normal mt-0.5">
                      {conv.latestMessage?.content || "No messages yet."}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Pane (Right) */}
        <div className="flex-1 flex flex-col bg-background relative">
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-secondary/5">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-display font-semibold text-base text-foreground">
                Select a thread
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Pick a conversation from the sidebar list to view property details, contact records,
                and send messages.
              </p>
            </div>
          ) : isLoadingDetails ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Context Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-card shadow-sm z-10 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {otherUser?.full_name || "Landlord/Seeker"}
                    </span>
                    {otherUser?.identity_verified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-verified/10 text-verified px-1.5 py-0.5 rounded border border-verified/25">
                        <Check className="h-2.5 w-2.5" /> ID Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Context:{" "}
                    <span className="font-semibold text-primary">
                      {convDetails?.listings?.title}
                    </span>
                    <span className="text-border">|</span>
                    <span>
                      {convDetails?.listings?.currency}{" "}
                      {Number(convDetails?.listings?.price).toLocaleString()}
                    </span>
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowActionDropdown(!showActionDropdown)}
                    className="p-2 hover:bg-secondary rounded-lg border text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {showActionDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in duration-100">
                      {convDetails?.seeker_id === user?.userId && (
                        <button
                          onClick={() => {
                            setShowViewingModal(true);
                            setShowActionDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-secondary text-xs font-semibold flex items-center gap-2 text-foreground cursor-pointer"
                        >
                          <Calendar className="h-4 w-4 text-primary" /> Request Viewing
                        </button>
                      )}
                      <button
                        onClick={() => {
                          blockMutation.mutate();
                          setShowActionDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-secondary text-xs font-semibold flex items-center gap-2 text-destructive cursor-pointer"
                      >
                        <Slash className="h-4 w-4" /> Block User
                      </button>
                      <button
                        onClick={() => {
                          setShowReportModal(true);
                          setShowActionDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-secondary text-xs font-semibold flex items-center gap-2 text-destructive cursor-pointer"
                      >
                        <ShieldAlert className="h-4 w-4" /> Report Interaction
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground italic">
                    Start of secure discussion thread.
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isSelf = msg.sender_id === user?.userId;

                    // Message formats for different message types
                    if (msg.message_type === "VIEWING_REQUEST") {
                      // Render Viewing Request card
                      return (
                        <div key={msg.id} className="flex justify-center w-full my-2">
                          <div className="bg-card border border-border rounded-2xl p-4 max-w-sm w-full shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-primary font-display font-bold text-xs uppercase tracking-wider">
                              <CalendarDays className="h-4.5 w-4.5" /> Viewing Requested
                            </div>
                            <p className="text-xs text-muted-foreground leading-normal">
                              {msg.content}
                            </p>

                            {/* Actions for provider */}
                            {!isSelf && (convDetails as any)?.provider_id === user?.userId && (
                              <div className="flex gap-2 pt-1 border-t border-border/60">
                                <button
                                  onClick={() => {
                                    // Extract viewing ID from content or trigger confirmation API
                                    // Normally we query active viewing, but let's confirm the latest requested viewing for simplicity
                                    toast.promise(
                                      (async () => {
                                        const viewings = await queryClient.fetchQuery({
                                          queryKey: ["viewings-list"],
                                          queryFn: async () => (await getViewings()) as any,
                                        });
                                        const pendingForConv = (viewings || []).filter(
                                          (v: any) =>
                                            v.conversation_id === activeConvId &&
                                            v.status === "REQUESTED",
                                        );
                                        if (pendingForConv && pendingForConv.length > 0) {
                                          await confirmViewingMutation.mutateAsync(
                                            pendingForConv[0].id,
                                          );
                                        } else {
                                          throw new Error("No pending request found.");
                                        }
                                      })(),
                                      {
                                        loading: "Confirming appointment...",
                                        success: "Viewing confirmed!",
                                        error: (err) => err.message,
                                      },
                                    );
                                  }}
                                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => {
                                    toast.promise(
                                      (async () => {
                                        const viewings = await queryClient.fetchQuery({
                                          queryKey: ["viewings-list"],
                                          queryFn: async () => (await getViewings()) as any,
                                        });
                                        const pendingForConv = (viewings || []).filter(
                                          (v: any) =>
                                            v.conversation_id === activeConvId &&
                                            v.status === "REQUESTED",
                                        );
                                        if (pendingForConv && pendingForConv.length > 0) {
                                          await declineViewingMutation.mutateAsync({
                                            viewingId: pendingForConv[0].id,
                                          });
                                        } else {
                                          throw new Error("No pending request found.");
                                        }
                                      })(),
                                      {
                                        loading: "Declining request...",
                                        success: "Viewing declined.",
                                        error: (err) => err.message,
                                      },
                                    );
                                  }}
                                  className="flex-1 border border-border text-foreground hover:bg-secondary text-[10px] font-bold py-2 rounded-lg cursor-pointer transition-all"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (msg.message_type === "VIEWING_CONFIRMATION") {
                      return (
                        <div key={msg.id} className="flex justify-center w-full my-2">
                          <div className="bg-verified/5 border border-verified/25 rounded-2xl p-4 max-w-sm w-full shadow-sm text-center space-y-2">
                            <CheckCircle2 className="h-6 w-6 text-verified mx-auto" />
                            <h4 className="font-display font-bold text-xs text-foreground uppercase tracking-wider">
                              Appointment Confirmed
                            </h4>
                            <p className="text-xs text-muted-foreground leading-normal">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (msg.message_type === "VIEWING_CANCELLATION") {
                      return (
                        <div key={msg.id} className="flex justify-center w-full my-2">
                          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 max-w-sm w-full shadow-sm text-center space-y-2">
                            <Slash className="h-6 w-6 text-destructive mx-auto" />
                            <h4 className="font-display font-bold text-xs text-destructive uppercase tracking-wider">
                              Viewing Cancelled
                            </h4>
                            <p className="text-xs text-muted-foreground leading-normal">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full ${isSelf ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isSelf
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-card border border-border text-foreground rounded-tl-none"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 opacity-70 ${
                              isSelf ? "text-primary-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input / Footer */}
              <div className="p-4 border-t border-border space-y-3 bg-card shrink-0">
                {/* Quick Templates */}
                {convDetails?.status === "ACTIVE" && (
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    {[
                      "Is this property still available?",
                      "Can I schedule a viewing?",
                      "Are pets allowed?",
                      "Is parking available?",
                    ].map((temp) => (
                      <button
                        key={temp}
                        onClick={() => handleSendText(temp)}
                        className="text-[10px] font-semibold bg-secondary hover:bg-secondary/80 border text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                      >
                        {temp}
                      </button>
                    ))}
                  </div>
                )}

                {convDetails?.status !== "ACTIVE" ? (
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 border border-border/80 rounded-xl">
                    <Info className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      This conversation is currently {convDetails?.status.toLowerCase()}. You cannot
                      send messages here.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendText(inputText);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type a secure message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-secondary/35 rounded-xl border border-border text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sendMessageMutation.isPending}
                      className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center rounded-xl shadow cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------
          REQUEST VIEWING SCHEDULER MODAL
         ------------------------------------------------------------ */}
      {showViewingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setShowViewingModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Request Viewing Appointment
            </h3>

            <form onSubmit={handleRequestViewingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={viewingDate}
                    onChange={(e) => setViewingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    required
                    value={viewingTime}
                    onChange={(e) => setViewingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Optional notes for landlord
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Could we meet at the property entrance?"
                  value={viewingNotes}
                  onChange={(e) => setViewingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Kenyan Context Safety Warning */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 rounded-xl text-[10px] leading-normal flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety check:</strong> Viewings should always be physical. Do not send
                  deposits or reserve fees prior to viewing.
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                  type="submit"
                  disabled={requestViewingMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {requestViewingMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewingModal(false)}
                  className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          REPORT INTERACTION MODAL
         ------------------------------------------------------------ */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" /> Report Suspicious Behavior
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                reportMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e: any) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none cursor-pointer"
                >
                  <option value="HARASSMENT">Harassment or abusive language</option>
                  <option value="SPAM">Spam / Repeated advertisements</option>
                  <option value="SCAM">Scam / Advance deposit requests</option>
                  <option value="INAPPROPRIATE">Inappropriate or illicit content</option>
                  <option value="MISLEADING">Misleading information</option>
                  <option value="OTHER">Other reasons</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Provide Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe details of the issue so our verification team can review..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/35 rounded-lg border border-border text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                  type="submit"
                  disabled={reportMutation.isPending}
                  className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/95 cursor-pointer disabled:opacity-50"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
