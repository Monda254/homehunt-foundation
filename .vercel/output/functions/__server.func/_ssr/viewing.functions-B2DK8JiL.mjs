import { i as createServerFn } from "./server-Dy3VKkCi.mjs";
import { r as requireSupabaseAuth } from "./api-error-CUUESrGA.mjs";
import { a as enumType, c as objectType, d as stringType } from "../_libs/zod.mjs";
import { c as createSsrRpc } from "./router-CmEb8YAq.mjs";
import { a as RequestViewingSchema, f as VIEWING_STATUSES, i as DeclineViewingSchema, l as SubmitViewingFeedbackSchema, n as CancelViewingSchema, o as RescheduleViewingSchema, u as UpdateAvailabilitySchema } from "./communication.types-DyuZcG1y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/viewing.functions-B2DK8JiL.js
var fnRequestViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RequestViewingSchema).handler(createSsrRpc("38343f13d09794d0550d5c28f1ac664cbfbbc121cf3abc984c09f94192a9ec1c"));
var requestViewing = (data) => fnRequestViewing({ data });
var fnConfirmViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("23edcbc3b26df55657e167e0842f6e4140453a8c5f609fcb543d90e6aac5311c"));
var confirmViewing = (viewingId) => fnConfirmViewing({ data: viewingId });
var fnDeclineViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(DeclineViewingSchema).handler(createSsrRpc("b93bbedb68cbdf313c222506d94f1a0073a398e41f959e358354e3f643b398ed"));
var declineViewing = (data) => fnDeclineViewing({ data });
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RescheduleViewingSchema).handler(createSsrRpc("c992085c8a9faa20b661a8bdf75d1b7c7edf6c1f4bfb73f199d0cdc0f2f34fd1"));
var fnCancelViewing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CancelViewingSchema).handler(createSsrRpc("c379e4b02d17ddc0307ab6901ac58f16edfc90ac877b9c20d0d6884864e713c3"));
var cancelViewing = (data) => fnCancelViewing({ data });
var fnSubmitViewingFeedback = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitViewingFeedbackSchema).handler(createSsrRpc("3ed5d09b0865d4bb74536145125d2d3237b3c1195deeb0c6a42504674a280b13"));
var submitViewingFeedback = (data) => fnSubmitViewingFeedback({ data });
var fnGetViewings = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({ status: enumType(VIEWING_STATUSES).optional() }).optional()).handler(createSsrRpc("597af23becaa2e91de1219590665a94973624a0805c2e8ba2e2d7b71314c7efb"));
var getViewings = (data) => fnGetViewings({ data });
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateAvailabilitySchema).handler(createSsrRpc("b623a4f141f956e86eab72f55eef0c4029d99934f86063495be0c41d32e4e5bd"));
//#endregion
export { requestViewing as a, getViewings as i, confirmViewing as n, submitViewingFeedback as o, declineViewing as r, cancelViewing as t };
