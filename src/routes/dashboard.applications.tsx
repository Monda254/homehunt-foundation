/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Info,
  ChevronRight,
  Calendar,
  Building,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  Filter,
  User,
} from "lucide-react";
import { providerListApplications } from "@/features/applications/applications.functions";

export const Route = createFileRoute("/dashboard/applications")({
  component: () => (
    <RequireAuth>
      <ProviderApplicationsComponent />
    </RequireAuth>
  ),
});

function ProviderApplicationsComponent() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await providerListApplications({
        status: statusFilter || undefined,
      });
      // Filter out DRAFT applications as drafts should not be visible to landlords
      const submittedOnly = (data || []).filter((app: any) => app.status !== "DRAFT");
      setApplications(submittedOnly);
    } catch (err) {
      console.error("Failed to load provider applications", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="badge badge-primary">Submitted</span>;
      case "UNDER_REVIEW":
        return (
          <span className="badge bg-blue-500/10 text-blue-500 border-blue-500/20">
            Under Review
          </span>
        );
      case "ADDITIONAL_INFORMATION_REQUIRED":
        return (
          <span className="badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Awaiting Info
          </span>
        );
      case "RESUBMITTED":
        return (
          <span className="badge bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
            Resubmitted
          </span>
        );
      case "SHORTLISTED":
        return (
          <span className="badge bg-purple-500/10 text-purple-500 border-purple-500/20">
            Shortlisted
          </span>
        );
      case "APPROVED":
        return <span className="badge badge-success">Approved</span>;
      case "REJECTED":
        return <span className="badge badge-danger">Rejected</span>;
      case "WITHDRAWN":
        return <span className="badge bg-neutral-500/10 text-neutral-500">Withdrawn</span>;
      default:
        return <span className="badge bg-neutral-500/10 text-neutral-500">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Applicant Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Review submitted profiles, request missing evidence, and decide on tenancies.
            </p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="surface-card p-4 border border-border/80 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" /> Filter by
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input text-xs h-9 py-1"
            >
              <option value="">All Statuses (excluding Drafts)</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ADDITIONAL_INFORMATION_REQUIRED">Awaiting Info</option>
              <option value="RESUBMITTED">Resubmitted</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="surface-card p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              No applications received
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              When seekers apply for your listings, they will appear here. Confirm that your
              listings are active and verified.
            </p>
          </div>
        ) : (
          <div className="surface-card overflow-hidden border border-border/80 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">App Ref</th>
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Listing / Property</th>
                    <th className="p-4">Rent</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-secondary/15 transition-all">
                      <td className="p-4 font-bold text-foreground truncate max-w-[120px]">
                        {app.application_number}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 uppercase text-[10px]">
                            {app.applicant?.full_name?.[0] || "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">
                              {app.applicant?.full_name || "Applicant Profile"}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {app.applicant?.phone_number || "No Phone"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-semibold text-foreground block truncate max-w-[200px]">
                            {app.listings?.title || "Listing Unit"}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 shrink-0 text-primary" />{" "}
                            {app.properties?.name}, {app.properties?.town}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {app.currency_snapshot} {app.rent_snapshot.toLocaleString()}
                      </td>
                      <td className="p-4">{getStatusBadge(app.status)}</td>
                      <td className="p-4 text-muted-foreground">
                        {app.submitted_at
                          ? new Date(app.submitted_at).toLocaleDateString()
                          : "Draft"}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to="/dashboard/applications/$id"
                          params={{ id: app.id }}
                          className="btn btn-secondary text-[10px] py-1.5 px-3 inline-flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
                        >
                          Review <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
