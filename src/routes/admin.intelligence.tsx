/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getMarketplaceOverviewMetrics } from "@/features/intelligence/analytics.service";
import { getActiveRiskSignals, updateRiskSignalStatus } from "@/features/intelligence/risk.service";
import {
  getAllFeatureFlags,
  toggleFeatureFlag,
} from "@/features/intelligence/feature-flags.service";
import { getOpenDuplicateCandidates, updateDuplicateCandidateStatus } from "@/features/intelligence/duplicate-detection.service";
import { getRentIntelligence, getSpatialDemandHeatmap } from "@/features/intelligence/market-insights.service";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/intelligence")({
  component: () => (
    <RequireAuth permission="ADMIN_VIEW_USERS">
      <AdminIntelligencePage />
    </RequireAuth>
  ),
});

function AdminIntelligencePage() {
  const queryClient = useQueryClient();

  // Queries
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["marketplace-overview-metrics"],
    queryFn: () => getMarketplaceOverviewMetrics(),
  });

  const { data: riskSignals, isLoading: isSignalsLoading } = useQuery({
    queryKey: ["admin-active-risk-signals"],
    queryFn: () => getActiveRiskSignals(),
  });

  const { data: featureFlags, isLoading: isFlagsLoading } = useQuery({
    queryKey: ["admin-feature-flags"],
    queryFn: () => getAllFeatureFlags(),
  });

  const { data: duplicates } = useQuery({
    queryKey: ["admin-duplicate-candidates"],
    queryFn: () => getOpenDuplicateCandidates(),
  });

  const { data: rentInsight } = useQuery({
    queryKey: ["admin-rent-intelligence"],
    queryFn: () => getRentIntelligence("Nairobi"),
  });

  const { data: spatialDemand } = useQuery({
    queryKey: ["admin-spatial-demand"],
    queryFn: () => getSpatialDemandHeatmap(),
  });

  // Mutations
  const resolveSignalMutation = useMutation({
    mutationFn: (variables: { signalId: string; status: any }) =>
      updateRiskSignalStatus(variables.signalId, variables.status),
    onSuccess: () => {
      toast.success("Risk signal status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-active-risk-signals"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update risk signal.");
    },
  });

  const toggleFlagMutation = useMutation({
    mutationFn: (variables: { flagKey: string; enabled: boolean }) =>
      toggleFeatureFlag(variables.flagKey, variables.enabled),
    onSuccess: () => {
      toast.success("Feature flag updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update feature flag.");
    },
  });

  if (isMetricsLoading || isSignalsLoading || isFlagsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="text-xs font-semibold text-muted-foreground">
              Loading HomeHunt Intelligence Layer...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const funnel = metrics?.conversionFunnel || {
    searchToViewRate: 0,
    viewToViewingRate: 0,
    viewingToAppRate: 0,
    appToLeaseRate: 0,
    leaseToTenancyRate: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Marketplace Intelligence Console
              </h1>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
                <Sparkles className="h-3 w-3" /> Phase 11 Layer
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time telemetry, lifecycle conversion funnels, AI subsystem cost tracking, and
              anomaly risk queues.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-xs font-semibold px-3 py-2 rounded-xl border hover:bg-secondary/80"
            >
              Back to User Admin
            </Link>
            <button
              onClick={() => {
                queryClient.invalidateQueries();
                toast.success("Intelligence telemetry refreshed.");
              }}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-xl hover:bg-primary/95 cursor-pointer shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
            </button>
          </div>
        </div>

        {/* 1. MARKETPLACE OVERVIEW KPIS */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="p-5 bg-card border rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Supply</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-black text-foreground">
              {metrics?.activeListings.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-verified">{metrics?.trust.verificationRate}%</span>{" "}
              Verified Listings
            </p>
          </div>

          <div className="p-5 bg-card border rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Demand</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-black text-foreground">
              {metrics?.activeTenants.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics?.searchesCount.toLocaleString()} Search Sessions
            </p>
          </div>

          <div className="p-5 bg-card border rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Viewing Requests
              </span>
              <Search className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-black text-foreground">
              {metrics?.viewingRequestsCount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics?.applicationsCount.toLocaleString()} Submitted Applications
            </p>
          </div>

          <div className="p-5 bg-card border rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Payment Success
              </span>
              <DollarSign className="h-4 w-4 text-verified" />
            </div>
            <p className="text-3xl font-black text-verified">
              {metrics?.operations.paymentSuccessRate}%
            </p>
            <p className="text-xs text-muted-foreground">Authoritative financial transactions</p>
          </div>
        </div>

        {/* 2. LIFECYCLE CONVERSION FUNNEL & AI OPERATIONS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Housing Journey Funnel */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
              <TrendingUp className="h-5 w-5 text-primary" /> Housing Journey Conversion Funnel
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Search → Listing View</span>
                  <span className="font-bold text-foreground">{funnel.searchToViewRate}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, funnel.searchToViewRate)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Listing View → Viewing Request</span>
                  <span className="font-bold text-foreground">{funnel.viewToViewingRate}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, funnel.viewToViewingRate)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Viewing Request → Application</span>
                  <span className="font-bold text-foreground">{funnel.viewingToAppRate}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, funnel.viewingToAppRate)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Application → Signed Lease</span>
                  <span className="font-bold text-foreground">{funnel.appToLeaseRate}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, funnel.appToLeaseRate)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Subsystem Operations */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
              <Bot className="h-5 w-5 text-primary" /> AI Subsystem Cost & Token Operations
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Total AI Invocations
                </span>
                <p className="text-xl font-black text-foreground mt-1">
                  {metrics?.operations.aiUsageCount || 0}
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Deterministic Fallback Rate
                </span>
                <p className="text-xl font-black text-verified mt-1">100% Operational</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">Active Prompt Versions:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-secondary px-2.5 py-1 rounded-lg font-mono text-[10px] border">
                  property_summary_v1
                </span>
                <span className="bg-secondary px-2.5 py-1 rounded-lg font-mono text-[10px] border">
                  tenant_assistant_v1
                </span>
                <span className="bg-secondary px-2.5 py-1 rounded-lg font-mono text-[10px] border">
                  risk_analysis_v1
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RISK SIGNALS & ANOMALY QUEUE */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-5 w-5 text-destructive" /> Active Anomaly & Risk Signals Queue
          </h3>

          {riskSignals && riskSignals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-xs font-bold text-muted-foreground uppercase">
                    <th className="p-3">Signal Type</th>
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Detected Reason</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {riskSignals.map((sig) => (
                    <tr key={sig.id} className="hover:bg-secondary/10">
                      <td className="p-3 font-bold text-foreground">{sig.signalType}</td>
                      <td className="p-3 text-muted-foreground">
                        {sig.entityType} ({sig.entityId})
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sig.confidence === "HIGH"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"
                          }`}
                        >
                          {sig.confidence}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs text-muted-foreground">{sig.reason}</td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() =>
                            resolveSignalMutation.mutate({ signalId: sig.id, status: "RESOLVED" })
                          }
                          className="px-2.5 py-1 bg-verified/10 text-verified border border-verified/20 rounded-md font-bold text-[10px] hover:bg-verified/20"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() =>
                            resolveSignalMutation.mutate({ signalId: sig.id, status: "DISMISSED" })
                          }
                          className="px-2.5 py-1 bg-secondary text-muted-foreground border rounded-md font-bold text-[10px] hover:bg-secondary/80"
                        >
                          Dismiss
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No open risk signals or anomalies detected across the platform.
            </p>
          )}
        </div>

        {/* 3.5 MARKET RENT INTELLIGENCE & CANDIDATE DUPLICATES */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Rent Intelligence Summary */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
              <TrendingUp className="h-5 w-5 text-primary" /> Market Rent Intelligence ({rentInsight?.county || "Nairobi"})
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-secondary/30 rounded-xl border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Median Rent</span>
                <p className="text-xl font-black text-foreground mt-1">KSh {rentInsight?.medianRent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-xl border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Average Rent</span>
                <p className="text-xl font-black text-foreground mt-1">KSh {rentInsight?.averageRent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-xl border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Price Range</span>
                <p className="text-sm font-bold text-foreground mt-1">
                  KSh {rentInsight?.minRent.toLocaleString()} – {rentInsight?.maxRent.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-xl border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Spatial Clusters</span>
                <p className="text-sm font-bold text-foreground mt-1">{spatialDemand?.length || 0} Active Zones</p>
              </div>
            </div>
          </div>

          {/* Duplicate Listing Candidates */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" /> Candidate Duplicate Listings ({duplicates?.length || 0})
            </h3>
            {duplicates && duplicates.length > 0 ? (
              <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                {duplicates.map((dup) => (
                  <div key={dup.id} className="p-3 bg-secondary/20 rounded-xl border flex justify-between items-center">
                    <div>
                      <span className="font-bold text-foreground block">{dup.listing1Title} vs {dup.listing2Title}</span>
                      <span className="text-[10px] text-muted-foreground">{dup.reason} ({dup.similarityScore}% score)</span>
                    </div>
                    <span className="bg-yellow-500/10 text-yellow-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      Candidate
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No duplicate listing candidate pairs flagged for moderation review.
              </p>
            )}
          </div>
        </div>

        {/* 4. CENTRALIZED FEATURE FLAGS */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
            <Cpu className="h-5 w-5 text-primary" /> Centralized Intelligence Feature Flags
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featureFlags &&
              featureFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-4 bg-secondary/20 border rounded-xl space-y-2 flex justify-between items-start"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-foreground block">
                      {flag.flagKey}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{flag.description}</p>
                  </div>
                  <button
                    onClick={() =>
                      toggleFlagMutation.mutate({ flagKey: flag.flagKey, enabled: !flag.enabled })
                    }
                    className="cursor-pointer text-primary hover:opacity-80"
                  >
                    {flag.enabled ? (
                      <ToggleRight className="h-6 w-6 text-primary" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
