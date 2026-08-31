/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/features/identity/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { listTenantTenancies } from "@/features/tenancies/tenancies.functions";
import {
  FolderKanban,
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/tenancies")({
  component: () => (
    <RequireAuth>
      <TenanciesListComponent />
    </RequireAuth>
  ),
});

function TenanciesListComponent() {
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchTenancies();
  }, []);

  const fetchTenancies = async () => {
    try {
      setLoading(true);
      const data = await listTenantTenancies();
      setTenancies(data || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load tenancies.");
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
          <span className="badge bg-blue-500/10 text-blue-500 border-blue-500/20">
            Lease Preparing
          </span>
        );
      case "AWAITING_ACCEPTANCE":
        return (
          <span className="badge bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
            Sign Required
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Tenancies</h1>
          <p className="text-sm text-muted-foreground">
            Manage your rental agreements, sign lease contracts, and review move-in inspection
            checkers.
          </p>
        </div>

        {errorMsg && (
          <div className="flex gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {tenancies.length === 0 ? (
          <div className="surface-card p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">No tenancies yet</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Once your property application is approved and the landlord initializes your tenancy
              agreement, it will appear here.
            </p>
            <div className="mt-6">
              <Link
                to="/applications"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95"
              >
                Track My Applications
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tenancies.map((ten) => (
              <div
                key={ten.id}
                className="surface-card p-5 border border-border/80 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-border transition-all"
              >
                <div className="space-y-4">
                  {/* Reference & Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {ten.tenancy_reference || "Pending Ref"}
                    </span>
                    {getStatusBadge(ten.status)}
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h4 className="font-display font-semibold text-base text-foreground leading-snug">
                      {ten.listings?.title || "Rental Home"}
                    </h4>
                    {ten.unit?.unit_number && (
                      <span className="text-xs font-bold text-primary block mt-0.5">
                        Unit: {ten.unit.unit_number}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">
                        {ten.properties?.name}, {ten.properties?.town}
                      </span>
                    </div>
                  </div>

                  {/* Agreed pricing snapshot */}
                  <div className="flex gap-4 items-center bg-secondary/35 p-3 rounded-xl border border-border/30 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                        Agreed Rent
                      </span>
                      <span className="font-bold text-foreground">
                        {ten.currency_snapshot} {ten.rent_snapshot.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-l border-border/50 h-6" />
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">
                        Agreed Deposit
                      </span>
                      <span className="font-bold text-foreground">
                        {ten.currency_snapshot} {ten.deposit_snapshot.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  {ten.start_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        Term: {new Date(ten.start_date).toLocaleDateString()} -{" "}
                        {ten.end_date ? new Date(ten.end_date).toLocaleDateString() : "Ongoing"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer action button */}
                <div className="border-t border-border/60 mt-5 pt-4 flex items-center justify-between text-xs">
                  {ten.status === "AWAITING_ACCEPTANCE" ? (
                    <Link
                      to="/tenancies/$id"
                      params={{ id: ten.id }}
                      className="inline-flex items-center gap-1.5 text-yellow-600 font-bold hover:underline"
                    >
                      <span>Review & Sign Lease</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/tenancies/$id"
                      params={{ id: ten.id }}
                      className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Manage Tenancy <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
