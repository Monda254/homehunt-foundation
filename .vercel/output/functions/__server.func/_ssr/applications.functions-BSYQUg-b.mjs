import { i as createServerFn } from "./server-BRCrXnf-.mjs";
import { r as requireSupabaseAuth } from "./api-error-C5p6KfDB.mjs";
import { c as objectType, d as stringType } from "../_libs/zod.mjs";
import { c as createSsrRpc } from "./router-Dop2ixCg.mjs";
import { a as RecordDecisionSchema, c as RespondToRequestSchema, l as SubmitApplicationSchema, o as RecordReviewSchema, s as RequestAdditionalInfoSchema, t as CreateApplicationSchema, u as UpdateDraftSchema } from "./applications.types-D4vWVnj3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications.functions-BSYQUg-b.js
var fnCreateApplicationDraft = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateApplicationSchema).handler(createSsrRpc("4b0c8762b2bc6b0447537a24ac90989a91fc54241ac1158c8adedea8b90070c7"));
var fnUpdateApplicationDraft = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateDraftSchema).handler(createSsrRpc("2c435c5e4fd11087fd4412d124cb974a88b79b4c9904f2ef9bed0b15e8ae7114"));
var fnSubmitApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitApplicationSchema).handler(createSsrRpc("585661b2c70b6c7c985ae25b72bd253b3d05893ba772e2533d8dfe12f5e66c73"));
var fnWithdrawApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("ae8dc5f84687f91002627944062522199afd6f160daaec4e24d6145cb1e63773"));
var fnProviderReviewApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RecordReviewSchema).handler(createSsrRpc("4b5695ffeaf94265fe346f01044d687c06abcd7f6e311dc74da986a41f847d50"));
var fnProviderRequestInformation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RequestAdditionalInfoSchema).handler(createSsrRpc("5fa8e8190bf36a4dd5744154a6f29d4ce5041343612ff5a35a5148bee31f1209"));
var fnRespondToInformationRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RespondToRequestSchema).handler(createSsrRpc("4fe2f130b7d78c8da8c96649b381abe4779b4ac3a641fe3667e47c622038925d"));
var fnProviderRecordDecision = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RecordDecisionSchema).handler(createSsrRpc("ce9a3d2e70db03e51edeb2d1079a9cc07aa67160f74d1f6660743117646fc827"));
var fnGetApplicationDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("90f7e50daaaeccabbf26a88c5ec129a809d57d596c4e2b591f579419bdc22018"));
var fnListApplicantApplications = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("f230a71fb04e49c4cea59a782336f4583100f8816adc8041ac449029f8d30e54"));
var fnProviderListApplications = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	status: stringType().optional(),
	listingId: stringType().uuid().optional()
}).optional()).handler(createSsrRpc("d196c19cbb2b000b394d33a3434915a3764faac580f146122551204933f27614"));
var createApplicationDraft = (data) => fnCreateApplicationDraft({ data });
var updateApplicationDraft = (data) => fnUpdateApplicationDraft({ data });
var submitApplication = (applicationId) => fnSubmitApplication({ data: applicationId });
var withdrawApplication = (applicationId) => fnWithdrawApplication({ data: applicationId });
var providerReviewApplication = (data) => fnProviderReviewApplication({ data });
var providerRequestInformation = (data) => fnProviderRequestInformation({ data });
var respondToInformationRequest = (data) => fnRespondToInformationRequest({ data });
var providerRecordDecision = (data) => fnProviderRecordDecision({ data });
var getApplicationDetails = (applicationId) => fnGetApplicationDetails({ data: applicationId });
var listApplicantApplications = () => fnListApplicantApplications();
var providerListApplications = (data) => fnProviderListApplications({ data });
var fnGetSecureApplicationDocUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType()).handler(createSsrRpc("1f0671104ef12c462ce6f8ab491d140998f4d7889c770fd36bfe5d7783e754b1"));
var getSecureApplicationDocUrl = (filePath) => fnGetSecureApplicationDocUrl({ data: filePath });
//#endregion
export { providerListApplications as a, providerReviewApplication as c, updateApplicationDraft as d, withdrawApplication as f, listApplicantApplications as i, respondToInformationRequest as l, getApplicationDetails as n, providerRecordDecision as o, getSecureApplicationDocUrl as r, providerRequestInformation as s, createApplicationDraft as t, submitApplication as u };
