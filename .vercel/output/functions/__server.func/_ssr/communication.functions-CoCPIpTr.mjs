import { i as createServerFn } from "./server-BRCrXnf-.mjs";
import { r as requireSupabaseAuth } from "./api-error-C5p6KfDB.mjs";
import { a as enumType, c as objectType, d as stringType, s as numberType } from "../_libs/zod.mjs";
import { c as createSsrRpc } from "./router-Dop2ixCg.mjs";
import { c as SubmitUserReportSchema, d as UpdateNotificationPreferencesSchema, r as CreateConversationSchema, s as SendMessageSchema, t as CONVERSATION_STATUSES } from "./communication.types-DyuZcG1y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/communication.functions-CoCPIpTr.js
var fnCreateConversation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateConversationSchema).handler(createSsrRpc("83fc557dc82f79a2f55f3b56c034d0318faebca6ffb9ad98fd6115f48a8ddaa2"));
var createConversation = (data) => fnCreateConversation({ data });
var fnGetConversations = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	status: enumType(CONVERSATION_STATUSES).optional(),
	limit: numberType().int().min(1).max(50).default(20),
	cursor: stringType().datetime().optional()
}).optional()).handler(createSsrRpc("712facd15d69daef3d7abef5e8827c080be4ca3bb83f49fbb5e3bc7992504441"));
var getConversations = (data) => fnGetConversations({ data });
var fnGetConversationDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("6198eb07c0b4e6cd925c57121cba9a815cfbfd981a1930a205ae6222b1d93110"));
var getConversationDetails = (conversationId) => fnGetConversationDetails({ data: conversationId });
var fnSendMessage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SendMessageSchema).handler(createSsrRpc("debe91dbcd9d40d3fb5222baf887416bf189546410c80b86e14084b40b3c8d56"));
var sendMessage = (data) => fnSendMessage({ data });
var fnGetMessages = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	conversationId: stringType().uuid(),
	limit: numberType().int().min(1).max(100).default(50),
	cursor: stringType().datetime().optional()
})).handler(createSsrRpc("7a1473d7cfdd80499f10f272c4d5f317412fc144d9b3fdcb8217835c513f70e6"));
var getMessages = (data) => fnGetMessages({ data });
var fnBlockUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("18866b28a2b927a122cf9ca138cad241b2e8776d99f7052bf63d0839bb8610d8"));
var blockUser = (blockedId) => fnBlockUser({ data: blockedId });
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("0568f48967d7ad9618ab6a7f1497d0b1c7996dfd5c974a27979e73118b4dd6aa"));
var fnReportUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitUserReportSchema).handler(createSsrRpc("1206ce3787636dadf48b1061522e8d0de14230236c819331e263e0dfb6901924"));
var reportUser = (data) => fnReportUser({ data });
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("961d4e1969a0985354c6bf92ba67dd9132b9793e505009bdb7d4a9b0bc1a858d"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("ecadc9822c7be847f369a927f970e9702d45b76d1a8ad35c3715a6e94606e4ac"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("9034fba1dbdd88f6fea8a1b213955474b7a4a6f9d214a47abb025ad0d40f8500"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateNotificationPreferencesSchema).handler(createSsrRpc("663bfe331e872176d044d79d1522395773c6946d5ad9d23aa3cb80ab17be73e2"));
//#endregion
export { getMessages as a, getConversations as i, createConversation as n, reportUser as o, getConversationDetails as r, sendMessage as s, blockUser as t };
