/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth, useAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { providerListTenancies } from "@/features/tenancies/tenancies.functions";
import { FolderKanban, MapPin, ChevronRight, Loader2, Filter, User, Building } from "lucide-react";

export const Route = createFileRoute("/dashboard/tenancies")({
  component: () => (
    <RequireAuth>
      <ProviderTenanciesComponent />
    </RequireAuth>
  ),
});

function ProviderTenanciesComponent() {
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchTenancies();
  }, [statusFilter]);

  const fetchTenancies = async () => {
    try {
      setLoading(true);
      const data = await providerListTenancies({
        status: statusFilter || undefined,
      });
      setTenancies(data || []);
    } catch (err) {
      console.error("Failed to load provider tenancies", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="badge badge-secondary">Pending</span>;
      case "LEASE_PREPARATION":
        return (
          <span className="badge bg-blue-500/10 text-blue-500 border-blue-500/20">Lease Prep</span>
        );
      case "AWAITING_ACCEPTANCE":
        return (
          <span className="badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
            Sent to Tenant
          </span>
        );
      case "ACTIVE":
        return (
          <span className="badge bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
            Active
          </span>
        );
      case "MOVE_IN_PENDING":
        return (
          <span className="badge bg-indigo-500/10 text-indigo-500 border-indigo-500/20 animate-pulse">
            Move-in Pending
          </span>
        );
      case "OCCUPIED":
        return <span className="badge badge-success font-bold">Occupied</span>;
      case "NOTICE_GIVEN":
        return (
          <span className="badge bg-orange-500/10 text-orange-500 border-orange-500/20">
            Notice Given
          </span>
        );
      case "ENDED":
        return <span className="badge bg-neutral-500/10 text-neutral-500">Ended</span>;
      case "TERMINATED":
        return <span className="badge badge-danger">Terminated</span>;
      case "CANCELLED":
        return <span className="badge bg-neutral-500/10 text-neutral-500">Cancelled</span>;
      default:
        return <span className="badge bg-neutral-500/10 text-neutral-500">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tenancy Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Manage your active tenants, draft lease terms, execute agreements, and schedule
            inspections.
          </p>
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
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="LEASE_PREPARATION">Lease Prep</option>
              <option value="AWAITING_ACCEPTANCE">Awaiting Acceptance</option>
              <option value="ACTIVE">Active</option>
              <option value="MOVE_IN_PENDING">Move-in Pending</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="NOTICE_GIVEN">Notice Given</option>
              <option value="ENDED">Ended</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : tenancies.length === 0 ? (
          <div className="surface-card p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">No tenancies found</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              When you approve rental applications and initialize active tenancy lifecycles, they
              will be listed here.
            </p>
          </div>
        ) : (
          <div className="surface-card overflow-hidden border border-border/80 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Reference</th>
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Property / Unit</th>
                    <th className="p-4">Rent</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {tenancies.map((ten) => (
                    <tr key={ten.id} className="hover:bg-secondary/15 transition-all">
                      <td className="p-4 font-bold text-foreground truncate max-w-[120px]">
                        {ten.tenancy_reference}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 uppercase text-[10px]">
                            {ten.tenant?.full_name?.[0] || "T"}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">
                              {ten.tenant?.full_name || "Rental Tenant"}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {ten.tenant?.phone_number || "No Phone"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-semibold text-foreground block truncate max-w-[200px]">
                            {ten.properties?.name || "Property Home"}
                          </span>
                          {ten.unit?.unit_number && (
                            <span className="text-[10px] text-primary font-bold block">
                              Unit: {ten.unit.unit_number}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 shrink-0 text-primary" />{" "}
                            {ten.properties?.town}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {ten.currency_snapshot} {ten.rent_snapshot.toLocaleString()}
                      </td>
                      <td className="p-4">{getStatusBadge(ten.status)}</td>
                      <td className="p-4 text-muted-foreground">
                        {ten.start_date
                          ? `${new Date(ten.start_date).toLocaleDateString()} - ${ten.end_date ? new Date(ten.end_date).toLocaleDateString() : "Ongoing"}`
                          : "Not Started"}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to="/dashboard/tenancies/$id"
                          params={{ id: ten.id }}
                          className="btn btn-secondary text-[10px] py-1.5 px-3 inline-flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
                        >
                          Workspace <ChevronRight className="h-3.5 w-3.5" />
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
