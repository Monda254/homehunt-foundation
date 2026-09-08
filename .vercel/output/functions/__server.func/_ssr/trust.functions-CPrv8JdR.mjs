import { i as createServerFn } from "./server-BRCrXnf-.mjs";
import { r as requireSupabaseAuth } from "./api-error-C5p6KfDB.mjs";
import { a as enumType, c as objectType, d as stringType } from "../_libs/zod.mjs";
import { c as createSsrRpc } from "./router-Dop2ixCg.mjs";
import { a as RevokeVerificationSchema, c as SubmitReportSchema, i as ReviewVerificationSchema, l as SubmitVerificationSchema, n as ResolveClaimSchema, o as SubmitAppealSchema, r as ResolveReportSchema, s as SubmitClaimSchema, t as ResolveAppealSchema } from "./trust.types-Czwvn2xo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trust.functions-CPrv8JdR.js
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitVerificationSchema).handler(createSsrRpc("41dd480e819857d3e903a22511e161a1c442fc863702785c7b5e6e0aca34f095"));
var fnListVerificationRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b60715f8823214fe399b57482fd889ee07301b9ed84c05cafbadd4458fb6707b"));
var listVerificationRequests = () => fnListVerificationRequests();
var fnReviewVerificationRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ReviewVerificationSchema).handler(createSsrRpc("2626d48ec92a07be09f3249b067f486104edcd4a1f1202c26d619c1ab9d8bd12"));
var reviewVerificationRequest = (data) => fnReviewVerificationRequest({ data });
var fnRevokeVerification = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(RevokeVerificationSchema).handler(createSsrRpc("5ceb9193bef12cd0bc5684f0faf0a1ec7ac978d745ea5c071814b9e21125a949"));
var revokeVerification = (data) => fnRevokeVerification({ data });
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitClaimSchema).handler(createSsrRpc("b0211eb2256a8673a7e8c299905467b6447df21dbbbf0b72973e348f582c6a11"));
var fnListPropertyClaims = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("5bd295bd8ff5646c5facccba8421e9989442891d00d0eecd722a6166b387a78e"));
var listPropertyClaims = () => fnListPropertyClaims();
var fnResolvePropertyClaim = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ResolveClaimSchema).handler(createSsrRpc("585f13336d9377f217ab7170c1ffa22e993c0b416a98ec1c01b3733932916f73"));
var resolvePropertyClaim = (data) => fnResolvePropertyClaim({ data });
var fnReportListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitReportSchema).handler(createSsrRpc("0e786c6011152195a98585f5dec880d00132dd06b6823b3c8a6cabc1d930a163"));
var reportListing = (data) => fnReportListing({ data });
var fnListListingReports = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("ef79135d8647eb3867da30a2c19981b6a62200644fd6905e4c6d8b48e5ce24bf"));
var listListingReports = () => fnListListingReports();
var fnResolveListingReport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ResolveReportSchema).handler(createSsrRpc("893125ba4acec3bb2db8a9cd497de0b836accaaa26b45253826162d2ae3c0f6e"));
var resolveListingReport = (data) => fnResolveListingReport({ data });
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("f7265560705a0b548bfbab9f2ef8cb787d974c4c9954d9fc260fae475fd57f6d"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(SubmitAppealSchema).handler(createSsrRpc("3d3d2ae17c3a3628cc7102843015cae8588a037730c1c72ac780ae5e0a89db80"));
var fnListModerationAppeals = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("44ab52f7db4e597d2b7d7f53d773b388fd3c022b0707230fd65dc3bb51711b64"));
var listModerationAppeals = () => fnListModerationAppeals();
var fnResolveModerationAppeal = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ResolveAppealSchema).handler(createSsrRpc("ac2fcd14bd7f37226d59d8ff2e64f4935e03b6426ce358a835142257e269a9ea"));
var resolveModerationAppeal = (data) => fnResolveModerationAppeal({ data });
var fnListRiskFlags = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("e28d824d263a551eb534ec5e05371a0d634839b62fa9fe1977b77a3ab0700168"));
var listRiskFlags = () => fnListRiskFlags();
var fnResolveRiskFlag = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({
	id: stringType().uuid(),
	status: enumType(["RESOLVED", "DISMISSED"])
})).handler(createSsrRpc("840641032e3cc44fe1d42fbd9f7c5e8869f2679b0dae76892484e0f20c8c4306"));
var resolveRiskFlag = (id, status) => fnResolveRiskFlag({ data: {
	id,
	status
} });
var fnGetSecureEvidenceUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType()).handler(createSsrRpc("93bbc74e35786875e1e4a1afc7973873bb2d93a13e5575b7914dcb0748de4805"));
var getSecureEvidenceUrl = (storageReference) => fnGetSecureEvidenceUrl({ data: storageReference });
//#endregion
export { listRiskFlags as a, resolveListingReport as c, resolveRiskFlag as d, reviewVerificationRequest as f, listPropertyClaims as i, resolveModerationAppeal as l, listListingReports as n, listVerificationRequests as o, revokeVerification as p, listModerationAppeals as r, reportListing as s, getSecureEvidenceUrl as t, resolvePropertyClaim as u };
