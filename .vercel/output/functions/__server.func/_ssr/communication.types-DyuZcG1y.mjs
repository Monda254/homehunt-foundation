import { a as enumType, c as objectType, d as stringType, n as arrayType, r as booleanType, s as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/communication.types-DyuZcG1y.js
var CONVERSATION_STATUSES = [
	"ACTIVE",
	"ARCHIVED",
	"BLOCKED",
	"CLOSED"
];
var MESSAGE_TYPES = [
	"TEXT",
	"SYSTEM",
	"VIEWING_REQUEST",
	"VIEWING_CONFIRMATION",
	"VIEWING_RESCHEDULE",
	"VIEWING_CANCELLATION",
	"APPLICATION_SUBMITTED",
	"APPLICATION_STATUS_CHANGED",
	"APPLICATION_INFO_REQUEST"
];
var VIEWING_STATUSES = [
	"REQUESTED",
	"PENDING",
	"CONFIRMED",
	"RESCHEDULE_REQUESTED",
	"RESCHEDULED",
	"CANCELLED",
	"COMPLETED",
	"NO_SHOW",
	"DECLINED"
];
var VIEWING_FEEDBACK_TYPES = [
	"INTERESTED",
	"NOT_INTERESTED",
	"NEEDS_FOLLOW_UP",
	"NOT_AS_DESCRIBED",
	"PROPERTY_UNAVAILABLE"
];
var REPORT_REASONS = [
	"HARASSMENT",
	"SPAM",
	"SCAM",
	"INAPPROPRIATE",
	"MISLEADING",
	"OTHER"
];
var CreateConversationSchema = objectType({
	listingId: stringType().uuid(),
	unitId: stringType().uuid().optional(),
	initialMessage: stringType().min(1).max(2e3)
});
var SendMessageSchema = objectType({
	conversationId: stringType().uuid(),
	content: stringType().min(1).max(4e3),
	messageType: enumType(MESSAGE_TYPES).default("TEXT")
});
var RequestViewingSchema = objectType({
	listingId: stringType().uuid(),
	unitId: stringType().uuid().optional(),
	requestedStart: stringType(),
	notes: stringType().max(1e3).optional()
});
var DeclineViewingSchema = objectType({
	viewingId: stringType().uuid(),
	notes: stringType().max(1e3).optional()
});
var RescheduleViewingSchema = objectType({
	viewingId: stringType().uuid(),
	newStart: stringType()
});
var CancelViewingSchema = objectType({
	viewingId: stringType().uuid(),
	reason: stringType().min(3).max(1e3)
});
var SubmitViewingFeedbackSchema = objectType({
	viewingId: stringType().uuid(),
	feedbackType: enumType(VIEWING_FEEDBACK_TYPES),
	matchRating: numberType().min(1).max(5).optional(),
	notes: stringType().max(1e3).optional()
});
var SubmitUserReportSchema = objectType({
	reportedId: stringType().uuid(),
	conversationId: stringType().uuid().optional(),
	reason: enumType(REPORT_REASONS),
	description: stringType().min(5).max(1e3)
});
var UpdateAvailabilitySchema = objectType({ availabilities: arrayType(objectType({
	dayOfWeek: numberType().int().min(0).max(6),
	startTime: stringType().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:MM format"),
	endTime: stringType().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:MM format")
})) });
var UpdateNotificationPreferencesSchema = objectType({
	channel: enumType([
		"IN_APP",
		"EMAIL",
		"SMS",
		"PUSH"
	]),
	notificationType: enumType([
		"messages",
		"viewing_reminders",
		"recommendations",
		"marketing"
	]),
	enabled: booleanType()
});
//#endregion
export { RequestViewingSchema as a, SubmitUserReportSchema as c, UpdateNotificationPreferencesSchema as d, VIEWING_STATUSES as f, DeclineViewingSchema as i, SubmitViewingFeedbackSchema as l, CancelViewingSchema as n, RescheduleViewingSchema as o, CreateConversationSchema as r, SendMessageSchema as s, CONVERSATION_STATUSES as t, UpdateAvailabilitySchema as u };
