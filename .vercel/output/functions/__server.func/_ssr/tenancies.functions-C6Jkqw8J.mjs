import { i as createServerFn } from "./server-Dy3VKkCi.mjs";
import { r as requireSupabaseAuth } from "./api-error-CUUESrGA.mjs";
import { c as objectType, d as stringType } from "../_libs/zod.mjs";
import { c as createSsrRpc } from "./router-CmEb8YAq.mjs";
import { a as EndTenancySchema, i as DeclineLeaseSchema, n as CompleteMoveInSchema, o as PrepareLeaseSchema, r as CreateTenancySchema, s as ScheduleMoveInSchema, t as AcceptLeaseSchema } from "./tenancies.types-Dd6_uOiM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenancies.functions-C6Jkqw8J.js
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CreateTenancySchema).handler(createSsrRpc("c4fa739030b3cd1c3ed5532740bdd67d9736d994eab6f4cdbfb0a7cab00fa397"));
var fnPrepareLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(PrepareLeaseSchema).handler(createSsrRpc("b1d142305e423c78bfe0b62cb0fee74e0ace5879cc13fdb517925b1e5fd9d8fc"));
var fnSendLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("afd0fd6d885c75038d6e00f8f13c71428e7b0cfa9be1a78e29502e00cc627ebc"));
var fnAcceptLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AcceptLeaseSchema).handler(createSsrRpc("ff5f394bd444e1995d46f88c5ee63d5385301ccc91cff082822506a04617366c"));
var fnDeclineLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(DeclineLeaseSchema).handler(createSsrRpc("36ea39fdd985c709b279d8875713bda4ea238dcf2adb997e0a1092393a499bd7"));
var fnExecuteLease = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("d043313d2edbfcebe3a59d08df66ce28434fe172da235f8892693d0ea73e51c7"));
var fnScheduleMoveIn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ScheduleMoveInSchema).handler(createSsrRpc("244331cd3eeeb1d0276a0ea0fb0b477a6f5e171e6fb22d97add8a1d52a243423"));
var fnCompleteMoveIn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(CompleteMoveInSchema).handler(createSsrRpc("cb147a788f4e19070e17a98ca50cbd832ad216753fb60ff8684bc43ab36a799e"));
var fnEndTenancy = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(EndTenancySchema).handler(createSsrRpc("e64dfafd689a4dd471ad097599af41263e53392a8b2e0f9fa979eed1d5ad6993"));
var fnGetTenancyDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(stringType().uuid()).handler(createSsrRpc("73d7567969c1d5f1f8f036df8b967d304c71052f1273decab21cbee203949e72"));
var fnListTenantTenancies = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("bad55de409f6f1a0f6fb1c7efe37348ef5ef07a11403e2ae980da23bde43b32b"));
var fnProviderListTenancies = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({
	status: stringType().optional(),
	propertyId: stringType().uuid().optional()
}).optional()).handler(createSsrRpc("1dcd9471995c7aba88f9314f325cb3b3894456d009735fcc331ac96c69cfa022"));
var fnGetSecureTenancyDocUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(stringType()).handler(createSsrRpc("5a8cfeb8e1a1e7da08a8365b0d86e41e1bd8e2a8f3975d96ece0568f69aaaab3"));
var prepareLease = (data) => fnPrepareLease({ data });
var sendLease = (leaseId) => fnSendLease({ data: leaseId });
var acceptLease = (data) => fnAcceptLease({ data });
var declineLease = (data) => fnDeclineLease({ data });
var executeLease = (leaseId) => fnExecuteLease({ data: leaseId });
var scheduleMoveIn = (data) => fnScheduleMoveIn({ data });
var completeMoveIn = (data) => fnCompleteMoveIn({ data });
var endTenancy = (data) => fnEndTenancy({ data });
var getTenancyDetails = (tenancyId) => fnGetTenancyDetails({ data: tenancyId });
var listTenantTenancies = () => fnListTenantTenancies();
var providerListTenancies = (data) => fnProviderListTenancies({ data });
var getSecureTenancyDocUrl = (filePath) => fnGetSecureTenancyDocUrl({ data: filePath });
//#endregion
export { executeLease as a, listTenantTenancies as c, scheduleMoveIn as d, sendLease as f, endTenancy as i, prepareLease as l, completeMoveIn as n, getSecureTenancyDocUrl as o, declineLease as r, getTenancyDetails as s, acceptLease as t, providerListTenancies as u };
