import { z } from "zod";

export const CONVERSATION_STATUSES = ["ACTIVE", "ARCHIVED", "BLOCKED", "CLOSED"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const MESSAGE_TYPES = [
  "TEXT",
  "SYSTEM",
  "VIEWING_REQUEST",
  "VIEWING_CONFIRMATION",
  "VIEWING_RESCHEDULE",
  "VIEWING_CANCELLATION",
  "APPLICATION_SUBMITTED",
  "APPLICATION_STATUS_CHANGED",
  "APPLICATION_INFO_REQUEST",
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export const MESSAGE_STATUSES = ["SENT", "DELIVERED", "READ", "FAILED"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const VIEWING_STATUSES = [
  "REQUESTED",
  "PENDING",
  "CONFIRMED",
  "RESCHEDULE_REQUESTED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
  "DECLINED",
] as const;
export type ViewingStatus = (typeof VIEWING_STATUSES)[number];

export const VIEWING_FEEDBACK_TYPES = [
  "INTERESTED",
  "NOT_INTERESTED",
  "NEEDS_FOLLOW_UP",
  "NOT_AS_DESCRIBED",
  "PROPERTY_UNAVAILABLE",
] as const;
export type ViewingFeedbackType = (typeof VIEWING_FEEDBACK_TYPES)[number];

export const REPORT_REASONS = [
  "HARASSMENT",
  "SPAM",
  "SCAM",
  "INAPPROPRIATE",
  "MISLEADING",
  "OTHER",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const NOTIFICATION_TYPES = [
  "NEW_MESSAGE",
  "VIEWING_REQUEST",
  "VIEWING_CONFIRMED",
  "VIEWING_RESCHEDULED",
  "VIEWING_CANCELLED",
  "VIEWING_REMINDER",
  "APPLICATION_SUBMITTED",
  "APPLICATION_STATUS_CHANGED",
  "APPLICATION_INFO_REQUEST",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// Validation Schemas
export const CreateConversationSchema = z.object({
  listingId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  initialMessage: z.string().min(1).max(2000),
});

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  messageType: z.enum(MESSAGE_TYPES).default("TEXT"),
});

export const RequestViewingSchema = z.object({
  listingId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  requestedStart: z.string(), // ISO String
  notes: z.string().max(1000).optional(),
});

export const DeclineViewingSchema = z.object({
  viewingId: z.string().uuid(),
  notes: z.string().max(1000).optional(),
});

export const RescheduleViewingSchema = z.object({
  viewingId: z.string().uuid(),
  newStart: z.string(), // ISO String
});

export const CancelViewingSchema = z.object({
  viewingId: z.string().uuid(),
  reason: z.string().min(3).max(1000),
});

export const SubmitViewingFeedbackSchema = z.object({
  viewingId: z.string().uuid(),
  feedbackType: z.enum(VIEWING_FEEDBACK_TYPES),
  matchRating: z.number().min(1).max(5).optional(), // 1 to 5 stars if appropriate
  notes: z.string().max(1000).optional(),
});

export const SubmitUserReportSchema = z.object({
  reportedId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  reason: z.enum(REPORT_REASONS),
  description: z.string().min(5).max(1000),
});

export const UpdateAvailabilitySchema = z.object({
  availabilities: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:MM format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:MM format"),
    }),
  ),
});

export const UpdateNotificationPreferencesSchema = z.object({
  channel: z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]),
  notificationType: z.enum(["messages", "viewing_reminders", "recommendations", "marketing"]),
  enabled: z.boolean(),
});
